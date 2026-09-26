
/* 知否知否 · "物"入口页（博古架）脚本
   数据来自 data/wuindex.js（window.ZHIFOU_WUINDEX），本文件只负责排版。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_WUINDEX, W = window.WU, root = document.getElementById('app');
  if (!D || !W || !root) return;
  var el = W.el;

  /* 每一格里放的东西（小图标） */
  var ICON = { '笔': 'bi', '墨': 'mo', '纸': 'zhi', '砚': 'yan', '造纸术': 'zaozhi', '印刷术': 'yinshua', '火药': 'huoyao', '指南针': 'zhinanzhen' };

  function cell(c) {
    var kids = [
      W.iconBox(ICON[c.name] || '', 'fm-cell-ic'),
      el('span', { 'class': 'fm-cell-name', text: c.name }),
      el('span', { 'class': 'fm-cell-line', text: c.line })
    ];
    if (!c.open) {
      kids.push(el('span', { 'class': 'fm-cell-soon', text: '制作中' }));
      return el('div', { 'class': 'fm-cell is-closed', 'aria-disabled': 'true' }, kids);
    }
    return el('a', { 'class': 'fm-cell', href: c.href, 'aria-label': c.name + '：' + c.line }, kids);
  }

  function shelf() {
    var kids = [];
    D.shelves.forEach(function (s) {
      kids.push(el('div', { 'class': 'fm-shelf-cap' }, [
        el('span', {}, [el('span', { 'class': 'fm-shelf-title', text: s.title }), document.createTextNode('　'), el('span', { 'class': 'fm-shelf-sub', text: s.sub })]),
        s.link && s.link.href ? el('a', { 'class': 'fm-shelf-link', href: s.link.href, text: s.link.name + ' →' }) : null
      ]));
      s.cells.forEach(function (c) { kids.push(cell(c)); });
    });
    return el('section', { 'aria-label': '物的博古架' }, [el('div', { 'class': 'fm-shelf' }, kids)]);
  }

  W.mount(root, W.head(D, '物').concat([shelf()]).concat(W.tipNotes(D)));
})();
