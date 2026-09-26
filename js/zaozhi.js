
/* 知否知否 · 四大发明·造纸术页脚本
   数据来自 data/zaozhi.js（window.ZHIFOU_ZAOZHI），本文件只负责排版。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_ZAOZHI, W = window.WU, root = document.getElementById('app');
  if (!D || !W || !root) return;
  var el = W.el;

  function line(label, text) {
    return el('div', { 'class': 'fm-line' }, [el('b', { text: label }), el('span', { text: text })]);
  }

  /* 造纸以前 */
  function before() {
    var B = D.before;
    return W.section('造纸以前', [
      W.note(B.note),
      W.remind(B.remind),
      el('div', { 'class': 'fm-two' }, B.items.map(function (it) {
        return el('div', { 'class': 'fm-card wx-paper' }, [
          el('span', { 'class': 'fm-card-name', text: it.name }),
          line('材料', it.material), line('好处', it.good), line('难处', it.bad)
        ]);
      }))
    ]);
  }

  /* 蔡伦的位置 */
  function cai() {
    var C = D.cai;
    return W.section('蔡伦的位置', [
      W.note(C.note),
      el('div', { 'class': 'fm-two' }, [
        el('div', { 'class': 'fm-card wx-paper' }, [el('span', { 'class': 'fm-card-meta', text: '常见的说法' }), el('span', { 'class': 'fm-card-text', text: C.common })]),
        el('div', { 'class': 'fm-card wx-paper' }, [el('span', { 'class': 'fm-card-meta', text: '更准确的说法' }), el('span', { 'class': 'fm-card-text', text: C.better })])
      ]),
      W.source(C.source)
    ]);
  }

  /* 七步流程 */
  function steps() {
    var S = D.steps;
    var icons = ['z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7'];
    var items = S.items.map(function (it, i) {
      return { name: it.name, icon: icons[i], rows: [{ label: '做什么', text: it.what }, { label: '白话', text: it.plain, note: true }] };
    });
    return W.section('造纸的七步', [
      W.note(S.note),
      W.stepper({ items: items, ordered: true, unit: '步', cols: 7, aria: '造纸的七步', first: W.idIndex(items) }),
      W.remind(S.key),
      W.remind(S.remind)
    ]);
  }

  /* 传播的三站 */
  function spread() {
    var P = D.spread;
    return W.section('纸怎么传出去', [W.note(P.note), W.steps3(P.items.map(function (s) { return { name: s.name, text: s.text }; }))]);
  }

  function impact() {
    var I = D.impact;
    return W.section('纸改变了什么', [W.note(I.note), W.cards(I.items.map(function (x) { return { name: x.name, text: x.text }; }))]);
  }

  function background() {
    return D.background ? W.section('当时的背景', [W.note(D.background)]) : null;
  }

  W.mount(root, W.head(D, '物 · 四大发明 · 造纸术').concat([
    before(), cai(), steps(), spread(), impact(), background(), W.myths(D.myths), W.see(D.see)
  ]).concat(W.tipNotes(D)));
})();
