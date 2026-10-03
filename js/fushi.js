
/* 知否知否 · 物 · 服饰页
   数据：data/wz-fushi.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js
   “历代服饰图鉴”：14 张 AI 绘制的服饰示意图（登记在 data/images.js，类别 fushi），说明文字写在下面的 GALLERY 里。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_WZ_FUSHI, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;
  var el = Z.el;

  /* 图鉴：[图名, 朝代, 标题, 看点] —— 看点只写能从图上看出来的形制特征 */
  var GALLERY = [
    ['zhou_mianfu', '周代', '冕服', '上衣玄色、下裳纁色，头戴冕冠；衣裳上的章纹用来表示等级。'],
    ['han_qujv', '汉代', '女子曲裾深衣', '衣襟斜绕身体，交领右衽，腰间系带，下摆长而收。'],
    ['han_guanyuan', '汉代', '官员朝服', '宽袖长袍，边缘镶红，头戴进贤冠，是汉代官员常见的冠式。'],
    ['weijin_shiren', '魏晋', '士人大袖衫', '袖子宽、衣身松，头上只用一块幅巾裹发，是魏晋士人的风气。'],
    ['tang_guanyuan', '唐代', '官员圆领袍', '圆领、右衽，腰束革带，头戴软脚幞头；袍色与品级有关。'],
    ['tang_nvzi', '唐代', '女子襦裙', '短襦配高腰长裙，裙腰提到胸口，肩上搭披帛。'],
    ['song_guanyuan', '宋代', '官员公服', '圆领大袖袍，革带，头戴直脚幞头，手里持笏。'],
    ['song_shiren', '宋代', '士人襕衫', '白色圆领长衫，领袖缘边用深色，衣摆上有一道横襕；头戴东坡巾。'],
    ['song_nvzi', '宋代', '女子褙子', '窄袖、对襟的长褙子，里面是抹胸和褶裙，整体修长。'],
    ['yuan_nan', '元代', '蒙古贵族男装', '腰部缝有一圈横向的褶线（辫线），下摆打褶；头戴钹笠帽。'],
    ['ming_wenguan', '明代', '一品文官常服', '圆领袍，胸前缝补子，一品文官用仙鹤；乌纱帽，腰束玉带。'],
    ['ming_nvzi', '明代', '女子袄裙', '上穿袄、下穿裙，外面罩长比甲或褙子，袖子宽松。'],
    ['qing_wenguan', '清代', '一品文官补服', '对襟的石青外褂，胸前补子被衣襟分成两半，戴暖帽、挂朝珠。'],
    ['qing_manv', '清代', '满族贵妇旗装', '直身的长袍，大襟，领口袖口都有宽边；头戴旗头，脚穿花盆底鞋。']
  ];

  function gallery() {
    var kids = [Z.note('下面是 14 张服饰示意图，按朝代排列。图是 AI 绘制的，参照文献和传世图像画出大致形制；颜色和花纹只是示意，不对应某一件具体的文物。同一个朝代里，不同身份、不同场合的穿法差别很大，每张图只展示其中一种。')];
    var figs = [];
    GALLERY.forEach(function (g) {
      var info = window.ZIMG && window.ZIMG.get('fushi', g[0]);
      if (!info) return;
      var img = el('img', { 'class': 'zf-img', src: info.src, srcset: info.srcset, sizes: '(max-width: 720px) 94vw, 440px', alt: g[1] + g[2] + '示意图', loading: 'lazy', decoding: 'async' });
      if (info.width && info.height) { img.width = info.width; img.height = info.height; }
      var cap = el('figcaption', { 'class': 'zf-cap' }, [
        el('strong', { text: g[1] + ' · ' + g[2] }),
        el('span', { 'class': 'zf-txt', text: g[3] }),
        el('span', { 'class': 'zf-ai', text: info.aiLabel })
      ]);
      figs.push(el('figure', { 'class': 'zf zf-fushi' }, [img, cap]));
    });
    if (!figs.length) return null;
    kids.push(el('div', { 'class': 'zf-grid zf-fushi-grid' }, figs));
    return Z.section('历代服饰图鉴', kids);
  }

  LS.mkPage({
    D: D,
    eyebrow: '器物 · 服饰',
    title: '服饰',
    suffix: ' · 器物 · 知否知否',
    tabs: [
      { key: 'xing', label: '形制与冠服', blocks: [
        { sec: '看服饰的六个方面' },
        { sec: '“汉服”的三个层面', grid: 'is-3' },
        { sec: '基本服装形制' },
        { sec: '冠服' }
      ] },
      { key: 'guan', label: '官服与礼仪', blocks: [
        { sec: '官服与礼服制度', grid: 'is-3' },
        { sec: '十二章纹' },
        { sec: '不同场合的服装' }
      ] },
      { key: 'se', label: '色彩纹样与织造', blocks: [
        { sec: '服饰色彩', grid: 'is-3' },
        { sec: '传统纹样' },
        { sec: '织造与染色', grid: 'is-3' }
      ] },
      { key: 'shi', label: '朝代演变', blocks: [
        { sec: '历史演变' },
        { custom: function () { return gallery() || document.createDocumentFragment(); } },
        { sec: '服饰典故' }
      ] }
    ]
  });
})();
