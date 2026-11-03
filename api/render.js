/* 知否知否 · 给搜索引擎 / AI 爬虫看的预渲染页面（Vercel 云函数）
   只有 vercel.json 识别出爬虫 UA 时才会走到这里；普通访客照常拿到原来的静态页面。
   做法：读原页面 HTML 里列出的 data/*.js，放进 Node 的 vm 沙箱里运行（这些文件只是给 window 挂全局变量），
   再按网址里的 ?id= / ?d= 找到对应条目，输出带正文、标题、描述、canonical、结构化数据的完整 HTML。 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SITE = 'https://culture.ischoolthai.cn';
const ROOT = path.join(__dirname, '..');
const SKIP_DATA = new Set(['data/images.js', 'data/site-stats.js', 'data/cards.js']);
const SKIP_KEYS = new Set(['img', 'imgs', 'image', 'images', 'src', 'href', 'link', 'licUrl', 'lic', 'by', 'key', 'theme', 'status', 'red', 'open', 'ready']);
const cache = {};

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function clip(s, n) { s = String(s).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

function sandbox(files) {
  const sb = { console: { log() {}, warn() {}, error() {} } };
  sb.window = sb; sb.self = sb; sb.globalThis = sb;
  sb.document = { createElement() { return {}; }, head: { appendChild() {} }, addEventListener() {}, querySelector() { return null; } };
  sb.location = { search: '', href: SITE + '/' };
  vm.createContext(sb);
  for (const f of files) {
    try { vm.runInContext(read(f), sb, { filename: f, timeout: 2000 }); } catch (e) { /* 单个文件出错不影响其它 */ }
  }
  return sb;
}

/* 读原页面：标题、描述、引用的数据文件 */
function pageInfo(page) {
  if (cache['p:' + page]) return cache['p:' + page];
  let html;
  try { html = read(page); } catch (e) { return null; }
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '知否知否';
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const noindex = /<meta name="robots" content="[^"]*noindex/i.test(html);
  const data = [...html.matchAll(/src="\/?(data\/[^"]+\.js)"/g)].map(m => m[1]).filter(f => !SKIP_DATA.has(f));
  const info = { title, desc, noindex, data };
  cache['p:' + page] = info;
  return info;
}
function globalsOf(files) {
  const k = files.join(',');
  if (!cache['g:' + k]) {
    const sb = sandbox(files);
    const out = {};
    for (const key of Object.keys(sb)) if (/^(ZHIFOU_|ZF_)/.test(key)) out[key] = sb[key];
    cache['g:' + k] = out;
  }
  return cache['g:' + k];
}

/* ---------- 在数据里找条目 ---------- */
const NAME_KEYS = ['name', 'title', 'id', 'label', 't', 'term', 'stem'];
function nameOf(o) { for (const k of NAME_KEYS) if (typeof o[k] === 'string' && o[k]) return o[k]; return ''; }
function textSize(o) { let n = 0; walkStrings(o, s => { n += s.length; }); return n; }
function walkStrings(o, fn, depth) {
  depth = depth || 0; if (depth > 12 || o == null) return;
  if (typeof o === 'string') { fn(o); return; }
  if (Array.isArray(o)) { o.forEach(x => walkStrings(x, fn, depth + 1)); return; }
  if (typeof o === 'object') for (const k of Object.keys(o)) if (!SKIP_KEYS.has(k)) walkStrings(o[k], fn, depth + 1);
}
function findAll(root, pred, trail, out, depth) {
  out = out || []; trail = trail || []; depth = depth || 0;
  if (!root || typeof root !== 'object' || depth > 10) return out;
  if (!Array.isArray(root) && pred(root)) out.push({ obj: root, trail });
  const kids = Array.isArray(root) ? root : Object.values(root);
  const nextTrail = (!Array.isArray(root) && nameOf(root)) ? trail.concat([root]) : trail;
  for (const c of kids) if (c && typeof c === 'object') findAll(c, pred, nextTrail, out, depth + 1);
  return out;
}
function matches(o, s) { return NAME_KEYS.some(k => o[k] === s) || (Array.isArray(o.alias) && o.alias.includes(s)); }
function best(list) { return list.sort((a, b) => textSize(b.obj) - textSize(a.obj))[0] || null; }

function findEntry(globals, id) {
  const parts = id.split('｜');
  if (parts.length > 1) {
    for (const g of Object.values(globals)) {
      const hits = findAll(g, o => matches(o, parts[parts.length - 1]));
      const ok = hits.filter(h => h.trail.some(t => matches(t, parts[0])));
      if (ok.length) { const b = best(ok); b.parent = b.trail.slice().reverse().find(t => matches(t, parts[0])); return b; }
    }
    return null;
  }
  for (const g of Object.values(globals)) {
    const b = best(findAll(g, o => matches(o, id)));
    if (b) return b;
  }
  /* 有些数据是 { entries: { 立春: {...} } } 这种以名字为键的写法 */
  for (const g of Object.values(globals)) {
    const hits = findAll(g, o => o[id] && typeof o[id] === 'object' && !Array.isArray(o[id]));
    if (hits.length) return { obj: hits[0].obj[id], trail: [] };
  }
  /* 词表：[["微雨、细雨","释义"], ...]，?id= 是其中一个词（字语·万物页） */
  for (const g of Object.values(globals)) {
    const hits = findAll(g, o => Array.isArray(o.f) && o.f.some(p => Array.isArray(p) && typeof p[0] === 'string' && p[0].split('、').includes(id)));
    if (hits.length) {
      const h = hits[0], pair = h.obj.f.find(p => p[0].split('、').includes(id));
      const group = h.trail.slice().reverse().find(t => t.title || t.name);
      return { obj: { 释义: pair[1], 同义写法: pair[0], 所属: [nameOf(h.obj), group && group !== h.obj ? nameOf(group) : ''].filter(Boolean).join(' · '), 同组词语: h.obj.f.map(p => p[0] + '：' + p[1]) }, trail: h.trail, parent: group };
    }
  }
  return null;
}

/* ---------- 把一个条目变成正文 HTML ---------- */
const LABELS = { life: '小传', original: '原文', note: '讲解', body: '介绍', line: '概要', summary: '内容概要', why: '为什么重要', versions: '版本', dispute: '作者与争议', selections: '名篇选读', quotes: '名句', links: '关联', myths: '常见误解', reading: '延伸阅读', sources: '资料来源', doubts: '存疑', custom: '习俗', scene: '场景', roles: '职能', alias: '别称', answer: '答案', intro: '导读', tip: '小贴士', notes: '出处说明', events: '大事年表', people: '人物', overview: '概览', info: '基本信息', secs: '详细介绍', keyEmperors: '主要帝王' };
function bodyHtml(o, depth) {
  depth = depth || 0;
  if (o == null || depth > 8) return '';
  if (typeof o === 'string') return o.trim() ? '<p>' + esc(o) + '</p>' : '';
  if (typeof o === 'number' || typeof o === 'boolean') return '';
  if (Array.isArray(o)) {
    if (o.length && o.every(x => typeof x === 'string')) return o.map(x => '<p>' + esc(x) + '</p>').join('');
    if (o.length && o.every(x => Array.isArray(x) && x.length === 2 && x.every(y => typeof y === 'string')))
      return '<dl>' + o.map(x => '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>').join('') + '</dl>';
    return o.map(x => bodyHtml(x, depth + 1)).join('');
  }
  if (o.k !== undefined && typeof o.v === 'string') return '<p><b>' + esc(o.k) + '：</b>' + esc(o.v) + '</p>';
  let h = '';
  const nm = nameOf(o);
  if (nm && depth > 0) h += '<h' + Math.min(depth + 2, 6) + '>' + esc(nm) + '</h' + Math.min(depth + 2, 6) + '>';
  if (typeof o.h === 'string') h += '<h3>' + esc(o.h) + '</h3>';
  for (const k of Object.keys(o)) {
    if (SKIP_KEYS.has(k) || NAME_KEYS.includes(k) || k === 'h' || k === 'grp' || k === 'cat') continue;
    const inner = bodyHtml(o[k], depth + 1);
    if (!inner) continue;
    h += (LABELS[k] && depth < 2 ? '<h' + Math.min(depth + 2, 6) + '>' + LABELS[k] + '</h' + Math.min(depth + 2, 6) + '>' : '') + inner;
  }
  return h;
}
function firstText(o, min) {
  let r = '';
  walkStrings(o, s => { if (!r && s.length >= (min || 20)) r = s; });
  if (!r) { const a = []; walkStrings(o, s => { if (s.length >= 2 && a.join('；').length < 150) a.push(s); }); r = a.join('；'); }
  return r;
}

/* ---------- 特殊页面：按需加载的大数据 ---------- */
function special(page, q) {
  const id = q.get('id'), d = q.get('d');
  if (page === 'dianji-book.html' && id && /^[a-z0-9_-]+$/i.test(id)) {
    const g = globalsOf(['data/dj/' + id + '.js']); const e = g.ZF_DJ && g.ZF_DJ[id]; if (!e) return null;
    const idx = globalsOf(['data/dianji-index.js']).ZF_DJ_INDEX; let name = id;
    findAll(idx, o => o.id === id || o.key === id).forEach(h => { name = h.obj.name || h.obj.title || name; });
    return { name: /《/.test(name) ? name : '《' + name + '》', crumbs: [['典籍', '/dianji.html']], obj: e, type: 'Book' };
  }
  if (page === 'lingmu-detail.html' && id && /^[a-z0-9_-]+$/i.test(id)) {
    const g = globalsOf(['data/lm/' + id + '.js']); const e = g.ZF_LM && g.ZF_LM[id]; if (!e) return null;
    return { name: e.title || id, crumbs: [['陵墓', '/lingmu.html']], obj: e, type: 'Article' };
  }
  if (page === 'lishi-chaodai.html' && d && /^[a-z]+$/.test(d)) {
    const g = globalsOf(['data/lishi-' + d + '.js']); const D = g.ZHIFOU_LISHI && g.ZHIFOU_LISHI[d]; if (!D) return null;
    const crumbs = [['历史', '/lishi.html']];
    if (!id) return { name: D.name + '历史', crumbs, obj: { overview: D.overview, emperors: (D.emperors || []).map(e => e.name + '（' + [e.real, e.reign, e.line].filter(Boolean).join('，') + '）'), events: (D.events || []).map(e => e.y + '：' + e.t) }, type: 'Article' };
    const card = (D.keyEmperors || []).concat(D.people || []).find(c => c.name === id);
    if (!card) return null;
    crumbs.push([D.name, '/lishi-chaodai.html?d=' + d]);
    return { name: id, crumbs, obj: card, type: 'Article', ctx: D.name };
  }
  return undefined; /* 不是特殊页 */
}

function render(pathname, search) {
  let page = pathname.replace(/^\/+/, '') || 'index.html';
  if (!/^[a-z0-9-]+\.html$/i.test(page)) return null;
  const info = pageInfo(page);
  if (!info) return null;
  const q = new URLSearchParams(search || '');
  const id = q.get('id');
  const siteName = '知否知否';
  const section = info.title.replace(/\s*·\s*知否知否\s*$/, '');
  const canonical = SITE + (page === 'index.html' ? '/' : '/' + page) + (search && (id || q.get('d')) ? '?' + [...q].filter(([k]) => k === 'id' || k === 'd').map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&') : '');
  let hit = special(page, q);
  if (hit === undefined) {
    if (id) {
      const g = globalsOf(info.data);
      const f = findEntry(g, id);
      hit = f ? { name: id.replace('｜', '·'), obj: f.obj, parent: f.parent, crumbs: [[section, '/' + page]], type: 'CreativeWork' } : null;
    } else hit = false;
  }
  if (hit === null) return { status: 404, html: null };

  let title, desc, body, crumbs = [[siteName, SITE + '/']];
  if (hit) {
    const ctx = hit.ctx || (hit.parent && nameOf(hit.parent)) || '';
    title = hit.name + (ctx && !hit.name.includes(ctx) ? '（' + ctx + '）' : '') + ' · ' + section + ' · ' + siteName;
    desc = clip(hit.name + '：' + ((Array.isArray(hit.obj.f) && (hit.obj.f.find(x => x && x.k === '简介') || {}).v) || hit.obj.note || hit.obj.line || hit.obj.body || firstText(hit.obj, 30) || info.desc), 150);
    body = '<h1>' + esc(hit.name) + '</h1>' + (hit.parent ? '<p>' + esc(nameOf(hit.parent)) + (hit.parent.life ? '：' + esc(hit.parent.life) : '') + '</p>' : '') + bodyHtml(hit.obj);
    hit.crumbs.forEach(c => crumbs.push([c[0], SITE + c[1]]));
    crumbs.push([hit.name, canonical]);
  } else {
    /* 栏目页：导读 + 条目目录（带链接，方便爬虫顺着找到每个条目） */
    const g = globalsOf(info.data);
    title = info.title; desc = info.desc;
    const main = Object.values(g).find(v => v && (v.hook || v.intro || v.answer)) || {};
    body = '<h1>' + esc(section) + '</h1>' + ['hook', 'answer', 'intro', 'tip'].map(k => main[k] ? '<p>' + esc(main[k]) + '</p>' : '').join('');
    const names = []; findAll(main, o => o !== main && !!nameOf(o)).forEach(h => { const n = nameOf(h.obj); if (n && n.length < 30 && !names.includes(n)) names.push(n); });
    if (names.length) body += '<h2>目录</h2><ul>' + names.slice(0, 400).map(n => '<li><a href="/' + page + '?id=' + encodeURIComponent(n) + '">' + esc(n) + '</a></li>').join('') + '</ul>';
    if (page !== 'index.html') crumbs.push([section, canonical]);
  }
  const ld = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c[0], item: c[1] })) },
    { '@context': 'https://schema.org', '@type': hit ? hit.type : 'WebPage', headline: clip(title, 110), name: hit ? hit.name : section, description: desc, url: canonical, inLanguage: 'zh-CN', isPartOf: { '@type': 'WebSite', name: siteName, url: SITE + '/' }, publisher: { '@type': 'Organization', name: siteName } }
  ];
  const html = '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(title) + '</title><meta name="description" content="' + esc(desc) + '">' +
    (info.noindex ? '<meta name="robots" content="noindex,nofollow">' : '') +
    '<link rel="canonical" href="' + esc(canonical) + '">' +
    '<meta property="og:type" content="article"><meta property="og:site_name" content="' + siteName + '">' +
    '<meta property="og:title" content="' + esc(title) + '"><meta property="og:description" content="' + esc(desc) + '">' +
    '<meta property="og:url" content="' + esc(canonical) + '"><meta property="og:locale" content="zh_CN">' +
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml">' +
    ld.map(x => '<script type="application/ld+json">' + JSON.stringify(x).replace(/</g, '\\u003c') + '</script>').join('') +
    '</head><body><nav>' + crumbs.map(c => '<a href="' + esc(c[1]) + '">' + esc(c[0]) + '</a>').join(' › ') + '</nav><main>' + body +
    '</main><footer><p>知否知否 · 中国传统文化百科 · <a href="/">首页</a> · <a href="/dianji.html">典籍</a> · <a href="/lishi.html">历史</a> · <a href="/wen.html">文学</a></p></footer></body></html>';
  return { status: 200, html };
}

module.exports = async function handler(req, res) {
  const u = new URL(req.url, SITE);
  /* vercel.json 把原路径放在 ?path= 里，其余查询参数原样保留 */
  const p = u.searchParams.get('path') || '/';
  u.searchParams.delete('path');
  let out;
  try { out = render(p, u.searchParams.toString()); } catch (e) { out = null; }
  if (!out) { res.statusCode = 404; res.setHeader('Content-Type', 'text/html; charset=utf-8'); try { res.end(read('404.html')); } catch (e) { res.end('Not found'); } return; }
  if (out.status === 404) { res.statusCode = 404; res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(read('404.html')); return; }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  res.setHeader('X-Robots-Tag', 'all');
  res.end(out.html);
};
module.exports.render = render;
