/* 知否知否 · 建筑 · 陵墓与墓葬（首页 lingmu.html）
   数据来自 data/lingmu-index.js（window.ZF_LM_INDEX，脚本生成），本文件只负责排版和交互。
   版面：页头 → 总览 → 四个专题（按年代 / 按阶级 / 按类型 / 习俗与考古，用标签切换）→ 名墓名单（可搜索）→ 说明。 */
(function () {
  'use strict';
  var L = window.LM, D = window.ZF_LM_INDEX, root = document.getElementById('app');
  if (!L || !D || !root) return;
  var el = L.el;

  function qs(n) { try { return new URLSearchParams(location.search).get(n); } catch (e) { return null; } }
  function setQs(n, v) {
    try { var u = new URL(location.href); if (v === null) u.searchParams.delete(n); else u.searchParams.set(n, v); history.replaceState(null, '', u.toString()); } catch (e) { /* 忽略 */ }
  }

  /* ---------- 专题 ---------- */
  function topicPanel(t) {
    var kids = [];
    if (t.intro && t.intro.length) kids.push(el('div', { 'class': 'wx-paper lm-intro' }, L.renderEls(t.intro)));
    t.blocks.forEach(function (b, i) {
      var d = el('details', { 'class': 'wx-paper lm-blk' }, [
        el('summary', { text: b.h }),
        el('div', { 'class': 'lm-blk-body' }, L.renderEls(b.els))
      ]);
      if (i === 0) d.open = true;
      kids.push(d);
    });
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
    return a;
  }

  function list() {
    var search = el('input', { 'class': 'lm-search', type: 'search', placeholder: '搜墓名、朝代或地点，如“汉”“西安”“玉衣”', 'aria-label': '搜索名墓' });
    var empty = el('p', { 'class': 'lm-empty', hidden: 'hidden', text: '没有找到匹配的墓。换个字试试。' });
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
    search.addEventListener('input', function () {
      var q = search.value.replace(/\s+/g, '');
      var any = false;
      groups.forEach(function (g) {
        var n = 0;
        g.cards.forEach(function (c) {
          var hit = !q || c._k.indexOf(q) >= 0;
          c.hidden = !hit;
          if (hit) n++;
        });
        g.node.hidden = n === 0;
        if (n) any = true;
      });
      empty.hidden = any;
    });
    var kids = [el('div', { 'class': 'wx-sec-title', text: '名墓名单 · 共 ' + D.count + ' 座，另有 3 处非墓葬' }), search];
    groups.forEach(function (g) { kids.push(g.node); });
    kids.push(empty);
    return el('div', { 'class': 'wx-section', id: 'list' }, kids);
  }

  /* ---------- 说明 ---------- */
  function notes() {
    var body = [
      el('p', {}, ['这一页的墓例、年代、规格和数字，取自本站为每座墓整理的笔记；各墓笔记里会写明数字的统计口径和不同说法。']),
      el('p', {}, ['年代、阶级、类型和习俗观念这四个专题里，通史性的叙述是整理时综合常见说法写成的，欢迎指正。']),
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
