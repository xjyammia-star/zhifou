/* 知否知否 · 礼与思 · 科举与官职页
   数据：data/ls-keju.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_LS_KEJU, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;

  LS.mkPage({
    D: D,
    eyebrow: '礼与思 · 科举与官职',
    title: '科举与官职',
    tabs: [
      { key: 'xuan', label: '选官方式', blocks: [
        { sec: '选官方式的变化', kind: 'table', cols: [['时期', '@name'], ['主要选官方式', '主要选官方式'], ['特点', '特点']] }
      ] },
      { key: 'ke', label: '明清科举', blocks: [
        { sec: '明清科举的四级', kind: 'steps', stepFmt: function (i) { return '第 ' + (i + 1) + ' 级'; }, grid: 'is-wide' },
        { sec: '考场：号舍与三场', grid: 'is-3' },
        { sec: '考试内容与制度变化', grid: 'is-wide' },
        { sec: '八股文的八个部分', kind: 'steps', mode: 'line' }
      ] },
      { key: 'guan', label: '官阶与官服', blocks: [
        { sec: '九品十八级', kind: 'table', cols: [['品级', '@name'], ['结构', '结构'], ['说明', '说明']] },
        { sec: '官服与补子', kind: 'table', cols: [['品级', '@name', function (v) { return v.replace(/的补子$/, ''); }], ['文官', '文官'], ['武官', '武官']] },
        { sec: '六部各管什么', kind: 'table', cols: [['六部', '@name'], ['主要事务', '主要事务'], ['现代化理解时的边界', '现代化理解时的边界']] }
      ] },
      { key: 'zhi', label: '官制与术语', blocks: [
        { sec: '中央官制', grid: 'is-3' },
        { sec: '地方与基层', grid: 'is-3' },
        { sec: '官员的身份与升降', grid: 'is-wide' },
        { sec: '科举里的相关称谓', grid: 'is-wide' }
      ] },
      { key: 'dian', label: '典故与人物', blocks: [
        { sec: '著名状元', grid: 'is-wide' },
        { sec: '读书的典故', grid: 'is-wide' },
        { sec: '读制度史的三个边界', grid: 'is-3' }
      ] }
    ]
  });
})();
