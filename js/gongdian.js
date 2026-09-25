/* 知否知否 · "物"·中国古代建筑（宫殿、坛庙与城市页）脚本
   数据来自 data/gongdian.js（window.ZHIFOU_GONGDIAN），本文件只负责排版和交互。
   理想都城图、故宫平面图是固定的线稿，文字来自数据。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_GONGDIAN;
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
  function markSelected(fig, id) {
    fig.classList.add('has-sel');
    Array.prototype.forEach.call(fig.querySelectorAll('.mg-part'), function (g) {
      var on = g.getAttribute('data-id') === id;
      g.classList.toggle('is-selected', on);
      g.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function byName(list, name) {
    var r = null;
    list.forEach(function (x) { if (x.name === name) r = x; });
    return r;
  }

  var RED = '#b23a2e';

  /* ================= 一、理想都城 ================= */
  function citySvg() {
    var gx = [103, 230, 357], gy = [113, 240, 367], gates = '';
    gx.forEach(function (x) {
      gates += '<rect x="' + (x - 14) + '" y="44" width="28" height="12" fill="' + RED + '"/><rect x="' + (x - 14) + '" y="424" width="28" height="12" fill="' + RED + '"/>';
    });
    gy.forEach(function (y) {
      gates += '<rect x="34" y="' + (y - 14) + '" width="12" height="28" fill="' + RED + '"/><rect x="414" y="' + (y - 14) + '" width="12" height="28" fill="' + RED + '"/>';
    });
    function block(id, x, y, w, h, fill, stroke, light) {
      return grp(id, '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"/>' +
        '<text class="gd-big' + (light ? ' is-light' : '') + '" x="' + (x + w / 2) + '" y="' + (y + h / 2 + 12) + '" text-anchor="middle">' + id + '</text>');
    }
    var s = '<svg viewBox="0 0 460 490" role="group" aria-label="按《考工记》画的理想都城示意图，点宫、朝、市、祖、社、门">';
    s += '<rect x="40" y="50" width="380" height="380" fill="#efe3c8" stroke="#7d6a52" stroke-width="6"/>';
    s += grp('门', gates);
    s += block('朝', 185, 105, 90, 85, '#e8c46a', '#a8842f');
    s += block('宫', 185, 200, 90, 90, RED, '#7d2a20', true);
    s += block('市', 185, 300, 90, 85, '#9cc19a', '#5a7d58');
    s += block('祖', 65, 200, 105, 90, '#e0a08e', '#b23a2e');
    s += block('社', 290, 200, 105, 90, '#a9c4b6', '#5f8a7a');
    s += '<text class="mg-tx-dark" x="230" y="34" text-anchor="middle">南</text><text class="mg-tx-dark" x="230" y="466" text-anchor="middle">北</text>';
    s += '<text class="mg-tx-dark" x="18" y="245" text-anchor="middle">东</text><text class="mg-tx-dark" x="442" y="245" text-anchor="middle">西</text>';
    return s + '</svg>';
  }

  function buildCity() {
    var fig = figure(citySvg(), 'gd-city-fig');
    var panel = el('div', { 'class': 'wx-panel wx-paper', 'aria-live': 'polite' });
    var btns = {};
    var bar = el('div', { 'class': 'wx-chips', role: 'group', 'aria-label': '按名字选' });

    function show(name) {
      var it = byName(D.city.items, name);
      if (!it) return;
      markSelected(fig, name);
      Object.keys(btns).forEach(function (k) { btns[k].setAttribute('aria-pressed', k === name ? 'true' : 'false'); });
      panel.textContent = '';
      panel.appendChild(el('div', { 'class': 'wx-kicker' }, [el('span', { 'class': 'wx-tag', text: it.place })]));
      panel.appendChild(el('h3', { 'class': 'wx-title', text: it.name }));
      panel.appendChild(el('p', { 'class': 'wx-line', text: it.text }));
    }
    D.city.items.forEach(function (it) {
      var b = el('button', { type: 'button', 'class': 'wx-chip-w', 'aria-pressed': 'false', text: it.name });
      b.addEventListener('click', function () { show(it.name); if (window.innerWidth < 1000) scrollToNode(panel); });
      btns[it.name] = b;
      bar.appendChild(b);
    });
    Array.prototype.forEach.call(fig.querySelectorAll('.mg-part'), function (g) {
      onActivate(g, function () { show(g.getAttribute('data-id')); if (window.innerWidth < 1000) scrollToNode(panel); });
    });

    var sec = el('section', { 'class': 'wx-section', 'aria-label': '理想都城' }, [
      el('div', { 'class': 'wx-sec-title', text: '从《考工记》说起：一座理想的城' }),
      el('p', { 'class': 'wx-lead', text: D.city.text }),
      el('div', { 'class': 'wx-explore' }, [
        el('div', { 'class': 'wx-scene' }, [fig, el('p', { 'class': 'wx-hint', text: D.city.caption }), bar]),
        panel
      ]),
      el('div', { 'class': 'wx-fields gd-note wx-paper' }, [el('div', { 'class': 'is-note' }, [el('dt', { text: '辨析' }), el('dd', { text: D.city.note })])])
    ]);
    show('宫');
    return sec;
  }

  /* ================= 二、故宫 ================= */
  var NODES = {
    '神武门': [225, 30, 110, 34, 'gate'], '钦安殿': [225, 84, 110, 34, 'qin'], '御花园': [180, 134, 200, 44, 'garden'],
    '坤宁门': [225, 196, 110, 34, 'gate'], '坤宁宫': [225, 248, 110, 34, 'nei'], '交泰殿': [225, 300, 110, 34, 'nei'],
    '乾清宫': [225, 352, 110, 34, 'nei'], '乾清门': [225, 404, 110, 34, 'gate'],
    '保和殿': [215, 470, 130, 34, 'wai'], '中和殿': [225, 524, 110, 34, 'wai'], '太和殿': [205, 578, 150, 34, 'wai'],
    '太和门': [225, 640, 110, 34, 'gate'], '午门': [205, 716, 150, 44, 'gate'],
    '武英殿': [85, 548, 80, 34, 'side'], '文华殿': [395, 548, 80, 34, 'side'],
    '西六宫': [85, 236, 80, 120, 'side'], '东六宫': [395, 236, 80, 120, 'side'],
    '乾西五所': [85, 112, 80, 100, 'side'], '乾东五所': [395, 112, 80, 100, 'side']
  };
  var KIND = {
    gate: ['#d9cdb0', '#8f7a55'], wai: ['#e8c46a', '#a8842f'], nei: ['#e0a08e', '#b23a2e'],
    garden: ['#9cc19a', '#5a7d58'], qin: ['#e6d9bd', '#8f7a55'], side: ['#f7efd9', '#8f7a55']
  };

  function palaceSvg() {
    var s = '<svg viewBox="0 0 560 800" role="group" aria-label="故宫宫城的平面示意图，点中轴线上的殿门和两侧的宫殿">';
    s += '<rect x="60" y="20" width="440" height="432" fill="#f4e0d2"/><rect x="60" y="452" width="440" height="328" fill="#f5e8bd"/>';
    s += '<rect x="60" y="20" width="440" height="760" fill="none" stroke="#7d6a52" stroke-width="5"/>';
    s += '<line x1="60" y1="452" x2="500" y2="452" stroke="#7d6a52" stroke-width="1.5" stroke-dasharray="6 4"/>';
    s += '<text class="mg-zone-label" x="72" y="50">内廷</text><text class="mg-zone-label" x="72" y="478">外朝</text>';
    s += '<line x1="280" y1="30" x2="280" y2="750" stroke="#7d6a52" stroke-width="1.5" stroke-dasharray="3 5"/>';
    s += '<text class="mg-tx-dark" x="280" y="14" text-anchor="middle">北</text><text class="mg-tx-dark" x="280" y="796" text-anchor="middle">南</text>';
    var axisNo = {};
    D.palace.axis.forEach(function (a) { axisNo[a.name] = a.no; });
    Object.keys(NODES).forEach(function (name) {
      var n = NODES[name], c = KIND[n[4]], dashed = n[4] === 'side';
      var inner = '<rect x="' + n[0] + '" y="' + n[1] + '" width="' + n[2] + '" height="' + n[3] + '" rx="4" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="2"' + (dashed ? ' stroke-dasharray="5 3"' : '') + '/>' +
        '<text class="gd-node" x="' + (n[0] + n[2] / 2) + '" y="' + (n[1] + n[3] / 2 + 6) + '" text-anchor="middle">' + name + '</text>';
      if (axisNo[name]) {
        inner += '<circle cx="' + n[0] + '" cy="' + (n[1] + n[3] / 2) + '" r="10" fill="#5a4d3d"/><text class="gd-badge" x="' + n[0] + '" y="' + (n[1] + n[3] / 2 + 4) + '" text-anchor="middle">' + axisNo[name] + '</text>';
      }
      s += grp(name, inner);
    });
    return s + '</svg>';
  }

  function buildPalace() {
    var P = D.palace;
    var all = P.axis.concat(P.side);
    var fig = figure(palaceSvg(), 'gd-palace-fig');
    var panel = el('div', { 'class': 'wx-panel wx-paper', 'aria-live': 'polite' });
    var btns = {};

    function show(name, scroll) {
      var it = byName(all, name);
      if (!it) return;
      markSelected(fig, name);
      Object.keys(btns).forEach(function (k) { btns[k].setAttribute('aria-pressed', k === name ? 'true' : 'false'); });
      panel.textContent = '';
      var tags = [el('span', { 'class': 'wx-tag' + (it.type === '两侧' ? '' : ' is-bao'), text: it.type === '两侧' ? '中轴线两侧' : it.type })];
      tags.push(el('span', { 'class': 'wx-tag', text: it.zone }));
      panel.appendChild(el('div', { 'class': 'wx-kicker' }, tags));
      panel.appendChild(el('h3', { 'class': 'wx-title', text: it.name }));
      if (it.no) panel.appendChild(el('p', { 'class': 'wx-hint gd-no', text: '中轴线上第 ' + it.no + ' 处（从南往北数，共 13 处）' }));
      panel.appendChild(el('p', { 'class': 'wx-line', text: it.text }));
      if (it.no) {
        var prev = P.axis[it.no - 2], next = P.axis[it.no];
        var pb = el('button', { type: 'button', 'class': 'wx-step-btn', text: prev ? '← ' + prev.name + '（南）' : '已是最南端' });
        var nb = el('button', { type: 'button', 'class': 'wx-step-btn', text: next ? '（北）' + next.name + ' →' : '已是最北端' });
        if (prev) pb.addEventListener('click', function () { show(prev.name); }); else pb.disabled = true;
        if (next) nb.addEventListener('click', function () { show(next.name); }); else nb.disabled = true;
        panel.appendChild(el('div', { 'class': 'wx-stepper' }, [pb, nb]));
      }
      if (scroll && window.innerWidth < 1000) scrollToNode(panel);
    }

    function chipRow(label, list) {
      var row = el('div', { 'class': 'wx-chips', role: 'group', 'aria-label': label });
      list.forEach(function (it) {
        var b = el('button', { type: 'button', 'class': 'wx-chip-w', 'aria-pressed': 'false', text: it.name });
        b.addEventListener('click', function () { show(it.name, true); });
        btns[it.name] = b;
        row.appendChild(b);
      });
      return el('div', { 'class': 'gd-chip-group' }, [el('div', { 'class': 'wx-see-label', text: label }), row]);
    }
    Array.prototype.forEach.call(fig.querySelectorAll('.mg-part'), function (g) {
      onActivate(g, function () { show(g.getAttribute('data-id'), true); });
    });

    var sec = el('section', { 'class': 'wx-section', id: 'gd-palace', 'aria-label': '故宫' }, [
      el('div', { 'class': 'wx-sec-title', text: '故宫：一条线，从午门排到神武门' }),
      el('p', { 'class': 'wx-lead', text: P.text }),
      el('p', { 'class': 'wx-lead', text: P.zones }),
      el('div', { 'class': 'wx-explore' }, [
        el('div', { 'class': 'wx-scene' }, [
          fig,
          el('p', { 'class': 'wx-hint', text: P.caption }),
          chipRow('中轴线（从南到北）', P.axis),
          chipRow('两侧', P.side)
        ]),
        panel
      ]),
      el('p', { 'class': 'wx-hint', text: P.sides }),
      el('div', { 'class': 'wx-fields gd-note wx-paper' }, [el('div', { 'class': 'is-note' }, [el('dt', { text: '辨析' }), el('dd', { text: P.note })])])
    ]);
    show('太和殿', false);
    return sec;
  }

  /* ================= 三、坛庙 ================= */
  function card(name, text, extra) {
    return el('article', { 'class': 'gd-card wx-paper' }, [el('h3', { 'class': 'gd-card-name', text: name }), el('p', { 'class': 'gd-card-text', text: text }), extra || null]);
  }

  function buildAltar() {
    var A = D.altar;
    var cards = el('div', { 'class': 'gd-cards gd-cards-2' }, A.cards.map(function (c) { return card(c.name, c.text); }));

    var steps = el('div', { 'class': 'gd-route' });
    A.route.forEach(function (r, i) {
      steps.appendChild(el('article', { 'class': 'gd-step wx-paper' }, [
        el('span', { 'class': 'wx-step-no', text: String(i + 1) }),
        el('h3', { 'class': 'gd-card-name', text: r.name }),
        el('p', { 'class': 'gd-card-text', text: r.text })
      ]));
    });

    return el('section', { 'class': 'wx-section', 'aria-label': '坛庙' }, [
      el('div', { 'class': 'wx-sec-title', text: '坛庙：国家的礼制空间' }),
      el('p', { 'class': 'wx-lead', text: A.text }),
      cards,
      el('p', { 'class': 'wx-lead', text: A.altar }),
      el('p', { 'class': 'wx-lead', text: A.tiantan }),
      el('div', { 'class': 'gd-route-wrap' }, [
        el('div', { 'class': 'wx-beasts-dir' }, [el('span', { text: '南' }), el('span', { 'class': 'wx-beasts-line', 'aria-hidden': 'true' }), el('span', { text: '北' })]),
        steps
      ]),
      el('p', { 'class': 'wx-hint', text: A.routeText }),
      el('div', { 'class': 'wx-fields gd-note wx-paper' }, [el('div', { 'class': 'is-note' }, [el('dt', { text: '辨析' }), el('dd', { text: A.note })])])
    ]);
  }

  /* ================= 四、城墙、城门与长城 ================= */
  function buildWalls() {
    var grid = el('div', { 'class': 'gd-cards' }, D.walls.items.map(function (c) { return card(c.name, c.text); }));
    return el('section', { 'class': 'wx-section', 'aria-label': '城墙、城门与长城' }, [
      el('div', { 'class': 'wx-sec-title', text: '城墙、城门与长城' }),
      el('p', { 'class': 'wx-lead', text: D.walls.text }),
      grid
    ]);
  }

  /* ================= 五、陵墓 ================= */
  function buildTomb() {
    var T = D.tomb;
    function boxes(zone) {
      return T.parts.filter(function (p) { return p.zone === zone; }).map(function (p) { return card(p.name, p.text); });
    }
    var reps = el('div', { 'class': 'gd-reps' }, T.reps.map(function (r) {
      return el('p', { 'class': 'wx-hint' }, [el('span', { 'class': 'wx-note-label', text: r.name }), document.createTextNode(r.text)]);
    }));
    return el('section', { 'class': 'wx-section', 'aria-label': '陵墓' }, [
      el('div', { 'class': 'wx-sec-title', text: '陵墓：把秩序带到地下' }),
      el('p', { 'class': 'wx-lead', text: T.text }),
      el('div', { 'class': 'gd-tomb' }, [
        el('div', { 'class': 'gd-tomb-label', text: T.above }),
        el('div', { 'class': 'gd-cards gd-cards-5' }, boxes('地上')),
        el('div', { 'class': 'gd-tomb-arrow', 'aria-hidden': 'true', text: '↓' }),
        el('div', { 'class': 'gd-tomb-label', text: T.below }),
        el('div', { 'class': 'gd-cards gd-cards-1' }, boxes('地下'))
      ]),
      reps
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
      el('div', { 'class': 'wx-eyebrow', text: '物 · 中国古代建筑 · 宫殿、坛庙与城市' }),
      el('h1', { 'class': 'wx-hook', text: D.hook }),
      el('p', { 'class': 'wx-answer', text: D.answer })
    ]));
    page.appendChild(el('p', { 'class': 'wx-lead', text: D.intro }));
    page.appendChild(buildCity());
    page.appendChild(buildPalace());
    page.appendChild(buildAltar());
    page.appendChild(buildWalls());
    page.appendChild(buildTomb());
    page.appendChild(buildMyths());
    page.appendChild(notesBlock('主要出处', D.sources, 'long'));
    page.appendChild(el('div', { 'class': 'wx-tip' }, [el('div', { 'class': 'wx-tip-label', text: '小提示' }), el('p', { text: D.tip })]));
    page.appendChild(notesBlock('批注', D.notes, 'short'));
    root.textContent = '';
    root.appendChild(page);
  }

  render();
})();
