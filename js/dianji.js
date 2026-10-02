/* 知否知否 · “典籍”书架页（dianji.html）
   数据：data/dianji-index.js（由 工具脚本\生成典籍数据.py 生成）。
   两种看法：按类型（十类，每类一张头图 + 书卡）、按朝代；顶部有搜索（书名、作者、简介关键词）。
   还没整理好的类，显示“整理中”，不放书卡。点书卡进入 dianji-book.html?id=书的代号。 */
(function () {
  'use strict';
  var Z = window.ZY, D = window.ZF_DJ_INDEX, el = Z && Z.el;
  var root = document.getElementById('app');
  if (!Z || !D || !root) return;

  var cards = [];          /* 所有书卡节点，搜索时统一显隐 */
  var secs = [];           /* 所有分区（类 / 朝代），整区没有书时隐藏 */

  function stripTitle(t) { return t.replace(/[《》]/g, ''); }

  function bookCard(b, catName) {
    var a = el('a', { 'class': 'dj-card', href: 'dianji-book.html?id=' + encodeURIComponent(b.id) }, [
      el('span', { 'class': 'dj-card-title', text: b.title }),
      el('span', { 'class': 'dj-card-meta', text: b.auth }),
      el('p', { 'class': 'dj-card-line', text: b.line }),
      catName ? el('span', { 'class': 'dj-card-cat', text: catName }) : null
    ]);
    a.setAttribute('data-q', (b.title + b.auth + b.line + (catName || '')).replace(/[\s《》“”，。、；：]/g, '').toLowerCase());
    cards.push(a);
    return a;
  }

  /* 分类头图：登记表里有就显示，没有就只显示文字 */
  function catHead(c) {
    var info = window.ZIMG && window.ZIMG.get ? window.ZIMG.get('diji', c.img) : null;
    /* 标题行：类别名字稍大，旁边小字写简介和收录数量 */
    var text = el('div', { 'class': 'dj-cat-title' }, [
      el('h2', { 'class': 'dj-cat-name', text: c.name }),
      el('span', { 'class': 'dj-cat-sub', text: c.blurb + (c.books.length ? ' 已收录 ' + c.books.length + ' 本' : ' 整理中') })
    ]);
    if (!info) return el('div', { 'class': 'dj-cat-head is-noimg' }, [text]);
    var img = el('img', { src: info.src, srcset: info.srcset, sizes: '(max-width: 720px) 94vw, 1100px', alt: c.name, loading: 'lazy', decoding: 'async' });
    var fig = el('figure', { 'class': 'dj-cat-img' }, [img, info.ai ? el('figcaption', { text: info.aiLabel || 'AI 生成插画' }) : null]);
    return el('div', { 'class': 'dj-cat-head' }, [text, fig]);
  }

  function typeView() {
    var wrap = el('div', { 'class': 'dj-view', 'data-view': 'type' });
    D.cats.forEach(function (c) {
      var kids = [catHead(c)];
      if (c.books.length) kids.push(el('div', { 'class': 'dj-grid' }, c.books.map(function (b) { return bookCard(b); })));
      else kids.push(el('p', { 'class': 'dj-soon', text: '这一类还在整理，整理好会陆续上架。' }));
      var s = el('section', { 'class': 'dj-cat', 'aria-label': c.name }, kids);
      s.setAttribute('data-has', c.books.length ? '1' : '0');
      s.setAttribute('data-cat', c.name);
      secs.push(s);
      wrap.appendChild(s);
    });
    return wrap;
  }

  function dynView() {
    var wrap = el('div', { 'class': 'dj-view', 'data-view': 'dyn', hidden: 'hidden' });
    D.dyns.forEach(function (dyn) {
      var list = [];
      D.cats.forEach(function (c) {
        c.books.forEach(function (b) { if (b.dyn === dyn) list.push({ b: b, c: c.name }); });
      });
      if (!list.length) return;
      var s = el('section', { 'class': 'dj-cat', 'aria-label': dyn }, [
        el('div', { 'class': 'dj-cat-head is-noimg' }, [el('div', {}, [
          el('h2', { 'class': 'dj-cat-name', text: dyn }),
          el('span', { 'class': 'dj-cat-n', text: list.length + ' 本' })
        ])]),
        el('div', { 'class': 'dj-grid' }, list.map(function (x) { return bookCard(x.b, x.c); }))
      ]);
      s.setAttribute('data-has', '1');
      secs.push(s);
      wrap.appendChild(s);
    });
    return wrap;
  }

  var total = 0;
  D.cats.forEach(function (c) { total += c.books.length; });

  var input = el('input', { type: 'text', autocomplete: 'off', placeholder: '搜索书名、作者或关键词（如：论语、孔子、仁）', 'aria-label': '搜索典籍' });
  var clear = el('button', { 'class': 'dj-search-clear', type: 'button', 'aria-label': '清空搜索', hidden: 'hidden', text: '×' });
  var count = el('span', { 'class': 'dj-count', text: '已上架 ' + total + ' 本' });
  var bType = el('button', { type: 'button', 'aria-pressed': 'true', text: '按类型' });
  var bDyn = el('button', { type: 'button', 'aria-pressed': 'false', text: '按朝代' });
  var tv = typeView(), dv = dynView();
  var empty = el('p', { 'class': 'dj-empty', hidden: 'hidden', text: '没有找到相关的书。换个字或词试试。' });

  function setView(v) {
    bType.setAttribute('aria-pressed', v === 'type' ? 'true' : 'false');
    bDyn.setAttribute('aria-pressed', v === 'dyn' ? 'true' : 'false');
    tv.hidden = v !== 'type';
    dv.hidden = v !== 'dyn';
    catBar.hidden = v !== 'type';
    try { history.replaceState(null, '', v === 'dyn' ? '?view=dyn' : location.pathname); } catch (e) { /* 忽略 */ }
    filter();
  }

  /* 类别选择条：全部 + 十个类别。点一个类别，只显示这一类；再点“全部”回到整个书架 */
  var selCat = '';
  var chips = [];
  function chip(name, label, n, soon) {
    var b = el('button', { 'class': 'dj-chip' + (soon ? ' is-soon' : ''), type: 'button', 'aria-pressed': 'false' }, [
      el('span', { text: label }),
      soon ? el('small', { text: '整理中' }) : null
    ]);
    b.addEventListener('click', function () { selectCat(name); });
    b.setAttribute('data-name', name);
    chips.push(b);
    return b;
  }
  function selectCat(name) {
    selCat = name;
    chips.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-name') === name ? 'true' : 'false'); });
    filter();
  }
  var catRow = el('div', { 'class': 'dj-cats-row' }, [chip('', '全部', total)].concat(D.cats.map(function (c) {
    return chip(c.name, c.name, c.books.length, !c.books.length);
  })));
  var catBar = el('div', { 'class': 'dj-cats' }, [el('p', { 'class': 'dj-cats-label', text: '先选类别' }), catRow]);
  chips[0].setAttribute('aria-pressed', 'true');
  bType.addEventListener('click', function () { setView('type'); });
  bDyn.addEventListener('click', function () { setView('dyn'); });

  /* 搜索：去掉空格和标点后，书名/作者/简介里包含输入内容就显示；没输入时全部显示 */
  function filter() {
    var q = input.value.replace(/[\s《》“”，。、；：]/g, '').toLowerCase();
    clear.hidden = !input.value;
    var shown = 0;
    cards.forEach(function (c) {
      var ok = !q || c.getAttribute('data-q').indexOf(q) >= 0;
      c.hidden = !ok;
    });
    var view = tv.hidden ? dv : tv;
    var inCat = !tv.hidden && selCat;
    secs.forEach(function (s) {
      var has = s.getAttribute('data-has') === '1';
      var cat = s.getAttribute('data-cat');
      /* 选了类别：按类型的页面里，别的类别整区收起 */
      if (!tv.hidden && cat && selCat && cat !== selCat) { s.hidden = true; return; }
      if (!q) { s.hidden = false; return; }
      /* 搜索时，没有命中的分区（包括“整理中”的类）先收起 */
      var any = has && Array.prototype.some.call(s.querySelectorAll('.dj-card'), function (c) { return !c.hidden; });
      s.hidden = !any;
    });
    Array.prototype.forEach.call(view.querySelectorAll('.dj-card'), function (c) {
      if (!c.hidden && !c.closest('section').hidden) shown++;
    });
    var catN = 0;
    if (inCat) D.cats.forEach(function (c) { if (c.name === selCat) catN = c.books.length; });
    empty.hidden = !(q && shown === 0);
    count.textContent = q ? '找到 ' + shown + ' 本' : (inCat ? (catN ? '本类已上架 ' + catN + ' 本' : '本类整理中') : '已上架 ' + total + ' 本');
  }
  input.addEventListener('input', filter);
  clear.addEventListener('click', function () { input.value = ''; filter(); input.focus(); });

  var head = Z.head({
    hook: '典籍',
    answer: '一本书一页：谁写的、什么时候成书、讲什么、为什么重要、该读哪个版本。',
    intro: '这里把中国传统典籍按类型分成十类。每本书一页，先讲清它是什么书，再摘几段有代表性的原文并加注解；不放全文，只指路，告诉你去哪里读。先点上面的类别，再挑书。'
  }, '典籍');

  var tools = el('div', { 'class': 'dj-tools' }, [
    el('div', { 'class': 'dj-search', role: 'search' }, [input, clear]),
    el('div', { 'class': 'dj-views', role: 'group', 'aria-label': '看法' }, [bType, bDyn]),
    count
  ]);

  Z.mount(root, [head, catBar, tools, tv, dv, empty]);
  document.title = '典籍 · 知否知否';
  if (/[?&]view=dyn(&|$)/.test(location.search)) setView('dyn');
})();
