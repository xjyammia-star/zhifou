/* 知否知否 · 页头图 / 插图画廊（共用小工具）
   作用：页面自己的脚本把正文排好以后，这个文件按页面（body 的 data-page）把 AI 插画补进去，
   不用改每个页面原来的排版代码：
   - 文学各页、三界入口页：在页头下面放一张横幅头图；
   - 名著页：每本书的标题下面放“封面 + 5 幅场景/人物”画廊；
   - 四大发明四页：页头下面放“工艺图示”（示意图）。
   图片信息来自 data/images.js（经 js/zimg.js 的 ZIMG.get 查询）。查不到的图就不显示，页面照常。
   必须放在页面自己的脚本之后加载。本文件新增页面时，只需在下面 PAGES 里加一行。 */
(function () {
  'use strict';
  var Z = window.ZIMG;
  var page = document.body && document.body.getAttribute('data-page');
  var root = document.getElementById('app');
  if (!Z || !page || !root) return;

  function mk(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function fig(kind, name, cls, sizes) {
    var info = Z.get(kind, name);
    if (!info) return null;
    var f = mk('figure', 'zf ' + (cls || ''));
    var img = mk('img', 'zf-img');
    img.src = info.src;
    img.srcset = info.srcset;
    img.sizes = sizes || '(max-width: 720px) 94vw, 720px';
    img.alt = info.caption || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    if (info.width && info.height) { img.width = info.width; img.height = info.height; }
    f.appendChild(img);
    var cap = mk('figcaption', 'zf-cap');
    if (info.caption) cap.appendChild(mk('span', 'zf-txt', info.caption));
    if (info.ai) cap.appendChild(mk('span', 'zf-ai', info.aiLabel));
    f.appendChild(cap);
    return f;
  }

  function insertAfterHead(node) {
    var head = root.querySelector('.zy-head, .wx-head, .xx-head');
    if (head && head.parentNode) head.parentNode.insertBefore(node, head.nextSibling);
    else root.insertBefore(node, root.firstChild);
  }

  /* 页头横幅：登记键 kind/name */
  var BANNERS = {
    shen: ['sanjie', 'sanjie_header'],
    wen: ['wenxue', 'wenxue_entry'],
    shijing: ['wenxue', 'shijing_zong'],
    shijingpian: ['wenxue', 'shijing'],
    chuci: ['wenxue', 'chuci'],
    tangshi: ['wenxue', 'tangshi'],
    songci: ['wenxue', 'songci'],
    yuanqu: ['wenxue', 'yuanqu']
  };

  /* 四大发明工艺图示：页面 -> 图名（登记类别 sifaming）。指南针目前只有 3 张，罗盘图重画后再补。 */
  var CRAFT = {
    zaozhi: ['zhizhi_baopi', 'zhizhi_zhengzhu', 'zhizhi_chaozhi', 'zhizhi_shaizhi'],
    yinshua: ['yinshua_xieyang', 'yinshua_kaoban', 'yinshua_shuamo', 'yinshua_huoz'],
    huoyao: ['huoyao_liandan', 'huoyao_peiliao', 'huoyao_huojian', 'huoyao_yanhua'],
    zhinanzhen: ['zhinanzhen_sinan', 'zhinanzhen_fushui', 'zhinanzhen_luopan', 'zhinanzhen_hanghai']
  };

  /* 名著：章节 key -> 图名前缀（登记类别 mingzhu） */
  var BOOKS = { sanguo: 'sanguo', xiyouji: 'xiyou', shuihu: 'shuihu', honglou: 'honglou', fengshen: 'fengshen' };
  var SCENES = {
    sanguo: ['taoyuan', 'sangu', 'chibi', 'guanyu', 'caocao'],
    xiyou: ['shixia', 'naotiangong', 'shitu', 'huoyan', 'baigujing'],
    shuihu: ['wusong', 'luzhishen', 'linchong', 'juyi', 'shengchen'],
    honglou: ['daguanyuan', 'daiyu', 'baochai', 'xiangyun', 'shengqin'],
    fengshen: ['jiangziya', 'nezha', 'mushi', 'yangjian', 'fengshentai']
  };

  if (BANNERS[page]) {
    var b = fig(BANNERS[page][0], BANNERS[page][1], 'zf-banner', '(max-width: 760px) 94vw, 900px');
    if (b) insertAfterHead(b);
  }

  if (CRAFT[page]) {
    var names = CRAFT[page], figs = [];
    names.forEach(function (n) {
      var f = fig('sifaming', n, 'zf-craft', '(max-width: 640px) 94vw, 440px');
      if (f) figs.push(f);
    });
    if (figs.length) {
      var sec = mk('section', 'zf-sec');
      sec.setAttribute('aria-label', '工艺图示');
      sec.appendChild(mk('h2', 'zf-sec-title', '工艺图示'));
      sec.appendChild(mk('p', 'zf-sec-note', '以下为 AI 绘制的工艺示意图，用来帮助理解流程，不代表某一件具体文物或某一处作坊。'));
      var grid = mk('div', 'zf-grid');
      figs.forEach(function (f) { grid.appendChild(f); });
      sec.appendChild(grid);
      insertAfterHead(sec);
    }
  }

  if (page === 'mingqing') {
    Object.keys(BOOKS).forEach(function (key) {
      var art = document.getElementById('wr-' + key);
      var title = art && art.querySelector('.wr-title');
      if (!title) return;
      var pre = BOOKS[key];
      var cover = fig('mingzhu', pre + '_cover', 'zf-cover', '(max-width: 640px) 60vw, 220px');
      var scenes = (SCENES[pre] || []).map(function (s) {
        return fig('mingzhu', pre + '_' + s, 'zf-scene', '(max-width: 640px) 94vw, 460px');
      }).filter(Boolean);
      if (!cover && !scenes.length) return;
      var g = mk('div', 'zf-book');
      if (cover) g.appendChild(cover);
      if (scenes.length) {
        var sg = mk('div', 'zf-scenes');
        scenes.forEach(function (f) { sg.appendChild(f); });
        g.appendChild(sg);
      }
      title.parentNode.insertBefore(g, title.nextSibling);
    });
  }
})();
