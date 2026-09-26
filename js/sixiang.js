/* 知否知否 · 礼与思 · 诸子与思想页
   数据：data/ls-sixiang.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_LS_SIXIANG, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;
  var el = Z.el;

  /* 十三经：把“名单”那一张卡拆成十三个小牌，其余两张卡照常排 */
  function shisanjing(D2, tabKey) {
    var s = LS.S(D2, '十三经');
    var kids = [Z.note(s.bold['说明'])];
    var rest = [];
    s.items.forEach(function (it) {
      if (it.name === '十三经名单') {
        var names = (Z.fmap(it.f)['名单'] || '').replace(/。$/, '').split('、').filter(Boolean);
        kids.push(el('div', { 'class': 'ls-names zy-paper', role: 'list', 'aria-label': '十三经名单' }, names.map(function (n, i) {
          return el('span', { 'class': 'ls-name', role: 'listitem' }, [el('b', { text: String(i + 1) }), n]);
        })));
      } else {
        rest.push(it);
      }
    });
    kids.push(LS.grid(rest.map(function (it) {
      var m = Z.fmap(it.f);
      return LS.mk(tabKey, it.name, { open: true, body: [el('p', { 'class': 'ls-plain', text: m['说明'] || '' })] });
    }), 'is-wide'));
    return Z.section('十三经', kids);
  }

  LS.mkPage({
    D: D,
    eyebrow: '礼与思 · 诸子与思想',
    title: '诸子与思想',
    tabs: [
      { key: 'zhuzi', label: '诸子百家', blocks: [
        { sec: '诸子十家', grid: 'is-wide' },
        { sec: '十家、九流与兵家', grid: 'is-wide' },
        { sec: '儒家的人和典故', grid: 'is-wide' },
        { sec: '道家的人和典故', grid: 'is-wide' },
        { sec: '墨家与法家的人和典故', grid: 'is-wide' },
        { sec: '兵家与纵横家的人和典故', grid: 'is-wide' }
      ] },
      { key: 'zhuxian', label: '思想史主线', blocks: [
        { sec: '思想史主线', grid: 'is-wide' },
        { sec: '董仲舒与“罢黜百家”', grid: 'is-wide' },
        { sec: '三教关系', grid: 'is-wide' },
        { sec: '三教关系的两点辨析', grid: 'is-wide' }
      ] },
      { key: 'rujia', label: '儒家核心概念', blocks: [
        { sec: '儒家核心概念', grid: 'is-wide' },
        { sec: '容易混淆的三组关系', grid: 'is-3' },
        { sec: '中庸', grid: 'is-wide' },
        { sec: '五伦、三纲与五常', grid: 'is-wide' }
      ] },
      { key: 'jingdian', label: '经典', blocks: [
        { sec: '四书', grid: 'is-wide' },
        { sec: '四书里的常用典故', grid: 'is-wide' },
        { sec: '五经', grid: 'is-wide' },
        { custom: shisanjing },
        { sec: '概念辨析', grid: 'is-3' }
      ] }
    ]
  });
})();
