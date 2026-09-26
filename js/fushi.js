
/* 知否知否 · 物 · 服饰页
   数据：data/wz-fushi.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_WZ_FUSHI, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;

  LS.mkPage({
    D: D,
    eyebrow: '物 · 服饰',
    title: '服饰',
    suffix: ' · 物 · 知否知否',
    tabs: [
      { key: 'xing', label: '形制与冠服', blocks: [
        { sec: '看服饰的六个方面' },
        { sec: '“汉服”的三个层面', grid: 'is-3' },
        { sec: '基本服装形制' },
        { sec: '冠服' }
      ] },
      { key: 'guan', label: '官服与礼仪', blocks: [
        { sec: '官服与礼服制度', grid: 'is-3' },
        { sec: '十二章纹' },
        { sec: '不同场合的服装' }
      ] },
      { key: 'se', label: '色彩纹样与织造', blocks: [
        { sec: '服饰色彩', grid: 'is-3' },
        { sec: '传统纹样' },
        { sec: '织造与染色', grid: 'is-3' }
      ] },
      { key: 'shi', label: '朝代演变', blocks: [
        { sec: '历史演变' },
        { sec: '服饰典故' }
      ] }
    ]
  });
})();
