
/* 知否知否 · 物 · 青铜器与玉器页
   数据：data/wz-qingtong.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_WZ_QINGTONG, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;

  LS.mkPage({
    D: D,
    eyebrow: '物 · 青铜器与玉器',
    title: '青铜器与玉器',
    suffix: ' · 物 · 知否知否',
    tabs: [
      { key: 'tong', label: '青铜器', blocks: [
        { sec: '青铜与玉的位置', grid: 'is-wide' },
        { sec: '青铜礼器', grid: 'is-3' },
        { sec: '鼎爵簋对照', kind: 'table', cols: [['器物', '@name'], ['主要用途', '主要用途'], ['常见礼仪场景', '常见礼仪场景'], ['文化象征', '文化象征']] },
        { sec: '青铜器纹饰' }
      ] },
      { key: 'yu', label: '玉器与六器', blocks: [
        { sec: '玉器的礼仪用途' },
        { sec: '六器' },
        { sec: '六器速查', kind: 'table', cols: [['玉器', '@name'], ['典型形制', '典型形制'], ['《周礼》中的礼仪对象', '《周礼》中的礼仪对象'], ['常见理解', '常见理解']], wide: true },
        { sec: '玉比德', grid: 'is-wide' }
      ] },
      { key: 'bi', label: '对照与典故', blocks: [
        { sec: '青铜器与玉器的比较', kind: 'table', cols: [['方面', '@name'], ['青铜器', '青铜器'], ['玉器', '玉器']], wide: true },
        { sec: '观察一件器物的顺序', kind: 'steps', grid: 'is-3' },
        { sec: '代表性器物' },
        { sec: '青铜与玉的典故', grid: 'is-3' }
      ] }
    ]
  });
})();
