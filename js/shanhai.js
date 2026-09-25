/* 知否知否 · 《山海经》异兽图鉴脚本
   数据来自 data/shanhai.js（window.ZHIFOU_SHANHAI），本文件只负责排版和交互。
   卡片、弹窗的样式和"民间神灵"页共用 css/shen.css 里的 sl- 开头的那部分。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_SHANHAI;
  var root = document.getElementById('app');
  if (!D || !root) return;

  /* 每种异兽的配图。有了图，把图片放进 img/shen/ 文件夹，再把对应的空引号改成图片路径，
     例如：'九尾狐': 'img/shen/jiuweihu.jpg'。空着的，详情里显示"配图待补"占位。 */
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

  var state = { place: '全部', form: '全部', func: '全部' };
  var wall, countLine, dialog, dialogBody, lastFocus = null;
  var chips = { place: {}, form: {}, func: {} };

  function matches(c) {
    if (state.place !== '全部' && c.places.indexOf(state.place) < 0) return false;
    if (state.form !== '全部' && c.forms.indexOf(state.form) < 0) return false;
    if (state.func !== '全部' && c.funcs.indexOf(state.func) < 0) return false;
    return true;
  }

  /* ---------- 筛选栏 ---------- */
  function chip(text, group) {
    var b = el('button', { type: 'button', 'class': 'sl-chip', text: text, 'aria-pressed': 'false' });
    b.addEventListener('click', function () { state[group] = text; refresh(); });
    chips[group][text] = b;
    return b;
  }

  function filterRow(label, group, options, aria) {
    var row = el('div', { 'class': 'sl-filter-row', role: 'group', 'aria-label': aria }, [el('span', { 'class': 'sl-filter-label', text: label })]);
    row.appendChild(chip('全部', group));
    options.forEach(function (o) { row.appendChild(chip(o, group)); });
    return row;
  }

  function buildFilters() {
    return el('div', { 'class': 'sl-filters' }, [
      filterRow('篇目', 'place', D.groups.map(function (g) { return g.name; }), '按篇目筛选'),
      filterRow('形态', 'form', D.forms, '按形态筛选'),
      filterRow('功能', 'func', D.funcs, '按功能筛选')
    ]);
  }

  /* ---------- 卡片墙 ---------- */
  function buildCard(c) {
    var btn = el('button', { type: 'button', 'class': 'sl-card', 'data-name': c.name, 'aria-haspopup': 'dialog' });
    btn.appendChild(el('span', { 'class': 'sl-card-top' }, [
      el('span', { 'class': 'sl-card-name', text: c.name }),
      el('span', { 'class': 'sl-pill', text: c.forms.join('·') })
    ]));
    btn.appendChild(el('span', { 'class': 'sl-card-line', text: c.line }));
    btn.appendChild(el('span', { 'class': 'sl-card-roles' }, c.funcs.map(function (r) { return el('span', { 'class': 'sl-role', text: r }); })));
    btn.addEventListener('click', function () { openDetail(c.name, true); });
    return btn;
  }

  function buildWall() {
    wall = el('div', { 'class': 'sl-wall' });
    D.groups.forEach(function (g) {
      var list = D.cards.filter(function (c) { return c.places[0] === g.name; });
      wall.appendChild(el('section', { 'class': 'sl-group', 'data-group': g.name, 'aria-label': g.name }, [
        el('div', { 'class': 'sl-group-head' }, [
          el('h2', { 'class': 'sl-group-title', text: g.name }),
          el('p', { 'class': 'sl-group-line', text: g.line })
        ]),
        el('div', { 'class': 'sl-grid' }, list.map(buildCard))
      ]));
    });
    wall.appendChild(el('p', { 'class': 'sl-empty', hidden: 'hidden', text: '这个组合下暂时没有异兽。换一个篇目、形态或功能试试。' }));
    return wall;
  }

  function refresh() {
    ['place', 'form', 'func'].forEach(function (g) {
      Object.keys(chips[g]).forEach(function (k) {
        var on = k === state[g];
        chips[g][k].classList.toggle('is-on', on);
        chips[g][k].setAttribute('aria-pressed', on ? 'true' : 'false');
      });
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
    countLine.textContent = '共 ' + shown + ' 条' + (shown === D.cards.length ? '' : '（已筛选）');
  }

  /* ---------- 详情弹窗 ---------- */
  function field(label, text, cls) {
    return el('div', { 'class': 'sl-field' + (cls ? ' ' + cls : '') }, [el('dt', { text: label }), el('dd', { text: text })]);
  }

  function imageSlot(c) {
    var box = el('div', { 'class': 'sl-image' });
    if (IMAGES[c.name]) {
      box.appendChild(el('img', { src: IMAGES[c.name], alt: c.name + '配图', loading: 'lazy' }));
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
    inner.appendChild(el('div', { 'class': 'sl-detail-kicker', text: c.places.join('、') + ' · ' + c.forms.join('、') }));
    inner.appendChild(el('h2', { 'class': 'sl-detail-title', id: 'sl-title', text: c.name }));
    inner.appendChild(el('div', { 'class': 'sl-detail-alias', text: '出处：' + c.source }));
    inner.appendChild(el('p', { 'class': 'sl-detail-line', text: c.line }));

    var tags = el('div', { 'class': 'sl-origin' }, [el('span', { 'class': 'sl-origin-label', text: '功能' })]);
    c.funcs.forEach(function (f) { tags.appendChild(el('span', { 'class': 'sl-pill', text: f })); });
    inner.appendChild(tags);

    var dl = el('dl', { 'class': 'sl-fields' });
    dl.appendChild(field('外形', c.look));
    dl.appendChild(field('原文怎么说', c.text));
    inner.appendChild(dl);

    if (c.variants.length) {
      var vbox = el('div', { 'class': 'sl-fields' }, [el('div', { 'class': 'sl-origin-label', text: '同名异形，分开看' })]);
      c.variants.forEach(function (v) {
        vbox.appendChild(field(v.title || '一处记载', v.text, 'is-custom'));
      });
      inner.appendChild(vbox);
    }

    var dl2 = el('dl', { 'class': 'sl-fields' });
    if (c.feature) dl2.appendChild(field('文本特征', c.feature));
    dl2.appendChild(field('文化意义', c.meaning));
    if (c.later) dl2.appendChild(field('后世演变', c.later));
    inner.appendChild(dl2);

    if (c.note) {
      inner.appendChild(el('div', { 'class': 'tip-box sl-note' }, [el('div', { 'class': 'tip-label', text: '辨析' }), el('p', { text: c.note })]));
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
    setUrl(name);
  }

  function closeDetail() {
    if (dialog.open) { if (dialog.close) dialog.close(); else dialog.removeAttribute('open'); }
  }

  /* ---------- 页面 ---------- */
  function render() {
    var page = el('div', { 'class': 'xx-page sl-page' });

    page.appendChild(el('div', { 'class': 'xx-head' }, [
      el('div', { 'class': 'xx-eyebrow', text: '神 · 山海经异兽' }),
      el('h1', { 'class': 'xx-hook', text: D.hook }),
      el('p', { 'class': 'xx-answer', text: D.answer })
    ]));

    page.appendChild(el('section', { 'class': 'xx-section' }, [
      el('p', { 'class': 'xx-intro', text: D.intro })
    ]));

    countLine = el('p', { 'class': 'sl-count', 'aria-live': 'polite' });
    page.appendChild(el('section', { 'class': 'xx-section', 'aria-label': '异兽图鉴' }, [buildFilters(), countLine, buildWall()]));

    page.appendChild(el('section', { 'class': 'xx-section' }, [
      el('div', { 'class': 'section-title', text: '怎么读这些异兽' }),
      el('ol', { 'class': 'xx-steps' }, D.readingTips.map(function (t, i) {
        return el('li', { 'class': 'xx-step' }, [
          el('span', { 'class': 'xx-step-no', 'aria-hidden': 'true', text: String(i + 1) }),
          el('div', {}, [el('p', { text: t })])
        ]);
      })),
      el('p', { 'class': 'sl-origin-note', text: D.herbNote })
    ]));

    page.appendChild(el('section', { 'class': 'xx-section' }, [
      el('div', { 'class': 'section-title', text: '常见误读' }),
      el('div', { 'class': 'xx-misreads' }, D.misreads.map(function (m) {
        return el('details', { 'class': 'xx-misread' }, [el('summary', { text: m.title }), el('p', { text: m.text })]);
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
    dialog = el('dialog', { 'class': 'sl-dialog', 'aria-label': '异兽详情' });
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

    /* 网址里带 ?id=九尾狐 时，直接打开这条 */
    try {
      var id = new URL(window.location.href).searchParams.get('id');
      if (id && cardByName[id]) openDetail(id, false);
    } catch (e) { /* 忽略 */ }
  }

  render();
})();
