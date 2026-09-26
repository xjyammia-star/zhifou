/* 知否知否 · 字·语 · 词语的古今页
   数据：data/zy-ciyu.js（由文案库自动生成）；排版工具：js/zycommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_ZY_CIYU, Z = window.ZY;
  var root = document.getElementById('app');
  if (!D || !Z || !root) return;
  var el = Z.el;
  var S = function (t) { return Z.sec(D, t); };
  var tabsApi = null;

  var CI_GROUPS = ['人与关系', '状态与处境', '行动标准与变化', '合称词', '借代与引申'];
  var SHU_GROUPS = ['出处和数字都比较明确', '数字有明确背景，但具体名单有差异', '有具体背景，但需要注明争议'];
  var SHU_SHORT = { '出处和数字都比较明确': '出处明确', '数字有明确背景，但具体名单有差异': '名单有差异', '有具体背景，但需要注明争议': '需注明争议' };

  /* 一排“分组”选项 + 一片卡：选哪组就只显示哪组的卡 */
  function filtered(items, groups, labels, makeCard, tabKey, aria) {
    var grid = el('div', { 'class': 'zy-grid' });
    var cards = [];
    items.forEach(function (it) {
      var m = Z.fmap(it.f);
      var c = makeCard(it, m);
      c.setAttribute('data-group', m['分组']);
      cards.push(c);
      grid.appendChild(c);
    });
    var hint = el('p', { 'class': 'zy-note', 'aria-live': 'polite' });
    var ch = Z.chips(['全部'].concat(labels), function (i) {
      cards.forEach(function (c) { c.hidden = i > 0 && c.getAttribute('data-group') !== groups[i - 1]; });
      var n = cards.filter(function (c) { return !c.hidden; }).length;
      hint.textContent = '当前显示：' + (i === 0 ? '全部' : labels[i - 1]) + '，共 ' + n + ' 张。点开一张看详情。';
    }, { aria: aria, scroll: true });
    ch.pick(0);
    items.forEach(function (it, i) {
      Z.onOpen(it.name, function () { tabsApi.show(tabKey); ch.pick(0); return cards[i]; });
    });
    return [ch.node, hint, grid];
  }

  /* ---------- 标签一：词源 ---------- */
  function buildCi() {
    var out = [];
    var how = S('怎么看这类词');
    var qs = how.items[0] ? how.items[0].f : [];
    out.push(Z.section('怎么看这类词', [
      Z.note(how.bold['说明']),
      el('div', { 'class': 'zy-grid is-3' }, qs.map(function (p) {
        return el('div', { 'class': 'zy-detail zy-paper' }, [el('div', { 'class': 'zy-kicker', text: p[0] }), el('p', { 'class': 'zy-oneline', text: p[1] })]);
      }))
    ]));

    var ci = S('词源');
    out.push(Z.section('词源：' + ci.items.length + ' 个词', [Z.note(ci.bold['说明'])].concat(filtered(ci.items, CI_GROUPS, CI_GROUPS, function (it, m) {
      return Z.card({
        name: it.name, tag: m['分组'], sub: m['好记版'],
        body: [Z.chars(m['拆字']), Z.kv([['合起来', m['合起来']], ['提醒', m['提醒']]])]
      });
    }, 'ci', '词源分组'))));

    var rt = S('词义变化的路线');
    var ex = rt.items[0] ? rt.items[0].f : [];
    out.push(Z.section('词义变化的路线', [Z.note(rt.bold['说明']), Z.words(ex)]));
    var fk = S('民间说法');
    out.push(Z.section('民间说法', [Z.note(fk.bold['说明']), el('div', { 'class': 'zy-myths' }, fk.items.map(function (it) {
      var m = Z.fmap(it.f);
      return el('details', { 'class': 'zy-myth' }, [
        el('summary', {}, [el('span', { 'class': 'zy-mark', 'aria-hidden': 'true', text: '？' }), el('span', { 'class': 'zy-myth-claim', text: m['说法'] || it.name })]),
        el('div', { 'class': 'zy-myth-body' }, [el('span', { 'class': 'zy-mark is-ok', 'aria-hidden': 'true', text: '正' }), el('p', { 'class': 'zy-myth-better', text: m['更准确'] || '' })])
      ]);
    }))]));
    return out;
  }

  /* ---------- 标签二：数字成语 ---------- */
  function buildShu() {
    var out = [];
    var sz = S('数字成语');
    out.push(Z.section('数字成语：' + sz.items.length + ' 个', [Z.note(sz.bold['说明'])].concat(filtered(sz.items, SHU_GROUPS, SHU_GROUPS.map(function (g) { return SHU_SHORT[g]; }), function (it, m) {
      var see = Z.links(m['另见']);
      return Z.card({
        name: it.name, tag: SHU_SHORT[m['分组']], sub: (m['数字对应'] || '').slice(0, 34) + ((m['数字对应'] || '').length > 34 ? '…' : ''),
        body: [Z.kv([['数字对应', m['数字对应']], ['意思', m['意思']], ['提醒', m['提醒']]]),
          see.length ? el('p', { 'class': 'zy-card-sub' }, ['另见：'].concat(see.map(function (l) { return el('a', { href: l.href, text: l.name + ' →' }); }))) : null]
      });
    }, 'shu', '数字成语分组'))));

    var no = S('暂不纳入的数字成语');
    var ws = no.items[0] ? Z.fmap(no.items[0].f)['词语'] : '';
    out.push(Z.section('暂不纳入', [
      Z.note(no.bold['说明']),
      el('div', { 'class': 'zy-detail zy-paper' }, [el('p', { 'class': 'zy-oneline', text: ws })])
    ]));
    return out;
  }

  tabsApi = Z.tabs([
    { key: 'ci', label: '词源', build: buildCi },
    { key: 'shu', label: '数字成语', build: buildShu }
  ]);

  Z.mount(root, [Z.head(D, '字·语 · 词语的古今'), tabsApi.node, Z.see(D)].concat(Z.tipNotes(D)));
  document.title = '词语的古今 · 字·语 · 知否知否';
  Z.openFromQuery();
})();
