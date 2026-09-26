
/* 知否知否 · "建筑"入口页脚本
   数据来自 data/jianzhuindex.js（window.ZHIFOU_JIANZHUINDEX），本文件只负责排版。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_JIANZHUINDEX;
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

  /* 一幅固定的线稿：一座木构大殿的正面（不来自数据） */
  function artHouse() {
    var dou = '';
    for (var i = 0; i < 8; i++) dou += '<rect x="' + (62 + i * 26) + '" y="72" width="16" height="8" fill="#c9a56b"/>';
    return '<svg viewBox="0 0 320 170" role="img" aria-label="一座木构大殿的正面：台基、红柱、斗拱和大屋顶">' +
      '<rect x="36" y="140" width="248" height="14" fill="#b9b1a0" stroke="#8f887a"/>' +
      '<rect x="138" y="154" width="44" height="8" fill="#cfc8ba" stroke="#8f887a"/>' +
      '<rect x="118" y="88" width="84" height="52" fill="#e6d9bd"/>' +
      '<line x1="160" y1="88" x2="160" y2="140" stroke="#8f7a55" stroke-width="1.5"/>' +
      '<rect x="68" y="88" width="10" height="52" fill="#b23a2e"/>' +
      '<rect x="112" y="88" width="10" height="52" fill="#b23a2e"/>' +
      '<rect x="198" y="88" width="10" height="52" fill="#b23a2e"/>' +
      '<rect x="242" y="88" width="10" height="52" fill="#b23a2e"/>' +
      '<rect x="54" y="80" width="212" height="8" fill="#7d2a20"/>' + dou +
      '<path d="M12 70 Q70 64 92 30 L228 30 Q250 64 308 70 Q254 76 236 66 L84 66 Q66 76 12 70 Z" fill="#3d3a36"/>' +
      '<rect x="86" y="23" width="148" height="9" rx="3" fill="#2b2926"/>' +
      '<circle cx="90" cy="20" r="6" fill="#2b2926"/><circle cx="230" cy="20" r="6" fill="#2b2926"/>' +
      '</svg>';
  }

  function buildRoute(r, idx) {
    var pills = el('div', { 'class': 'wx-pills' }, r.pages.map(function (p) {
      return el('a', { 'class': 'wx-pill is-link', href: p.href, text: p.name });
    }));
    return el('div', { 'class': 'jz-route wx-paper' }, [
      el('span', { 'class': 'jz-route-no', text: ['一', '二', '三', '四', '五'][idx] || String(idx + 1) }),
      el('div', { 'class': 'jz-route-name', text: r.name }),
      el('p', { 'class': 'jz-route-line', text: r.line }),
      pills
    ]);
  }

  function buildCard(p, idx) {
    var no = (idx < 9 ? '0' : '') + (idx + 1);
    var tags = el('div', { 'class': 'wx-pills' }, p.tags.map(function (t) { return el('span', { 'class': 'wx-pill', text: t }); }));
    return el('a', { 'class': 'jz-card wx-paper', href: p.href, 'aria-label': p.name + '：' + p.line }, [
      el('span', { 'class': 'jz-card-no', text: no }),
      el('span', { 'class': 'jz-card-name', text: p.name }),
      el('span', { 'class': 'jz-card-line', text: p.line }),
      tags,
      el('span', { 'class': 'jz-card-go', 'aria-hidden': 'true', text: '进入 →' })
    ]);
  }

  function render() {
    var page = el('div', { 'class': 'wx-page' });

    page.appendChild(el('div', { 'class': 'wx-head' }, [
      el('div', { 'class': 'wx-eyebrow', text: '建筑' }),
      el('h1', { 'class': 'wx-hook', text: D.hook }),
      el('p', { 'class': 'wx-answer', text: D.answer })
    ]));
    page.appendChild(el('p', { 'class': 'wx-lead', text: D.intro }));

    var art = el('div', { 'class': 'jz-art wx-paper', 'aria-hidden': 'true' });
    art.innerHTML = artHouse();
    page.appendChild(art);

    page.appendChild(el('section', { 'class': 'wx-section', 'aria-label': '三条路线' }, [
      el('div', { 'class': 'wx-sec-title', text: '三条路线' }),
      el('div', { 'class': 'jz-routes' }, D.routes.map(buildRoute))
    ]));

    page.appendChild(el('section', { 'class': 'wx-section', 'aria-label': '全部页面' }, [
      el('div', { 'class': 'wx-sec-title', text: '全部八页' }),
      el('div', { 'class': 'jz-grid' }, D.pages.map(buildCard))
    ]));

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
