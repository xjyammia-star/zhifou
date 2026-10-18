/* 知否知否 · 历史 · 政变与起义页
   数据：data/zhengbian.js（由 工具脚本/生成政变数据.py 从 文案库/历史/政变与起义.md 自动生成）；
         data/lishi-names.js 是“人名 → 在哪个朝代、哪张卡片”的对照表，用来把文中提到的人物连到朝代页。
   页面分五个标签：事件（含位置示意图、类型筛选和 47 张事件小卡）、总表、概况、制度、待核。
   点一个事件，弹出一个居中的窗口显示介绍（样式和战役页、都城页的窗口相同）。
   排版工具：js/zycommon.js；地图和弹窗的样式沿用 css/ducheng.css、css/lishi.css、css/zhanyi.css */
(function () {
  'use strict';
  var D = window.ZHIFOU_ZHENGBIAN, Z = window.ZY;
  var I = window.ZHIFOU_LISHI_INDEX || { dynasties: [] };
  var NAMES = window.ZHIFOU_LISHI_NAMES || {};
  var root = document.getElementById('app');
  if (!root) return;
  if (!D || !Z) {
    root.textContent = '数据读取失败，请刷新再试。';
    return;
  }
  var el = Z.el;

  /* ---------- 人名连接：连到朝代页（那一页上线了的朝代才连） ---------- */
  var ready = {};
  I.dynasties.forEach(function (d) { if (d.ready) ready[d.key] = 1; });
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function pickName(nm) {
    var cand = NAMES[nm] || [];
    for (var i = 0; i < cand.length; i++) if (ready[cand[i][0]]) return cand[i];
    return null;
  }
  function personHref(pick) { return 'lishi-chaodai.html?d=' + encodeURIComponent(pick[0]) + '&id=' + encodeURIComponent(pick[1]); }
  var nameRe = null;
  (function () {
    var ks = Object.keys(NAMES).filter(function (k) { return k.length >= 2 && pickName(k); }).sort(function (a, b) { return b.length - a.length; });
    if (ks.length) nameRe = new RegExp(ks.map(esc).join('|'), 'g');
  })();

  function linkify(text, ctx) {
    if (!text) return [];
    if (!nameRe || !ctx) return [text];
    var out = [], last = 0, m;
    nameRe.lastIndex = 0;
    while ((m = nameRe.exec(text))) {
      var nm = m[0];
      if (ctx.used[nm]) continue;
      var pick = pickName(nm);
      if (!pick) continue;
      if (m.index > last) out.push(text.slice(last, m.index));
      out.push(el('a', { 'class': 'ss-ref', href: personHref(pick), title: '到朝代页看看' + nm + '的介绍', text: nm }));
      ctx.used[nm] = 1;
      last = m.index + nm.length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }
  function rich(t, ctx) {
    var out = [];
    String(t || '').split(/(〔[^〕]*待核[^〕]*〕)/).forEach(function (p) {
      if (!p) return;
      if (/^〔[^〕]*待核[^〕]*〕$/.test(p)) out.push(el('em', { 'class': 'ss-check', text: '待核' }));
      else linkify(p, ctx).forEach(function (n) { out.push(n); });
    });
    return out;
  }
  function newCtx() { return { used: {} }; }
  function gradeEl(g) {
    if (g === '待核') return el('em', { 'class': 'ss-check', text: '待核' });
    if (g === '部分待核') return el('em', { 'class': 'ss-check is-part', text: '部分待核' });
    return null;
  }
  function srcLine(s) {
    return s && s.length ? el('span', { 'class': 'ss-tl-s', text: '出处：' + s.join('　◆　') }) : null;
  }
  function cut(s, n) { s = s || ''; return s.length > n ? s.slice(0, n) + '…' : s; }

  var byName = {}, groupIdx = {};
  D.events.forEach(function (b) {
    byName[b.name] = b;
    b.F = {};
    b.f.forEach(function (x) { b.F[x.k] = x; });
    b.q = [b.name, b.short, b.timeShort, b.placeShort, b.peopleShort, b.result, b.tags.join(''), b.line, b.group].join(' ');
  });
  D.groups.forEach(function (g, i) { groupIdx[g.title] = i; });
  var COLORS = ['#e2c27d', '#e4705c'];
  var cityShow = D.cityShow || {};

  function tagNodes(tags) {
    return el('span', { 'class': 'zy2-tags' }, tags.map(function (t) {
      return el('span', { 'class': 'zy2-tag' + (t === '改朝换代' ? ' is-gc' : ''), text: t });
    }));
  }

  /* ---------- 弹窗 ---------- */
  var modal = null, lastFocus = null;

  function setQs(id) {
    try {
      var u = new URL(location.href);
      if (id) u.searchParams.set('id', id); else u.searchParams.delete('id');
      history.replaceState(null, '', u.toString());
    } catch (e) { /* 忽略 */ }
  }
  function closeModal() {
    if (!modal) return;
    modal.overlay.classList.remove('is-open');
    modal.overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('ss-noscroll');
    setQs(null);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* 忽略 */ } }
  }
  function buildModal() {
    var closeBtn = el('button', { 'class': 'ss-modal-close', type: 'button', 'aria-label': '关闭' }, [el('span', { 'aria-hidden': 'true', text: '×' })]);
    var tag = el('div', { 'class': 'ss-modal-tag' });
    var title = el('h3', { 'class': 'ss-modal-title' });
    var facts = el('div', { 'class': 'ss-modal-facts' });
    var body = el('div', { 'class': 'ss-modal-body' });
    var nav = el('div', { 'class': 'dc-modal-nav' });
    var card = el('div', { 'class': 'ss-modal-card', role: 'dialog', 'aria-modal': 'true', 'aria-label': '事件介绍' }, [closeBtn, tag, title, facts, body, nav]);
    var overlay = el('div', { 'class': 'ss-modal-overlay', 'aria-hidden': 'true' }, [card]);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal(); });
    return { overlay: overlay, card: card, tag: tag, title: title, facts: facts, body: body, nav: nav, closeBtn: closeBtn };
  }

  function fmtCoord(b) {
    if (b.lat === null || b.lat === undefined) return '';
    return '北纬 ' + b.lat.toFixed(1) + '°，东经 ' + b.lon.toFixed(1) + '°（区域示意）';
  }
  function textField(b, k) {
    var f = b.F[k];
    if (!f) return null;
    return el('div', {}, [el('span', {}, rich(f.v, newCtx())), srcLine(f.s)]);
  }
  function whoNode(b) {
    if (!b.who.length) return null;
    var ctx = newCtx();
    return el('div', {}, b.who.map(function (l) {
      return el('p', { 'class': 'zb-who' }, [l.side ? el('b', { text: l.side }) : null].concat(rich(l.t, ctx)).concat([srcLine(l.s)]));
    }));
  }
  function stepsNode(b) {
    if (!b.steps.length) return null;
    var ctx = newCtx();
    return el('ol', { 'class': 'zy2-steps' }, b.steps.map(function (s) {
      return el('li', {}, rich(s.t, ctx).concat([srcLine(s.s)]));
    }));
  }
  function citiesNode(b) {
    if (!b.cities.length) return null;
    var kids = [];
    b.cities.forEach(function (n, i) {
      if (i) kids.push('、');
      kids.push(el('a', { 'class': 'ss-ref', href: 'ducheng.html?id=' + encodeURIComponent(n), title: '到都城页看看' + (cityShow[n] || n), text: cityShow[n] || n }));
    });
    return el('span', { 'class': 'zy2-links' }, kids);
  }
  function battlesNode(b) {
    if (!b.battles.length) return null;
    var kids = [];
    b.battles.forEach(function (n, i) {
      if (i) kids.push('、');
      kids.push(el('a', { 'class': 'ss-ref', href: 'zhanyi.html?id=' + encodeURIComponent(n), title: '到战役页看看' + n, text: n }));
    });
    return el('span', { 'class': 'zy2-links' }, kids);
  }
  function peopleNode(b) {
    if (!b.people.length) return null;
    var kids = [];
    b.people.forEach(function (n, i) {
      if (i) kids.push('、');
      var pk = pickName(n);
      kids.push(pk ? el('a', { 'class': 'ss-ref', href: personHref(pk), title: '到朝代页看看' + n + '的介绍', text: n }) : n);
    });
    return el('span', { 'class': 'zy2-links' }, kids);
  }

  function fillModal(b) {
    modal.tag.textContent = '政变与起义 · ' + b.group;
    modal.title.textContent = b.name;
    modal.facts.textContent = '';
    [['时间', b.timeShort], ['地点', b.placeShort], ['坐标', fmtCoord(b)]].forEach(function (p) {
      if (p[1]) modal.facts.appendChild(el('span', { 'class': 'ss-fact' }, [el('b', { text: p[0] }), p[1]]));
    });
    modal.facts.appendChild(tagNodes(b.tags));
    var g = gradeEl(b.g);
    if (g) modal.facts.appendChild(g);
    var pairs = [
      ['一句话', b.line],
      ['时间', textField(b, '时间')],
      ['地点', textField(b, '地点')],
      ['主要人物', whoNode(b)],
      ['起因', textField(b, '起因')],
      ['经过', stepsNode(b)],
      ['规模与伤亡', textField(b, '规模与伤亡')],
      ['结果与影响', textField(b, '结果与影响')],
      ['史料说明', textField(b, '史料说明')],
      ['关联战役', battlesNode(b)],
      ['关联都城', citiesNode(b)],
      ['关联帝王和人物', peopleNode(b)],
      ['出处', b.src.length ? b.src.join('　◆　') : '']
    ];
    modal.body.textContent = '';
    var oldRow = modal.card.querySelector('.zf-tts-row');   /* 换了一个：去掉旧的“听介绍”按钮（朗读脚本会自动重新放一个） */
    if (oldRow && oldRow.parentNode) oldRow.parentNode.removeChild(oldRow);
    modal.body.appendChild(Z.kv(pairs, { quote: ['一句话'] }));
    var idx = D.events.indexOf(b);
    modal.nav.textContent = '';
    var prev = D.events[idx - 1], next = D.events[idx + 1];
    if (prev) {
      var b1 = el('button', { 'class': 'zy-btn', type: 'button', text: '← ' + cut(prev.short, 8) });
      b1.addEventListener('click', function () { openEvent(prev.name); });
      modal.nav.appendChild(b1);
    }
    if (next) {
      var b2 = el('button', { 'class': 'zy-btn', type: 'button', text: cut(next.short, 8) + ' →' });
      b2.addEventListener('click', function () { openEvent(next.name); });
      modal.nav.appendChild(b2);
    }
    /* 分享卡片按钮（由 js/sharecard.js 提供；没加载或出错都不影响本页） */
    try { if (window.ShareCard && window.ShareCard.hookEvent) window.ShareCard.hookEvent({ card: modal.card, kind: '政变与起义', group: b.group, b: b }); } catch (e) { /* 忽略 */ }
    modal.card.scrollTop = 0;
  }

  function openEvent(name) {
    var b = byName[name];
    if (!b) return;
    if (!modal) modal = buildModal();
    if (!modal.overlay.classList.contains('is-open')) lastFocus = document.activeElement;
    fillModal(b);
    modal.overlay.classList.add('is-open');
    modal.overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('ss-noscroll');
    setQs(name);
    if (modal.closeBtn && modal.closeBtn.focus) { try { modal.closeBtn.focus({ preventScroll: true }); } catch (e) { /* 忽略 */ } }
  }

  /* ---------- 位置示意图（与战役页、都城页同一套轮廓） ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs, text) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text) n.textContent = text;
    return n;
  }
  var LON0 = 69, LON1 = 136, LAT0 = 18, LAT1 = 54, SC = 17, KX = 0.82;
  var W = (LON1 - LON0) * SC * KX, H = (LAT1 - LAT0) * SC;
  function px(lon) { return (lon - LON0) * SC * KX; }
  function py(lat) { return (LAT1 - lat) * SC; }
  function path(pts, close) {
    return pts.map(function (p, i) { return (i ? 'L' : 'M') + px(p[0]).toFixed(1) + ' ' + py(p[1]).toFixed(1); }).join('') + (close ? 'Z' : '');
  }
  var CHINA = [[120.8,53.3],[123.5,53.5],[126.0,52.7],[127.5,49.8],[130.6,48.9],[134.7,48.3],[134.2,47.3],[133.0,45.5],[131.9,45.3],[131.1,44.9],[131.3,43.4],[130.6,42.4],[129.7,42.4],[128.0,41.4],[126.5,41.4],[124.3,39.9],[121.7,38.9],[122.2,40.4],[121.0,40.9],[119.5,39.6],[118.0,39.2],[117.8,38.9],[118.0,37.9],[119.0,37.2],[120.3,37.8],[122.5,37.4],[121.0,36.6],[120.2,36.0],[119.2,35.0],[119.6,34.4],[120.4,33.0],[121.0,32.0],[121.9,31.4],[121.9,30.0],[121.4,28.9],[120.6,27.5],[119.7,26.0],[119.0,25.2],[118.1,24.5],[116.8,23.4],[115.2,22.8],[113.8,22.4],[113.0,21.9],[111.5,21.4],[110.4,20.3],[109.6,21.6],[108.0,21.5],[106.7,22.0],[105.3,23.3],[104.0,22.8],[103.0,22.5],[102.2,22.4],[101.2,21.2],[100.1,21.7],[99.5,22.2],[98.9,23.2],[97.7,23.9],[97.9,24.8],[98.7,25.8],[98.6,27.5],[97.5,28.3],[96.0,29.4],[94.5,29.2],[92.5,27.8],[91.6,27.8],[90.4,28.1],[89.0,27.3],[88.0,27.9],[86.0,27.9],[84.2,28.8],[82.0,30.3],[81.0,30.2],[79.0,31.0],[78.7,32.5],[79.5,33.2],[78.0,35.5],[76.0,35.8],[75.0,37.0],[74.5,38.6],[73.8,39.5],[75.5,40.5],[76.7,41.0],[78.5,41.5],[80.2,42.1],[80.3,43.0],[80.0,44.8],[82.5,45.2],[83.0,47.2],[85.5,47.0],[87.3,49.1],[90.0,47.9],[91.0,46.8],[95.0,44.2],[96.4,42.7],[100.5,42.6],[105.0,41.6],[107.0,42.4],[110.4,42.7],[111.9,43.7],[111.4,44.3],[113.5,44.8],[116.0,45.7],[117.4,46.6],[119.7,46.7],[118.8,47.8],[116.7,49.8],[118.5,49.9],[120.5,52.6]];
  var HAINAN = [[108.7,19.2],[110.0,20.1],[111.0,19.6],[110.0,18.3],[108.7,18.6]];
  var TAIWAN = [[121.5,25.2],[122.0,25.0],[121.0,22.9],[120.1,23.0],[120.4,24.7]];
  var HUANGHE = [[96.0,34.5],[100.5,34.3],[103.8,36.1],[105.0,37.5],[106.8,38.5],[107.5,40.8],[109.5,40.6],[111.0,40.3],[111.5,38.5],[110.5,36.5],[110.3,35.0],[112.0,34.8],[114.5,34.9],[116.5,35.5],[117.5,37.0],[118.9,37.7]];
  var CHANGJIANG = [[91.0,33.5],[97.0,33.0],[99.0,30.0],[101.5,27.5],[104.6,28.8],[106.5,29.6],[108.5,30.8],[111.0,30.7],[112.2,30.3],[113.5,30.0],[114.3,30.6],[116.0,29.8],[117.5,30.5],[118.8,32.0],[120.5,31.9],[121.9,31.4]];

  /* 位置几乎重合的几个（如长安、洛阳、北京一带）围成一小圈，免得盖住 */
  function layout() {
    var buckets = {}, pos = {};
    D.events.forEach(function (b) {
      if (b.lat === null || b.lat === undefined) return;
      var k = (Math.round(b.lat * 3) / 3).toFixed(2) + ',' + (Math.round(b.lon * 3) / 3).toFixed(2);
      (buckets[k] = buckets[k] || []).push(b);
    });
    Object.keys(buckets).forEach(function (k) {
      var arr = buckets[k];
      arr.forEach(function (b, i) {
        var x = px(b.lon), y = py(b.lat);
        if (arr.length > 1) {
          var a = Math.PI * 2 * i / arr.length - Math.PI / 2;
          var r = arr.length > 4 ? 10 : 7;
          x += Math.cos(a) * r; y += Math.sin(a) * r;
        }
        pos[b.name] = { x: x, y: y };
      });
    });
    return pos;
  }

  function buildMap() {
    var pos = layout();
    var svg = sv('svg', { viewBox: '-6 -6 ' + (W + 12) + ' ' + (H + 12), 'class': 'dc-map-svg', role: 'group', 'aria-label': '47个政变与起义事件的大致位置示意图' });
    svg.appendChild(sv('path', { d: path(CHINA, true), 'class': 'dc-land' }));
    svg.appendChild(sv('path', { d: path(HAINAN, true), 'class': 'dc-land' }));
    svg.appendChild(sv('path', { d: path(TAIWAN, true), 'class': 'dc-land' }));
    svg.appendChild(sv('path', { d: path(HUANGHE, false), 'class': 'dc-river' }));
    svg.appendChild(sv('path', { d: path(CHANGJIANG, false), 'class': 'dc-river' }));
    svg.appendChild(sv('text', { x: px(104.5), y: py(36.4) - 4, 'class': 'dc-rname' }, '黄河'));
    svg.appendChild(sv('text', { x: px(103.5), y: py(30.4), 'class': 'dc-rname' }, '长江'));
    var dots = [];
    D.events.forEach(function (b) {
      var p = pos[b.name];
      if (!p) return;
      var col = COLORS[(groupIdx[b.group] || 0) % COLORS.length];
      var g = sv('g', { 'class': 'dc-dot', tabindex: '0', role: 'button', 'aria-label': '查看' + b.name + '的介绍' });
      g.appendChild(sv('title', {}, b.name + '（' + b.timeShort + '）'));
      g.appendChild(sv('circle', { cx: p.x, cy: p.y, r: 10, 'class': 'dc-hit' }));
      g.appendChild(sv('circle', { cx: p.x, cy: p.y, r: b.tags.indexOf('改朝换代') >= 0 ? 5.5 : 4, fill: col, 'class': 'dc-pt' }));
      g.addEventListener('click', function () { openEvent(b.name); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEvent(b.name); } });
      svg.appendChild(g);
      dots.push({ b: b, node: g });
    });
    var tip = el('p', { 'class': 'dc-maptip', 'aria-live': 'polite', text: '' });
    svg.addEventListener('mouseover', function (e) {
      var g = e.target && e.target.closest ? e.target.closest('.dc-dot') : null;
      if (!g) return;
      var t = g.querySelector('title');
      tip.textContent = t ? t.textContent : '';
    });
    var legend = el('p', { 'class': 'dc-legend' }, D.groups.map(function (g, i) {
      return el('span', {}, [el('i', { style: 'background:' + COLORS[i % COLORS.length], 'aria-hidden': 'true' }), g.title]);
    }));
    function setFilter(fn) {
      dots.forEach(function (d) {
        if (fn(d.b)) d.node.removeAttribute('display'); else d.node.setAttribute('display', 'none');
      });
    }
    var node = Z.section('位置示意', [
      Z.note('点圆点看那个事件的介绍，较大的圆点是带“改朝换代”标签的。轮廓是手工简化的示意；坐标只表示事件发生的大致区域，不是精确位置，涉及多地的事件只取其中一个点。'),
      el('div', { 'class': 'dc-map' }, [svg]), tip, legend
    ]);
    return { node: node, setFilter: setFilter };
  }

  /* ---------- 标签：事件 ---------- */
  function buildEvents() {
    var kids = [];
    var tag = '', query = '';
    var map = buildMap();
    var tiles = [];
    var box = el('input', { 'class': 'ss-search', type: 'search', placeholder: '按事件名、时间、地点或人物搜索，如 玄武门、黄巾、太后', 'aria-label': '搜索事件' });
    var count = el('p', { 'class': 'zy-note', 'aria-live': 'polite' });
    var labels = ['全部（' + D.events.length + '）'].concat(D.tags.map(function (t) { return t + '（' + D.tagCount[t] + '）'; }));
    var chip = Z.chips(labels, function (i) { tag = i ? D.tags[i - 1] : ''; apply(); }, { aria: '按类型筛选' });
    var secs = [];
    var groupNodes = D.groups.map(function (g) {
      var ts = g.events.map(function (n) {
        var b = byName[n];
        var gc = b.tags.indexOf('改朝换代') >= 0;
        var t = el('button', { 'class': 'ss-tile zy2-tile zb-tile', type: 'button', 'aria-label': '查看' + b.name + '的介绍' }, [
          el('span', { 'class': 'ss-tile-name zy2-tile-name', text: b.short }),
          gc ? el('span', { 'class': 'zy2-gc', text: '改朝换代' }) : null,
          el('span', { 'class': 'ss-tile-l1', text: b.timeShort }),
          el('span', { 'class': 'ss-tile-l2', text: cut(b.line, 46) })
        ]);
        t.addEventListener('click', function () { openEvent(b.name); });
        tiles.push({ b: b, node: t });
        return t;
      });
      var sec = Z.section(g.title + '（' + g.events.length + '）', [el('div', { 'class': 'ss-tiles' }, ts)]);
      secs.push({ node: sec, items: ts.map(function (n, i) { return tiles[tiles.length - ts.length + i]; }) });
      return sec;
    });
    function match(b) {
      return (!tag || b.tags.indexOf(tag) >= 0) && (!query || b.q.indexOf(query) >= 0);
    }
    function apply() {
      query = box.value.trim();
      var n = 0;
      secs.forEach(function (s) {
        var any = 0;
        s.items.forEach(function (it) {
          var hit = match(it.b);
          it.node.hidden = !hit;
          if (hit) { any++; n++; }
        });
        s.node.hidden = !any;
      });
      map.setFilter(match);
      count.textContent = (tag || query) ? '找到 ' + n + ' 个。' : '共 ' + D.events.length + ' 个，分 ' + D.groups.length + ' 组。点一张看起因、经过、结果，以及涉及的人物和都城。';
    }
    box.addEventListener('input', apply);
    kids.push(Z.note('按类型筛选；“改朝换代”指这个事件直接取代旧政权，或直接促成新政权建立（共 ' + D.tagCount['改朝换代'] + ' 个）。一个事件可以带 1 到 3 个类型。'));
    kids.push(chip.node, box, count, map.node);
    groupNodes.forEach(function (n) { kids.push(n); });
    chip.pick(0);
    apply();
    return kids;
  }

  /* ---------- 标签：总表 ---------- */
  function buildTable() {
    var head = ['事件', '时间', '地点', '主要人物', '结果', '一句话'];
    var rows = D.table.map(function (r) {
      var b = byName[r.name];
      var nameCell;
      if (b) {
        var a = el('a', { 'class': 'ss-jump', href: '#', text: r.name });
        a.addEventListener('click', function (ev) { ev.preventDefault(); openEvent(r.name); });
        nameCell = [a, el('div', {}, [tagNodes(r.tags)])];
      } else nameCell = [r.name];
      return el('tr', {}, [
        el('td', { 'class': 'is-name' }, nameCell),
        el('td', {}, r.time),
        el('td', {}, r.place),
        el('td', {}, r.people),
        el('td', {}, r.result),
        el('td', {}, [r.line, srcLine(r.s)])
      ]);
    });
    return [
      Z.note('时间按通行系年，公元前写作“前722”。点事件名看事件卡。'),
      el('div', { 'class': 'ss-tablewrap' }, [el('table', { 'class': 'ss-table zb-main' }, [
        el('thead', {}, [el('tr', {}, head.map(function (h) { return el('th', { text: h }); }))]),
        el('tbody', {}, rows)
      ])])
    ];
  }

  /* ---------- 标签：概况 ---------- */
  function buildIntro() {
    var kids = D.intro.map(function (p) {
      return el('div', { 'class': 'dc-para' }, [el('p', {}, rich(p.t, newCtx())), srcLine(p.s)]);
    });
    kids.push(Z.note('红色“待核”表示还没有对照原典逐项核对；“部分待核”表示其中一部分还没核。坐标只是区域示意。'));
    return kids;
  }

  /* ---------- 标签：制度 ---------- */
  function cellNode(c, col, tb) {
    var first = col === 0;
    if (first && byName[c.t]) {
      var a = el('a', { 'class': 'ss-jump', href: '#', text: c.t });
      a.addEventListener('click', function (ev) { ev.preventDefault(); openEvent(c.t); });
      return el('td', { 'class': 'is-name' }, [a]);
    }
    if (tb.link) {   /* 与战役页对应的表：最后一列是战役名，连到战役页 */
      var parts = String(c.t).split(/[、，,]/).map(function (x) { return x.trim(); }).filter(Boolean);
      if (col === tb.link) {
        var kids = [];
        parts.forEach(function (n, i) {
          if (i) kids.push('、');
          kids.push(el('a', { 'class': 'ss-ref', href: 'zhanyi.html?id=' + encodeURIComponent(n), title: '到战役页看看' + n, text: n }));
        });
        return el('td', {}, kids);
      }
    }
    return el('td', {}, rich(c.t, null).concat([srcLine(c.s)]));
  }
  function sysTable(t) {
    var isBattle = t.head.length === 2 && /战役/.test(t.head[1]);
    var tb = { link: isBattle ? 1 : -1 };
    var rows = t.rows.map(function (r) {
      return el('tr', {}, r.map(function (c, i) { return cellNode(c, i, tb); }));
    });
    return el('div', { 'class': 'ss-tablewrap zb-table-wrap' }, [el('table', { 'class': 'ss-table ' + (isBattle ? 'zb-bt' : 'zb-gc') }, [
      el('thead', {}, [el('tr', {}, t.head.map(function (h) { return el('th', { text: h }); }))]),
      el('tbody', {}, rows)
    ])]);
  }
  function buildSystems() {
    return [Z.note('这些是理解政变与起义时经常遇到的概念，点标题展开。')].concat(D.systems.map(function (s) {
      var body = s.paras.map(function (p) { return el('div', {}, [el('p', {}, rich(p.t, newCtx())), srcLine(p.s)]); });
      if (s.table && s.table.rows.length) body.push(sysTable(s.table));
      return el('details', { 'class': 'dc-sys' }, [el('summary', { text: s.title }), el('div', { 'class': 'dc-sys-body' }, body)]);
    }));
  }

  /* ---------- 标签：待核 ---------- */
  function buildChecks() {
    var kids = [Z.note('这里列出的是事件卡里还没有逐项核对的地方。所有事件的坐标都只是区域示意，没有核对精确点位，不再逐条列出。')];
    var order = [], by = {};
    D.checks.forEach(function (k) {
      var c = k.name || '其他';
      if (!by[c]) { by[c] = []; order.push(c); }
      by[c].push(k);
    });
    order.forEach(function (c) {
      var h;
      if (byName[c]) {
        h = el('a', { 'class': 'ss-jump', href: '#', text: c });
        h.addEventListener('click', function (ev) { ev.preventDefault(); openEvent(c); });
      } else h = c;
      kids.push(el('div', { 'class': 'ss-sys' }, [
        el('h3', {}, [h]),
        el('ul', { 'class': 'ss-list' }, by[c].map(function (k) {
          return el('li', {}, [el('strong', { text: k.q }), k.why ? '——' : null].concat(k.why ? rich(k.why, newCtx()) : []));
        }))
      ]));
    });
    return kids;
  }

  /* ---------- 页面 ---------- */
  var head = el('header', { 'class': 'zy-head' }, [
    el('div', { 'class': 'zy-eyebrow', text: '历史 · 专题' }),
    el('h1', { 'class': 'zy-hook', text: D.hook }),
    el('p', { 'class': 'zy-answer', text: D.answer }),
    el('p', { 'class': 'zy-lead', text: '共 ' + D.events.length + ' 个，分 ' + D.groups.length + ' 组；其中 ' + D.tagCount['改朝换代'] + ' 个与改朝换代直接相关。史书常把这些行动称为“反”“叛”“乱”，那是编史者的立场，这里按事实分类。' })
  ]);
  var defs = [
    { key: 'event', label: '事件（' + D.events.length + '）', build: buildEvents },
    { key: 'table', label: '总表', build: buildTable },
    { key: 'intro', label: '概况', build: buildIntro },
    { key: 'sys', label: '制度（' + D.systems.length + '）', build: buildSystems },
    { key: 'check', label: '待核（' + D.checks.length + '）', build: buildChecks }
  ];
  var t = Z.tabs(defs);
  Z.mount(root, [head, t.node, Z.note('每个事件的介绍里都列了出处。事件涉及的战役，点“关联战役”到战役页看；发生的都城，点“关联都城”到都城页看；帝王和人物，点带下划线的名字到朝代页看。'),
    el('p', {}, [el('a', { href: 'lishi.html', text: '回到历史总览 →' })])]);
  document.title = '政变与起义 · 历史 · 知否知否';

  /* 网址里带 ?id=事件名：直接打开那一个 */
  var id = Z.qs('id');
  if (id && byName[id]) { t.show('event', true); openEvent(id); }
})();
