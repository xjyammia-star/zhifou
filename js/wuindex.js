/* 知否知否 · "物"入口页（书斋）脚本
   数据来自 data/wuindex.js（window.ZHIFOU_WUINDEX），本文件只负责排版。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_WUINDEX;
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

  /* 两幅小插图：都是固定的线稿，不来自数据 */
  function artStudy() {
    return '<svg viewBox="0 0 320 170" role="img" aria-label="一方砚台、一块墨和一支毛笔">' +
      '<rect x="60" y="92" width="110" height="62" rx="12" fill="#2b3033"/>' +
      '<rect x="68" y="100" width="94" height="46" rx="8" fill="none" stroke="#59636a" stroke-width="1.5"/>' +
      '<ellipse cx="94" cy="116" rx="19" ry="11" fill="#0e1214"/>' +
      '<rect x="190" y="118" width="72" height="24" rx="2" fill="#1a1410"/>' +
      '<rect x="205" y="128" width="42" height="4" fill="#b8934a"/>' +
      '<g transform="rotate(-26 170 66)">' +
      '<rect x="70" y="60" width="132" height="8" rx="4" fill="#c9a56b"/>' +
      '<rect x="198" y="57" width="9" height="14" rx="2" fill="#7a4b2b"/>' +
      '<path d="M207 59 Q240 56 262 64 Q240 73 207 69 Z" fill="#2b2118"/>' +
      '</g>' +
      '<rect x="262" y="24" width="20" height="20" rx="2" fill="#b23a2e"/>' +
      '</svg>';
  }
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

  function buildDoor(c) {
    var art = el('div', { 'class': 'wx-door-art', 'aria-hidden': 'true' });
    art.innerHTML = c.name === '文房四宝' ? artStudy() : artHouse();

    var hasPages = c.pages && c.pages.length;
    var badge = null;
    if (!c.open) badge = el('span', { 'class': 'wx-soon', text: '制作中' });
    else if (c.partial) badge = el('span', { 'class': 'wx-soon', text: '陆续开放' });
    else if (c.size) badge = el('span', { 'class': 'wx-door-size', text: c.size });

    var pills;
    if (hasPages) {
      pills = el('div', { 'class': 'wx-pills' }, c.pages.map(function (p) {
        return p.href
          ? el('a', { 'class': 'wx-pill is-link', href: p.href, text: p.name })
          : el('span', { 'class': 'wx-pill is-closed', text: p.name });
      }));
    } else {
      pills = el('div', { 'class': 'wx-pills' }, c.tags.map(function (t) { return el('span', { 'class': 'wx-pill', text: t }); }));
    }

    var bodyKids = [
      el('div', { 'class': 'wx-door-top' }, [el('span', { 'class': 'wx-door-name', text: c.name }), badge]),
      el('p', { 'class': 'wx-door-line', text: c.line })
    ];
    if (hasPages && c.size) bodyKids.push(el('span', { 'class': 'wx-door-size', text: c.size }));
    bodyKids.push(pills);

    if (hasPages) {
      if (c.open && c.href) bodyKids.push(el('a', { 'class': 'wx-door-go', href: c.href, text: '进入 →' }));
      return el('div', { 'class': 'wx-door wx-paper has-pages' }, [art, el('div', { 'class': 'wx-door-body' }, bodyKids)]);
    }
    var body = el('div', { 'class': 'wx-door-body' }, bodyKids);
    if (c.open) {
      body.appendChild(el('span', { 'class': 'wx-door-go', 'aria-hidden': 'true', text: '进入 →' }));
      return el('a', { 'class': 'wx-door wx-paper is-open', href: c.href, 'aria-label': c.name + '：' + c.line }, [art, body]);
    }
    return el('div', { 'class': 'wx-door wx-paper is-closed', 'aria-disabled': 'true' }, [art, body]);
  }

  function render() {
    var page = el('div', { 'class': 'wx-page' });

    page.appendChild(el('div', { 'class': 'wx-head' }, [
      el('div', { 'class': 'wx-eyebrow', text: '物 · 书斋' }),
      el('h1', { 'class': 'wx-hook', text: D.hook }),
      el('p', { 'class': 'wx-answer', text: D.answer })
    ]));
    page.appendChild(el('p', { 'class': 'wx-lead', text: D.intro }));

    page.appendChild(el('section', { 'aria-label': '物的两个入口' }, [
      el('div', { 'class': 'wx-study' }, D.cards.map(buildDoor))
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
