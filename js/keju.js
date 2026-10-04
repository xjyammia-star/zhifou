/* 知否知否 · 礼思 · 科举与官职页
   数据：data/ls-keju.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_LS_KEJU, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;

  LS.mkPage({
    D: D,
    eyebrow: '礼思 · 科举与官职',
    title: '科举与官职',
    tabs: [
      { key: 'xuan', label: '选官方式', blocks: [
        { sec: '选官方式的变化', kind: 'table', cols: [['时期', '@name'], ['主要选官方式', '主要选官方式'], ['特点', '特点']] },
        { sec: '唐宋明清科举对比', kind: 'table', wide: true, cols: [['时期', '@name'], ['考试内容', '考试内容'], ['防作弊与放榜', '防作弊与放榜'], ['考中后的道路', '考中后的道路']] },
        { sec: '科举的终结', grid: 'is-wide' },
        { sec: '武举与特殊科目', grid: 'is-wide' }
      ] },
      { key: 'ke', label: '明清科举', blocks: [
        { sec: '一个明清考生的路线', kind: 'steps', stepFmt: function (i) { return '第 ' + (i + 1) + ' 步'; }, grid: 'is-wide' },
        { sec: '明清科举的四级', kind: 'steps', stepFmt: function (i) { return '第 ' + (i + 1) + ' 级'; }, grid: 'is-wide' },
        { sec: '考试内容与制度变化', grid: 'is-wide' },
        { sec: '八股文的八个部分', kind: 'steps', grid: 'is-wide' },
        { sec: '八股文示意', grid: 'is-wide' }
      ] },
      { key: 'chang', label: '考场与放榜', blocks: [
        { sec: '考场：号舍与三场', grid: 'is-wide' },
        { sec: '殿试、传胪与放榜', grid: 'is-wide' },
        { sec: '作弊与防作弊', grid: 'is-3' },
        { sec: '三起清代科场案', grid: 'is-3' }
      ] },
      { key: 'guan', label: '官阶与官服', blocks: [
        { sec: '九品十八级', kind: 'table', cols: [['品级', '@name'], ['结构', '结构'], ['说明', '说明']] },
        { sec: '官服与补子', kind: 'table', cols: [['品级', '@name', function (v) { return v.replace(/的补子$/, ''); }], ['文官', '文官'], ['武官', '武官']] },
        { sec: '补子的来源与寓意', grid: 'is-wide' },
        { sec: '六部各管什么', kind: 'table', cols: [['六部', '@name'], ['主要事务', '主要事务'], ['现代化理解时的边界', '现代化理解时的边界']] },
        { sec: '六部下设各司', kind: 'table', cols: [['六部', '@name'], ['下设的司', '下设的司'], ['说明', '说明']] }
      ] },
      { key: 'zhi', label: '官制与术语', blocks: [
        { sec: '中央官制', grid: 'is-3' },
        { sec: '地方与基层', grid: 'is-3' },
        { sec: '官员的身份与升降', grid: 'is-wide' },
        { sec: '官员的一天', grid: 'is-3' },
        { sec: '科举里的相关称谓', grid: 'is-wide' },
        { sec: '科举里的更多称谓', kind: 'table', cols: [['称谓', '@name'], ['意思', '意思']] }
      ] },
      { key: 'dian', label: '典故与人物', blocks: [
        { sec: '著名状元', grid: 'is-wide' },
        { sec: '连中三元的例子', grid: 'is-wide' },
        { sec: '连中三元的常见名单', kind: 'table', cols: [['朝代', '@name'], ['人物', '人物']] },
        { sec: '落第者与高龄中举', grid: 'is-wide' },
        { sec: '读书的典故', grid: 'is-wide' },
        { sec: '读制度史的三个边界', grid: 'is-3' }
      ] }
    ]
  });
})();
