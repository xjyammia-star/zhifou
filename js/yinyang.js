/* 知否知否 · 礼与思 · 阴阳五行与八卦页
   数据：data/ls-yinyang.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js
   自己画的部件：阴阳鱼图、五行图（相生相克，从文案里的“木生火……”读出来）、八卦和六十四卦（用线条画，不依赖字体，可点选）、河图洛书。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_LS_YINYANG, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;
  var el = Z.el;

  /* ---------- 阴阳鱼图（太极图）：用 SVG 画，左边是图，右边是三张读图卡 ---------- */
  function taiji(D2, tabKey) {
    var s = LS.S(D2, '阴阳鱼图');
    var svg = LS.svgEl('svg', { viewBox: '0 0 200 200', role: 'img', 'aria-label': '阴阳鱼图：一个圆分成一黑一白两半，黑里有一点白，白里有一点黑' });
    function add(tag, attrs) { svg.appendChild(LS.svgEl(tag, attrs)); }
    add('circle', { cx: 100, cy: 100, r: 92, 'class': 'ls-tj-light' });
    add('path', { d: 'M100 8 A92 92 0 0 1 100 192 A46 46 0 0 0 100 100 A46 46 0 0 1 100 8 Z', 'class': 'ls-tj-dark' });
    add('circle', { cx: 100, cy: 54, r: 12, 'class': 'ls-tj-light' });
    add('circle', { cx: 100, cy: 146, r: 12, 'class': 'ls-tj-dark' });
    add('circle', { cx: 100, cy: 100, r: 92, 'class': 'ls-tj-ring' });
    [['阳', 48, 'is-on-light'], ['阴', 152, 'is-on-dark']].forEach(function (t) {
      var n = LS.svgEl('text', { x: t[1], y: 100, 'class': 'ls-tj-txt ' + t[2] });
      n.textContent = t[0];
      svg.appendChild(n);
    });
    var cards = LS.grid(s.items.map(function (it) {
      var m = Z.fmap(it.f);
      return LS.mk(tabKey, it.name, { isStatic: true, body: [el('p', { 'class': 'ls-plain', text: m['说明'] || '' })] });
    }));
    return Z.section('阴阳鱼图', [
      el('div', { 'class': 'ls-wx' }, [
        el('div', { 'class': 'ls-wx-svg zy-paper' }, [svg]),
        el('div', { 'class': 'ls-wx-side' }, [Z.note(s.bold['说明']), cards])
      ])
    ]);
  }

  /* ---------- 五行图 ---------- */
  var ORDER = ['木', '火', '土', '金', '水'];
  var COLOR = { '木': '#4f7a3f', '火': '#b4432d', '土': '#946a20', '金': '#6f747d', '水': '#2f5f8a' };
  function wuxing(D2, tabKey) {
    var edges = [];
    LS.S(D2, '相生与相克').items.forEach(function (it) {
      var t = Z.fmap(it.f)['顺序'] || '', re = /([木火土金水])([生克])([木火土金水])/g, m;
      while ((m = re.exec(t))) edges.push({ a: m[1], b: m[3], kind: m[2] === '生' ? 'sheng' : 'ke' });
    });
    var attr = {}, pei = {};
    LS.S(D2, '五行的五个类别').items.forEach(function (it) { attr[it.name] = Z.fmap(it.f); });
    LS.S(D2, '五行的配属').items.forEach(function (it) { pei[it.name] = Z.fmap(it.f); });

    var CX = 160, CY = 160, R = 108, NR = 27;
    function pos(n) { var i = ORDER.indexOf(n), a = (-90 + 72 * i) * Math.PI / 180; return [CX + R * Math.cos(a), CY + R * Math.sin(a)]; }
    var svg = LS.svgEl('svg', { viewBox: '0 0 320 320', role: 'img', 'aria-label': '五行相生相克图：五个字排成一圈，实线箭头是相生，虚线箭头是相克' });
    var defs = LS.svgEl('defs');
    [['s', '#7a4520'], ['k', '#a83a2c']].forEach(function (p) {
      var mkr = LS.svgEl('marker', { id: 'ls-ar-' + p[0], viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto' });
      mkr.appendChild(LS.svgEl('path', { d: 'M0,0 L10,5 L0,10 z', fill: p[1] }));
      defs.appendChild(mkr);
    });
    svg.appendChild(defs);
    edges.forEach(function (e) {
      var p1 = pos(e.a), p2 = pos(e.b), dx = p2[0] - p1[0], dy = p2[1] - p1[1], len = Math.sqrt(dx * dx + dy * dy), ux = dx / len, uy = dy / len;
      e.node = LS.svgEl('line', {
        x1: p1[0] + ux * (NR + 3), y1: p1[1] + uy * (NR + 3), x2: p2[0] - ux * (NR + 7), y2: p2[1] - uy * (NR + 7),
        'class': 'ls-edge is-' + e.kind, 'marker-end': 'url(#ls-ar-' + (e.kind === 'sheng' ? 's' : 'k') + ')'
      });
      svg.appendChild(e.node);
    });
    var ch = null;
    var nodes = ORDER.map(function (n, i) {
      var p = pos(n), g = LS.svgEl('g', { 'class': 'ls-node' });
      g.appendChild(LS.svgEl('circle', { cx: p[0], cy: p[1], r: NR, fill: COLOR[n] }));
      var t = LS.svgEl('text', { x: p[0], y: p[1] });
      t.textContent = n;
      g.appendChild(t);
      g.addEventListener('click', function () { ch.pick(i); });
      svg.appendChild(g);
      return g;
    });

    var panel = el('div', { 'class': 'zy-detail zy-paper', 'aria-live': 'polite' });
    function out(n, kind) { return edges.filter(function (e) { return e.kind === kind && e.a === n; }).map(function (e) { return e.b; }).join('、'); }
    function inn(n, kind) { return edges.filter(function (e) { return e.kind === kind && e.b === n; }).map(function (e) { return e.a; }).join('、'); }
    function show(i) {
      var n = ORDER[i], a = attr[n] || {}, p = pei[n] || {};
      edges.forEach(function (e) { e.node.setAttribute('class', 'ls-edge is-' + e.kind + (e.a === n || e.b === n ? '' : ' is-dim')); });
      nodes.forEach(function (g, j) { g.setAttribute('class', 'ls-node' + (j === i ? ' is-sel' : '')); });
      panel.textContent = '';
      panel.appendChild(el('div', { 'class': 'zy-kicker', text: '五行 · ' + (i + 1) + ' / ' + ORDER.length }));
      panel.appendChild(el('h3', { text: n }));
      panel.appendChild(el('p', { 'class': 'zy-oneline', text: n + '生' + out(n, 'sheng') + '，' + n + '克' + out(n, 'ke') + '。' }));
      panel.appendChild(Z.kv([
        ['我生', n + ' 生 ' + out(n, 'sheng')],
        ['生我', inn(n, 'sheng') + ' 生 ' + n],
        ['我克', n + ' 克 ' + out(n, 'ke')],
        ['克我', inn(n, 'ke') + ' 克 ' + n],
        ['常见属性', a['常见属性']],
        ['方位与季节', a['方位'] || a['季节'] ? (a['方位'] || '') + '　' + (a['季节'] || '') : ''],
        ['颜色', p['颜色']],
        ['五音', p['五音']],
        ['脏腑（中医传统）', p['脏腑（中医传统）']]
      ]));
    }
    ch = Z.chips(ORDER, show, { aria: '五行' });
    ch.pick(0);
    var legend = el('div', { 'class': 'ls-legend' }, [
      el('span', {}, [el('i'), '相生：箭头指向被生的']),
      el('span', {}, [el('i', { 'class': 'is-ke' }), '相克：箭头指向被克的'])
    ]);
    return Z.section('五行图：点一个字，看它生谁、克谁', [
      el('div', { 'class': 'ls-wx' }, [
        el('div', { 'class': 'ls-wx-svg zy-paper' }, [svg, legend]),
        el('div', { 'class': 'ls-wx-side' }, [ch.node, panel])
      ])
    ]);
  }

  /* ---------- 八卦：八张卡（点一张，下面显示它的全部“象”） ---------- */
  function bagua(D2, tabKey) {
    var s = LS.S(D2, '八个卦'), intro = LS.S(D2, '八卦');
    var more = intro.items[0] ? Z.fmap(intro.items[0].f)['说明'] : '';
    var panel = el('div', { 'class': 'zy-detail zy-paper ls-gpanel', 'aria-live': 'polite' }), btns = [];
    function show(i) {
      var it = s.items[i], m = Z.fmap(it.f);
      btns.forEach(function (b, j) { b.classList.toggle('is-sel', j === i); b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      panel.textContent = '';
      panel.appendChild(el('div', { 'class': 'zy-kicker', text: '八卦 · ' + (i + 1) + ' / ' + s.items.length }));
      panel.appendChild(el('div', { 'class': 'ls-hexlines' }, [
        LS.trigram(m['符号'] || ''),
        el('div', {}, [el('h3', { 'class': 'ls-hxtitle', text: it.name }), el('p', { 'class': 'zy-oneline', text: m['一句话'] || '' })])
      ]));
      panel.appendChild(Z.kv([
        ['自然象', m['自然象']], ['卦德（《说卦》）', m['卦德']], ['家庭象', m['家庭象']], ['动物', m['动物']], ['身体', m['身体']],
        ['五行（后世常见）', String(m['五行'] || '').replace('（后世常见）', '')], ['先天数与方位', (m['先天数'] || '') + '　位于' + (m['先天方位'] || '')], ['后天方位（常见）', m['常见方位']]
      ]));
    }
    btns = s.items.map(function (it, i) {
      var m = Z.fmap(it.f);
      var b = el('button', { 'class': 'ls-gua zy-paper', type: 'button', 'aria-pressed': 'false' }, [
        LS.trigram(m['符号'] || ''),
        el('div', { 'class': 'ls-gua-name', text: it.name }),
        el('div', { 'class': 'ls-gua-nat', text: '自然象：' + (m['自然象'] || '') }),
        el('div', { 'class': 'ls-gua-sub', text: '卦德：' + (m['卦德'] || '') })
      ]);
      b.addEventListener('click', function () { show(i); });
      return LS.reg(tabKey, it.name, b, function () { show(i); });
    });
    show(0);
    return Z.section('八个卦：点一个，看它的全部“象”', [Z.note(intro.bold['说明']), Z.note(more), el('div', { 'class': 'ls-guas' }, btns), panel]);
  }

  /* ---------- 六十四卦：64 个小按钮，点一个看卦画、全称、卦辞、大象 ---------- */
  function hexes(D2, tabKey) {
    var s = LS.S(D2, '六十四卦'), items = s.items, names = items.map(function (x) { return x.name; });
    var panel = el('div', { 'class': 'zy-detail zy-paper', 'aria-live': 'polite' }), btns = [];
    function tri(x) { return String(x || '').charAt(0); }
    function show(i) {
      var it = items[i], m = Z.fmap(it.f), up = tri(m['上卦']), dn = tri(m['下卦']);
      btns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      panel.textContent = '';
      panel.appendChild(el('div', { 'class': 'zy-kicker', text: '第 ' + (i + 1) + ' 卦 / 64 · ' + (i < 30 ? '上经' : '下经') }));
      panel.appendChild(el('div', { 'class': 'ls-hexlines' }, [
        LS.hexagram(up, dn),
        el('div', {}, [el('h3', { 'class': 'ls-hxtitle', text: m['全称'] || it.name }), el('p', { 'class': 'zy-oneline', text: '上卦 ' + m['上卦'] + '，下卦 ' + m['下卦'] })])
      ]));
      panel.appendChild(Z.kv([['卦辞', m['卦辞']], ['大象', m['大象']]], { quote: ['卦辞', '大象'] }));
      panel.appendChild(Z.prevNext(names, i, show));
    }
    btns = items.map(function (it, i) {
      var m = Z.fmap(it.f);
      var b = el('button', { 'class': 'ls-hexbtn', type: 'button', 'aria-pressed': 'false', title: m['全称'] || it.name }, [
        LS.hexagram(tri(m['上卦']), tri(m['下卦']), true), el('b', { text: String(i + 1) }), el('span', { text: it.name })
      ]);
      b.addEventListener('click', function () { show(i); });
      return LS.reg(tabKey, it.name + '卦', b, function () { show(i); });
    });
    show(0);
    return Z.section('六十四卦', [Z.note(s.bold['说明']), el('div', { 'class': 'ls-hx' }, [el('div', { 'class': 'ls-hexbtns' }, btns), el('div', { 'class': 'ls-hx-side' }, [panel])])]);
  }

  /* ---------- 河图洛书：文字说明 + 洛书九宫格 + 河图方位表 ---------- */
  function hetuluo(D2, tabKey) {
    var base = LS.block(D2, tabKey, { sec: '河图与洛书', grid: 'is-wide' });
    var m = {};
    LS.S(D2, '河图与洛书').items.forEach(function (it) { m[it.name] = Z.fmap(it.f); });
    var cells = ((m['洛书'] || {})['九宫'] || '').split('／').join('').split('');
    var luo = el('div', {}, [el('h4', { text: '洛书九宫' }), el('div', { 'class': 'ls-lsgrid' }, cells.map(function (ch, k) { return el('div', { 'class': k === 4 ? 'is-mid' : '', text: ch }); }))]);
    var WX = { '北': '水', '南': '火', '东': '木', '西': '金', '中': '土' }, hd = ['方位', '生数', '成数', '五行'], rows = [], re = /([一二三四五六七八九十])([一二三四五六七八九十])居([东南西北中])/g, r;
    var txt = (m['河图'] || {})['点数'] || '';
    hd.forEach(function (h) { rows.push(el('span', { 'class': 'zy-kicker', text: h })); });
    while ((r = re.exec(txt))) { rows.push(el('b', { text: r[3] }), el('span', { text: r[1] }), el('span', { text: r[2] }), el('span', { text: WX[r[3]] })); }
    var he = el('div', {}, [el('h4', { text: '河图：方位与数' }), el('div', { 'class': 'ls-hetu' }, rows)]);
    base.appendChild(el('div', { 'class': 'ls-tuwrap zy-paper' }, [luo, he]));
    return base;
  }

  var MORE_COLS = [['五行', '@name'], ['天干', '天干'], ['五星', '五星'], ['五味', '五味']];
  var YUELING_COLS = [['五行', '@name'], ['四时', '四时'], ['帝', '帝'], ['神', '神'], ['虫（动物大类）', '虫'], ['祀', '祀'], ['数', '数']];

  LS.mkPage({
    D: D,
    eyebrow: '礼与思 · 阴阳五行与八卦',
    title: '阴阳五行与八卦',
    srcSec: '原典阅读清单',
    tabs: [
      { key: 'yin', label: '阴阳', blocks: [
        { sec: '阴阳', grid: 'is-wide' },
        { custom: taiji },
        { sec: '阴阳的四个特点' },
        { sec: '阴阳成对的例子', kind: 'table', cols: [['成对', '@name'], ['属阳', '属阳'], ['属阴', '属阴'], ['说明', '说明']], wide: true },
        { sec: '阴阳用在哪里' },
        { sec: '阴阳的出处', grid: 'is-wide' },
        { sec: '阴阳的三点辨析', grid: 'is-3' }
      ] },
      { key: 'wu', label: '五行', blocks: [
        { sec: '五行', grid: 'is-wide' },
        { custom: wuxing },
        { sec: '五行的五个类别', kind: 'table', cols: [['五行', '@name'], ['常见属性', '常见属性'], ['方位', '方位'], ['季节', '季节']] },
        { sec: '《洪范》里的五行' },
        { sec: '相生与相克', grid: 'is-wide' },
        { sec: '相乘与相侮', grid: 'is-3' },
        { sec: '五行的配属', kind: 'table', cols: [['五行', '@name'], ['颜色', '颜色'], ['五音', '五音'], ['四时与方位', '四时与方位'], ['脏腑（中医传统）', '脏腑（中医传统）']] },
        { sec: '五行的更多配属', kind: 'table', cols: MORE_COLS },
        { sec: '《月令》里的五行配属', kind: 'table', cols: YUELING_COLS },
        { sec: '五行的出处', grid: 'is-wide' }
      ] },
      { key: 'gua', label: '八卦与六十四卦', blocks: [
        { sec: '八卦', custom: function (D2, tabKey) { return bagua(D2, tabKey); } },
        { sec: '八卦的出处', grid: 'is-wide' },
        { sec: '八卦与六十四卦', grid: 'is-wide' },
        { custom: hexes }
      ] },
      { key: 'tu', label: '图式与常见说法', blocks: [
        { sec: '先天八卦与后天八卦', grid: 'is-wide' },
        { custom: hetuluo },
        { sec: '图式与器物的辨析', grid: 'is-3' },
        { sec: '三者的关系', kind: 'table', cols: [['概念', '@name'], ['核心问题', '核心问题'], ['早期主要材料', '早期主要材料'], ['后世发展', '后世发展']] }
      ] }
    ]
  });
})();
