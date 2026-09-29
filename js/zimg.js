/* 知否知否 · 共用配图工具
   给"神"等不加载 app.js 的板块页面用，统一从 data/images.js 的登记表里查图。
   用法：页面 html 先引入 data/images.js，再引入这个文件，再引入页面自己的脚本；
   页面脚本里调用 window.ZIMG.get(kind, 名称)，查到返回图片信息对象，查不到返回 null（页面自己决定占位怎么显示）。
   键的格式是"类别/名称"，和 data/images.js 里的登记一致，比如 shenhua/盘古、xingxiu/青龙。
   本文件不改就好，以后新增类别不用改这里。 */
window.ZIMG = (function () {
  var IMGS = window.ZHIFOU_IMAGES || null;

  function imgUrl(info, w) {
    var c = (info.crop && info.crop < 1) ? 'c_crop,g_center,h_' + info.crop + ',w_' + info.crop + '/' : '';
    return IMGS.base + c + 'c_limit,w_' + w + '/f_auto,q_auto/v' + info.v + '/' + info.id;
  }

  function get(kind, name) {
    var info = IMGS && IMGS.items && IMGS.items[kind + '/' + name];
    if (!info) return null;
    return {
      src: imgUrl(info, 720),
      srcset: imgUrl(info, 480) + ' 480w, ' + imgUrl(info, 720) + ' 720w, ' + imgUrl(info, 960) + ' 960w',
      width: info.dw,
      height: info.dh,
      caption: info.caption,
      source: info.source,
      link: info.link || '',
      ai: !!info.ai,
      aiLabel: (IMGS && IMGS.aiLabel) || 'AI 生成插画'
    };
  }

  return { get: get };
})();
