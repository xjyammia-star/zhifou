/* 知否知否 · 古籍书架脚本
   数据来自 data/guji.js（window.ZHIFOU_GUJI）；"在上古神话里"一栏，用 data/shenhua.js 里每位人物的
   "主要出处"按书名对应出来。本文件只负责排版和交互。
   详情弹窗的样式和"民间神灵"页共用 css/shen.css 里 sl- 开头的那部分。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_GUJI;
  var S = window.ZHIFOU_SHENHUA;
  var root = document.getElementById('app');
  if (!D || !root) return;

  /* 其他页面的地址（"另见"链接用） */
  var PAGE_LINKS = { '山海经异兽': 'shanhai.html', '上古神话': 'shenhua.html' };

  var bookByName = {};
  D.books.forEach(function (b) { bookByName[b.name] = b; });
  var catIndex = {};
  D.cats.forEach(function (c, i) { catIndex[c.name] = i; });

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (Array.isArray(kids) ? kids : (kids ? [kids] : [])).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  /* 上古神话页里，哪些人物的"主要出处"提到了这本书 */
  function peopleOf(book) {
    if (!S || !S.people) return [];
    return S.people.filter(function (p) { return (p.source || '').indexOf('《' + book.name) >= 0; });
  }

  var mode = 'cat';
  var shelfBox, dialog, dialogBody, lastFocus = null;
  var tabs = {};

  /* ---------- 书架 ---------- */
  function bookBtn(b, i) {
    var btn = el('button', { type: 'button', 'class': 'gj-book', 'data-name': b.name, 'data-cat': String(catIndex[b.cat] || 0), 'aria-haspopup': 'dialog',
      'aria-label': '《' + b.name + '》，' + b.year });
    btn.style.height = (176 + ((i * 37) % 5) * 12) + 'px';
    btn.appendChild(el('span', { 'class': 'gj-book-title', text: b.name }));
    if (b.core) btn.appendChild(el('span', { 'class': 'gj-book-core', 'aria-hidden': 'true', text: '核' }));
    btn.addEventListener('click', function () { openDetail(b.name, true); });
    return btn;
  }

  function renderShelves() {
    shelfBox.textContent = '';
    var groups = mode === 'cat' ? D.cats : D.eras;
    var key = mode === 'cat' ? 'cat' : 'era';
    groups.forEach(function (g) {
      var list = D.books.filter(function (b) { return b[key] === g.name; });
      shelfBox.appendChild(el('section', { 'class': 'gj-shelf', 'aria-label': g.name }, [
        el('div', { 'class': 'sl-group-head' }, [
          el('h2', { 'class': 'sl-group-title', text: g.name }),
          el('p', { 'class': 'sl-group-line', text: g.line })
        ]),
        el('div', { 'class': 'gj-row' }, list.map(bookBtn)),
        el('div', { 'class': 'gj-plank', 'aria-hidden': 'true' })
      ]));
    });
    Object.keys(tabs).forEach(function (k) {
      tabs[k].classList.toggle('is-on', k === mode);
      tabs[k].setAttribute('aria-selected', k === mode ? 'true' : 'false');
    });
  }

  /* ---------- 详情弹窗 ---------- */
  function field(label, text, cls) {
    return el('div', { 'class': 'sl-field' + (cls ? ' ' + cls : '') }, [el('dt', { text: label }), el('dd', { text: text })]);
  }

  function renderDetail(b) {
    dialogBody.textContent = '';
    var inner = el('div', { 'class': 'sl-detail gj-detail' });
    inner.appendChild(el('div', { 'class': 'sl-detail-kicker', text: b.cat + ' · ' + b.era }));
    inner.appendChild(el('h2', { 'class': 'sl-detail-title', id: 'sl-title', text: '《' + b.name + '》' }));
    if (b.core) inner.appendChild(el('p', { 'class': 'sl-detail-line', text: '核心五部之一：' + b.core }));

    var dl = el('dl', { 'class': 'sl-fields' });
    dl.appendChild(field('成书年代', b.year));
    dl.appendChild(field('作者、编者或署名', b.author));
    dl.appendChild(field('代表篇目', b.chapters));
    inner.appendChild(dl);

    inner.appendChild(el('p', { 'class': 'sl-detail-body', text: b.intro }));
    if (b.common) inner.appendChild(el('div', { 'class': 'sl-fields' }, [field('常见内容', b.common, 'is-custom')]));
    if (b.tip) inner.appendChild(el('div', { 'class': 'tip-box sl-note' }, [el('div', { 'class': 'tip-label', text: '读的时候注意' }), el('p', { text: b.tip })]));

    var ppl = peopleOf(b);
    if (ppl.length) {
      var box = el('div', { 'class': 'sl-fields' }, [el('div', { 'class': 'sl-origin-label', text: '在上古神话里，这些人物的故事见于这本书' })]);
      var row = el('div', { 'class': 'sh-story-people' });
      ppl.forEach(function (p) {
        row.appendChild(el('a', { 'class': 'sh-chip gj-chip', href: PAGE_LINKS['上古神话'] + '?id=' + encodeURIComponent(p.name), text: p.name }));
      });
      box.appendChild(row);
      inner.appendChild(box);
    }

    if (b.see.length) {
      var see = el('div', { 'class': 'sl-origin' }, [el('span', { 'class': 'sl-origin-label', text: '另见' })]);
      b.see.forEach(function (s) {
        var href = PAGE_LINKS[s.page];
        var label = s.page + (s.id ? ' · ' + s.id : '');
        if (href) see.appendChild(el('a', { 'class': 'sl-syslink', href: href + (s.id ? '?id=' + encodeURIComponent(s.id) : ''), text: label + ' →' }));
        else see.appendChild(el('span', { 'class': 'sl-syslink is-soon', text: label + ' · 页面制作中' }));
      });
      inner.appendChild(see);
    }

    var idx = D.books.indexOf(b), n = D.books.length;
    var prev = D.books[(idx + n - 1) % n], next = D.books[(idx + 1) % n];
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

  function openDetail(name, fromClick) {
    var b = bookByName[name];
    if (!b) return;
    if (fromClick) lastFocus = document.activeElement;
    renderDetail(b);
    if (!dialog.open) {
      if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
    }
    dialogBody.scrollTop = 0;
    setUrl(name);
  }

  function closeDetail() {
    if (dialog.open) { if (dialog.close) dialog.close(); else dialog.removeAttribute('open'); }
  }

  function bookChip(name) {
    var b = el('button', { type: 'button', 'class': 'sh-chip', text: '《' + name + '》' });
    b.addEventListener('click', function () { openDetail(name, true); });
    return b;
  }

  /* ---------- 页面 ---------- */
  function render() {
    var page = el('div', { 'class': 'xx-page sl-page' });

    page.appendChild(el('div', { 'class': 'xx-head' }, [
      el('div', { 'class': 'xx-eyebrow', text: '神 · 古籍书架' }),
      el('h1', { 'class': 'xx-hook', text: D.hook }),
      el('p', { 'class': 'xx-answer', text: D.answer })
    ]));
    page.appendChild(el('section', { 'class': 'xx-section' }, [
      el('p', { 'class': 'xx-intro', text: D.intro }),
      el('p', { 'class': 'sl-origin-note', text: D.eraNote })
    ]));

    var tabBar = el('div', { 'class': 'sh-tabs', role: 'tablist', 'aria-label': '选择排法' });
    [['cat', '按内容分架'], ['era', '按年代分架']].forEach(function (t) {
      var b = el('button', { type: 'button', 'class': 'sh-tab', role: 'tab', text: t[1], 'aria-selected': 'false' });
      b.addEventListener('click', function () { mode = t[0]; renderShelves(); });
      tabs[t[0]] = b;
      tabBar.appendChild(b);
    });
    shelfBox = el('div', { 'class': 'gj-shelves' });
    page.appendChild(el('section', { 'class': 'xx-section', 'aria-label': '书架' }, [
      tabBar,
      el('p', { 'class': 'sh-hint', text: '书脊上带“核”字的，是最核心的五部。点一本书，抽出来看。' }),
      shelfBox
    ]));

    page.appendChild(el('section', { 'class': 'xx-section' }, [
      el('div', { 'class': 'section-title', text: '想读什么，先翻哪本' }),
      el('ul', { 'class': 'gj-purposes' }, D.purposes.map(function (p) {
        return el('li', { 'class': 'gj-purpose' }, [
          el('span', { 'class': 'gj-purpose-want', text: p.want }),
          el('span', { 'class': 'gj-purpose-books' }, p.books.map(bookChip))
        ]);
      }))
    ]));

    var cores = D.books.filter(function (b) { return b.core; });
    page.appendChild(el('section', { 'class': 'xx-section' }, [
      el('div', { 'class': 'section-title', text: '最核心的五部' }),
      el('div', { 'class': 'gj-cores' }, cores.map(function (b) {
        var btn = el('button', { type: 'button', 'class': 'xx-use gj-core-card' }, [el('h3', { text: '《' + b.name + '》' }), el('p', { text: b.core })]);
        btn.addEventListener('click', function () { openDetail(b.name, true); });
        return btn;
      }))
    ]));

    page.appendChild(el('section', { 'class': 'xx-section' }, [
      el('div', { 'class': 'section-title', text: '年代和作者，怎么看' }),
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

    dialog = el('dialog', { 'class': 'sl-dialog', 'aria-label': '书的详情' });
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
    renderShelves();

    /* 网址里带 ?id=山海经 时，直接打开这本书 */
    try {
      var id = new URL(window.location.href).searchParams.get('id');
      if (id && bookByName[id]) openDetail(id, false);
    } catch (e) { /* 忽略 */ }
  }

  render();
})();
