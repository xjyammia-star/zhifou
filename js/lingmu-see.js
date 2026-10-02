/* 知否知否 · 在别的页面底部加一小块“另见 · 陵墓与墓葬”
   只在 yinyue、qingtong、shuhua、liyi、jieri、shenhua、shenling、songci、yuanqu 这九页引入；
   按页面（body 的 data-page）找到要连的墓，页面画好之后补在最下面；找不到就什么也不加，不影响原页面。
   样式由本文件自己注入，颜色跟随各页的字色，所以各板块的主题下都能用。 */
(function () {
  'use strict';
  var page = document.body.getAttribute('data-page') || (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  function d(id, name, note) { return { h: 'lingmu-detail.html?id=' + id, t: name, n: note }; }
  var MAP = {
    yinyue: [d('zenghouyi', '曾侯乙墓', '编钟出土的战国诸侯墓')],
    qingtong: [d('fuhao', '殷墟妇好墓', '商代王室墓，出土大量青铜器和玉器'), d('liangzhu', '良渚反山墓地', '玉琮王出土地'), d('mancheng', '满城汉墓', '金缕玉衣'), d('nanyue', '南越王墓', '丝缕玉衣')],
    shuhua: [d('mawangdui', '马王堆汉墓', 'T 形帛画出土的西汉墓')],
    liyi: [{ h: 'lingmu.html?tab=xisu', t: '陵墓与墓葬 · 习俗与考古', n: '事死如事生、厚葬与薄葬、随葬品、墓志和祭扫' }],
    jieri: [d('konglin', '孔林', '两千多年的家族墓地，清明祭扫'), d('huangdiling', '黄帝陵', '清明公祭轩辕黄帝的陵庙')],
    shenhua: [d('huangdiling', '黄帝陵', '祭祀黄帝的陵庙'), d('dayuling', '大禹陵', '祭祀大禹的陵庙')],
    shenling: [d('konglin', '孔林', '孔子墓所在'), d('yuefei', '岳飞墓', '杭州西湖畔的岳飞墓与岳王庙')],
    songci: [d('yuefei', '岳飞墓', '写《满江红》的岳飞，墓在杭州西湖畔')],
    yuanqu: [d('zhaojun', '昭君墓（青冢）', '《汉宫秋》写的王昭君，墓在呼和浩特')]
  };
  var list = MAP[page];
  if (!list) return;

  var css = '.lm-see{margin:36px 0 8px;padding:14px 18px;border:1px dashed rgba(140,130,110,.6);font-size:14px;line-height:1.95;max-width:1100px}' +
    '.lm-see b{font-weight:600;letter-spacing:.2em;font-size:13px;margin-right:.6em}' +
    '.lm-see a{color:inherit;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(140,130,110,.8)}' +
    '.lm-see a:hover{text-decoration-thickness:2px}.lm-see li{margin:2px 0}.lm-see ul{list-style:none;margin:6px 0 0;padding:0}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function build() {
    var box = document.createElement('aside');
    box.className = 'lm-see';
    box.setAttribute('aria-label', '另见陵墓与墓葬');
    var h = document.createElement('div');
    var b = document.createElement('b'); b.textContent = '另见';
    h.appendChild(b); h.appendChild(document.createTextNode('建筑板块 · 陵墓与墓葬里的相关内容'));
    box.appendChild(h);
    var ul = document.createElement('ul');
    list.forEach(function (k) {
      var li = document.createElement('li');
      var a = document.createElement('a'); a.href = k.h; a.textContent = k.t;
      li.appendChild(a); li.appendChild(document.createTextNode('：' + k.n));
      ul.appendChild(li);
    });
    box.appendChild(ul);
    return box;
  }

  var tries = 0;
  (function place() {
    var app = document.getElementById('app') || document.querySelector('main');
    var host = app && (app.firstElementChild && app.firstElementChild.tagName !== 'NOSCRIPT' ? app.firstElementChild : null);
    if (!host) { if (++tries < 24) setTimeout(place, 250); return; }
    if (host.querySelector('.lm-see')) return;
    host.appendChild(build());
  })();
})();
