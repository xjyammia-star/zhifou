/* 知否知否 · 礼与思 · 阴阳五行与八卦页
   数据：data/ls-yinyang.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js
   三个自己画的部件：五行图（相生相克，从文案里的“木生火……”读出来）、八卦（用线条画，不依赖字体）、六十四卦卦名。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_LS_YINYANG, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;
  var el = Z.el;

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

  /* ---------- 八卦：八张卡，用线条画卦 ---------- */
  function bagua(D2, tabKey) {
    var s = LS.S(D2, '八个卦'), intro = LS.S(D2, '八卦');
    var more = intro.items[0] ? Z.fmap(intro.items[0].f)['说明'] : '';
    return Z.section('八个卦', [Z.note(intro.bold['说明']), Z.note(more), el('div', { 'class': 'ls-guas' }, s.items.map(function (it) {
      var m = Z.fmap(it.f);
      var card = el('div', { 'class': 'ls-gua zy-paper' }, [
        LS.trigram(m['符号'] || ''),
        el('div', { 'class': 'ls-gua-name', text: it.name }),
        el('div', { 'class': 'ls-gua-nat', text: '自然象：' + (m['自然象'] || '') }),
        el('div', { 'class': 'ls-gua-sub', text: '方位：' + (m['常见方位'] || '') }),
        el('div', { 'class': 'ls-gua-sub', text: '家庭象：' + (m['家庭象'] || '') })
      ]);
      return LS.reg(tabKey, it.name, card);
    }))]);
  }

  /* ---------- 六十四卦的卦名 ---------- */
  function hexes(D2) {
    var s = LS.S(D2, '六十四卦的卦名'), n = 0;
    var rows = s.items.map(function (it) {
      var names = (Z.fmap(it.f)['卦名'] || '').split('、').filter(Boolean), start = n + 1;
      n += names.length;
      return el('div', { 'class': 'ls-hexgroup zy-paper' }, [
        el('div', { 'class': 'ls-hexlabel', text: '第 ' + start + '–' + n + ' 卦' }),
        el('div', { 'class': 'ls-hexnames' }, names.map(function (nm, i) { return el('span', { 'class': 'ls-hex' }, [el('b', { text: String(start + i) }), nm]); }))
      ]);
    });
    return Z.section('六十四卦的卦名', [Z.note(s.bold['说明'])].concat(rows));
  }

  LS.mkPage({
    D: D,
    eyebrow: '礼与思 · 阴阳五行与八卦',
    title: '阴阳五行与八卦',
    srcSec: '原典阅读清单',
    tabs: [
      { key: 'yin', label: '阴阳', blocks: [
        { sec: '阴阳', grid: 'is-wide' },
        { sec: '阴阳的出处', grid: 'is-wide' },
        { sec: '阴阳的三点辨析', grid: 'is-3' }
      ] },
      { key: 'wu', label: '五行', blocks: [
        { sec: '五行', grid: 'is-wide' },
        { custom: wuxing },
        { sec: '五行的五个类别', kind: 'table', cols: [['五行', '@name'], ['常见属性', '常见属性'], ['方位', '方位'], ['季节', '季节']] },
        { sec: '相生与相克', grid: 'is-wide' },
        { sec: '五行的配属', kind: 'table', cols: [['五行', '@name'], ['颜色', '颜色'], ['五音', '五音'], ['四时与方位', '四时与方位'], ['脏腑（中医传统）', '脏腑（中医传统）']] },
        { sec: '五行的出处', grid: 'is-wide' }
      ] },
      { key: 'gua', label: '八卦与六十四卦', blocks: [
        { sec: '八卦', title: '八卦是什么', grid: 'is-wide', custom: function (D2, tabKey) { return bagua(D2, tabKey); } },
        { sec: '八卦的出处', grid: 'is-wide' },
        { sec: '八卦与六十四卦', grid: 'is-wide' },
        { custom: hexes }
      ] },
      { key: 'tu', label: '图式与常见说法', blocks: [
        { sec: '先天八卦与后天八卦', grid: 'is-wide' },
        { sec: '河图与洛书', grid: 'is-wide' },
        { sec: '图式与器物的辨析', grid: 'is-3' },
        { sec: '三者的关系', kind: 'table', cols: [['概念', '@name'], ['核心问题', '核心问题'], ['早期主要材料', '早期主要材料'], ['后世发展', '后世发展']] }
      ] }
    ]
  });
})();
