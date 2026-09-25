/* 知否知否 · "物"·中国古代建筑（木构架与榫卯页）脚本
   数据来自 data/mugoujia.js（window.ZHIFOU_MUGOUJIA），本文件只负责排版和交互。
   五张示意图（剖面、榫卯、斗拱、梁架、平面）是固定的线稿，文字来自数据。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_MUGOUJIA;
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
  function field(label, text, cls) {
    return el('div', { 'class': cls || '' }, [el('dt', { text: label }), el('dd', { text: text })]);
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

  var RED = '#b23a2e', WOOD = '#c9a56b', WOOD_D = '#8a6f3f', BEAM = '#a8592f', STONE = '#b9b1a0', STONE_D = '#8f887a',
    TILE = '#3d3a36', LIGHT = '#e0c48a';

  /* ================= 一、剖面图：八个部位 ================= */
  var partById = {};
  D.parts.items.forEach(function (p) { partById[p.id] = p; });

  /* 标签在右边一列：[标签的高度, 指向的位置 x, y] */
  var LABEL = {
    wa: [30, 560, 137], chuan: [70, 560, 151], lin: [110, 540, 158], liang: [150, 418, 153],
    dougong: [190, 550, 190], fang: [230, 549, 217], zhu: [300, 541, 300], taiji: [380, 590, 380]
  };
  var LX = 668;

  function partG(id, inner) {
    var p = partById[id], L = LABEL[id];
    return '<g class="mg-part" data-id="' + id + '" tabindex="0" role="button" aria-pressed="false" aria-label="' + p.name + '">' + inner +
      '<path class="mg-leader" d="M' + (LX - 6) + ' ' + (L[0] - 5) + ' L' + L[1] + ' ' + L[2] + '"/>' +
      '<circle class="mg-dot" cx="' + L[1] + '" cy="' + L[2] + '" r="3"/>' +
      '<text class="mg-label" x="' + LX + '" y="' + L[0] + '">' + p.name + '</text></g>';
  }

  function frameSvg() {
    function col(x, y, h) { return '<rect x="' + (x - 11) + '" y="' + y + '" width="22" height="' + h + '" fill="' + RED + '"/>'; }
    function pad(x) { return '<rect x="' + (x - 18) + '" y="350" width="36" height="10" fill="#cfc8ba" stroke="' + STONE_D + '"/>'; }
    function stack(cx) {
      return '<rect x="' + (cx - 46) + '" y="182" width="92" height="12" fill="' + WOOD + '" stroke="' + WOOD_D + '"/>' +
        '<rect x="' + (cx - 20) + '" y="194" width="40" height="16" fill="' + WOOD + '" stroke="' + WOOD_D + '"/>' +
        '<rect x="' + (cx - 8) + '" y="170" width="16" height="12" fill="' + WOOD + '" stroke="' + WOOD_D + '"/>';
    }
    function purlin(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="10" fill="#8a6647" stroke="#5a3d2b" stroke-width="1.5"/>'; }
    var s = '<svg viewBox="0 0 780 430" role="group" aria-label="一座抬梁式木构大殿的剖面示意图，点各个部位">';
    s += partG('taiji',
      '<rect x="40" y="360" width="560" height="40" fill="' + STONE + '" stroke="' + STONE_D + '" stroke-width="2"/>' +
      '<rect x="250" y="400" width="140" height="12" fill="#cfc8ba" stroke="' + STONE_D + '"/>' + pad(110) + pad(240) + pad(400) + pad(530));
    s += partG('zhu',
      col(110, 224, 126) + col(530, 224, 126) + col(240, 160, 190) + col(400, 160, 190) +
      '<rect x="270" y="124" width="14" height="22" fill="' + RED + '"/><rect x="356" y="124" width="14" height="22" fill="' + RED + '"/>' +
      '<rect x="313" y="62" width="14" height="48" fill="' + RED + '"/>');
    s += partG('liang',
      '<rect x="222" y="146" width="196" height="14" fill="' + BEAM + '" stroke="#7d3f1f"/>' +
      '<rect x="262" y="110" width="116" height="14" fill="' + BEAM + '" stroke="#7d3f1f"/>' +
      '<rect x="121" y="228" width="108" height="12" fill="' + BEAM + '" stroke="#7d3f1f"/><rect x="411" y="228" width="108" height="12" fill="' + BEAM + '" stroke="#7d3f1f"/>');
    s += partG('fang', '<rect x="91" y="210" width="38" height="14" fill="#7d2a20"/><rect x="511" y="210" width="38" height="14" fill="#7d2a20"/>');
    s += partG('dougong', stack(110) + stack(530));
    s += partG('lin', purlin(110, 158) + purlin(530, 158) + purlin(240, 136) + purlin(400, 136) + purlin(280, 100) + purlin(360, 100) + purlin(320, 52));
    s += partG('chuan', '<polyline points="44,157 110,146 240,124 280,88 320,40 360,88 400,124 530,146 596,157" fill="none" stroke="' + WOOD + '" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>');
    s += partG('wa',
      '<polyline points="44,151 110,140 240,118 280,82 320,34 360,82 400,118 530,140 596,151" fill="none" stroke="' + BEAM + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<polyline points="44,143 110,132 240,110 280,74 320,26 360,74 400,110 530,132 596,143" fill="none" stroke="' + TILE + '" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<rect x="302" y="10" width="36" height="14" rx="3" fill="#2b2926"/>');
    return s + '</svg>';
  }

  var frameSel = null, framePanel = null, frameFig = null;
  var jointApi = null;

  function selectPart(id, opts) {
    var p = partById[id];
    if (!p) return;
    opts = opts || {};
    frameSel = id;
    frameFig.classList.add('has-sel');
    Array.prototype.forEach.call(frameFig.querySelectorAll('.mg-part'), function (g) {
      var on = g.getAttribute('data-id') === id;
      g.classList.toggle('is-selected', on);
      g.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var items = D.parts.items;
    var i = items.indexOf(p);
    var prev = items[(i + items.length - 1) % items.length], next = items[(i + 1) % items.length];

    framePanel.textContent = '';
    framePanel.appendChild(el('div', { 'class': 'wx-kicker' }, [el('span', { 'class': 'wx-tag', text: '第 ' + (i + 1) + ' 件 / 共 ' + items.length + ' 件' })]));
    framePanel.appendChild(el('h3', { 'class': 'wx-title', text: p.name }));
    framePanel.appendChild(el('p', { 'class': 'wx-line', text: p.line }));
    framePanel.appendChild(el('dl', { 'class': 'wx-fields' }, [field('作用', p.role), field('说明', p.text)]));
    if (p.joints && p.joints.length) {
      var see = el('div', { 'class': 'wx-see' }, [el('span', { 'class': 'wx-see-label', text: '常用的榫卯' })]);
      p.joints.forEach(function (j) {
        var b = el('button', { type: 'button', 'class': 'wx-chip', text: j });
        b.addEventListener('click', function () { if (jointApi) jointApi(j, true); });
        see.appendChild(b);
      });
      framePanel.appendChild(see);
    }
    var pb = el('button', { type: 'button', 'class': 'wx-step-btn', text: '← ' + prev.name });
    pb.setAttribute('aria-label', '上一个：' + prev.name);
    pb.addEventListener('click', function () { selectPart(prev.id, {}); });
    var nb = el('button', { type: 'button', 'class': 'wx-step-btn', text: next.name + ' →' });
    nb.setAttribute('aria-label', '下一个：' + next.name);
    nb.addEventListener('click', function () { selectPart(next.id, {}); });
    framePanel.appendChild(el('div', { 'class': 'wx-stepper' }, [pb, nb]));
    if (opts.scroll && window.innerWidth < 1000) scrollToNode(framePanel);
  }

  function buildFrame() {
    frameFig = figure(frameSvg(), 'mg-frame');
    Array.prototype.forEach.call(frameFig.querySelectorAll('.mg-part'), function (g) {
      onActivate(g, function () { selectPart(g.getAttribute('data-id'), { scroll: true }); });
    });
    framePanel = el('div', { 'class': 'wx-panel wx-paper', 'aria-live': 'polite' });

    var chips = el('div', { 'class': 'wx-chips', role: 'group', 'aria-label': '按名字选部位' });
    D.parts.items.forEach(function (p) {
      var b = el('button', { type: 'button', 'class': 'wx-chip-w', text: p.name });
      b.addEventListener('click', function () { selectPart(p.id, { scroll: true }); });
      chips.appendChild(b);
    });

    return el('section', { 'class': 'wx-section', id: 'mg-frame', 'aria-label': '一座木构殿堂的八个部位' }, [
      el('div', { 'class': 'wx-sec-title', text: '从下往上，拆开一座殿' }),
      el('p', { 'class': 'wx-lead', text: D.parts.text }),
      el('div', { 'class': 'wx-explore' }, [
        el('div', { 'class': 'wx-scene' }, [
          frameFig,
          el('p', { 'class': 'wx-hint', text: '点图上的部位，或点下面的名字。图中是抬梁式的一座大殿，为了看清楚而简化。' }),
          chips
        ]),
        framePanel
      ])
    ]);
  }

  /* ================= 二、榫卯：柱子的拆开图 ================= */
  function jointSvg() {
    var z = D.joints.zones;
    var zr = [[100, 364, 180, 84], [100, 26, 180, 116], [10, 186, 266, 60]];
    var zl = [[286, 424], [286, 94], [12, 180]];
    var s = '<svg viewBox="0 0 380 450" role="img" aria-label="一根柱子的拆开图：柱脚、柱顶、梁枋与柱相交三处的榫卯">';
    s += '<rect x="110" y="410" width="160" height="26" fill="#cfc8ba" stroke="' + STONE_D + '" stroke-width="2"/>';
    s += '<rect x="172" y="410" width="36" height="10" fill="#8f887a" stroke="#6f695e" stroke-dasharray="3 2"/>';
    s += '<rect x="173" y="372" width="34" height="32" fill="' + LIGHT + '" stroke="' + WOOD_D + '" stroke-width="1.5"/>';
    s += '<rect x="150" y="110" width="80" height="262" fill="' + RED + '"/>';
    s += '<path d="M168 110 Q190 74 212 110 Z" fill="' + LIGHT + '" stroke="' + WOOD_D + '" stroke-width="1.5"/>';
    s += '<rect x="120" y="32" width="140" height="30" fill="' + WOOD + '" stroke="' + WOOD_D + '" stroke-width="1.5"/>';
    s += '<rect x="178" y="54" width="24" height="8" fill="#8a6f3f" stroke="#5a4520" stroke-dasharray="3 2"/>';
    s += '<rect x="20" y="196" width="130" height="40" fill="' + BEAM + '" stroke="#7d3f1f" stroke-width="1.5"/>';
    s += '<rect x="150" y="206" width="80" height="20" fill="none" stroke="#f4e3b0" stroke-dasharray="4 3" stroke-width="1.5"/>';
    s += '<rect x="230" y="206" width="32" height="20" fill="' + LIGHT + '" stroke="' + WOOD_D + '" stroke-width="1.5"/>';
    s += '<rect x="242" y="198" width="8" height="36" fill="#4a2f1f"/>';
    s += '<text class="mg-tx-dark" x="190" y="432" text-anchor="middle">柱础</text>';
    s += '<text class="mg-tx-dark" x="166" y="393" text-anchor="end">管脚榫</text>';
    s += '<text class="mg-tx-dark" x="162" y="98" text-anchor="end">馒头榫</text>';
    s += '<text class="mg-tx-dark" x="190" y="48" text-anchor="middle">上部构件</text>';
    s += '<text class="mg-tx-light" x="190" y="300" text-anchor="middle">柱</text>';
    s += '<text class="mg-tx-light" x="85" y="221" text-anchor="middle">额枋</text>';
    s += '<text class="mg-tx-dark" x="246" y="242" text-anchor="middle">透榫</text>';
    s += '<text class="mg-tx-dark" x="248" y="194" text-anchor="middle">销栓</text>';
    z.forEach(function (zz, i) {
      s += '<g class="mg-zone" data-zone="' + i + '"><rect x="' + zr[i][0] + '" y="' + zr[i][1] + '" width="' + zr[i][2] + '" height="' + zr[i][3] +
        '" rx="8"/><text class="mg-zone-label" x="' + zl[i][0] + '" y="' + zl[i][1] + '">' + (i + 1) + ' ' + zz.name + '</text></g>';
    });
    return s + '</svg>';
  }

  function buildJoints() {
    var zones = D.joints.zones;
    var fig = figure(jointSvg(), 'mg-joint-fig');
    var info = el('div', { 'class': 'wx-paper mg-info', 'aria-live': 'polite' });
    var btns = {};
    var bar = el('div', { 'class': 'wx-chips', role: 'group', 'aria-label': '选一种榫卯' });

    function show(name, scroll) {
      var j = null;
      D.joints.items.forEach(function (x) { if (x.name === name) j = x; });
      if (!j) return;
      Object.keys(btns).forEach(function (k) { btns[k].setAttribute('aria-pressed', k === name ? 'true' : 'false'); });
      Array.prototype.forEach.call(fig.querySelectorAll('.mg-zone'), function (g) {
        var zi = parseInt(g.getAttribute('data-zone'), 10);
        g.classList.toggle('is-on', j.at.indexOf(zones[zi].name) >= 0);
      });
      info.textContent = '';
      info.appendChild(el('div', { 'class': 'wx-kicker' }, [el('span', { 'class': 'wx-tag', text: '清式木作' })]));
      info.appendChild(el('h3', { 'class': 'wx-title', text: j.name }));
      var where = el('div', { 'class': 'wx-see' }, [el('span', { 'class': 'wx-see-label', text: '用在' })]);
      j.at.forEach(function (a) { where.appendChild(el('span', { 'class': 'wx-pill is-place', text: a })); });
      info.appendChild(where);
      info.appendChild(el('p', { 'class': 'wx-line mg-joint-text', text: j.text }));
      if (scroll) scrollToNode(document.getElementById('mg-joints'));
    }
    jointApi = show;

    D.joints.items.forEach(function (j) {
      var b = el('button', { type: 'button', 'class': 'wx-chip-w', 'aria-pressed': 'false', text: j.name });
      b.addEventListener('click', function () { show(j.name, false); });
      btns[j.name] = b;
      bar.appendChild(b);
    });

    var legend = el('ol', { 'class': 'mg-zones' }, zones.map(function (z, i) {
      return el('li', {}, [el('span', { 'class': 'mg-zone-no', text: String(i + 1) }), el('span', {}, [el('strong', { text: z.name }), document.createTextNode('：' + z.text)])]);
    }));

    var sec = el('section', { 'class': 'wx-section', id: 'mg-joints', 'aria-label': '榫卯' }, [
      el('div', { 'class': 'wx-sec-title', text: '榫卯：木头和木头怎么咬在一起' }),
      el('p', { 'class': 'wx-lead', text: D.joints.text }),
      el('p', { 'class': 'wx-lead', text: D.joints.scope + D.joints.draw }),
      el('div', { 'class': 'wx-explore' }, [
        el('div', { 'class': 'wx-scene' }, [
          bar,
          info,
          el('p', { 'class': 'wx-hint', text: D.joints.furniture }),
          legend
        ]),
        el('div', { 'class': 'mg-joint-side' }, [fig])
      ])
    ]);
    show(D.joints.items[1] ? D.joints.items[1].name : D.joints.items[0].name, false);
    return sec;
  }

  /* ================= 三、斗拱 ================= */
  function dgLabel(text, y, tx, ty) {
    return '<path class="mg-leader" d="M404 ' + (y - 5) + ' L' + tx + ' ' + ty + '"/><circle class="mg-dot" cx="' + tx + '" cy="' + ty + '" r="3"/>' +
      '<text class="mg-label" x="410" y="' + y + '">' + text + '</text>';
  }
  function dougongSvg() {
    function grp(id, name, inner, lab) {
      return '<g class="mg-part" data-id="' + id + '" tabindex="0" role="button" aria-pressed="false" aria-label="' + name + '">' + inner + lab + '</g>';
    }
    var s = '<svg viewBox="0 0 580 340" role="group" aria-label="一组宋式斗拱的简化示意图，点斗、拱、昂">';
    s += '<g class="mg-static">' +
      '<line x1="14" y1="140" x2="340" y2="18" stroke="' + TILE + '" stroke-width="9" stroke-linecap="round"/>' +
      '<line x1="14" y1="150" x2="340" y2="28" stroke="' + WOOD + '" stroke-width="5" stroke-linecap="round"/>' +
      '<rect x="170" y="252" width="60" height="88" fill="' + RED + '"/>' +
      dgLabel('椽和屋檐', 40, 300, 43) + dgLabel('柱头', 290, 230, 290) + '</g>';
    s += grp('ang', '昂', '<polygon points="24,172 42,186 318,100 304,84" fill="#d8b98a" stroke="' + WOOD_D + '" stroke-width="1.5"/>', dgLabel('昂', 140, 250, 111));
    s += '<g class="mg-static"><circle cx="116" cy="130" r="16" fill="#8a6647" stroke="#5a3d2b" stroke-width="1.5"/>' + dgLabel('檩', 90, 132, 128) + '</g>';
    s += grp('gong', '拱',
      '<rect x="60" y="196" width="280" height="16" fill="#d8b98a" stroke="' + WOOD_D + '" stroke-width="1.5"/>' +
      '<rect x="140" y="160" width="120" height="16" fill="#d8b98a" stroke="' + WOOD_D + '" stroke-width="1.5"/>', dgLabel('拱', 190, 338, 204));
    s += grp('dou', '斗',
      '<polygon points="172,252 228,252 250,212 150,212" fill="' + WOOD + '" stroke="' + WOOD_D + '" stroke-width="1.5"/>' +
      '<polygon points="66,196 96,196 102,174 60,174" fill="' + WOOD + '" stroke="' + WOOD_D + '" stroke-width="1.5"/>' +
      '<polygon points="186,196 214,196 220,176 180,176" fill="' + WOOD + '" stroke="' + WOOD_D + '" stroke-width="1.5"/>' +
      '<polygon points="186,160 214,160 220,141 180,141" fill="' + WOOD + '" stroke="' + WOOD_D + '" stroke-width="1.5"/>', dgLabel('斗', 240, 240, 230));
    return s + '</svg>';
  }

  function buildDougong() {
    var fig = figure(dougongSvg(), 'mg-dg-fig');
    var info = el('div', { 'class': 'wx-paper mg-info', 'aria-live': 'polite' });
    var btns = {};
    var bar = el('div', { 'class': 'wx-chips', role: 'group', 'aria-label': '斗拱的构件' });

    function show(name) {
      var t = null;
      D.dougong.terms.forEach(function (x) { if (x.name === name) t = x; });
      if (!t) return;
      Object.keys(btns).forEach(function (k) { btns[k].setAttribute('aria-pressed', k === name ? 'true' : 'false'); });
      fig.classList.toggle('has-sel', !!t.id);
      Array.prototype.forEach.call(fig.querySelectorAll('.mg-part'), function (g) {
        var on = t.id === 'all' || g.getAttribute('data-id') === t.id;
        g.classList.toggle('is-selected', on);
        g.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      info.textContent = '';
      info.appendChild(el('h3', { 'class': 'wx-title', text: t.name }));
      info.appendChild(el('p', { 'class': 'wx-line mg-joint-text', text: t.text }));
    }

    D.dougong.terms.forEach(function (t) {
      var b = el('button', { type: 'button', 'class': 'wx-chip-w', 'aria-pressed': 'false', text: t.name });
      b.addEventListener('click', function () { show(t.name); });
      btns[t.name] = b;
      bar.appendChild(b);
    });
    Array.prototype.forEach.call(fig.querySelectorAll('.mg-part'), function (g) {
      onActivate(g, function () {
        var id = g.getAttribute('data-id');
        var hit = null;
        D.dougong.terms.forEach(function (t) { if (!hit && t.id === id) hit = t; });
        if (hit) show(hit.name);
      });
    });

    var roles = el('ul', { 'class': 'mg-roles' }, D.dougong.roles.map(function (r) { return el('li', { text: r }); }));

    var sec = el('section', { 'class': 'wx-section', 'aria-label': '斗拱' }, [
      el('div', { 'class': 'wx-sec-title', text: '斗拱：托出屋檐的那一层' }),
      el('p', { 'class': 'wx-lead', text: D.dougong.text }),
      el('div', { 'class': 'wx-explore' }, [
        el('div', { 'class': 'wx-scene' }, [fig, el('p', { 'class': 'wx-hint', text: '点图上的斗、拱、昂，或点下面的名字。' }), bar]),
        el('div', { 'class': 'mg-joint-side' }, [
          info,
          el('div', { 'class': 'wx-paper mg-box' }, [el('div', { 'class': 'wx-see-label', text: '它的作用' }), roles])
        ])
      ]),
      el('p', { 'class': 'wx-hint', text: D.dougong.draw }),
      el('div', { 'class': 'wx-myths' }, [
        el('article', { 'class': 'wx-myth wx-paper' }, [el('h3', { 'class': 'wx-myth-title', text: '时代和尺度' }), el('p', { 'class': 'wx-line', text: D.dougong.scale })]),
        el('article', { 'class': 'wx-myth wx-paper' }, [el('h3', { 'class': 'wx-myth-title', text: '不只是装饰' }), el('div', { 'class': 'wx-fields' }, [el('div', { 'class': 'is-note' }, [el('dt', { text: '辨析' }), el('dd', { text: D.dougong.note })])])])
      ])
    ]);
    show(D.dougong.terms[0].name);
    return sec;
  }

  /* ================= 四、抬梁式与穿斗式 ================= */
  function purlinC(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="9" fill="#8a6647" stroke="#5a3d2b" stroke-width="1.5"/>'; }

  function tailiangSvg() {
    var s = '<svg viewBox="0 -24 300 254" role="img" aria-label="抬梁式梁架的示意图：柱上架梁，梁上立短柱再架梁">';
    s += '<line x1="6" y1="210" x2="294" y2="210" stroke="' + STONE_D + '" stroke-width="3"/>';
    s += '<rect x="58" y="110" width="14" height="100" fill="' + RED + '"/><rect x="228" y="110" width="14" height="100" fill="' + RED + '"/>';
    s += '<rect x="44" y="96" width="212" height="14" fill="' + BEAM + '"/>';
    s += '<rect x="100" y="72" width="12" height="24" fill="' + RED + '"/><rect x="188" y="72" width="12" height="24" fill="' + RED + '"/>';
    s += '<rect x="88" y="58" width="124" height="14" fill="' + BEAM + '"/>';
    s += '<rect x="144" y="10" width="12" height="48" fill="' + RED + '"/>';
    s += purlinC(56, 87) + purlinC(244, 87) + purlinC(98, 49) + purlinC(202, 49) + purlinC(150, 1);
    s += '<polyline points="10,92 56,76 98,39 150,-8 202,39 244,76 290,92" fill="none" stroke="' + TILE + '" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>';
    return s + '</svg>';
  }
  function chuandouSvg() {
    var s = '<svg viewBox="0 -24 300 254" role="img" aria-label="穿斗式梁架的示意图：密排的柱子，用穿枋连起来">';
    s += '<line x1="6" y1="210" x2="294" y2="210" stroke="' + STONE_D + '" stroke-width="3"/>';
    [[50, 91], [100, 55], [150, 17], [200, 55], [250, 91]].forEach(function (c) {
      s += '<rect x="' + (c[0] - 6) + '" y="' + c[1] + '" width="12" height="' + (210 - c[1]) + '" fill="' + RED + '"/>';
    });
    s += '<rect x="40" y="170" width="220" height="8" fill="' + BEAM + '"/><rect x="90" y="124" width="120" height="8" fill="' + BEAM + '"/>';
    s += purlinC(50, 82) + purlinC(100, 46) + purlinC(150, 8) + purlinC(200, 46) + purlinC(250, 82);
    s += '<polyline points="10,87 50,73 100,37 150,-1 200,37 250,73 290,87" fill="none" stroke="' + TILE + '" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>';
    return s + '</svg>';
  }

  function buildFrames() {
    var two = el('div', { 'class': 'mg-two' });
    D.frames.kinds.forEach(function (k) {
      var art = el('div', { 'class': 'mg-frame-art' });
      art.innerHTML = k.id === 'tailiang' ? tailiangSvg() : chuandouSvg();
      two.appendChild(el('article', { 'class': 'wx-paper mg-kind' }, [
        art,
        el('div', { 'class': 'mg-kind-body' }, [
          el('div', { 'class': 'wx-roof-top' }, [el('h3', { 'class': 'wx-roof-name', text: k.name }), k.alias ? el('span', { 'class': 'wx-tag', text: '又称' + k.alias }) : null]),
          el('p', { 'class': 'wx-line', text: k.text })
        ])
      ]));
    });

    var table = el('table', { 'class': 'wx-table' });
    var head = el('tr', {}, [el('th', { text: '比较' }), el('th', { text: '抬梁式' }), el('th', { text: '穿斗式' })]);
    table.appendChild(el('thead', {}, [head]));
    table.appendChild(el('tbody', {}, D.frames.rows.map(function (r) {
      return el('tr', {}, [el('th', { scope: 'row', text: r.name }), el('td', { text: r.a }), el('td', { text: r.b })]);
    })));

    return el('section', { 'class': 'wx-section', 'aria-label': '抬梁式与穿斗式' }, [
      el('div', { 'class': 'wx-sec-title', text: '两种梁架：抬梁式与穿斗式' }),
      el('p', { 'class': 'wx-lead', text: D.frames.text }),
      two,
      el('div', { 'class': 'wx-paper mg-table-wrap' }, [table]),
      el('p', { 'class': 'wx-hint', text: D.frames.remark })
    ]);
  }

  /* ================= 五、开间与进深 ================= */
  function planSvg() {
    var xs = [80, 150, 230, 330, 410, 480], ys = [60, 120, 180, 240];
    var s = '<svg viewBox="0 0 580 320" role="img" aria-label="面阔五间、进深三间的平面示意图，圆点是柱子">';
    s += '<rect x="80" y="60" width="400" height="180" fill="#efe3c8" stroke="#8f7a55" stroke-width="2"/>';
    xs.slice(1, -1).forEach(function (x) { s += '<line x1="' + x + '" y1="60" x2="' + x + '" y2="240" stroke="#cdbf9f" stroke-dasharray="4 4"/>'; });
    ys.slice(1, -1).forEach(function (y) { s += '<line x1="80" y1="' + y + '" x2="480" y2="' + y + '" stroke="#cdbf9f" stroke-dasharray="4 4"/>'; });
    ys.forEach(function (y) { xs.forEach(function (x) { s += '<circle cx="' + x + '" cy="' + y + '" r="7" fill="' + RED + '"/>'; }); });
    var bays = [['梢间', 115, '#e2c2b3'], ['次间', 190, '#c9705e'], ['明间', 280, '#7d2a20'], ['次间', 370, '#c9705e'], ['梢间', 445, '#e2c2b3']];
    bays.forEach(function (b, i) {
      s += '<rect x="' + (xs[i] + 4) + '" y="46" width="' + (xs[i + 1] - xs[i] - 8) + '" height="5" fill="' + b[2] + '"/>';
      s += '<text class="mg-tx-dark" x="' + b[1] + '" y="36" text-anchor="middle">' + b[0] + '</text>';
    });
    s += '<path d="M80 258 V270 M480 258 V270 M80 264 H480" stroke="#5a4d3d" stroke-width="1.5" fill="none"/>';
    s += '<text class="mg-tx-dark" x="280" y="290" text-anchor="middle">面阔（五间）</text>';
    s += '<path d="M498 60 H510 M498 240 H510 M504 60 V240" stroke="#5a4d3d" stroke-width="1.5" fill="none"/>';
    s += '<text class="mg-tx-dark" x="532" y="150" text-anchor="middle" transform="rotate(90 532 150)">进深（三间）</text>';
    return s + '</svg>';
  }

  function buildScale() {
    var table = el('table', { 'class': 'wx-table' });
    table.appendChild(el('thead', {}, [el('tr', {}, [el('th', { text: '术语' }), el('th', { text: '含义' }), el('th', { text: '看建筑时要注意' })])]));
    table.appendChild(el('tbody', {}, D.scale.terms.map(function (t) {
      return el('tr', {}, [el('th', { scope: 'row', text: t.name }), el('td', { text: t.mean }), el('td', { text: t.note })]);
    })));
    return el('section', { 'class': 'wx-section', 'aria-label': '开间与进深' }, [
      el('div', { 'class': 'wx-sec-title', text: '开间与进深：怎么量一座房子' }),
      el('p', { 'class': 'wx-lead', text: D.scale.text }),
      figure(planSvg(), 'mg-plan'),
      el('p', { 'class': 'wx-hint', text: D.scale.caption }),
      el('div', { 'class': 'wx-paper mg-table-wrap' }, [table])
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

  function notesBlock(summary, arr, splitLabel) {
    return el('details', { 'class': 'wx-notes' }, [
      el('summary', { text: summary }),
      el('div', { 'class': 'wx-notes-body' }, arr.map(function (n) {
        var m = splitLabel === 'long' ? n.match(/^(.+?)：(.*)$/) : n.match(/^([^：]{1,4})：(.*)$/);
        return el('p', {}, m ? [el('span', { 'class': 'wx-note-label', text: m[1] }), document.createTextNode(m[2])] : [document.createTextNode(n)]);
      }))
    ]);
  }

  function render() {
    var page = el('div', { 'class': 'wx-page' });
    page.appendChild(el('div', { 'class': 'wx-head' }, [
      el('div', { 'class': 'wx-eyebrow', text: '物 · 中国古代建筑 · 木构架与榫卯' }),
      el('h1', { 'class': 'wx-hook', text: D.hook }),
      el('p', { 'class': 'wx-answer', text: D.answer })
    ]));
    page.appendChild(el('p', { 'class': 'wx-lead', text: D.intro }));
    page.appendChild(buildFrame());
    page.appendChild(buildJoints());
    page.appendChild(buildDougong());
    page.appendChild(buildFrames());
    page.appendChild(buildScale());
    page.appendChild(buildMyths());
    page.appendChild(notesBlock('主要出处', D.sources, 'long'));
    page.appendChild(el('div', { 'class': 'wx-tip' }, [el('div', { 'class': 'wx-tip-label', text: '小提示' }), el('p', { text: D.tip })]));
    page.appendChild(notesBlock('批注', D.notes, 'short'));
    root.textContent = '';
    root.appendChild(page);
    selectPart('zhu', {});
  }

  render();
})();
