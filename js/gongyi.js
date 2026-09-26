
/* 知否知否 · 艺 · 民间工艺页
   数据：data/yi-gongyi.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_YI_GONGYI, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;

  LS.mkPage({
    D: D,
    eyebrow: '艺 · 民间工艺',
    title: '民间工艺',
    suffix: ' · 艺 · 知否知否',
    tabs: [
      { key: 'jianzhi', label: '剪纸与年画', blocks: [
        { sec: '民间工艺是什么' },
        { sec: '剪纸', grid: 'is-3' },
        { sec: '剪纸的制作方法' },
        { sec: '剪纸的题材与地域' },
        { sec: '年画', grid: 'is-3' },
        { sec: '木版年画的制作流程', kind: 'steps' },
        { sec: '年画的六种类型' },
        { sec: '代表性年画产地' },
        { sec: '年画里的典故' }
      ] },
      { key: 'pixing', label: '皮影与刺绣', blocks: [
        { sec: '皮影', grid: 'is-3' },
        { sec: '皮影的制作流程', kind: 'steps' },
        { sec: '皮影的表演结构' },
        { sec: '皮影的题材与代表传统' },
        { sec: '刺绣', grid: 'is-3' },
        { sec: '常见的刺绣针法' },
        { sec: '四大名绣' },
        { sec: '刺绣里的更多内容' },
        { sec: '刺绣里的题材与寓意' }
      ] },
      { key: 'gengduo', label: '更多工艺', blocks: [
        { sec: '其他民间工艺' },
        { sec: '工艺术语', grid: 'is-3' },
        { sec: '少数民族工艺' }
      ] },
      { key: 'chuancheng', label: '比较与传承', blocks: [
        { sec: '四类工艺的比较' },
        { sec: '传承、保护与现代变化', grid: 'is-3' },
        { sec: '民间工艺的代表人物与传承' },
        { sec: '民间工艺里的典故' }
      ] }
    ]
  });
})();
