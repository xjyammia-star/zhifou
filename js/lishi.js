/* 知否知否 · 历史 · 总览页（按朝代分组的卡片）
   数据：data/lishi-index.js（由 工具脚本/生成历史数据.py 自动生成）；排版工具：js/zycommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_LISHI_INDEX, Z = window.ZY;
  var root = document.getElementById('app');
  if (!D || !Z || !root) return;
  var el = Z.el;

  function card(d) {
    var stat = d.ready
      ? '帝王 ' + d.nEmp + ' 位 · 大事 ' + d.nEv + ' 条 · 人物 ' + d.nPeople + ' 位'
      : '整理中，敬请期待';
    var kids = [
      el('span', { 'class': 'ss-dyn-name', text: d.name }),
      el('span', { 'class': 'ss-dyn-range', text: d.range }),
      el('span', { 'class': 'ss-dyn-line', text: d.blurb }),
      el('span', { 'class': 'ss-dyn-stat', text: stat })
    ];
    if (d.ready) return el('a', { 'class': 'ss-dyn', href: 'lishi-chaodai.html?d=' + d.key, 'aria-label': d.name + '：' + d.blurb }, kids);
    return el('div', { 'class': 'ss-dyn is-soon', 'aria-label': d.name + '（整理中）' }, kids);
  }

  var groups = D.groups.map(function (g) {
    var list = D.dynasties.filter(function (d) { return d.group === g; });
    if (!list.length) return null;
    var done = list.filter(function (d) { return d.ready; }).length;
    return Z.section(g + (done < list.length ? '（' + done + '/' + list.length + ' 已上线）' : ''),
      [el('div', { 'class': 'ss-grid' }, list.map(card))]);
  });

  Z.mount(root, [
    Z.head(D, '历史')
  ].concat(groups).concat([
    Z.note('说明：年份均用公历，公元前写作“前221”。同一事实各书记载不同时，页面里会把几种说法并列写出，不替读者下结论；还没有对照原典逐字核对的地方，标有红色“待核”。')
  ]));
  document.title = '历史 · 知否知否';
})();
