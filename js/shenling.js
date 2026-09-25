/* 知否知否 · 民间神灵卡片墙脚本
   数据来自 data/shenling.js（window.ZHIFOU_SHENLING），本文件只负责排版和交互。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_SHENLING;
  var root = document.getElementById('app');
  if (!D || !root) return;

  /* 出处体系的页面链接。对应体系的页面做好后，把空引号改成页面地址即可，
     例如：'佛教': 'fojiao.html'。空着的，卡片上会显示"对应页面制作中"。 */
  var SYSTEM_LINKS = { '佛教': 'fojiao.html', '道教': 'daojiao.html', '上古神话': 'shenhua.html' };

  /* 每位神灵的配图。有了图，把图片放进 img/shen/ 文件夹，再把对应的空引号改成图片路径，
     例如：'关公': 'img/shen/guangong.jpg'。空着的，详情里显示"配图待补"占位。 */
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

  var ORIGIN_OPTIONS = ['纯民间', '佛教', '道教', '上古神话'];
  var state = { cat: '全部', origin: '全部' };
  var wall, countLine, dialog, dialogBody, lastFocus = null;
  var chipsCat = {}, chipsOrigin = {};

  function baseName(s) { return s.replace(/（.*?）/g, ''); }

  function matches(c) {
    if (state.cat !== '全部' && c.cat !== state.cat) return false;
    if (state.origin === '全部') return true;
    if (state.origin === '纯民间') return c.systems.length === 0;
    return c.systems.indexOf(state.origin) >= 0;
  }

  /* ---------- 筛选栏 ---------- */
  function chip(text, group, store) {
    var b = el('button', { type: 'button', 'class': 'sl-chip', text: text, 'aria-pressed': 'false' });
    b.addEventListener('click', function () { state[group] = text; refresh(); });
    store[text] = b;
    return b;
  }

  function buildFilters() {
    var rowCat = el('div', { 'class': 'sl-filter-row', role: 'group', 'aria-label': '按生活场景筛选' }, [el('span', { 'class': 'sl-filter-label', text: '场景' })]);
    rowCat.appendChild(chip('全部', 'cat', chipsCat));
    D.cats.forEach(function (c) { rowCat.appendChild(chip(c.name, 'cat', chipsCat)); });
    var rowOrigin = el('div', { 'class': 'sl-filter-row', role: 'group', 'aria-label': '按出处体系筛选' }, [el('span', { 'class': 'sl-filter-label', text: '出处' })]);
    rowOrigin.appendChild(chip('全部', 'origin', chipsOrigin));
    ORIGIN_OPTIONS.forEach(function (o) { rowOrigin.appendChild(chip(o, 'origin', chipsOrigin)); });
    return el('div', { 'class': 'sl-filters' }, [rowCat, rowOrigin]);
  }

  /* ---------- 卡片墙 ---------- */
  function originPill(c) {
    if (!c.systems.length) return null;
    return el('span', { 'class': 'sl-pill', text: c.systems.join('·') });
  }

  function buildCard(c) {
    var btn = el('button', { type: 'button', 'class': 'sl-card', 'data-name': c.name, 'aria-haspopup': 'dialog' });
    btn.appendChild(el('span', { 'class': 'sl-card-top' }, [
      el('span', { 'class': 'sl-card-name', text: baseName(c.name) }),
      originPill(c)
    ]));
    btn.appendChild(el('span', { 'class': 'sl-card-line', text: c.line }));
    btn.appendChild(el('span', { 'class': 'sl-card-roles' }, c.roles.slice(0, 3).map(function (r) { return el('span', { 'class': 'sl-role', text: r }); })));
    btn.addEventListener('click', function () { openDetail(c.name, true); });
    return btn;
  }

  function buildWall() {
    wall = el('div', { 'class': 'sl-wall' });
    D.cats.forEach(function (cat) {
      var list = D.cards.filter(function (c) { return c.cat === cat.name; });
      var sec = el('section', { 'class': 'sl-group', 'data-cat': cat.name, 'aria-label': cat.name }, [
        el('div', { 'class': 'sl-group-head' }, [
          el('h2', { 'class': 'sl-group-title', text: cat.name }),
          el('p', { 'class': 'sl-group-line', text: cat.line })
        ]),
        el('div', { 'class': 'sl-grid' }, list.map(buildCard))
      ]);
      wall.appendChild(sec);
    });
    wall.appendChild(el('p', { 'class': 'sl-empty', hidden: 'hidden', text: '这个组合下暂时没有神灵。换一个场景或出处试试。' }));
    return wall;
  }

  function refresh() {
    Object.keys(chipsCat).forEach(function (k) {
      var on = k === state.cat;
      chipsCat[k].classList.toggle('is-on', on);
      chipsCat[k].setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    Object.keys(chipsOrigin).forEach(function (k) {
      var on = k === state.origin;
      chipsOrigin[k].classList.toggle('is-on', on);
      chipsOrigin[k].setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var shown = 0;
    Array.prototype.forEach.call(wall.querySelectorAll('.sl-group'), function (sec) {
      var any = 0;
      Array.prototype.forEach.call(sec.querySelectorAll('.sl-card'), function (btn) {
        var ok = matches(cardByName[btn.getAttribute('data-name')]);
        btn.hidden = !ok;
        if (ok) any++;
      });
      sec.hidden = any === 0;
      shown += any;
    });
    wall.querySelector('.sl-empty').hidden = shown !== 0;
    countLine.textContent = '共 ' + shown + ' 位神灵' + (shown === D.cards.length ? '' : '（已筛选）');
  }

  /* ---------- 详情弹窗 ---------- */
  function systemLink(name, label) {
    var key = baseName(name);
    var href = SYSTEM_LINKS[key];
    /* 写成"上古神话（神农）"的，括号里的名字会作为详情页里的人物名，直接打开他 */
    var target = (name.match(/（(.*?)）/) || [])[1];
    if (href && target) href += '?id=' + encodeURIComponent(target);
    if (href) {
      return el('a', { 'class': 'sl-syslink', href: href, text: label + ' →' });
    }
    return el('span', { 'class': 'sl-syslink is-soon', title: '对应体系的页面还在制作中', text: label + ' · 页面制作中' });
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
      box.appendChild(el('span', { 'class': 'sl-image-note', text: '配图待补 · ' + baseName(c.name) }));
    }
    return box;
  }

  function renderDetail(c) {
    dialogBody.textContent = '';
    dialogBody.appendChild(imageSlot(c));
    var inner = el('div', { 'class': 'sl-detail' });
    inner.appendChild(el('div', { 'class': 'sl-detail-kicker', text: c.cat + ' · ' + c.source }));
    var title = el('h2', { 'class': 'sl-detail-title', id: 'sl-title', text: baseName(c.name) });
    inner.appendChild(title);
    var extra = (c.name.match(/（(.*?)）/) || [])[1];
    if (c.alias.length || extra) inner.appendChild(el('div', { 'class': 'sl-detail-alias', text: (extra ? '包括：' + extra : '') + (extra && c.alias.length ? '；' : '') + (c.alias.length ? '又称：' + c.alias.join('、') : '') }));
    inner.appendChild(el('p', { 'class': 'sl-detail-line', text: c.line }));

    if (c.systems.length) {
      var box = el('div', { 'class': 'sl-origin' }, [el('span', { 'class': 'sl-origin-label', text: '出处体系' })]);
      c.systems.forEach(function (s) { box.appendChild(systemLink(s, s)); });
      inner.appendChild(box);
    }

    inner.appendChild(el('p', { 'class': 'sl-detail-body', text: c.body }));

    var dl = el('dl', { 'class': 'sl-fields' });
    dl.appendChild(field('管什么', c.roles.join('、')));
    dl.appendChild(field('在哪里拜', c.scene));
    if (c.custom) dl.appendChild(field('习俗', c.custom, 'is-custom'));
    inner.appendChild(dl);

    if (c.note) {
      inner.appendChild(el('div', { 'class': 'tip-box sl-note' }, [el('div', { 'class': 'tip-label', text: '辨析' }), el('p', { text: c.note })]));
    }

    /* "另见"里和"出处体系"重复的不再重复显示 */
    var seeOnly = c.see.filter(function (s) { return c.systems.indexOf(baseName(s)) < 0; });
    if (seeOnly.length) {
      var see = el('div', { 'class': 'sl-origin' }, [el('span', { 'class': 'sl-origin-label', text: '另见' })]);
      seeOnly.forEach(function (s) { see.appendChild(systemLink(s, s)); });
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
    dialog.setAttribute('aria-labelledby', 'sl-title');
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
    var page = el('div', { 'class': 'xx-page sl-page' });

    page.appendChild(el('div', { 'class': 'xx-head' }, [
      el('div', { 'class': 'xx-eyebrow', text: '神 · 民间神灵' }),
      el('h1', { 'class': 'xx-hook', text: D.hook }),
      el('p', { 'class': 'xx-answer', text: D.answer })
    ]));

    page.appendChild(el('section', { 'class': 'xx-section' }, [
      el('p', { 'class': 'xx-intro', text: D.intro }),
      el('p', { 'class': 'sl-origin-note', text: D.originNote })
    ]));

    countLine = el('p', { 'class': 'sl-count', 'aria-live': 'polite' });
    page.appendChild(el('section', { 'class': 'xx-section', 'aria-label': '神灵卡片墙' }, [buildFilters(), countLine, buildWall()]));

    page.appendChild(el('section', { 'class': 'xx-section' }, [
      el('div', { 'class': 'section-title', text: '怎么读这些神灵' }),
      el('ol', { 'class': 'xx-steps' }, D.readingTips.map(function (t, i) {
        return el('li', { 'class': 'xx-step' }, [
          el('span', { 'class': 'xx-step-no', 'aria-hidden': 'true', text: String(i + 1) }),
          el('div', {}, [el('p', { text: t })])
        ]);
      }))
    ]));

    page.appendChild(el('div', { 'class': 'tip-box' }, [el('div', { 'class': 'tip-label', text: '小提示' }), el('p', { text: D.tip })]));

    page.appendChild(el('details', { 'class': 'notes' }, [
      el('summary', { text: '批注' }),
      el('div', { 'class': 'notes-body' }, D.notes.map(function (n) {
        var m = n.match(/^([^：]{1,4})：(.*)$/);
        return el('p', {}, m ? [el('span', { 'class': 'note-label', text: m[1] }), document.createTextNode(m[2])] : [document.createTextNode(n)]);
      }))
    ]));

    /* 详情弹窗 */
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
    refresh();

    /* 网址里带 ?id=关公 时，直接打开这位神灵（以后其他页面的链接可以直接指过来） */
    try {
      var id = new URL(window.location.href).searchParams.get('id');
      if (id && cardByName[id]) openDetail(id, false);
    } catch (e) { /* 忽略 */ }
  }

  render();
})();
