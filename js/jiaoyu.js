/* 知否知否 · 礼与思 · 教育与蒙学页
   数据：data/ls-jiaoyu.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_LS_JIAOYU, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;

  LS.mkPage({
    D: D,
    eyebrow: '礼与思 · 教育与蒙学',
    title: '教育与蒙学',
    after: [{ sec: '给今天的启发', grid: 'is-3' }],
    tabs: [
      { key: 'ti', label: '教育体系', blocks: [
        { sec: '教育体系的五种形态', kind: 'table', cols: [['形态', '@name'], ['场所或组织', '场所或组织'], ['主要对象与功能', '主要对象与功能']] },
        { sec: '私塾的一天与教学方法', grid: 'is-wide' },
        { sec: '古代教育的五项核心内容', grid: 'is-wide' },
        { sec: '书院与经典教育', grid: 'is-wide' }
      ] },
      { key: 'meng', label: '蒙学读物', blocks: [
        { sec: '《三字经》', grid: 'is-wide' },
        { sec: '《百家姓》与《千字文》', grid: 'is-wide' },
        { sec: '其他蒙学读物', grid: 'is-3' }
      ] },
      { key: 'liuyi', label: '六艺', blocks: [
        { sec: '六艺', grid: 'is-3' },
        { sec: '两种“六艺”要分开', grid: 'is-3' }
      ] },
      { key: 'jia', label: '家训与女子教育', blocks: [
        { sec: '家训与家庭教育', grid: 'is-wide' },
        { sec: '女子教育', grid: 'is-wide' }
      ] },
      { key: 'taixue', label: '太学与国子监', blocks: [
        { sec: '太学与国子监沿革', kind: 'table', cols: [['时期', '@name'], ['机构与变化', '机构与变化'], ['特点', '特点']] }
      ] }
    ]
  });
})();
