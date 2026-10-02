/* 知否知否 · “典籍”书页（dianji-book.html?id=书的代号）
   数据：先读书架索引 data/dianji-index.js（找到这本书、上一本、下一本），再按需加载这本书自己的 data/dj/<代号>.js。
   版面：基本信息 → 内容概要 / 为什么重要（默认展开）→ 代表性选段（点开看原文、注解、讲解）→
        名句典故、文化联系、常见误区、延伸阅读、资料来源、存疑之处（默认收起）。 */
(function () {
  'use strict';
  var Z = window.ZY, IDX = window.ZF_DJ_INDEX, el = Z && Z.el;
  var root = document.getElementById('app');
  if (!Z || !IDX || !root) return;

  var BOARDS = { '时令': 'jieqi.html', '神灵': 'shen.html', '建筑': 'jianzhu.html', '器物': 'wu.html', '字语': 'ziyu.html', '礼思': 'lisi.html', '艺术': 'yi.html', '文学': 'wen.html' };

  /* 文学板块里对应的专页：书的代号 → [页面名, 地址] */
  var WEN_PAGES = {
    'shijing': ['诗经', 'shijingpian.html'], 'chuci': ['楚辞', 'chuci.html'],
    'yuefushiji': ['汉乐府与魏晋诗', 'hanweishi.html'], 'gushi-shijiushou': ['汉乐府与魏晋诗', 'hanweishi.html'],
    'taoyuanming-ji': ['汉乐府与魏晋诗', 'hanweishi.html'], 'wenxuan': ['汉乐府与魏晋诗', 'hanweishi.html'],
    'li-du-ji': ['唐诗', 'tangshi.html'], 'tangshi-sanbaishou': ['唐诗', 'tangshi.html'],
    'sushi-ji': ['宋词', 'songci.html'], 'songci-sanbaishou': ['宋词', 'songci.html'],
    'xixiangji': ['元曲', 'yuanqu.html'], 'yuanquxuan': ['元曲', 'yuanqu.html'],
    'xiyouji': ['名著', 'mingqing.html'], 'sanguoyanyi': ['名著', 'mingqing.html'], 'shuihuzhuan': ['名著', 'mingqing.html'],
    'hongloumeng': ['名著', 'mingqing.html'], 'fengshenyanyi': ['名著', 'mingqing.html']
  };

  var id = null;
  try { id = new URLSearchParams(location.search).get('id'); } catch (e) { /* 忽略 */ }

  /* 在索引里找这本书（只认索引里有的代号，防止乱加载文件） */
  var cat = null, pos = -1;
  IDX.cats.forEach(function (c) {
    c.books.forEach(function (b, i) { if (b.id === id) { cat = c; pos = i; } });
  });

  function notFound() {
    Z.mount(root, [
      Z.head({ hook: '典籍', answer: '没有找到这本书。', intro: '这本书可能还在整理，或网址有误。回到书架看看吧。' }, '典籍'),
      el('p', { 'class': 'dj-back' }, [el('a', { href: 'dianji.html', text: '← 回到典籍书架' })])
    ]);
    document.title = '典籍 · 知否知否';
  }
  if (!cat) { notFound(); return; }

  /* 文字里的网址变成可点的链接（新窗口打开） */
  function addText(node, text) {
    String(text).split(/(https?:\/\/[^\s，。；）)]+)/).forEach(function (part) {
      if (/^https?:\/\//.test(part)) node.appendChild(el('a', { href: part, target: '_blank', rel: 'noopener noreferrer', text: part }));
      else if (part) node.appendChild(document.createTextNode(part));
    });
    return node;
  }
  function p(text) { return addText(el('p', { 'class': 'dj-p' }), text); }

  /* 一段话 / 多条：只有一条就当段落，多条做成列表 */
  function prose(arr) {
    if (!arr || !arr.length) return null;
    if (arr.length === 1) return p(arr[0]);
    return el('ul', { 'class': 'dj-list' }, arr.map(function (t) { return addText(el('li'), t); }));
  }

  /* 列表条目：“头：说明”里的头加粗；头若是站内板块名（礼思、文学……），做成指向那个板块的链接 */
  function headList(arr, linkBoards) {
    return el('ul', { 'class': 'dj-list' }, (arr || []).map(function (t) {
      var li = el('li');
      var m = /^([^：]{1,30})：([\s\S]*)$/.exec(t);
      if (!m) return addText(li, t);
      var head = m[1];
      var b = el('b');
      if (linkBoards && BOARDS[head]) b.appendChild(el('a', { href: BOARDS[head], text: head }));
      else b.textContent = head;
      li.appendChild(b);
      li.appendChild(document.createTextNode('：'));
      addText(li, m[2]);
      return li;
    }));
  }

  /* 可折叠的一节 */
  function sec(title, open, count, kids) {
    var body = el('div', { 'class': 'dj-sec-body' }, kids);
    var d = el('details', { 'class': 'dj-sec' }, [
      el('summary', {}, [title, count ? el('span', { 'class': 'dj-sec-n', text: count }) : null]),
      body
    ]);
    if (open) d.open = true;
    return d;
  }

  /* ---------- 与神灵的联系（原“古籍书架”里的内容，数据在 data/dj-shen.js） ---------- */
  var SHEN_PAGES = { '山海经异兽': 'shanhai.html', '上古神话': 'shenhua.html' };
  function shenSection(sh, meta) {
    var kids = [];
    kids.push(el('p', { 'class': 'dj-note', text: meta.answer }));
    var facts = [];
    facts.push(['神话书架的分类', sh.cat + (meta.cats && meta.cats[sh.cat] ? '：' + meta.cats[sh.cat] : '')]);
    if (sh.core) facts.push(['核心五部之一', sh.core]);
    facts.push(['成书年代', sh.year]);
    facts.push(['作者、编者或署名', sh.author]);
    facts.push(['代表篇目', sh.chapters]);
    if (sh.common) facts.push(['常见内容', sh.common]);
    kids.push(el('dl', { 'class': 'dj-facts' }, facts.map(function (r) {
      return el('div', { 'class': 'dj-facts-row' }, [el('dt', { text: r[0] }), el('dd', { text: r[1] })]);
    })));
    kids.push(p(sh.intro));
    if (sh.tip) kids.push(el('div', { 'class': 'dj-shen-tip' }, [el('b', { text: '读的时候注意　' }), document.createTextNode(sh.tip)]));

    if (sh.people && sh.people.length) {
      kids.push(el('p', { 'class': 'dj-shen-label', text: '在上古神话里，这些人物的故事见于这本书' }));
      kids.push(el('div', { 'class': 'dj-shen-chips' }, sh.people.map(function (n) {
        return el('a', { 'class': 'dj-sh-chip', href: 'shenhua.html?id=' + encodeURIComponent(n), text: n });
      })));
    }
    if (sh.see && sh.see.length) {
      kids.push(el('p', { 'class': 'dj-shen-label', text: '另见' }));
      kids.push(el('div', { 'class': 'dj-shen-chips' }, sh.see.map(function (s) {
        var href = SHEN_PAGES[s.page];
        var label = s.page + (s.id ? ' · ' + s.id : '');
        return href ? el('a', { 'class': 'dj-sh-chip', href: href + (s.id ? '?id=' + encodeURIComponent(s.id) : ''), text: label + ' →' })
                    : el('span', { 'class': 'dj-sh-chip is-soon', text: label + ' · 页面制作中' });
      })));
    }
    if (sh.purposes && sh.purposes.length) {
      kids.push(el('p', { 'class': 'dj-shen-label', text: '想读什么，先翻哪本' }));
      kids.push(el('ul', { 'class': 'dj-shen-purposes' }, sh.purposes.map(function (pp) {
        return el('li', {}, [
          el('span', { 'class': 'dj-shen-want', text: pp.want }),
          el('span', { 'class': 'dj-shen-books' }, pp.books.map(function (b) {
            return b.id && b.id !== id ? el('a', { 'class': 'dj-sh-chip', href: 'dianji-book.html?id=' + encodeURIComponent(b.id), text: '《' + b.name + '》' })
                                       : el('span', { 'class': 'dj-sh-chip is-here', text: '《' + b.name + '》' });
          }))
        ]);
      })));
    }
    kids.push(el('p', { 'class': 'dj-note', text: meta.eraNote }));
    kids.push(el('p', { 'class': 'dj-note', text: meta.tip }));
    kids.push(el('p', { 'class': 'dj-note' }, [el('a', { href: 'shenhua.html', text: '去看“上古神话”人物图谱 →' })]));
    return sec('与神灵的联系 · 在上古神话书架中', false, '', kids);
  }

  function render(d, shAll) {
    var kids = [];
    kids.push(Z.head({ hook: d.title, answer: d.line }, '典籍 · ' + cat.name));

    /* 基本信息：分类一项与面包屑重复，不再显示 */
    var rows = (d.info || []).filter(function (r) { return r[0] && r[0] !== '分类'; });
    if (rows.length) {
      kids.push(el('dl', { 'class': 'dj-facts' }, rows.map(function (r) {
        return el('div', { 'class': 'dj-facts-row' }, [el('dt', { text: r[0] }), addText(el('dd'), r[1])]);
      })));
    }

    /* 文学板块里有专页讲这本书（或这一类作品）的，给一个链接 */
    var wl = WEN_PAGES[id];
    if (wl) {
      kids.push(el('p', { 'class': 'dj-wen-link' }, [
        document.createTextNode('文学板块里有专页：'),
        el('a', { href: wl[1], text: wl[0] + ' →' })
      ]));
    }

    if (d.summary && d.summary.length) kids.push(sec('内容概要', true, '', [prose(d.summary)]));
    if (d.why && d.why.length) kids.push(sec('为什么重要', true, '', [prose(d.why)]));

    if (d.selections && d.selections.length) {
      var sels = el('div', { 'class': 'dj-sels' }, d.selections.map(function (s, i) {
        var body = el('div', { 'class': 'dj-sel-body' }, [
          s.o ? el('blockquote', { 'class': 'dj-orig', text: s.o }) : null,
          s.g ? addText(el('p', {}, [el('b', { text: '注解' })]), s.g) : null,
          s.e ? addText(el('p', {}, [el('b', { text: '讲解' })]), s.e) : null
        ]);
        return el('details', { 'class': 'dj-sel' }, [
          el('summary', {}, [
            el('span', { 'class': 'dj-sel-no', text: '选段 ' + (i + 1) }),
            el('span', { 'class': 'dj-sel-t', text: s.t }),
            s.o ? el('span', { 'class': 'dj-sel-hint', text: s.o }) : null
          ]),
          body
        ]);
      }));
      kids.push(sec('代表性选段', true, d.selections.length + ' 段', [
        el('p', { 'class': 'dj-note', text: '这里只摘几段有代表性的原文，不是全文；注解和讲解为本站整理，欢迎指正。' }), sels
      ]));
    }

    if (d.quotes && d.quotes.length) kids.push(sec('名句、典故与成语', false, d.quotes.length + ' 条', [headList(d.quotes, false)]));
    if (d.dispute && d.dispute.length) kids.push(sec('作者与成书争议', false, '', [prose(d.dispute)]));
    if (d.versions && d.versions.length) kids.push(sec('版本与注本', false, '', [prose(d.versions)]));
    if (d.links && d.links.length) kids.push(sec('与中国文化其他领域的联系', false, d.links.length + ' 条', [headList(d.links, true)]));
    if (shAll && shAll.books && shAll.books[id]) {
      var shenSec = shenSection(shAll.books[id], shAll._meta);
      if (location.hash === '#shen') shenSec.open = true;
      kids.push(shenSec);
    }
    if (d.myths && d.myths.length) kids.push(sec('常见误区', false, d.myths.length + ' 条', [headList(d.myths, false)]));
    if (d.reading && d.reading.length) kids.push(sec('全文与延伸阅读', false, '', [headList(d.reading, false)]));
    if (d.sources && d.sources.length) kids.push(sec('资料来源', false, d.sources.length + ' 条', [
      el('p', { 'class': 'dj-note', text: '每条末尾的“可信度”是整理时对该资料的自评，供参考。' }), headList(d.sources, false)
    ]));
    if (d.doubts && d.doubts.length) kids.push(sec('存疑之处', false, d.doubts.length + ' 条', [headList(d.doubts, false)]));

    /* 同一类里的上一本、下一本 */
    var prev = pos > 0 ? cat.books[pos - 1] : null, next = pos < cat.books.length - 1 ? cat.books[pos + 1] : null;
    if (prev || next) {
      kids.push(el('div', { 'class': 'dj-pn' }, [
        prev ? el('a', { href: 'dianji-book.html?id=' + encodeURIComponent(prev.id) }, [el('small', { text: '上一本' }), prev.title]) : el('span'),
        next ? el('a', { 'class': 'is-next', href: 'dianji-book.html?id=' + encodeURIComponent(next.id) }, [el('small', { text: '下一本' }), next.title]) : el('span')
      ]));
    }
    kids.push(el('p', { 'class': 'dj-back' }, [el('a', { href: 'dianji.html', text: '← 回到典籍书架' })]));

    Z.mount(root, kids);
    document.title = d.title.replace(/[《》]/g, '') + ' · 典籍 · 知否知否';
  }

  /* 加载这本书的数据文件 */
  var s = document.createElement('script');
  s.src = 'data/dj/' + id + '.js';
  s.onload = function () {
    var d = window.ZF_DJ && window.ZF_DJ[id];
    if (!d) { notFound(); return; }
    /* 再读“与神灵的联系”的数据（只有神话相关的十几本书有；读不到也不影响书页） */
    var s2 = document.createElement('script');
    s2.src = 'data/dj-shen.js';
    s2.onload = function () { render(d, window.ZF_DJ_SHEN); if (location.hash === '#shen') jumpToShen(); };
    s2.onerror = function () { render(d, null); };
    document.head.appendChild(s2);
  };
  function jumpToShen() {
    var secs = document.querySelectorAll('details.dj-sec');
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].textContent.indexOf('与神灵的联系') === 0 && secs[i].scrollIntoView) { secs[i].scrollIntoView({ block: 'start' }); break; }
    }
  }
  s.onerror = notFound;
  document.head.appendChild(s);
})();
