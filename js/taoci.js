
/* 知否知否 · 物 · 陶瓷页
   数据：data/wz-taoci.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_WZ_TAOCI, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;

  LS.mkPage({
    D: D,
    eyebrow: '物 · 陶瓷',
    title: '陶瓷',
    suffix: ' · 物 · 知否知否',
    tabs: [
      { key: 'tao', label: '陶与瓷', blocks: [
        { sec: '陶器与瓷器', grid: 'is-wide' },
        { sec: '瓷器名称的由来', grid: 'is-wide' }
      ] },
      { key: 'yao', label: '五大名窑', blocks: [
        { sec: '五大名窑', grid: 'is-wide' },
        { sec: '五大名窑的比较', kind: 'table', cols: [['窑口', '@name'], ['釉色特征', '釉色特征'], ['观察关键词', '观察关键词'], ['需要注意', '需要注意']], wide: true },
        { sec: '其他重要窑口', grid: 'is-3' }
      ] },
      { key: 'you', label: '青花与釉色', blocks: [
        { sec: '青花瓷', grid: 'is-3' },
        { sec: '釉色' },
        { sec: '装饰技法的层次', kind: 'steps', grid: 'is-3' }
      ] },
      { key: 'kan', label: '怎么看一件瓷器', blocks: [
        { sec: '看一件陶瓷器的顺序', kind: 'steps', grid: 'is-3' },
        { sec: '陶瓷典故', grid: 'is-3' }
      ] }
    ]
  });
})();
