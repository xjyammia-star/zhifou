/* 知否知否 · 字·语 · 汉字页
   数据：data/zy-hanzi.js（由文案库自动生成）；排版工具：js/zycommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_ZY_HANZI, Z = window.ZY;
  var root = document.getElementById('app');
  if (!D || !Z || !root) return;
  var el = Z.el;
  var S = function (t) { return Z.sec(D, t); };
  var tabsApi = null;

  /* 横向手卷：一排节点，点哪个看哪个 */
  function scrollFlow(items, aria, keyOfOpen) {
    var row = el('div', { 'class': 'zy-scroll', role: 'group', 'aria-label': aria });
    var panel = el('div', { 'class': 'zy-detail zy-paper', 'aria-live': 'polite' });
    var nodes = [];
    var names = items.map(function (it) { return it.name; });
    function sel(i) {
      nodes.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      var it = items[i], m = Z.fmap(it.f);
      panel.textContent = '';
      panel.appendChild(el('div', { 'class': 'zy-kicker', text: '第 ' + (i + 1) + ' 个 · 共 ' + items.length + ' 个' }));
      panel.appendChild(el('h3', { text: it.name }));
      if (m['一句话']) panel.appendChild(el('p', { 'class': 'zy-oneline', text: m['一句话'] }));
      panel.appendChild(Z.kv([
        ['时代与材料', m['时代与材料']],
        ['特点', Z.parts(m['特点'])],
        ['做什么', m['做什么']],
        ['提醒', m['提醒']]
      ]));
      panel.appendChild(Z.prevNext(names, i, sel));
    }
    items.forEach(function (it, i) {
      var b = el('button', { 'class': 'zy-node', type: 'button', 'aria-pressed': 'false' }, [
        el('span', { 'class': 'zy-node-name', text: it.name }),
        el('span', { 'class': 'zy-node-no', text: '第 ' + (i + 1) + ' 个' })
      ]);
      b.addEventListener('click', function () { sel(i); });
      nodes.push(b);
      row.appendChild(b);
      if (keyOfOpen) Z.onOpen(it.name, function () { tabsApi.show(keyOfOpen); sel(i); return panel; });
    });
    sel(0);
    return el('div', {}, [row, panel]);
  }

  /* ---------- 标签一：演变 ---------- */
  function buildEvo() {
    var out = [];
    var c = S('三个概念');
    out.push(Z.section('三个概念', [
      Z.callout(c.bold['一句话区分']),
      el('div', { 'class': 'zy-grid is-3' }, c.items.map(function (it) {
        var m = Z.fmap(it.f);
        return el('div', { 'class': 'zy-detail zy-paper' }, [
          el('div', { 'class': 'zy-kicker', text: '回答：' + (m['回答的问题'] || '') }),
          el('h3', { text: it.name }),
          el('p', { 'class': 'zy-card-sub', text: m['说明'] }),
          el('p', { 'class': 'zy-card-sub', text: m['例子'] })
        ]);
      }))
    ]));

    var o = S('起源');
    out.push(Z.section('起源', [
      Z.note(o.bold['说明']),
      el('div', { 'class': 'zy-grid is-wide' }, o.items.map(function (it) {
        return Z.card({ name: it.name, open: true, body: [Z.kv(it.f)] });
      }))
    ]));

    var ev = S('演变');
    out.push(Z.section('演变：九个阶段', [Z.note(ev.bold['说明']), scrollFlow(ev.items, '九个字形阶段', 'evo')]));

    var sh = S('书体关系');
    var tu = sh.items.filter(function (i) { return i.name === '图'; })[0];
    var attn = sh.items.filter(function (i) { return i.name === '需要注意'; })[0];
    var layerRows = [];
    if (tu) {
      tu.f.forEach(function (p, i) {
        if (i > 0) layerRows.push(el('div', { 'class': 'zy-arrow', 'aria-hidden': 'true', text: '↓' }));
        layerRows.push(el('div', { 'class': 'zy-layer' }, Z.parts(p[1]).map(function (t) { return el('span', { 'class': 'zy-lnode', text: t }); })));
      });
    }
    out.push(Z.section('书体关系', [
      Z.note(sh.bold['说明']),
      el('div', { 'class': 'zy-layers-wrap' }, [el('div', { 'class': 'zy-layers', role: 'img', 'aria-label': '书体关系图：从早期刻写到楷书、行书、草书' }, layerRows)]),
      attn ? el('div', { 'class': 'zy-detail zy-paper' }, [Z.kv([['需要注意', attn.f.map(function (p) { return p[1]; })]])]) : null
    ]));
    return out;
  }

  /* ---------- 标签二：六书 ---------- */
  function buildLiu() {
    var out = [];
    var ls = S('六书');
    var names = ls.items.map(function (i) { return i.name; });
    var panel = el('div', { 'class': 'zy-detail zy-paper', 'aria-live': 'polite' });
    function show(i) {
      var it = ls.items[i], m = Z.fmap(it.f);
      panel.textContent = '';
      panel.appendChild(el('div', { 'class': 'zy-kicker', text: '六书之 ' + (i + 1) + ' · 共 6 项' }));
      panel.appendChild(el('h3', { text: it.name }));
      if (m['一句话']) panel.appendChild(el('p', { 'class': 'zy-oneline', text: m['一句话'] }));
      panel.appendChild(Z.kv([
        ['许慎的定义', m['许慎的定义']],
        ['意思', m['意思']],
        ['例字', Z.parts(m['例字'])],
        ['提醒', m['提醒']]
      ], { quote: ['许慎的定义'] }));
      panel.appendChild(Z.prevNext(names, i, function (j) { ch.pick(j); }));
    }
    var ch = Z.chips(names, show, { aria: '六书', scroll: true });
    names.forEach(function (n, i) { Z.onOpen(n, function () { tabsApi.show('liu'); ch.pick(i); return panel; }); });
    ch.pick(0);
    out.push(Z.section('六书', [Z.note(ls.bold['说明']), Z.remind(ls.bold['提醒']), ch.node, panel]));

    var cs = S('六书出处');
    out.push(Z.section('六书出处', [
      Z.note(cs.bold['说明']),
      el('div', { 'class': 'zy-grid is-3' }, cs.items.map(function (it) {
        return Z.card({ name: it.name, open: true, body: [Z.kv(it.f, { quote: ['原文'] })] });
      }))
    ]));

    var bd = S('六书的使用边界');
    out.push(Z.section('六书的使用边界', [el('div', { 'class': 'zy-grid is-3' }, bd.items.map(function (it) {
      return Z.card({ name: it.name, body: [Z.kv(it.f)] });
    }))]));
    return out;
  }

  /* ---------- 标签三：观察一个字 ---------- */
  function buildLook() {
    var out = [];
    var lk = S('观察一个字');
    out.push(Z.section('观察一个字：七步', [Z.note(lk.bold['说明']), scrollFlow(lk.items, '观察一个字的七步', null)]));
    var xiu = S('例子：休');
    out.push(Z.section('例子：休', [
      Z.note(xiu.bold['说明']),
      el('div', { 'class': 'zy-grid' }, xiu.items.map(function (it, i) {
        return Z.card({ name: it.name, tag: '第 ' + (i + 1) + ' 步', isStatic: true, body: [el('p', { 'class': 'zy-card-sub', text: Z.fmap(it.f)['说明'] })] });
      }))
    ]));
    return out;
  }

  tabsApi = Z.tabs([
    { key: 'evo', label: '演变', build: buildEvo },
    { key: 'liu', label: '六书', build: buildLiu },
    { key: 'look', label: '观察一个字', build: buildLook }
  ]);

  var mem = S('最简记忆版').bold;
  var src = S('出处');
  Z.mount(root, [
    Z.head(D, '字·语 · 汉字'),
    tabsApi.node,
    Z.myths(S('常见说法').items),
    Z.section('最简记忆版', [Z.memory([['演变主线', mem['演变主线']], ['六书', mem['六书']], ['书体', mem['书体']]])]),
    Z.section('出处', [el('div', { 'class': 'zy-grid is-3' }, src.items.map(function (it) {
      return Z.card({ name: it.name, isStatic: true, body: [Z.kv(it.f)] });
    }))]),
    Z.see(D)
  ].concat(Z.tipNotes(D)));
  document.title = '汉字 · 字·语 · 知否知否';
  Z.openFromQuery();
})();
