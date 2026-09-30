/* 知否知否 · "楚辞"页的启动脚本
   页面排版全部由 js/wen-poets.js 负责，这里只是把这一页自己的数据（data/chuci.js）交给它去渲染。 */
(function () {
  'use strict';
  if (!window.ZHIFOU_WENPOETS || !window.ZHIFOU_CHUCI) return;
  window.ZHIFOU_WENPOETS.mount('app', window.ZHIFOU_CHUCI, {
    eyebrow: '文学 · 楚辞',
    sectionTitle: '按体系浏览',
    unit: '篇',
    textTag: '诗句',
    poetTag: '类别',
    poetLabel: ' 个类别',
    glossLabel: '注解',
    searchPlaceholder: '搜索类别、篇名或诗句关键词，如：九歌、山鬼、离骚、路漫漫'
  });
})();
