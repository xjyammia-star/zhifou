
/* 知否知否 · "文"入口页脚本（文脉时间线）
   跟其它板块入口不一样：这里不用"字·语/礼与思/艺"共用的那种并排卡片（zy-shelf/zy-book），
   而是竖着画一条时间线，五个时代从上到下按顺序挂在线上，默认只露出圆点和名字（"书脊"）；
   鼠标移上去、键盘 Tab 过去、或者点一下，会像翻开一本书那样在右侧展开这一段的说明。
   数据来自 data/wen-index.js（window.ZHIFOU_WEN_INDEX）；排版小工具沿用 js/zycommon.js（window.ZY）。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_WEN_INDEX, Z = window.ZY;
  var root = document.getElementById('app');
  if (!D || !Z || !root) return;
  var el = Z.el;

  function node(it, i) {
    var panelKids = [
      el('p', { 'class': 'wen-node-line', text: it.line }),
      el('span', { 'class': 'wen-node-tags', text: it.tags.join(' · ') }),
      it.open
        ? el('a', { 'class': 'wen-node-link', href: it.href, text: '进去看看 →' })
        : el('span', { 'class': 'wen-node-soon', text: '制作中' })
    ];

    var toggle = el('button', {
      'class': 'wen-node-toggle', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'wen-panel-' + i
    }, [
      el('span', { 'class': 'wen-node-dot', 'aria-hidden': 'true' }, [
        el('span', { 'class': 'wen-node-mark', text: it.mark }),
        el('span', { 'class': 'wen-node-idx', text: '0' + (i + 1) })
      ]),
      el('span', { 'class': 'wen-node-spine' }, [
        el('span', { 'class': 'wen-node-era', text: it.era }),
        el('span', { 'class': 'wen-node-name', text: it.name })
      ])
    ]);

    var panel = el('div', { 'class': 'wen-node-panel', id: 'wen-panel-' + i }, [
      el('div', { 'class': 'wen-node-panel-inner' }, panelKids)
    ]);

    var li = el('li', { 'class': 'wen-node' + (it.open ? '' : ' is-closed') }, [toggle, panel]);

    toggle.addEventListener('click', function () {
      var willOpen = !li.classList.contains('is-open');
      /* 一次只展开一段，点别的段会先把上一段收起来 */
      var all = li.parentNode.querySelectorAll('.wen-node.is-open');
      for (var i2 = 0; i2 < all.length; i2++) {
        all[i2].classList.remove('is-open');
        var t2 = all[i2].querySelector('.wen-node-toggle');
        if (t2) t2.setAttribute('aria-expanded', 'false');
      }
      if (willOpen) {
        li.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    return li;
  }

  function timelineBlock() {
    var list = el('ol', { 'class': 'wen-nodes' }, D.eras.map(node));
    return el('div', { 'class': 'wen-timeline' }, [
      el('div', { 'class': 'wen-line', 'aria-hidden': 'true' }),
      list
    ]);
  }

  Z.mount(root, [
    Z.head(D, '文'),
    Z.section('五段文脉', [timelineBlock()])
  ].concat(Z.tipNotes(D)));
  document.title = '文 · 知否知否';
})();
