/* 知否知否 · 历史 · 都城页
   数据：data/ducheng.js（由 工具脚本/生成都城数据.py 从 文案库/历史/都城.md 自动生成）；
         data/lishi-names.js 是“人名 → 在哪个朝代、哪张卡片”的对照表，用来把文中提到的人物连到朝代页。
   页面分五个标签：城市（含位置示意图和 40 张城市小卡）、总表、概况、制度、待核。
   点一座城，弹出一个居中的窗口显示介绍（样式和朝代页的人物窗口相同）。
   排版工具：js/zycommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_DUCHENG, Z = window.ZY;
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
  function groupShort(t) { return String(t || '').replace(/^第.组[·・]?/, ''); }

  var cityByName = {}, groupIdx = {};
  D.cities.forEach(function (c) { cityByName[c.name] = c; });
  D.groups.forEach(function (g, i) { groupIdx[g.title] = i; });
  var COLORS = ['#e2c27d', '#7fc6d4', '#e4705c', '#9ccf8f'];

  /* ---------- 弹窗 ---------- */
  var modal = null, lastFocus = null, curName = null;

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
    curName = null;
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
    var card = el('div', { 'class': 'ss-modal-card', role: 'dialog', 'aria-modal': 'true', 'aria-label': '城市介绍' }, [closeBtn, tag, title, facts, body, nav]);
    var overlay = el('div', { 'class': 'ss-modal-overlay', 'aria-hidden': 'true' }, [card]);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal(); });
    return { overlay: overlay, card: card, tag: tag, title: title, facts: facts, body: body, nav: nav, closeBtn: closeBtn };
  }

  function fmtCoord(c) {
    if (c.lat === null || c.lat === undefined) return '';
    return '北纬 ' + c.lat.toFixed(1) + '°，东经 ' + c.lon.toFixed(1) + '°（约）';
  }

  /* 一个字段 → 弹窗里的一块 */
  function fieldNode(f) {
    var ctx = newCtx();
    if (f.periods) {
      return el('ul', { 'class': 'ss-list dc-periods' }, f.periods.map(function (p) {
        var head = [p.who, p.name].filter(Boolean).join(' · ');
        return el('li', {}, [
          el('span', { 'class': 'ss-ly', text: head + '　' })
        ].concat(rich(p.span, ctx)).concat([p.role ? el('span', { 'class': 'dc-role', text: '　' + p.role }) : null, gradeEl(p.g), p.gn ? el('span', { 'class': 'dc-gn' }, rich('（' + p.gn + '）')) : null, srcLine(p.s)]));
      }));
    }
    if (f.events) {
      return el('ul', { 'class': 'ss-list' }, f.events.map(function (e) {
        return el('li', {}, [el('span', { 'class': 'ss-ly' }, rich(e.y))].concat(rich(e.t, ctx)).concat([gradeEl(e.g), srcLine(e.s)]));
      }));
    }
    if (f.tombs) {
      var kids = [];
      f.tombs.forEach(function (t, i) {
        if (i) kids.push('、');
        kids.push(t.id ? el('a', { 'class': 'ss-ref', href: 'lingmu-detail.html?id=' + encodeURIComponent(t.id), title: '到陵墓页看看' + t.n, text: t.n }) : t.n);
      });
      return el('span', {}, kids);
    }
    if (f.people) {
      var ks = [];
      f.people.forEach(function (n, i) {
        if (i) ks.push('、');
        var pk = pickName(n);
        ks.push(pk ? el('a', { 'class': 'ss-ref', href: personHref(pk), title: '到朝代页看看' + n + '的介绍', text: n }) : n);
      });
      return el('span', {}, ks);
    }
    if (f.k === '城市形制' && /(文献记载|考古所见)——/.test(f.v)) {
      var segs = f.v.split(/(?=考古所见——)/);
      var ps = segs.map(function (sg) {
        var m = /^(文献记载|考古所见)——([\s\S]*)$/.exec(sg);
        return m ? el('p', { 'class': 'dc-seg' }, [el('b', { text: m[1] })].concat(rich(m[2], ctx))) : el('p', { 'class': 'dc-seg' }, rich(sg, ctx));
      });
      ps.push(srcLine(f.s));
      return el('div', {}, ps);
    }
    return el('div', {}, [el('span', {}, rich(f.v, ctx)), srcLine(f.s)]);
  }

  function fillModal(c) {
    modal.tag.textContent = '都城 · ' + groupShort(c.group);
    modal.title.textContent = c.name;
    modal.facts.textContent = '';
    [['今地', c.place], ['政权', c.who], ['时间', c.span], ['坐标', fmtCoord(c)]].forEach(function (p) {
      if (p[1]) modal.facts.appendChild(el('span', { 'class': 'ss-fact' }, [el('b', { text: p[0] }), p[1]]));
    });
    var g = gradeEl(c.g);
    if (g) modal.facts.appendChild(g);
    var pairs = c.f.map(function (f) { return [f.k, fieldNode(f)]; });
    modal.body.textContent = '';
    var oldRow = modal.card.querySelector('.zf-tts-row');   /* 换了一座城：去掉旧的“听介绍”按钮（朗读脚本会自动重新放一个） */
    if (oldRow && oldRow.parentNode) oldRow.parentNode.removeChild(oldRow);
    modal.body.appendChild(Z.kv(pairs, { quote: [] }));
    /* 相关战役：从战役页的索引（data/zhanyi-index.js）里取，连到战役页 */
    var zys = (window.ZHIFOU_ZY_BYCITY || {})[c.name];
    if (zys && zys.length) {
      var zk = [];
      zys.forEach(function (z, i) {
        if (i) zk.push('、');
        zk.push(el('a', { 'class': 'ss-ref', href: 'zhanyi.html?id=' + encodeURIComponent(z.n), title: '到战役页看看' + z.n, text: z.n }));
      });
      modal.body.appendChild(Z.kv([['相关战役', el('span', {}, zk)]], { quote: [] }));
    }
    /* 上一座、下一座（按页面上的顺序） */
    var idx = D.cities.indexOf(c);
    modal.nav.textContent = '';
    var prev = D.cities[idx - 1], next = D.cities[idx + 1];
    if (prev) {
      var b1 = el('button', { 'class': 'zy-btn', type: 'button', text: '← ' + cut(prev.show || prev.name, 8) });
      b1.addEventListener('click', function () { openCity(prev.name); });
      modal.nav.appendChild(b1);
    }
    if (next) {
      var b2 = el('button', { 'class': 'zy-btn', type: 'button', text: cut(next.show || next.name, 8) + ' →' });
      b2.addEventListener('click', function () { openCity(next.name); });
      modal.nav.appendChild(b2);
    }
    modal.card.scrollTop = 0;
  }

  function openCity(name) {
    var c = cityByName[name];
    if (!c) return;
    if (!modal) modal = buildModal();
    if (!modal.overlay.classList.contains('is-open')) lastFocus = document.activeElement;
    curName = name;
    fillModal(c);
    modal.overlay.classList.add('is-open');
    modal.overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('ss-noscroll');
    setQs(name);
    if (modal.closeBtn && modal.closeBtn.focus) { try { modal.closeBtn.focus({ preventScroll: true }); } catch (e) { /* 忽略 */ } }
  }

  /* ---------- 标签：城市 ---------- */
  function buildCities() {
    var kids = [];
    var tiles = [];

    /* 位置示意图：没有海岸线和省界，只用经纬网格标出各城的大致位置 */
    var NS = 'http://www.w3.org/2000/svg';
    function sv(tag, attrs, text) {
      var n = document.createElementNS(NS, tag);
      Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      if (text) n.textContent = text;
      return n;
    }
    var LON0 = 72, LON1 = 136, LAT0 = 18, LAT1 = 54, SC = 17, KX = 0.82;   /* KX：东西方向按纬度压窄一点，形状才不变形 */
    var W = (LON1 - LON0) * SC * KX, H = (LAT1 - LAT0) * SC;
    function px(lon) { return (lon - LON0) * SC * KX; }
    function py(lat) { return (LAT1 - lat) * SC; }
    function path(pts, close) {
      return pts.map(function (p, i) { return (i ? 'L' : 'M') + px(p[0]).toFixed(1) + ' ' + py(p[1]).toFixed(1); }).join('') + (close ? 'Z' : '');
    }
    /* 国界与海岸线：手工简化的轮廓（约 100 个点），只求形状认得出来，不是精确边界；两条大河帮助定位 */
    var CHINA = [[120.8,53.3],[123.5,53.5],[126.0,52.7],[127.5,49.8],[130.6,48.9],[134.7,48.3],[134.2,47.3],[133.0,45.5],[131.9,45.3],[131.1,44.9],[131.3,43.4],[130.6,42.4],[129.7,42.4],[128.0,41.4],[126.5,41.4],[124.3,39.9],[121.7,38.9],[122.2,40.4],[121.0,40.9],[119.5,39.6],[118.0,39.2],[117.8,38.9],[118.0,37.9],[119.0,37.2],[120.3,37.8],[122.5,37.4],[121.0,36.6],[120.2,36.0],[119.2,35.0],[119.6,34.4],[120.4,33.0],[121.0,32.0],[121.9,31.4],[121.9,30.0],[121.4,28.9],[120.6,27.5],[119.7,26.0],[119.0,25.2],[118.1,24.5],[116.8,23.4],[115.2,22.8],[113.8,22.4],[113.0,21.9],[111.5,21.4],[110.4,20.3],[109.6,21.6],[108.0,21.5],[106.7,22.0],[105.3,23.3],[104.0,22.8],[103.0,22.5],[102.2,22.4],[101.2,21.2],[100.1,21.7],[99.5,22.2],[98.9,23.2],[97.7,23.9],[97.9,24.8],[98.7,25.8],[98.6,27.5],[97.5,28.3],[96.0,29.4],[94.5,29.2],[92.5,27.8],[91.6,27.8],[90.4,28.1],[89.0,27.3],[88.0,27.9],[86.0,27.9],[84.2,28.8],[82.0,30.3],[81.0,30.2],[79.0,31.0],[78.7,32.5],[79.5,33.2],[78.0,35.5],[76.0,35.8],[75.0,37.0],[74.5,38.6],[73.8,39.5],[75.5,40.5],[76.7,41.0],[78.5,41.5],[80.2,42.1],[80.3,43.0],[80.0,44.8],[82.5,45.2],[83.0,47.2],[85.5,47.0],[87.3,49.1],[90.0,47.9],[91.0,46.8],[95.0,44.2],[96.4,42.7],[100.5,42.6],[105.0,41.6],[107.0,42.4],[110.4,42.7],[111.9,43.7],[111.4,44.3],[113.5,44.8],[116.0,45.7],[117.4,46.6],[119.7,46.7],[118.8,47.8],[116.7,49.8],[118.5,49.9],[120.5,52.6]];
    var HAINAN = [[108.7,19.2],[110.0,20.1],[111.0,19.6],[110.0,18.3],[108.7,18.6]];
    var TAIWAN = [[121.5,25.2],[122.0,25.0],[121.0,22.9],[120.1,23.0],[120.4,24.7]];
    var HUANGHE = [[96.0,34.5],[100.5,34.3],[103.8,36.1],[105.0,37.5],[106.8,38.5],[107.5,40.8],[109.5,40.6],[111.0,40.3],[111.5,38.5],[110.5,36.5],[110.3,35.0],[112.0,34.8],[114.5,34.9],[116.5,35.5],[117.5,37.0],[118.9,37.7]];
    var CHANGJIANG = [[91.0,33.5],[97.0,33.0],[99.0,30.0],[101.5,27.5],[104.6,28.8],[106.5,29.6],[108.5,30.8],[111.0,30.7],[112.2,30.3],[113.5,30.0],[114.3,30.6],[116.0,29.8],[117.5,30.5],[118.8,32.0],[120.5,31.9],[121.9,31.4]];
    var svg = sv('svg', { viewBox: '-6 -6 ' + (W + 12) + ' ' + (H + 12), 'class': 'dc-map-svg', role: 'group', 'aria-label': '40座都城的大致位置示意图' });
    svg.appendChild(sv('path', { d: path(CHINA, true), 'class': 'dc-land' }));
    svg.appendChild(sv('path', { d: path(HAINAN, true), 'class': 'dc-land' }));
    svg.appendChild(sv('path', { d: path(TAIWAN, true), 'class': 'dc-land' }));
    svg.appendChild(sv('path', { d: path(HUANGHE, false), 'class': 'dc-river' }));
    svg.appendChild(sv('path', { d: path(CHANGJIANG, false), 'class': 'dc-river' }));
    svg.appendChild(sv('text', { x: px(104.5), y: py(36.4) - 4, 'class': 'dc-rname' }, '黄河'));
    svg.appendChild(sv('text', { x: px(103.5), y: py(30.4), 'class': 'dc-rname' }, '长江'));
    /* 先画圆点，再给每个点找一个不挤在一起的位置放城名；放不下的只留圆点（鼠标停在上面能看到名字） */
    var placed = [];
    D.cities.forEach(function (c) {
      if (c.lat !== null && c.lat !== undefined) placed.push({ x0: px(c.lon) - 6, y0: py(c.lat) - 6, x1: px(c.lon) + 6, y1: py(c.lat) + 6 });
    });
    function hit(r) {
      for (var i = 0; i < placed.length; i++) {
        var q = placed[i];
        if (r.x0 < q.x1 && r.x1 > q.x0 && r.y0 < q.y1 && r.y1 > q.y0) return true;
      }
      return r.x0 < -4 || r.x1 > W + 4 || r.y0 < -4 || r.y1 > H + 4;
    }
    var labels = [];
    D.cities.forEach(function (c) {
      if (c.lat === null || c.lat === undefined) return;
      var nm = (c.show || c.name).split('（')[0];
      var w = nm.length * 11 + 2, h = 12, x = px(c.lon), y = py(c.lat);
      var tries = [[8, 4, 'start', 8], [-8, 4, 'end', -8 - w], [-w / 2, -9, 'start', -w / 2], [-w / 2, 17, 'start', -w / 2], [8, -8, 'start', 8], [-8, -8, 'end', -8 - w]];
      for (var i = 0; i < tries.length; i++) {
        var tr = tries[i];
        var rect = { x0: x + tr[3] - 1, y0: y + tr[1] - 10, x1: x + tr[3] + w, y1: y + tr[1] + 2 };
        if (hit(rect)) continue;
        placed.push(rect);
        labels.push({ x: x + (tr[2] === 'start' ? tr[3] : tr[3] + w), y: y + tr[1], a: tr[2], t: nm });
        break;
      }
    });
    labels.forEach(function (l) { svg.appendChild(sv('text', { x: l.x, y: l.y, 'class': 'dc-lbl', 'text-anchor': l.a }, l.t)); });
    D.cities.forEach(function (c) {
      if (c.lat === null || c.lat === undefined) return;
      var col = COLORS[(groupIdx[c.group] || 0) % COLORS.length];
      var g = sv('g', { 'class': 'dc-dot', tabindex: '0', role: 'button', 'aria-label': '查看' + (c.show || c.name) + '的介绍' });
      g.appendChild(sv('title', {}, (c.show || c.name) + '（约' + c.lat.toFixed(1) + '°N，' + c.lon.toFixed(1) + '°E）'));
      g.appendChild(sv('circle', { cx: px(c.lon), cy: py(c.lat), r: 11, 'class': 'dc-hit' }));
      g.appendChild(sv('circle', { cx: px(c.lon), cy: py(c.lat), r: 4.5, fill: col, 'class': 'dc-pt' }));
      g.addEventListener('click', function () { openCity(c.name); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCity(c.name); } });
      svg.appendChild(g);
    });
    var tip = el('p', { 'class': 'dc-maptip', 'aria-live': 'polite', text: '' });
    svg.addEventListener('mouseover', function (e) {
      var g = e.target && e.target.closest ? e.target.closest('.dc-dot') : null;
      if (!g) return;
      var t = g.querySelector('title');
      tip.textContent = t ? t.textContent : '';
    });
    var legend = el('p', { 'class': 'dc-legend' }, D.groups.map(function (g, i) {
      return el('span', {}, [el('i', { style: 'background:' + COLORS[i % COLORS.length], 'aria-hidden': 'true' }), groupShort(g.title)]);
    }));
    kids.push(Z.section('位置示意', [
      Z.note('点圆点看那座城的介绍。轮廓是手工简化的示意（国界、海岸线和黄河、长江只求形状认得出来，不是精确地图）；古城的位置以城市卡里写的遗址范围为准。'),
      el('div', { 'class': 'dc-map' }, [svg]), tip, legend
    ]));

    /* 搜索框 + 分组小卡 */
    var box = el('input', { 'class': 'ss-search', type: 'search', placeholder: '按城名、今地或政权搜索，如 西安、北宋、辽', 'aria-label': '搜索城市' });
    var count = el('p', { 'class': 'zy-note', 'aria-live': 'polite' });
    var secs = [];
    var groupNodes = D.groups.map(function (g) {
      var ts = g.cities.map(function (n) {
        var c = cityByName[n];
        var b = el('button', { 'class': 'ss-tile', type: 'button', 'aria-label': '查看' + (c.show || c.name) + '的介绍' }, [
          el('span', { 'class': 'ss-tile-name', text: c.show || c.name }),
          el('span', { 'class': 'ss-tile-l1', text: cut(c.place, 26) }),
          el('span', { 'class': 'ss-tile-l2', text: c.who }),
          null
        ]);
        b.setAttribute('data-q', c.name + (c.show || '') + c.place + c.who + c.span);
        b.addEventListener('click', function () { openCity(c.name); });
        tiles.push(b);
        return b;
      });
      var sec = Z.section(groupShort(g.title) + '（' + g.cities.length + '）', [el('div', { 'class': 'ss-tiles' }, ts)]);
      secs.push({ node: sec, tiles: ts });
      return sec;
    });
    function apply() {
      var q = box.value.trim(), n = 0;
      secs.forEach(function (s) {
        var any = 0;
        s.tiles.forEach(function (t) {
          var hit = !q || t.getAttribute('data-q').indexOf(q) >= 0;
          t.hidden = !hit;
          if (hit) { any++; n++; }
        });
        s.node.hidden = !any;
      });
      count.textContent = q ? '找到 ' + n + ' 座。' : '共 ' + D.cities.length + ' 座，分 ' + D.groups.length + ' 组。点一张看今地、历代名称、作为都城的时期、城市形制、迁都与兴衰和遗址。';
    }
    box.addEventListener('input', apply);
    apply();
    kids.push(box, count);
    groupNodes.forEach(function (n) { kids.push(n); });
    return kids;
  }

  /* ---------- 标签：总表 ---------- */
  function buildTable() {
    var head = ['城名', '今地', '曾作都城的政权', '大致时间范围', '一句话'];
    var rows = D.table.map(function (r) {
      var c = cityByName[r.name];
      var nameCell;
      if (c) {
        var a = el('a', { 'class': 'ss-jump', href: '#', text: r.show || r.name });
        a.addEventListener('click', function (ev) { ev.preventDefault(); openCity(r.name); });
        nameCell = [a];
      } else nameCell = [r.show || r.name];
      return el('tr', {}, [
        el('td', { 'class': 'is-name' }, nameCell),
        el('td', {}, r.place),
        el('td', {}, r.who),
        el('td', {}, r.span),
        el('td', {}, [r.line, srcLine(r.s)])
      ]);
    });
    return [
      Z.note(D.tableNote || '时间为分段概括，不表示全程连续建都。点城名看城市卡。'),
      el('div', { 'class': 'ss-tablewrap' }, [el('table', { 'class': 'ss-table dc-table' }, [
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
    kids.push(Z.note('年份均用公历，公元前写作“前221”。红色“待核”表示还没有对照原典、发掘报告逐项核对；“部分待核”表示其中一部分还没核。'));
    return kids;
  }

  /* ---------- 标签：制度 ---------- */
  function buildSystems() {
    return [Z.note('这些是理解都城时经常遇到的概念和制度，点标题展开。')].concat(D.systems.map(function (s) {
      var body = [el('p', {}, rich(s.t, newCtx())), srcLine(s.s)];
      if (s.items && s.items.length) body.push(el('ul', { 'class': 'ss-list' }, s.items.map(function (x) { return el('li', {}, rich(x, newCtx())); })));
      return el('details', { 'class': 'dc-sys' }, [el('summary', { text: s.title }), el('div', { 'class': 'dc-sys-body' }, body)]);
    }));
  }

  /* ---------- 标签：待核 ---------- */
  function buildChecks() {
    var kids = [];
    if (D.checkIntro) kids.push(Z.note(D.checkIntro));
    var order = [], by = {};
    D.checks.forEach(function (k) {
      var c = k.city || '其他';
      if (!by[c]) { by[c] = []; order.push(c); }
      by[c].push(k);
    });
    order.forEach(function (c) {
      var h;
      if (cityByName[c]) {
        h = el('a', { 'class': 'ss-jump', href: '#', text: cityByName[c].show || c });
        h.addEventListener('click', function (ev) { ev.preventDefault(); openCity(c); });
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
    el('p', { 'class': 'zy-lead', text: '共 ' + D.cities.length + ' 座城，分 ' + D.groups.length + ' 组；同一座城前后做过哪些政权的都城，分段写明，不连成一段连续的国都史。' })
  ]);
  var defs = [
    { key: 'city', label: '城市（' + D.cities.length + '）', build: buildCities },
    { key: 'table', label: '总表', build: buildTable },
    { key: 'intro', label: '概况', build: buildIntro },
    { key: 'sys', label: '制度（' + D.systems.length + '）', build: buildSystems },
    { key: 'check', label: '待核（' + D.checks.length + '）', build: buildChecks }
  ];
  var t = Z.tabs(defs);
  Z.mount(root, [head, t.node, Z.note('每座城的介绍里都列了出处；坐标是大致位置，只用于示意。朝代里的帝王、人物详情，点文中带下划线的名字到朝代页看。'),
    el('p', {}, [el('a', { href: 'lishi.html', text: '回到历史总览 →' })])]);
  document.title = '都城 · 历史 · 知否知否';

  /* 网址里带 ?id=城名：直接打开那一座 */
  var id = Z.qs('id');
  if (id && cityByName[id]) { t.show('city', true); openCity(id); }
})();
