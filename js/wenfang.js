/* 知否知否 · "物"·文房四宝（书案页）脚本
   数据来自 data/wenfang.js（window.ZHIFOU_WENFANG），本文件只负责排版和交互。
   书案上每件器物的"画"是固定的线稿（下面的 SCENE），器物的文字来自数据。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_WENFANG;
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

  /* 把 **粗体** 变成加粗的文字 */
  function rich(text) {
    var frag = document.createDocumentFragment();
    String(text).split(/(\*\*[^*]+\*\*)/).forEach(function (part) {
      if (!part) return;
      var m = part.match(/^\*\*([^*]+)\*\*$/);
      if (m) frag.appendChild(el('strong', { text: m[1] }));
      else frag.appendChild(document.createTextNode(part));
    });
    return frag;
  }

  var byName = {};
  D.items.forEach(function (it) { byName[it.name] = it; });

  /* ---------- 书案图：每件器物的位置、形状、点击范围 ----------
     坐标都在 1000 × 620 的画布上。hit 是点击范围 [x, y, 宽, 高]；
     label 是名字的位置；bao 表示四宝，会多一个朱红小点（seal 是它的位置）。 */
  var SCENE = [
    { name: '纸', hit: [372, 68, 346, 486], label: [545, 524], bao: true, seal: [571, 524],
      svg: '<g transform="translate(545 285) rotate(-1.5)">' +
        '<rect x="-165" y="-210" width="330" height="420" fill="#f4ebd6" stroke="#d3c3a0" stroke-width="2"/>' +
        '<path d="M-70 -150 v34 M-70 -100 v22 M-70 -64 v40 M-70 -8 v28 M0 -160 v26 M0 -118 v40 M0 -62 v18 M0 -28 v36 M70 -150 v40 M70 -96 v20 M70 -60 v34" stroke="rgba(43,33,24,0.68)" stroke-width="7" stroke-linecap="round" fill="none"/>' +
        '<rect x="78" y="120" width="26" height="26" fill="#b23a2e" opacity="0.85"/></g>' },
    { name: '镇纸', hit: [398, 98, 294, 40], label: [545, 118], cls: 'on-item dark',
      svg: '<g transform="translate(545 118)"><rect x="-140" y="-14" width="280" height="28" rx="8" fill="#86a594" stroke="#4f6b5c" stroke-width="2"/>' +
        '<path d="M-124 -7 H124" stroke="rgba(255,255,255,0.35)" stroke-width="2"/></g>' },
    { name: '笔架', hit: [96, 146, 188, 84], label: [190, 214],
      svg: '<g transform="translate(190 160)"><path d="M-84 28 L-84 8 L-54 -16 L-32 8 L0 -28 L32 8 L54 -16 L84 8 L84 28 Z" fill="#8a6647" stroke="#c9a57a" stroke-width="2" stroke-linejoin="round"/>' +
        '<rect x="-90" y="24" width="180" height="8" rx="3" fill="#6d4d34"/></g>' },
    { name: '笔', hit: [72, 56, 270, 90], label: [290, 66], bao: true, seal: [312, 66],
      svg: '<g transform="translate(190 132) rotate(-10)">' +
        '<rect x="-118" y="-6" width="182" height="12" rx="6" fill="#d8b98a" stroke="#a98956"/>' +
        '<path d="M-70 -6 v12 M-20 -6 v12" stroke="#a98956" stroke-width="1.5"/>' +
        '<rect x="62" y="-8" width="10" height="16" rx="2" fill="#7a4b2b"/>' +
        '<path d="M72 -8 Q112 -10 146 0 Q112 10 72 8 Z" fill="#231a13"/></g>' },
    { name: '墨床', hit: [98, 240, 184, 84], label: [190, 306],
      svg: '<g transform="translate(190 268)"><rect x="-88" y="-22" width="176" height="44" rx="8" fill="#8a6647" stroke="#c9a57a" stroke-width="2"/>' +
        '<rect x="-88" y="-22" width="22" height="44" rx="8" fill="#6d4d34"/><rect x="66" y="-22" width="22" height="44" rx="8" fill="#6d4d34"/></g>' },
    { name: '墨', hit: [126, 254, 128, 28], label: [190, 269], bao: true, seal: [267, 268], cls: 'on-item gold',
      svg: '<g transform="translate(190 268)"><rect x="-64" y="-13" width="128" height="26" rx="3" fill="#15100d" stroke="#3a2f26"/>' +
        '<rect x="-56" y="-8" width="112" height="16" fill="none" stroke="#b8934a" stroke-width="1" opacity="0.6"/></g>' },
    { name: '砚', hit: [88, 346, 194, 178], label: [185, 503], bao: true, seal: [211, 503],
      svg: '<g transform="translate(185 415)"><rect x="-90" y="-62" width="180" height="124" rx="18" fill="#262b2e" stroke="#4a5357" stroke-width="2"/>' +
        '<rect x="-78" y="-50" width="156" height="100" rx="12" fill="none" stroke="#59636a" stroke-width="1.5"/>' +
        '<rect x="-70" y="-42" width="140" height="84" rx="8" fill="#30373b"/>' +
        '<ellipse cx="-30" cy="-22" rx="40" ry="20" fill="#0d1113"/><ellipse cx="-42" cy="-26" rx="14" ry="5" fill="rgba(255,255,255,0.12)"/></g>' },
    { name: '砚滴', hit: [296, 340, 54, 68], label: [322, 392],
      svg: '<g transform="translate(322 362)"><ellipse rx="17" ry="13" fill="#57735d" stroke="#8fb09a" stroke-width="1.5"/>' +
        '<circle cx="-7" cy="-9" r="3.5" fill="#c9e0d0"/><circle cx="7" cy="-9" r="3.5" fill="#c9e0d0"/>' +
        '<rect x="15" y="-3" width="12" height="5" rx="2" fill="#57735d" stroke="#8fb09a"/></g>' },
    { name: '水丞', hit: [284, 448, 56, 90], label: [312, 520],
      svg: '<g transform="translate(312 478)"><circle r="26" fill="#7f9fb0" stroke="#b8cdd6" stroke-width="2"/><circle r="16" fill="#3f5d6b"/>' +
        '<rect x="24" y="-4" width="12" height="8" rx="2" fill="#7f9fb0" stroke="#b8cdd6"/></g>' },
    { name: '笔筒', hit: [746, 72, 108, 140], label: [800, 191],
      svg: '<g transform="translate(800 125)"><circle r="46" fill="#7a5a3a" stroke="#c9a57a" stroke-width="2"/><circle r="36" fill="#1a120c"/>' +
        '<path d="M0 0 L-19 -14 M0 0 L-8 -22 M0 0 L8 -21 M0 0 L20 -10 M0 0 L-18 10 M0 0 L14 14" stroke="#d8b98a" stroke-width="5" stroke-linecap="round" fill="none"/>' +
        '<circle cx="-23" cy="-17" r="3.5" fill="#231a13"/><circle cx="-10" cy="-27" r="3.5" fill="#231a13"/><circle cx="10" cy="-26" r="3.5" fill="#231a13"/><circle cx="24" cy="-12" r="3.5" fill="#231a13"/></g>' },
    { name: '香炉', hit: [848, 214, 112, 132], label: [905, 331],
      svg: '<g transform="translate(905 270)"><rect x="-52" y="-8" width="14" height="16" rx="3" fill="#a8842f" stroke="#6b531c"/><rect x="38" y="-8" width="14" height="16" rx="3" fill="#a8842f" stroke="#6b531c"/>' +
        '<circle r="38" fill="#a8842f" stroke="#6b531c" stroke-width="2"/><circle r="27" fill="#5a4520"/><circle r="19" fill="#9a927f"/>' +
        '<circle cx="4" cy="-3" r="2.5" fill="#3a2f26"/><circle cx="4" cy="-3" r="1.4" fill="#e0664f"/></g>' },
    { name: '笔洗', hit: [750, 352, 130, 160], label: [815, 492],
      svg: '<g transform="translate(815 412)"><circle r="58" fill="#6d8f80" stroke="#a9c4b6" stroke-width="2"/><circle r="44" fill="#4f7466"/>' +
        '<path d="M0 0 L0 -44 M0 0 L38 -22 M0 0 L38 22 M0 0 L0 44 M0 0 L-38 22 M0 0 L-38 -22" stroke="#8fb3a3" stroke-width="1.5" opacity="0.6"/><circle r="4" fill="#8fb3a3"/></g>' },
    { name: '印泥盒', hit: [730, 498, 80, 100], label: [770, 585],
      svg: '<g transform="translate(770 535)"><circle r="32" fill="#c9a57a" stroke="#8a6f3f" stroke-width="2"/><circle r="25" fill="#8b2a20"/>' +
        '<ellipse cx="-8" cy="-8" rx="9" ry="5" fill="rgba(255,255,255,0.2)"/></g>' },
    { name: '印章', hit: [826, 500, 92, 90], label: [872, 566],
      svg: '<g transform="translate(872 528)"><rect x="-38" y="-15" width="76" height="30" rx="6" fill="#cfc8b4" stroke="#8c8570" stroke-width="1.5"/>' +
        '<path d="M-24 -6 H12 M-24 6 H12" stroke="#8c8570" stroke-width="1.5"/><rect x="30" y="-15" width="8" height="30" fill="#b23a2e"/></g>' }
  ];

  function deskSvg() {
    var grain = [
      'M0 40 C200 22 400 60 600 38 S900 50 1000 34', 'M0 110 C220 96 420 130 640 108 S920 118 1000 104',
      'M0 190 C180 176 420 208 640 188 S900 198 1000 184', 'M0 270 C240 254 440 288 660 268 S920 278 1000 262',
      'M0 350 C200 336 420 368 640 348 S900 358 1000 344', 'M0 430 C240 414 440 448 660 428 S920 438 1000 422',
      'M0 510 C200 496 420 528 640 508 S900 518 1000 504', 'M0 585 C220 572 440 600 660 584 S920 592 1000 580'
    ].map(function (d) { return '<path class="wf-grain" d="' + d + '"/>'; }).join('');
    var items = SCENE.map(function (s) {
      var label = '<text class="wf-label' + (s.cls ? ' ' + s.cls : '') + '" x="' + s.label[0] + '" y="' + s.label[1] + '">' + s.name + '</text>';
      var seal = s.bao ? '<circle class="wf-seal" cx="' + s.seal[0] + '" cy="' + s.seal[1] + '" r="7"/>' : '';
      return '<g class="wf-item" data-name="' + s.name + '" tabindex="0" role="button" aria-pressed="false" aria-label="' + s.name + '">' +
        '<rect class="wf-hit" x="' + s.hit[0] + '" y="' + s.hit[1] + '" width="' + s.hit[2] + '" height="' + s.hit[3] + '"/>' +
        s.svg + label + seal + '</g>';
    }).join('');
    return '<svg viewBox="0 0 1000 620" role="group" aria-label="一张书案，案上摆着笔、墨、纸、砚和十件案头器物">' +
      '<defs><linearGradient id="wfWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a3d2b"/><stop offset="0.5" stop-color="#52372a"/><stop offset="1" stop-color="#4a3123"/></linearGradient></defs>' +
      '<rect width="1000" height="620" fill="url(#wfWood)"/>' + grain +
      '<rect x="3" y="3" width="994" height="614" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="6"/>' + items + '</svg>';
  }

  /* ---------- 状态 ---------- */
  var current = null;
  var panel = null;
  var svgItems = {};
  var chipBtns = {};
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function scrollTo(node) {
    if (node && node.scrollIntoView) node.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function select(name, opts) {
    var it = byName[name];
    if (!it) return;
    opts = opts || {};
    current = name;
    Object.keys(svgItems).forEach(function (k) {
      var on = k === name;
      svgItems[k].classList.toggle('is-selected', on);
      svgItems[k].setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    Object.keys(chipBtns).forEach(function (k) { chipBtns[k].setAttribute('aria-pressed', k === name ? 'true' : 'false'); });
    renderPanel(it);
    if (opts.push && window.history && history.replaceState) {
      try { history.replaceState(null, '', '?id=' + encodeURIComponent(name)); } catch (e) { /* 忽略 */ }
    }
    if (opts.scroll && window.innerWidth < 1000) scrollTo(panel);
  }

  function renderPanel(it) {
    var idx = D.items.indexOf(it);
    var prev = D.items[(idx + D.items.length - 1) % D.items.length];
    var next = D.items[(idx + 1) % D.items.length];
    var bao = it.cat === '四宝';

    panel.textContent = '';
    panel.appendChild(el('div', { 'class': 'wx-kicker' }, [
      el('span', { 'class': 'wx-tag' + (bao ? ' is-bao' : ''), text: bao ? '文房四宝' : '案头器物' })
    ]));
    panel.appendChild(el('h2', { 'class': 'wx-title', text: it.name }));
    panel.appendChild(el('p', { 'class': 'wx-line', text: it.line }));

    var dl = el('dl', { 'class': 'wx-fields' });
    it.fields.forEach(function (f) {
      var dd = el('dd');
      dd.appendChild(rich(f[1]));
      dl.appendChild(el('div', { 'class': f[0] === '辨析' ? 'is-note' : '' }, [el('dt', { text: f[0] }), dd]));
    });
    panel.appendChild(dl);

    if (it.see && it.see.length) {
      var see = el('div', { 'class': 'wx-see' }, [el('span', { 'class': 'wx-see-label', text: '另见' })]);
      it.see.forEach(function (n) {
        var b = el('button', { type: 'button', 'class': 'wx-chip', text: n });
        b.addEventListener('click', function () { select(n, { push: true }); });
        see.appendChild(b);
      });
      panel.appendChild(see);
    }

    var pb = el('button', { type: 'button', 'class': 'wx-step-btn', text: '← ' + prev.name });
    pb.setAttribute('aria-label', '上一件：' + prev.name);
    pb.addEventListener('click', function () { select(prev.name, { push: true }); });
    var nb = el('button', { type: 'button', 'class': 'wx-step-btn', text: next.name + ' →' });
    nb.setAttribute('aria-label', '下一件：' + next.name);
    nb.addEventListener('click', function () { select(next.name, { push: true }); });
    panel.appendChild(el('div', { 'class': 'wx-stepper' }, [pb, nb]));
  }

  /* ---------- 页面各块 ---------- */
  function buildExplore() {
    var desk = el('div', { 'class': 'wx-desk' });
    desk.innerHTML = deskSvg();
    Array.prototype.forEach.call(desk.querySelectorAll('.wf-item'), function (g) {
      var name = g.getAttribute('data-name');
      svgItems[name] = g;
      g.addEventListener('click', function () { select(name, { push: true, scroll: true }); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(name, { push: true, scroll: true }); }
      });
    });

    var chips = el('div', { 'class': 'wx-chips', role: 'group', 'aria-label': '按名字选器物' });
    D.items.forEach(function (it) {
      var b = el('button', { type: 'button', 'class': 'wx-chip-w' + (it.cat === '四宝' ? ' is-bao' : ''), 'aria-pressed': 'false', text: it.name });
      b.addEventListener('click', function () { select(it.name, { push: true, scroll: true }); });
      chipBtns[it.name] = b;
      chips.appendChild(b);
    });

    panel = el('div', { 'class': 'wx-panel wx-paper', 'aria-live': 'polite' });
    return el('section', { 'class': 'wx-explore', id: 'wx-explore', 'aria-label': '书案' }, [
      el('div', { 'class': 'wx-scene' }, [
        desk,
        el('p', { 'class': 'wx-hint', text: '带朱红小点的是“四宝”。点案上的任何一件，或点下面的名字。' }),
        chips
      ]),
      panel
    ]);
  }

  function buildFlow() {
    var steps = el('div', { 'class': 'wx-steps' });
    D.flow.steps.forEach(function (s, i) {
      var b = el('button', { type: 'button', 'class': 'wx-chip', text: '在书案上看：' + s.item + ' →' });
      b.addEventListener('click', function () {
        select(s.item, { push: true });
        scrollTo(document.getElementById('wx-explore'));
      });
      steps.appendChild(el('div', { 'class': 'wx-step wx-paper' }, [
        el('span', { 'class': 'wx-step-no', text: String(i + 1) }),
        el('h3', { 'class': 'wx-step-name', text: s.name }),
        el('p', { 'class': 'wx-step-text', text: s.text }),
        b
      ]));
    });
    return el('section', { 'class': 'wx-section', 'aria-label': '一次书写' }, [
      el('div', { 'class': 'wx-sec-title', text: '一次书写' }),
      el('p', { 'class': 'wx-lead', text: D.flow.text }),
      steps
    ]);
  }

  var INK = { '焦': ['#0e0b09', '#e9dfc8'], '浓': ['#221b17', '#e9dfc8'], '重': ['#453b34', '#f1e7d1'], '淡': ['#8e857a', '#211a14'], '清': ['#cfc8ba', '#2b2118'] };
  function buildInk() {
    var grid = el('div', { 'class': 'wx-ink' });
    D.ink.levels.forEach(function (l) {
      var c = INK[l.name] || ['#8e857a', '#211a14'];
      var sw = el('div', { 'class': 'wx-swatch', text: l.name, 'aria-hidden': 'true' });
      sw.style.background = c[0];
      sw.style.color = c[1];
      grid.appendChild(el('div', { 'class': 'wx-ink-cell' }, [
        sw,
        el('div', { 'class': 'wx-ink-body' }, [
          el('p', { 'class': 'wx-ink-state', text: l.name + '墨：' + l.state }),
          el('p', { 'class': 'wx-ink-effect', text: l.effect })
        ])
      ]));
    });
    return el('section', { 'class': 'wx-section', 'aria-label': '墨分五色' }, [
      el('div', { 'class': 'wx-sec-title', text: '墨分五色' }),
      el('p', { 'class': 'wx-lead', text: D.ink.text }),
      el('div', { 'class': 'wx-ink-wrap wx-paper' }, [grid, el('p', { 'class': 'wx-remark', text: D.ink.remark })])
    ]);
  }

  function render() {
    var page = el('div', { 'class': 'wx-page' });
    page.appendChild(el('div', { 'class': 'wx-head' }, [
      el('div', { 'class': 'wx-eyebrow', text: '物 · 文房四宝' }),
      el('h1', { 'class': 'wx-hook', text: D.hook }),
      el('p', { 'class': 'wx-answer', text: D.answer })
    ]));
    page.appendChild(el('p', { 'class': 'wx-lead', text: D.intro }));
    page.appendChild(buildExplore());
    page.appendChild(buildFlow());
    page.appendChild(buildInk());
    page.appendChild(el('div', { 'class': 'wx-tip' }, [el('div', { 'class': 'wx-tip-label', text: '小提示' }), el('p', { text: D.tip })]));
    page.appendChild(el('details', { 'class': 'wx-notes' }, [
      el('summary', { text: '批注' }),
      el('div', { 'class': 'wx-notes-body' }, D.notes.map(function (n) {
        var m = n.match(/^([^：]{1,4})：(.*)$/);
        return el('p', {}, m ? [el('span', { 'class': 'wx-note-label', text: m[1] }), document.createTextNode(m[2])] : [document.createTextNode(n)]);
      }))
    ]));

    root.textContent = '';
    root.appendChild(page);

    var wanted = '';
    try { wanted = decodeURIComponent((location.search.match(/[?&]id=([^&]+)/) || [])[1] || ''); } catch (e) { wanted = ''; }
    select(byName[wanted] ? wanted : D.items[0].name, {});
  }

  render();
})();
