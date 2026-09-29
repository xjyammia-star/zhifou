/* 知否知否 · "宋词"页的启动脚本
   页面排版全部由 js/wen-poets.js 负责，这里只是把这一页自己的数据（data/songci.js）交给它去渲染。 */
(function () {
  'use strict';
  if (!window.ZHIFOU_WENPOETS || !window.ZHIFOU_SONGCI) return;
  window.ZHIFOU_WENPOETS.mount('app', window.ZHIFOU_SONGCI, {
    eyebrow: '文 · 宋词',
    sectionTitle: '按词人浏览',
    unit: '首',
    textTag: '词句',
    glossLabel: '词句解读',
    searchPlaceholder: '搜索词人、词牌、作品名或词句关键词，如：苏轼、水调歌头、明月几时有'
  });
})();
