/* 知否知否 · "物"·中国古代建筑（园林页）脚本
   数据来自 data/yuanlin.js（window.ZHIFOU_YUANLIN），本文件只负责排版和交互。
   七种构景手法的小示意图、一池三山图是固定的线稿，文字来自数据。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_YUANLIN;
  var root = document.getElementById('app');
  if (!D || !root) return;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (Array.isArray(kids) ? kids : (kids ? [kids] : [])).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function figure(svgHtml, cls) {
    var f = el('div', { 'class': 'mg-fig ' + (cls || '') });
    f.innerHTML = svgHtml;
    return f;
  }

  var RED = '#b23a2e', TILE = '#3d3a36', WALL = '#efe3c8', WALL_D = '#8f7a55', GREEN = '#8fb08a', WATER = '#8fb3c8', WATER_D = '#5f8a9c',
    MOUNT = '#a9c4b6', SCENE = '#dbe7dc', GOLD = '#e8c46a', PATH = '#c9a56b', STONE = '#b9b1a0';

  /* ---------- 七种构景手法的小示意图（200 × 130） ---------- */
  var ART = {
    jiejing:
      '<rect x="0" y="104" width="200" height="26" fill="#e2d5b5"/>' +
      '<polygon points="98,90 142,40 190,90" fill="' + MOUNT + '"/>' +
      '<rect x="146" y="42" width="8" height="48" fill="' + PATH + '"/><polygon points="140,54 150,46 160,54" fill="' + TILE + '"/><polygon points="142,68 150,60 158,68" fill="' + TILE + '"/>' +
      '<rect x="66" y="84" width="134" height="14" fill="' + WALL + '" stroke="' + WALL_D + '"/>' +
      '<polygon points="10,68 34,52 58,68" fill="' + TILE + '"/><rect x="16" y="68" width="4" height="30" fill="' + RED + '"/><rect x="48" y="68" width="4" height="30" fill="' + RED + '"/><rect x="8" y="98" width="56" height="6" fill="' + STONE + '"/>' +
      '<circle cx="34" cy="92" r="5" fill="' + RED + '"/>' +
      '<path d="M40 88 Q90 56 144 54" fill="none" stroke="' + RED + '" stroke-width="1.6" stroke-dasharray="4 3"/><circle cx="144" cy="54" r="3" fill="' + RED + '"/>',
    kuangjing:
      '<defs><clipPath id="ylClipK"><circle cx="100" cy="65" r="33"/></clipPath></defs>' +
      '<rect x="24" y="10" width="152" height="110" fill="' + WALL + '" stroke="' + WALL_D + '"/>' +
      '<g clip-path="url(#ylClipK)"><rect x="60" y="28" width="80" height="80" fill="#e8f1ea"/><polygon points="66,100 100,52 134,100" fill="' + MOUNT + '"/>' +
      '<rect x="84" y="70" width="4" height="26" fill="#6d4d34"/><circle cx="86" cy="64" r="11" fill="' + GREEN + '"/><polygon points="106,82 120,72 134,82" fill="' + TILE + '"/><rect x="110" y="82" width="20" height="14" fill="' + WALL + '"/></g>' +
      '<circle cx="100" cy="65" r="36" fill="none" stroke="' + WALL_D + '" stroke-width="5"/>',
    duijing:
      '<ellipse cx="100" cy="66" rx="62" ry="30" fill="' + WATER + '" stroke="' + WATER_D + '"/>' +
      '<rect x="18" y="54" width="24" height="24" fill="' + GOLD + '" stroke="#a8842f" stroke-width="2"/><path d="M18 54 L42 78 M42 54 L18 78" stroke="#a8842f"/>' +
      '<rect x="158" y="54" width="24" height="24" fill="' + GOLD + '" stroke="#a8842f" stroke-width="2"/><path d="M158 54 L182 78 M182 54 L158 78" stroke="#a8842f"/>' +
      '<path d="M46 66 H154" stroke="' + RED + '" stroke-width="1.6" stroke-dasharray="4 3" fill="none"/><polygon points="46,66 54,62 54,70" fill="' + RED + '"/><polygon points="154,66 146,62 146,70" fill="' + RED + '"/>',
    zhangjing:
      '<rect x="20" y="10" width="160" height="110" fill="' + WALL + '" stroke="' + WALL_D + '"/>' +
      '<rect x="84" y="16" width="32" height="22" fill="' + GOLD + '" stroke="#a8842f" stroke-width="2"/>' +
      '<path d="M100 116 V102 Q100 92 70 84 Q46 76 46 46 Q46 28 82 28" fill="none" stroke="' + PATH + '" stroke-width="7" stroke-linecap="round"/>' +
      '<ellipse cx="100" cy="66" rx="26" ry="14" fill="' + STONE + '" stroke="#8f887a" stroke-width="2"/>' +
      '<circle cx="100" cy="114" r="5" fill="' + RED + '"/><path d="M100 106 V82" stroke="' + RED + '" stroke-width="1.6" stroke-dasharray="4 3" fill="none"/>',
    loujing:
      '<rect x="24" y="12" width="152" height="106" fill="' + WALL + '" stroke="' + WALL_D + '"/>' +
      '<rect x="66" y="30" width="68" height="60" fill="' + SCENE + '" stroke="' + WALL_D + '" stroke-width="4"/>' +
      '<circle cx="82" cy="64" r="12" fill="' + GREEN + '"/><circle cx="102" cy="72" r="14" fill="' + GREEN + '"/><circle cx="120" cy="60" r="10" fill="' + GREEN + '"/>' +
      '<path d="M83 30 V90 M100 30 V90 M117 30 V90 M66 50 H134 M66 70 H134" stroke="' + WALL_D + '" stroke-width="3" fill="none"/>',
    fenjing:
      '<rect x="20" y="16" width="160" height="98" fill="' + WALL + '" stroke="' + WALL_D + '"/>' +
      '<ellipse cx="58" cy="66" rx="30" ry="22" fill="' + WATER + '" stroke="' + WATER_D + '"/>' +
      '<circle cx="140" cy="44" r="11" fill="' + GREEN + '"/><circle cx="152" cy="78" r="13" fill="' + GREEN + '"/><circle cx="128" cy="92" r="9" fill="' + GREEN + '"/>' +
      '<rect x="95" y="16" width="10" height="98" fill="' + PATH + '"/><rect x="95" y="58" width="10" height="16" fill="' + WALL + '"/>',
    dongguan:
      '<rect x="12" y="12" width="176" height="106" fill="' + WALL + '" stroke="' + WALL_D + '"/>' +
      '<rect x="36" y="46" width="32" height="22" fill="' + SCENE + '" stroke="' + WALL_D + '"/><rect x="112" y="86" width="32" height="22" fill="' + SCENE + '" stroke="' + WALL_D + '"/><rect x="126" y="16" width="30" height="20" fill="' + SCENE + '" stroke="' + WALL_D + '"/>' +
      '<path d="M24 100 Q64 106 76 76 Q88 46 122 56 Q156 66 172 30" fill="none" stroke="' + PATH + '" stroke-width="9" stroke-linecap="round"/>' +
      '<g fill="' + RED + '"><circle cx="24" cy="100" r="8"/><circle cx="100" cy="56" r="8"/><circle cx="172" cy="30" r="8"/></g>' +
      '<g fill="#f6ecd5" font-size="11" text-anchor="middle" font-family="sans-serif"><text x="24" y="104">1</text><text x="100" y="60">2</text><text x="172" y="34">3</text></g>'
  };

  /* ---------- 一池三山 ---------- */
  function islandsSvg() {
    var names = D.water.islands;
    var pos = [[150, 118, 36], [305, 98, 32], [248, 208, 38]];
    var s = '<svg viewBox="0 0 460 300" role="img" aria-label="一池水里的三座岛：' + names.join('、') + '">';
    s += '<ellipse cx="230" cy="150" rx="205" ry="122" fill="' + WATER + '" stroke="' + WATER_D + '" stroke-width="3"/>';
    s += '<path d="M60 150 q14 -6 28 0 t28 0 M330 180 q14 -6 28 0 t28 0 M120 250 q14 -6 28 0 t28 0 M330 60 q14 -6 28 0 t28 0" fill="none" stroke="#c9dde8" stroke-width="2"/>';
    pos.forEach(function (p, i) {
      s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="' + MOUNT + '" stroke="#5a7d58" stroke-width="2"/>';
      s += '<polygon points="' + (p[0] - 12) + ',' + (p[1] - 14) + ' ' + p[0] + ',' + (p[1] - 26) + ' ' + (p[0] + 12) + ',' + (p[1] - 14) + '" fill="' + TILE + '"/>';
      s += '<text class="mg-label" x="' + p[0] + '" y="' + (p[1] + 14) + '" text-anchor="middle">' + (names[i] || '') + '</text>';
    });
    return s + '</svg>';
  }

  /* ---------- 各块 ---------- */
  function buildTypes() {
    var grid = el('div', { 'class': 'gd-cards gd-cards-2' }, D.types.items.map(function (t) {
      var kids = [el('h3', { 'class': 'gd-card-name', text: t.name }), el('p', { 'class': 'gd-card-text', text: t.text })];
      if (t.cases.length) kids.push(el('div', { 'class': 'wx-pills yl-pills' }, t.cases.map(function (c) { return el('span', { 'class': 'wx-pill', text: c }); })));
      return el('article', { 'class': 'gd-card wx-paper' }, kids);
    }));
    return el('section', { 'class': 'wx-section', 'aria-label': '园林的类型' }, [
      el('div', { 'class': 'wx-sec-title', text: '园林有几种' }),
      el('p', { 'class': 'wx-lead', text: D.types.text }),
      grid
    ]);
  }

  function buildMethods() {
    var grid = el('div', { 'class': 'mj-homes' });
    D.methods.items.forEach(function (m) {
      var art = el('div', { 'class': 'mj-home-art yl-art', 'aria-hidden': 'true' });
      art.innerHTML = '<svg viewBox="0 0 200 130">' + (ART[m.art] || '') + '</svg>';
      var body = [el('h3', { 'class': 'wx-roof-name', text: m.name }), el('p', { 'class': 'wx-line', text: m.text })];
      if (m.eg.length) {
        body.push(el('div', { 'class': 'yl-eg' }, [el('span', { 'class': 'wx-see-label', text: '可以在这里看到' })].concat(m.eg.map(function (g) { return el('span', { 'class': 'wx-pill', text: g }); }))));
      }
      grid.appendChild(el('article', { 'class': 'mj-home wx-paper' }, [art, el('div', { 'class': 'mj-home-body' }, body)]));
    });
    return el('section', { 'class': 'wx-section', 'aria-label': '七种构景手法' }, [
      el('div', { 'class': 'wx-sec-title', text: '七种构景手法' }),
      el('p', { 'class': 'wx-lead', text: D.methods.text }),
      grid
    ]);
  }

  function buildWater() {
    var W = D.water;
    return el('section', { 'class': 'wx-section', 'aria-label': '叠山理水与一池三山' }, [
      el('div', { 'class': 'wx-sec-title', text: '叠山理水，与“一池三山”' }),
      el('p', { 'class': 'wx-lead', text: W.rock }),
      el('div', { 'class': 'wx-explore' }, [
        figure(islandsSvg(), 'yl-islands'),
        el('div', { 'class': 'mg-joint-side' }, [
          el('div', { 'class': 'wx-paper mg-box' }, [el('h3', { 'class': 'wx-myth-title', text: '一池三山' }), el('p', { 'class': 'wx-line', text: W.three })]),
          el('div', { 'class': 'wx-paper mg-box' }, [el('div', { 'class': 'wx-fields' }, [el('div', { 'class': 'is-note' }, [el('dt', { text: '辨析' }), el('dd', { text: W.note })])])])
        ])
      ])
    ]);
  }

  function buildGardens() {
    var G = D.gardens;
    var cards = [];
    var count = el('span', { 'class': 'wx-count', 'aria-live': 'polite' });
    var btns = {};

    function apply(f) {
      var n = 0;
      cards.forEach(function (c) {
        var on = f === '全部' || c.g.kind === f;
        c.node.hidden = !on;
        if (on) n++;
      });
      Object.keys(btns).forEach(function (k) { btns[k].setAttribute('aria-pressed', k === f ? 'true' : 'false'); });
      count.textContent = f === '全部' ? '共 ' + n + ' 座' : f + '：' + n + ' 座';
    }

    var bar = el('div', { 'class': 'wx-chips', role: 'group', 'aria-label': '按类型筛选名园' });
    ['全部'].concat(G.kinds).forEach(function (f) {
      var b = el('button', { type: 'button', 'class': 'wx-chip-w', 'aria-pressed': 'false', text: f });
      b.addEventListener('click', function () { apply(f); });
      btns[f] = b;
      bar.appendChild(b);
    });

    var grid = el('div', { 'class': 'gd-cards' });
    G.items.forEach(function (g) {
      var node = el('article', { 'class': 'gd-card wx-paper yl-garden' }, [
        el('div', { 'class': 'wx-roof-top' }, [el('h3', { 'class': 'gd-card-name', text: g.name }), el('span', { 'class': 'wx-tag' + (g.kind === '皇家园林' ? ' is-bao' : ''), text: g.kind })]),
        el('div', { 'class': 'wx-pills yl-pills' }, g.keys.map(function (k) { return el('span', { 'class': 'wx-pill', text: k }); })),
        el('p', { 'class': 'gd-card-text', text: g.text })
      ]);
      cards.push({ g: g, node: node });
      grid.appendChild(node);
    });

    var sec = el('section', { 'class': 'wx-section', 'aria-label': '七座名园' }, [
      el('div', { 'class': 'wx-sec-title', text: '七座名园' }),
      el('p', { 'class': 'wx-lead', text: G.text }),
      el('div', { 'class': 'wx-filter-row' }, [bar, count]),
      grid
    ]);
    apply('全部');
    return sec;
  }

  function buildBuild() {
    var B = D.build;
    return el('section', { 'class': 'wx-section', 'aria-label': '园林里的建筑' }, [
      el('div', { 'class': 'wx-sec-title', text: '园林里的房子：亭、榭、舫、廊' }),
      el('p', { 'class': 'wx-lead', text: B.text }),
      el('div', { 'class': 'gd-cards gd-cards-4' }, B.items.map(function (b) {
        return el('article', { 'class': 'gd-card wx-paper' }, [el('h3', { 'class': 'gd-card-name', text: b.name }), el('p', { 'class': 'gd-card-text', text: b.text })]);
      })),
      el('p', { 'class': 'wx-hint', text: B.other })
    ]);
  }

  function buildNaming() {
    var N = D.naming;
    return el('section', { 'class': 'wx-section', 'aria-label': '题名与文学' }, [
      el('div', { 'class': 'wx-sec-title', text: '题名：把风景写成文学' }),
      el('p', { 'class': 'wx-lead', text: N.text }),
      el('p', { 'class': 'wx-lead', text: N.essays }),
      el('div', { 'class': 'gd-cards' }, N.items.map(function (n) {
        return el('article', { 'class': 'gd-card wx-paper' }, [
          el('h3', { 'class': 'gd-card-name', text: n.name }),
          el('p', { 'class': 'gd-card-text', text: n.author + '　·　' + n.place })
        ]);
      }))
    ]);
  }

  function buildMyths() {
    var grid = el('div', { 'class': 'wx-myths' });
    D.myths.forEach(function (m) {
      grid.appendChild(el('article', { 'class': 'wx-myth wx-paper' }, [
        el('h3', { 'class': 'wx-myth-title', text: m.title }),
        el('p', { 'class': 'wx-myth-claim', text: '常见的说法：' + m.claim }),
        el('div', { 'class': 'wx-fields' }, [el('div', { 'class': 'is-note' }, [el('dt', { text: '怎么看' }), el('dd', { text: m.view })])])
      ]));
    });
    return el('section', { 'class': 'wx-section', 'aria-label': '五个常见的说法' }, [
      el('div', { 'class': 'wx-sec-title', text: '五个常见的说法' }), grid
    ]);
  }

  function notesBlock(summary, arr, mode) {
    return el('details', { 'class': 'wx-notes' }, [
      el('summary', { text: summary }),
      el('div', { 'class': 'wx-notes-body' }, arr.map(function (n) {
        var m = mode === 'long' ? n.match(/^(.+?)：(.*)$/) : n.match(/^([^：]{1,4})：(.*)$/);
        return el('p', {}, m ? [el('span', { 'class': 'wx-note-label', text: m[1] }), document.createTextNode(m[2])] : [document.createTextNode(n)]);
      }))
    ]);
  }

  function render() {
    var page = el('div', { 'class': 'wx-page' });
    page.appendChild(el('div', { 'class': 'wx-head' }, [
      el('div', { 'class': 'wx-eyebrow', text: '建筑 · 园林' }),
      el('h1', { 'class': 'wx-hook', text: D.hook }),
      el('p', { 'class': 'wx-answer', text: D.answer })
    ]));
    page.appendChild(el('p', { 'class': 'wx-lead', text: D.intro }));
    page.appendChild(buildTypes());
    page.appendChild(buildMethods());
    page.appendChild(buildWater());
    page.appendChild(buildGardens());
    page.appendChild(buildBuild());
    page.appendChild(buildNaming());
    page.appendChild(buildMyths());
    page.appendChild(notesBlock('主要园林文献', D.sources, 'long'));
    page.appendChild(el('div', { 'class': 'wx-tip' }, [el('div', { 'class': 'wx-tip-label', text: '小提示' }), el('p', { text: D.tip })]));
    page.appendChild(notesBlock('批注', D.notes, 'short'));
    root.textContent = '';
    root.appendChild(page);
  }

  render();
})();
