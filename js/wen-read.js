
/* 知否知否 · "文"板块 · 内容页通用阅读器
   这是"文"板块所有内容页（诗经到魏晋、唐诗、宋词、元曲、四大名著与明清小说）共用的排版逻辑，
   只写一次，以后每做完一页新内容，只需要写一份新的数据文件（格式参考 data/shijing.js），
   再加一行很短的启动脚本（参考 js/shijing.js），不用重新写页面排版。
   延续入口页"开卷"的调子：左边是窄窄一条书签（这一页内部的几个大类），
   右边是可以往下滚动的正文，点书签会平滑滚动到对应位置，滚动的时候书签也会跟着高亮。
   排版小工具沿用 js/zycommon.js（window.ZY）；视觉样式在 css/wen-read.css。 */
(function () {
  'use strict';
  var Z = window.ZY;
  var el = Z && Z.el;

  function renderBlock(b) {
    switch (b.type) {
      case 'para':
        return el('p', { 'class': 'wr-para', text: b.text });

      case 'facts':
        return el('div', { 'class': 'wr-block' }, [
          b.heading ? el('div', { 'class': 'wr-block-h', text: b.heading }) : null,
          el('div', { 'class': 'wr-facts' }, b.items.map(function (it) {
            return el('div', { 'class': 'wr-facts-row' }, [
              el('span', { 'class': 'wr-facts-term', text: it.term }),
              el('span', { 'class': 'wr-facts-note', text: it.note })
            ]);
          }))
        ]);

      case 'works':
        return el('div', { 'class': 'wr-block' }, [
          b.heading ? el('div', { 'class': 'wr-block-h', text: b.heading }) : null,
          el('ul', { 'class': 'wr-works' }, b.items.map(function (it) {
            return el('li', {}, [el('b', { text: it.name }), el('span', { text: it.note })]);
          }))
        ]);

      case 'quotes':
        return el('div', { 'class': 'wr-block' }, [
          b.heading ? el('div', { 'class': 'wr-block-h', text: b.heading }) : null,
          el('ul', { 'class': 'wr-quotes' }, b.items.map(function (it) {
            return el('li', {}, [
              el('span', { 'class': 'wr-quote-text', text: '"' + it.text + '"' }),
              el('span', { 'class': 'wr-quote-note', text: it.note })
            ]);
          }))
        ]);

      case 'fulltext':
        return el('div', { 'class': 'wr-poem' }, [
          el('div', { 'class': 'wr-poem-title', text: b.title }),
          el('div', { 'class': 'wr-poem-body' }, b.lines.map(function (line) { return el('p', { text: line }); })),
          b.tip ? el('p', { 'class': 'wr-poem-tip', text: b.tip }) : null
        ]);

      case 'allusions':
        return el('div', { 'class': 'wr-block' }, [
          b.heading ? el('div', { 'class': 'wr-block-h', text: b.heading }) : null,
          el('ul', { 'class': 'wr-allusions' }, b.items.map(function (it) {
            return el('li', {}, [el('b', { text: it.term }), el('span', { text: it.note })]);
          }))
        ]);

      default:
        return null;
    }
  }

  function renderSection(sec, i) {
    var kids = [
      el('div', { 'class': 'wr-seal', 'aria-hidden': 'true' }, [el('span', { text: sec.mark })]),
      el('span', { 'class': 'wr-idx', text: '0' + (i + 1) + ' · ' + sec.label }),
      el('h2', { 'class': 'wr-title', text: sec.title })
    ];
    (sec.blocks || []).forEach(function (b) {
      var n = renderBlock(b);
      if (n) kids.push(n);
    });
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

    Z.mount(root, [
      Z.head(D, opts.eyebrow || '文'),
      Z.section(opts.sectionTitle || '正文', [wrap])
    ].concat(Z.tipNotes(D)));

    document.title = (D.hook || '') + ' · 知否知否';

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
