
/* 知否知否 · 道教神谱（层级金字塔）脚本
   数据来自 data/daojiao.js（window.ZHIFOU_DAOJIAO），本文件只负责排版和交互。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_DAOJIAO;
  var root = document.getElementById('app');
  if (!D || !root) return;

  /* "另见"里各页面的地址。写明目标的会直接打开对应人物；二十八宿页没有单独的人物详情，只跳到页面。 */
  var PAGE_LINKS = {
    '上古神话': { href: 'shenhua.html', withId: true },
    '民间神灵': { href: 'shenling.html', withId: true },
    '山海经异兽': { href: 'shanhai.html', withId: true },
    '二十八宿': { href: 'xingxiu.html', withId: false }
  };

  /* 每位神灵的配图。有了图，把图片放进 img/shen/ 文件夹，再把对应的空引号改成图片路径，
     例如：'元始天尊': 'img/shen/yuanshi.jpg'。空着的，详情里显示"配图待补"占位。 */
  var IMAGES = {};

  var cardByName = {};
  D.cards.forEach(function (c) { cardByName[c.name] = c; });

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (Array.isArray(kids) ? kids : (kids ? [kids] : [])).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  var dialog, dialogBody, lastFocus = null;

  /* ---------- 金字塔（左）+ 神灵面板（右） ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs, text) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text != null) n.textContent = text;
    return n;
  }

  var tierByName = {}, tierEls = {}, panel, current = null;
  D.tiers.forEach(function (t) { tierByName[t.name] = t; });

  function buildGod(c) {
    var btn = el('button', { type: 'button', 'class': 'dj-god', 'data-name': c.name, 'aria-haspopup': 'dialog', title: c.line });
    btn.appendChild(el('span', { 'class': 'dj-god-name', text: c.name }));
    btn.appendChild(el('span', { 'class': 'dj-god-id', text: c.identity }));
    btn.addEventListener('click', function () { openDetail(c.name, true); });
    return btn;
  }

  /* 三角形塔：顶点在上，按高度切成几层，每层是一个梯形，正好拼成完整的三角形 */
  function buildTower() {
    var main = D.tiers.filter(function (t) { return !t.side; });
    var side = D.tiers.filter(function (t) { return t.side; });
    var VW = 520, apexY = 14, baseY = 470, cx = VW / 2, halfBase = 250, gap = 5;
    var n = main.length, h = (baseY - apexY) / n;
    var s = svg('svg', { 'class': 'dj-tower', viewBox: '0 0 ' + VW + ' ' + (side.length ? 540 : 490), role: 'group', 'aria-label': '道教神谱金字塔，点击某一层查看这一层的神灵' });

    /* 塔尖是完整的尖角（top0 = 0）；最上面一层做高一些，"三清"两个字放在它靠下的位置才装得下；
       各层高度按权重分配 */
    var top0 = 0, weights = main.map(function (t, i) { return i === 0 ? 1.9 : 1; });
    var wsum = weights.reduce(function (p, q) { return p + q; }, 0), edges = [apexY];
    weights.forEach(function (w) { edges.push(edges[edges.length - 1] + w / wsum * (baseY - apexY)); });
    function halfAt(y) { return top0 + (y - apexY) / (baseY - apexY) * (halfBase - top0); }

    main.forEach(function (t, i) {
      var y0 = edges[i] + (i ? gap / 2 : 0), y1 = edges[i + 1] - (i < n - 1 ? gap / 2 : 0);
      var a = halfAt(y0), b = halfAt(y1);
      var pts = [cx - a, y0, cx + a, y0, cx + b, y1, cx - b, y1].join(' ');
      var count = D.cards.filter(function (c) { return c.tier === t.name; }).length;
      var g = svg('g', { 'class': 'dj-layer', role: 'button', tabindex: '0', 'data-tier': t.name, 'aria-label': t.name + '，共 ' + count + ' 位，点击查看' });
      g.appendChild(svg('polygon', { points: pts, 'class': 'dj-layer-bg' }));
      var ty = i === 0 ? y1 - 34 : (y0 + y1) / 2;
      g.appendChild(svg('text', { x: cx, y: ty - 2, 'class': 'dj-layer-name' }, t.name));
      g.appendChild(svg('text', { x: cx, y: ty + 20, 'class': 'dj-layer-count' }, count + ' 位'));
      g.addEventListener('click', function () { selectTier(t.name); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectTier(t.name); } });
      s.appendChild(g);
      tierEls[t.name] = g;
    });

    side.forEach(function (t) {
      var count = D.cards.filter(function (c) { return c.tier === t.name; }).length;
      var y = baseY + 16;
      var g = svg('g', { 'class': 'dj-layer is-side', role: 'button', tabindex: '0', 'data-tier': t.name, 'aria-label': t.name + '，共 ' + count + ' 位，点击查看' });
      g.appendChild(svg('rect', { x: cx - halfBase, y: y, width: halfBase * 2, height: 52, rx: 3, 'class': 'dj-layer-bg' }));
      g.appendChild(svg('text', { x: cx, y: y + 22, 'class': 'dj-layer-name' }, t.name + '（金字塔之外）'));
      g.appendChild(svg('text', { x: cx, y: y + 41, 'class': 'dj-layer-count' }, count + ' 位'));
      g.addEventListener('click', function () { selectTier(t.name); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectTier(t.name); } });
      s.appendChild(g);
      tierEls[t.name] = g;
    });
    return s;
  }

  function selectTier(name) {
    var t = tierByName[name];
    if (!t) return;
    current = name;
    Object.keys(tierEls).forEach(function (k) {
      var on = k === name;
      tierEls[k].classList.toggle('is-on', on);
      tierEls[k].setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var idx = D.tiers.filter(function (x) { return !x.side; }).indexOf(t);
    var list = D.cards.filter(function (c) { return c.tier === name; });
    panel.textContent = '';
    panel.appendChild(el('div', { 'class': 'dj-panel-head' }, [
      el('span', { 'class': 'dj-tier-no', 'aria-hidden': 'true', text: t.side ? '另' : String(idx + 1) }),
      el('h2', { 'class': 'dj-tier-name', text: t.name })
    ]));
    panel.appendChild(el('p', { 'class': 'dj-tier-line', text: t.line }));
    panel.appendChild(el('div', { 'class': 'dj-gods' }, list.map(buildGod)));
    panel.appendChild(el('p', { 'class': 'dj-tier-note', text: t.note }));
  }

  function buildExplorer() {
    panel = el('div', { 'class': 'dj-panel', 'aria-live': 'polite' });
    return el('div', { 'class': 'dj-explore' }, [
      el('div', { 'class': 'dj-tower-wrap' }, [buildTower(), el('p', { 'class': 'dj-tower-hint', text: '点一层，看这一层的神灵' })]),
      panel
    ]);
  }

  /* ---------- 详情弹窗 ---------- */
  function seeLink(s) {
    var cfg = PAGE_LINKS[s.page];
    var label = s.page + '·' + s.target;
    if (!cfg) return el('span', { 'class': 'sl-syslink is-soon', title: '对应页面还在制作中', text: label + ' · 页面制作中' });
    var href = cfg.href + (cfg.withId ? '?id=' + encodeURIComponent(s.target) : '');
    return el('a', { 'class': 'sl-syslink', href: href, text: label + ' →' });
  }

  function field(label, text, cls) {
    return el('div', { 'class': 'sl-field' + (cls ? ' ' + cls : '') }, [el('dt', { text: label }), el('dd', { text: text })]);
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
    inner.appendChild(el('div', { 'class': 'sl-detail-kicker', text: c.tier + ' · ' + c.identity }));
    inner.appendChild(el('h2', { 'class': 'sl-detail-title', id: 'dj-title', text: c.name }));
    if (c.alias.length) inner.appendChild(el('div', { 'class': 'sl-detail-alias', text: '又称：' + c.alias.join('、') }));
    inner.appendChild(el('p', { 'class': 'sl-detail-line', text: c.line }));
    inner.appendChild(el('p', { 'class': 'sl-detail-body', text: c.body }));

    var dl = el('dl', { 'class': 'sl-fields' });
    dl.appendChild(field('管什么', c.roles.join('、')));
    dl.appendChild(field('出处', c.source));
    if (c.story) dl.appendChild(field('典故', c.story, 'is-custom'));
    if (c.relation) dl.appendChild(field('在神谱里', c.relation));
    inner.appendChild(dl);

    if (c.note) {
      inner.appendChild(el('div', { 'class': 'tip-box sl-note' }, [el('div', { 'class': 'tip-label', text: '辨析' }), el('p', { text: c.note })]));
    }

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
    dialog.setAttribute('aria-labelledby', 'dj-title');
  }

  function setUrl(name) {
    try {
      var u = new URL(window.location.href);
      if (name) u.searchParams.set('id', name); else u.searchParams.delete('id');
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
    setUrl(name);
  }

  function closeDetail() {
    if (dialog.open) { if (dialog.close) dialog.close(); else dialog.removeAttribute('open'); }
  }

  /* ---------- 页面 ---------- */
  function render() {
    var page = el('div', { 'class': 'xx-page dj-page' });

    page.appendChild(el('div', { 'class': 'xx-head' }, [
      el('div', { 'class': 'xx-eyebrow', text: '神 · 道教神谱' }),
      el('h1', { 'class': 'xx-hook', text: D.hook }),
      el('p', { 'class': 'xx-answer', text: D.answer })
    ]));

    page.appendChild(el('section', { 'class': 'xx-section' }, [
      el('p', { 'class': 'xx-intro', text: D.intro }),
      el('p', { 'class': 'sl-origin-note', text: D.tierNote })
    ]));

    page.appendChild(el('section', { 'class': 'xx-section', 'aria-label': '道教神谱金字塔' }, [buildExplorer()]));

    page.appendChild(el('div', { 'class': 'tip-box' }, [el('div', { 'class': 'tip-label', text: '小提示' }), el('p', { text: D.tip })]));

    page.appendChild(el('details', { 'class': 'notes' }, [
      el('summary', { text: '批注' }),
      el('div', { 'class': 'notes-body' }, D.notes.map(function (n) {
        var m = n.match(/^([^：]{1,4})：(.*)$/);
        return el('p', {}, m ? [el('span', { 'class': 'note-label', text: m[1] }), document.createTextNode(m[2])] : [document.createTextNode(n)]);
      }))
    ]));

    dialog = el('dialog', { 'class': 'sl-dialog', 'aria-label': '神灵详情' });
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
    selectTier(D.tiers[0].name);

    /* 网址里带 ?id=玉皇大帝 时，直接打开这位神灵（其他页面的链接可以直接指过来） */
    try {
      var id = new URL(window.location.href).searchParams.get('id');
      if (id && cardByName[id]) { selectTier(cardByName[id].tier); openDetail(id, false); }
    } catch (e) { /* 忽略 */ }
  }

  render();
})();
