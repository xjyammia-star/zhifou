/* 知否知否 · 历史 · 朝代页（通用）
   用法：lishi-chaodai.html?d=qin  （d 是朝代代号，见 data/lishi-index.js）
   数据：data/lishi-<代号>.js（由 工具脚本/生成历史数据.py 自动生成），按需加载，不一次全读；
         data/lishi-names.js 是“人名 → 在哪个朝代、哪张卡片”的对照表，用来把文中提到的人物连起来。
   点帝王或人物，弹出一个居中的小窗口显示介绍（和唐诗、宋词一样）；窗口里提到的其他人物也能点开，并有“返回”。
   排版工具：js/zycommon.js */
(function () {
  'use strict';
  var I = window.ZHIFOU_LISHI_INDEX, Z = window.ZY;
  var NAMES = window.ZHIFOU_LISHI_NAMES || {};
  var root = document.getElementById('app');
  if (!I || !Z || !root) return;
  var el = Z.el;

  var readyList = I.dynasties.filter(function (d) { return d.ready; });
  var key = Z.qs('d') || (readyList[0] && readyList[0].key);
  var meta = null;
  I.dynasties.forEach(function (d) { if (d.key === key) meta = d; });
  var dynName = {};
  I.dynasties.forEach(function (d) { dynName[d.key] = d.name; });

  /* ---------- 小工具 ---------- */
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var nameRe = null;
  (function () {
    var ks = Object.keys(NAMES).filter(function (k) { return k.length >= 2; }).sort(function (a, b) { return b.length - a.length; });
    if (ks.length) nameRe = new RegExp(ks.map(esc).join('|'), 'g');
  })();

  var openEntity = function () {};   /* 后面再定义：打开一张人物/帝王卡 */

  /* 一段纯文字里，把人名变成可点的链接。ctx = { d: 当前朝代, skip: {不用连的名字}, used: {已经连过的名字} } */
  function linkify(text, ctx) {
    if (!text) return [];
    if (!nameRe || !ctx) return [text];
    var out = [], last = 0, m;
    nameRe.lastIndex = 0;
    while ((m = nameRe.exec(text))) {
      var nm = m[0];
      if (ctx.skip[nm] || ctx.used[nm]) continue;
      var cand = NAMES[nm] || [], pick = null;
      cand.forEach(function (c) { if (!pick && c[0] === ctx.d) pick = c; });
      if (!pick) pick = cand[0];
      if (!pick) continue;
      if (m.index > last) out.push(text.slice(last, m.index));
      var a = el('a', { 'class': 'ss-ref', href: '#', 'data-d': pick[0], 'data-n': pick[1], title: '看看' + nm + '的介绍', text: nm });
      out.push(a);
      ctx.used[nm] = 1;
      last = m.index + nm.length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }

  /* 文字 → 节点：“〔待核〕”换成红色小标记，人名连成链接 */
  function rich(t, ctx) {
    var out = [];
    String(t || '').split(/(〔[^〕]*待核[^〕]*〕)/).forEach(function (p) {
      if (!p) return;
      if (/^〔[^〕]*待核[^〕]*〕$/.test(p)) out.push(el('em', { 'class': 'ss-check', text: '待核' }));
      else linkify(p, ctx).forEach(function (n) { out.push(n); });
    });
    return out;
  }
  function gradeEl(g) {
    if (g === '待核') return el('em', { 'class': 'ss-check', text: '待核' });
    if (g === '部分待核') return el('em', { 'class': 'ss-check is-part', text: '部分待核' });
    return null;
  }
  function newCtx(d, selfNames) {
    var skip = {};
    (selfNames || []).forEach(function (n) { skip[n] = 1; });
    return { d: d, skip: skip, used: {} };
  }
  function span(t, ctx) { return el('span', {}, rich(t, ctx)); }
  function ul(items) {
    return el('ul', { 'class': 'ss-list' }, items.map(function (x) { return el('li', {}, x); }));
  }
  function cut(s, n) { s = s || ''; return s.length > n ? s.slice(0, n) + '…' : s; }
  function fieldOf(card, k) {
    for (var i = 0; i < card.f.length; i++) if (card.f[i].k === k) return card.f[i].v || '';
    return '';
  }

  /* 加载某个朝代的数据（已经读过的不再读） */
  function ensureData(dKey, cb) {
    var all = window.ZHIFOU_LISHI || {};
    if (all[dKey]) { cb(all[dKey]); return; }
    var ok = false;
    I.dynasties.forEach(function (d) { if (d.key === dKey && d.ready) ok = true; });
    if (!ok) return;
    var s = document.createElement('script');
    s.src = 'data/lishi-' + dKey + '.js';
    s.onload = function () { var a = window.ZHIFOU_LISHI || {}; if (a[dKey]) cb(a[dKey]); };
    document.head.appendChild(s);
  }
  function findCard(D, name) {
    var i;
    for (i = 0; i < D.keyEmperors.length; i++) if (D.keyEmperors[i].name === name) return { card: D.keyEmperors[i], kind: '帝王' };
    for (i = 0; i < D.people.length; i++) if (D.people[i].name === name) return { card: D.people[i], kind: '人物' };
    return null;
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
      el('p', {}, [el('a', { href: 'lishi.html', text: '回到历史总览 →' })])
    ]);
  }

  if (!meta || !meta.ready) { fail(meta ? meta.name + '的内容还在整理，核对完成后会上线。' : '没有找到这个朝代。'); return; }

  ensureData(meta.key, function (D) { render(D); });
  setTimeout(function () { if (!(window.ZHIFOU_LISHI && window.ZHIFOU_LISHI[meta.key]) && !document.querySelector('.zy-page')) fail('数据读取失败，请刷新再试。'); }, 8000);

  /* ---------- 弹窗 ---------- */
  var modal = null, stack = [], curEnt = null, lastFocus = null;

  function setQs(id) {
    try {
      var u = new URL(location.href);
      if (id) u.searchParams.set('id', id); else u.searchParams.delete('id');
      history.replaceState(null, '', u.toString());
    } catch (e) { /* 忽略 */ }
  }

  function buildModal() {
    var back = el('button', { 'class': 'ss-modal-back', type: 'button', text: '← 返回' });
    var closeBtn = el('button', { 'class': 'ss-modal-close', type: 'button', 'aria-label': '关闭' }, [el('span', { 'aria-hidden': 'true', text: '×' })]);
    var tag = el('div', { 'class': 'ss-modal-tag' });
    var title = el('h3', { 'class': 'ss-modal-title' });
    var facts = el('div', { 'class': 'ss-modal-facts' });
    var body = el('div', { 'class': 'ss-modal-body' });
    var card = el('div', { 'class': 'ss-modal-card', role: 'dialog', 'aria-modal': 'true', 'aria-label': '详细介绍' }, [back, closeBtn, tag, title, facts, body]);
    var overlay = el('div', { 'class': 'ss-modal-overlay', 'aria-hidden': 'true' }, [card]);
    document.body.appendChild(overlay);

    function close() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('ss-noscroll');
      stack = []; curEnt = null;
      setQs(null);
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* 忽略 */ } }
    }
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    closeBtn.addEventListener('click', close);
    back.addEventListener('click', function () {
      var prev = stack.pop();
      if (prev) openEntity(prev.d, prev.name, false);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });
    /* 窗口里的人名链接 */
    body.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a.ss-ref') : null;
      if (!a) return;
      e.preventDefault();
      openEntity(a.getAttribute('data-d'), a.getAttribute('data-n'), true);
    });
    return { overlay: overlay, card: card, back: back, tag: tag, title: title, facts: facts, body: body, closeBtn: closeBtn };
  }

  function fillModal(D, hit) {
    var c = hit.card;
    var selfNames = [c.name];
    var row = null;
    D.emperors.forEach(function (e) { if (e.name === c.name) row = e; });
    if (row && row.real) selfNames.push(row.real);
    var ctx = newCtx(D.key, selfNames);

    modal.tag.textContent = (dynName[D.key] || D.name) + ' · ' + hit.kind;
    modal.title.textContent = c.name;
    modal.facts.textContent = '';
    if (row) {
      [['姓名', row.real], ['在位', row.reign], ['年号', row.nh], ['庙号／谥号', row.mh]].forEach(function (p) {
        if (p[1]) modal.facts.appendChild(el('span', { 'class': 'ss-fact' }, [el('b', { text: p[0] }), p[1]]));
      });
    }
    var g = gradeEl(c.g);
    if (g) modal.facts.appendChild(g);

    var pairs = [], srcPair = null;
    c.f.forEach(function (f) {
      ctx = newCtx(D.key, selfNames);   /* 每个栏目各算各的：同一个人在不同栏目里都能点 */
      if (f.k === '出处') {
        if (f.list && f.list.length) srcPair = ['出处', el('p', { 'class': 'ss-srcs', text: f.list.join('　◆　') + (f.v ? '　' + f.v : '') })];
        return;
      }
      if (f.items) {
        pairs.push([f.k, ul(f.items.map(function (it) {
          if (it.ev) return [el('span', { 'class': 'ss-ly' }, rich(it.ev.y))].concat(rich(it.ev.t, ctx)).concat([gradeEl(it.ev.g)]);
          return rich(it.t, ctx);
        }))]);
      } else {
        pairs.push([f.k, span(f.v, ctx)]);
      }
    });
    if (srcPair) pairs.push(srcPair);
    modal.body.textContent = '';
    modal.body.appendChild(Z.kv(pairs, { quote: [] }));
    modal.back.hidden = !stack.length;
    modal.card.scrollTop = 0;
  }

  openEntity = function (dKey, name, push) {
    ensureData(dKey, function (D) {
      var hit = findCard(D, name);
      if (!hit) return;
      if (!modal) modal = buildModal();
      if (!modal.overlay.classList.contains('is-open')) lastFocus = document.activeElement;
      if (push && curEnt) stack.push(curEnt);
      curEnt = { d: dKey, name: name };
      fillModal(D, hit);
      modal.overlay.classList.add('is-open');
      modal.overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('ss-noscroll');
      setQs(dKey === key ? name : null);
      if (modal.closeBtn && modal.closeBtn.focus) { try { modal.closeBtn.focus({ preventScroll: true }); } catch (e) { /* 忽略 */ } }
    });
  };

  /* ---------- 页面 ---------- */
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

    /* 一张小卡片：点它弹出介绍 */
    function tile(c, line1, line2) {
      var b = el('button', { 'class': 'ss-tile', type: 'button', 'aria-label': '查看' + c.name + '的介绍' }, [
        el('span', { 'class': 'ss-tile-name', text: c.name }),
        line1 ? el('span', { 'class': 'ss-tile-l1', text: cut(line1, 28) }) : null,
        line2 ? el('span', { 'class': 'ss-tile-l2', text: line2 }) : null,
        c.g === '待核' || c.g === '部分待核' ? el('span', { 'class': 'ss-tile-flag' }, [gradeEl(c.g)]) : null
      ]);
      b.setAttribute('data-q', c.name + (line1 || '') + (line2 || ''));
      b.addEventListener('click', function () { openEntity(D.key, c.name, false); });
      return b;
    }

    /* ----- 概况 ----- */
    function buildOverview() {
      var ctx = newCtx(D.key, []);
      var pairs = D.overview.filter(function (o) { return ['一句话', '出处'].indexOf(o.k) < 0; }).map(function (o) { return [o.k, span(o.v, ctx)]; });
      var src = ov['出处'];
      var box = el('div', {}, [Z.kv(pairs)]);
      box.addEventListener('click', function (ev) {
        var a = ev.target && ev.target.closest ? ev.target.closest('a.ss-ref') : null;
        if (!a) return;
        ev.preventDefault();
        openEntity(a.getAttribute('data-d'), a.getAttribute('data-n'), false);
      });
      var kids = [box];
      if (D.grade) kids.push(el('p', { 'class': 'zy-note' }, ['整体把握程度：' + D.grade + '。', Z.LEGEND]));
      if (src && src.list && src.list.length) kids.push(Z.kv([['主要出处', el('p', { 'class': 'ss-srcs', text: src.list.join('　◆　') })]], { quote: [] }));
      return kids;
    }

    /* ----- 帝王 ----- */
    function buildEmperors() {
      var kids = [];
      var keyNames = {};
      D.keyEmperors.forEach(function (c) { keyNames[c.name] = c; });
      var rows = D.emperors.map(function (e) {
        var nameCell;
        if (keyNames[e.name]) {
          var a = el('a', { 'class': 'ss-jump', href: '#', text: e.name });
          a.addEventListener('click', function (ev) { ev.preventDefault(); openEntity(D.key, e.name, false); });
          nameCell = [a, el('i', { 'class': 'ss-star', title: '点开看详细介绍', text: '★' })];
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
      kids.push(Z.section('帝王名单（' + D.emperors.length + '）', [Z.note('带 ★ 的帝王，点名字可以看详细介绍。'), table]));
      if (D.keyEmperors.length) {
        kids.push(Z.section('重点帝王（' + D.keyEmperors.length + '）', [
          Z.note('点一张看详细介绍：简介、主要功绩、重大事件、争议与评价和出处。'),
          el('div', { 'class': 'ss-tiles' }, D.keyEmperors.map(function (c) { return tile(c, fieldOf(c, '在位'), ''); }))
        ]));
      }
      return kids;
    }

    /* ----- 大事记 ----- */
    function buildEvents() {
      var evs = D.events.slice();
      var list = el('ol', { 'class': 'ss-timeline' });
      var count = el('p', { 'class': 'zy-note', 'aria-live': 'polite' });
      var rowsAll = evs.map(function (e) {
        var ctx = newCtx(D.key, []);
        var li = el('li', { 'class': 'ss-tl-item' }, [
          el('span', { 'class': 'ss-tl-y' }, rich(e.y)),
          el('div', { 'class': 'ss-tl-t' }, rich(e.t, ctx).concat([gradeEl(e.g)]).concat([e.s && e.s.length ? el('span', { 'class': 'ss-tl-s', text: '出处：' + e.s.join('　◆　') }) : null]))
        ]);
        li.setAttribute('data-q', e.y + e.t);
        list.appendChild(li);
        return li;
      });
      list.addEventListener('click', function (ev) {
        var a = ev.target && ev.target.closest ? ev.target.closest('a.ss-ref') : null;
        if (!a) return;
        ev.preventDefault();
        openEntity(a.getAttribute('data-d'), a.getAttribute('data-n'), false);
      });
      var box = el('input', { 'class': 'ss-search', type: 'search', placeholder: '在大事记里搜索：年份或关键词，如 前221、长城', 'aria-label': '搜索大事记' });
      function apply() {
        var q = box.value.trim(), n = 0;
        rowsAll.forEach(function (li) {
          var hit = !q || li.getAttribute('data-q').indexOf(q) >= 0;
          li.hidden = !hit;
          if (hit) n++;
        });
        count.textContent = q ? '找到 ' + n + ' 条。' : '共 ' + evs.length + ' 条，按时间先后排列；文中带下划线的人名可以点开看介绍。';
      }
      box.addEventListener('input', apply);
      apply();
      return [box, count, list];
    }

    /* ----- 人物 ----- */
    function buildPeople() {
      var tiles = D.people.map(function (p) { return tile(p, fieldOf(p, '生卒'), cut(fieldOf(p, '身份'), 30)); });
      var grid = el('div', { 'class': 'ss-tiles' }, tiles);
      var count = el('p', { 'class': 'zy-note', 'aria-live': 'polite' });
      var box = el('input', { 'class': 'ss-search', type: 'search', placeholder: '按姓名或身份搜索，如 丞相、将军', 'aria-label': '搜索人物' });
      function apply() {
        var q = box.value.trim(), n = 0;
        tiles.forEach(function (c) {
          var hit = !q || c.getAttribute('data-q').indexOf(q) >= 0;
          c.hidden = !hit;
          if (hit) n++;
        });
        count.textContent = q ? '找到 ' + n + ' 位。' : '共 ' + tiles.length + ' 位。点一张看生平、事迹和出处。';
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
            return [it.l ? el('span', { 'class': 'ss-ly', text: it.l }) : null].concat(rich(it.t)).concat([gradeEl(it.g),
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
    var t = Z.tabs(defs.map(function (d) {
      return { key: d.key, label: d.label, build: function () { return d.build(); } };
    }));

    Z.mount(root, [head, dynBar(), t.node, Z.note('每位帝王、每个人物的详细介绍里都列了出处；年份用公历，公元前写作“前221”。')]);
    document.title = D.name + ' · 历史 · 知否知否';

    /* 网址里带 ?id=名字：直接打开那一张 */
    var id = Z.qs('id');
    if (id) {
      var hit = findCard(D, id);
      if (hit) { t.show(hit.kind === '帝王' ? 'emp' : 'people', true); openEntity(D.key, id, false); }
    }
  }
})();
