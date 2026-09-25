/* 知否知否 · 统一导航
   ----------------------------------------------------------
   页头右侧的一级导航（今日一页 / 时 / 神 / 物），
   以及页头下面的二级导航（当前板块里的全部内容）都由这个文件生成。
   以后新增板块或新增页面，只需要改下面的 SECTIONS 和 PAGE_MAP。
   页面靠 <body data-page="…"> 告诉本文件"我是哪一页"。 */
(function () {
  'use strict';

  /* 板块：key 是内部名字；label 是一级导航上显示的字；home 是点这个板块时进入的默认首页；
     items 是二级导航里的全部内容，按显示顺序排列 */
  var SECTIONS = [
    {
      key: 'shi', label: '时', home: 'jieqi.html',
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
      key: 'shen', label: '神', home: 'shen.html',
      items: [
        { page: 'shen', label: '三界地图', href: 'shen.html' },
        { page: 'shenhua', label: '上古神话', href: 'shenhua.html' },
        { page: 'guji', label: '古籍书架', href: 'guji.html' },
        { page: 'xingxiu', label: '二十八宿', href: 'xingxiu.html' },
        { page: 'shenling', label: '民间神灵', href: 'shenling.html' },
        { page: 'daojiao', label: '道教神谱', href: 'daojiao.html' },
        { page: 'fojiao', label: '佛教体系', href: 'fojiao.html' },
        { page: 'shanhai', label: '山海经异兽', href: 'shanhai.html' }
      ]
    },
    {
      key: 'wu', label: '物', home: 'wu.html',
      items: [
        { page: 'wu', label: '书斋入口', href: 'wu.html' },
        { page: 'wenfang', label: '文房四宝', href: 'wenfang.html' },
        { page: 'wenfang-diangu', label: '典故与演变', href: 'wenfang-diangu.html' },
        { page: 'mugoujia', label: '木构架与榫卯', href: 'mugoujia.html' },
        { page: 'wuding', label: '屋顶与脊兽', href: 'wuding.html' },
        { page: 'minju', label: '院落与民居', href: 'minju.html' },
        { page: 'gongdian', label: '宫殿坛庙与城市', href: 'gongdian.html' },
        { page: 'yuanlin', label: '园林', href: 'yuanlin.html' },
        { page: 'louge', label: '楼阁与匾额对联', href: 'louge.html' },
        { page: 'siguan', label: '寺观塔与桥', href: 'siguan.html' },
        { page: 'shijian', label: '代表建筑时间线', href: 'shijian.html' }
      ]
    }
  ];

  /* 有些页面不在二级导航里单独出现，而是归到某一项下面（补充阅读页），
     这里写明它们"算作"哪一项，用来高亮 */
  var ALIAS = {
    'ganzhi': 'shichen',
    'shengxiao-kepu': 'shengxiao'
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
    nav.appendChild(link(s.home, s.label, current === s, 'is-section'));
  });

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
})();
