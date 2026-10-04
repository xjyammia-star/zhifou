
/* 知否知否 · 统一导航
   ----------------------------------------------------------
   页头右侧的一级导航（今日一页 / 时令 / 神灵 / 建筑 / 器物 / 字语 / 礼思 / 艺术 / 文学），
   以及页头下面的二级导航（当前板块里的全部内容）都由这个文件生成。
   以后新增板块或新增页面，只需要改下面的 SECTIONS 和 ALIAS。
   页面靠 <body data-page="…"> 告诉本文件"我是哪一页"。 */
(function () {
  'use strict';

  /* 板块：key 是内部名字；label 是一级导航上显示的字；home 是点这个板块时进入的默认首页；
     items 是二级导航里的全部内容，按显示顺序排列 */
  var SECTIONS = [
    {
      key: 'shi', label: '时令', home: 'jieqi.html',
      items: [
        { page: 'jieqi', label: '廿四节气', href: 'jieqi.html' },
        { page: 'jieri', label: '传统节日', href: 'jieri.html' },
        { page: 'shichen', label: '十二时辰', href: 'shichen.html' },
        { page: 'shengxiao', label: '十二生肖', href: 'shengxiao.html' },
        { page: 'yuefen', label: '月份与农历', href: 'yuefen.html' },
        { page: 'shujiusanfu', label: '数九三伏', href: 'shujiusanfu.html' }
      ]
    },
    {
      key: 'shen', label: '神灵', home: 'shen.html',
      items: [
        { page: 'shen', label: '三界地图', href: 'shen.html' },
        { page: 'shenhua', label: '上古神话', href: 'shenhua.html' },
        { page: 'xingxiu', label: '二十八宿', href: 'xingxiu.html' },
        { page: 'shenling', label: '民间神灵', href: 'shenling.html' },
        { page: 'daojiao', label: '道教神谱', href: 'daojiao.html' },
        { page: 'fojiao', label: '佛教体系', href: 'fojiao.html' },
        { page: 'shanhai', label: '山海经异兽', href: 'shanhai.html' }
      ]
    },
    {
      key: 'jianzhu', label: '建筑', home: 'jianzhu.html',
      items: [
        { page: 'jianzhu', label: '建筑入口', href: 'jianzhu.html' },
        { page: 'mugoujia', label: '木构架与榫卯', href: 'mugoujia.html' },
        { page: 'wuding', label: '屋顶与脊兽', href: 'wuding.html' },
        { page: 'minju', label: '院落与民居', href: 'minju.html' },
        { page: 'gongdian', label: '宫殿坛庙与城市', href: 'gongdian.html' },
        { page: 'yuanlin', label: '园林', href: 'yuanlin.html' },
        { page: 'louge', label: '楼阁与匾额对联', href: 'louge.html' },
        { page: 'siguan', label: '寺观塔与桥', href: 'siguan.html' },
        { page: 'lingmu', label: '陵墓与墓葬', href: 'lingmu.html' },
        { page: 'shijian', label: '代表建筑时间线', href: 'shijian.html' }
      ]
    },
    {
      key: 'wu', label: '器物', home: 'wu.html',
      items: [
        { page: 'wu', label: '器物入口', href: 'wu.html' },
        { page: 'wenfang', label: '文房四宝', href: 'wenfang.html' },
        { page: 'faming', label: '四大发明', href: 'faming.html' },
        { page: 'taoci', label: '陶瓷', href: 'taoci.html' },
        { page: 'qingtong', label: '青铜器与玉器', href: 'qingtong.html' },
        { page: 'fushi', label: '服饰', href: 'fushi.html' }
      ]
    },
    {
      key: 'ziyu', label: '字语', home: 'ziyu.html',
      items: [
        { page: 'ziyu', label: '字语入口', href: 'ziyu.html' },
        { page: 'hanzi', label: '汉字', href: 'hanzi.html' },
        { page: 'ciyu', label: '词语的古今', href: 'ciyu.html' },
        { page: 'chengwei', label: '称谓与名字', href: 'chengwei.html' },
        { page: 'wanwu', label: '天地万物的名字', href: 'wanwu.html' },
        { page: 'yanse', label: '传统颜色', href: 'yanse.html' }
      ]
    },
    {
      key: 'lisi', label: '礼思', home: 'lisi.html',
      items: [
        { page: 'lisi', label: '礼思入口', href: 'lisi.html' },
        { page: 'liyi', label: '礼仪', href: 'liyi.html' },
        { page: 'sixiang', label: '诸子与思想', href: 'sixiang.html' },
        { page: 'yinyang', label: '阴阳五行与八卦', href: 'yinyang.html' },
        { page: 'jiaoyu', label: '教育与蒙学', href: 'jiaoyu.html' },
        { page: 'keju', label: '科举与官职', href: 'keju.html' }
      ]
    },
    {
      key: 'yi', label: '艺术', home: 'yi.html',
      items: [
        { page: 'yi', label: '琴棋书画', href: 'yi.html' },
        { page: 'shuhua', label: '书画篆刻', href: 'shuhua.html' },
        { page: 'yinyue', label: '音乐与戏曲', href: 'yinyue.html' },
        { page: 'youyi', label: '游艺与茶酒', href: 'youyi.html' },
        { page: 'gongyi', label: '民间工艺', href: 'gongyi.html' }
      ]
    },
    {
      /* “文学”板块正在一页一页做，items 只列出已经上线的页面；
         之后每做完一页，就在这里加一行，制作中的页面暂时不出现在二级导航里 */
      key: 'wen', label: '文学', home: 'wen.html',
      items: [
        { page: 'wen', label: '文学入口', href: 'wen.html' },
        { page: 'shijingpian', label: '诗经', href: 'shijingpian.html' },
        { page: 'chuci', label: '楚辞', href: 'chuci.html' },
        { page: 'hanweishi', label: '汉乐府与魏晋诗', href: 'hanweishi.html' },
        { page: 'tangshi', label: '唐诗', href: 'tangshi.html' },
        { page: 'songci', label: '宋词', href: 'songci.html' },
        { page: 'yuanqu', label: '元曲', href: 'yuanqu.html' },
        { page: 'qingci', label: '清词', href: 'qingci.html' },
        { page: 'mingqing', label: '名著', href: 'mingqing.html' }
      ]
    },
    {
      /* “典籍”板块：总书架 + 六个朝代页，每页都能按类型筛选；每本书一页（dianji-book.html），算作“典籍书架”这一项 */
      key: 'dianji', label: '典籍', home: 'dianji.html',
      items: [
        { page: 'dianji', label: '典籍书架', href: 'dianji.html' },
        { page: 'dianji-xianqin', label: '先秦', href: 'dianji-xianqin.html' },
        { page: 'dianji-qinhan', label: '秦汉', href: 'dianji-qinhan.html' },
        { page: 'dianji-weijin', label: '魏晋南北朝', href: 'dianji-weijin.html' },
        { page: 'dianji-suitang', label: '隋唐五代', href: 'dianji-suitang.html' },
        { page: 'dianji-songyuan', label: '宋辽金元', href: 'dianji-songyuan.html' },
        { page: 'dianji-mingqing', label: '明清', href: 'dianji-mingqing.html' }
      ]
    }
  ];

  /* 有些页面不在二级导航里单独出现，而是归到某一项下面（补充阅读页），
     这里写明它们"算作"哪一项，用来高亮 */
  var ALIAS = {
    'ganzhi': 'shichen',
    'shengxiao-kepu': 'shengxiao',
    /* 文房四宝的第二页、四大发明的四个分页，都算作各自那一个标签 */
    'wenfang-diangu': 'wenfang',
    'zaozhi': 'faming',
    'yinshua': 'faming',
    'huoyao': 'faming',
    'zhinanzhen': 'faming',
    /* 典籍：每本书的页面都算作“典籍书架” */
    'dianji-book': 'dianji',
    /* 陵墓与墓葬：每座墓的详页都算作“陵墓与墓葬” */
    'lingmu-detail': 'lingmu'
  };

  var page = document.body.getAttribute('data-page') || '';
  var pageKey = ALIAS[page] || page;

  var current = null;
  SECTIONS.forEach(function (s) {
    s.items.forEach(function (it) { if (it.page === pageKey) current = s; });
  });

  function link(href, text, isCurrent, cls) {
    var a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    if (cls) a.className = cls;
    if (isCurrent) a.setAttribute('aria-current', 'page');
    return a;
  }

  var header = document.querySelector('.site-header');
  var nav = document.getElementById('site-nav');
  if (!header || !nav) return;

  /* 一级导航 */
  nav.textContent = '';
  nav.appendChild(link('index.html', '今日一页', page === 'home'));
  SECTIONS.forEach(function (s) {
    nav.appendChild(link(s.home, s.label, current === s, 'is-section sec-' + s.key));
  });
  /* 手机上导航放不下时可以左右滑动；进来时把当前项滚到看得见的位置 */
  var curTop = nav.querySelector('[aria-current="page"]');
  if (curTop && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = Math.max(0, curTop.offsetLeft - 24);

  /* 板块切换动画（具体效果在 js/sectionfx.js）：
     只在“点一级导航切换到另一个板块”时播放，同一次访问里每个板块只播一次；
     首页抽卡直达、板块内换页、刷新页面都不播。在板块首页网址后加 ?fx=1 可强制播放，方便查看。
     新增有动画的板块：在 sectionfx.js 加效果，再把板块名加进下面的 FX_KEYS。 */
  var FX_KEYS = { shi: 1, shen: 1, jianzhu: 1, wu: 1, ziyu: 1, lisi: 1, yi: 1, wen: 1, dianji: 1 };
  try {
    nav.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a.is-section') : null;
      if (!a || a.getAttribute('aria-current') === 'page') return;
      var m = /sec-(\w+)/.exec(a.className);
      if (m) sessionStorage.setItem('zf-fx-next', m[1]);
    });
    var fxNext = sessionStorage.getItem('zf-fx-next');
    sessionStorage.removeItem('zf-fx-next');
    var fxDone = (sessionStorage.getItem('zf-fx-done') || '').split(',');
    var fxForce = /[?&]fx=1(&|$)/.test(location.search);
    if (current && FX_KEYS[current.key] && (fxForce || (fxNext === current.key && fxDone.indexOf(current.key) < 0))) {
      if (!fxForce) sessionStorage.setItem('zf-fx-done', fxDone.concat(current.key).join(','));
      var fxKey = current.key;
      var fxScript = document.createElement('script');
      fxScript.src = 'js/sectionfx.js';
      fxScript.onload = function () { if (window.ZFSectionFX) window.ZFSectionFX.play(fxKey); };
      document.head.appendChild(fxScript);
    }
  } catch (err) { /* 浏览器不让用存储时，就不播放动画，不影响页面 */ }

  /* 二级导航：只在进入某个板块的页面时出现 */
  if (!current) return;
  var bar = document.createElement('div');
  bar.className = 'sub-nav';
  var inner = document.createElement('div');
  inner.className = 'wrap sub-nav-inner';
  var sub = document.createElement('nav');
  sub.setAttribute('aria-label', current.label + '的内容');
  var mark = document.createElement('span');
  mark.className = 'sub-nav-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = current.label;
  sub.appendChild(mark);
  current.items.forEach(function (it) {
    sub.appendChild(link(it.href, it.label, it.page === pageKey));
  });
  inner.appendChild(sub);
  bar.appendChild(inner);
  header.parentNode.insertBefore(bar, header.nextSibling);
  var curSub = sub.querySelector('[aria-current="page"]');
  if (curSub && sub.scrollWidth > sub.clientWidth) sub.scrollLeft = Math.max(0, curSub.offsetLeft - 80);
})();

/* ---------- 页面底部的“批注”：只留读者用得上的说明 ----------
   各页的“批注”里，有一部分是整理文案时写给作者自己的备忘（“见笔记某节”“请核对”“将来某页做好后再加链接”等），
   读者看了没用。这里在页面画好之后，把这类备忘句子去掉；剩下的（比如“示意图不是实测图”“走兽只讲清代官式”）
   继续显示，标题改成“说明”；一条都不剩时，整个“批注”块不再显示。
   判断用的是下面这条规则 INTERNAL：以后新增的批注只要带这些字样，也会自动被去掉。 */
(function () {
  'use strict';
  var INTERNAL = /笔记|Obsidian|请核对|逐个核对|我(补|按|把|根据|合并|为了|估|新起)|归属表|将来|之后会|做好|没有增加|网站正文|文案|按[《“"].*整理|整理.*为准|抽卡|卡池|口径与|知识缺口补全|来自《/;
  function clean(d) {
    if (d.getAttribute('data-notes-clean')) return;
    var s = d.firstElementChild;
    if (!s || s.tagName !== 'SUMMARY' || s.textContent.replace(/\s+/g, '') !== '批注') return;
    d.setAttribute('data-notes-clean', '1');
    var body = s.nextElementSibling;
    if (!body) return;
    var kept = 0;
    Array.prototype.slice.call(body.children).forEach(function (p) {
      if (INTERNAL.test(p.textContent)) p.parentNode.removeChild(p); else kept++;
    });
    if (!kept) d.parentNode.removeChild(d); else s.textContent = '说明';
  }
  function sweep() {
    var list = document.querySelectorAll('details');
    for (var i = 0; i < list.length; i++) clean(list[i]);
  }
  var timer = 0;
  function later() { if (!timer) timer = setTimeout(function () { timer = 0; sweep(); }, 30); }
  if (window.MutationObserver) new MutationObserver(later).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState !== 'loading') sweep(); else document.addEventListener('DOMContentLoaded', sweep);
})();


/* ---------- 全站“回到顶部”按钮 ----------
   页面往下滚过约 600 像素后，右下角浮出一个圆形按钮，点一下平滑回到页面最上方；回到顶部附近自动隐藏。
   每个页面都会引入 nav.js，所以这里加一次，全站 60 个页面都有，不用改每个 html。
   唐诗、宋词、元曲三页自己有一个同款按钮（js/wen-poets.js），这三页这里不再重复显示。
   颜色跟着各板块的金线色走（取不到就用默认金色）。 */
(function () {
  'use strict';
  if (window.__zfToTop) return;
  window.__zfToTop = 1;

  var st = document.createElement('style');
  st.textContent =
    '.zf-totop{position:fixed;right:18px;bottom:calc(22px + env(safe-area-inset-bottom,0px));z-index:40;' +
    'width:46px;height:46px;padding:0;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;' +
    'color:#f6ecd8;background:rgba(43,38,34,.9);border:1px solid var(--zy-gold,#c2a15a);' +
    'box-shadow:0 4px 16px rgba(0,0,0,.4);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);' +
    'transition:background .2s,transform .2s}' +
    '.zf-totop[hidden]{display:none}' +
    '.zf-totop:hover,.zf-totop:focus-visible{background:rgba(70,58,48,.96);transform:translateY(-2px)}' +
    '.zf-totop svg{width:20px;height:20px;display:block}' +
    '@media (max-width:600px){.zf-totop{right:12px;bottom:calc(16px + env(safe-area-inset-bottom,0px));width:42px;height:42px}}';
  document.head.appendChild(st);

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'zf-totop';
  btn.hidden = true;
  btn.setAttribute('aria-label', '回到顶部');
  btn.title = '回到顶部';
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function update() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    var want = y > 600 && !document.querySelector('.tp-totop');
    if (btn.hidden === !want) return;
    btn.hidden = !want;
  }
  btn.addEventListener('click', function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  function start() {
    document.body.appendChild(btn);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();

/* 页脚“数据统计”按钮：放在“知否知否 · 中国传统文化百科”旁边。
   点击时才加载 data/site-stats.js 和 js/stats.js（数字由 工具脚本\生成站点统计.js 自动生成），平时不增加页面负担。 */
(function () {
  'use strict';
  if (window.__zfStatsBtn) return;
  window.__zfStatsBtn = 1;

  var st = document.createElement('style');
  st.textContent =
    '.zf-foot-left{display:inline-flex;align-items:center;flex-wrap:wrap;gap:6px 14px}' +
    '.zf-stats-btn{display:inline-flex;align-items:center;min-height:26px;padding:2px 12px;font:inherit;font-size:12px;letter-spacing:.14em;line-height:1.5;' +
    'color:inherit;background:transparent;border:1px solid currentColor;border-radius:999px;opacity:.78;cursor:pointer}' +
    '.zf-stats-btn:hover,.zf-stats-btn:focus-visible{opacity:1;background:rgba(128,128,128,.16)}' +
    '.zf-stats-btn[disabled]{opacity:.5;cursor:wait}';
  document.head.appendChild(st);

  function loadScript(src, cb) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () { cb(true); };
    s.onerror = function () { cb(false); };
    document.head.appendChild(s);
  }
  function openStats(btn) {
    if (window.ZFStats && window.ZF_STATS) { window.ZFStats.open(); return; }
    btn.disabled = true;
    loadScript('data/site-stats.js', function (ok1) {
      if (!ok1) { btn.disabled = false; return; }
      loadScript('js/stats.js', function (ok2) {
        btn.disabled = false;
        if (ok2 && window.ZFStats) window.ZFStats.open();
      });
    });
  }
  function mount() {
    var inner = document.querySelector('.site-footer .footer-inner');
    if (!inner || inner.querySelector('.zf-stats-btn')) return;
    var first = inner.firstElementChild;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'zf-stats-btn';
    btn.textContent = '数据统计';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.addEventListener('click', function () { openStats(btn); });
    if (first) {
      var wrap = document.createElement('span');
      wrap.className = 'zf-foot-left';
      inner.insertBefore(wrap, first);
      wrap.appendChild(first);
      wrap.appendChild(btn);
    } else {
      inner.appendChild(btn);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();

/* 知否知否 · 规范网址（canonical）：告诉搜索引擎“这一页的正本在 culture.ischoolthai.cn”，
   旧的 vercel 地址也能打开时，不会被当成两个重复的网站。
   只保留 id 参数（节气、典籍、陵墓等内容页靠它区分），其他参数一律不算。
   要换域名，只改下面的 CANON_SITE。 */
(function () {
  'use strict';
  var CANON_SITE = 'https://culture.ischoolthai.cn';
  try {
    if (document.querySelector('link[rel="canonical"]')) return;
    var path = location.pathname.replace(/index\.html$/, '');
    if (path.charAt(0) !== '/') path = '/' + path;
    var id = new URLSearchParams(location.search).get('id');
    var href = CANON_SITE + path + (id ? '?id=' + encodeURIComponent(id) : '');
    var link = document.createElement('link');
    link.rel = 'canonical'; link.href = href;
    document.head.appendChild(link);
  } catch (e) { /* 忽略 */ }
})();
