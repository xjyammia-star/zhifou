
/* 知否知否 · 艺 · 书画篆刻页
   数据：data/yi-shuhua.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_YI_SHUHUA, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;

  LS.mkPage({
    D: D,
    eyebrow: '艺 · 书画篆刻',
    title: '书画篆刻',
    suffix: ' · 艺 · 知否知否',
    tabs: [
      { key: 'shufa', label: '书法', blocks: [
        { sec: '书法的四个层面' },
        { sec: '楷行草的区别', grid: 'is-3' },
        { sec: '永字八法' },
        { sec: '笔法里最常用的六个词', grid: 'is-3' },
        { sec: '章法的五个观察点' },
        { sec: '临帖的五个步骤', kind: 'steps' },
        { sec: '书体源流：篆与隶' },
        { sec: '书体源流：魏碑与草书' },
        { sec: '书家', grid: 'is-3' },
        { sec: '楷书的两种“四大家”' },
        { sec: '名家与名作速查', kind: 'table',
          cols: [['书家', '@name', function (v) { return v.replace('（速查）', ''); }], ['时代', '时代'], ['书体或风格', '书体或风格'], ['常见名作', '常见名作']] },
        { sec: '书法名作' },
        { sec: '书风的主线' },
        { sec: '宋四家' },
        { sec: '其他重要的书家与书体' },
        { sec: '碑与帖', grid: 'is-3' },
        { sec: '书法入门的路线', kind: 'steps' }
      ] },
      { key: 'huihua', label: '绘画', blocks: [
        { sec: '看绘画的五个角度' },
        { sec: '三大题材', grid: 'is-3' },
        { sec: '人物画的五个方向' },
        { sec: '山水画的发展线索' },
        { sec: '花鸟画的四个方向' },
        { sec: '工笔、写意与兼工带写', grid: 'is-3' },
        { sec: '谢赫“六法”' },
        { sec: '文人画' },
        { sec: '重要的画家', grid: 'is-3' },
        { sec: '三件重要名作', grid: 'is-3' },
        { sec: '壁画与帛画', grid: 'is-3' },
        { sec: '元四家' },
        { sec: '明四家' },
        { sec: '各时代的绘画线索' },
        { sec: '几个常用的绘画概念' },
        { sec: '看一幅古画的顺序', kind: 'steps' },
        { sec: '绘画里的典故' }
      ] },
      { key: 'zhuanke', label: '篆刻与印章', blocks: [
        { sec: '印章与篆刻' },
        { sec: '篆刻的六个环节', kind: 'steps' },
        { sec: '印章的主要种类' },
        { sec: '朱文与白文', grid: 'is-3' },
        { sec: '印面章法的六个要点' },
        { sec: '篆刻的文字基础' },
        { sec: '篆刻的流派与人物' },
        { sec: '印泥' },
        { sec: '篆刻与书法的关系' },
        { sec: '印石、印钮与边款' },
        { sec: '古印与印的其他知识' },
        { sec: '初学篆刻的路线', kind: 'steps' },
        { sec: '篆刻里的典故' }
      ] }
    ]
  });
})();
