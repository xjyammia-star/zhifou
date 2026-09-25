
/* 知否知否 · 佛教体系（六道轮回圆盘 + 佛菩萨卡片墙）脚本
   数据来自 data/fojiao.js（window.ZHIFOU_FOJIAO），本文件只负责排版和交互。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_FOJIAO;
  var root = document.getElementById('app');
  if (!D || !root) return;

  /* "另见"里各页面的地址。写明目标的会直接打开对应人物。 */
  var PAGE_LINKS = {
    '民间神灵': { href: 'shenling.html', withId: true },
    '道教神谱': { href: 'daojiao.html', withId: true },
    '上古神话': { href: 'shenhua.html', withId: true },
    '山海经异兽': { href: 'shanhai.html', withId: true }
  };

  /* 每位人物的配图。有了图，把图片放进 img/shen/ 文件夹，再把对应的空引号改成图片路径，
     例如：'观音菩萨': 'img/shen/guanyin.jpg'。空着的，详情里显示"配图待补"占位。 */
  var IMAGES = {};

  var NS = 'http://www.w3.org/2000/svg';
  var cardByName = {}, realmByName = {};
  D.cards.forEach(function (c) { cardByName[c.name] = c; });
  D.realms.forEach(function (r) { realmByName[r.name] = r; });

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

  var dialog, dialogBody, lastFocus = null;
  var tabBtns = {}, panels = {}, currentTab = 'wheel';
  var sectorEls = {}, realmPanel, worldEls = {}, currentRealm = null;

  /* ---------- 六道圆盘 ---------- */
  var CX = 280, CY = 280, R_OUT = 246, R_IN = 82, GAP = 1.6;
  function pt(r, deg) {
    var a = deg * Math.PI / 180;
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  }
  function sectorPath(a0, a1) {
    var p1 = pt(R_OUT, a0), p2 = pt(R_OUT, a1), p3 = pt(R_IN, a1), p4 = pt(R_IN, a0);
    return 'M' + f(p1[0]) + ' ' + f(p1[1]) + ' A' + R_OUT + ' ' + R_OUT + ' 0 0 1 ' + f(p2[0]) + ' ' + f(p2[1]) +
      ' L' + f(p3[0]) + ' ' + f(p3[1]) + ' A' + R_IN + ' ' + R_IN + ' 0 0 0 ' + f(p4[0]) + ' ' + f(p4[1]) + ' Z';
  }

  function buildWheel() {
    var n = D.realms.length, step = 360 / n;
    var s = svg('svg', { 'class': 'fj-wheel', viewBox: '0 0 560 560', role: 'group', 'aria-label': '六道轮回圆盘，点击某一道查看详情' });
    /* 外圈的顺时针小箭头：表示轮回一圈又一圈 */
    s.appendChild(svg('circle', { cx: CX, cy: CY, r: R_OUT + 14, 'class': 'fj-wheel-ring' }));
    D.realms.forEach(function (r, i) {
      var b = -90 + step * i + step / 2;
      var tip = pt(R_OUT + 14, b + 5), p1 = pt(R_OUT + 8, b - 1), p2 = pt(R_OUT + 20, b - 1);
      s.appendChild(svg('path', { d: 'M' + f(p1[0]) + ' ' + f(p1[1]) + ' L' + f(tip[0]) + ' ' + f(tip[1]) + ' L' + f(p2[0]) + ' ' + f(p2[1]), 'class': 'fj-wheel-arrow' }));
    });
    D.realms.forEach(function (r, i) {
      var mid = -90 + step * i;
      var g = svg('g', { 'class': 'fj-sector', role: 'button', tabindex: '0', 'data-realm': r.name, 'aria-label': r.name + '：' + r.line });
      g.appendChild(svg('path', { d: sectorPath(mid - step / 2 + GAP, mid + step / 2 - GAP), 'class': 'fj-sector-bg' }));
      var lp = pt((R_OUT + R_IN) / 2 + 4, mid);
      g.appendChild(svg('text', { x: f(lp[0]), y: f(lp[1] - 2), 'class': 'fj-sector-name' }, r.name));
      g.appendChild(svg('text', { x: f(lp[0]), y: f(lp[1] + 20), 'class': 'fj-sector-sub' }, r.worlds.length > 1 ? '三界皆有' : r.worlds[0]));
      g.addEventListener('click', function () { selectRealm(r.name); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectRealm(r.name); } });
      s.appendChild(g);
      sectorEls[r.name] = g;
    });
    s.appendChild(svg('circle', { cx: CX, cy: CY, r: R_IN - 8, 'class': 'fj-hub' }));
    s.appendChild(svg('text', { x: CX, y: CY - 4, 'class': 'fj-hub-title' }, '业力'));
    s.appendChild(svg('text', { x: CX, y: CY + 20, 'class': 'fj-hub-sub' }, '轮回不息'));
    return s;
  }

  function dl(rows) {
    var d = el('dl', { 'class': 'sl-fields' });
    rows.forEach(function (r) { if (r[1]) d.appendChild(el('div', { 'class': 'sl-field' + (r[2] ? ' ' + r[2] : '') }, [el('dt', { text: r[0] }), el('dd', { text: r[1] })])); });
    return d;
  }

  function selectRealm(name) {
    var r = realmByName[name];
    if (!r) return;
    currentRealm = name;
    Object.keys(sectorEls).forEach(function (k) {
      var on = k === name;
      sectorEls[k].classList.toggle('is-on', on);
      sectorEls[k].setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    Object.keys(worldEls).forEach(function (k) { worldEls[k].classList.toggle('is-hit', r.worlds.indexOf(k) >= 0); });
    realmPanel.textContent = '';
    realmPanel.appendChild(el('div', { 'class': 'fj-panel-head' }, [
      el('h2', { 'class': 'fj-panel-name', text: r.name }),
      el('span', { 'class': 'sl-pill', text: '所属：' + r.worlds.join('、') })
    ]));
    realmPanel.appendChild(el('p', { 'class': 'fj-panel-line', text: r.line }));
    realmPanel.appendChild(dl([
      ['谁居住', r.dwellers], ['苦乐特点', r.life], ['因什么业而生', r.karma],
      ['主要问题', r.problem], ['说明', r.note], ['典故', r.story, 'is-custom'], ['出处', r.source]
    ]));
  }

  function buildWorlds() {
    var box = el('div', { 'class': 'fj-worlds' });
    D.worlds.forEach(function (w) {
      var body = el('div', { 'class': 'fj-world-body' });
      body.appendChild(el('p', { 'class': 'fj-world-line', text: w.line }));
      body.appendChild(dl([['特征', w.trait], ['包含', w.contains], ['代表', w.reps], ['业因', w.karma], ['限制', w.limit], ['说明', w.note]]));
      var b = el('section', { 'class': 'fj-world', 'aria-label': w.name }, [el('h3', { 'class': 'fj-world-name', text: w.name }), body]);
      box.appendChild(b);
      worldEls[w.name] = b;
    });
    return box;
  }

  function buildWheelTab() {
    realmPanel = el('div', { 'class': 'fj-panel', 'aria-live': 'polite' });
    var explore = el('div', { 'class': 'fj-explore' }, [
      el('div', { 'class': 'fj-wheel-wrap' }, [buildWheel(), el('p', { 'class': 'fj-hint', text: '点一道，看这一道的详情' })]),
      realmPanel
    ]);
    var rule = el('div', { 'class': 'tip-box' }, [el('div', { 'class': 'tip-label', text: '六道的共同规律' }), el('p', { text: D.rule.line }), el('p', { text: D.rule.note })]);
    var worlds = el('section', { 'class': 'xx-section', 'aria-label': '三界' }, [
      el('div', { 'class': 'section-title', text: '三界：六道所处的三层' }),
      el('p', { 'class': 'sl-origin-note', text: D.realmNote }),
      buildWorlds()
    ]);
    return el('div', { 'class': 'fj-tabpage' }, [
      el('p', { 'class': 'sl-origin-note', text: D.wheelNote }), explore, rule, worlds
    ]);
  }

  /* ---------- 佛菩萨卡片墙 ---------- */
  function buildCard(c) {
    var btn = el('button', { type: 'button', 'class': 'sl-card', 'data-name': c.name, 'aria-haspopup': 'dialog' });
    btn.appendChild(el('span', { 'class': 'sl-card-top' }, [el('span', { 'class': 'sl-card-name', text: c.name })]));
    btn.appendChild(el('span', { 'class': 'dj-god-id', text: c.identity }));
    btn.appendChild(el('span', { 'class': 'sl-card-line', text: c.line }));
    btn.appendChild(el('span', { 'class': 'sl-card-roles' }, c.roles.slice(0, 3).map(function (r) { return el('span', { 'class': 'sl-role', text: r }); })));
    btn.addEventListener('click', function () { openDetail(c.name, true); });
    return btn;
  }

  function buildCardsTab() {
    var wall = el('div', { 'class': 'sl-wall' });
    D.cats.forEach(function (cat) {
      var list = D.cards.filter(function (c) { return c.cat === cat.name; });
      wall.appendChild(el('section', { 'class': 'sl-group', 'aria-label': cat.name }, [
        el('div', { 'class': 'sl-group-head' }, [
          el('h2', { 'class': 'sl-group-title', text: cat.name }),
          el('p', { 'class': 'sl-group-line', text: cat.line })
        ]),
        el('div', { 'class': 'sl-grid' }, list.map(buildCard))
      ]));
    });
    return el('div', { 'class': 'fj-tabpage' }, [wall]);
  }

  /* ---------- 详情弹窗 ---------- */
  function seeLink(s) {
    var cfg = PAGE_LINKS[s.page];
    var label = s.page + '·' + s.target;
    if (!cfg) return el('span', { 'class': 'sl-syslink is-soon', title: '对应页面还在制作中', text: label + ' · 页面制作中' });
    return el('a', { 'class': 'sl-syslink', href: cfg.href + (cfg.withId ? '?id=' + encodeURIComponent(s.target) : ''), text: label + ' →' });
  }

  function imageSlot(c) {
    var box = el('div', { 'class': 'sl-image' });
    if (IMAGES[c.name]) {
      box.appendChild(el('img', { src: IMAGES[c.name], alt: c.name + '画像', loading: 'lazy' }));
    } else {
      box.classList.add('is-empty');
      box.appendChild(el('span', { 'class': 'sl-image-note', text: '配图待补 · ' + c.name }));
    }
    return box;
  }

  function renderDetail(c) {
    dialogBody.textContent = '';
    dialogBody.appendChild(imageSlot(c));
    var inner = el('div', { 'class': 'sl-detail' });
    inner.appendChild(el('div', { 'class': 'sl-detail-kicker', text: c.cat + ' · ' + c.identity }));
    inner.appendChild(el('h2', { 'class': 'sl-detail-title', id: 'fj-title', text: c.name }));
    if (c.alias.length) inner.appendChild(el('div', { 'class': 'sl-detail-alias', text: '又称：' + c.alias.join('、') }));
    inner.appendChild(el('p', { 'class': 'sl-detail-line', text: c.line }));
    inner.appendChild(el('p', { 'class': 'sl-detail-body', text: c.body }));
    inner.appendChild(dl([['管什么', c.roles.join('、')], ['出处', c.source], ['典故', c.story, 'is-custom'], ['在体系里', c.relation]]));
    if (c.note) inner.appendChild(el('div', { 'class': 'tip-box sl-note' }, [el('div', { 'class': 'tip-label', text: '辨析' }), el('p', { text: c.note })]));
    if (c.see.length) {
      var see = el('div', { 'class': 'sl-origin' }, [el('span', { 'class': 'sl-origin-label', text: '另见' })]);
      c.see.forEach(function (s) { see.appendChild(seeLink(s)); });
      inner.appendChild(see);
    }
    var idx = D.cards.indexOf(c), n = D.cards.length;
    var prev = D.cards[(idx + n - 1) % n], next = D.cards[(idx + 1) % n];
    var pb = el('button', { type: 'button', 'class': 'sl-btn', text: '← ' + prev.name });
    var nb = el('button', { type: 'button', 'class': 'sl-btn', text: next.name + ' →' });
    pb.addEventListener('click', function () { openDetail(prev.name, false); });
    nb.addEventListener('click', function () { openDetail(next.name, false); });
    inner.appendChild(el('div', { 'class': 'sl-stepper' }, [pb, nb]));
    dialogBody.appendChild(inner);
    dialog.setAttribute('aria-labelledby', 'fj-title');
  }

  function setUrl(params) {
    try {
      var u = new URL(window.location.href);
      Object.keys(params).forEach(function (k) { if (params[k]) u.searchParams.set(k, params[k]); else u.searchParams.delete(k); });
      window.history.replaceState(null, '', u.toString());
    } catch (e) { /* 忽略：地址栏不能改也不影响使用 */ }
  }

  function openDetail(name, fromCard) {
    var c = cardByName[name];
    if (!c) return;
    if (fromCard) lastFocus = document.activeElement;
    renderDetail(c);
    if (!dialog.open) {
      if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
    }
    dialogBody.scrollTop = 0;
    dialog.scrollTop = 0;
    setUrl({ id: name, view: 'cards' });
  }

  function closeDetail() {
    if (dialog.open) { if (dialog.close) dialog.close(); else dialog.removeAttribute('open'); }
  }

  /* ---------- 标签页 ---------- */
  function showTab(key, silent) {
    currentTab = key;
    Object.keys(tabBtns).forEach(function (k) {
      var on = k === key;
      tabBtns[k].classList.toggle('is-on', on);
      tabBtns[k].setAttribute('aria-selected', on ? 'true' : 'false');
      panels[k].hidden = !on;
    });
    if (!silent) setUrl({ view: key === 'cards' ? 'cards' : null, id: null });
  }

  /* ---------- 页面 ---------- */
  function render() {
    var page = el('div', { 'class': 'xx-page fj-page' });

    page.appendChild(el('div', { 'class': 'xx-head' }, [
      el('div', { 'class': 'xx-eyebrow', text: '神 · 佛教体系' }),
      el('h1', { 'class': 'xx-hook', text: D.hook }),
      el('p', { 'class': 'xx-answer', text: D.answer })
    ]));
    page.appendChild(el('section', { 'class': 'xx-section' }, [el('p', { 'class': 'xx-intro', text: D.intro })]));

    var tabs = el('div', { 'class': 'sh-tabs', role: 'tablist', 'aria-label': '佛教体系分栏' });
    [['wheel', '六道轮回'], ['cards', '佛、菩萨与护法']].forEach(function (t) {
      var b = el('button', { type: 'button', 'class': 'sh-tab', role: 'tab', text: t[1] });
      b.addEventListener('click', function () { showTab(t[0]); });
      tabBtns[t[0]] = b;
      tabs.appendChild(b);
    });
    panels.wheel = buildWheelTab();
    panels.cards = buildCardsTab();
    panels.wheel.setAttribute('role', 'tabpanel');
    panels.cards.setAttribute('role', 'tabpanel');
    page.appendChild(el('section', { 'class': 'xx-section', 'aria-label': '佛教体系' }, [tabs, panels.wheel, panels.cards]));

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
      setUrl({ id: null });
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* 忽略 */ } }
    });
    page.appendChild(dialog);

    root.textContent = '';
    root.appendChild(page);
    selectRealm(D.realms[0].name);

    /* 网址参数：?id=观音菩萨 直接打开这位；?id=天道 选中六道里的这一道；?view=cards 打开卡片墙 */
    var id = null, view = null;
    try {
      var u = new URL(window.location.href);
      id = u.searchParams.get('id'); view = u.searchParams.get('view');
    } catch (e) { /* 忽略 */ }
    if (id && realmByName[id]) { showTab('wheel', true); selectRealm(id); }
    else if (id && cardByName[id]) { showTab('cards', true); openDetail(id, false); }
    else showTab(view === 'cards' ? 'cards' : 'wheel', true);
  }

  render();
})();
