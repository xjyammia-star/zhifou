/* 知否知否 · 建筑 · 陵墓与墓葬（首页 lingmu.html）
   数据来自 data/lingmu-index.js（window.ZF_LM_INDEX，脚本生成）和 data/lingmu-links.js（手写的站内链接），本文件只负责排版和交互。
   版面：页头 → 总览 → 四个专题（按年代 / 按阶级 / 按类型 / 习俗与考古，用标签切换；年代和阶级各有一张总表）→ 名墓名单（可按时期筛选、可搜索）→ 说明。 */
(function () {
  'use strict';
  var L = window.LM, D = window.ZF_LM_INDEX, LK = window.ZF_LM_LINKS || null, root = document.getElementById('app');
  if (!L || !D || !root) return;
  var el = L.el;

  function qs(n) { try { return new URLSearchParams(location.search).get(n); } catch (e) { return null; } }
  function setQs(n, v) {
    try { var u = new URL(location.href); if (v === null) u.searchParams.delete(n); else u.searchParams.set(n, v); history.replaceState(null, '', u.toString()); } catch (e) { /* 忽略 */ }
  }

  /* ---------- 时期（用来筛选名墓；按各墓的大致年代归类） ---------- */
  var ERAS = ['史前与商周', '春秋战国', '秦汉', '魏晋南北朝', '隋唐五代', '宋辽金元', '明清'];
  function eraOf(y) {
    if (y <= -771) return 0;
    if (y <= -222) return 1;
    if (y <= 219) return 2;
    if (y <= 580) return 3;
    if (y <= 960) return 4;
    if (y <= 1368) return 5;
    return 6;
  }

  /* ---------- 表格 ---------- */
  function findEl(b, label) {
    for (var i = 0; i < b.els.length; i++) if (b.els[i].l === label) return b.els[i].x;
    return '';
  }
  function table(heads, rows, cap) {
    var t = el('table', { 'class': 'lm-table' }, [
      el('thead', {}, [el('tr', {}, heads.map(function (h) { return el('th', { scope: 'col', text: h }); }))]),
      el('tbody', {}, rows.map(function (r) {
        return el('tr', {}, r.map(function (c, i) { return L.rich(el(i === 0 ? 'th' : 'td', i === 0 ? { scope: 'row' } : {}), c); }));
      }))
    ]);
    return el('div', { 'class': 'wx-paper lm-tablewrap' }, [cap ? el('p', { 'class': 'lm-tablecap', text: cap }) : null, el('div', { 'class': 'lm-tablescroll' }, [t])]);
  }
  function eraTable(t) {
    var rows = t.blocks.filter(function (b) { return findEl(b, '主流形制'); }).map(function (b) {
      return [b.h, findEl(b, '主流形制'), findEl(b, '重要变化'), findEl(b, '代表墓例')];
    });
    return table(['时期', '主流形制', '重要变化', '代表墓例'], rows, '历代墓葬总表（下面每个时期可以展开看详细说明）');
  }
  function classTable(t) {
    var rows = t.blocks.filter(function (b) { return findEl(b, '规格'); }).map(function (b) {
      return [b.h, findEl(b, '规格'), findEl(b, '代表') || findEl(b, '说明')];
    });
    return table(['等级', '规格', '代表墓例或说明'], rows, '各等级墓葬规格对照（下面每个等级可以展开看详细说明）');
  }

  /* ---------- 专题 ---------- */
  function linksBox(list) {
    return el('div', { 'class': 'wx-paper lm-intro' }, [
      el('p', { 'class': 'lm-lab', text: '本站其他页面里的相关内容' }),
      el('ul', { 'class': 'lm-ul' }, list.map(function (k) {
        return el('li', { 'class': 'lm-li' }, [el('a', { 'class': 'lm-xref', href: k.h, text: k.t }), document.createTextNode('：' + k.n)]);
      }))
    ]);
  }

  function topicPanel(t) {
    var kids = [];
    if (t.key === 'nian') kids.push(eraTable(t));
    if (t.key === 'jieji') kids.push(classTable(t));
    if (t.intro && t.intro.length) kids.push(el('div', { 'class': 'wx-paper lm-intro' }, L.renderEls(t.intro)));
    t.blocks.forEach(function (b, i) {
      var d = el('details', { 'class': 'wx-paper lm-blk' }, [
        el('summary', { text: b.h }),
        el('div', { 'class': 'lm-blk-body' }, L.renderEls(b.els))
      ]);
      if (i === 0 && (t.key === 'nian' || t.key === 'xisu' || t.key === 'leixing')) d.open = true;
      kids.push(d);
    });
    if (t.key === 'xisu' && LK && LK.topics && LK.topics.length) kids.push(linksBox(LK.topics));
    return kids;
  }

  function topics() {
    var bar = el('div', { 'class': 'lm-tabbar', role: 'tablist', 'aria-label': '四个专题' });
    var sub = el('p', { 'class': 'lm-tabsub' });
    var panel = el('div', { 'class': 'lm-panel', role: 'tabpanel' });
    var btns = [];
    function show(key, quiet) {
      var idx = 0;
      D.topics.forEach(function (t, i) { if (t.key === key) idx = i; });
      btns.forEach(function (b, i) { b.setAttribute('aria-selected', i === idx ? 'true' : 'false'); });
      var t = D.topics[idx];
      sub.textContent = t.label + ' · ' + t.sub;
      panel.textContent = '';
      topicPanel(t).forEach(function (k) { panel.appendChild(k); });
      if (!quiet) setQs('tab', t.key);
    }
    D.topics.forEach(function (t) {
      var b = el('button', { 'class': 'lm-tab', type: 'button', role: 'tab', 'aria-selected': 'false', text: t.label });
      b.addEventListener('click', function () { show(t.key); });
      btns.push(b); bar.appendChild(b);
    });
    var wrap = el('div', { 'class': 'wx-section', id: 'topics' }, [el('div', { 'class': 'wx-sec-title', text: '墓葬的习俗与传统' }), bar, sub, panel]);
    show(qs('tab') || D.topics[0].key, true);
    return wrap;
  }

  /* ---------- 名墓名单 ---------- */
  function card(t) {
    var top = t.cover
      ? el('div', { 'class': 'lm-card-img' }, [el('img', { src: L.imgUrl(D.base, t.cover, 480), alt: t.title, width: 480, height: Math.round(480 * t.cover.h / t.cover.w), loading: 'lazy', decoding: 'async' })])
      : el('div', { 'class': 'lm-card-noimg', 'aria-hidden': 'true', text: t.title.charAt(0) });
    var a = el('a', { 'class': 'wx-paper lm-card', href: 'lingmu-detail.html?id=' + encodeURIComponent(t.id), 'aria-label': t.title + '：' + t.line }, [
      top,
      el('div', { 'class': 'lm-card-body' }, [
        el('div', { 'class': 'lm-card-t', text: t.title }),
        el('div', { 'class': 'lm-card-m', text: t.dyn + ' · ' + t.place }),
        el('div', { 'class': 'lm-card-l', text: t.line })
      ])
    ]);
    a._k = (t.title + t.dyn + t.place + t.line).replace(/\s+/g, '');
    a._era = eraOf(t.y);
    return a;
  }

  function list() {
    var search = el('input', { 'class': 'lm-search', type: 'search', placeholder: '搜墓名、朝代或地点，如“汉”“西安”“玉衣”', 'aria-label': '搜索名墓' });
    var empty = el('p', { 'class': 'lm-empty', hidden: 'hidden', text: '没有找到匹配的墓。换个字试试，或者选“全部时期”。' });
    var era = -1;
    var chipBtns = [];
    var chipBar = el('div', { 'class': 'lm-chips lm-erachips', role: 'group', 'aria-label': '按时期筛选' });
    var groups = D.groups.map(function (g) {
      var cards = g.tombs.map(card);
      var node = el('section', { 'class': 'lm-group', 'aria-label': g.name }, [
        el('div', { 'class': 'lm-gh' }, [
          el('h2', { 'class': 'lm-gname', text: g.name }),
          el('p', { 'class': 'lm-gline', text: g.line })
        ]),
        el('div', { 'class': 'lm-grid' }, cards)
      ]);
      return { node: node, cards: cards };
    });
    function apply() {
      var q = search.value.replace(/\s+/g, '');
      var any = false;
      groups.forEach(function (g) {
        var n = 0;
        g.cards.forEach(function (c) {
          var hit = (!q || c._k.indexOf(q) >= 0) && (era < 0 || c._era === era);
          c.hidden = !hit;
          if (hit) n++;
        });
        g.node.hidden = n === 0;
        if (n) any = true;
      });
      empty.hidden = any;
    }
    ['全部时期'].concat(ERAS).forEach(function (name, i) {
      var b = el('button', { 'class': 'lm-erachip', type: 'button', 'aria-pressed': i === 0 ? 'true' : 'false', text: name });
      b.addEventListener('click', function () {
        era = i - 1;
        chipBtns.forEach(function (x, j) { x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
        apply();
      });
      chipBtns.push(b); chipBar.appendChild(b);
    });
    search.addEventListener('input', apply);
    var kids = [el('div', { 'class': 'wx-sec-title', text: '名墓名单 · 共 ' + D.count + ' 座，另有 3 处非墓葬' }), chipBar, search];
    groups.forEach(function (g) { kids.push(g.node); });
    kids.push(empty);
    return el('div', { 'class': 'wx-section', id: 'list' }, kids);
  }

  /* ---------- 说明 ---------- */
  function notes() {
    var body = [
      el('p', {}, ['这一页的墓例、年代、规格和数字，取自本站为每座墓整理的笔记；各墓笔记里会写明数字的统计口径和不同说法。']),
      el('p', {}, ['年代、阶级、类型和习俗观念这四个专题里，通史性的叙述是整理时综合常见说法写成的，欢迎指正。']),
      el('p', {}, ['名单上的“时期”是按各墓的大致年代归的类，跨时期的墓（如孔林、殷墟）只归在起始的那一类。']),
      el('p', {}, ['本站只讲制度、考古发现和文化观念，不讲盗墓的手法，也不渲染灵异传闻；流传很广的传闻，会放在各墓详页的“常见误区”里辨析。']),
      el('p', {}, ['页面里的照片来自维基共享资源，每张图下面都标注了作者、授权协议和来源链接。'])
    ];
    if (D.doubts && D.doubts.length) {
      body.push(el('p', { 'class': 'lm-lab', text: '专题部分尚待核对的地方' }));
      body.push(el('ul', { 'class': 'lm-ul' }, D.doubts.map(function (t) { return el('li', { 'class': 'lm-li', text: t }); })));
    }
    return el('details', { 'class': 'wx-notes' }, [el('summary', { text: '说明' }), el('div', { 'class': 'wx-notes-body' }, body)]);
  }

  /* ---------- 组装 ---------- */
  var page = el('div', { 'class': 'wx-page lm-page' });
  page.appendChild(el('div', { 'class': 'wx-head' }, [
    el('div', { 'class': 'wx-eyebrow', text: '建筑 · 陵墓与墓葬' }),
    el('h1', { 'class': 'wx-hook', text: D.hook }),
    el('p', { 'class': 'wx-answer', text: D.answer })
  ]));
  page.appendChild(el('p', { 'class': 'wx-lead', text: D.intro }));
  page.appendChild(el('section', { 'class': 'wx-section', 'aria-label': '总览' }, [
    el('div', { 'class': 'wx-sec-title', text: '总览' }),
    el('div', { 'class': 'wx-paper lm-paper' }, D.overview.map(function (t) { return L.rich(el('p', { 'class': 'lm-p' }), t); }))
  ]));
  page.appendChild(topics());
  page.appendChild(list());
  page.appendChild(notes());

  root.textContent = '';
  root.appendChild(page);
  document.title = '陵墓与墓葬 · 建筑 · 知否知否';
})();
