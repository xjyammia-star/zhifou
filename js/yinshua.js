
/* 知否知否 · 四大发明·印刷术页脚本
   数据来自 data/yinshua.js（window.ZHIFOU_YINSHUA），本文件只负责排版。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_YINSHUA, W = window.WU, root = document.getElementById('app');
  if (!D || !W || !root) return;
  var el = W.el;

  /* 雕版的六步 */
  function diaoban() {
    var S = D.diaoban;
    var icons = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'];
    var items = S.items.map(function (it, i) {
      return { name: it.name, icon: icons[i], rows: [{ label: '做什么', text: it.what }] };
    });
    return W.section('雕版：一整块板', [
      W.note(S.note),
      W.stepper({ items: items, ordered: true, unit: '步', cols: 6, aria: '雕版印刷的六步', first: W.idIndex(items) }),
      W.remind(S.remind)
    ]);
  }

  /* 活字的五步 */
  function huozi() {
    var S = D.huozi;
    var icons = ['h1', 'h2', 'h3', 'h4', 'h5'];
    var items = S.items.map(function (it, i) {
      return { name: it.name, icon: icons[i], rows: [{ label: '做什么', text: it.what }] };
    });
    return W.section('活字：一个个字', [
      W.note(S.note),
      W.stepper({ items: items, ordered: true, unit: '步', cols: 5, aria: '毕昇胶泥活字的五步' }),
      W.source(S.source)
    ]);
  }

  /* 两栏对照 */
  function compare() {
    var C = D.compare;
    var kids = [el('div', { 'class': 'fm-cmp-h is-empty' }), el('div', { 'class': 'fm-cmp-h', text: '雕版' }), el('div', { 'class': 'fm-cmp-h', text: '活字' })];
    C.rows.forEach(function (r) {
      kids.push(el('div', { 'class': 'fm-cmp-l', text: r.name }));
      kids.push(el('div', { 'data-label': '雕版', text: r.diaoban }));
      kids.push(el('div', { 'data-label': '活字', text: r.huozi }));
    });
    return W.section('雕版和活字', [W.note(C.note), el('div', { 'class': 'fm-cmp', role: 'group', 'aria-label': '雕版与活字的对照' }, kids)]);
  }

  /* 后来的路 */
  function later() {
    var L = D.later;
    return W.section('后来的路', [
      W.note(L.note),
      W.steps3(L.items.map(function (s) { return { name: s.name, who: s.source, text: s.text }; }))
    ]);
  }

  function impact() {
    var I = D.impact;
    return W.section('印刷改变了什么', [W.note(I.note), W.cards(I.items.map(function (x) { return { name: x.name, text: x.text }; }))]);
  }

  W.mount(root, W.head(D, '物 · 四大发明 · 印刷术').concat([
    diaoban(), huozi(), compare(), later(), impact(), W.myths(D.myths), W.see(D.see)
  ]).concat(W.tipNotes(D)));
})();
