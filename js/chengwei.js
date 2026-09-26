/* 知否知否 · 字·语 · 称谓与名字页
   数据：data/zy-chengwei.js（由文案库自动生成）；排版工具：js/zycommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_ZY_CHENGWEI, Z = window.ZY;
  var root = document.getElementById('app');
  if (!D || !Z || !root) return;
  var el = Z.el;
  var S = function (t) { return Z.sec(D, t); };
  var tabsApi = null;

  /* 造一张卡，并登记 ?id=名称 的直达（先切到对应标签，再展开这张卡） */
  function mk(tabKey, name, o) {
    o.name = name;
    var c = Z.card(o);
    Z.onOpen(name, function () { tabsApi.show(tabKey); return c; });
    return c;
  }
  function grid(cards, cls) { return el('div', { 'class': 'zy-grid' + (cls ? ' ' + cls : '') }, cards); }

  /* ---------- 标签一：姓与氏 ---------- */
  function buildXing() {
    var out = [];
    var core = S('核心区别');
    out.push(Z.section('七个称呼的核心区别', [
      Z.callout(core.bold['一句话']),
      grid(core.items.map(function (it) {
        var m = Z.fmap(it.f);
        return mk('xing', it.name, { sub: '例：' + (m['例子'] || ''), body: [Z.kv([['大致功能', m['大致功能']], ['使用特点', m['使用特点']], ['例子', m['例子']]])] });
      }))
    ]));

    var xc = S('姓从哪里来');
    out.push(Z.section('姓从哪里来', [grid(xc.items.map(function (it) {
      return mk('xing', it.name, { body: [Z.kv(it.f)] });
    }), 'is-wide')]));

    var sh = S('氏的来源');
    out.push(Z.section('氏的来源', [grid(sh.items.map(function (it) {
      return mk('xing', it.name, { sub: Z.fmap(it.f)['例子'], isStatic: true, body: [] });
    }), 'is-wide')]));

    var bj = S('百家姓');
    var general = bj.items.filter(function (i) { return !Z.fmap(i.f)['来源线索']; });
    var fu = bj.items.filter(function (i) { return Z.fmap(i.f)['来源线索']; });
    out.push(Z.section('百家姓', [
      Z.note(bj.bold['说明']),
      grid(general.map(function (it) {
        var m = Z.fmap(it.f);
        return mk('xing', it.name, {
          open: it.name === '赵钱孙李',
          body: [Z.kv([
            ['说明', m['说明']],
            ['开头四句', m['开头四句']],
            ['常见解释', Z.parts(m['常见解释'])],
            ['提醒', m['提醒']]
          ], { quote: ['开头四句'] })]
        });
      }), 'is-wide'),
      el('div', { 'class': 'zy-subtitle', text: '几个复姓' }),
      grid(fu.map(function (it) {
        var m = Z.fmap(it.f);
        return mk('xing', it.name, { tag: '复姓', sub: m['来源线索'], body: [el('p', { 'class': 'zy-card-sub', text: m['典故'] })] });
      }))
    ]));
    return out;
  }

  /* ---------- 标签二：名字号 ---------- */
  function buildMing() {
    var out = [];
    var mz = S('名字号');
    out.push(Z.section('名、字、号', [
      Z.note(mz.bold['说明']),
      grid(mz.items.map(function (it) { return mk('ming', it.name, { open: true, body: [Z.kv(it.f)] }); }), 'is-3')
    ]));
    var ex = S('名与字的例子');
    out.push(Z.section('名与字的例子', [grid(ex.items.map(function (it) {
      return mk('ming', it.name, { sub: Z.fmap(it.f)['说明'], isStatic: true, body: [] });
    }), 'is-wide')]));
    var hx = S('号的例子');
    out.push(Z.section('号的例子', [grid(hx.items.map(function (it) {
      return mk('ming', it.name, { sub: Z.fmap(it.f)['说明'], isStatic: true, body: [] });
    }), 'is-wide')]));
    return out;
  }

  /* ---------- 标签三：亲属 ---------- */
  function buildQin() {
    var out = [];
    var qc = S('亲属称谓');
    out.push(Z.section('亲属称谓', [
      Z.note(qc.bold['说明']),
      grid(qc.items.map(function (it) { return mk('qin', it.name, { open: true, body: [Z.kv(it.f)] }); }), 'is-3')
    ]));

    var gx = S('关系表');
    var names = gx.items.map(function (i) { return i.name; });
    var panel = el('div', { 'class': 'zy-detail zy-paper', 'aria-live': 'polite' });
    var ch = null;
    function show(i) {
      var it = gx.items[i], m = Z.fmap(it.f);
      panel.textContent = '';
      panel.appendChild(el('div', { 'class': 'zy-kicker', text: '关系表 · ' + (i + 1) + ' / ' + names.length }));
      panel.appendChild(el('h3', { text: it.name }));
      panel.appendChild(el('p', { 'class': 'zy-oneline', text: m['现代通常所指'] }));
      panel.appendChild(Z.kv([['关系要点', m['关系要点']]]));
      panel.appendChild(Z.prevNext(names, i, function (j) { ch.pick(j); }));
    }
    ch = Z.chips(names, show, { aria: '亲属称谓', scroll: true });
    names.forEach(function (n, i) { Z.onOpen(n, function () { tabsApi.show('qin'); ch.pick(i); return panel; }); });
    ch.pick(0);
    out.push(Z.section('关系表：叔、伯、姑、舅、姨', [Z.note(gx.bold['说明']), ch.node, panel]));
    return out;
  }

  /* ---------- 标签四：称呼的古今 ---------- */
  function buildGu() {
    var out = [];
    var pd = S('排行');
    out.push(Z.section('排行', [Z.note(pd.bold['说明']), grid(pd.items.map(function (it) {
      return mk('gu', it.name, { open: true, body: [Z.kv(it.f)] });
    }), 'is-wide')]));
    var gj = S('称呼的古今');
    out.push(Z.section('称呼的古今', [Z.note(gj.bold['说明']), grid(gj.items.map(function (it) {
      return mk('gu', it.name, { open: true, body: [Z.kv(it.f)] });
    }), 'is-wide')]));
    return out;
  }

  tabsApi = Z.tabs([
    { key: 'xing', label: '姓与氏', build: buildXing },
    { key: 'ming', label: '名字号', build: buildMing },
    { key: 'qin', label: '亲属', build: buildQin },
    { key: 'gu', label: '称呼的古今', build: buildGu }
  ]);

  var yz = S('使用与查证原则');
  var yzList = yz.items[0] ? yz.items[0].f.map(function (p) { return p[1]; }) : [];
  var src = S('出处');
  Z.mount(root, [
    Z.head(D, '字·语 · 称谓与名字'),
    tabsApi.node,
    Z.myths(S('常见说法').items),
    Z.section('使用与查证原则', [Z.note(yz.bold['说明']), el('div', { 'class': 'zy-detail zy-paper' }, [Z.kv([['五条原则', yzList]])])]),
    Z.section('出处', [el('div', { 'class': 'zy-grid is-3' }, src.items.map(function (it) {
      return Z.card({ name: it.name, isStatic: true, body: [Z.kv(it.f)] });
    }))]),
    Z.see(D)
  ].concat(Z.tipNotes(D)));
  document.title = '称谓与名字 · 字·语 · 知否知否';
  Z.openFromQuery();
})();
