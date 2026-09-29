/* 知否知否 · "元曲"页的启动脚本
   页面排版全部由 js/wen-poets.js 负责，这里只是把这一页自己的数据（data/yuanqu.js）交给它去渲染。 */
(function () {
  'use strict';
  if (!window.ZHIFOU_WENPOETS || !window.ZHIFOU_YUANQU) return;
  window.ZHIFOU_WENPOETS.mount('app', window.ZHIFOU_YUANQU, {
    eyebrow: '文 · 元曲',
    sectionTitle: '按作者浏览',
    unit: '篇',
    textTag: '曲文',
    searchPlaceholder: '搜索作者、曲牌、剧名或曲文关键词，如：关汉卿、天净沙、窦娥冤、断肠'
  });
})();
