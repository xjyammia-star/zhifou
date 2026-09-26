/* 知否知否 · "物"·中国古代建筑（楼阁与匾额对联页）脚本
   数据来自 data/louge.js（window.ZHIFOU_LOUGE），本文件只负责排版和交互。
   八种建筑的小线稿、匾额示意图是固定的线稿，文字来自数据。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_LOUGE;
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
  function figure(svgHtml, cls) {
    var f = el('div', { 'class': 'mg-fig ' + (cls || '') });
    f.innerHTML = svgHtml;
    return f;
  }

  var RED = '#b23a2e', TILE = '#3d3a36', WALL = '#efe3c8', WALL_D = '#8f7a55', STONE = '#b9b1a0', WATER = '#8fb3c8', SCENE = '#dbe7dc', BEAM = '#a8592f';

  /* ---------- 八种建筑的小线稿（120 × 80） ---------- */
  function roof(x1, x2, y, h) { return '<polygon points="' + x1 + ',' + y + ' ' + ((x1 + x2) / 2) + ',' + (y - h) + ' ' + x2 + ',' + y + '" fill="' + TILE + '"/>'; }
  function rect(x, y, w, h, fill, stroke) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '"' : '') + '/>'; }
  var ICON = {
    lou: rect(26, 72, 68, 4, STONE) + rect(32, 48, 56, 24, WALL, WALL_D) + rect(34, 48, 4, 24, RED) + rect(82, 48, 4, 24, RED) + roof(24, 96, 48, 8) +
      rect(44, 28, 32, 12, WALL, WALL_D) + rect(46, 28, 3, 12, RED) + rect(71, 28, 3, 12, RED) + roof(38, 82, 28, 10),
    ge: rect(30, 60, 4, 16, RED) + rect(58, 60, 4, 16, RED) + rect(86, 60, 4, 16, RED) + rect(24, 54, 72, 6, STONE) +
      rect(34, 32, 52, 22, WALL, WALL_D) + rect(36, 32, 4, 22, RED) + rect(80, 32, 4, 22, RED) + roof(26, 94, 32, 14),
    ting: rect(24, 68, 72, 5, STONE) + rect(32, 40, 4, 28, RED) + rect(50, 40, 4, 28, RED) + rect(68, 40, 4, 28, RED) + rect(86, 40, 4, 28, RED) + roof(20, 100, 40, 22),
    tai: '<polygon points="16,72 34,38 86,38 104,72" fill="#c9c1ae" stroke="#8f887a"/><path d="M26 56 H94 M22 64 H98" stroke="#8f887a" fill="none"/>' +
      rect(48, 30, 24, 8, WALL, WALL_D) + roof(42, 78, 30, 10),
    xie: rect(0, 60, 120, 20, WATER) + rect(26, 54, 68, 6, BEAM) + rect(32, 36, 4, 18, RED) + rect(84, 36, 4, 18, RED) + roof(22, 98, 36, 14) +
      '<path d="M30 68 h20 M64 72 h24" stroke="#c9dde8" stroke-width="2" fill="none"/>',
    xuan: rect(26, 70, 68, 4, STONE) + rect(32, 38, 56, 32, WALL, WALL_D) + rect(34, 38, 3, 32, RED) + rect(83, 38, 3, 32, RED) +
      rect(44, 46, 32, 16, SCENE, WALL_D) + '<path d="M60 46 V62 M44 54 H76" stroke="' + WALL_D + '" stroke-width="1.5"/>' + roof(24, 96, 38, 14),
    fang: rect(0, 56, 120, 24, WATER) + '<polygon points="16,54 104,54 92,68 28,68" fill="' + BEAM + '" stroke="#7d3f1f"/>' +
      rect(40, 40, 40, 14, WALL, WALL_D) + roof(32, 88, 40, 10) + '<path d="M104 54 Q114 46 108 40" stroke="#7d3f1f" stroke-width="3" fill="none"/>' +
      '<path d="M18 74 h16 M70 74 h22" stroke="#c9dde8" stroke-width="2" fill="none"/>',
    lang: '<polygon points="6,34 114,34 106,22 14,22" fill="' + TILE + '"/>' + rect(12, 34, 3, 32, RED) + rect(32, 34, 3, 32, RED) + rect(52, 34, 3, 32, RED) + rect(72, 34, 3, 32, RED) + rect(92, 34, 3, 32, RED) + rect(106, 34, 3, 32, RED) +
      rect(6, 66, 108, 4, STONE) + rect(6, 54, 108, 2, '#c9a56b')
  };

  function plaqueSvg(text) {
    return '<svg viewBox="0 0 260 130" role="img" aria-label="一块题着“' + text + '”的匾额">' +
      '<path d="M62 14 V4 M198 14 V4" stroke="#7d6a52" stroke-width="3" fill="none"/>' +
      '<rect x="10" y="14" width="240" height="100" rx="5" fill="#2b2118" stroke="#c9a13b" stroke-width="5"/>' +
      '<rect x="22" y="26" width="216" height="76" fill="none" stroke="#c9a13b" stroke-width="1.5"/>' +
      '<text class="lg-plaque-text" x="130" y="80" text-anchor="middle">' + text + '</text>' +
      '<rect x="212" y="84" width="14" height="14" fill="' + RED + '"/></svg>';
  }

  /* ---------- 一、八种建筑 ---------- */
  function buildNames() {
    var grid = el('div', { 'class': 'lg-names' });
    D.names.items.forEach(function (n) {
      var art = el('div', { 'class': 'mj-home-art', 'aria-hidden': 'true' });
      art.innerHTML = '<svg viewBox="0 0 120 80">' + (ICON[n.art] || '') + '</svg>';
      grid.appendChild(el('article', { 'class': 'mj-home wx-paper' }, [
        art,
        el('div', { 'class': 'mj-home-body' }, [
          el('h3', { 'class': 'wx-roof-name', text: n.name }),
          el('p', { 'class': 'mj-home-text', text: n.text }),
          el('div', { 'class': 'yl-eg' }, [el('span', { 'class': 'wx-see-label', text: '常见' })].concat(n.uses.map(function (u) { return el('span', { 'class': 'wx-pill', text: u }); })))
        ])
      ]));
    });
    return el('section', { 'class': 'wx-section', 'aria-label': '八种建筑' }, [
      el('div', { 'class': 'wx-sec-title', text: '楼、阁、亭、台、轩、榭、舫、廊' }),
      el('p', { 'class': 'wx-lead', text: D.names.text }),
      grid,
      el('div', { 'class': 'wx-fields wx-paper gd-note' }, [el('div', { 'class': 'is-note' }, [el('dt', { text: '辨析' }), el('dd', { text: D.names.note })])])
    ]);
  }

  /* ---------- 二、匾额 ---------- */
  function buildPlaque() {
    var P = D.plaque;
    var side = el('div', { 'class': 'mg-joint-side' }, [
      el('div', { 'class': 'wx-paper mg-box' }, [
        el('p', { 'class': 'wx-line', text: P.text }),
        el('div', { 'class': 'wx-see-label lg-label', text: '常见的七种' }),
        el('div', { 'class': 'wx-pills' }, P.types.map(function (t) { return el('span', { 'class': 'wx-pill', text: t }); }))
      ]),
      el('div', { 'class': 'wx-paper mg-box' }, [el('div', { 'class': 'wx-fields' }, [el('div', { 'class': 'is-note' }, [el('dt', { text: '怎么读' }), el('dd', { text: P.read })])])])
    ]);
    return el('section', { 'class': 'wx-section', 'aria-label': '匾额' }, [
      el('div', { 'class': 'wx-sec-title', text: '匾额：挂在门楣上的字' }),
      el('div', { 'class': 'wx-explore' }, [
        el('div', { 'class': 'wx-scene' }, [figure(plaqueSvg(P.sample), 'lg-plaque'), el('p', { 'class': 'wx-hint', text: P.caption })]),
        side
      ])
    ]);
  }

  /* ---------- 三、对联 ---------- */
  function rowOf(label, segs, wrap) {
    var cells = el('div', { 'class': 'lg-cells' + (wrap ? ' is-wrap' : '') });
    segs.forEach(function (s, i) {
      var seg = el('div', { 'class': 'lg-seg', 'data-seg': String(i) });
      seg.style.flex = wrap ? '0 0 auto' : s.length + ' 1 0';
      s.split('').forEach(function (ch) { seg.appendChild(el('span', { 'class': 'lg-cell', text: ch })); });
      cells.appendChild(seg);
    });
    return el('div', { 'class': 'lg-row' }, [el('span', { 'class': 'lg-side', text: label }), cells]);
  }

  function buildCouplet() {
    var C = D.couplet;
    var first = C.items[0], second = C.items[1];

    /* 杜甫草堂：上下联字字对位 */
    var box = el('div', { 'class': 'lg-couplet wx-paper' });
    var rowUp = rowOf('上联', first.up), rowDown = rowOf('下联', first.down);
    var info = el('p', { 'class': 'lg-info', 'aria-live': 'polite', text: '点一组，看上联和下联的字数。' });
    var btns = [];
    var bar = el('div', { 'class': 'wx-chips', role: 'group', 'aria-label': '选一组' });
    function pick(i) {
      btns.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      [rowUp, rowDown].forEach(function (r) {
        Array.prototype.forEach.call(r.querySelectorAll('.lg-seg'), function (s) { s.classList.toggle('is-on', s.getAttribute('data-seg') === String(i)); });
      });
      info.textContent = '第 ' + (i + 1) + ' 组：上联“' + first.up[i] + '”，' + first.up[i].length + ' 个字；下联“' + first.down[i] + '”，' + first.down[i].length + ' 个字。字数相等。';
    }
    first.up.forEach(function (s, i) {
      var b = el('button', { type: 'button', 'class': 'wx-chip', 'aria-pressed': 'false', text: '第 ' + (i + 1) + ' 组（' + s.length + ' 字）' });
      b.addEventListener('click', function () { pick(i); });
      btns.push(b);
      bar.appendChild(b);
    });
    [rowUp, rowDown].forEach(function (r) {
      Array.prototype.forEach.call(r.querySelectorAll('.lg-seg'), function (s) {
        s.addEventListener('click', function () { pick(parseInt(s.getAttribute('data-seg'), 10)); });
      });
    });
    box.appendChild(el('h3', { 'class': 'wx-myth-title', text: first.name }));
    box.appendChild(el('p', { 'class': 'lg-author', text: first.author }));
    box.appendChild(rowUp);
    box.appendChild(rowDown);
    box.appendChild(info);
    box.appendChild(bar);
    box.appendChild(el('p', { 'class': 'wx-line', text: first.text }));

    /* 大观楼长联：只有开篇 */
    var box2 = el('div', { 'class': 'lg-couplet wx-paper' }, [
      el('h3', { 'class': 'wx-myth-title', text: second.name }),
      el('p', { 'class': 'lg-author', text: second.author }),
      rowOf('开篇', second.open, true),
      el('p', { 'class': 'wx-line', text: second.text }),
      el('div', { 'class': 'wx-fields' }, [el('div', { 'class': 'is-note' }, [el('dt', { text: '提醒' }), el('dd', { text: second.warn })])])
    ]);

    var rules = el('div', { 'class': 'wx-paper mg-box' }, [
      el('div', { 'class': 'wx-see-label lg-label', text: '对联的四条要求' }),
      el('ol', { 'class': 'lg-rules' }, C.rules.map(function (r, i) { return el('li', { 'class': i === 0 ? 'is-done' : '' }, [el('span', { text: r }), i === 0 ? el('span', { 'class': 'lg-rule-tag', text: '下面这副对联，可以对照' }) : null]); })),
      el('div', { 'class': 'wx-see-label lg-label', text: '常写的内容' }),
      el('div', { 'class': 'wx-pills' }, C.contentTypes.map(function (t) { return el('span', { 'class': 'wx-pill', text: t }); }))
    ]);

    return el('section', { 'class': 'wx-section', 'aria-label': '对联' }, [
      el('div', { 'class': 'wx-sec-title', text: '对联：一个字对着一个字' }),
      el('p', { 'class': 'wx-lead', text: C.text }),
      el('p', { 'class': 'wx-lead', text: C.content }),
      rules,
      el('p', { 'class': 'wx-hint', text: C.align }),
      box,
      box2
    ]);
  }

  /* ---------- 四、四处因文章而出名的楼亭 ---------- */
  function buildStories() {
    var S = D.stories;
    var grid = el('div', { 'class': 'gd-cards gd-cards-2' }, S.items.map(function (s) {
      return el('article', { 'class': 'gd-card wx-paper' }, [
        el('h3', { 'class': 'gd-card-name', text: s.name }),
        el('div', { 'class': 'wx-pills yl-pills' }, [el('span', { 'class': 'wx-pill', text: s.essay })]),
        el('p', { 'class': 'gd-card-text', text: s.text }),
        el('div', { 'class': 'wx-fields' }, [el('div', { 'class': 'is-note' }, [el('dt', { text: '文化意义' }), el('dd', { text: s.meaning })])])
      ]);
    }));
    var four = el('div', { 'class': 'wx-paper mg-box' }, [
      el('p', { 'class': 'wx-line', text: S.note }),
      el('div', { 'class': 'wx-pills' }, S.four.map(function (t, i) { return el('span', { 'class': 'wx-pill is-place', text: (i + 1) + ' ' + t }); }))
    ]);
    return el('section', { 'class': 'wx-section', 'aria-label': '因文章而出名的楼亭' }, [
      el('div', { 'class': 'wx-sec-title', text: '一篇文章，成就一座楼' }),
      el('p', { 'class': 'wx-lead', text: S.text }),
      grid,
      four
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
        return el('a', { 'class': 'wx-next', href: s.href }, [el('span', { 'class': 'wx-next-label', text: s.name }), el('span', { text: s.text + ' →' })]);
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
      el('div', { 'class': 'wx-eyebrow', text: '建筑 · 楼阁与匾额对联' }),
      el('h1', { 'class': 'wx-hook', text: D.hook }),
      el('p', { 'class': 'wx-answer', text: D.answer })
    ]));
    page.appendChild(el('p', { 'class': 'wx-lead', text: D.intro }));
    page.appendChild(buildNames());
    page.appendChild(buildPlaque());
    page.appendChild(buildCouplet());
    page.appendChild(buildStories());
    page.appendChild(buildMyths());
    page.appendChild(buildSee());
    page.appendChild(el('div', { 'class': 'wx-tip' }, [el('div', { 'class': 'wx-tip-label', text: '小提示' }), el('p', { text: D.tip })]));
    page.appendChild(notesBlock('批注', D.notes));
    root.textContent = '';
    root.appendChild(page);
  }

  render();
})();
