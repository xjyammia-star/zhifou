
/* 知否知否 · 物 · 服饰页
   数据：data/wz-fushi.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js
   “历代服饰图鉴”：38 张 AI 绘制的服饰示意图（登记在 data/images.js，类别 fushi），说明文字写在下面的 ERAS 里。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_WZ_FUSHI, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;
  var el = Z.el;

  /* 图鉴：按朝代分组，每条 [图名, 朝代, 标题, 看点] —— 看点只写能从图上看出来的形制特征 */
  var ERAS = [
    ['周代', [
      ['zhou_mianfu', '周代', '冕服', '上衣玄色、下裳纁色，头戴冕冠；衣裳上的章纹用来表示等级。'],
      ['zhou_shi_xuanduan', '周代', '士的玄端', '黑色素面的上衣和下裳，腰间垂着白色蔽膝，头戴黑色小冠；比冕服朴素得多，是士人行冠礼等场合的礼服。']
    ]],
    ['秦汉', [
      ['qin_nan', '秦代', '男子袍服', '黑色的直身长袍，交领右衽，领口和袖口镶红色窄边，腰束革带；秦人崇尚黑色，所以袍色以黑为主。'],
      ['han_qujv', '汉代', '女子曲裾深衣', '衣襟斜绕身体，交领右衽，腰间系带，下摆长而收。'],
      ['han_guanyuan', '汉代', '官员朝服', '宽袖长袍，边缘镶红，头戴进贤冠，是汉代官员常见的冠式。'],
      ['han_pingmin', '秦汉', '平民男子短褐', '粗麻布的短衣加长裤，裤脚扎起，衣服上缝着补丁；头上裹一块布巾，脚穿草鞋。']
    ]],
    ['魏晋南北朝', [
      ['weijin_shiren', '魏晋', '士人大袖衫', '袖子宽、衣身松，头上只用一块幅巾裹发，是魏晋士人的风气。'],
      ['weijin_nvzi', '魏晋', '女子杂裾垂髾服', '窄袖短衣配长裙，腰间垂着几片上宽下尖的飘带（髾），肩上搭着薄纱披帛，整体轻盈。'],
      ['beichao_hufu', '北朝', '鲜卑男子裤褶服', '窄袖短袍加长裤，衣襟向左掩（左衽），和汉族服装的右衽相反；腰束革带，头戴垂裙的软帽。']
    ]],
    ['唐代', [
      ['tang_guanyuan', '唐代', '官员圆领袍', '圆领、右衽，腰束革带，头戴软脚幞头；袍色与品级有关。'],
      ['tang_nv_hufu', '唐代', '女子胡服', '窄袖长袍，领口缘边宽阔，衣身织着花纹，腰束革带，头戴尖顶锦帽；唐代女子常穿这类受胡服影响的装束。'],
      ['tang_nvzi', '唐代', '女子襦裙', '短襦配高腰长裙，裙腰提到胸口，肩上搭披帛。'],
      ['tang_pingmin_nan', '唐代', '平民男子短袍', '圆领窄袖的素色麻布短袍，缝着补丁，腰系布带，头戴软脚幞头；和官员的长袍相比，短、素、朴。']
    ]],
    ['宋代', [
      ['song_huangdi', '宋代', '皇帝常服（赭黄袍）', '赭黄色的圆领大袖袍，素面，没有龙纹，腰系玉带，头戴直脚幞头；“黄袍加身”说的就是帝王穿的这类黄色袍服。'],
      ['song_guanyuan', '宋代', '官员公服', '圆领大袖袍，革带，头戴直脚幞头，手里持笏。'],
      ['song_shiren', '宋代', '士人襕衫', '白色圆领长衫，领袖缘边用深色，衣摆上有一道横襕；头戴东坡巾。'],
      ['song_nvzi', '宋代', '女子褙子', '窄袖、对襟的长褙子，里面是抹胸和褶裙，整体修长。'],
      ['song_pingmin_nan', '宋代', '平民男子短褐', '灰褐色粗布短衣，窄袖，袖上和衣摆缝着补丁，腰系黄布带，裤脚用布条绑起，头上裹黑色头巾，脚穿草鞋。'],
      ['song_pingmin_nv', '宋代', '平民女子衣裙', '素色窄袖短襦配靛蓝布裙，没有绣花；头上只用一根荆条发钗，就是“荆钗布裙”的样子。']
    ]],
    ['元代', [
      ['yuan_nan', '元代', '蒙古贵族男装', '腰部缝有一圈横向的褶线（辫线），下摆打褶；头戴钹笠帽。'],
      ['yuan_nvzi', '元代', '蒙古贵族女子袍服', '交领右衽的宽袖长袍，织着缠枝花纹；头戴高高的礼冠，冠顶插着羽毛。']
    ]],
    ['明代', [
      ['ming_huangdi', '明代', '皇帝常服', '明黄色圆领袍，袍上织着团龙，下摆有海水纹；头戴翼善冠，腰束玉带。'],
      ['ming_mingfu', '明代', '命妇凤冠霞帔', '大红的大袖衫外面挂着霞帔，霞帔上织云凤纹；头戴凤冠，是明代命妇礼服的样子。'],
      ['ming_wenguan', '明代', '一品文官常服', '圆领袍，胸前缝补子，一品文官用仙鹤；乌纱帽，腰束玉带。'],
      ['ming_wuguan', '明代', '一品武官常服', '衣服和文官一样，区别在补子：文官绣禽、武官绣兽，一品武官用狮子。'],
      ['ming_shiren', '明代', '士人道袍', '藏青色的交领右衽直身长袍，宽袖，领口和衣襟镶白边，腰系布带，头戴方形软巾；素净，没有补子。'],
      ['ming_nvzi', '明代', '女子袄裙', '上穿袄、下穿裙，外面罩长比甲或褙子，袖子宽松。']
    ]],
    ['清代', [
      ['qing_huangdi', '清代', '皇帝龙袍', '明黄色，圆领大襟，袖口是马蹄袖；袍上织龙，下摆有彩色的海水江崖。'],
      ['qing_huanghou', '清代', '皇后朝服', '明黄色，肩上披着波浪边的披领，袍上织龙和云，下摆有海水江崖；头戴缀满珍珠的朝冠，胸前挂着朝珠。'],
      ['qing_wenguan', '清代', '一品文官补服', '对襟的石青外褂，胸前补子被衣襟分成两半，戴暖帽、挂朝珠。'],
      ['qing_wuguan', '清代', '一品武官补服', '样式和文官补服一样，补子换成麒麟；戴红缨暖帽，挂朝珠。'],
      ['qing_hanzu_nv', '清代', '汉族女子袄裙', '立领右衽的短袄，领口、衣襟和袖口镶着绣花的宽边，下面是百褶长裙，袖子宽大，是清代汉族女子的常见装束。'],
      ['qing_pingmin_nan', '清代', '男子长袍与马甲', '灰蓝色的大襟长袍，外面套一件黑色缎面的对襟马甲，用盘扣；头戴瓜皮帽。'],
      ['qing_manv', '清代', '满族贵妇旗装', '直身的长袍，大襟，领口袖口都有宽边；头戴旗头，脚穿花盆底鞋。']
    ]],
    ['近现代', [
      ['minguo_qipao', '民国', '旗袍', '立领、右衽大襟，沿襟钉着盘扣；衣身合体，下摆开衩。'],
      ['minguo_nan', '民国', '男子长衫', '立领、右衽大襟的直身长衫，窄袖，布扣，素色棉布，常配西式礼帽。'],
      ['minguo_nvxuesheng', '民国', '女学生装', '白色立领短袄，袖口宽大，镶深蓝色滚边，下配黑色长裙，是民国女学生常见的校服式样。'],
      ['zhongshan_zhuang', '近现代', '中山装', '立翻领，前襟五颗扣，四个带盖的口袋，袖口三颗小扣，裤子直筒。']
    ]]
  ];

  function figure(g) {
    var info = window.ZIMG && window.ZIMG.get('fushi', g[0]);
    if (!info) return null;
    var img = el('img', { 'class': 'zf-img', src: info.src, srcset: info.srcset, sizes: '(max-width: 720px) 94vw, 440px', alt: g[1] + g[2] + '示意图', loading: 'lazy', decoding: 'async' });
    if (info.width && info.height) { img.width = info.width; img.height = info.height; }
    var cap = el('figcaption', { 'class': 'zf-cap' }, [
      el('strong', { text: g[1] + ' · ' + g[2] }),
      el('span', { 'class': 'zf-txt', text: g[3] }),
      el('span', { 'class': 'zf-ai', text: info.aiLabel })
    ]);
    return el('figure', { 'class': 'zf zf-fushi' }, [img, cap]);
  }

  function gallery() {
    var kids = [Z.note('下面是 38 张服饰示意图，按朝代排列。图是 AI 绘制的，参照文献和传世图像画出大致形制；颜色和花纹只是示意，不对应某一件具体的文物，帽子等小件在细节上更是示意。同一个朝代里，不同身份、不同场合的穿法差别很大，每张图只展示其中一种。')];
    var total = 0;
    ERAS.forEach(function (era) {
      var figs = era[1].map(figure).filter(Boolean);
      if (!figs.length) return;
      total += figs.length;
      kids.push(el('h3', { 'class': 'zf-sec-title zf-era', text: era[0] }));
      kids.push(el('div', { 'class': 'zf-grid zf-fushi-grid' }, figs));
    });
    if (!total) return null;
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
