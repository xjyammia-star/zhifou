
/* 知否知否 · 艺 · 游艺与茶酒页
   数据：data/yi-youyi.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_YI_YOUYI, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;

  var noYq = function (v) { return v.replace('（酒器）', ''); };

  LS.mkPage({
    D: D,
    eyebrow: '艺术 · 游艺与茶酒',
    title: '游艺与茶酒',
    suffix: ' · 艺术 · 知否知否',
    tabs: [
      { key: 'youxi', label: '古代游戏', blocks: [
        { sec: '怎样理解古代游戏', img: 'youyi', grid: 'is-3' },
        { sec: '游戏的六种类型', img: 'youyi', grid: 'is-3' },
        { sec: '叶子戏的演变', kind: 'steps' },
        { sec: '叶子戏的名称与典故', img: 'youyi' },
        { sec: '射覆与藏钩', img: 'youyi' },
        { sec: '棋类与博弈', img: 'youyi' },
        { sec: '竞技与身体游戏', img: 'youyi' },
        { sec: '节令与闺阁游戏', img: 'youyi' },
        { sec: '文人与宴饮游戏', img: 'youyi' },
        { sec: '牌类与智力玩具', img: 'youyi' },
        { sec: '游戏与赌博', img: 'youyi' },
        { sec: '研究古代游戏的六个办法', kind: 'steps' },
        { sec: '名人附会的四个核对', img: 'youyi', grid: 'is-3' }
      ] },
      { key: 'chajiu', label: '茶与酒', blocks: [
        { sec: '茶与酒的位置', img: 'youyi' },
        { sec: '茶的历史线索', kind: 'steps' },
        { sec: '茶道与茶礼', img: 'youyi' },
        { sec: '茶礼的六个环节', kind: 'steps' },
        { sec: '六大茶类', img: 'youyi', grid: 'is-3' },
        { sec: '分类时的注意事项', img: 'youyi' },
        { sec: '茶具与茶事器物', img: 'youyi' },
        { sec: '名茶与茶事背景', img: 'youyi' },
        { sec: '酒在礼仪中的用处', img: 'youyi', grid: 'is-3' },
        { sec: '酒礼里看什么', img: 'youyi' },
        { sec: '古代酒器', img: 'youyi' },
        { sec: '酒器与酒礼的对应', kind: 'table',
          cols: [['场景', '@name', noYq], ['相关器物', '相关器物'], ['重点', '重点']] },
        { sec: '酒的种类与工艺', img: 'youyi' },
        { sec: '节令酒与酒肆', img: 'youyi' },
        { sec: '茶与酒的对照', kind: 'table', cols: [['方面', '@name'], ['茶', '茶'], ['酒', '酒']] },
        { sec: '茶与酒的典故', img: 'youyi' }
      ] }
    ]
  });
})();
