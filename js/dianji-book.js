/* 知否知否 · “典籍”书页（dianji-book.html?id=书的代号）
   数据：先读书架索引 data/dianji-index.js（找到这本书、上一本、下一本），再按需加载这本书自己的 data/dj/<代号>.js。
   版面：基本信息 → 内容概要 / 为什么重要（默认展开）→ 代表性选段（点开看原文、注解、讲解）→
        名句典故、文化联系、常见误区、延伸阅读、资料来源、存疑之处（默认收起）。 */
(function () {
  'use strict';
  var Z = window.ZY, IDX = window.ZF_DJ_INDEX, el = Z && Z.el;
  var root = document.getElementById('app');
  if (!Z || !IDX || !root) return;

  var BOARDS = { '时令': 'jieqi.html', '神灵': 'shen.html', '建筑': 'jianzhu.html', '器物': 'wu.html', '字语': 'ziyu.html', '礼思': 'lisi.html', '艺术': 'yi.html', '文学': 'wen.html' };

  var id = null;
  try { id = new URLSearchParams(location.search).get('id'); } catch (e) { /* 忽略 */ }

  /* 在索引里找这本书（只认索引里有的代号，防止乱加载文件） */
  var cat = null, pos = -1;
  IDX.cats.forEach(function (c) {
    c.books.forEach(function (b, i) { if (b.id === id) { cat = c; pos = i; } });
  });

  function notFound() {
    Z.mount(root, [
      Z.head({ hook: '典籍', answer: '没有找到这本书。', intro: '这本书可能还在整理，或网址有误。回到书架看看吧。' }, '典籍'),
      el('p', { 'class': 'dj-back' }, [el('a', { href: 'dianji.html', text: '← 回到典籍书架' })])
    ]);
    document.title = '典籍 · 知否知否';
  }
  if (!cat) { notFound(); return; }

  /* 文字里的网址变成可点的链接（新窗口打开） */
  function addText(node, text) {
    String(text).split(/(https?:\/\/[^\s，。；）)]+)/).forEach(function (part) {
      if (/^https?:\/\//.test(part)) node.appendChild(el('a', { href: part, target: '_blank', rel: 'noopener noreferrer', text: part }));
      else if (part) node.appendChild(document.createTextNode(part));
    });
    return node;
  }
  function p(text) { return addText(el('p', { 'class': 'dj-p' }), text); }

  /* 一段话 / 多条：只有一条就当段落，多条做成列表 */
  function prose(arr) {
    if (!arr || !arr.length) return null;
    if (arr.length === 1) return p(arr[0]);
    return el('ul', { 'class': 'dj-list' }, arr.map(function (t) { return addText(el('li'), t); }));
  }

  /* 列表条目：“头：说明”里的头加粗；头若是站内板块名（礼思、文学……），做成指向那个板块的链接 */
  function headList(arr, linkBoards) {
    return el('ul', { 'class': 'dj-list' }, (arr || []).map(function (t) {
      var li = el('li');
      var m = /^([^：]{1,30})：([\s\S]*)$/.exec(t);
      if (!m) return addText(li, t);
      var head = m[1];
      var b = el('b');
      if (linkBoards && BOARDS[head]) b.appendChild(el('a', { href: BOARDS[head], text: head }));
      else b.textContent = head;
      li.appendChild(b);
      li.appendChild(document.createTextNode('：'));
      addText(li, m[2]);
      return li;
    }));
  }

  /* 可折叠的一节 */
  function sec(title, open, count, kids) {
    var body = el('div', { 'class': 'dj-sec-body' }, kids);
    var d = el('details', { 'class': 'dj-sec' }, [
      el('summary', {}, [title, count ? el('span', { 'class': 'dj-sec-n', text: count }) : null]),
      body
    ]);
    if (open) d.open = true;
    return d;
  }

  function render(d) {
    var kids = [];
    kids.push(Z.head({ hook: d.title, answer: d.line }, '典籍 · ' + cat.name));

    /* 基本信息：分类一项与面包屑重复，不再显示 */
    var rows = (d.info || []).filter(function (r) { return r[0] && r[0] !== '分类'; });
    if (rows.length) {
      kids.push(el('dl', { 'class': 'dj-facts' }, rows.map(function (r) {
        return el('div', { 'class': 'dj-facts-row' }, [el('dt', { text: r[0] }), addText(el('dd'), r[1])]);
      })));
    }

    if (d.summary && d.summary.length) kids.push(sec('内容概要', true, '', [prose(d.summary)]));
    if (d.why && d.why.length) kids.push(sec('为什么重要', true, '', [prose(d.why)]));

    if (d.selections && d.selections.length) {
      var sels = el('div', { 'class': 'dj-sels' }, d.selections.map(function (s, i) {
        var body = el('div', { 'class': 'dj-sel-body' }, [
          s.o ? el('blockquote', { 'class': 'dj-orig', text: s.o }) : null,
          s.g ? addText(el('p', {}, [el('b', { text: '注解' })]), s.g) : null,
          s.e ? addText(el('p', {}, [el('b', { text: '讲解' })]), s.e) : null
        ]);
        return el('details', { 'class': 'dj-sel' }, [
          el('summary', {}, [
            el('span', { 'class': 'dj-sel-no', text: '选段 ' + (i + 1) }),
            el('span', { 'class': 'dj-sel-t', text: s.t }),
            s.o ? el('span', { 'class': 'dj-sel-hint', text: s.o }) : null
          ]),
          body
        ]);
      }));
      kids.push(sec('代表性选段', true, d.selections.length + ' 段', [
        el('p', { 'class': 'dj-note', text: '这里只摘几段有代表性的原文，不是全文；注解和讲解为本站整理，欢迎指正。' }), sels
      ]));
    }

    if (d.quotes && d.quotes.length) kids.push(sec('名句、典故与成语', false, d.quotes.length + ' 条', [headList(d.quotes, false)]));
    if (d.dispute && d.dispute.length) kids.push(sec('作者与成书争议', false, '', [prose(d.dispute)]));
    if (d.versions && d.versions.length) kids.push(sec('版本与注本', false, '', [prose(d.versions)]));
    if (d.links && d.links.length) kids.push(sec('与中国文化其他领域的联系', false, d.links.length + ' 条', [headList(d.links, true)]));
    if (d.myths && d.myths.length) kids.push(sec('常见误区', false, d.myths.length + ' 条', [headList(d.myths, false)]));
    if (d.reading && d.reading.length) kids.push(sec('全文与延伸阅读', false, '', [headList(d.reading, false)]));
    if (d.sources && d.sources.length) kids.push(sec('资料来源', false, d.sources.length + ' 条', [
      el('p', { 'class': 'dj-note', text: '每条末尾的“可信度”是整理时对该资料的自评，供参考。' }), headList(d.sources, false)
    ]));
    if (d.doubts && d.doubts.length) kids.push(sec('存疑之处', false, d.doubts.length + ' 条', [headList(d.doubts, false)]));

    /* 同一类里的上一本、下一本 */
    var prev = pos > 0 ? cat.books[pos - 1] : null, next = pos < cat.books.length - 1 ? cat.books[pos + 1] : null;
    if (prev || next) {
      kids.push(el('div', { 'class': 'dj-pn' }, [
        prev ? el('a', { href: 'dianji-book.html?id=' + encodeURIComponent(prev.id) }, [el('small', { text: '上一本' }), prev.title]) : el('span'),
        next ? el('a', { 'class': 'is-next', href: 'dianji-book.html?id=' + encodeURIComponent(next.id) }, [el('small', { text: '下一本' }), next.title]) : el('span')
      ]));
    }
    kids.push(el('p', { 'class': 'dj-back' }, [el('a', { href: 'dianji.html', text: '← 回到典籍书架' })]));

    Z.mount(root, kids);
    document.title = d.title.replace(/[《》]/g, '') + ' · 典籍 · 知否知否';
  }

  /* 加载这本书的数据文件 */
  var s = document.createElement('script');
  s.src = 'data/dj/' + id + '.js';
  s.onload = function () {
    var d = window.ZF_DJ && window.ZF_DJ[id];
    if (d) render(d); else notFound();
  };
  s.onerror = notFound;
  document.head.appendChild(s);
})();
