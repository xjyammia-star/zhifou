
/* 知否知否 · 艺 · 入口页（琴棋书画）
   数据：data/yi-index.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js
   页面 = 一排四卷卷轴（去四个页面）+ 三条路线 + 琴棋书画三个标签页（总览、琴、棋） */
(function () {
  'use strict';
  var D = window.ZHIFOU_YI_INDEX, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;
  var el = Z.el;

  /* 一排卷轴 */
  function shelfBlock() {
    var pages = Z.sec(D, '页面');
    var shelf = el('nav', { 'class': 'zy-shelf', 'aria-label': '艺的四个页面' }, pages.items.map(function (it) {
      var m = Z.fmap(it.f);
      return el('a', { 'class': 'zy-book', href: m['地址'] || '#', 'aria-label': it.name + '：' + (m['一句话'] || '') }, [
        el('span', { 'class': 'zy-book-char', 'aria-hidden': 'true', text: m['卷首字'] || '' }),
        el('span', { 'class': 'zy-book-name', text: it.name }),
        el('span', { 'class': 'zy-book-line', text: m['一句话'] }),
        el('span', { 'class': 'zy-book-tags', text: (m['内容'] || '').replace(/、/g, ' · ') })
      ]);
    }));
    return Z.section('四卷卷轴', [shelf]);
  }

  /* 三条路线 */
  function routeBlock() {
    var route = Z.sec(D, '路线');
    var box = el('div', { 'class': 'zy-route' }, route.items.map(function (it) {
      var m = Z.fmap(it.f);
      return el('div', { 'class': 'zy-route-item zy-paper' }, [
        el('span', { 'class': 'zy-route-title', text: it.name }),
        el('p', { 'class': 'zy-route-line', text: m['一句话'] }),
        el('div', { 'class': 'zy-route-links' }, Z.links(m['页面']).map(function (l) { return el('a', { href: l.href, text: l.name + ' →' }); }))
      ]);
    }));
    return Z.section('怎么逛', [box]);
  }

  LS.mkPage({
    D: D,
    eyebrow: '艺',
    title: '艺 · 琴棋书画',
    suffix: ' · 知否知否',
    tabs: [
      { key: 'zonglan', label: '琴棋书画', blocks: [
        { custom: shelfBlock },
        { custom: routeBlock },
        { sec: '琴棋书画各是什么', grid: 'is-3' },
        { sec: '书与画在四艺中的位置', grid: 'is-3' },
        { sec: '为什么并称“琴棋书画”', kind: 'steps' },
        { sec: '四艺的共同结构', kind: 'table', cols: [['项目', '@name'], ['琴', '琴'], ['棋', '棋'], ['书', '书'], ['画', '画']] },
        { sec: '文人四艺与君子六艺' }
      ] },
      { key: 'qin', label: '琴', blocks: [
        { sec: '古琴' },
        { sec: '名琴与琴的典故' }
      ] },
      { key: 'qi', label: '棋', blocks: [
        { sec: '围棋的基本规则' },
        { sec: '围棋训练的核心观念' },
        { sec: '围棋的术语与棋品' },
        { sec: '烂柯的典故', grid: 'is-3' }
      ] }
    ]
  });
})();
