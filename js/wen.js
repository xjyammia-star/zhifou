
/* 知否知否 · "文"入口页脚本（文脉时间线）
   跟其它板块入口不一样：这里不用"字·语/礼与思/艺"共用的那种并排卡片（zy-shelf/zy-book），
   而是画一条横向的时间线，五个时代按顺序挂在线上，点开哪个就进哪一页。
   数据来自 data/wen-index.js（window.ZHIFOU_WEN_INDEX）；排版小工具沿用 js/zycommon.js（window.ZY）。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_WEN_INDEX, Z = window.ZY;
  var root = document.getElementById('app');
  if (!D || !Z || !root) return;
  var el = Z.el;

  function node(it, i) {
    var kids = [
      el('span', { 'class': 'wen-node-dot', 'aria-hidden': 'true' }, [
        el('span', { 'class': 'wen-node-mark', text: it.mark }),
        el('span', { 'class': 'wen-node-idx', text: '0' + (i + 1) })
      ]),
      el('div', { 'class': 'wen-node-card' }, [
        el('span', { 'class': 'wen-node-era', text: it.era }),
        el('span', { 'class': 'wen-node-name', text: it.name }),
        el('p', { 'class': 'wen-node-line', text: it.line }),
        el('span', { 'class': 'wen-node-tags', text: it.tags.join(' · ') }),
        it.open ? null : el('span', { 'class': 'wen-node-soon', text: '制作中' })
      ])
    ];
    if (it.open) {
      return el('a', { 'class': 'wen-node', href: it.href, 'aria-label': it.name + '：' + it.line }, kids);
    }
    return el('div', { 'class': 'wen-node is-closed', 'aria-disabled': 'true', 'aria-label': it.name + '：制作中' }, kids);
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
