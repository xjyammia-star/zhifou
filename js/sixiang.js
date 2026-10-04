/* 知否知否 · 礼思 · 诸子与思想页
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
      return LS.mk(tabKey, it.name, { isStatic: true, body: [el('p', { 'class': 'ls-plain', text: m['说明'] || '' })] });
    }), 'is-wide'));
    return Z.section('十三经', kids);
  }

  /* 表格第一列的名字去掉“的回答”“后来”这样的后缀 */
  function stripHuida(v) { return v.replace(/的回答$/, ''); }
  function stripHoulai(v) { return v.replace(/后来$/, ''); }

  /* 插图：从 data/images.js 里按名字取图（登记键 sixiang/名字）；没登记就不显示，页面照常 */
  function figBlock(name) {
    return function () {
      var info = window.ZIMG && window.ZIMG.get('sixiang', name);
      if (!info) return el('div', { style: 'display:none' });
      var kids = [];
      var img = el('img', { 'class': 'zf-img', src: info.src, srcset: info.srcset, sizes: '(max-width: 760px) 94vw, 900px', alt: info.caption || '', loading: 'lazy', decoding: 'async' });
      if (info.width && info.height) { img.width = info.width; img.height = info.height; }
      kids.push(img);
      var cap = [];
      if (info.caption) cap.push(el('span', { 'class': 'zf-txt', text: info.caption }));
      if (info.ai) cap.push(el('span', { 'class': 'zf-ai', text: info.aiLabel }));
      kids.push(el('figcaption', { 'class': 'zf-cap' }, cap));
      return el('figure', { 'class': 'zf zf-banner' }, kids);
    };
  }

  LS.mkPage({
    D: D,
    eyebrow: '礼思 · 诸子与思想',
    title: '诸子与思想',
    tabs: [
      { key: 'zhuzi', label: '诸子百家', blocks: [
        { sec: '为什么会有诸子百家', grid: 'is-wide' },
        { custom: figBlock('sixiang-guanxi') },
        { sec: '诸子在争什么', kind: 'table', wide: true, cols: [['学派', '@name', stripHuida], ['人性', '人性'], ['治国', '治国'], ['战争', '战争'], ['天命鬼神', '天命鬼神'], ['礼乐', '礼乐']] },
        { sec: '诸子十家', grid: 'is-wide' },
        { sec: '十家、九流与兵家', grid: 'is-wide' }
      ] },
      { key: 'renwu', label: '人物与争论', blocks: [
        { sec: '十位先秦思想家', grid: 'is-wide' },
        { sec: '儒家的人和典故', grid: 'is-wide' },
        { sec: '道家的人和典故', grid: 'is-wide' },
        { sec: '墨家与法家的人和典故', grid: 'is-wide' },
        { sec: '兵家与纵横家的人和典故', grid: 'is-wide' },
        { sec: '诸子之间的争论', grid: 'is-wide' }
      ] },
      { key: 'rujia', label: '儒家核心概念', blocks: [
        { sec: '儒家核心概念', grid: 'is-wide' },
        { sec: '容易混淆的三组关系', grid: 'is-3' },
        { sec: '中庸', grid: 'is-wide' },
        { sec: '五伦、三纲与五常', grid: 'is-wide' }
      ] },
      { key: 'daomofa', label: '道墨法概念', blocks: [
        { sec: '道家核心概念', grid: 'is-wide' },
        { sec: '墨家核心概念', grid: 'is-wide' },
        { sec: '法家核心概念', grid: 'is-wide' },
        { sec: '道家与道教的区别', grid: 'is-wide' }
      ] },
      { key: 'zhuxian', label: '思想史主线', blocks: [
        { custom: figBlock('sixiang-timeline') },
        { sec: '思想史主线', grid: 'is-wide' },
        { sec: '诸子后来去了哪里', kind: 'table', cols: [['先秦学派', '@name', stripHoulai], ['后来的主要变化', '主要变化']] },
        { sec: '董仲舒与“罢黜百家”', grid: 'is-wide' },
        { sec: '魏晋玄学', grid: 'is-wide' },
        { sec: '佛教的中国化', grid: 'is-wide' },
        { sec: '宋明理学', grid: 'is-wide' },
        { sec: '陆王心学', grid: 'is-wide' },
        { sec: '清代考据学与近代转向', grid: 'is-wide' },
        { sec: '三教关系', grid: 'is-wide' },
        { sec: '三教关系的两点辨析', grid: 'is-wide' }
      ] },
      { key: 'jingdian', label: '经典', blocks: [
        { sec: '四书', grid: 'is-wide' },
        { sec: '四书怎么读', grid: 'is-wide' },
        { custom: figBlock('daxue-batiaomu') },
        { sec: '《大学》的八条目', kind: 'steps', grid: 'is-wide' },
        { sec: '四书里的常用典故', grid: 'is-wide' },
        { sec: '五经', grid: 'is-wide' },
        { custom: shisanjing },
        { sec: '《老子》和《庄子》两本书', grid: 'is-wide' },
        { sec: '概念辨析', grid: 'is-3' }
      ] }
    ]
  });
})();
