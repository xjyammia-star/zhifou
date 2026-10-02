/* 知否知否 · “典籍”书架页（dianji.html 和六个朝代页）
   数据：data/dianji-index.js（由 工具脚本\生成典籍数据.py 生成）。
   总书架（dianji.html）：先选类别（全部 + 十类），类别标题后附简介和收录数，下方整宽横幅图和书卡。
   朝代页（dianji-xianqin.html 等，页面 body 上写着 data-dyn="先秦"）：只列这个朝代的书，同样可以按类别筛选，类别标题不放图片。
   顶部有搜索（书名、作者、简介关键词），在当前页的范围内找。点书卡进入 dianji-book.html?id=书的代号。 */
(function () {
  'use strict';
  var Z = window.ZY, D = window.ZF_DJ_INDEX, el = Z && Z.el;
  var root = document.getElementById('app');
  if (!Z || !D || !root) return;

  var dyn = document.body.getAttribute('data-dyn') || '';   /* 空 = 总书架 */
  var cards = [];          /* 所有书卡节点，搜索时统一显隐 */
  var secs = [];           /* 所有分区（类别），整区没有书时隐藏 */

  var DYN_INTRO = {
    '先秦': ['诸子百家、五经和最早的史书、兵书、神话，都在这一时期成形。', '先秦（夏商周至战国）是中国典籍的源头。孔子、老子、孟子、庄子、荀子、墨子、韩非子的著作，《诗经》《尚书》《周易》等经书，《左传》《国语》等早期史书，《孙子兵法》和《山海经》，都出自这个时期，或有源头在这个时期。注意，不少书是几百年里逐步编成的，下面每本书的页面会讲清楚。'],
    '秦汉': ['先秦文献在这个时期被整理、注释、定本，史学、医学、算学也开始成型。', '秦汉（秦、西汉、东汉）一方面整理前代文献，如刘向校书、郑玄注经；另一方面产生了新的大著作，如《史记》《汉书》《淮南子》《论衡》《说文解字》，以及《黄帝内经》《伤寒论》《九章算术》等医学和算学经典。'],
    '魏晋南北朝': ['玄学、道教、佛教兴起，志怪、文论、农书和地理书在这一时期出现。', '魏晋南北朝战乱频繁，思想却很活跃。这一时期有《文心雕龙》《文选》这样的文学批评与总集，有《世说新语》《搜神记》这样的志怪和轶事小说，有《齐民要术》这样的农书，也有《三国志》《后汉书》《水经注》等史地著作。'],
    '隋唐五代': ['科举与诗歌的黄金时代，医药、笔记和家训也留下了重要著作。', '隋唐五代的典籍以诗歌、史学注疏、医书和笔记小说为主。孙思邈的《备急千金要方》、段成式的《酉阳杂俎》、颜之推的《颜氏家训》，以及李白、杜甫的诗集，都在这一时期或以这一时期为主。'],
    '宋辽金元': ['印刷术普及，大型类书、史书和理学著作大量出现。', '宋辽金元时期，雕版印刷普及，书籍的编纂与流传都明显加快。《资治通鉴》《太平御览》《梦溪笔谈》《近思录》，以及《三字经》《百家姓》等蒙学读物，《西厢记》等元杂剧，都属于这个时期。'],
    '明清': ['集大成的时代：大型丛书、医药与工艺巨著，以及长篇小说和戏曲。', '明清两代既有《永乐大典》《四库全书》《康熙字典》这样的大型编纂，也有《本草纲目》《天工开物》这样的医药和工艺巨著；同时是长篇小说和戏曲的高峰，四大名著、《聊斋志异》《牡丹亭》都出自这一时期。']
  };

  function bookCard(b) {
    var a = el('a', { 'class': 'dj-card', href: 'dianji-book.html?id=' + encodeURIComponent(b.id) }, [
      el('span', { 'class': 'dj-card-title', text: b.title }),
      el('span', { 'class': 'dj-card-meta', text: b.auth }),
      el('p', { 'class': 'dj-card-line', text: b.line })
    ]);
    a.setAttribute('data-q', (b.title + b.auth + b.line).replace(/[\s《》“”，。、；：]/g, '').toLowerCase());
    cards.push(a);
    return a;
  }

  /* 本页要显示的类别：总书架显示十类；朝代页只显示这个朝代有书的类别，并只保留这个朝代的书 */
  var cats = D.cats.map(function (c) {
    if (!dyn) return c;
    return { name: c.name, img: c.img, blurb: c.blurb, open: c.open, books: c.books.filter(function (b) { return b.dyn === dyn; }) };
  }).filter(function (c) { return !dyn || c.books.length; });

  var total = 0;
  cats.forEach(function (c) { total += c.books.length; });

  /* 类别标题：名字稍大，旁边小字写简介和收录数；总书架在下面再放一张整宽横幅图（登记表里有就显示） */
  function catHead(c) {
    var info = !dyn && window.ZIMG && window.ZIMG.get ? window.ZIMG.get('diji', c.img) : null;
    var text = el('div', { 'class': 'dj-cat-title' }, [
      el('h2', { 'class': 'dj-cat-name', text: c.name }),
      el('span', { 'class': 'dj-cat-sub', text: c.blurb + (c.books.length ? ' 已收录 ' + c.books.length + ' 本' : ' 整理中') })
    ]);
    if (!info) return el('div', { 'class': 'dj-cat-head is-noimg' }, [text]);
    var img = el('img', { src: info.src, srcset: info.srcset, sizes: '(max-width: 720px) 94vw, 1100px', alt: c.name, loading: 'lazy', decoding: 'async' });
    var fig = el('figure', { 'class': 'dj-cat-img' }, [img, info.ai ? el('figcaption', { text: info.aiLabel || 'AI 生成插画' }) : null]);
    return el('div', { 'class': 'dj-cat-head' }, [text, fig]);
  }

  var tv = el('div', { 'class': 'dj-view' });
  cats.forEach(function (c) {
    var kids = [catHead(c)];
    if (c.books.length) kids.push(el('div', { 'class': 'dj-grid' }, c.books.map(function (b) { return bookCard(b); })));
    else kids.push(el('p', { 'class': 'dj-soon', text: '这一类还在整理，整理好会陆续上架。' }));
    var s = el('section', { 'class': 'dj-cat', 'aria-label': c.name }, kids);
    s.setAttribute('data-has', c.books.length ? '1' : '0');
    s.setAttribute('data-cat', c.name);
    secs.push(s);
    tv.appendChild(s);
  });

  var input = el('input', { type: 'text', autocomplete: 'off', placeholder: '搜索书名、作者或关键词（如：论语、孔子、仁）', 'aria-label': '搜索典籍' });
  var clear = el('button', { 'class': 'dj-search-clear', type: 'button', 'aria-label': '清空搜索', hidden: 'hidden', text: '×' });
  var count = el('span', { 'class': 'dj-count', text: '已上架 ' + total + ' 本' });
  var empty = el('p', { 'class': 'dj-empty', hidden: 'hidden', text: '没有找到相关的书。换个字或词试试。' });

  /* 类别选择条：全部 + 各类别。点一个类别，只显示这一类；再点“全部”回到整页 */
  var selCat = '';
  var chips = [];
  function chip(name, label, soon) {
    var b = el('button', { 'class': 'dj-chip' + (soon ? ' is-soon' : ''), type: 'button', 'aria-pressed': 'false' }, [
      el('span', { text: label }),
      soon ? el('small', { text: '整理中' }) : null
    ]);
    b.addEventListener('click', function () { selectCat(name); });
    b.setAttribute('data-name', name);
    chips.push(b);
    return b;
  }
  function selectCat(name) {
    selCat = name;
    chips.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-name') === name ? 'true' : 'false'); });
    filter();
  }
  var catRow = el('div', { 'class': 'dj-cats-row' }, [chip('', '全部', false)].concat(cats.map(function (c) {
    return chip(c.name, c.name, !c.books.length);
  })));
  var catBar = el('div', { 'class': 'dj-cats' }, [el('p', { 'class': 'dj-cats-label', text: '先选类别' }), catRow]);
  chips[0].setAttribute('aria-pressed', 'true');

  /* 搜索：去掉空格和标点后，书名/作者/简介里包含输入内容就显示；没输入时全部显示 */
  function filter() {
    var q = input.value.replace(/[\s《》“”，。、；：]/g, '').toLowerCase();
    clear.hidden = !input.value;
    var shown = 0;
    cards.forEach(function (c) {
      var ok = !q || c.getAttribute('data-q').indexOf(q) >= 0;
      c.hidden = !ok;
    });
    secs.forEach(function (s) {
      var has = s.getAttribute('data-has') === '1';
      var cat = s.getAttribute('data-cat');
      /* 选了类别：别的类别整区收起 */
      if (selCat && cat !== selCat) { s.hidden = true; return; }
      if (!q) { s.hidden = false; return; }
      /* 搜索时，没有命中的分区（包括“整理中”的类）先收起 */
      var any = has && Array.prototype.some.call(s.querySelectorAll('.dj-card'), function (c) { return !c.hidden; });
      s.hidden = !any;
    });
    Array.prototype.forEach.call(tv.querySelectorAll('.dj-card'), function (c) {
      if (!c.hidden && !c.closest('section').hidden) shown++;
    });
    var catN = 0;
    if (selCat) cats.forEach(function (c) { if (c.name === selCat) catN = c.books.length; });
    empty.hidden = !(q && shown === 0);
    count.textContent = q ? '找到 ' + shown + ' 本' : (selCat ? (catN ? '本类已上架 ' + catN + ' 本' : '本类整理中') : '已上架 ' + total + ' 本');
  }
  input.addEventListener('input', filter);
  clear.addEventListener('click', function () { input.value = ''; filter(); input.focus(); });

  var headOpts = dyn
    ? { hook: dyn + '典籍', answer: DYN_INTRO[dyn] ? DYN_INTRO[dyn][0] : '', intro: (DYN_INTRO[dyn] ? DYN_INTRO[dyn][1] : '') + ' 可以先点上面的类别，再挑书。' }
    : {
        hook: '典籍',
        answer: '一本书一页：谁写的、什么时候成书、讲什么、为什么重要、该读哪个版本。',
        intro: '这里把中国传统典籍按类型分成十类。每本书一页，先讲清它是什么书，再摘几段有代表性的原文并加注解；不放全文，只指路，告诉你去哪里读。先点上面的类别，再挑书；也可以从上面的导航按朝代进入。'
      };
  var head = Z.head(headOpts, '典籍');

  /* 朝代页的整宽横幅图：登记键 diji/dyn_xianqin 等（图片登记表里有就显示，没有就不显示，页面照常） */
  var DYN_KEY = { '先秦': 'dyn_xianqin', '秦汉': 'dyn_qinhan', '魏晋南北朝': 'dyn_weijin', '隋唐五代': 'dyn_suitang', '宋辽金元': 'dyn_songyuan', '明清': 'dyn_mingqing' };
  var banner = null;
  if (dyn && window.ZIMG && window.ZIMG.get) {
    var binfo = window.ZIMG.get('diji', DYN_KEY[dyn]);
    if (binfo) {
      var bimg = el('img', { src: binfo.src, srcset: binfo.srcset, sizes: '(max-width: 720px) 94vw, 1100px', alt: dyn + '典籍', decoding: 'async' });
      banner = el('figure', { 'class': 'dj-cat-img dj-dyn-banner' }, [bimg, binfo.ai ? el('figcaption', { text: binfo.aiLabel || 'AI 生成插画' }) : null]);
    }
  }

  var tools = el('div', { 'class': 'dj-tools' }, [
    el('div', { 'class': 'dj-search', role: 'search' }, [input, clear]),
    count
  ]);

  Z.mount(root, [head, banner, catBar, tools, tv, empty]);
  document.title = (dyn ? dyn + '典籍' : '典籍') + ' · 知否知否';
})();
