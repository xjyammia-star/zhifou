
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

  /* ---------- 金字塔 ---------- */
  function buildGod(c) {
    var btn = el('button', { type: 'button', 'class': 'dj-god', 'data-name': c.name, 'aria-haspopup': 'dialog', title: c.line });
    btn.appendChild(el('span', { 'class': 'dj-god-name', text: c.name }));
    btn.appendChild(el('span', { 'class': 'dj-god-id', text: c.identity }));
    btn.addEventListener('click', function () { openDetail(c.name, true); });
    return btn;
  }

  function buildTier(t, i, total) {
    var list = D.cards.filter(function (c) { return c.tier === t.name; });
    var sec = el('section', { 'class': 'dj-tier' + (t.side ? ' is-side' : ''), 'aria-label': t.name });
    if (!t.side) sec.style.setProperty('--w', String(72 + Math.round(i * 28 / Math.max(total - 1, 1))) + '%');
    sec.appendChild(el('div', { 'class': 'dj-tier-head' }, [
      el('span', { 'class': 'dj-tier-no', 'aria-hidden': 'true', text: t.side ? '另' : String(i + 1) }),
      el('h2', { 'class': 'dj-tier-name', text: t.name }),
      el('p', { 'class': 'dj-tier-line', text: t.line })
    ]));
    sec.appendChild(el('div', { 'class': 'dj-gods' }, list.map(buildGod)));
    sec.appendChild(el('p', { 'class': 'dj-tier-note', text: t.note }));
    return sec;
  }

  function buildPyramid() {
    var wrap = el('div', { 'class': 'dj-pyramid' });
    var main = D.tiers.filter(function (t) { return !t.side; });
    var side = D.tiers.filter(function (t) { return t.side; });
    var stack = el('div', { 'class': 'dj-stack' });
    main.forEach(function (t, i) { stack.appendChild(buildTier(t, i, main.length)); });
    wrap.appendChild(stack);
    side.forEach(function (t) { wrap.appendChild(buildTier(t, 0, 1)); });
    return wrap;
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

    page.appendChild(el('section', { 'class': 'xx-section', 'aria-label': '道教神谱金字塔' }, [buildPyramid()]));

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

    /* 网址里带 ?id=玉皇大帝 时，直接打开这位神灵（其他页面的链接可以直接指过来） */
    try {
      var id = new URL(window.location.href).searchParams.get('id');
      if (id && cardByName[id]) openDetail(id, false);
    } catch (e) { /* 忽略 */ }
  }

  render();
})();
