/* 知否知否 · 字·语 · 传统颜色页
   数据：data/zy-yanse.js（由文案库自动生成）；排版工具：js/zycommon.js
   色块的颜色是按名称和古义估的“近似色”，不是标准色号（页面上写明）。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_ZY_YANSE, Z = window.ZY;
  var root = document.getElementById('app');
  if (!D || !Z || !root) return;
  var el = Z.el;
  var S = function (t) { return Z.sec(D, t); };

  var GROUPS = ['青蓝绿及青黑', '赤红朱绛', '黄褐土色', '白灰银色', '黑玄乌紫及杂色'];
  var GROUP_LABEL = { '青蓝绿及青黑': '青·蓝·绿·青黑', '赤红朱绛': '赤·红·朱·绛', '黄褐土色': '黄·褐·土色', '白灰银色': '白·灰·银', '黑玄乌紫及杂色': '黑·玄·乌·紫' };

  /* 把所有颜色词摊平：{ name, group, m } */
  var colors = [];
  GROUPS.forEach(function (g) {
    S(g).items.forEach(function (it) { colors.push({ name: it.name, group: g, m: Z.fmap(it.f) }); });
  });
  var bio = S('色名小传');
  var bioCards = {};

  /* ---------- 色卡 + 详情 ---------- */
  var grid = el('div', { 'class': 'zy-swatches' });
  var sws = [];
  var panel = el('div', { 'class': 'zy-detail zy-paper', 'aria-live': 'polite' });
  var groupRemind = el('div', {});
  var curSel = 0;
  var hint = el('p', { 'class': 'zy-note', 'aria-live': 'polite' });

  function select(i, scroll) {
    curSel = i;
    sws.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
    var c = colors[i], m = c.m, hasColor = /^#/.test(m['近似色'] || '');
    panel.textContent = '';
    panel.appendChild(el('div', { 'class': hasColor ? 'zy-bigblock' : 'zy-bigblock zy-sw-block is-none', style: hasColor ? 'background:' + m['近似色'] : null, text: hasColor ? '' : '不是单一颜色' }));
    panel.appendChild(el('div', { 'class': 'zy-kicker', text: GROUP_LABEL[c.group] }));
    panel.appendChild(el('h3', { text: c.name }));
    panel.appendChild(Z.kv([['色感', m['色感']], ['出处', m['出处']], ['说明', m['说明']]]));
    if (hasColor) panel.appendChild(el('p', { 'class': 'zy-hex', text: '页面色块（近似色）：' + m['近似色'] }));
    if (bioCards[c.name]) {
      var b = el('button', { 'class': 'zy-btn', type: 'button', text: '读“' + c.name + '”的色名小传 ↓' });
      b.addEventListener('click', function () { bioCards[c.name].open = true; bioCards[c.name].scrollIntoView({ block: 'center' }); });
      panel.appendChild(el('div', { 'class': 'zy-btnrow' }, [b]));
    }
    if (scroll && panel.scrollIntoView) panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  colors.forEach(function (c, i) {
    var hasColor = /^#/.test(c.m['近似色'] || '');
    var b = el('button', { 'class': 'zy-sw', type: 'button', 'aria-pressed': 'false', 'data-group': c.group, 'aria-label': c.name + '，' + (c.m['色感'] || '') }, [
      el('div', { 'class': hasColor ? 'zy-sw-block' : 'zy-sw-block is-none', style: hasColor ? 'background:' + c.m['近似色'] : null, text: hasColor ? '' : '非单色' }),
      el('span', { 'class': 'zy-sw-name', text: c.name }),
      el('span', { 'class': 'zy-sw-sub', text: (c.m['色感'] || '').slice(0, 14) })
    ]);
    b.addEventListener('click', function () { select(i, true); });
    sws.push(b);
    grid.appendChild(b);
    Z.onOpen(c.name, function () { ch.pick(0); select(i); return sws[i]; });
  });

  var ch = Z.chips(['全部（' + colors.length + '）'].concat(GROUPS.map(function (g) { return GROUP_LABEL[g]; })), function (i) {
    sws.forEach(function (b) { b.hidden = i > 0 && b.getAttribute('data-group') !== GROUPS[i - 1]; });
    var vis = sws.filter(function (b) { return !b.hidden; }).length;
    hint.textContent = '当前显示：' + (i === 0 ? '全部色系' : GROUP_LABEL[GROUPS[i - 1]]) + '，共 ' + vis + ' 个颜色词。点一个色块，看它的说明。';
    if (sws[curSel] && sws[curSel].hidden) {
      for (var k = 0; k < sws.length; k++) { if (!sws[k].hidden) { select(k); break; } }
    }
    groupRemind.textContent = '';
    if (i > 0 && S(GROUPS[i - 1]).bold['提醒']) groupRemind.appendChild(Z.remind(S(GROUPS[i - 1]).bold['提醒']));
  }, { aria: '五个色系', scroll: true });
  ch.pick(0);
  select(0);

  /* ---------- 其余板块 ---------- */
  var dq = S('颜色名不等于色卡');
  var rs = S('染织颜色系统');
  var dg = S('颜色词背后的典故');
  var hx = S('容易混淆的词');
  var zl = S('整理原则');
  var zlList = zl.items[0] ? zl.items[0].f.map(function (p) { return p[1]; }) : [];
  var src = S('出处');

  var bioGrid = el('div', { 'class': 'zy-grid is-wide' }, bio.items.map(function (it) {
    var m = Z.fmap(it.f);
    var c = Z.card({ name: it.name, sub: m['一句话'], body: [Z.kv([['本义', m['本义']], ['出处', m['出处']], ['常见用法', m['常见用法']], ['提醒', m['提醒']]])] });
    bioCards[it.name] = c;
    return c;
  }));
  /* 色名小传里的颜色如果没有色卡，也支持 ?id= 直达 */
  bio.items.forEach(function (it) { Z.onOpen(it.name, function () { return bioCards[it.name]; }); });

  Z.mount(root, [
    Z.head(D, '字·语 · 传统颜色'),
    Z.callout('页面上的色块，是按颜色名称和古义估的近似色，只用来帮助想象，不是标准色号。', '说明'),
    Z.section('色谱：五十个颜色词', [ch.node, hint, groupRemind, panel, grid]),
    Z.section('颜色名不等于色卡', [
      Z.note(dq.bold['说明']),
      el('div', { 'class': 'zy-grid' }, dq.items.map(function (it) { return Z.card({ name: it.name, sub: Z.fmap(it.f)['例子'], isStatic: true, body: [] }); }))
    ]),
    Z.section('染织颜色系统', [
      Z.note(rs.bold['说明']),
      el('div', { 'class': 'zy-grid is-3' }, rs.items.map(function (it) { return Z.card({ name: it.name, body: [Z.kv(it.f)] }); }))
    ]),
    Z.section('色名小传', [Z.note(bio.bold['说明']), bioGrid]),
    Z.section('颜色词背后的典故', [el('div', { 'class': 'zy-grid is-wide' }, dg.items.map(function (it) { return Z.card({ name: it.name, body: [Z.kv(it.f)] }); }))]),
    Z.section('容易混淆的词', [el('div', { 'class': 'zy-grid is-wide' }, hx.items.map(function (it) { return Z.card({ name: it.name, sub: Z.fmap(it.f)['区别'], isStatic: true, body: [] }); }))]),
    Z.section('整理原则', [Z.note(zl.bold['说明']), el('div', { 'class': 'zy-detail zy-paper' }, [Z.kv([['五条原则', zlList]])])]),
    Z.section('出处', [el('div', { 'class': 'zy-grid is-3' }, src.items.map(function (it) { return Z.card({ name: it.name, isStatic: true, body: [Z.kv(it.f)] }); }))]),
    Z.see(D)
  ].concat(Z.tipNotes(D)));
  document.title = '传统颜色 · 字·语 · 知否知否';
  Z.openFromQuery();
})();
