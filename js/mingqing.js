
/* 知否知否 · "名著"页的启动脚本
   页面排版全部由 js/wen-read.js 负责，这里只是把这一页自己的数据（data/mingqing.js）交给它去渲染。
   复制自 js/shijing.js，只换了数据变量名和文件名。 */
(function () {
  'use strict';
  if (!window.ZHIFOU_WENREAD || !window.ZHIFOU_MINGQING) return;
  window.ZHIFOU_WENREAD.mount('app', window.ZHIFOU_MINGQING, { eyebrow: '文学 · 名著', sectionTitle: '名著书目', collapseRest: true });
})();
