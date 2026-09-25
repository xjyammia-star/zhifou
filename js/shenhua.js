/* 知否知否 · 上古神话脚本（关系图谱＋故事长卷）
   数据来自 data/shenhua.js（window.ZHIFOU_SHENHUA），本文件只负责画图和交互。
   详情弹窗的样式和"民间神灵"页共用 css/shen.css 里 sl- 开头的那部分。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_SHENHUA;
  var root = document.getElementById('app');
  if (!D || !root) return;

  var NS = 'http://www.w3.org/2000/svg';

  /* 每位人物的配图。有了图，把图片放进 img/shen/ 文件夹，再把对应的空引号改成图片路径，
     例如：'女娲': 'img/shen/nvwa.jpg'。空着的，详情里显示"配图待补"占位。 */
  var IMAGES = {};

  /* 其他页面的地址（"另见"链接用） */
  var PAGE_LINKS = { '山海经': 'shanhai.html', '民间神灵': 'shenling.html' };

  var GROUP_COLOR = {
    '创世与文明': '#c9a961', '部族与战争': '#d9826b', '帝王谱系': '#7fb8a4',
    '治水与夏': '#7f92b8', '周商祖先': '#d8d4c8', '天象与英雄': '#b79ad8'
  };
  var TYPE_STYLE = {
    '亲缘与继承': { color: '#c9a961', dash: '', width: 1.8, arrow: 'kin' },
    '冲突': { color: '#d9826b', dash: '7 5', width: 1.8, arrow: '' },
    '事件与助力': { color: '#7f92b8', dash: '2 5', width: 2, arrow: 'event' },
    '说法不一': { color: '#9a927d', dash: '4 4', width: 1.3, arrow: '' }
  };

  /* 每位人物在图上的位置（中心点）；每一行是一组 */
  var W = 1320, H = 1040;
  var POS = {
    '盘古': [190, 100], '神农': [400, 100], '女娲': [690, 100], '伏羲': [910, 100],
    '黄帝': [400, 260], '蚩尤': [610, 260], '祝融': [850, 260], '共工': [1080, 260],
    '助战诸神': [505, 365],
    '颛顼': [400, 450], '帝喾': [600, 450], '尧': [800, 450], '舜': [1000, 450],
    '涂山氏': [800, 610], '禹': [1000, 610], '鲧': [1200, 610],
    '后稷': [480, 770], '契': [680, 770], '启': [900, 770],
    '西王母': [150, 940], '刑天': [320, 940], '精卫': [480, 940], '夸父': [640, 940],
    '帝俊·羲和·常羲': [860, 940], '嫦娥': [1060, 940], '后羿': [1200, 940]
  };
  var ROW_Y = { '创世与文明': 100, '部族与战争': 260, '帝王谱系': 450, '治水与夏': 610, '周商祖先': 770, '天象与英雄': 940 };
  var NODE_H = 46;
  /* 个别连线的文字要挪开，免得和相邻的连线文字叠在一起 */
  var LABEL_SHIFT = {
    '助战诸神>黄帝': { dx: -12, dy: 12, anchor: 'end' },
    '助战诸神>蚩尤': { dx: 12, dy: 12, anchor: 'start' }
  };

  var byName = {};
  D.people.forEach(function (p) { byName[p.name] = p; });

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (Array.isArray(kids) ? kids : (kids ? [kids] : [])).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function svg(tag, attrs, text) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text != null) n.textContent = text;
    return n;
  }
  function f(n) { return n.toFixed(1); }

  /* ---------- 图谱几何 ---------- */
  var rects = {};
  D.people.forEach(function (p) {
    var pos = POS[p.name] || [100, 100];
    var w = Math.max(92, p.name.length * 21 + 28);
    rects[p.name] = { cx: pos[0], cy: pos[1], w: w, h: NODE_H };
  });

  function edgePoint(r, tx, ty, gap) {
    var dx = tx - r.cx, dy = ty - r.cy;
    if (dx === 0 && dy === 0) return [r.cx, r.cy];
    var t = Math.min(dx !== 0 ? (r.w / 2 + gap) / Math.abs(dx) : 1e9, dy !== 0 ? (r.h / 2 + gap) / Math.abs(dy) : 1e9);
    return [r.cx + dx * t, r.cy + dy * t];
  }

  function hitsRect(p1, p2, r, pad) {
    var x0 = r.cx - r.w / 2 - pad, x1 = r.cx + r.w / 2 + pad, y0 = r.cy - r.h / 2 - pad, y1 = r.cy + r.h / 2 + pad;
    for (var i = 0; i <= 20; i++) {
      var t = i / 20, x = p1[0] + (p2[0] - p1[0]) * t, y = p1[1] + (p2[1] - p1[1]) * t;
      if (x > x0 && x < x1 && y > y0 && y < y1) return true;
    }
    return false;
  }
  function hitsQuad(p1, c, p2, r, pad) {
    var x0 = r.cx - r.w / 2 - pad, x1 = r.cx + r.w / 2 + pad, y0 = r.cy - r.h / 2 - pad, y1 = r.cy + r.h / 2 + pad;
    for (var i = 0; i <= 24; i++) {
      var t = i / 24, u = 1 - t;
      var x = u * u * p1[0] + 2 * u * t * c[0] + t * t * p2[0], y = u * u * p1[1] + 2 * u * t * c[1] + t * t * p2[1];
      if (x > x0 && x < x1 && y > y0 && y < y1) return true;
    }
    return false;
  }

  /* 算一条连线的路径：先试直线；直线穿过别的节点，就弯一下绕开 */
  function edgePath(a, b) {
    var ra = rects[a], rb = rects[b];
    var s = edgePoint(ra, rb.cx, rb.cy, 4), e = edgePoint(rb, ra.cx, ra.cy, 6);
    var others = Object.keys(rects).filter(function (k) { return k !== a && k !== b; });
    var blocked = others.some(function (k) { return hitsRect(s, e, rects[k], 6); });
    if (!blocked) {
      return { d: 'M' + f(s[0]) + ' ' + f(s[1]) + ' L' + f(e[0]) + ' ' + f(e[1]), mid: [(s[0] + e[0]) / 2, (s[1] + e[1]) / 2], from: s, to: e, ang: Math.atan2(e[1] - s[1], e[0] - s[0]) };
    }
    var mx = (ra.cx + rb.cx) / 2, my = (ra.cy + rb.cy) / 2;
    var dx = rb.cx - ra.cx, dy = rb.cy - ra.cy, len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len, ny = dx / len;
    var best = null;
    [70, -70, 120, -120, 170, -170].some(function (off) {
      var c = [mx + nx * off, my + ny * off];
      var s2 = edgePoint(ra, c[0], c[1], 4), e2 = edgePoint(rb, c[0], c[1], 6);
      var bad = others.some(function (k) { return hitsQuad(s2, c, e2, rects[k], 6); });
      if (!bad) { best = { c: c, s: s2, e: e2 }; return true; }
      return false;
    });
    if (!best) {
      var c0 = [mx + nx * 70, my + ny * 70];
      best = { c: c0, s: edgePoint(ra, c0[0], c0[1], 4), e: edgePoint(rb, c0[0], c0[1], 6) };
    }
    var c1 = best.c, s1 = best.s, e1 = best.e;
    return {
      d: 'M' + f(s1[0]) + ' ' + f(s1[1]) + ' Q' + f(c1[0]) + ' ' + f(c1[1]) + ' ' + f(e1[0]) + ' ' + f(e1[1]),
      mid: [(s1[0] + 2 * c1[0] + e1[0]) / 4, (s1[1] + 2 * c1[1] + e1[1]) / 4], from: s1, to: e1, ang: Math.atan2(e1[1] - c1[1], e1[0] - c1[0])
    };
  }

  /* ---------- 图谱 ---------- */
  var nodeEls = {}, edgeEls = [], graphSvg;

  function buildGraph() {
    var s = svg('svg', { 'class': 'sh-svg', viewBox: '0 0 ' + W + ' ' + H, role: 'group', 'aria-label': '上古神话人物关系图谱，点击人物查看详情' });
    var defs = svg('defs');
    ['kin', 'event'].forEach(function (k) {
      var color = k === 'kin' ? TYPE_STYLE['亲缘与继承'].color : TYPE_STYLE['事件与助力'].color;
      var m = svg('marker', { id: 'sh-arrow-' + k, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' });
      m.appendChild(svg('path', { d: 'M2 1L8 5L2 9', fill: 'none', stroke: color, 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
      defs.appendChild(m);
    });
    s.appendChild(defs);

    /* 行标签和分隔线 */
    var prevY = null;
    D.groups.forEach(function (g) {
      var y = ROW_Y[g.name];
      if (prevY != null) {
        var ly = (prevY + y) / 2 + (g.name === '帝王谱系' ? 30 : 0);
        s.appendChild(svg('line', { x1: 16, y1: ly, x2: W - 16, y2: ly, 'class': 'sh-rowline' }));
      }
      s.appendChild(svg('text', { x: 18, y: y - 30, 'class': 'sh-rowlabel', fill: GROUP_COLOR[g.name] }, g.name));
      prevY = y;
    });

    /* 连线 */
    var edgeLayer = svg('g', { 'class': 'sh-edges' });
    D.relations.forEach(function (r, i) {
      var st = TYPE_STYLE[r.type] || TYPE_STYLE['说法不一'];
      var pth = edgePath(r.from, r.to);
      var g = svg('g', { 'class': 'sh-edge', 'data-from': r.from, 'data-to': r.to });
      var path = svg('path', { d: pth.d, fill: 'none', stroke: st.color, 'stroke-width': st.width, 'stroke-dasharray': st.dash || 'none', 'stroke-linecap': 'round' });
      if (st.arrow && !r.undirected) path.setAttribute('marker-end', 'url(#sh-arrow-' + st.arrow + ')');
      g.appendChild(path);
      var lo = LABEL_SHIFT[r.from + '>' + r.to] || { dx: 0, dy: 0, anchor: 'middle' };
      g.appendChild(svg('text', { x: f(pth.mid[0] + lo.dx), y: f(pth.mid[1] + 4 + lo.dy), 'class': 'sh-edge-label', 'text-anchor': lo.anchor }, r.label));
      edgeLayer.appendChild(g);
      edgeEls.push({ el: g, a: r.from, b: r.to });
    });
    s.appendChild(edgeLayer);

    /* 节点 */
    D.people.forEach(function (p) {
      var r = rects[p.name], color = GROUP_COLOR[p.group] || '#c9a961';
      var g = svg('g', { 'class': 'sh-node', role: 'button', tabindex: '0', 'aria-label': p.name + '：' + p.line, 'data-name': p.name });
      g.appendChild(svg('rect', { x: f(r.cx - r.w / 2), y: f(r.cy - r.h / 2), width: r.w, height: r.h, rx: 6, 'class': 'sh-node-bg', stroke: color }));
      g.appendChild(svg('text', { x: f(r.cx), y: f(r.cy), 'class': 'sh-node-text', fill: color }, p.name));
      g.addEventListener('click', function () { openDetail(p.name, true); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(p.name, true); } });
      g.addEventListener('mouseenter', function () { focusNode(p.name); });
      g.addEventListener('mouseleave', function () { focusNode(null); });
      g.addEventListener('focus', function () { focusNode(p.name); });
      g.addEventListener('blur', function () { focusNode(null); });
      s.appendChild(g);
      nodeEls[p.name] = g;
    });
    graphSvg = s;
    return s;
  }

  /* 悬停或聚焦一位人物时，只突出和他有关的节点和连线 */
  function focusNode(name) {
    if (!graphSvg) return;
    if (!name) {
      graphSvg.classList.remove('is-focus');
      Object.keys(nodeEls).forEach(function (k) { nodeEls[k].classList.remove('is-on'); });
      edgeEls.forEach(function (e) { e.el.classList.remove('is-on'); });
      return;
    }
    graphSvg.classList.add('is-focus');
    var linked = {};
    linked[name] = true;
    edgeEls.forEach(function (e) {
      var on = e.a === name || e.b === name;
      e.el.classList.toggle('is-on', on);
      if (on) { linked[e.a] = true; linked[e.b] = true; }
    });
    Object.keys(nodeEls).forEach(function (k) { nodeEls[k].classList.toggle('is-on', !!linked[k]); });
  }

  function buildLegend() {
    var box = el('div', { 'class': 'sh-legend', role: 'list', 'aria-label': '连线图例' });
    D.relTypes.forEach(function (t) {
      var st = TYPE_STYLE[t.name] || TYPE_STYLE['说法不一'];
      var sample = svg('svg', { width: 44, height: 12, viewBox: '0 0 44 12', 'aria-hidden': 'true' });
      sample.appendChild(svg('line', { x1: 2, y1: 6, x2: 42, y2: 6, stroke: st.color, 'stroke-width': st.width, 'stroke-dasharray': st.dash || 'none', 'stroke-linecap': 'round' }));
      box.appendChild(el('div', { 'class': 'sh-legend-item', role: 'listitem' }, [
        sample,
        el('span', { 'class': 'sh-legend-name', text: t.name }),
        el('span', { 'class': 'sh-legend-line', text: t.line })
      ]));
    });
    return box;
  }

  /* ---------- 故事长卷 ---------- */
  function personChip(name) {
    var b = el('button', { type: 'button', 'class': 'sh-chip', text: name });
    b.style.borderColor = GROUP_COLOR[(byName[name] || {}).group] || '';
    b.addEventListener('click', function () { openDetail(name, true); });
    return b;
  }

  function buildStories() {
    var ol = el('ol', { 'class': 'sh-stories' });
    D.stories.forEach(function (st, i) {
      var li = el('li', { 'class': 'sh-story' });
      li.appendChild(el('span', { 'class': 'sh-story-no', 'aria-hidden': 'true', text: String(i + 1) }));
      var body = el('div', { 'class': 'sh-story-body' });
      body.appendChild(el('h3', { 'class': 'sh-story-title', text: st.title }));
      body.appendChild(el('p', { 'class': 'sh-story-meaning', text: '含义：' + st.meaning }));
      body.appendChild(el('p', { 'class': 'sh-story-text', text: st.text }));
      body.appendChild(el('p', { 'class': 'sh-story-source', text: '出处：' + st.source }));
      if (st.tip) body.appendChild(el('p', { 'class': 'sh-story-tip', text: st.tip }));
      body.appendChild(el('div', { 'class': 'sh-story-people' }, [el('span', { 'class': 'sl-origin-label', text: '人物' })].concat(st.people.map(personChip))));
      li.appendChild(body);
      ol.appendChild(li);
    });
    return ol;
  }

  /* ---------- 详情弹窗 ---------- */
  var dialog, dialogBody, lastFocus = null;

  function field(label, text, cls) {
    return el('div', { 'class': 'sl-field' + (cls ? ' ' + cls : '') }, [el('dt', { text: label }), el('dd', { text: text })]);
  }

  function imageSlot(p) {
    var box = el('div', { 'class': 'sl-image' });
    if (IMAGES[p.name]) {
      box.appendChild(el('img', { src: IMAGES[p.name], alt: p.name + '画像', loading: 'lazy' }));
    } else {
      box.classList.add('is-empty');
      box.appendChild(el('span', { 'class': 'sl-image-note', text: '配图待补 · ' + p.name }));
    }
    return box;
  }

  function renderDetail(p) {
    dialogBody.textContent = '';
    dialogBody.appendChild(imageSlot(p));
    var inner = el('div', { 'class': 'sl-detail' });
    inner.appendChild(el('div', { 'class': 'sl-detail-kicker', text: p.group }));
    var title = el('h2', { 'class': 'sl-detail-title', id: 'sl-title', text: p.full || p.name });
    title.style.color = GROUP_COLOR[p.group] || '';
    inner.appendChild(title);
    inner.appendChild(el('p', { 'class': 'sl-detail-line', text: p.line }));

    var dl = el('dl', { 'class': 'sl-fields' });
    dl.appendChild(field('身份', p.role));
    dl.appendChild(field('故事', p.story));
    inner.appendChild(dl);

    var dl2 = el('dl', { 'class': 'sl-fields' });
    dl2.appendChild(field('主要出处', p.source));
    if (p.allusion) dl2.appendChild(field('典故', p.allusion, 'is-custom'));
    inner.appendChild(dl2);

    if (p.note) {
      inner.appendChild(el('div', { 'class': 'tip-box sl-note' }, [el('div', { 'class': 'tip-label', text: '辨析' }), el('p', { text: p.note })]));
    }

    /* 和这位人物有关的连线 */
    var rel = [];
    D.relations.forEach(function (r) {
      if (r.from === p.name) rel.push({ other: r.to, type: r.type, label: r.label, dir: r.undirected ? '—' : '→' });
      else if (r.to === p.name) rel.push({ other: r.from, type: r.type, label: r.label, dir: r.undirected ? '—' : '←' });
    });
    if (rel.length) {
      var list = el('ul', { 'class': 'sh-rel-list' });
      rel.forEach(function (r) {
        var st = TYPE_STYLE[r.type] || TYPE_STYLE['说法不一'];
        var b = el('button', { type: 'button', 'class': 'sh-rel-btn' }, [
          el('span', { 'class': 'sh-rel-type', text: r.type }),
          el('span', { 'class': 'sh-rel-arrow', text: r.dir }),
          el('span', { 'class': 'sh-rel-name', text: (byName[r.other] || {}).full || r.other }),
          el('span', { 'class': 'sh-rel-label', text: r.label })
        ]);
        b.firstChild.style.color = st.color;
        b.addEventListener('click', function () { openDetail(r.other, false); });
        list.appendChild(el('li', {}, b));
      });
      inner.appendChild(el('div', { 'class': 'sl-fields' }, [el('div', { 'class': 'sl-origin-label', text: '和谁有关' }), list]));
    }

    if (p.see.length) {
      var see = el('div', { 'class': 'sl-origin' }, [el('span', { 'class': 'sl-origin-label', text: '另见' })]);
      p.see.forEach(function (s) {
        var href = PAGE_LINKS[s.page];
        if (href) see.appendChild(el('a', { 'class': 'sl-syslink', href: href + '?id=' + encodeURIComponent(s.id), text: s.page + ' · ' + s.id + ' →' }));
        else see.appendChild(el('span', { 'class': 'sl-syslink is-soon', text: s.page + ' · ' + s.id + ' · 页面制作中' }));
      });
      inner.appendChild(see);
    }

    dialogBody.appendChild(inner);
    dialog.setAttribute('aria-labelledby', 'sl-title');
  }

  function setUrl(name) {
    try {
      var u = new URL(window.location.href);
      if (name) u.searchParams.set('id', name); else u.searchParams.delete('id');
      window.history.replaceState(null, '', u.toString());
    } catch (e) { /* 忽略：地址栏不能改也不影响使用 */ }
  }

  function openDetail(name, fromClick) {
    var p = byName[name];
    if (!p) return;
    if (fromClick) lastFocus = document.activeElement;
    renderDetail(p);
    if (!dialog.open) {
      if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
    }
    dialogBody.scrollTop = 0;
    setUrl(name);
  }

  function closeDetail() {
    if (dialog.open) { if (dialog.close) dialog.close(); else dialog.removeAttribute('open'); }
  }

  /* ---------- 三皇五帝 ---------- */
  function buildSanhuang() {
    var S = D.sanhuang;
    var box = el('div', { 'class': 'sh-huang' });
    box.appendChild(el('p', { 'class': 'xx-intro', text: S.intro }));
    var grid = el('div', { 'class': 'xx-uses' }, S.huang.map(function (h) {
      return el('div', { 'class': 'xx-use' }, [el('h3', { text: h.way }), el('p', { 'class': 'sh-huang-names', text: h.names }), el('p', { text: h.focus })]);
    }));
    box.appendChild(el('div', { 'class': 'sh-huang-head', text: '三皇的常见说法' }));
    box.appendChild(grid);
    box.appendChild(el('p', { 'class': 'sl-origin-note', text: S.huangExtra }));
    box.appendChild(el('div', { 'class': 'sh-huang-head', text: '五帝的常见说法' }));
    box.appendChild(el('p', { 'class': 'xx-intro', text: S.diText }));
    box.appendChild(el('div', { 'class': 'xx-uses' }, S.diWays.map(function (w) {
      return el('div', { 'class': 'xx-use' }, [el('h3', { text: w.title }), el('p', { text: w.text })]);
    })));
    box.appendChild(el('p', { 'class': 'xx-intro', text: S.outro }));
    return box;
  }

  /* ---------- 页面 ---------- */
  var views = {}, tabs = {};
  function showView(name) {
    Object.keys(views).forEach(function (k) {
      views[k].hidden = k !== name;
      tabs[k].classList.toggle('is-on', k === name);
      tabs[k].setAttribute('aria-selected', k === name ? 'true' : 'false');
    });
    try {
      var u = new URL(window.location.href);
      if (name === 'story') u.searchParams.set('view', 'story'); else u.searchParams.delete('view');
      window.history.replaceState(null, '', u.toString());
    } catch (e) { /* 忽略 */ }
  }

  function render() {
    var page = el('div', { 'class': 'xx-page sl-page' });

    page.appendChild(el('div', { 'class': 'xx-head' }, [
      el('div', { 'class': 'xx-eyebrow', text: '神 · 上古神话' }),
      el('h1', { 'class': 'xx-hook', text: D.hook }),
      el('p', { 'class': 'xx-answer', text: D.answer })
    ]));
    page.appendChild(el('section', { 'class': 'xx-section' }, [el('p', { 'class': 'xx-intro', text: D.intro })]));

    /* 两个视图 */
    var tabBar = el('div', { 'class': 'sh-tabs', role: 'tablist', 'aria-label': '选择视图' });
    [['graph', '关系图谱'], ['story', '故事长卷']].forEach(function (t) {
      var b = el('button', { type: 'button', 'class': 'sh-tab', role: 'tab', text: t[1], 'aria-selected': 'false' });
      b.addEventListener('click', function () { showView(t[0]); });
      tabs[t[0]] = b;
      tabBar.appendChild(b);
    });

    var graphView = el('div', { 'class': 'sh-view', role: 'tabpanel' }, [
      buildLegend(),
      el('p', { 'class': 'sh-hint', text: '手指或鼠标放在人物上，会突出他的关系；点一下，看详情。窄屏可以左右滑动。' }),
      el('div', { 'class': 'sh-graph-wrap' }, [buildGraph()])
    ]);
    var storyView = el('div', { 'class': 'sh-view', role: 'tabpanel', hidden: 'hidden' }, [buildStories()]);
    views.graph = graphView;
    views.story = storyView;
    page.appendChild(el('section', { 'class': 'xx-section', 'aria-label': '上古神话' }, [tabBar, graphView, storyView]));

    page.appendChild(el('section', { 'class': 'xx-section' }, [el('div', { 'class': 'section-title', text: '三皇五帝，到底是谁' }), buildSanhuang()]));

    page.appendChild(el('section', { 'class': 'xx-section' }, [
      el('div', { 'class': 'section-title', text: '怎么读上古神话' }),
      el('ol', { 'class': 'xx-steps' }, D.readingTips.map(function (t, i) {
        return el('li', { 'class': 'xx-step' }, [
          el('span', { 'class': 'xx-step-no', 'aria-hidden': 'true', text: String(i + 1) }),
          el('div', {}, [el('p', { text: t })])
        ]);
      }))
    ]));

    page.appendChild(el('section', { 'class': 'xx-section' }, [
      el('div', { 'class': 'section-title', text: '常见误读' }),
      el('div', { 'class': 'xx-misreads' }, D.misreads.map(function (m) {
        return el('details', { 'class': 'xx-misread' }, [el('summary', { text: m.title }), el('p', { text: m.text })]);
      }))
    ]));

    page.appendChild(el('div', { 'class': 'tip-box' }, [el('div', { 'class': 'tip-label', text: '小提示' }), el('p', { text: D.tip })]));

    page.appendChild(el('details', { 'class': 'notes' }, [
      el('summary', { text: '批注' }),
      el('div', { 'class': 'notes-body' }, D.notes.map(function (n) {
        var m = n.match(/^([^：]{1,4})：(.*)$/);
        return el('p', {}, m ? [el('span', { 'class': 'note-label', text: m[1] }), document.createTextNode(m[2])] : [document.createTextNode(n)]);
      }))
    ]));

    dialog = el('dialog', { 'class': 'sl-dialog', 'aria-label': '人物详情' });
    var close = el('button', { type: 'button', 'class': 'sl-close', 'aria-label': '关闭', text: '×' });
    close.addEventListener('click', closeDetail);
    dialogBody = el('div', { 'class': 'sl-dialog-body' });
    dialog.appendChild(close);
    dialog.appendChild(dialogBody);
    dialog.addEventListener('click', function (e) { if (e.target === dialog) closeDetail(); });
    dialog.addEventListener('close', function () {
      setUrl(null);
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* 忽略 */ } }
    });
    page.appendChild(dialog);

    root.textContent = '';
    root.appendChild(page);

    var view = 'graph';
    try {
      var u = new URL(window.location.href);
      if (u.searchParams.get('view') === 'story') view = 'story';
      showView(view);
      var id = u.searchParams.get('id');
      if (id && byName[id]) openDetail(id, false);
    } catch (e) { showView(view); }
  }

  render();
})();
