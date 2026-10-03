
/* 知否知否 · "文学"板块 · 内容页通用阅读器
   这是"文学"板块所有内容页（诗经到魏晋、唐诗、宋词、元曲、四大名著与明清小说）共用的排版逻辑，
   只写一次，以后每做完一页新内容，只需要写一份新的数据文件（格式参考 data/shijing.js），
   再加一行很短的启动脚本（参考 js/shijing.js），不用重新写页面排版。
   延续入口页"开卷"的调子：左边是窄窄一条书签（这一页内部的几个大类），
   右边是可以往下滚动的正文，点书签会平滑滚动到对应位置，滚动的时候书签也会跟着高亮。
   排版小工具沿用 js/zycommon.js（window.ZY）；视觉样式在 css/wen-read.css。 */
(function () {
  'use strict';
  var Z = window.ZY;
  var el = Z && Z.el;

  /* 有标题的分区块（成书背景、主要人物、主题意义……）统一做成"默认收起、点标题展开"的样式，
     避免一部作品的内容全部展开时篇幅太长；没有标题的块（比如开头的概述段落）不折叠，直接显示。 */
  function wrapCollapsible(heading, contentNode) {
    return el('details', { 'class': 'wr-block wr-collapsible' }, [
      el('summary', { 'class': 'wr-block-h', text: heading }),
      contentNode
    ]);
  }

  function renderBlock(b) {
    switch (b.type) {
      case 'para':
        return el('p', { 'class': 'wr-para', text: b.text });

      case 'facts': {
        var factsNode = el('div', { 'class': 'wr-facts' }, b.items.map(function (it) {
          return el('div', { 'class': 'wr-facts-row' }, [
            el('span', { 'class': 'wr-facts-term', text: it.term }),
            el('span', { 'class': 'wr-facts-note', text: it.note })
          ]);
        }));
        // 要点表后面偶尔也需要补一句说明（跟"works"块同样的处理方式），
        // 要跟表格一起收进同一个折叠块，不能单独露在外面。
        var factsBody = b.tip
          ? el('div', { 'class': 'wr-works-wrap' }, [factsNode, el('p', { 'class': 'wr-block-tip', text: b.tip })])
          : factsNode;
        return b.heading ? wrapCollapsible(b.heading, factsBody) : el('div', { 'class': 'wr-block' }, [factsBody]);
      }

      case 'works': {
        var worksNode = el('ul', { 'class': 'wr-works' }, b.items.map(function (it) {
          return el('li', {}, [el('b', { text: it.name }), el('span', { text: it.note })]);
        }));
        // 有些人物分组（比如"五虎上将""五子良将"）需要在名单下面补一句说明，
        // 这句说明要跟着名单一起收进同一个可展开的折叠块里，不能单独露在外面。
        var worksBody = b.tip
          ? el('div', { 'class': 'wr-works-wrap' }, [worksNode, el('p', { 'class': 'wr-block-tip', text: b.tip })])
          : worksNode;
        return b.heading ? wrapCollapsible(b.heading, worksBody) : el('div', { 'class': 'wr-block' }, [worksBody]);
      }

      case 'quotes': {
        var quotesNode = el('ul', { 'class': 'wr-quotes' }, b.items.map(function (it) {
          return el('li', {}, [
            el('span', { 'class': 'wr-quote-text', text: '"' + it.text + '"' }),
            el('span', { 'class': 'wr-quote-note', text: it.note })
          ]);
        }));
        return b.heading ? wrapCollapsible(b.heading, quotesNode) : el('div', { 'class': 'wr-block' }, [quotesNode]);
      }

      case 'fulltext':
        return el('div', { 'class': 'wr-poem' }, [
          el('div', { 'class': 'wr-poem-title', text: b.title }),
          el('div', { 'class': 'wr-poem-body' }, b.lines.map(function (line) { return el('p', { text: line }); })),
          b.translation ? el('details', { 'class': 'wr-poem-trans' }, [
            el('summary', { text: '看白话翻译' }),
            el('p', { text: b.translation })
          ]) : null,
          b.tip ? el('p', { 'class': 'wr-poem-tip', text: b.tip }) : null
        ]);

      case 'allusions': {
        var allusionsNode = el('ul', { 'class': 'wr-allusions' }, b.items.map(function (it) {
          return el('li', {}, [el('b', { text: it.term }), el('span', { text: it.note })]);
        }));
        return b.heading ? wrapCollapsible(b.heading, allusionsNode) : el('div', { 'class': 'wr-block' }, [allusionsNode]);
      }

      default:
        return null;
    }
  }

  /* 人物关系高亮 + 弹窗：某一段（目前是"三国演义"）如果带了 relations 数据，
     就把正文里出现的这些人物名字自动包一层可点击的高亮标签，点了以后弹出居中的关系卡片。
     这段逻辑写成通用的，以后别的书（比如水浒传）想加同样的功能，只要在数据里加 relations 就行，
     不用再改这个文件。 */
  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightRelationNames(sectionNode, relations) {
    var names = Object.keys(relations || {});
    if (!names.length) return;
    // 名字长的先匹配，避免短名字截断长名字（这里几乎不会撞车，但保险一点）
    names.sort(function (a, b) { return b.length - a.length; });
    var re = new RegExp('(' + names.map(escapeRegExp).join('|') + ')', 'g');

    var walker = document.createTreeWalker(sectionNode, NodeFilter.SHOW_TEXT, null, false);
    var targets = [];
    var node;
    while ((node = walker.nextNode())) {
      re.lastIndex = 0;
      if (node.nodeValue && re.test(node.nodeValue)) targets.push(node);
    }

    targets.forEach(function (textNode) {
      var text = textNode.nodeValue;
      var frag = document.createDocumentFragment();
      var lastIndex = 0;
      var m;
      re.lastIndex = 0;
      while ((m = re.exec(text))) {
        if (m.index > lastIndex) frag.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
        var span = document.createElement('span');
        span.className = 'wr-char-link';
        span.setAttribute('data-char', m[0]);
        span.setAttribute('tabindex', '0');
        span.setAttribute('role', 'button');
        span.textContent = m[0];
        frag.appendChild(span);
        lastIndex = re.lastIndex;
      }
      if (lastIndex < text.length) frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      textNode.parentNode.replaceChild(frag, textNode);
    });
  }

  /* 建一个居中弹窗卡片，整页只建一次，点哪个人物名字就把哪个人物的关系数据填进去显示 */
  function buildRelationModal() {
    var titleEl = el('h3', { 'class': 'wr-char-modal-title' });
    var listEl = el('div', { 'class': 'wr-char-modal-list' });
    var closeBtn = el('button', {
      'class': 'wr-char-modal-close', type: 'button', 'aria-label': '关闭'
    }, [el('span', { 'aria-hidden': 'true', text: '×' })]);
    var card = el('div', { 'class': 'wr-char-modal-card', role: 'dialog', 'aria-modal': 'true' }, [closeBtn, titleEl, listEl]);
    var overlay = el('div', { 'class': 'wr-char-modal-overlay', 'aria-hidden': 'true' }, [card]);
    document.body.appendChild(overlay);

    function close() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
    }
    function open(data) {
      titleEl.textContent = data.label || '';
      while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
      (data.items || []).forEach(function (it) {
        listEl.appendChild(el('div', { 'class': 'wr-facts-row' }, [
          el('span', { 'class': 'wr-facts-term', text: it.term }),
          el('span', { 'class': 'wr-facts-note', text: it.note })
        ]));
      });
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
    }
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    return { open: open, close: close };
  }

  /* 名著页用：每本书只露出标题、图片和第一段“一句话”，其余全部（简介、成书背景、人物、主题……）
     收进一个默认收起的“展开详细介绍”里，点开才看，避免一本书的篇幅太长（由 mount 的 collapseRest 选项打开）。 */
  var collapseRest = false;

  function renderSection(sec, i) {
    var kids = [
      el('div', { 'class': 'wr-seal', 'aria-hidden': 'true' }, [el('span', { text: sec.mark })]),
      el('span', { 'class': 'wr-idx', text: '0' + (i + 1) + ' · ' + sec.label }),
      el('h2', { 'class': 'wr-title', text: sec.title })
    ];
    var rest = [];
    (sec.blocks || []).forEach(function (b, bi) {
      var n = renderBlock(b);
      if (!n) return;
      if (collapseRest && bi > 0) rest.push(n); else kids.push(n);
    });
    if (rest.length) {
      var parts = (sec.blocks || []).filter(function (b) { return b.heading; }).length;
      kids.push(el('details', { 'class': 'wr-more' }, [
        el('summary', { 'class': 'wr-more-sum' }, [
          el('span', { 'class': 'wr-more-open', text: '展开详细介绍（' + parts + ' 个部分）' }),
          el('span', { 'class': 'wr-more-close', text: '收起详细介绍' })
        ]),
        el('div', { 'class': 'wr-more-body' }, rest)
      ]));
    }
    return el('article', { 'class': 'wr-section', id: 'wr-' + sec.key, 'aria-label': sec.title }, kids);
  }

  function navBtn(sec, i, onPick) {
    var btn = el('button', {
      'class': 'wr-nav-btn', type: 'button', 'aria-current': i === 0 ? 'true' : 'false', 'data-key': sec.key
    }, [
      el('span', { 'class': 'wr-nav-dot', 'aria-hidden': 'true' }, [el('span', { text: sec.mark })]),
      el('span', { 'class': 'wr-nav-label', text: sec.label })
    ]);
    btn.addEventListener('click', function () { onPick(sec.key); });
    return btn;
  }

  /* mount(容器id, 数据, {eyebrow, sectionTitle})：eyebrow 是页头小字（比如"文"），
     sectionTitle 是整块正文区的标题（比如"诗经到魏晋"这一页可以传"四段读法"）。 */
  function mount(rootId, D, opts) {
    opts = opts || {};
    collapseRest = !!opts.collapseRest;
    var root = document.getElementById(rootId);
    if (!Z || !root || !D || !D.sections || !D.sections.length) return;

    var navBtns = [];
    var nav = el('nav', { 'class': 'wr-nav', 'aria-label': (D.hook || '') + '目录' },
      D.sections.map(function (sec, i) {
        var b = navBtn(sec, i, jump);
        navBtns.push(b);
        return b;
      })
    );
    var main = el('div', { 'class': 'wr-main' }, D.sections.map(renderSection));
    var wrap = el('div', { 'class': 'wr-wrap' }, [nav, main]);

    function jump(key) {
      var target = document.getElementById('wr-' + key);
      if (target && target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* 页面底部：这一页讲的作品，在“典籍”板块里各有一页书页（原书、版本、选段……）；按页面名对应 */
    /* 划分原则：一本书只放文学或典籍其中一边（名著只在文学）；只有《诗经》是五经之一，两边都有，其链接在 js/wen-poets.js */
    var DJ_LINKS = {};
    var pageKey = document.body.getAttribute('data-page');
    var djBlock = null;
    if (DJ_LINKS[pageKey]) {
      djBlock = Z.section('回到典籍，看原书', [
        el('p', { 'class': 'wr-dj-lead', text: '这一页讲的作品，在“典籍”板块里各有一页书页：作者与成书、版本、代表选段，以及和其他领域的联系。' }),
        el('div', { 'class': 'wr-dj-links' }, DJ_LINKS[pageKey].map(function (b) {
          return el('a', { 'class': 'wr-dj-link', href: 'dianji-book.html?id=' + b[1], text: b[0] + ' →' });
        }).concat([el('a', { 'class': 'wr-dj-link is-all', href: 'dianji.html', text: '回到典籍书架 →' })]))
      ]);
    }

    Z.mount(root, [
      Z.head(D, opts.eyebrow || '文学'),
      Z.section(opts.sectionTitle || '正文', [wrap]),
      djBlock
    ].concat(Z.tipNotes(D)));

    document.title = (D.hook || '') + ' · 知否知否';

    /* 从首页抽卡等地方带着 #wr-书名 过来时，直接滚到那一本（页面内容是脚本生成的，浏览器自己不会跳） */
    (function () {
      var m = /^#wr-([\w-]+)$/.exec(location.hash || '');
      if (!m) return;
      var go = function () {
        var t = document.getElementById('wr-' + m[1]);
        if (t && t.scrollIntoView) t.scrollIntoView({ block: 'start' });
      };
      setTimeout(go, 50);
      window.addEventListener('load', function () { setTimeout(go, 150); });
    })();

    /* 有 relations 数据的段落（目前只有"三国演义"），把人物名字高亮成可点击标签，
       点了以后弹出居中卡片显示这个人物的关系网 */
    var allRelations = {};
    D.sections.forEach(function (sec) {
      if (!sec.relations) return;
      var node = document.getElementById('wr-' + sec.key);
      if (node) highlightRelationNames(node, sec.relations);
      Object.keys(sec.relations).forEach(function (name) { allRelations[name] = sec.relations[name]; });
    });
    if (Object.keys(allRelations).length) {
      var modal = buildRelationModal();
      var openFor = function (target) {
        var link = target.closest ? target.closest('.wr-char-link') : null;
        if (!link) return;
        var data = allRelations[link.getAttribute('data-char')];
        if (data) modal.open(data);
      };
      main.addEventListener('click', function (e) { openFor(e.target); });
      main.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var link = e.target.closest ? e.target.closest('.wr-char-link') : null;
        if (!link) return;
        e.preventDefault();
        openFor(e.target);
      });
    }

    /* 滚动到哪一段，左边书签就跟着亮哪一个；不支持 IntersectionObserver 的旧浏览器就不加这个效果，不影响阅读 */
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var key = en.target.id.replace('wr-', '');
          navBtns.forEach(function (b) {
            b.setAttribute('aria-current', b.getAttribute('data-key') === key ? 'true' : 'false');
          });
        });
      }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
      D.sections.forEach(function (sec) {
        var t = document.getElementById('wr-' + sec.key);
        if (t) io.observe(t);
      });
    }
  }

  window.ZHIFOU_WENREAD = { mount: mount };
})();
