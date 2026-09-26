/* 知否知否 · "字·语"板块共用的排版小工具
   ----------------------------------------------------------
   造元素、页头、分区、标签页、选项条、可展开的卡、词表、"常见说法"、"另见"、"小提示"，
   以及 ?id=名称 的直达（首页"今日一签"点"去看看"会用到）。
   数据来自各页自己的 data/zy-*.js，本文件只负责排版，不含内容。 */
(function () {
  'use strict';

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'text') n.textContent = v;
      else if (k === 'class') n.className = v;
      else n.setAttribute(k, v);
    });
    (Array.isArray(kids) ? kids : (kids ? [kids] : [])).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }

  /* ---------- 数据小工具 ---------- */
  function sec(D, title) {
    for (var i = 0; i < D.sections.length; i++) if (D.sections[i].title === title) return D.sections[i];
    return { title: title, bold: {}, fields: [], items: [] };
  }
  function fmap(f) {
    var m = {};
    (f || []).forEach(function (p) { if (!(p[0] in m)) m[p[0]] = p[1]; });
    return m;
  }
  function parts(s) {
    return s ? s.split('；').map(function (x) { return x.trim(); }).filter(Boolean) : [];
  }
  function links(s) {
    if (!s) return [];
    return s.split('、').map(function (x) {
      var a = x.split('｜');
      return { name: a[0].trim(), href: (a[1] || '').trim() };
    }).filter(function (l) { return l.name; });
  }
  function qs(name) {
    try { return new URLSearchParams(location.search).get(name); } catch (e) { return null; }
  }
  function setQs(name, val) {
    try {
      var u = new URL(location.href);
      if (val === null) u.searchParams.delete(name); else u.searchParams.set(name, val);
      history.replaceState(null, '', u.toString());
    } catch (e) { /* 忽略 */ }
  }

  /* ---------- 页面骨架 ---------- */
  function head(D, eyebrow) {
    return el('header', { 'class': 'zy-head' }, [
      el('div', { 'class': 'zy-eyebrow', text: eyebrow }),
      el('h1', { 'class': 'zy-hook', text: D.hook }),
      el('p', { 'class': 'zy-answer', text: D.answer }),
      D.intro ? el('p', { 'class': 'zy-lead', text: D.intro }) : null
    ]);
  }
  function section(title, kids) {
    return el('section', { 'class': 'zy-section', 'aria-label': title }, [el('div', { 'class': 'zy-sec-title', text: title })].concat(kids || []));
  }
  function note(t) { return t ? el('p', { 'class': 'zy-note', text: t }) : null; }
  function remind(t) { return t ? el('p', { 'class': 'zy-remind', text: t }) : null; }
  function callout(t, label) {
    if (!t) return null;
    return el('p', { 'class': 'zy-callout' }, [label ? el('b', { text: label + '　' }) : null, t]);
  }
  function mount(root, kids) {
    var page = el('div', { 'class': 'zy-page' });
    kids.forEach(function (k) { if (k) page.appendChild(k); });
    root.textContent = '';
    root.appendChild(page);
  }

  /* ---------- 标签页 ---------- */
  function tabs(defs) {
    var wrap = el('div', { 'class': 'zy-tabs' });
    var bar = el('div', { 'class': 'zy-tabbar', role: 'tablist' });
    var btns = [], pans = [];
    function show(key, quiet) {
      var idx = 0;
      defs.forEach(function (d, i) { if (d.key === key) idx = i; });
      btns.forEach(function (b, i) { b.setAttribute('aria-selected', i === idx ? 'true' : 'false'); });
      pans.forEach(function (p, i) { p.hidden = i !== idx; });
      if (!quiet) { setQs('tab', defs[idx].key); setQs('id', null); }
    }
    defs.forEach(function (d) {
      var b = el('button', { 'class': 'zy-tab', type: 'button', role: 'tab', 'aria-selected': 'false', text: d.label });
      b.addEventListener('click', function () { show(d.key); });
      btns.push(b);
      bar.appendChild(b);
      pans.push(el('div', { 'class': 'zy-tabpanel', role: 'tabpanel' }, d.build()));
    });
    wrap.appendChild(bar);
    pans.forEach(function (p) { wrap.appendChild(p); });
    show(qs('tab') || defs[0].key, true);
    return { node: wrap, show: show };
  }

  /* ---------- 选项条 ---------- */
  function chips(labels, onPick, opts) {
    opts = opts || {};
    var box = el('div', { 'class': 'zy-chips' + (opts.scroll ? ' is-scroll' : ''), role: 'group', 'aria-label': opts.aria || '选择' });
    var bs = [];
    function pick(i) {
      bs.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      onPick(i);
    }
    labels.forEach(function (l, i) {
      var b = el('button', { 'class': 'zy-chip', type: 'button', 'aria-pressed': 'false', text: l });
      b.addEventListener('click', function () { pick(i); });
      bs.push(b);
      box.appendChild(b);
    });
    return { node: box, pick: pick };
  }

  /* ---------- 卡片 ---------- */
  function listNode(arr) {
    return el('ul', { 'class': 'zy-list' }, arr.map(function (t) { return el('li', { text: t }); }));
  }
  /* pairs = [[标签, 文字 | 列表 | 元素], ...]；标签是“提醒”的会加底色；quote 里的标签用大字引文样式 */
  function kv(pairs, opts) {
    var quote = (opts && opts.quote) || [];
    var dl = el('dl', { 'class': 'zy-kv' });
    pairs.forEach(function (p) {
      var v = p[1];
      if (!v || (Array.isArray(v) && !v.length)) return;
      var dd = el('dd', {});
      if (Array.isArray(v)) dd.appendChild(listNode(v));
      else if (typeof v === 'string') dd.textContent = v;
      else dd.appendChild(v);
      dl.appendChild(el('div', { 'class': p[0] === '提醒' ? 'is-remind' : (quote.indexOf(p[0]) >= 0 ? 'is-quote' : '') }, [el('dt', { text: p[0] }), dd]));
    });
    return dl;
  }
  /* o = { name, sub, tag, body:[元素], id, open, isStatic } */
  function card(o) {
    var body = (o.body || []).filter(Boolean);
    var d = el('details', { 'class': 'zy-card' + (o.isStatic || !body.length ? ' is-static' : '') + (o.sub ? ' has-sub' : ''), 'data-zy-id': o.id || o.name });
    if ((o.open || o.isStatic) && body.length) d.setAttribute('open', '');
    d.appendChild(el('summary', {}, [
      o.tag ? el('span', { 'class': 'zy-card-tag', text: o.tag }) : null,
      el('span', { 'class': 'zy-card-name', text: o.name }),
      o.sub ? el('span', { 'class': 'zy-card-sub', text: o.sub }) : null
    ]));
    if (body.length) d.appendChild(el('div', { 'class': 'zy-card-body' }, body));
    if (d.classList.contains('is-static')) d.addEventListener('click', function (e) { if (e && e.target && e.target.closest && e.target.closest('summary')) e.preventDefault(); });
    return d;
  }
  /* 拆字：“字｜说明。；字｜说明。” → 一个个字的小块 */
  function chars(s) {
    var ps = parts(s);
    if (!ps.length) return null;
    return el('div', { 'class': 'zy-chars' }, ps.map(function (p) {
      var i = p.indexOf('｜');
      return el('div', { 'class': 'zy-char' }, [el('b', { text: i > 0 ? p.slice(0, i) : '' }), el('span', { text: i > 0 ? p.slice(i + 1) : p })]);
    }));
  }
  /* 词表：pairs = [[词, 含义]]；opts.split 时，含义写成“对象｜语感”分两行显示 */
  function words(pairs, opts) {
    var split = opts && opts.split;
    return el('div', { 'class': 'zy-words zy-paper' }, pairs.map(function (p) {
      var m = p[1], sub = null;
      if (split && m.indexOf('｜') >= 0) { var a = m.split('｜'); sub = a[0]; m = a[1]; }
      return el('div', { 'class': 'zy-word', 'data-zy-word': p[0] }, [el('b', { text: p[0] }), el('span', {}, [sub ? el('i', { text: sub }) : null, m])]);
    }));
  }
  /* 前后翻页的两个按钮：names = 名称列表，cur = 当前序号，go(i) = 跳到第 i 个 */
  function prevNext(names, cur, go) {
    var n = names.length;
    var prev = el('button', { 'class': 'zy-btn', type: 'button', text: cur > 0 ? '← ' + names[cur - 1] : '' });
    if (cur === 0) prev.style.visibility = 'hidden';
    prev.addEventListener('click', function () { if (cur > 0) go(cur - 1); });
    var next = el('button', { 'class': 'zy-btn', type: 'button', text: cur < n - 1 ? names[cur + 1] + ' →' : '回到第一个' });
    next.addEventListener('click', function () { go(cur < n - 1 ? cur + 1 : 0); });
    return el('div', { 'class': 'zy-btnrow' }, [prev, next]);
  }

  /* ---------- 页面末尾的几块 ---------- */
  function myths(items) {
    if (!items || !items.length) return null;
    return section('常见说法', [el('div', { 'class': 'zy-myths' }, items.map(function (it) {
      var m = fmap(it.f);
      return el('details', { 'class': 'zy-myth', 'data-zy-id': it.name }, [
        el('summary', {}, [el('span', { 'class': 'zy-mark', 'aria-hidden': 'true', text: '？' }), el('span', { 'class': 'zy-myth-claim', text: m['说法'] || it.name })]),
        el('div', { 'class': 'zy-myth-body' }, [el('span', { 'class': 'zy-mark is-ok', 'aria-hidden': 'true', text: '正' }), el('p', { 'class': 'zy-myth-better', text: m['更准确'] || '' })])
      ]);
    }))]);
  }
  function memory(pairs) {
    return el('div', { 'class': 'zy-memory zy-paper' }, pairs.filter(function (p) { return p[1]; }).map(function (p) {
      return el('div', {}, [el('b', { text: p[0] }), el('span', { text: p[1] })]);
    }));
  }
  function see(D) {
    if (!D.see || !D.see.length) return null;
    return el('div', { 'class': 'zy-see' }, [el('span', { 'class': 'zy-see-label', text: '另见' })].concat(D.see.map(function (l) {
      return el('a', { href: l.href, text: l.name });
    })));
  }
  function tipNotes(D) {
    var out = [];
    if (D.tip) out.push(el('div', { 'class': 'zy-tip' }, [el('div', { 'class': 'zy-tip-label', text: '小提示' }), el('p', { text: D.tip })]));
    if (D.notes && D.notes.length) {
      out.push(el('details', { 'class': 'zy-notes' }, [
        el('summary', { text: '批注' }),
        el('div', { 'class': 'zy-notes-body' }, D.notes.map(function (n) {
          var m = String(n).match(/^([^：]{1,4})：(.*)$/);
          return el('p', {}, m ? [el('span', { 'class': 'zy-note-label', text: m[1] }), m[2]] : [String(n)]);
        }))
      ]));
    }
    return out;
  }

  /* ---------- ?id=名称 直达 ---------- */
  var opens = {};
  function onOpen(name, fn) { if (!opens[name]) opens[name] = fn; }
  function openFromQuery() {
    var id = qs('id');
    if (!id || !opens[id]) return;
    var target = opens[id]();
    if (target) {
      if (target.tagName === 'DETAILS') target.open = true;
      target.classList.add('is-hit');
      setTimeout(function () { if (target.scrollIntoView) target.scrollIntoView({ block: 'center' }); }, 80);
    }
  }

  window.ZY = {
    el: el, sec: sec, fmap: fmap, parts: parts, links: links, qs: qs,
    head: head, section: section, note: note, remind: remind, callout: callout, mount: mount,
    tabs: tabs, chips: chips, kv: kv, card: card, chars: chars, words: words, prevNext: prevNext,
    myths: myths, memory: memory, see: see, tipNotes: tipNotes, onOpen: onOpen, openFromQuery: openFromQuery
  };
})();
