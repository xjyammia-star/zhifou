
/* 知否知否 · "物"板块共用的排版小工具
   ----------------------------------------------------------
   入口页和四大发明各页都会用到：造元素、页头、分区、"常见说法"、"另见"、
   一步一步的流程（点哪一步看哪一步）、以及一套小图标。
   数据来自各页自己的 data/*.js，本文件只负责排版，不含内容。 */
(function () {
  'use strict';

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (Array.isArray(kids) ? kids : (kids ? [kids] : [])).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  /* ---------- 小图标：64×64 的线稿，颜色跟随文字色（currentColor） ---------- */
  var A = ' fill="currentColor" fill-opacity="0.2"';
  var ICONS = {
    /* 文房四宝 */
    bi: '<path d="M16 50 L42 14"/><path d="M42 14 C48 8 54 10 52 16 C50 22 44 20 42 14 Z"' + A + '/><path d="M12 54 L18 46"/>',
    mo: '<rect x="22" y="8" width="20" height="48" rx="2"' + A + '/><path d="M22 20 H42 M22 44 H42"/><path d="M32 26 V38"/>',
    zhi: '<path d="M16 12 H40 L48 20 V52 H16 Z"' + A + '/><path d="M40 12 V20 H48"/><path d="M22 30 H42 M22 38 H42 M22 46 H34"/>',
    yan: '<rect x="10" y="26" width="44" height="26" rx="6"' + A + '/><ellipse cx="26" cy="38" rx="9" ry="5"/><path d="M40 34 H48 M40 42 H48"/>',
    /* 四大发明 */
    zaozhi: '<path d="M12 34 H52 L46 54 H18 Z"' + A + '/><path d="M18 42 q4 -3 8 0 t8 0 t8 0"/><rect x="18" y="12" width="28" height="16" rx="1"/><path d="M26 12 V28 M34 12 V28 M18 20 H46"/>',
    yinshua: '<rect x="12" y="26" width="40" height="26" rx="3"' + A + '/><path d="M20 34 H44 M20 42 H36"/><path d="M22 26 V14 H42 V26"/>',
    huoyao: '<circle cx="32" cy="30" r="5"' + A + '/><path d="M32 8 V18 M32 42 V52 M10 30 H20 M44 30 H54 M16 14 L23 21 M41 39 L48 46 M48 14 L41 21 M23 39 L16 46"/>',
    zhinanzhen: '<circle cx="32" cy="32" r="22"/><path d="M32 12 L38 32 L32 52 L26 32 Z"' + A + '/><circle cx="32" cy="32" r="2.5" fill="currentColor"/>',
    /* 造纸七步 */
    z1: '<path d="M12 46 L30 18 M18 48 L36 20 M24 50 L42 22"/><path d="M40 34 H54 V50 H36 Z"' + A + '/>',
    z2: '<path d="M14 30 H50 V50 Q50 54 46 54 H18 Q14 54 14 50 Z"' + A + '/><path d="M10 30 H54"/><path d="M24 24 q-4 -5 0 -9 M34 24 q-4 -5 0 -9 M44 24 q-4 -5 0 -9"/>',
    z3: '<path d="M12 36 H52 Q50 52 32 52 Q14 52 12 36 Z"' + A + '/><path d="M40 8 L28 34"/><path d="M36 6 L44 10"/>',
    z4: '<path d="M12 22 H52 L48 52 H16 Z"' + A + '/><path d="M16 34 q4 -4 8 0 t8 0 t8 0 t8 0"/><path d="M28 10 L36 30"/>',
    z5: '<path d="M10 46 H54 V54 H10 Z"' + A + '/><g transform="rotate(-8 32 25)"><rect x="16" y="14" width="32" height="22" rx="1"/><path d="M22 14 V36 M30 14 V36 M38 14 V36"/></g>',
    z6: '<rect x="14" y="8" width="36" height="8" rx="2"' + A + '/><rect x="14" y="44" width="36" height="8" rx="2"' + A + '/><path d="M18 30 H46"/><path d="M32 18 V26 M28 22 L32 26 L36 22"/>',
    z7: '<path d="M8 20 H44"/><path d="M14 20 V46 H36 V20"' + A + '/><circle cx="50" cy="40" r="5"/><path d="M50 28 V31 M50 49 V52 M40 40 H43 M57 40 H60"/>',
    /* 雕版六步 */
    d1: '<path d="M16 10 H40 L48 18 V54 H16 Z"' + A + '/><path d="M22 24 H42 M22 32 H42"/><path d="M28 44 L33 49 L43 38"/>',
    d2: '<rect x="12" y="34" width="40" height="18" rx="2"' + A + '/><path d="M18 12 H46 V32 H18 Z"/><path d="M24 20 H40 M24 26 H40"/>',
    d3: '<rect x="10" y="38" width="44" height="14" rx="2"' + A + '/><path d="M46 8 L32 34"/><path d="M28 36 L36 40 L34 32 Z" fill="currentColor"/>',
    d4: '<rect x="10" y="40" width="44" height="12" rx="2"' + A + '/><path d="M18 34 H46 V40 H18 Z"/><path d="M32 34 V14"/><path d="M24 14 H40"/>',
    d5: '<rect x="10" y="42" width="44" height="10" rx="2"' + A + '/><path d="M14 30 H50 V42 H14 Z"/><rect x="20" y="10" width="24" height="10" rx="5"/><path d="M32 20 V30"/>',
    d6: '<path d="M16 12 H46 V52 H16 Z"' + A + '/><path d="M22 12 V52"/><path d="M28 22 H40 M28 30 H40 M28 38 H36"/><path d="M16 20 H10 M16 44 H10"/>',
    /* 活字五步 */
    h1: '<rect x="10" y="28" width="22" height="22" rx="2"' + A + '/><path d="M16 38 H26 M21 33 V45"/><path d="M46 52 C38 46 46 42 46 34 C54 40 56 48 46 52 Z"/>',
    h2: '<rect x="12" y="12" width="40" height="40" rx="2"/><path d="M12 25 H52 M12 38 H52 M25 12 V52 M38 12 V52"/><rect x="14" y="14" width="9" height="9"' + A + '/><rect x="27" y="27" width="9" height="9"' + A + '/>',
    h3: '<rect x="12" y="26" width="40" height="26" rx="2"/><path d="M12 39 H52 M26 26 V52 M40 26 V52"/><path d="M32 6 C28 12 28 14 32 16 C36 14 36 12 32 6 Z"' + A + '/>',
    h4: '<rect x="14" y="8" width="36" height="8" rx="2"' + A + '/><path d="M32 16 V28"/><rect x="14" y="28" width="36" height="12" rx="2"/><rect x="10" y="42" width="44" height="10" rx="2"' + A + '/>',
    h5: '<path d="M22 52 C14 44 22 40 22 30 C30 38 32 46 22 52 Z"' + A + '/><rect x="38" y="14" width="14" height="14" rx="2"/><path d="M42 21 H48 M45 18 V24"/><path d="M40 36 L46 32"/>',
    /* 火药三步 */
    hy1: '<path d="M16 24 H48 V52 H16 Z"' + A + '/><path d="M12 24 H52"/><path d="M26 52 V42 Q32 34 38 42 V52"/><path d="M28 18 q-3 -4 0 -8 M36 18 q-3 -4 0 -8"/>',
    hy3: '<path d="M12 52 L50 14"/><path d="M50 14 L42 16 M50 14 L48 22"/><path d="M12 52 L20 50 M12 52 L14 44"/><path d="M24 46 C18 42 24 36 28 32 C32 38 32 44 24 46 Z"' + A + '/>',
    /* 五种火器 */
    a1: '<path d="M14 50 L46 18"/><path d="M46 18 L38 18 M46 18 L46 26"/><rect x="22" y="30" width="20" height="9" rx="4.5" transform="rotate(-45 32 34)"' + A + '/>',
    a2: '<circle cx="32" cy="38" r="14"' + A + '/><path d="M32 24 C28 16 32 12 32 6 C38 12 40 18 32 24 Z"/><path d="M24 34 q8 -6 16 0"/>',
    a3: '<circle cx="32" cy="32" r="12"' + A + '/><path d="M32 8 V16 M32 48 V56 M8 32 H16 M48 32 H56 M15 15 L21 21 M43 43 L49 49 M49 15 L43 21 M21 43 L15 49"/>',
    a4: '<path d="M22 22 H42 L48 32 V46 Q48 52 42 52 H22 Q16 52 16 46 V32 Z"' + A + '/><path d="M28 16 H36 V22 H28 Z"/><path d="M32 16 q4 -6 9 -4"/>',
    a5: '<path d="M10 40 L46 22 L50 30 L14 48 Z"' + A + '/><path d="M52 22 l6 -4 M54 30 l6 2 M48 16 l2 -6"/>',
    /* 四种安置磁针的方法 */
    m1: '<path d="M10 34 H54 Q52 54 32 54 Q12 54 10 34 Z"' + A + '/><path d="M18 28 H46" stroke-width="3.2"/><path d="M24 28 V34 M40 28 V34"/>',
    m2: '<path d="M32 6 V24"/><circle cx="32" cy="26" r="2.5" fill="currentColor"/><path d="M14 30 H50" stroke-width="3.2"/><path d="M50 30 l-6 -3 M50 30 l-6 3"/>',
    m3: '<path d="M18 54 V28 Q18 18 28 18 H36 Q46 18 46 28 V54"' + A + '/><path d="M22 34 H42"/><path d="M12 26 H52" stroke-width="3.2"/>',
    m4: '<path d="M8 32 H56 Q54 54 32 54 Q10 54 8 32 Z"' + A + '/><path d="M8 32 H56"/><path d="M18 26 H46" stroke-width="3.2"/>'
  };
  function icon(name) {
    var p = ICONS[name];
    if (!p) return '';
    return '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }
  function iconBox(name, cls) {
    var d = el('div', { 'class': cls, 'aria-hidden': 'true' });
    d.innerHTML = icon(name);
    return d;
  }

  /* ---------- 页面骨架 ---------- */
  function head(D, eyebrow) {
    return [
      el('div', { 'class': 'wx-head' }, [
        el('div', { 'class': 'wx-eyebrow', text: eyebrow }),
        el('h1', { 'class': 'wx-hook', text: D.hook }),
        el('p', { 'class': 'wx-answer', text: D.answer })
      ]),
      el('p', { 'class': 'wx-lead', text: D.intro })
    ];
  }

  function section(title, kids) {
    return el('section', { 'class': 'wx-section', 'aria-label': title }, [el('div', { 'class': 'wx-sec-title', text: title })].concat(kids || []));
  }
  function note(text) { return text ? el('p', { 'class': 'fm-note', text: text }) : null; }
  function remind(text) { return text ? el('p', { 'class': 'fm-remind', text: text }) : null; }
  function source(text) { return text ? el('p', { 'class': 'fm-source', text: text }) : null; }

  /* 一列卡片：items = [{name, text, meta}] */
  function cards(items, opts) {
    opts = opts || {};
    return el('div', { 'class': 'fm-grid' }, items.map(function (it, i) {
      var kids = [];
      if (opts.numbered) kids.push(el('span', { 'class': 'fm-card-no', text: (i < 9 ? '0' : '') + (i + 1) }));
      if (it.meta) kids.push(el('span', { 'class': 'fm-card-meta', text: it.meta }));
      kids.push(el('span', { 'class': 'fm-card-name', text: it.name }));
      if (it.text) kids.push(el('span', { 'class': 'fm-card-text', text: it.text }));
      return el('div', { 'class': 'fm-card wx-paper' }, kids);
    }));
  }

  /* 常见说法：点开看“更准确的说法” */
  function myths(list) {
    if (!list || !list.length) return null;
    return section('常见说法', [el('div', { 'class': 'fm-myths' }, list.map(function (m) {
      return el('details', { 'class': 'fm-myth wx-paper' }, [
        el('summary', {}, [el('span', { 'class': 'fm-myth-mark', 'aria-hidden': 'true', text: '？' }), el('span', { 'class': 'fm-myth-claim', text: m.claim })]),
        el('div', { 'class': 'fm-myth-body' }, [el('span', { 'class': 'fm-myth-mark is-ok', 'aria-hidden': 'true', text: '正' }), el('p', { 'class': 'fm-myth-better', text: m.better })])
      ]);
    }))]);
  }

  /* 另见：一排链接 */
  function see(list) {
    if (!list || !list.length) return null;
    return el('div', { 'class': 'wx-see' }, [el('span', { 'class': 'wx-see-label', text: '另见' })].concat(list.map(function (l) {
      return el('a', { 'class': 'wx-chip', href: l.href, text: l.name });
    })));
  }

  function tipNotes(D) {
    var out = [];
    if (D.tip) out.push(el('div', { 'class': 'wx-tip' }, [el('div', { 'class': 'wx-tip-label', text: '小提示' }), el('p', { text: D.tip })]));
    if (D.notes && D.notes.length) {
      out.push(el('details', { 'class': 'wx-notes' }, [
        el('summary', { text: '批注' }),
        el('div', { 'class': 'wx-notes-body' }, D.notes.map(function (n) {
          var m = n.match(/^([^：]{1,4})：(.*)$/);
          return el('p', {}, m ? [el('span', { 'class': 'wx-note-label', text: m[1] }), document.createTextNode(m[2])] : [document.createTextNode(n)]);
        }))
      ]));
    }
    return out;
  }

  /* 几步连起来（三站的路线）：items = [{name, who, text}] */
  function steps3(items) {
    return el('div', { 'class': 'fm-steps3' }, items.map(function (it) {
      return el('div', { 'class': 'fm-s3 wx-paper' }, [
        el('span', { 'class': 'fm-s3-name', text: it.name }),
        it.who ? el('span', { 'class': 'fm-s3-who', text: it.who }) : null,
        el('span', { 'class': 'fm-s3-text', text: it.text })
      ]);
    }));
  }

  /* ---------- 一步一步的流程 ----------
     cfg = { items: [{ name, icon, rows: [{label, text, note}] }], ordered: true/false, unit: '步',
             cols: 每行几个, first: 起始选中的序号, aria: '说明' } */
  function stepper(cfg) {
    var items = cfg.items, n = items.length, cur = 0, nodes = [];
    var unit = cfg.unit || '步';
    var wrap = el('div', { 'class': 'fm-stepper' });
    var flow = el('div', { 'class': 'fm-flow', role: 'group', 'aria-label': cfg.aria || '流程', style: '--cols:' + (cfg.cols || n) });
    var panel = el('div', { 'class': 'fm-detail wx-paper wx-panel', tabindex: '-1', 'aria-live': 'polite' });

    items.forEach(function (it, i) {
      var b = el('button', { 'class': 'fm-node', type: 'button', 'aria-pressed': 'false' });
      if (it.icon) b.appendChild(iconBox(it.icon, 'fm-node-ic'));
      if (cfg.ordered) b.appendChild(el('span', { 'class': 'fm-node-no', text: String(i + 1) }));
      b.appendChild(el('span', { 'class': 'fm-node-name', text: it.name }));
      b.addEventListener('click', function () { select(i); });
      nodes.push(b);
      flow.appendChild(b);
    });

    function select(i) {
      cur = i;
      nodes.forEach(function (b, j) {
        b.setAttribute('aria-pressed', j === i ? 'true' : 'false');
        if (cfg.ordered && j < i) b.classList.add('is-done'); else b.classList.remove('is-done');
      });
      var it = items[i];
      panel.textContent = '';
      panel.appendChild(el('div', { 'class': 'wx-kicker' }, [el('span', { 'class': 'wx-tag', text: cfg.ordered ? ('第 ' + (i + 1) + ' ' + unit + ' · 共 ' + n + ' ' + unit) : ((i + 1) + ' / ' + n) })]));
      panel.appendChild(el('h3', { 'class': 'wx-title', text: it.name }));
      var dl = el('dl', { 'class': 'wx-fields' });
      it.rows.forEach(function (r) {
        if (!r.text) return;
        dl.appendChild(el('div', { 'class': r.note ? 'is-note' : '' }, [el('dt', { text: r.label }), el('dd', { text: r.text })]));
      });
      panel.appendChild(dl);
      var prev = el('button', { 'class': 'wx-step-btn', type: 'button', text: i > 0 ? ('← ' + items[i - 1].name) : '' });
      if (i === 0) prev.style.visibility = 'hidden';
      prev.addEventListener('click', function () { select(cur - 1); });
      var nextText = i < n - 1 ? (items[i + 1].name + ' →') : (cfg.ordered ? '回到第一' + unit : '回到第一个');
      var next = el('button', { 'class': 'wx-step-btn', type: 'button', text: nextText });
      next.addEventListener('click', function () { select(cur < n - 1 ? cur + 1 : 0); });
      panel.appendChild(el('div', { 'class': 'wx-stepper' }, [prev, next]));
      if (cfg.onSelect) cfg.onSelect(i, it, panel);
    }

    wrap.appendChild(flow);
    wrap.appendChild(panel);
    select(cfg.first || 0);
    return wrap;
  }

  /* 地址栏里的 ?id=名称：按名称找序号 */
  function idIndex(items) {
    var m = /[?&]id=([^&]+)/.exec(location.search || '');
    if (!m) return 0;
    var id = decodeURIComponent(m[1]);
    for (var i = 0; i < items.length; i++) if (items[i].name === id) return i;
    return 0;
  }

  function mount(root, kids) {
    var page = el('div', { 'class': 'wx-page' });
    kids.forEach(function (k) { if (k) page.appendChild(k); });
    root.textContent = '';
    root.appendChild(page);
  }

  window.WU = {
    el: el, icon: icon, iconBox: iconBox, head: head, section: section, note: note, remind: remind, source: source,
    cards: cards, myths: myths, see: see, tipNotes: tipNotes, steps3: steps3, stepper: stepper, idIndex: idIndex, mount: mount
  };
})();
