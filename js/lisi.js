/* 知否知否 · 礼与思 · 入口页（一排帛书）
   数据：data/ls-index.js（由文案库自动生成）；排版工具：js/zycommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_LS_INDEX, Z = window.ZY;
  var root = document.getElementById('app');
  if (!D || !Z || !root) return;
  var el = Z.el;

  var pages = Z.sec(D, '页面');
  var route = Z.sec(D, '路线');

  var shelf = el('nav', { 'class': 'zy-shelf', 'aria-label': '礼与思的五个页面' }, pages.items.map(function (it) {
    var m = Z.fmap(it.f);
    return el('a', { 'class': 'zy-book', href: m['地址'] || '#', 'aria-label': it.name + '：' + (m['一句话'] || '') }, [
      el('span', { 'class': 'zy-book-char', 'aria-hidden': 'true', text: m['卷首字'] || '' }),
      el('span', { 'class': 'zy-book-name', text: it.name }),
      el('span', { 'class': 'zy-book-line', text: m['一句话'] }),
      el('span', { 'class': 'zy-book-tags', text: (m['内容'] || '').replace(/、/g, ' · ') })
    ]);
  }));

  var routeBox = el('div', { 'class': 'zy-route' }, route.items.map(function (it) {
    var m = Z.fmap(it.f);
    return el('div', { 'class': 'zy-route-item zy-paper' }, [
      el('span', { 'class': 'zy-route-title', text: it.name }),
      el('p', { 'class': 'zy-route-line', text: m['一句话'] }),
      el('div', { 'class': 'zy-route-links' }, Z.links(m['页面']).map(function (l) { return el('a', { href: l.href, text: l.name + ' →' }); }))
    ]);
  }));

  Z.mount(root, [
    Z.head(D, '礼与思'),
    Z.section('五卷帛书', [shelf]),
    Z.section('怎么逛', [routeBox])
  ].concat(Z.tipNotes(D)));
  document.title = '礼与思 · 知否知否';
})();
