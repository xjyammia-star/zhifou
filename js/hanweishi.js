/* 知否知否 · "汉乐府与魏晋诗"页启动脚本
   页面排版全部由 js/wen-poets.js 负责（和诗经、楚辞、唐诗、宋词、元曲同一套卡片墙），
   这里只是把这一页自己的数据（data/hanweishi.js）交给它去渲染。 */
(function () {
  'use strict';
  if (!window.ZHIFOU_WENPOETS || !window.ZHIFOU_HANWEISHI) return;
  window.ZHIFOU_WENPOETS.mount('app', window.ZHIFOU_HANWEISHI, {
    eyebrow: '文学 · 汉乐府与魏晋诗',
    sectionTitle: '按时期浏览',
    unit: '首',
    textTag: '诗句',
    poetTag: '条目',
    poetLabel: ' 个条目',
    emptyNote: '原文暂未收录，先看上面的简介。',
    introOnlyLabel: '仅简介',
    searchPlaceholder: '搜索诗人、篇名或诗句关键词（如：曹操、上邪、采菊）'
  });
})();
