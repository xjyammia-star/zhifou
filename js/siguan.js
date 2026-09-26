/* 知否知否 · "物"·中国古代建筑（寺观、塔与桥页）脚本
   数据来自 data/siguan.js（window.ZHIFOU_SIGUAN），本文件只负责排版和交互。
   佛寺平面、五种塔、一座塔的各个部位、四种桥，都是固定的线稿，文字来自数据。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_SIGUAN;
  var root = document.getElementById('app');
  if (!D || !root) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (Array.isArray(kids) ? kids : (kids ? [kids] : [])).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function scrollToNode(n) {
    if (n && n.scrollIntoView) n.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }
  function figure(svgHtml, cls) {
    var f = el('div', { 'class': 'mg-fig ' + (cls || '') });
    f.innerHTML = svgHtml;
    return f;
  }
  function onActivate(node, fn) {
    node.addEventListener('click', fn);
    node.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); }
    });
  }
  function grp(id, inner) {
    return '<g class="mg-part" data-id="' + id + '" tabindex="0" role="button" aria-pressed="false" aria-label="' + id + '">' + inner + '</g>';
  }
  function section(label, title, kids) {
    return el('section', { 'class': 'wx-section', 'aria-label': label }, [el('div', { 'class': 'wx-sec-title', text: title })].concat(kids));
  }
  function lead(t) { return el('p', { 'class': 'wx-lead', text: t }); }
  function note(label, t) { return el('div', { 'class': 'wx-fields gd-note wx-paper' }, [el('div', { 'class': 'is-note' }, [el('dt', { text: label }), el('dd', { text: t })])]); }
  function pills(list, cls) { return el('div', { 'class': 'wx-pills ' + (cls || '') }, list.map(function (t) { return el('span', { 'class': 'wx-pill', text: t }); })); }
  function card(name, text, extra) {
    return el('article', { 'class': 'gd-card wx-paper' }, [el('h3', { 'class': 'gd-card-name', text: name }), el('p', { 'class': 'gd-card-text', text: text }), extra || null]);
  }

  var RED = '#b23a2e', TILE = '#3d3a36', WALL = '#efe3c8', WALL_D = '#8f7a55', STONE = '#b9b1a0', GOLD = '#e8c46a', WATER = '#8fb3c8', BEAM = '#a8592f', WOOD = '#c9a56b';

  /* ================= 一、佛寺 ================= */
  var POS = {
    '藏经楼': [170, 50, 120, 40, 'a'], '法堂': [170, 122, 120, 44, 'a'], '大雄宝殿': [150, 208, 160, 64, 'main'],
    '天王殿': [170, 336, 120, 44, 'a'], '山门': [180, 486, 100, 38, 'gate'],
    '钟楼': [72, 300, 64, 44, 'side'], '鼓楼': [324, 300, 64, 44, 'side']
  };
  var KIND = { a: ['#e8c46a', '#a8842f'], main: ['#e0a08e', '#b23a2e'], gate: ['#d9cdb0', '#8f7a55'], side: ['#f0d9c7', '#b9785c'] };

  function templeSvg() {
    var no = {};
    D.temple.nodes.forEach(function (n) { if (n.no) no[n.name] = n.no; });
    var s = '<svg viewBox="0 0 460 570" role="group" aria-label="一座汉传佛寺的平面示意图，点各个殿和楼">';
    s += '<rect x="40" y="24" width="380" height="500" fill="#f4e6cf" stroke="#7d6a52" stroke-width="5"/>';
    s += '<line x1="230" y1="30" x2="230" y2="515" stroke="#7d6a52" stroke-width="1.5" stroke-dasharray="3 5"/>';
    s += '<text class="mg-tx-dark" x="230" y="14" text-anchor="middle">北</text><text class="mg-tx-dark" x="230" y="560" text-anchor="middle">南</text>';
    Object.keys(POS).forEach(function (name) {
      var p = POS[name], c = KIND[p[4]];
      var inner = '<rect x="' + p[0] + '" y="' + p[1] + '" width="' + p[2] + '" height="' + p[3] + '" rx="4" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="2"/>' +
        '<text class="gd-node" x="' + (p[0] + p[2] / 2) + '" y="' + (p[1] + p[3] / 2 + 6) + '" text-anchor="middle">' + name + '</text>';
      if (no[name]) inner += '<circle cx="' + p[0] + '" cy="' + (p[1] + p[3] / 2) + '" r="10" fill="#5a4d3d"/><text class="gd-badge" x="' + p[0] + '" y="' + (p[1] + p[3] / 2 + 4) + '" text-anchor="middle">' + no[name] + '</text>';
      s += grp(name, inner);
    });
    s += grp('塔院',
      '<rect x="332" y="96" width="84" height="100" rx="4" fill="#f7efd9" stroke="#8f7a55" stroke-width="2" stroke-dasharray="5 3"/>' +
      '<polygon points="356,142 374,132 392,142" fill="' + TILE + '"/><rect x="362" y="142" width="24" height="18" fill="' + WALL + '" stroke="' + WALL_D + '"/><polygon points="360,124 374,112 388,124" fill="' + TILE + '"/><rect x="371" y="102" width="6" height="12" fill="' + WALL_D + '"/>' +
      '<text class="gd-node" x="374" y="184" text-anchor="middle">塔院</text>');
    return s + '</svg>';
  }

  function thenSvg(kind) {
    var s = '<svg viewBox="0 0 160 110" role="img" aria-label="' + (kind === 'early' ? '早期的寺院：塔在院子中央' : '后来的寺院：大殿在中轴上') + '">';
    s += '<rect x="20" y="10" width="120" height="90" fill="' + WALL + '" stroke="' + WALL_D + '" stroke-width="2"/>';
    if (kind === 'early') {
      s += '<rect x="34" y="22" width="92" height="66" fill="none" stroke="' + WALL_D + '" stroke-dasharray="4 3"/>';
      s += '<polygon points="66,58 80,48 94,58" fill="' + TILE + '"/><rect x="72" y="58" width="16" height="18" fill="' + WALL + '" stroke="' + WALL_D + '"/><polygon points="68,44 80,34 92,44" fill="' + TILE + '"/><rect x="78" y="26" width="4" height="10" fill="' + WALL_D + '"/>';
    } else {
      s += '<rect x="46" y="20" width="68" height="28" fill="' + GOLD + '" stroke="#a8842f" stroke-width="2"/><rect x="34" y="60" width="20" height="16" fill="#f0d9c7" stroke="#b9785c"/><rect x="106" y="60" width="20" height="16" fill="#f0d9c7" stroke="#b9785c"/><rect x="66" y="82" width="28" height="12" fill="#d9cdb0" stroke="' + WALL_D + '"/>';
    }
    return s + '</svg>';
  }

  function buildTemple() {
    var T = D.temple;
    var fig = figure(templeSvg(), 'gd-palace-fig');
    var panel = el('div', { 'class': 'wx-panel wx-paper', 'aria-live': 'polite' });
    var btns = {};
    var axis = T.nodes.filter(function (n) { return n.type === '中轴'; });

    function show(name, scroll) {
      var it = null;
      T.nodes.forEach(function (n) { if (n.name === name) it = n; });
      if (!it) return;
      fig.classList.add('has-sel');
      Array.prototype.forEach.call(fig.querySelectorAll('.mg-part'), function (g) {
        var on = g.getAttribute('data-id') === name;
        g.classList.toggle('is-selected', on);
        g.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      Object.keys(btns).forEach(function (k) { btns[k].setAttribute('aria-pressed', k === name ? 'true' : 'false'); });
      panel.textContent = '';
      panel.appendChild(el('div', { 'class': 'wx-kicker' }, [el('span', { 'class': 'wx-tag' + (it.type === '中轴' ? ' is-bao' : ''), text: it.type === '中轴' ? '图中中轴线上第 ' + it.no + ' 处' : (it.type === '两侧' ? '轴线两侧' : '另设的院子') })]));
      panel.appendChild(el('h3', { 'class': 'wx-title', text: it.name }));
      panel.appendChild(el('p', { 'class': 'wx-line', text: it.text }));
      if (it.no) {
        var prev = axis[it.no - 2], next = axis[it.no];
        var pb = el('button', { type: 'button', 'class': 'wx-step-btn', text: prev ? '← ' + prev.name + '（南）' : '已是最南端' });
        var nb = el('button', { type: 'button', 'class': 'wx-step-btn', text: next ? '（北）' + next.name + ' →' : '已是最北端' });
        if (prev) pb.addEventListener('click', function () { show(prev.name); }); else pb.disabled = true;
        if (next) nb.addEventListener('click', function () { show(next.name); }); else nb.disabled = true;
        panel.appendChild(el('div', { 'class': 'wx-stepper' }, [pb, nb]));
      }
      if (scroll && window.innerWidth < 1000) scrollToNode(panel);
    }
    var bar = el('div', { 'class': 'wx-chips', role: 'group', 'aria-label': '按名字选' });
    T.nodes.forEach(function (n) {
      var b = el('button', { type: 'button', 'class': 'wx-chip-w', 'aria-pressed': 'false', text: n.name });
      b.addEventListener('click', function () { show(n.name, true); });
      btns[n.name] = b;
      bar.appendChild(b);
    });
    Array.prototype.forEach.call(fig.querySelectorAll('.mg-part'), function (g) {
      onActivate(g, function () { show(g.getAttribute('data-id'), true); });
    });

    var then = el('div', { 'class': 'sg-then' }, [
      el('div', { 'class': 'sg-then-item wx-paper' }, [el('div', { 'class': 'sg-then-svg', 'aria-hidden': 'true' }), el('p', { 'class': 'gd-card-text', text: '早期：常以塔为核心' })]),
      el('div', { 'class': 'sg-then-item wx-paper' }, [el('div', { 'class': 'sg-then-svg', 'aria-hidden': 'true' }), el('p', { 'class': 'gd-card-text', text: '后来：以大殿为中心' })])
    ]);
    var svgs = then.querySelectorAll('.sg-then-svg');
    svgs[0].innerHTML = thenSvg('early');
    svgs[1].innerHTML = thenSvg('late');

    var cases = el('div', { 'class': 'gd-cards gd-cards-4' }, T.cases.map(function (c) { return card(c.name, c.text); }));

    var sec = section('佛寺', '佛寺：一层一层往里走', [
      lead(T.text), lead(T.plan),
      el('div', { 'class': 'wx-explore' }, [el('div', { 'class': 'wx-scene' }, [fig, el('p', { 'class': 'wx-hint', text: T.caption }), bar]), panel]),
      lead(T.then), then,
      el('div', { 'class': 'wx-see-label lg-label', text: '代表案例' }), cases
    ]);
    show('大雄宝殿', false);
    return sec;
  }

  /* ================= 二、道观 ================= */
  function buildDaoist() {
    var Q = D.daoist;
    var cards = el('div', { 'class': 'gd-cards' }, [card('三清殿', Q.sanqing), card('主祀不同，殿也不同', Q.main), card('山里的道观与城里的道观', Q.land)]);
    var cases = el('div', { 'class': 'gd-cards' }, Q.cases.map(function (c) { return card(c.name, c.text); }));
    return section('道观', '道观：与山水相连', [
      lead(Q.text),
      el('div', { 'class': 'wx-see-label lg-label', text: '常见的空间' }), pills(Q.spaces, 'sg-spaces'),
      cards,
      el('div', { 'class': 'wx-see-label lg-label', text: '代表案例' }), cases
    ]);
  }

  /* ================= 三、塔 ================= */
  function tier(cx, y, w, h) {
    return '<rect x="' + (cx - w / 2 + 4) + '" y="' + y + '" width="' + (w - 8) + '" height="' + h + '" fill="' + WALL + '" stroke="' + WALL_D + '"/>' +
      '<polygon points="' + (cx - w / 2 - 4) + ',' + y + ' ' + cx + ',' + (y - 8) + ' ' + (cx + w / 2 + 4) + ',' + y + '" fill="' + TILE + '"/>';
  }
  function miniTower(cx, yb, h, w) {
    return '<rect x="' + (cx - w / 2) + '" y="' + (yb - h) + '" width="' + w + '" height="' + h + '" fill="' + WALL + '" stroke="' + WALL_D + '"/>' +
      '<polygon points="' + (cx - w / 2 - 3) + ',' + (yb - h) + ' ' + cx + ',' + (yb - h - 10) + ' ' + (cx + w / 2 + 3) + ',' + (yb - h) + '" fill="' + TILE + '"/>';
  }
  var TOWER_ART = {
    louge: '<rect x="30" y="132" width="40" height="6" fill="' + STONE + '"/>' + tier(50, 112, 60, 20) + tier(50, 90, 52, 18) + tier(50, 68, 44, 16) + tier(50, 48, 36, 14) + '<rect x="48" y="22" width="4" height="24" fill="' + WALL_D + '"/><circle cx="50" cy="20" r="3" fill="#c9a13b"/>',
    miyan: '<rect x="28" y="132" width="44" height="6" fill="' + STONE + '"/><rect x="34" y="88" width="32" height="44" fill="' + WALL + '" stroke="' + WALL_D + '"/>' +
      [0, 1, 2, 3, 4, 5, 6].map(function (i) { var y = 88 - i * 9, w = 46 - i * 4; return '<polygon points="' + (50 - w / 2) + ',' + y + ' 50,' + (y - 5) + ' ' + (50 + w / 2) + ',' + y + '" fill="' + TILE + '"/>'; }).join('') +
      '<rect x="48" y="14" width="4" height="12" fill="' + WALL_D + '"/>',
    tingge: '<rect x="22" y="126" width="56" height="8" fill="' + STONE + '"/><rect x="28" y="88" width="4" height="38" fill="' + RED + '"/><rect x="42" y="88" width="4" height="38" fill="' + RED + '"/><rect x="54" y="88" width="4" height="38" fill="' + RED + '"/><rect x="68" y="88" width="4" height="38" fill="' + RED + '"/>' +
      '<polygon points="20,88 50,64 80,88" fill="' + TILE + '"/><rect x="48" y="50" width="4" height="16" fill="' + WALL_D + '"/><circle cx="50" cy="48" r="4" fill="#c9a13b"/>',
    lama: '<rect x="18" y="124" width="64" height="10" fill="' + STONE + '" stroke="#8f887a"/><rect x="26" y="114" width="48" height="10" fill="' + STONE + '" stroke="#8f887a"/>' +
      '<ellipse cx="50" cy="98" rx="24" ry="20" fill="#f6f2e8" stroke="#8f887a" stroke-width="2"/><rect x="42" y="66" width="16" height="10" fill="' + WOOD + '" stroke="' + WALL_D + '"/>' +
      [0, 1, 2, 3, 4, 5].map(function (i) { var w = 14 - i * 2; return '<rect x="' + (50 - w / 2) + '" y="' + (60 - i * 5) + '" width="' + w + '" height="4" fill="#c9a13b"/>'; }).join('') + '<circle cx="50" cy="26" r="3" fill="#c9a13b"/>',
    jingang: '<rect x="8" y="90" width="84" height="44" fill="' + STONE + '" stroke="#8f887a" stroke-width="2"/><path d="M8 104 H92 M8 118 H92 M30 90 V134 M50 90 V134 M70 90 V134" stroke="#8f887a" fill="none"/>' +
      '<g opacity="0.75">' + miniTower(34, 90, 20, 12) + miniTower(66, 90, 20, 12) + '</g>' + miniTower(18, 90, 26, 14) + miniTower(82, 90, 26, 14) + miniTower(50, 90, 44, 20)
  };

  function towerPartsSvg() {
    var names = D.tower.parts; // 塔基、塔身、塔檐、平座、塔刹、相轮
    var lab = { '塔刹': [52, 136, 46], '相轮': [88, 144, 80], '塔檐': [150, 168, 140], '塔身': [206, 168, 216], '平座': [250, 174, 244], '塔基': [346, 200, 342] };
    var s = '<svg viewBox="0 0 340 380" role="img" aria-label="一座楼阁式塔的各个部位：塔基、塔身、塔檐、平座、塔刹、相轮">';
    s += '<rect x="60" y="330" width="140" height="24" fill="' + STONE + '" stroke="#8f887a" stroke-width="2"/>';
    s += '<rect x="80" y="268" width="100" height="58" fill="' + WALL + '" stroke="' + WALL_D + '"/><polygon points="64,268 130,246 196,268" fill="' + TILE + '"/>';
    s += '<rect x="86" y="238" width="88" height="8" fill="' + WOOD + '" stroke="' + WALL_D + '"/>';
    s += '<rect x="92" y="196" width="76" height="42" fill="' + WALL + '" stroke="' + WALL_D + '"/><polygon points="78,196 130,178 182,196" fill="' + TILE + '"/>';
    s += '<rect x="104" y="140" width="52" height="34" fill="' + WALL + '" stroke="' + WALL_D + '"/><polygon points="92,140 130,124 168,140" fill="' + TILE + '"/>';
    s += '<rect x="127" y="52" width="6" height="72" fill="' + WALL_D + '"/>';
    [66, 76, 86, 96, 106].forEach(function (y, i) { s += '<ellipse cx="130" cy="' + y + '" rx="' + (14 - i * 1.5) + '" ry="3.5" fill="#c9a13b" stroke="#8a6f3f"/>'; });
    s += '<circle cx="130" cy="48" r="5" fill="#c9a13b" stroke="#8a6f3f"/>';
    names.forEach(function (n) {
      var l = lab[n];
      if (!l) return;
      s += '<path class="mg-leader" d="M224 ' + (l[0] - 5) + ' L' + l[1] + ' ' + l[2] + '"/><circle class="mg-dot" cx="' + l[1] + '" cy="' + l[2] + '" r="3"/><text class="mg-label" x="230" y="' + l[0] + '">' + n + '</text>';
    });
    return s + '</svg>';
  }

  function buildTower() {
    var P = D.tower;
    var grid = el('div', { 'class': 'mj-homes' });
    P.items.forEach(function (t) {
      var art = el('div', { 'class': 'mj-home-art yl-art sg-tower-art', 'aria-hidden': 'true' });
      art.innerHTML = '<svg viewBox="0 0 100 140">' + (TOWER_ART[t.art] || '') + '</svg>';
      grid.appendChild(el('article', { 'class': 'mj-home wx-paper' }, [
        art,
        el('div', { 'class': 'mj-home-body' }, [
          el('h3', { 'class': 'wx-roof-name', text: t.name }),
          el('p', { 'class': 'mj-home-text', text: t.text }),
          el('div', { 'class': 'yl-eg' }, [el('span', { 'class': 'wx-see-label', text: '实例' })].concat(t.eg.map(function (g) { return el('span', { 'class': 'wx-pill', text: g }); })))
        ])
      ]));
    });
    var parts = el('div', { 'class': 'mg-joint-side' }, [
      el('div', { 'class': 'wx-paper mg-box' }, [
        el('div', { 'class': 'wx-see-label lg-label', text: '塔的构件' }), pills(P.parts),
        el('p', { 'class': 'wx-line', text: P.partsText })
      ])
    ]);
    return section('塔', '塔：从舍利到地标', [
      lead(P.text), note('提醒', P.note), grid, lead(P.special),
      el('div', { 'class': 'wx-explore' }, [figure(towerPartsSvg(), 'sg-parts-fig'), parts]),
      el('div', { 'class': 'wx-myths' }, [
        el('article', { 'class': 'wx-myth wx-paper' }, [el('h3', { 'class': 'wx-myth-title', text: '应县木塔' }), el('p', { 'class': 'wx-line', text: P.yingxian })]),
        el('article', { 'class': 'wx-myth wx-paper' }, [el('h3', { 'class': 'wx-myth-title', text: '真觉寺金刚宝座塔' }), el('p', { 'class': 'wx-line', text: P.zhenjue })])
      ])
    ]);
  }

  /* ================= 四、石窟与摩崖 ================= */
  function buildCave() {
    var C = D.cave;
    return section('石窟与摩崖', '石窟与摩崖：把山崖变成殿堂', [
      lead(C.text),
      el('div', { 'class': 'gd-cards' }, C.items.map(function (c) { return card(c.name, c.text); })),
      el('div', { 'class': 'wx-see-label lg-label', text: '常见的洞窟空间类型' }), pills(C.types, 'sg-spaces'),
      lead(C.typesText),
      note('摩崖', C.cliff)
    ]);
  }

  /* ================= 五、桥 ================= */
  var BRIDGE_ART = {
    liang: '<rect x="0" y="66" width="200" height="34" fill="' + WATER + '"/><rect x="14" y="42" width="172" height="8" fill="' + STONE + '" stroke="#8f887a"/><rect x="40" y="50" width="10" height="52" fill="#8f887a"/><rect x="95" y="50" width="10" height="52" fill="#8f887a"/><rect x="150" y="50" width="10" height="52" fill="#8f887a"/>',
    gong: '<rect x="0" y="66" width="200" height="34" fill="' + WATER + '"/><path d="M12 68 Q100 12 188 68 L188 74 L12 74 Z" fill="' + STONE + '" stroke="#8f887a"/><path d="M52 74 Q100 26 148 74 Z" fill="' + WATER + '"/>',
    fu: '<rect x="0" y="66" width="200" height="34" fill="' + WATER + '"/><rect x="10" y="58" width="180" height="5" fill="' + WOOD + '"/>' +
      [20, 54, 88, 122, 156].map(function (x) { return '<polygon points="' + x + ',64 ' + (x + 30) + ',64 ' + (x + 24) + ',76 ' + (x + 6) + ',76" fill="' + BEAM + '"/>'; }).join(''),
    suo: '<rect x="0" y="72" width="200" height="28" fill="' + WATER + '"/><rect x="28" y="20" width="9" height="62" fill="' + RED + '"/><rect x="163" y="20" width="9" height="62" fill="' + RED + '"/>' +
      '<path d="M32 26 Q100 80 168 26" fill="none" stroke="#5a4d3d" stroke-width="3"/><path d="M32 58 Q100 72 168 58" fill="none" stroke="#5a4d3d" stroke-width="3"/><path d="M52 44 V63 M76 56 V68 M100 60 V70 M124 56 V68 M148 44 V63" stroke="#5a4d3d" stroke-width="1.5" fill="none"/>'
  };

  function buildBridge() {
    var B = D.bridge;
    var types = el('div', { 'class': 'lg-names' });
    B.types.forEach(function (t) {
      var art = el('div', { 'class': 'mj-home-art yl-art', 'aria-hidden': 'true' });
      art.innerHTML = '<svg viewBox="0 0 200 100">' + (BRIDGE_ART[t.art] || '') + '</svg>';
      types.appendChild(el('article', { 'class': 'mj-home wx-paper' }, [
        art,
        el('div', { 'class': 'mj-home-body' }, [
          el('h3', { 'class': 'wx-roof-name', text: t.name }),
          el('p', { 'class': 'mj-home-text', text: t.text }),
          el('div', { 'class': 'yl-eg' }, [el('span', { 'class': 'wx-see-label', text: '实例' })].concat(t.eg.map(function (g) { return el('span', { 'class': 'wx-pill', text: g }); })))
        ])
      ]));
    });
    var famous = el('div', { 'class': 'gd-cards gd-cards-4' }, B.famous.map(function (f) {
      return card(f.name, f.text, el('div', { 'class': 'wx-pills yl-pills' }, [el('span', { 'class': 'wx-pill is-place', text: f.key })]));
    }));
    return section('桥', '桥：跨过水面的几种办法', [lead(B.text), types, note('提醒', B.note), lead(B.famousText), famous]);
  }

  /* ================= 六、水利与传说 ================= */
  function buildWater() {
    var W = D.water, L = D.legend;
    return section('水利与传说', '水利：把水也修成建筑', [
      lead(W.text),
      el('div', { 'class': 'gd-cards' }, W.items.map(function (w) { return card(w.name, w.text); })),
      lead(L.text),
      el('div', { 'class': 'gd-cards' }, L.items.map(function (l) { return card(l.name, l.text, el('div', { 'class': 'wx-pills yl-pills' }, [el('span', { 'class': 'wx-pill', text: '传说' })])); }))
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
    return section('五个常见的说法', '五个常见的说法', [grid]);
  }

  function notesBlock(summary, arr) {
    return el('details', { 'class': 'wx-notes' }, [
      el('summary', { text: summary }),
      el('div', { 'class': 'wx-notes-body' }, arr.map(function (n) {
        var m = n.match(/^([^：]{1,4})：(.*)$/);
        return el('p', {}, m ? [el('span', { 'class': 'wx-note-label', text: m[1] }), document.createTextNode(m[2])] : [document.createTextNode(n)]);
      }))
    ]);
  }

  function render() {
    var page = el('div', { 'class': 'wx-page' });
    page.appendChild(el('div', { 'class': 'wx-head' }, [
      el('div', { 'class': 'wx-eyebrow', text: '建筑 · 寺观、塔与桥' }),
      el('h1', { 'class': 'wx-hook', text: D.hook }),
      el('p', { 'class': 'wx-answer', text: D.answer })
    ]));
    page.appendChild(lead(D.intro));
    page.appendChild(buildTemple());
    page.appendChild(buildDaoist());
    page.appendChild(buildTower());
    page.appendChild(buildCave());
    page.appendChild(buildBridge());
    page.appendChild(buildWater());
    page.appendChild(buildMyths());
    page.appendChild(el('div', { 'class': 'wx-tip' }, [el('div', { 'class': 'wx-tip-label', text: '小提示' }), el('p', { text: D.tip })]));
    page.appendChild(notesBlock('批注', D.notes));
    root.textContent = '';
    root.appendChild(page);
  }

  render();
})();
