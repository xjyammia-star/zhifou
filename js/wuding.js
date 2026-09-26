/* 知否知否 · "物"·中国古代建筑（屋顶与脊兽页）脚本
   数据来自 data/wuding.js（window.ZHIFOU_WUDING），本文件只负责排版和交互。
   六种屋顶、屋脊示意图是固定的线稿（下面的 ROOF_ART / ridgeSvg），文字来自数据。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_WUDING;
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

  /* ---------- 六种屋顶的线稿（200 × 130） ---------- */
  var TILE = '#3d3a36', RIDGE = '#2b2926', WALL = '#efe3c8', RED = '#b23a2e', STONE = '#b9b1a0', BRICK = '#cfc6b0';

  function frontBase(x1, x2) {
    var w = x2 - x1, cols = '';
    for (var i = 0; i < 4; i++) cols += '<rect x="' + (x1 + (w - 5) * i / 3) + '" y="84" width="5" height="28" fill="' + RED + '"/>';
    return '<rect x="16" y="112" width="168" height="8" fill="' + STONE + '"/>' +
      '<rect x="' + x1 + '" y="84" width="' + w + '" height="28" fill="' + WALL + '"/>' + cols;
  }

  var ROOF_ART = {
    '庑殿顶': frontBase(40, 160) +
      '<path d="M10 86 Q40 84 64 40 L136 40 Q160 84 190 86 Z" fill="' + TILE + '"/>' +
      '<path d="M64 40 L30 85 M136 40 L170 85" stroke="rgba(255,255,255,0.28)" stroke-width="1.5" fill="none"/>' +
      '<rect x="60" y="35" width="80" height="6" rx="2" fill="' + RIDGE + '"/>',
    '歇山顶': frontBase(40, 160) +
      '<path d="M8 86 Q30 84 46 64 L154 64 Q170 84 192 86 Z" fill="' + TILE + '"/>' +
      '<path d="M50 64 L64 38 L136 38 L150 64 Z" fill="#4c4843"/>' +
      '<path d="M50 64 L64 38 M150 64 L136 38" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" fill="none"/>' +
      '<rect x="60" y="33" width="80" height="6" rx="2" fill="' + RIDGE + '"/>',
    '悬山顶': '<rect x="16" y="112" width="168" height="8" fill="' + STONE + '"/>' +
      '<polygon points="44,92 100,52 156,92 156,112 44,112" fill="' + WALL + '"/>' +
      '<rect x="44" y="92" width="112" height="20" fill="' + WALL + '"/>' +
      '<path d="M6 92 L100 32 L194 92 L184 92 L100 43 L16 92 Z" fill="' + TILE + '"/>' +
      '<g fill="' + RIDGE + '"><circle cx="30" cy="80" r="3"/><circle cx="52" cy="66" r="3"/><circle cx="148" cy="66" r="3"/><circle cx="170" cy="80" r="3"/></g>',
    '硬山顶': '<rect x="16" y="112" width="168" height="8" fill="' + STONE + '"/>' +
      '<polygon points="46,112 46,82 100,44 154,82 154,112" fill="' + BRICK + '"/>' +
      '<path d="M46 100 H154 M46 90 H154 M62 82 V112 M100 60 V112 M138 82 V112" stroke="rgba(0,0,0,0.12)" stroke-width="1" fill="none"/>' +
      '<polyline points="46,82 100,42 154,82" fill="none" stroke="' + TILE + '" stroke-width="9" stroke-linejoin="miter"/>',
    '攒尖顶': frontBase(54, 146) +
      '<path d="M20 88 Q64 82 96 34 L104 34 Q136 82 180 88 Z" fill="' + TILE + '"/>' +
      '<path d="M96 34 L60 84 M104 34 L140 84" stroke="rgba(255,255,255,0.28)" stroke-width="1.5" fill="none"/>' +
      '<line x1="100" y1="12" x2="100" y2="34" stroke="' + RIDGE + '" stroke-width="3"/><circle cx="100" cy="12" r="5" fill="' + RIDGE + '"/>',
    '卷棚顶': frontBase(40, 160) +
      '<path d="M10 88 Q40 86 62 58 Q100 32 138 58 Q160 86 190 88 Z" fill="' + TILE + '"/>' +
      '<path d="M62 58 Q100 32 138 58" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>'
  };

  function roofSvg(name) {
    return '<svg viewBox="0 0 200 130" role="img" aria-label="' + name + '的线稿">' + (ROOF_ART[name] || '') + '</svg>';
  }

  /* ---------- 屋脊示意图（560 × 260） ---------- */
  var RIDGE_COLOR = { '正脊': '#d9a441', '垂脊': '#e0806a', '戗脊': '#7fb0d6', '檐口': '#8fcaa5' };

  function ridgeSvg() {
    function lab(x, y, name, anchor) {
      return '<text x="' + x + '" y="' + y + '" text-anchor="' + anchor + '" style="fill:' + RIDGE_COLOR[name] + '" class="wx-ridge-label">' + name + '</text>';
    }
    function leader(x1, y1, x2, y2, name) {
      return '<path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '" stroke="' + RIDGE_COLOR[name] + '" stroke-width="1.5" fill="none"/><circle cx="' + x2 + '" cy="' + y2 + '" r="3.5" fill="' + RIDGE_COLOR[name] + '"/>';
    }
    return '<svg viewBox="0 0 560 260" role="img" aria-label="一座歇山顶的示意图，标出正脊、垂脊、戗脊和檐口">' +
      '<rect x="110" y="192" width="340" height="40" fill="' + WALL + '"/>' +
      '<g fill="' + RED + '"><rect x="118" y="192" width="8" height="40"/><rect x="216" y="192" width="8" height="40"/><rect x="336" y="192" width="8" height="40"/><rect x="434" y="192" width="8" height="40"/></g>' +
      '<rect x="90" y="232" width="380" height="10" fill="' + STONE + '"/>' +
      '<path d="M30 192 Q84 190 116 130 L444 130 Q476 190 530 192 Z" fill="' + TILE + '"/>' +
      '<path d="M150 130 L190 70 L370 70 L410 130 Z" fill="#4c4843"/>' +
      '<path d="M184 70 L376 70" stroke="' + RIDGE_COLOR['正脊'] + '" stroke-width="10" stroke-linecap="round"/>' +
      '<circle cx="182" cy="64" r="8" fill="' + RIDGE + '"/><circle cx="378" cy="64" r="8" fill="' + RIDGE + '"/>' +
      '<path d="M190 72 L150 130 M370 72 L410 130" stroke="' + RIDGE_COLOR['垂脊'] + '" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M150 130 L44 190 M410 130 L516 190" stroke="' + RIDGE_COLOR['戗脊'] + '" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M30 192 H530" stroke="' + RIDGE_COLOR['檐口'] + '" stroke-width="5" stroke-linecap="round"/>' +
      leader(280, 34, 280, 66, '正脊') + lab(280, 26, '正脊', 'middle') +
      leader(470, 96, 396, 100, '垂脊') + lab(478, 102, '垂脊', 'start') +
      leader(92, 96, 98, 158, '戗脊') + lab(84, 90, '戗脊', 'end') +
      leader(40, 238, 46, 193, '檐口') + lab(16, 256, '檐口', 'start') +
      '</svg>';
  }

  /* ---------- 五块内容 ---------- */
  function buildRoofs() {
    var grid = el('div', { 'class': 'wx-roofs' });
    D.roofs.forEach(function (r) {
      var art = el('div', { 'class': 'wx-roof-art' });
      art.innerHTML = roofSvg(r.name);
      grid.appendChild(el('article', { 'class': 'wx-roof wx-paper' }, [
        art,
        el('div', { 'class': 'wx-roof-body' }, [
          el('div', { 'class': 'wx-roof-top' }, [el('h3', { 'class': 'wx-roof-name', text: r.name }), el('span', { 'class': 'wx-tag', text: r.view })]),
          el('p', { 'class': 'wx-line', text: r.line }),
          el('dl', { 'class': 'wx-fields' }, [
            el('div', {}, [el('dt', { text: '形制' }), el('dd', { text: r.form })]),
            el('div', {}, [el('dt', { text: '等级线索' }), el('dd', { text: r.rank })])
          ])
        ])
      ]));
    });
    return el('section', { 'class': 'wx-section', 'aria-label': '六种屋顶' }, [
      el('div', { 'class': 'wx-sec-title', text: '六种屋顶' }), grid
    ]);
  }

  function buildLadder() {
    var rows = el('div', { 'class': 'wx-ladder' });
    D.ladder.levels.forEach(function (l, i) {
      var row = el('div', { 'class': 'wx-rung wx-paper', 'data-level': String(i + 1) }, [
        el('span', { 'class': 'wx-rung-no', text: l.level }),
        el('div', { 'class': 'wx-rung-body' }, [
          el('div', { 'class': 'wx-rung-roofs', text: l.roofs.join('、') }),
          el('p', { 'class': 'wx-rung-text', text: l.text })
        ])
      ]);
      rows.appendChild(row);
    });
    return el('section', { 'class': 'wx-section', 'aria-label': '屋顶等级的识读线索' }, [
      el('div', { 'class': 'wx-sec-title', text: '屋顶等级的识读线索' }),
      el('p', { 'class': 'wx-lead', text: D.ladder.text }),
      rows,
      el('p', { 'class': 'wx-hint', text: D.ladder.remark })
    ]);
  }

  function buildRidges() {
    var fig = el('div', { 'class': 'wx-ridge-fig wx-paper' });
    fig.innerHTML = ridgeSvg();
    var list = el('dl', { 'class': 'wx-ridge-list' });
    D.ridges.items.forEach(function (it) {
      var dt = el('dt', {}, [el('span', { 'class': 'wx-dot', style: 'background:' + (RIDGE_COLOR[it.name] || '#999') }), document.createTextNode(it.name)]);
      list.appendChild(el('div', { 'class': 'wx-ridge-item' }, [dt, el('dd', { text: it.text })]));
    });
    var wen = el('div', { 'class': 'wx-wen wx-paper' }, [
      el('h3', { 'class': 'wx-wen-title', text: '正脊两端的吻兽' }),
      el('p', { 'class': 'wx-line', text: D.wen.text }),
      el('div', { 'class': 'wx-fields' }, [el('div', { 'class': 'is-note' }, [el('dt', { text: '辨析' }), el('dd', { text: D.wen.note })])])
    ]);
    return el('section', { 'class': 'wx-section', 'aria-label': '屋脊与吻兽' }, [
      el('div', { 'class': 'wx-sec-title', text: '屋脊与吻兽' }),
      el('p', { 'class': 'wx-lead', text: D.ridges.text }),
      el('div', { 'class': 'wx-ridge-wrap' }, [el('div', { 'class': 'wx-ridge-main' }, [fig, list]), wen])
    ]);
  }

  function buildBeasts() {
    var B = D.beasts;
    var tokens = [];
    var row = el('div', { 'class': 'wx-beasts-row', role: 'list', 'aria-label': '檐角上的小兽，从最前端数起' });
    function token(name, no, cls) {
      var t = el('div', { 'class': 'wx-beast ' + cls, role: 'listitem' }, [
        el('span', { 'class': 'wx-beast-no', text: no }),
        el('span', { 'class': 'wx-beast-name' + (name.length > 3 ? ' is-long' : ''), text: name })
      ]);
      row.appendChild(t);
      return t;
    }
    token(B.immortal, '仙', 'is-immortal');
    B.list.forEach(function (n, i) { tokens.push(token(n, String(i + 1), '')); });

    var info = el('div', { 'class': 'wx-beast-info wx-paper', 'aria-live': 'polite' });
    var btns = {};
    var bar = el('div', { 'class': 'wx-chips', role: 'group', 'aria-label': '选择走兽的数量' });

    function show(c) {
      tokens.forEach(function (t, i) { t.classList.toggle('is-on', i < c.count); });
      Object.keys(btns).forEach(function (k) { btns[k].setAttribute('aria-pressed', k === String(c.count) ? 'true' : 'false'); });
      info.textContent = '';
      info.appendChild(el('div', { 'class': 'wx-beast-count', text: c.count + ' 个走兽' + (c.buildings.length ? '：' + c.buildings.join('、') : '') }));
      info.appendChild(el('p', { 'class': 'wx-line', text: c.text }));
    }

    B.counts.forEach(function (c) {
      var b = el('button', { type: 'button', 'class': 'wx-chip-w', 'aria-pressed': 'false', text: c.count + ' 个' + (c.buildings.length ? '｜' + c.buildings.join('、') : '') });
      b.addEventListener('click', function () { show(c); });
      btns[String(c.count)] = b;
      bar.appendChild(b);
    });

    var last = B.counts[B.counts.length - 1];
    show(last);

    var linkBox = null;
    if (B.linkUrl) {
      linkBox = el('p', { 'class': 'wx-hint' }, [
        document.createTextNode('出处：'),
        el('a', { href: B.linkUrl, target: '_blank', rel: 'noopener noreferrer', text: B.linkLabel })
      ]);
    }

    return el('section', { 'class': 'wx-section', 'aria-label': '檐角走兽' }, [
      el('div', { 'class': 'wx-sec-title', text: '檐角走兽：数一数' }),
      el('p', { 'class': 'wx-lead', text: B.text }),
      el('p', { 'class': 'wx-lead', text: B.rule }),
      bar,
      el('div', { 'class': 'wx-beasts-wrap' }, [
        el('div', { 'class': 'wx-beasts-dir' }, [el('span', { text: '檐角最前端' }), el('span', { 'class': 'wx-beasts-line', 'aria-hidden': 'true' }), el('span', { text: '正脊方向' })]),
        row
      ]),
      info,
      el('p', { 'class': 'wx-hint', text: B.direction }),
      el('p', { 'class': 'wx-hint', text: B.remark }),
      linkBox
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

  function render() {
    var page = el('div', { 'class': 'wx-page' });
    page.appendChild(el('div', { 'class': 'wx-head' }, [
      el('div', { 'class': 'wx-eyebrow', text: '建筑 · 屋顶与脊兽' }),
      el('h1', { 'class': 'wx-hook', text: D.hook }),
      el('p', { 'class': 'wx-answer', text: D.answer })
    ]));
    page.appendChild(el('p', { 'class': 'wx-lead', text: D.intro }));
    page.appendChild(buildRoofs());
    page.appendChild(buildLadder());
    page.appendChild(buildRidges());
    page.appendChild(buildBeasts());
    page.appendChild(buildMyths());
    page.appendChild(el('div', { 'class': 'wx-tip' }, [el('div', { 'class': 'wx-tip-label', text: '小提示' }), el('p', { text: D.tip })]));
    page.appendChild(el('details', { 'class': 'wx-notes' }, [
      el('summary', { text: '批注' }),
      el('div', { 'class': 'wx-notes-body' }, D.notes.map(function (n) {
        var m = n.match(/^([^：]{1,4})：(.*)$/);
        return el('p', {}, m ? [el('span', { 'class': 'wx-note-label', text: m[1] }), document.createTextNode(m[2])] : [document.createTextNode(n)]);
      }))
    ]));
    root.textContent = '';
    root.appendChild(page);
  }

  render();
})();
