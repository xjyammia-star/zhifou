
/* 知否知否 · "文"入口页脚本（开卷两页式）
   跟其它板块入口不一样：这里做成一本摊开的书——
   左边是窄窄一条目录（五个时代竖排的书脊，一直都看得见），
   右边是一大块摊开的书页，点目录里哪个时代，右边这一整页就换成对应内容，
   中间有一道书脊阴影，翻页时右边内容会有一个轻微的"翻页"过渡。
   本轮更新：书页里加了展开介绍（detail）和代表作/代表人物（picks），
   并在右上角加了一枚印章装饰（用的还是数据里原来就有的 mark 字），
   给页面多一点内容和一点"书卷气"。
   数据来自 data/wen-index.js（window.ZHIFOU_WEN_INDEX）；排版小工具沿用 js/zycommon.js（window.ZY）。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_WEN_INDEX, Z = window.ZY;
  var root = document.getElementById('app');
  if (!D || !Z || !root) return;
  var el = Z.el;

  function tocItem(it, i, onPick) {
    var btn = el('button', {
      'class': 'wen-toc-btn', type: 'button', 'aria-current': 'false', 'data-idx': String(i)
    }, [
      el('span', { 'class': 'wen-toc-dot', 'aria-hidden': 'true' }, [
        el('span', { 'class': 'wen-toc-mark', text: it.mark })
      ]),
      el('span', { 'class': 'wen-toc-label' }, [
        el('span', { 'class': 'wen-toc-era', text: it.era }),
        el('span', { 'class': 'wen-toc-name', text: it.name })
      ]),
      it.open ? null : el('span', { 'class': 'wen-toc-soon', 'aria-hidden': 'true', text: '制' })
    ]);
    btn.addEventListener('click', function () { onPick(i); });
    return el('li', { 'class': 'wen-toc-item' }, [btn]);
  }

  function pickItem(text) {
    return el('li', { 'class': 'wen-page-pick' }, [
      el('span', { 'class': 'wen-pick-mark', 'aria-hidden': 'true', text: '○' }),
      el('span', { 'class': 'wen-pick-text', text: text })
    ]);
  }

  function pageContent(it, i) {
    var kids = [
      el('div', { 'class': 'wen-page-seal', 'aria-hidden': 'true' }, [
        el('span', { text: it.mark })
      ]),
      el('span', { 'class': 'wen-page-idx', text: '0' + (i + 1) + ' · ' + it.era }),
      el('h3', { 'class': 'wen-page-name', text: it.name }),
      el('p', { 'class': 'wen-page-line', text: it.line }),
      it.detail ? el('p', { 'class': 'wen-page-detail', text: it.detail }) : null,
      it.picks && it.picks.length
        ? el('ul', { 'class': 'wen-page-picks' }, it.picks.map(pickItem))
        : null,
      it.stat ? el('p', { 'class': 'wen-page-stat', text: it.stat }) : null,
      el('p', { 'class': 'wen-page-tags', text: it.tags.join(' · ') }),
      it.open
        ? el('a', { 'class': 'wen-page-cta', href: it.href, text: '进去看看这一段 →' })
        : el('span', { 'class': 'wen-page-soon', text: '这一段正在制作中，先看个预告' })
    ];
    return kids;
  }

  function bookBlock() {
    var current = -1;
    var pageWrap = el('div', { 'class': 'wen-page-wrap', 'aria-live': 'polite' });
    var page = el('div', { 'class': 'wen-page' });
    pageWrap.appendChild(page);

    var items = [];
    function show(i, skipAnim) {
      if (i === current) return;
      current = i;
      items.forEach(function (b, j) {
        b.setAttribute('aria-current', j === i ? 'true' : 'false');
      });
      function fill() {
        page.textContent = '';
        pageContent(D.eras[i], i).forEach(function (n) { page.appendChild(n); });
      }
      if (skipAnim) { fill(); return; }
      pageWrap.classList.add('is-flipping');
      setTimeout(function () {
        fill();
        pageWrap.classList.remove('is-flipping');
      }, 160);
    }

    var toc = el('ol', { 'class': 'wen-toc-list' }, D.eras.map(function (it, i) {
      var li = tocItem(it, i, function (idx) { show(idx); });
      items.push(li.querySelector('.wen-toc-btn'));
      return li;
    }));

    show(0, true);

    return el('div', { 'class': 'wen-book' }, [
      el('nav', { 'class': 'wen-toc', 'aria-label': '五段文脉目录' }, [toc]),
      el('div', { 'class': 'wen-book-spine', 'aria-hidden': 'true' }),
      pageWrap
    ]);
  }

  Z.mount(root, [
    Z.head(D, '文学'),
    Z.section('五段文脉', [bookBlock()])
  ].concat(Z.tipNotes(D)));
  document.title = '文学 · 知否知否';
})();
