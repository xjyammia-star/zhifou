
/* 知否知否 · "诗经到魏晋"页的启动脚本
   页面排版全部由 js/wen-read.js 负责，这里只是把这一页自己的数据（data/shijing.js）交给它去渲染。
   以后唐诗/宋词/元曲/明清小说这几页，也是复制这几行、换一下数据变量名和文件名就行。 */
(function () {
  'use strict';
  if (!window.ZHIFOU_WENREAD || !window.ZHIFOU_SHIJING) return;
  window.ZHIFOU_WENREAD.mount('app', window.ZHIFOU_SHIJING, { eyebrow: '文学 · 诗经到魏晋', sectionTitle: '四段读法' });
})();
