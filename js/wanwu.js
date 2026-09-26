/* 知否知否 · 字·语 · 天地万物的名字页
   数据：data/zy-wanwu.js（由文案库自动生成）；排版工具：js/zycommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_ZY_WANWU, Z = window.ZY;
  var root = document.getElementById('app');
  if (!D || !Z || !root) return;
  var el = Z.el;
  var S = function (t) { return Z.sec(D, t); };

  var GROUPS = ['季节与四时', '雨', '雪霜露雹霰', '风', '云雾霾虹', '雷电晴阴', '日月星与天色',
    '火烟与光焰', '花草树木', '茶与酒', '声音气味与触感', '动物的声音'];

  /* 一张“雅称”卡：有出处和原文的别名 */
  function yaCard(it) {
    var m = Z.fmap(it.f);
    return el('article', { 'class': 'zy-ya zy-paper', 'data-zy-id': it.name }, [
      el('div', { 'class': 'zy-ya-top' }, [el('span', { 'class': 'zy-ya-name', text: it.name }), el('span', { 'class': 'zy-ya-obj', text: '指：' + (m['对象'] || '') })]),
      el('span', { 'class': 'zy-ya-src', text: '出处：' + (m['出处'] || '') }),
      el('p', { 'class': 'zy-ya-text', text: m['原文'] }),
      m['备注'] ? el('p', { 'class': 'zy-ya-note', text: m['备注'] }) : null
    ]);
  }

  /* 一组的内容：说明、原文引用、常用词、雅称 */
  function buildGroup(s) {
    var kids = [];
    if (s.bold['说明']) kids.push(Z.note(s.bold['说明']));
    if (s.bold['尔雅']) kids.push(el('p', { 'class': 'zy-quote', text: s.bold['尔雅'] }));
    if (s.bold['启明与长庚']) kids.push(Z.callout(s.bold['启明与长庚'], '启明与长庚'));
    var yas = [];
    s.items.forEach(function (it) {
      if ('对象' in Z.fmap(it.f)) { yas.push(it); return; }
      kids.push(el('div', { 'class': 'zy-subtitle', text: it.name }));
      kids.push(Z.words(it.f, { split: s.title === '动物的声音' }));
    });
    if (yas.length) {
      kids.push(el('div', { 'class': 'zy-subtitle', text: '雅称：有出处的别名（' + yas.length + ' 个）' }));
      kids.push(el('div', { 'class': 'zy-grid is-wide' }, yas.map(yaCard)));
    }
    return kids;
  }

  var box = el('div', { 'class': 'zy-section' });
  var ch = null;
  var secs = GROUPS.map(function (g) { return S(g); });
  function showGroup(i) {
    box.textContent = '';
    buildGroup(secs[i]).forEach(function (k) { if (k) box.appendChild(k); });
  }
  ch = Z.chips(GROUPS, showGroup, { aria: '十二组对象', scroll: true });

  /* ?id=名称：雅称卡的名称，或者词表里的某个词 */
  secs.forEach(function (s, gi) {
    s.items.forEach(function (it) {
      Z.onOpen(it.name, function () { ch.pick(gi); return box.querySelector('[data-zy-id="' + it.name + '"]'); });
      if ('对象' in Z.fmap(it.f)) return;   /* 雅称卡的字段（对象、出处……）不是词，不登记 */
      it.f.forEach(function (p) {
        p[0].split('、').forEach(function (w) {
          Z.onOpen(w, function () {
            ch.pick(gi);
            var hit = null;
            [].forEach.call(box.querySelectorAll('[data-zy-word]'), function (n) {
              if (!hit && n.getAttribute('data-zy-word').split('、').indexOf(w) >= 0) hit = n;
            });
            return hit;
          });
        });
      });
    });
  });
  ch.pick(0);

  var how = S('怎么看这些词');
  var howKv = how.items[0] ? how.items[0].f : [];
  var six = S('古人怎么造词');
  var sixF = six.items[0] ? six.items[0].f : [];
  var nx = S('暂不收录的词');
  var todo = S('待继续核查');

  Z.mount(root, [
    Z.head(D, '字·语 · 天地万物的名字'),
    Z.section('怎么看这些词', [
      Z.note(how.bold['说明']),
      Z.card({ name: how.items[0] ? how.items[0].name : '雅称的收录标准', body: [Z.kv(howKv)] })
    ]),
    Z.section('十二组对象', [ch.node, box]),
    Z.section('古人怎么造词', [Z.note(six.bold['说明']), Z.words(sixF)]),
    Z.section('暂不收录的词', [
      Z.note(nx.bold['说明']),
      el('div', { 'class': 'zy-grid is-3' }, nx.items.map(function (it) { return Z.card({ name: it.name, isStatic: true, body: [Z.kv(it.f)] }); }))
    ]),
    Z.section('还在收集', [
      Z.note(todo.bold['说明']),
      el('div', { 'class': 'zy-grid is-3' }, todo.items.map(function (it) { return Z.card({ name: it.name, isStatic: true, body: [Z.kv(it.f)] }); }))
    ]),
    Z.see(D)
  ].concat(Z.tipNotes(D)));
  document.title = '天地万物的名字 · 字·语 · 知否知否';
  Z.openFromQuery();
})();
