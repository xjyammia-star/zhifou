/* 知否知否 · "物"·中国古代建筑（院落与民居页）脚本
   数据来自 data/minju.js（window.ZHIFOU_MINJU），本文件只负责排版和交互。
   四合院平面图和七幅民居小线稿是固定的线稿，文字来自数据。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_MINJU;
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
  function figure(svgHtml, cls) {
    var f = el('div', { 'class': 'mg-fig ' + (cls || '') });
    f.innerHTML = svgHtml;
    return f;
  }
  function onActivate(node, fn) {
    node.addEventListener('click', fn);
    node.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); }
    });
  }
  function grp(id, inner) {
    return '<g class="mg-part" data-id="' + id + '" tabindex="0" role="button" aria-pressed="false" aria-label="' + id + '">' + inner + '</g>';
  }

  var RED = '#b23a2e', TILE = '#3d3a36';

  /* ================= 一、四合院平面图 ================= */
  function courtSvg() {
    function txt(t, x, y, cls) { return '<text class="' + (cls || 'gd-node') + '" x="' + x + '" y="' + y + '" text-anchor="middle">' + t + '</text>'; }
    var s = '<svg viewBox="0 0 560 660" role="group" aria-label="一座二进四合院的平面示意图，点各个部位">';
    s += '<rect x="40" y="30" width="480" height="600" fill="#efe3c8" stroke="#7d6a52" stroke-width="5"/>';
    s += '<rect x="40" y="388" width="215" height="6" fill="#8f7a55"/><rect x="305" y="388" width="215" height="6" fill="#8f7a55"/>';
    s += '<text class="mg-zone-label" x="280" y="300" text-anchor="middle">内院</text><text class="mg-zone-label" x="200" y="470" text-anchor="middle">外院</text>';
    s += grp('廊道', '<rect x="114" y="136" width="8" height="246" fill="#c9a56b"/><rect x="438" y="136" width="8" height="246" fill="#c9a56b"/><rect x="122" y="136" width="316" height="8" fill="#c9a56b"/>' + txt('廊道', 280, 166, 'mj-small'));
    s += grp('正房', '<rect x="150" y="60" width="260" height="72" rx="3" fill="#e8c46a" stroke="#a8842f" stroke-width="2"/>' + txt('正房', 280, 104));
    s += grp('耳房', '<rect x="100" y="74" width="44" height="46" rx="3" fill="#e6d9bd" stroke="#8f7a55" stroke-width="2"/><rect x="416" y="74" width="44" height="46" rx="3" fill="#e6d9bd" stroke="#8f7a55" stroke-width="2"/>' + txt('耳房', 122, 102, 'mj-small') + txt('耳房', 438, 102, 'mj-small'));
    s += grp('厢房', '<rect x="60" y="180" width="50" height="150" rx="3" fill="#e0a08e" stroke="#b23a2e" stroke-width="2"/><rect x="450" y="180" width="50" height="150" rx="3" fill="#e0a08e" stroke="#b23a2e" stroke-width="2"/>' +
      txt('厢', 85, 244) + txt('房', 85, 272) + txt('厢', 475, 244) + txt('房', 475, 272));
    s += grp('垂花门', '<rect x="252" y="374" width="56" height="34" rx="3" fill="' + RED + '" stroke="#7d2a20" stroke-width="2"/>' + txt('垂花门', 280, 396, 'gd-node is-light mj-small'));
    s += grp('倒座房', '<rect x="60" y="530" width="330" height="64" rx="3" fill="#d9cdb0" stroke="#8f7a55" stroke-width="2"/><rect x="440" y="530" width="60" height="64" rx="3" fill="#d9cdb0" stroke="#8f7a55" stroke-width="2"/>' + txt('倒座房', 225, 568));
    s += grp('影壁', '<rect x="392" y="486" width="46" height="10" fill="#8f7a55"/>' + txt('影壁', 415, 478, 'mj-small'));
    s += '<rect x="392" y="627" width="46" height="7" fill="#efe3c8"/>';
    s += '<path d="M415 630 V604 M408 612 L415 602 L422 612" fill="none" stroke="#5a4d3d" stroke-width="2"/>';
    s += '<text class="mg-tx-dark" x="415" y="648" text-anchor="middle">入口</text>';
    s += '<text class="mg-tx-dark" x="280" y="20" text-anchor="middle">北</text><text class="mg-tx-dark" x="280" y="660" text-anchor="middle">南</text>';
    return s + '</svg>';
  }

  function buildCourt() {
    var C = D.court;
    var fig = figure(courtSvg(), 'mj-court-fig');
    var panel = el('div', { 'class': 'wx-panel wx-paper', 'aria-live': 'polite' });
    var btns = {};
    var bar = el('div', { 'class': 'wx-chips', role: 'group', 'aria-label': '按名字选' });

    function show(name, scroll) {
      var it = null;
      C.parts.forEach(function (p) { if (p.name === name) it = p; });
      if (!it) return;
      fig.classList.add('has-sel');
      Array.prototype.forEach.call(fig.querySelectorAll('.mg-part'), function (g) {
        var on = g.getAttribute('data-id') === name;
        g.classList.toggle('is-selected', on);
        g.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      Object.keys(btns).forEach(function (k) { btns[k].setAttribute('aria-pressed', k === name ? 'true' : 'false'); });
      panel.textContent = '';
      panel.appendChild(el('div', { 'class': 'wx-kicker' }, [el('span', { 'class': 'wx-tag', text: it.place })]));
      panel.appendChild(el('h3', { 'class': 'wx-title', text: it.name }));
      panel.appendChild(el('p', { 'class': 'wx-line', text: it.text }));
      if (scroll && window.innerWidth < 1000) scrollToNode(panel);
    }
    C.parts.forEach(function (p) {
      var b = el('button', { type: 'button', 'class': 'wx-chip-w', 'aria-pressed': 'false', text: p.name });
      b.addEventListener('click', function () { show(p.name, true); });
      btns[p.name] = b;
      bar.appendChild(b);
    });
    Array.prototype.forEach.call(fig.querySelectorAll('.mg-part'), function (g) {
      onActivate(g, function () { show(g.getAttribute('data-id'), true); });
    });

    var sec = el('section', { 'class': 'wx-section', 'aria-label': '四合院' }, [
      el('div', { 'class': 'wx-sec-title', text: '一座四合院：从入口走到正房' }),
      el('p', { 'class': 'wx-lead', text: C.text }),
      el('p', { 'class': 'wx-lead', text: C.deep }),
      el('div', { 'class': 'wx-explore' }, [
        el('div', { 'class': 'wx-scene' }, [fig, el('p', { 'class': 'wx-hint', text: C.caption }), bar]),
        panel
      ]),
      el('div', { 'class': 'wx-myths' }, [
        el('article', { 'class': 'wx-myth wx-paper' }, [el('h3', { 'class': 'wx-myth-title', text: '礼制和日常' }), el('p', { 'class': 'wx-line', text: C.rite })]),
        el('article', { 'class': 'wx-myth wx-paper' }, [el('h3', { 'class': 'wx-myth-title', text: '不是全国统一的住宅' }), el('div', { 'class': 'wx-fields' }, [el('div', { 'class': 'is-note' }, [el('dt', { text: '辨析' }), el('dd', { text: C.note })])])])
      ])
    ]);
    show('正房', false);
    return sec;
  }

  /* ================= 二、七种地方民居 ================= */
  var HOME_ART = {
    siheyuan: '<rect x="30" y="10" width="60" height="60" fill="#d9a08e" stroke="' + RED + '" stroke-width="2"/><rect x="46" y="26" width="28" height="28" fill="#efe3c8" stroke="' + RED + '"/><rect x="54" y="64" width="12" height="6" fill="#efe3c8"/>',
    shanxi: '<rect x="30" y="6" width="60" height="68" fill="#c9b89a" stroke="#8f7a55" stroke-width="2"/><g fill="#efe3c8" stroke="#8f7a55"><rect x="42" y="12" width="36" height="16"/><rect x="42" y="32" width="36" height="16"/><rect x="42" y="52" width="36" height="16"/></g><path d="M60 6 V74" stroke="#8f7a55" stroke-dasharray="3 3"/>',
    huizhou: '<polygon points="28,70 28,28 38,28 38,22 48,22 48,16 72,16 72,22 82,22 82,28 92,28 92,70" fill="#f6f2e8" stroke="#8f887a" stroke-width="2"/><g fill="' + TILE + '"><rect x="27" y="26" width="12" height="3"/><rect x="37" y="20" width="12" height="3"/><rect x="47" y="14" width="26" height="3"/><rect x="71" y="20" width="12" height="3"/><rect x="81" y="26" width="12" height="3"/></g><rect x="53" y="40" width="14" height="16" fill="#8f887a"/>',
    tulou: '<circle cx="60" cy="40" r="32" fill="#c9a56b" stroke="#8a6f3f" stroke-width="2"/><circle cx="60" cy="40" r="18" fill="#efe3c8" stroke="#8a6f3f"/><circle cx="60" cy="40" r="6" fill="' + RED + '"/>',
    yikeyin: '<rect x="36" y="12" width="48" height="56" fill="#d9a08e" stroke="#7d2a20" stroke-width="4"/><rect x="52" y="30" width="16" height="20" fill="#efe3c8" stroke="#7d2a20" stroke-width="1.5"/>',
    yaodong: '<polygon points="8,72 8,40 40,22 112,30 112,72" fill="#d8b98a" stroke="#8a6f3f" stroke-width="2"/><g fill="#5a4d3d"><path d="M22 72 V56 A10 10 0 0 1 42 56 V72 Z"/><path d="M50 72 V54 A10 10 0 0 1 70 54 V72 Z"/><path d="M78 72 V56 A10 10 0 0 1 98 56 V72 Z"/></g>',
    jiangnan: '<rect x="0" y="34" width="120" height="14" fill="#8fb3c8"/><g fill="#f6f2e8" stroke="#8f887a"><rect x="6" y="14" width="22" height="20"/><rect x="34" y="14" width="22" height="20"/><rect x="88" y="14" width="24" height="20"/><rect x="6" y="48" width="26" height="20"/><rect x="90" y="48" width="22" height="20"/></g><g fill="' + TILE + '"><polygon points="4,14 17,6 30,14"/><polygon points="32,14 45,6 58,14"/><polygon points="86,14 100,6 114,14"/></g><path d="M58 34 Q68 20 78 34" fill="none" stroke="#8f887a" stroke-width="4"/>'
  };

  function buildHomes() {
    var grid = el('div', { 'class': 'mj-homes' });
    D.homes.items.forEach(function (h) {
      var art = el('div', { 'class': 'mj-home-art', 'aria-hidden': 'true' });
      art.innerHTML = '<svg viewBox="0 0 120 80">' + (HOME_ART[h.art] || '') + '</svg>';
      var body = [
        el('div', { 'class': 'wx-roof-top' }, [el('h3', { 'class': 'wx-roof-name', text: h.name }), el('span', { 'class': 'wx-tag', text: h.area })]),
        el('p', { 'class': 'wx-line', text: h.line }),
        el('div', { 'class': 'wx-pills' }, h.keys.map(function (k) { return el('span', { 'class': 'wx-pill', text: k }); })),
        el('p', { 'class': 'mj-home-text', text: h.text })
      ];
      if (h.case) body.push(el('p', { 'class': 'mj-home-text', text: h.case }));
      if (h.note) body.push(el('div', { 'class': 'wx-fields' }, [el('div', { 'class': 'is-note' }, [el('dt', { text: '注意' }), el('dd', { text: h.note })])]));
      grid.appendChild(el('article', { 'class': 'mj-home wx-paper' }, [art, el('div', { 'class': 'mj-home-body' }, body)]));
    });
    return el('section', { 'class': 'wx-section', 'aria-label': '七种地方民居' }, [
      el('div', { 'class': 'wx-sec-title', text: '七种地方民居' }),
      el('p', { 'class': 'wx-lead', text: D.homes.text }),
      grid
    ]);
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
    return el('section', { 'class': 'wx-section', 'aria-label': '五个常见的说法' }, [
      el('div', { 'class': 'wx-sec-title', text: '五个常见的说法' }), grid
    ]);
  }

  function buildSee() {
    return el('section', { 'class': 'wx-section', 'aria-label': '另见' }, [
      el('div', { 'class': 'wx-sec-title', text: '另见' }),
      el('div', { 'class': 'mj-see' }, D.see.map(function (s) {
        return el('a', { 'class': 'wx-next', href: s.href }, [
          el('span', { 'class': 'wx-next-label', text: s.name }),
          el('span', { text: s.text + ' →' })
        ]);
      }))
    ]);
  }

  function notesBlock(summary, arr) {
    return el('details', { 'class': 'wx-notes' }, [
      el('summary', { text: summary }),
      el('div', { 'class': 'wx-notes-body' }, arr.map(function (n) {
        var m = n.match(/^([^：]{1,4})：(.*)$/);
        return el('p', {}, m ? [el('span', { 'class': 'wx-note-label', text: m[1] }), document.createTextNode(m[2])] : [document.createTextNode(n)]);
      }))
    ]);
  }

  function render() {
    var page = el('div', { 'class': 'wx-page' });
    page.appendChild(el('div', { 'class': 'wx-head' }, [
      el('div', { 'class': 'wx-eyebrow', text: '物 · 中国古代建筑 · 院落与民居' }),
      el('h1', { 'class': 'wx-hook', text: D.hook }),
      el('p', { 'class': 'wx-answer', text: D.answer })
    ]));
    page.appendChild(el('p', { 'class': 'wx-lead', text: D.intro }));
    page.appendChild(buildCourt());
    page.appendChild(buildHomes());
    page.appendChild(buildMyths());
    page.appendChild(el('blockquote', { 'class': 'mj-closing wx-paper' }, [el('p', { text: D.closing })]));
    page.appendChild(buildSee());
    page.appendChild(el('div', { 'class': 'wx-tip' }, [el('div', { 'class': 'wx-tip-label', text: '小提示' }), el('p', { text: D.tip })]));
    page.appendChild(notesBlock('批注', D.notes));
    root.textContent = '';
    root.appendChild(page);
  }

  render();
})();
