/* 知否知否 · "礼与思"板块共用的页面搭建工具
   ----------------------------------------------------------
   建立在 zycommon.js（window.ZY）之上：按“配置”把文案库里的分区排成标签页。
   一个分区可以排成：卡片（默认，展开）、步骤卡（带“第几步”）、一行一句的小卡（mode:'line'）、表格（kind:'table'）。
   数据来自各页自己的 data/ls-*.js（由 工具脚本/生成礼思数据.py 从文案库生成），本文件只负责排版，不含内容。 */
(function () {
  'use strict';
  var Z = window.ZY;
  if (!Z) return;
  var el = Z.el;
  var tabsApi = null;

  function S(D, t) { return Z.sec(D, t); }

  /* 文案里的“〔待核〕”在页面上显示成一个红色小标记 */
  function rich(str) {
    str = String(str == null ? '' : str);
    if (str.indexOf('〔待核〕') < 0) return document.createTextNode(str);
    var out = el('span', {});
    str.split('〔待核〕').forEach(function (p, i) {
      if (i) out.appendChild(el('em', { 'class': 'ls-check', title: '这一条还没有对照原典核对', text: '待核' }));
      out.appendChild(document.createTextNode(p));
    });
    return out;
  }
  function linkNode(s) {
    return el('span', { 'class': 'ls-links' }, Z.links(s).map(function (l) {
      return l.href ? el('a', { href: l.href, text: l.name + ' →' }) : el('span', { text: l.name });
    }));
  }
  /* 一张卡里的“字段：内容”→ Z.kv 要的格式；“另见”变成链接 */
  function pairs(it, skip) {
    return it.f.filter(function (p) { return !skip || skip.indexOf(p[0]) < 0; }).map(function (p) {
      if (p[0] === '另见') return [p[0], linkNode(p[1])];
      if (p[1].indexOf('〔待核〕') >= 0) return [p[0], rich(p[1])];
      return p;
    });
  }
  function grid(cards, cls) { return el('div', { 'class': 'zy-grid' + (cls ? ' ' + cls : '') }, cards); }

  /* 造一张卡，并登记 ?id=名称 的直达（先切到对应标签，再展开这张卡） */
  function mk(tabKey, name, o) {
    o.name = name;
    var c = Z.card(o);
    Z.onOpen(name, function () { if (tabKey && tabsApi) tabsApi.show(tabKey); return c; });
    return c;
  }
  /* 已经造好的元素（表格行、自己画的卡）也能被 ?id= 找到 */
  function reg(tabKey, name, node) {
    node.setAttribute('data-ls-name', name);
    Z.onOpen(name, function () { if (tabKey && tabsApi) tabsApi.show(tabKey); return node; });
    return node;
  }

  /* ---------- 卡片 ---------- */
  function cardsIn(s, tabKey, b) {
    var mode = b.mode || 'open';
    var skip = (b.skip || []).slice();
    if (b.kind === 'steps') skip.push('顺序');
    var list = s.items.map(function (it, i) {
      var m = Z.fmap(it.f);
      var o = {};
      if (b.kind === 'steps') o.tag = m['顺序'] || (b.stepFmt ? b.stepFmt(i) : '第 ' + (i + 1) + ' 步');
      var rest = it.f.filter(function (p) { return skip.indexOf(p[0]) < 0; });
      if (mode === 'line') {
        o.sub = rest.map(function (p) { return b.lineLabels === false ? p[1] : p[0] + '：' + p[1]; }).join('　');
        o.isStatic = true;
        o.body = [];
      } else if (rest.length === 1 && rest[0][0] === '说明') {
        o.body = [el('p', { 'class': 'ls-plain' }, [rich(rest[0][1])])];
        if (mode === 'fold') o.open = false; else o.isStatic = true;   /* 内容已经全部摆出来的卡，不再画“－”折叠钮 */
      } else if (rest.length) {
        o.body = [Z.kv(pairs(it, skip))];
        if (mode === 'fold') o.open = false; else o.isStatic = true;
      } else {
        o.isStatic = true;
        o.body = [];
      }
      return mk(tabKey, it.name, o);
    });
    return grid(list, b.grid);
  }

  /* ---------- 表格：cols = [[列标题, 字段名 | '@name', 可选的改写函数], ...] ---------- */
  function tableIn(s, tabKey, b) {
    var cols = b.cols;
    var thead = el('thead', {}, [el('tr', {}, cols.map(function (c) { return el('th', { scope: 'col', text: c[0] }); }))]);
    var tbody = el('tbody', {}, s.items.map(function (it) {
      var m = Z.fmap(it.f);
      var tr = el('tr', { 'data-ls-name': it.name }, cols.map(function (c, ci) {
        var v = c[1] === '@name' ? it.name : (m[c[1]] || '—');
        if (c[2]) v = c[2](v);
        return el('td', { 'class': ci === 0 ? 'is-name' : '', 'data-label': c[0] }, [rich(v)]);
      }));
      return reg(tabKey, it.name, tr);
    }));
    /* 第一列名字短的表，让第一列缩到刚好；名字很长的表（五服）设 wide:true，让各列自己分 */
    return el('div', { 'class': 'ls-tablewrap zy-paper' }, [el('table', { 'class': 'ls-table' + (b.wide ? '' : ' is-narrow') }, [thead, tbody])]);
  }

  /* ---------- 一个分区 → 一个 section ---------- */
  function block(D, tabKey, b) {
    if (b.custom) return b.custom(D, tabKey, b);
    var s = S(D, b.sec);
    var kids = [];
    if (s.bold['说明']) kids.push(Z.note(s.bold['说明']));
    if (s.bold['一句话']) kids.push(Z.callout(s.bold['一句话'], '一句话'));
    if (s.bold['一句话总结']) kids.push(Z.callout(s.bold['一句话总结'], '一句话'));
    if (s.bold['记忆句']) kids.push(Z.callout(s.bold['记忆句'], '记忆句'));
    if (s.items.length) kids.push(b.kind === 'table' ? tableIn(s, tabKey, b) : cardsIn(s, tabKey, b));
    var node = Z.section(b.title || b.sec, kids);
    if (b.attr) Object.keys(b.attr).forEach(function (k) { node.setAttribute(k, b.attr[k]); });
    return node;
  }

  /* ---------- 整个页面 ----------
     cfg = { D 数据, eyebrow 页头小字, title 浏览器标题, tabs:[{key,label,blocks:[...]}], after:[blocks], srcSec 出处分区名 } */
  function mkPage(cfg) {
    var D = cfg.D, root = document.getElementById('app');
    if (!D || !root) return;
    var defs = cfg.tabs.map(function (t) {
      return { key: t.key, label: t.label, build: function () { return t.blocks.map(function (b) { return block(D, t.key, b); }); } };
    });
    tabsApi = Z.tabs(defs);
    var foot = (cfg.after || []).map(function (b) { return block(D, null, b); });
    foot.push(Z.myths(S(D, '常见说法').items));
    var srcTitle = cfg.srcSec || '出处';
    var src = S(D, srcTitle);
    if (src.items.length) {
      foot.push(Z.section(srcTitle, [el('div', { 'class': 'zy-grid is-3' }, src.items.map(function (it) {
        return Z.card({ name: it.name, isStatic: true, body: [Z.kv(pairs(it))] });
      }))]));
    }
    foot.push(Z.see(D));
    Z.mount(root, [Z.head(D, cfg.eyebrow), tabsApi.node].concat(foot, Z.tipNotes(D)));
    document.title = cfg.title + ' · 礼与思 · 知否知否';
    Z.openFromQuery();
  }

  /* ---------- 小工具：画线条的三爻卦、画 SVG ---------- */
  var TRI = { 0x2630: '111', 0x2631: '011', 0x2632: '101', 0x2633: '001', 0x2634: '110', 0x2635: '010', 0x2636: '100', 0x2637: '000' };
  function trigram(glyph) {
    var bits = (TRI[String(glyph).charCodeAt(0)] || '000').split('');
    return el('div', { 'class': 'ls-trigram', role: 'img', 'aria-label': glyph }, bits.map(function (b) {
      return el('div', { 'class': 'ls-yao ' + (b === '1' ? 'is-yang' : 'is-yin') }, b === '1' ? [el('i')] : [el('i'), el('i')]);
    }));
  }
  function svgEl(tag, attrs) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  window.LS = { S: S, rich: rich, pairs: pairs, grid: grid, mk: mk, reg: reg, block: block, mkPage: mkPage, trigram: trigram, svgEl: svgEl };
})();
