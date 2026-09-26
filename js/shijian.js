/* 知否知否 · "物"·中国古代建筑（代表建筑时间线页）脚本
   数据来自 data/shijian.js（window.ZHIFOU_SHIJIAN），本文件只负责排版和交互。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_SHIJIAN;
  var root = document.getElementById('app');
  if (!D || !root) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (Array.isArray(kids) ? kids : (kids ? [kids] : [])).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function scrollToNode(n) {
    if (n && n.scrollIntoView) n.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }
  function section(label, title, kids) {
    return el('section', { 'class': 'wx-section', 'aria-label': label }, [el('div', { 'class': 'wx-sec-title', text: title })].concat(kids));
  }
  function lead(t) { return el('p', { 'class': 'wx-lead', text: t }); }

  var TYPE_COLOR = {
    '木构殿堂与寺观': '#b23a2e', '塔': '#c9a13b', '桥': '#5f8a9c', '石窟': '#8a6f3f',
    '宫殿坛庙园林': '#5a7d58', '陵墓与遗址': '#7d6a52', '城防': '#55606b', '文献': '#7b5ea7'
  };

  var B = D.buildings.items;
  var byName = {};
  B.forEach(function (b) { byName[b.name] = b; });

  /* 节点上显示的短年份：从"年代"里取出数字 */
  function shortYear(y) {
    var nums = (y.match(/\d{3,4}/g) || []);
    if (!nums.length) return '';
    return nums.length >= 2 ? nums[0] + '—' + nums[1] : nums[0];
  }

  /* ---------- 一、口径 ---------- */
  function buildScope() {
    var S = D.scope;
    return section('口径', '先说口径：比的是什么？', [
      lead(S.text),
      el('div', { 'class': 'sj-years' }, S.years.map(function (y, i) {
        return el('div', { 'class': 'sj-year wx-paper' }, [el('span', { 'class': 'sj-year-no', text: String(i + 1) }), el('span', { 'class': 'sj-year-name', text: y })]);
      })),
      el('p', { 'class': 'wx-hint', text: S.yearsText }),
      el('div', { 'class': 'wx-paper mg-box' }, [
        el('div', { 'class': 'wx-see-label lg-label', text: '比较古建筑时，可以这样问' }),
        el('ol', { 'class': 'lg-rules' }, S.methods.map(function (m) { return el('li', {}, [el('span', { text: m })]); }))
      ])
    ]);
  }

  /* ---------- 二、时间轴 ---------- */
  var current = null;
  var filter = '全部';
  var nodeBtns = {};
  var panel = null, strip = null, countEl = null;
  var typeBtns = {};

  function applyFilter(f) {
    filter = f;
    var n = 0;
    B.forEach(function (b) {
      var on = f === '全部' || b.type === f;
      nodeBtns[b.name].classList.toggle('is-dim', !on);
      if (on) n++;
    });
    Object.keys(typeBtns).forEach(function (k) { typeBtns[k].setAttribute('aria-pressed', k === f ? 'true' : 'false'); });
    countEl.textContent = f === '全部' ? '共 ' + n + ' 座' : f + '：' + n + ' 座';
  }

  function select(name, opts) {
    var b = byName[name];
    if (!b) return;
    opts = opts || {};
    current = name;
    Object.keys(nodeBtns).forEach(function (k) { nodeBtns[k].setAttribute('aria-pressed', k === name ? 'true' : 'false'); });
    var i = B.indexOf(b);
    var prev = B[i - 1], next = B[i + 1];

    panel.textContent = '';
    var tags = [el('span', { 'class': 'wx-tag is-bao', text: b.period }), el('span', { 'class': 'wx-tag', text: b.type })];
    panel.appendChild(el('div', { 'class': 'wx-kicker' }, tags));
    panel.appendChild(el('h3', { 'class': 'wx-title', text: b.name }));
    panel.appendChild(el('dl', { 'class': 'sj-meta' }, [
      el('div', {}, [el('dt', { text: '年代' }), el('dd', { text: b.year })]),
      el('div', {}, [el('dt', { text: '所在地' }), el('dd', { text: b.place })]),
      el('div', {}, [el('dt', { text: '看点' }), el('dd', { text: b.sight })])
    ]));
    panel.appendChild(el('p', { 'class': 'wx-line', text: b.text }));
    var pb = el('button', { type: 'button', 'class': 'wx-step-btn', text: prev ? '← ' + prev.name : '已是最早一座' });
    var nb = el('button', { type: 'button', 'class': 'wx-step-btn', text: next ? next.name + ' →' : '已是最晚一座' });
    if (prev) pb.addEventListener('click', function () { select(prev.name, { center: true }); }); else pb.disabled = true;
    if (next) nb.addEventListener('click', function () { select(next.name, { center: true }); }); else nb.disabled = true;
    panel.appendChild(el('div', { 'class': 'wx-stepper' }, [pb, nb]));

    if (opts.center) {
      var btn = nodeBtns[name];
      if (btn && btn.scrollIntoView) btn.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    }
    if (opts.push && window.history && history.replaceState) {
      try { history.replaceState(null, '', '?id=' + encodeURIComponent(name)); } catch (e) { /* 忽略 */ }
    }
    if (opts.scrollPanel) scrollToNode(panel);
  }

  function buildTimeline() {
    var chips = el('div', { 'class': 'wx-chips', role: 'group', 'aria-label': '按类型筛选' });
    ['全部'].concat(D.buildings.types).forEach(function (t) {
      var b = el('button', { type: 'button', 'class': 'wx-chip-w sj-type', 'aria-pressed': 'false' });
      if (TYPE_COLOR[t]) b.appendChild(el('span', { 'class': 'sj-dot', style: 'background:' + TYPE_COLOR[t] }));
      b.appendChild(document.createTextNode(t));
      b.addEventListener('click', function () { applyFilter(t); });
      typeBtns[t] = b;
      chips.appendChild(b);
    });
    countEl = el('span', { 'class': 'wx-count', 'aria-live': 'polite' });

    var track = el('div', { 'class': 'sj-track' });
    D.periods.items.forEach(function (p) {
      var col = el('div', { 'class': 'sj-col' }, [
        el('div', { 'class': 'sj-col-head' }, [el('div', { 'class': 'sj-col-name', text: p.name }), el('div', { 'class': 'sj-col-range', text: p.range })]),
        el('div', { 'class': 'sj-axis', 'aria-hidden': 'true' }, [el('span', { 'class': 'sj-axis-dot' })])
      ]);
      var nodes = el('div', { 'class': 'sj-nodes' });
      B.filter(function (b) { return b.period === p.name; }).forEach(function (b) {
        var y = shortYear(b.year);
        var pl = b.place.split('（')[0].split('，')[0];
        if (pl === '—') pl = '文献'; else if (pl.length > 10) pl = b.prov;
        var btn = el('button', { type: 'button', 'class': 'sj-node', 'aria-pressed': 'false' }, [
          el('span', { 'class': 'sj-node-name', text: b.name }),
          el('span', { 'class': 'sj-node-year', text: (y ? y + ' · ' : '') + pl })
        ]);
        btn.style.setProperty('--tc', TYPE_COLOR[b.type] || '#7d6a52');
        btn.addEventListener('click', function () { select(b.name, { push: true }); });
        nodeBtns[b.name] = btn;
        nodes.appendChild(btn);
      });
      col.appendChild(nodes);
      track.appendChild(col);
    });

    strip = el('div', { 'class': 'sj-strip', tabindex: '0', role: 'region', 'aria-label': '时间轴，可以左右滑动' }, [track]);
    function scrollBy(dx) { strip.scrollBy({ left: dx, behavior: reduceMotion ? 'auto' : 'smooth' }); }
    var left = el('button', { type: 'button', 'class': 'sj-arrow', 'aria-label': '往前（更早）', text: '◀' });
    var right = el('button', { type: 'button', 'class': 'sj-arrow', 'aria-label': '往后（更晚）', text: '▶' });
    left.addEventListener('click', function () { scrollBy(-360); });
    right.addEventListener('click', function () { scrollBy(360); });

    panel = el('div', { 'class': 'wx-paper mg-info sj-panel', 'aria-live': 'polite' });

    var sec = section('时间轴', '二十九座代表建筑，排成一条线', [
      lead(D.buildings.text),
      el('div', { 'class': 'wx-filter-row' }, [chips, countEl]),
      el('div', { 'class': 'sj-strip-wrap' }, [
        el('div', { 'class': 'sj-arrows' }, [left, el('span', { 'class': 'wx-hint', text: '左右滑动，或点两边的箭头' }), right]),
        strip
      ]),
      lead(D.periods.text),
      panel
    ]);
    applyFilter('全部');
    return sec;
  }

  /* ---------- 三、所在地 ---------- */
  function buildPlaces() {
    var groups = {}, order = [];
    B.forEach(function (b) {
      var p = b.prov;
      if (p === '—') return;
      if (p === '四川等') p = '四川';
      if (p === '多省区' || p === '多地') p = '多地';
      if (!groups[p]) { groups[p] = []; order.push(p); }
      groups[p].push(b);
    });
    order.sort(function (a, b) {
      if (a === '多地') return 1;
      if (b === '多地') return -1;
      return groups[b].length - groups[a].length;
    });
    var grid = el('div', { 'class': 'gd-cards' }, order.map(function (p) {
      return el('article', { 'class': 'gd-card wx-paper' }, [
        el('div', { 'class': 'wx-roof-top' }, [el('h3', { 'class': 'gd-card-name', text: p }), el('span', { 'class': 'wx-tag', text: groups[p].length + ' 座' })]),
        el('div', { 'class': 'wx-pills yl-pills sj-place-list' }, groups[p].map(function (b) {
          var c = el('button', { type: 'button', 'class': 'wx-pill sj-place-btn', text: b.name });
          c.style.borderLeft = '4px solid ' + (TYPE_COLOR[b.type] || '#7d6a52');
          c.addEventListener('click', function () { select(b.name, { push: true, center: true, scrollPanel: true }); });
          return c;
        }))
      ]);
    }));
    return section('所在地', '按所在地分一分', [lead(D.places.text), grid]);
  }

  function buildMyths() {
    var grid = el('div', { 'class': 'wx-myths' });
    D.myths.forEach(function (m) {
      grid.appendChild(el('article', { 'class': 'wx-myth wx-paper' }, [
        el('h3', { 'class': 'wx-myth-title', text: m.title }),
        el('p', { 'class': 'wx-myth-claim', text: '常见的说法：' + m.claim }),
        el('div', { 'class': 'wx-fields' }, [el('div', { 'class': 'is-note' }, [el('dt', { text: '怎么看' }), el('dd', { text: m.view })])])
      ]));
    });
    return section('五个常见的说法', '五个常见的说法', [grid]);
  }

  function notesBlock(summary, arr, mode) {
    return el('details', { 'class': 'wx-notes' }, [
      el('summary', { text: summary }),
      el('div', { 'class': 'wx-notes-body' }, arr.map(function (n) {
        var m = mode === 'long' ? n.match(/^(.+?)：(.*)$/) : n.match(/^([^：]{1,4})：(.*)$/);
        return el('p', {}, m ? [el('span', { 'class': 'wx-note-label', text: m[1] }), document.createTextNode(m[2])] : [document.createTextNode(n)]);
      }))
    ]);
  }

  function render() {
    var page = el('div', { 'class': 'wx-page' });
    page.appendChild(el('div', { 'class': 'wx-head' }, [
      el('div', { 'class': 'wx-eyebrow', text: '建筑 · 代表建筑时间线' }),
      el('h1', { 'class': 'wx-hook', text: D.hook }),
      el('p', { 'class': 'wx-answer', text: D.answer })
    ]));
    page.appendChild(lead(D.intro));
    page.appendChild(buildScope());
    page.appendChild(buildTimeline());
    page.appendChild(buildPlaces());
    page.appendChild(buildMyths());
    page.appendChild(notesBlock('主要出处', D.sources, 'long'));
    page.appendChild(el('div', { 'class': 'wx-tip' }, [el('div', { 'class': 'wx-tip-label', text: '小提示' }), el('p', { text: D.tip })]));
    page.appendChild(notesBlock('批注', D.notes, 'short'));
    root.textContent = '';
    root.appendChild(page);

    var wanted = '';
    try { wanted = decodeURIComponent((location.search.match(/[?&]id=([^&]+)/) || [])[1] || ''); } catch (e) { wanted = ''; }
    select(byName[wanted] ? wanted : '佛光寺东大殿', { center: !!byName[wanted] });
  }

  render();
})();
