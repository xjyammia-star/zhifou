/* 知否知否 · 字语 · 天地万物的名字页
   数据：data/zy-wanwu.js（由文案库自动生成）；排版工具：js/zycommon.js
   页面结构：七类对象（天象、山川地理、草木、鸟兽虫鱼、金石玉、时间方位、声音气味与饮食）。
   每一类里有两种内容：“词表组”（词 + 含义，加有出处的“雅称”卡）和“逐条核对出处的卡片”。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_ZY_WANWU, Z = window.ZY;
  var root = document.getElementById('app');
  if (!D || !Z || !root) return;
  var el = Z.el;
  var S = function (t) { return Z.sec(D, t); };

  /* 七类，以及每一类里包含的分区（分区名和文案库里的“##”标题一致） */
  var TYPES = [
    { name: '天象', groups: ['季节与四时', '雨', '雪霜露雹霰', '风', '云雾霾虹', '雷电晴阴', '日月星与天色', '火烟与光焰'], cards: '天体与天气' },
    { name: '山川地理', groups: [], cards: '山川地理' },
    { name: '草木', groups: ['花草树木'], cards: '草木' },
    { name: '鸟兽虫鱼', groups: [], cards: '鸟兽虫鱼' },
    { name: '金石玉', groups: [], cards: '金石玉' },
    { name: '时间方位', groups: [], cards: '时间方位' },
    { name: '声音气味与饮食', groups: ['声音气味与触感', '动物的声音', '茶与酒'], cards: null }
  ];

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

  /* 一个词表组的内容：说明、原文引用、常用词、雅称 */
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

  var typeApi = null;
  var typeNote = el('p', { 'class': 'zy-note', 'aria-live': 'polite' });
  var panels = [];

  /* 每一类做成一个面板：先是词表组（有多组时用选项条切换），再是逐条核对的卡片 */
  TYPES.forEach(function (T, ti) {
    var kids = [];
    var gsecs = T.groups.map(function (g) { return S(g); });
    if (gsecs.length) {
      var box = el('div', { 'class': 'zy-section' });
      var gch = null;
      var showGroup = function (i) {
        box.textContent = '';
        buildGroup(gsecs[i]).forEach(function (k) { if (k) box.appendChild(k); });
      };
      if (gsecs.length > 1) {
        gch = Z.chips(T.groups, showGroup, { aria: T.name + '的分组', scroll: true });
        kids.push(gch.node);
      } else {
        gch = { pick: showGroup };
      }
      kids.push(box);
      /* ?id=名称：雅称卡的名称，或者词表里的某个词 */
      gsecs.forEach(function (s, gi) {
        s.items.forEach(function (it) {
          Z.onOpen(it.name, function () { typeApi.pick(ti); gch.pick(gi); return box.querySelector('[data-zy-id="' + it.name + '"]'); });
          if ('对象' in Z.fmap(it.f)) return;   /* 雅称卡的字段（对象、出处……）不是词，不登记 */
          it.f.forEach(function (p) {
            p[0].split('、').forEach(function (w) {
              Z.onOpen(w, function () {
                typeApi.pick(ti); gch.pick(gi);
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
      gch.pick(0);
    }
    if (T.cards) {
      var cs = S(T.cards);
      if (gsecs.length) kids.push(el('div', { 'class': 'zy-subtitle', text: '古书里怎么说：逐条核对出处的卡片' }));
      kids.push(Z.note(Z.LEGEND));
      Z.cardList(D, T.cards, { before: function () { typeApi.pick(ti); } }).forEach(function (k) { if (k) kids.push(k); });
    }
    panels.push(el('div', { 'class': 'zy-section', role: 'group', 'aria-label': T.name }, kids));
  });

  var typeBox = el('div', { 'class': 'zy-types' });
  panels.forEach(function (p) { typeBox.appendChild(p); });
  var seven = S('七类对象');
  var typeLines = {};
  seven.items.forEach(function (it) { typeLines[it.name] = Z.fmap(it.f)['一句话'] || ''; });
  typeApi = Z.chips(TYPES.map(function (T) { return T.name; }), function (i) {
    panels.forEach(function (p, j) { p.hidden = j !== i; });
    typeNote.textContent = typeLines[TYPES[i].name] || '';
  }, { aria: '七类对象', scroll: true });

  var how = S('怎么看这些词');
  var howKv = how.items[0] ? how.items[0].f : [];
  var six = S('古人怎么造词');
  var sixF = six.items[0] ? six.items[0].f : [];
  var nx = S('暂不收录的词');

  Z.mount(root, [
    Z.head(D, '字语 · 天地万物的名字'),
    Z.section('怎么看这些词', [
      Z.note(how.bold['说明']),
      Z.card({ name: how.items[0] ? how.items[0].name : '雅称的收录标准', body: [Z.kv(howKv)] })
    ]),
    Z.section('七类对象', [typeApi.node, typeNote, typeBox]),
    Z.section('古人怎么造词', [Z.note(six.bold['说明']), Z.words(sixF)]),
    Z.section('暂不收录的词', [
      Z.note(nx.bold['说明']),
      el('div', { 'class': 'zy-grid is-3' }, nx.items.map(function (it) { return Z.card({ name: it.name, isStatic: true, body: [Z.kv(it.f)] }); }))
    ]),
    Z.see(D)
  ].concat(Z.tipNotes(D)));
  typeApi.pick(0);
  document.title = '天地万物的名字 · 字语 · 知否知否';
  Z.openFromQuery();
})();
