/* 知否知否 · "物"·文房四宝（典故与演变页）脚本
   数据来自 data/wenfang-diangu.js（window.ZHIFOU_WENFANGDG），本文件只负责排版和交互。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_WENFANGDG;
  var root = document.getElementById('app');
  if (!D || !root) return;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (Array.isArray(kids) ? kids : (kids ? [kids] : [])).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  /* 把 **粗体** 变成加粗的文字 */
  function rich(text) {
    var frag = document.createDocumentFragment();
    String(text).split(/(\*\*[^*]+\*\*)/).forEach(function (part) {
      if (!part) return;
      var m = part.match(/^\*\*([^*]+)\*\*$/);
      if (m) frag.appendChild(el('strong', { text: m[1] }));
      else frag.appendChild(document.createTextNode(part));
    });
    return frag;
  }

  function fieldList(fields) {
    var dl = el('dl', { 'class': 'wx-fields' });
    fields.forEach(function (f) {
      var dd = el('dd');
      dd.appendChild(rich(f[1]));
      dl.appendChild(el('div', { 'class': f[0] === '怎么看' ? 'is-note' : '' }, [el('dt', { text: f[0] }), dd]));
    });
    return dl;
  }

  /* ---------- 一、书写材料的演变 ---------- */
  var ART = {
    '竹简与木牍': '<svg viewBox="0 0 120 60" role="img" aria-label="用绳编联的一排竹简">' +
      '<g fill="#c9a56b" stroke="#8a6f3f" stroke-width="1.5"><rect x="14" y="6" width="14" height="48" rx="2"/><rect x="32" y="6" width="14" height="48" rx="2"/><rect x="50" y="6" width="14" height="48" rx="2"/><rect x="68" y="6" width="14" height="48" rx="2"/><rect x="86" y="6" width="14" height="48" rx="2"/></g>' +
      '<path d="M10 19 H104 M10 42 H104" stroke="#6d4d34" stroke-width="3" stroke-linecap="round"/></svg>',
    '帛书': '<svg viewBox="0 0 120 60" role="img" aria-label="一卷丝帛">' +
      '<rect x="26" y="10" width="76" height="40" rx="5" fill="#ead9a8" stroke="#b39a5c" stroke-width="1.5"/>' +
      '<path d="M40 22 H92 M40 30 H92 M40 38 H80" stroke="#b23a2e" stroke-width="1.2" opacity="0.55"/>' +
      '<circle cx="26" cy="30" r="20" fill="#e0cb8f" stroke="#b39a5c" stroke-width="1.5"/><circle cx="26" cy="30" r="11" fill="none" stroke="#b39a5c" stroke-width="1.5"/><circle cx="26" cy="30" r="4" fill="#b39a5c"/></svg>',
    '纸': '<svg viewBox="0 0 120 60" role="img" aria-label="一张纸">' +
      '<path d="M36 6 H76 L88 18 V54 H36 Z" fill="#f6eedb" stroke="#cdbf9f" stroke-width="1.5" stroke-linejoin="round"/><path d="M76 6 V18 H88" fill="#e6d9bd" stroke="#cdbf9f" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M46 28 H78 M46 36 H78 M46 44 H68" stroke="#2b2118" stroke-width="2.5" stroke-linecap="round" opacity="0.65"/></svg>'
  };

  function buildStages() {
    var grid = el('div', { 'class': 'wx-stages' });
    D.stages.items.forEach(function (s) {
      var art = el('div', { 'class': 'wx-stage-art', 'aria-hidden': 'true' });
      art.innerHTML = ART[s.name] || '';
      grid.appendChild(el('article', { 'class': 'wx-stage wx-paper' }, [
        art,
        el('div', { 'class': 'wx-stage-body' }, [el('h3', { 'class': 'wx-stage-name', text: s.name }), fieldList(s.fields)])
      ]));
    });
    return el('section', { 'class': 'wx-section', 'aria-label': '书写材料的演变' }, [
      el('div', { 'class': 'wx-sec-title', text: '书写材料的演变' }),
      el('p', { 'class': 'wx-lead', text: D.stages.text }),
      grid
    ]);
  }

  /* ---------- 二、十二个典故 ---------- */
  var KIND_CLASS = { '史载': 'is-fact', '传说': 'is-legend' };
  var current = '全部';
  var cards = [];
  var chipBtns = {};
  var countEl = null;

  function applyFilter(f) {
    current = f;
    var n = 0;
    cards.forEach(function (c) {
      var show = f === '全部' || c.story.cat === f;
      c.node.hidden = !show;
      if (show) n++;
    });
    Object.keys(chipBtns).forEach(function (k) { chipBtns[k].setAttribute('aria-pressed', k === f ? 'true' : 'false'); });
    if (countEl) countEl.textContent = f === '全部' ? '共 ' + n + ' 个' : f + '：' + n + ' 个';
  }

  function buildStory(s) {
    var summary = el('summary', {}, [
      el('span', { 'class': 'wx-story-top' }, [
        el('span', { 'class': 'wx-story-name', text: s.name }),
        el('span', { 'class': 'wx-kind ' + (KIND_CLASS[s.kind] || ''), text: s.kind })
      ]),
      el('span', { 'class': 'wx-story-meaning', text: s.meaning })
    ]);

    var fields = [['故事', s.story], ['怎么看', s.view]];
    if (s.source) fields.push(['出处', s.source]);
    var body = el('div', { 'class': 'wx-story-body' }, [fieldList(fields)]);
    if (s.rel && s.rel.length) body.appendChild(el('p', { 'class': 'wx-rel', text: '关联：' + s.rel.join('、') }));
    if (s.see && s.see.length) {
      var see = el('div', { 'class': 'wx-see' });
      s.see.forEach(function (n) {
        see.appendChild(el('a', { 'class': 'wx-chip', href: 'wenfang.html?id=' + encodeURIComponent(n), text: '在书案上看：' + n }));
      });
      body.appendChild(see);
    }
    var d = el('details', { 'class': 'wx-story wx-paper', id: 'story-' + cards.length }, [summary, body]);
    cards.push({ story: s, node: d });
    return d;
  }

  function buildStories() {
    var bar = el('div', { 'class': 'wx-chips', role: 'group', 'aria-label': '按器物筛选典故' });
    ['全部'].concat(D.stories.filters).forEach(function (f) {
      var b = el('button', { type: 'button', 'class': 'wx-chip-w', 'aria-pressed': 'false', text: f });
      b.addEventListener('click', function () { applyFilter(f); });
      chipBtns[f] = b;
      bar.appendChild(b);
    });
    countEl = el('span', { 'class': 'wx-count', 'aria-live': 'polite' });
    var grid = el('div', { 'class': 'wx-stories' }, D.stories.items.map(buildStory));
    return el('section', { 'class': 'wx-section', 'aria-label': '十二个典故' }, [
      el('div', { 'class': 'wx-sec-title', text: '十二个典故' }),
      el('p', { 'class': 'wx-lead', text: D.stories.text }),
      el('div', { 'class': 'wx-filter-row' }, [bar, countEl]),
      grid
    ]);
  }

  /* ---------- 三、名品 ---------- */
  function buildFame() {
    var grid = el('div', { 'class': 'wx-fame' });
    D.fame.groups.forEach(function (g) {
      var col = el('div', { 'class': 'wx-fame-col wx-paper' }, [el('div', { 'class': 'wx-fame-head', text: g.item })]);
      g.entries.forEach(function (e) {
        col.appendChild(el('div', { 'class': 'wx-fame-entry' }, [
          el('div', { 'class': 'wx-fame-name', text: e.name }),
          e.place ? el('div', { 'class': 'wx-fame-place', text: e.place }) : null,
          el('p', { 'class': 'wx-fame-text', text: e.text })
        ]));
      });
      grid.appendChild(col);
    });
    return el('section', { 'class': 'wx-section', 'aria-label': '名笔、名墨、名纸、名砚' }, [
      el('div', { 'class': 'wx-sec-title', text: '名笔、名墨、名纸、名砚' }),
      el('p', { 'class': 'wx-lead', text: D.fame.text }),
      grid
    ]);
  }

  /* ---------- 页面 ---------- */
  function render() {
    var page = el('div', { 'class': 'wx-page' });
    page.appendChild(el('div', { 'class': 'wx-head' }, [
      el('div', { 'class': 'wx-eyebrow', text: '物 · 文房四宝 · 典故与演变' }),
      el('h1', { 'class': 'wx-hook', text: D.hook }),
      el('p', { 'class': 'wx-answer', text: D.answer })
    ]));
    page.appendChild(el('p', { 'class': 'wx-lead', text: D.intro }));
    page.appendChild(buildStages());
    page.appendChild(buildStories());
    page.appendChild(buildFame());

    page.appendChild(el('details', { 'class': 'wx-notes' }, [
      el('summary', { text: '主要出处' }),
      el('div', { 'class': 'wx-notes-body' }, D.sources.map(function (s) {
        var m = s.match(/^(.+?)：(.*)$/);
        return el('p', {}, m ? [el('span', { 'class': 'wx-note-label', text: m[1] }), document.createTextNode(m[2])] : [document.createTextNode(s)]);
      }))
    ]));
    page.appendChild(el('div', { 'class': 'wx-tip' }, [el('div', { 'class': 'wx-tip-label', text: '小提示' }), el('p', { text: D.tip })]));
    page.appendChild(el('details', { 'class': 'wx-notes' }, [
      el('summary', { text: '批注' }),
      el('div', { 'class': 'wx-notes-body' }, D.notes.map(function (n) {
        var m = n.match(/^([^：]{1,4})：(.*)$/);
        return el('p', {}, m ? [el('span', { 'class': 'wx-note-label', text: m[1] }), document.createTextNode(m[2])] : [document.createTextNode(n)]);
      }))
    ]));
    page.appendChild(el('a', { 'class': 'wx-next', href: 'wenfang.html' }, [
      el('span', { 'class': 'wx-next-label', text: '回到书案' }),
      el('span', { text: '一张书案上，摆着什么？点案上的器物看看 →' })
    ]));

    root.textContent = '';
    root.appendChild(page);
    applyFilter('全部');

    /* 深链接：?id=洛阳纸贵 直接打开这个典故 */
    var wanted = '';
    try { wanted = decodeURIComponent((location.search.match(/[?&]id=([^&]+)/) || [])[1] || ''); } catch (e) { wanted = ''; }
    cards.forEach(function (c) {
      if (c.story.name === wanted) {
        c.node.open = true;
        c.node.scrollIntoView({ block: 'center' });
      }
    });
  }

  render();
})();
