
/* 知否知否 · 四大发明·火药页脚本
   数据来自 data/huoyao.js（window.ZHIFOU_HUOYAO），本文件只负责排版。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_HUOYAO, W = window.WU, root = document.getElementById('app');
  if (!D || !W || !root) return;
  var el = W.el;

  /* 三步 */
  function three() {
    var S = D.steps;
    var icons = ['hy1', 'huoyao', 'hy3'];
    var items = S.items.map(function (it, i) {
      return { name: it.name, icon: icons[i], rows: [{ label: '时期', text: it.period }, { label: '内容', text: it.text }] };
    });
    return W.section('从炼丹炉到战场：三步', [
      W.note(S.note),
      W.stepper({ items: items, ordered: true, unit: '步', cols: 3, aria: '火药的三步' })
    ]);
  }

  /* 文献与配方 */
  function lit() {
    var L = D.lit;
    return W.section('文献与配方：“最早”要小心', [
      W.note(L.note),
      el('div', { 'class': 'fm-grid' }, L.items.map(function (it) {
        return el('div', { 'class': 'fm-card wx-paper' }, [
          el('span', { 'class': 'fm-card-name', text: it.name }),
          el('span', { 'class': 'fm-card-text', text: it.text }),
          it.source ? el('span', { 'class': 'fm-card-meta', text: '出处　' + it.source }) : null
        ]);
      }))
    ]);
  }

  /* 五种火器 */
  function arms() {
    var A = D.arms;
    var icons = ['a1', 'a2', 'a3', 'a4', 'a5'];
    var items = A.items.map(function (it, i) {
      return { name: it.name, icon: icons[i], rows: [{ label: '大致时代', text: it.era }, { label: '做法', text: it.how }, { label: '史料边界', text: it.edge, note: true }] };
    });
    return W.section('五种早期火器', [
      W.note(A.note),
      W.stepper({ items: items, ordered: false, cols: 5, aria: '五种早期火器', first: W.idIndex(items) }),
      W.remind(A.remind)
    ]);
  }

  function tech() {
    var T = D.tech;
    return W.section('变成武器的四项关键技术', [W.note(T.note), W.cards(T.items.map(function (x) { return { name: x.name, text: x.text }; }), { numbered: true })]);
  }

  function spread() {
    var S = D.spread;
    return W.section('传播与影响', [W.note(S.note), W.cards(S.items.map(function (x) { return { name: x.name, text: x.text }; }))]);
  }

  W.mount(root, W.head(D, '物 · 四大发明 · 火药').concat([
    three(), lit(), arms(), tech(), spread(), W.myths(D.myths), W.see(D.see)
  ]).concat(W.tipNotes(D)));
})();
