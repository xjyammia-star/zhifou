
/* 知否知否 · "唐诗"页的启动脚本
   页面排版全部由 js/wen-poets.js 负责，这里只是把这一页自己的数据（data/tangshi.js）交给它去渲染。 */
(function () {
  'use strict';
  if (!window.ZHIFOU_WENPOETS || !window.ZHIFOU_TANGSHI) return;
  window.ZHIFOU_WENPOETS.mount('app', window.ZHIFOU_TANGSHI, { eyebrow: '文学 · 唐诗', sectionTitle: '按作者浏览' });
})();
