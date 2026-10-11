/* 知否知否 · 历史 · 朝代页（通用）
   用法：lishi-chaodai.html?d=qin  （d 是朝代代号，见 data/lishi-index.js）
   数据：data/lishi-<代号>.js（由 工具脚本/生成历史数据.py 自动生成），按需加载，不一次全读；排版工具：js/zycommon.js */
(function () {
  'use strict';
  var I = window.ZHIFOU_LISHI_INDEX, Z = window.ZY;
  var root = document.getElementById('app');
  if (!I || !Z || !root) return;
  var el = Z.el;

  var readyList = I.dynasties.filter(function (d) { return d.ready; });
  var key = Z.qs('d') || (readyList[0] && readyList[0].key);
  var meta = null;
  I.dynasties.forEach(function (d) { if (d.key === key) meta = d; });

  /* ---------- 小工具 ---------- */
  /* 文字里的“〔待核〕”换成红色小标记 */
  function rich(t) {
    var out = [];
    String(t || '').split(/(〔[^〕]*待核[^〕]*〕)/).forEach(function (p) {
      if (!p) return;
      if (/^〔[^〕]*待核[^〕]*〕$/.test(p)) out.push(el('em', { 'class': 'ss-check', text: '待核' }));
      else out.push(p);
    });
    return out;
  }
  function gradeEl(g) {
    if (g === '待核') return el('em', { 'class': 'ss-check', text: '待核' });
    if (g === '部分待核') return el('em', { 'class': 'ss-check is-part', text: '部分待核' });
    return null;
  }
  function span(t) { return el('span', {}, rich(t)); }
  function ul(items) {
    return el('ul', { 'class': 'ss-list' }, items.map(function (x) { return el('li', {}, x); }));
  }
  function evLi(e) {
    return [el('span', { 'class': 'ss-ly', text: e.y })].concat(rich(e.t)).concat([gradeEl(e.g)]);
  }
  function cut(s, n) { s = s || ''; return s.length > n ? s.slice(0, n) + '…' : s; }

  /* 卡片里的字段 → 键值对 */
  function pairsOf(fields) {
    return fields.map(function (f) {
      if (f.k === '出处') return ['出处', f.list && f.list.length ? el('p', { 'class': 'ss-srcs', text: f.list.join('　◆　') + (f.v ? '　' + f.v : '') }) : f.v];
      if (f.items) {
        return [f.k, ul(f.items.map(function (it) {
          return it.ev ? evLi(it.ev) : rich(it.t);
        }))];
      }
      return [f.k, span(f.v)];
    });
  }
  function fieldOf(card, k) {
    for (var i = 0; i < card.f.length; i++) if (card.f[i].k === k) return card.f[i].v || '';
    return '';
  }

  /* ---------- 页头与切换条 ---------- */
  function dynBar() {
    var nav = el('nav', { 'class': 'ss-dynbar', 'aria-label': '切换朝代' });
    I.dynasties.forEach(function (d) {
      if (d.ready) nav.appendChild(el('a', { href: 'lishi-chaodai.html?d=' + d.key, 'aria-current': d.key === key ? 'page' : null, text: d.name }));
      else nav.appendChild(el('span', { 'class': 'is-soon', title: '整理中', text: d.name }));
    });
    return nav;
  }

  function fail(msg) {
    Z.mount(root, [
      el('header', { 'class': 'zy-head' }, [el('div', { 'class': 'zy-eyebrow', text: '历史' }), el('h1', { 'class': 'zy-hook', text: '这个朝代还在整理中' }), el('p', { 'class': 'zy-answer', text: msg })]),
      dynBar(),
      Z.note('可以先回到 ') && el('p', {}, [el('a', { href: 'lishi.html', text: '历史总览 →' })])
    ]);
  }

  if (!meta || !meta.ready) { fail(meta ? meta.name + '的内容还在整理，核对完成后会上线。' : '没有找到这个朝代。'); return; }

  /* ---------- 加载数据，再画页面 ---------- */
  var s = document.createElement('script');
  s.src = 'data/lishi-' + meta.key + '.js';
  s.onload = function () {
    var D = window.ZHIFOU_LISHI && window.ZHIFOU_LISHI[meta.key];
    if (D) render(D); else fail('数据读取失败，请刷新再试。');
  };
  s.onerror = function () { fail('数据读取失败，请刷新再试。'); };
  document.head.appendChild(s);

  function render(D) {
    var ov = {};
    D.overview.forEach(function (o) { ov[o.k] = o; });

    /* 页头 */
    var lead = ['国祚', '都城', '开国者', '亡国者'].filter(function (k) { return ov[k]; }).map(function (k) { return k + '：' + cut(String(ov[k].v).split(/[；。]/)[0], 24); }).join('　');
    var head = el('header', { 'class': 'zy-head' }, [
      el('div', { 'class': 'zy-eyebrow', text: '历史 · ' + meta.group }),
      el('h1', { 'class': 'zy-hook', text: D.name + '　' + meta.range }),
      el('p', { 'class': 'zy-answer', text: (ov['一句话'] && ov['一句话'].v) || meta.blurb }),
      lead ? el('p', { 'class': 'zy-lead', text: lead }) : null
    ]);

    /* ----- 概况 ----- */
    function buildOverview() {
      var pairs = D.overview.filter(function (o) { return ['一句话', '出处'].indexOf(o.k) < 0; }).map(function (o) { return [o.k, span(o.v)]; });
      var src = ov['出处'];
      var kids = [Z.kv(pairs)];
      if (D.grade) kids.push(el('p', { 'class': 'zy-note' }, ['整体把握程度：' + D.grade + '。', Z.LEGEND]));
      if (src && src.list && src.list.length) kids.push(Z.kv([['主要出处', el('p', { 'class': 'ss-srcs', text: src.list.join('　◆　') })]], { quote: [] }));
      return kids;
    }

    /* ----- 帝王 ----- */
    var keyCards = {};
    function buildEmperors() {
      var kids = [];
      var cards = D.keyEmperors.map(function (c) {
        var g = gradeEl(c.g);
        var node = Z.card({
          name: c.name, sub: cut(fieldOf(c, '在位'), 36), tag: c.g === '待核' ? '待核' : (c.g === '部分待核' ? '部分待核' : null),
          tagClass: c.g === '待核' ? 'is-check' : (c.g === '部分待核' ? 'is-check is-part' : null),
          body: [Z.kv(pairsOf(c.f), { quote: [] })]
        });
        keyCards[c.name] = node;
        Z.onOpen(c.name, function () { tabApi.show('emp', true); return node; });
        return node;
      });

      var rows = D.emperors.map(function (e) {
        var nameCell;
        if (keyCards[e.name]) {
          var a = el('a', { 'class': 'ss-jump', href: '#', text: e.name });
          a.addEventListener('click', function (ev) {
            ev.preventDefault();
            var n = keyCards[e.name];
            n.open = true;
            if (n.scrollIntoView) n.scrollIntoView({ block: 'center', behavior: 'smooth' });
          });
          nameCell = [a, el('i', { 'class': 'ss-star', title: '有详细介绍', text: '★' })];
        } else nameCell = [e.name];
        return el('tr', {}, [
          el('td', { 'class': 'is-name' }, nameCell),
          el('td', { 'class': 'is-nowrap', text: e.real }),
          el('td', { 'class': 'is-nowrap', text: e.reign }),
          el('td', { text: e.nh }),
          el('td', { text: e.mh }),
          el('td', {}, rich(e.line))
        ]);
      });
      var table = el('div', { 'class': 'ss-tablewrap' }, [el('table', { 'class': 'ss-table' }, [
        el('thead', {}, [el('tr', {}, ['通称', '姓名', '在位', '年号', '庙号／谥号', '一句话'].map(function (h) { return el('th', { text: h }); }))]),
        el('tbody', {}, rows)
      ])]);
      kids.push(Z.section('帝王名单（' + D.emperors.length + '）', [Z.note('带 ★ 的可点开，下面有详细介绍。'), table]));
      if (cards.length) kids.push(Z.section('重点帝王（' + cards.length + '）', [el('div', { 'class': 'zy-grid is-wide' }, cards)]));
      return kids;
    }

    /* ----- 大事记 ----- */
    function buildEvents() {
      var evs = D.events.slice();
      var list = el('ol', { 'class': 'ss-timeline' });
      var count = el('p', { 'class': 'zy-note', 'aria-live': 'polite' });
      var rowsAll = evs.map(function (e) {
        var li = el('li', { 'class': 'ss-tl-item' }, [
          el('span', { 'class': 'ss-tl-y', text: e.y }),
          el('div', { 'class': 'ss-tl-t' }, rich(e.t).concat([gradeEl(e.g)]).concat([e.s && e.s.length ? el('span', { 'class': 'ss-tl-s', text: '出处：' + e.s.join('　◆　') }) : null]))
        ]);
        li.setAttribute('data-q', e.y + e.t);
        list.appendChild(li);
        return li;
      });
      var box = el('input', { 'class': 'ss-search', type: 'search', placeholder: '在大事记里搜索：年份或关键词，如 前221、长城', 'aria-label': '搜索大事记' });
      function apply() {
        var q = box.value.trim(), n = 0;
        rowsAll.forEach(function (li) {
          var hit = !q || li.getAttribute('data-q').indexOf(q) >= 0;
          li.hidden = !hit;
          if (hit) n++;
        });
        count.textContent = q ? '找到 ' + n + ' 条。' : '共 ' + evs.length + ' 条，按时间先后排列。';
      }
      box.addEventListener('input', apply);
      apply();
      return [box, count, list];
    }

    /* ----- 人物 ----- */
    function buildPeople() {
      var cards = D.people.map(function (p) {
        var node = Z.card({
          name: p.name, sub: cut(fieldOf(p, '身份'), 40), tag: p.g === '待核' ? '待核' : (p.g === '部分待核' ? '部分待核' : null),
          tagClass: p.g === '待核' ? 'is-check' : (p.g === '部分待核' ? 'is-check is-part' : null),
          body: [Z.kv(pairsOf(p.f), { quote: [] })]
        });
        node.setAttribute('data-q', p.name + fieldOf(p, '身份'));
        Z.onOpen(p.name, function () { tabApi.show('people', true); return node; });
        return node;
      });
      var grid = el('div', { 'class': 'zy-grid is-wide' }, cards);
      var count = el('p', { 'class': 'zy-note', 'aria-live': 'polite' });
      var box = el('input', { 'class': 'ss-search', type: 'search', placeholder: '按姓名或身份搜索，如 丞相、将军', 'aria-label': '搜索人物' });
      function apply() {
        var q = box.value.trim(), n = 0;
        cards.forEach(function (c) {
          var hit = !q || c.getAttribute('data-q').indexOf(q) >= 0;
          c.hidden = !hit;
          if (hit) n++;
        });
        count.textContent = q ? '找到 ' + n + ' 位。' : '共 ' + cards.length + ' 位。点开一张看详情。';
      }
      box.addEventListener('input', apply);
      apply();
      return [box, count, grid];
    }

    /* ----- 制度 ----- */
    function buildSystems() {
      return D.systems.map(function (g) {
        return el('div', { 'class': 'ss-sys' }, [
          el('h3', { text: g.title }),
          ul(g.items.map(function (it) {
            return [it.l ? el('span', { 'class': 'ss-ly', text: it.l }) : null].concat(rich(it.t)).concat([
              it.s && it.s.length ? el('span', { 'class': 'ss-tl-s', text: '出处：' + it.s.join('　◆　') }) : null
            ]);
          }))
        ]);
      });
    }

    /* ----- 待核 ----- */
    function buildChecks() {
      var n = D.checks.filter(function (c) { return c.red; }).length;
      var kids = [Z.note('下面是整理时没有查实、或不同书记载有出入的地方（红色“待核”）。看史书时请把它们当作“有疑问”，不要当结论。共 ' + n + ' 条。')];
      D.checks.forEach(function (c) {
        kids.push(el('div', { 'class': 'ss-checkitem' }, [c.red ? el('em', { 'class': 'ss-check', text: '待核' }) : null].concat(rich(c.t)).concat([
          c.s && c.s.length ? el('span', { 'class': 'ss-tl-s', text: '出处：' + c.s.join('　◆　') }) : null
        ])));
      });
      return kids;
    }

    var nCheck = D.checks.filter(function (c) { return c.red; }).length;
    var defs = [
      { key: 'ov', label: '概况', build: buildOverview },
      { key: 'emp', label: '帝王（' + D.emperors.length + '）', build: buildEmperors },
      { key: 'ev', label: '大事记（' + D.events.length + '）', build: buildEvents },
      { key: 'people', label: '人物（' + D.people.length + '）', build: buildPeople },
      { key: 'sys', label: '制度', build: buildSystems },
      { key: 'check', label: '待核（' + nCheck + '）', build: buildChecks }
    ];
    var tabApi = { show: function () {} };
    var t = Z.tabs(defs.map(function (d) {
      return { key: d.key, label: d.label, build: function () { return d.build(); } };
    }));
    tabApi = t;

    Z.mount(root, [head, dynBar(), t.node, Z.note('每位帝王、每个人物卡片里都列了出处；年份用公历，公元前写作“前221”。')]);
    document.title = D.name + ' · 历史 · 知否知否';
    Z.openFromQuery();
  }
})();
