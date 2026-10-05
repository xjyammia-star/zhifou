/* 知否知否 · 字语 · 词语的古今页
   数据：data/zy-ciyu.js（由文案库自动生成）；排版工具：js/zycommon.js
   四个标签页：词源 / 古今异义 / 成语的古今差异 / 佛教与外来词 */
(function () {
  'use strict';
  var D = window.ZHIFOU_ZY_CIYU, Z = window.ZY;
  var root = document.getElementById('app');
  if (!D || !Z || !root) return;
  var el = Z.el;
  var S = function (t) { return Z.sec(D, t); };
  var tabsApi = null;
  var goTab = function (k) { return function () { tabsApi.show(k); }; };

  var CI_GROUPS = ['人与关系', '状态与处境', '行动标准与变化', '合称词', '借代与引申'];
  var FJ_GROUPS = ['佛教传入', '外来词古例', '古词新义'];

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
    out.push(Z.section('词源：' + ci.items.length + ' 个词', [Z.note(ci.bold['说明'])].concat(Z.filtered(ci.items, CI_GROUPS, function (it, m) {
      return Z.card({
        name: it.name, tag: m['分组'], sub: m['好记版'],
        body: [Z.chars(m['拆字']), Z.kv([['合起来', m['合起来']], ['提醒', m['提醒']]])]
      });
    }, { aria: '词源分组', before: goTab('ci') }))));

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

  /* ---------- 标签二：古今异义 ---------- */
  function buildGj() {
    var s = S('古今异义');
    return [Z.section('古今异义：' + s.items.length + ' 个词', [Z.note(Z.LEGEND)].concat(Z.cardList(D, '古今异义', { before: goTab('gj') })))];
  }

  /* ---------- 标签三：成语的古今差异 ---------- */
  function cyCard(it) {
    return Z.gcard(it, { sub: '原来是', subMax: 40, order: ['原来是', '现在是', '出处', '提醒'] });
  }
  function buildCy() {
    var s = S('成语的古今差异');
    return [Z.section('成语的古今差异：' + s.items.length + ' 个', [
      Z.callout('这一页不是成语故事。', '先说明'),
      Z.note(Z.LEGEND)
    ].concat(Z.cardList(D, '成语的古今差异', { make: cyCard, before: goTab('cy') })))];
  }

  /* ---------- 标签四：佛教与外来词 ---------- */
  function buildFj() {
    var s = S('佛教与外来词');
    return [Z.section('佛教与外来词：' + s.items.length + ' 个', [Z.note(s.bold['说明']), Z.note(Z.LEGEND)].concat(Z.filtered(s.items, FJ_GROUPS, function (it) {
      return Z.supplCard(it);
    }, { aria: '佛教与外来词分组', before: goTab('fj'), grid: 'is-wide' })))];
  }

  tabsApi = Z.tabs([
    { key: 'ci', label: '词源', build: buildCi },
    { key: 'gj', label: '古今异义', build: buildGj },
    { key: 'cy', label: '成语的古今差异', build: buildCy },
    { key: 'fj', label: '佛教与外来词', build: buildFj }
  ]);

  Z.mount(root, [Z.head(D, '字语 · 词语的古今'), tabsApi.node, Z.see(D)].concat(Z.tipNotes(D)));
  document.title = '词语的古今 · 字语 · 知否知否';
  Z.openFromQuery();
})();
