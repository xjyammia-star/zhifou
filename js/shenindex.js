
/* 知否知否 · "神"入口页（三界地图）脚本
   数据来自 data/shenindex.js（window.ZHIFOU_SHENINDEX），本文件只负责排版。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_SHENINDEX;
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

  function buildCard(c) {
    var box = el('div', { 'class': 'si-card' });
    var main = el('a', { 'class': 'si-card-main', href: c.href, 'aria-label': c.name + '：' + c.line }, [
      el('span', { 'class': 'si-card-top' }, [
        el('span', { 'class': 'si-card-name', text: c.name }),
        el('span', { 'class': 'sl-pill', text: c.size })
      ]),
      el('span', { 'class': 'si-card-line', text: c.line }),
      el('span', { 'class': 'sl-card-roles' }, c.tags.map(function (t) { return el('span', { 'class': 'sl-role', text: t }); })),
      el('span', { 'class': 'si-card-go', 'aria-hidden': 'true', text: '进入 →' })
    ]);
    box.appendChild(main);
    if (c.extra && c.extra.length) {
      box.appendChild(el('div', { 'class': 'sl-origin si-extra' }, c.extra.map(function (l) {
        return el('a', { 'class': 'sl-syslink', href: l.href, text: l.label + ' →' });
      })));
    }
    return box;
  }

  function buildLayer(l, i) {
    var list = D.cards.filter(function (c) { return c.layer === l.name; });
    return el('section', { 'class': 'si-layer si-layer-' + i, 'aria-label': l.name }, [
      el('div', { 'class': 'si-layer-side' }, [
        el('span', { 'class': 'si-layer-char', 'aria-hidden': 'true', text: l.name.charAt(0) }),
        el('h2', { 'class': 'si-layer-name', text: l.name }),
        el('p', { 'class': 'si-layer-line', text: l.line }),
        el('p', { 'class': 'si-layer-note', text: l.note })
      ]),
      el('div', { 'class': 'si-cards' }, list.map(buildCard))
    ]);
  }

  function buildRoute(r) {
    var steps = el('div', { 'class': 'si-steps' });
    r.steps.forEach(function (s, i) {
      if (i) steps.appendChild(el('span', { 'class': 'si-arrow', 'aria-hidden': 'true', text: '→' }));
      steps.appendChild(el('a', { 'class': 'sl-syslink', href: s.href, text: s.label }));
    });
    return el('div', { 'class': 'si-route' }, [el('h3', { 'class': 'si-route-name', text: r.name }), steps]);
  }

  function render() {
    var page = el('div', { 'class': 'xx-page si-page' });

    page.appendChild(el('div', { 'class': 'xx-head' }, [
      el('div', { 'class': 'xx-eyebrow', text: '神 · 三界地图' }),
      el('h1', { 'class': 'xx-hook', text: D.hook }),
      el('p', { 'class': 'xx-answer', text: D.answer })
    ]));
    page.appendChild(el('section', { 'class': 'xx-section' }, [el('p', { 'class': 'xx-intro', text: D.intro })]));

    var map = el('div', { 'class': 'si-map' });
    D.layers.forEach(function (l, i) { map.appendChild(buildLayer(l, i)); });
    page.appendChild(el('section', { 'class': 'xx-section', 'aria-label': '三界地图' }, [map]));

    D.thread.forEach(function (t) {
      page.appendChild(el('a', { 'class': 'si-thread', href: t.href }, [
        el('span', { 'class': 'si-thread-tag', text: '贯穿三界' }),
        el('span', { 'class': 'si-thread-name', text: t.name }),
        el('span', { 'class': 'si-thread-line', text: t.line }),
        el('span', { 'class': 'si-thread-note', text: t.note + '（' + t.size + '）' }),
        el('span', { 'class': 'si-card-go', 'aria-hidden': 'true', text: '进入 →' })
      ]));
    });

    page.appendChild(el('section', { 'class': 'xx-section' }, [
      el('div', { 'class': 'section-title', text: '怎么逛' }),
      el('div', { 'class': 'si-routes' }, D.routes.map(buildRoute))
    ]));

    page.appendChild(el('div', { 'class': 'tip-box' }, [el('div', { 'class': 'tip-label', text: '小提示' }), el('p', { text: D.tip })]));
    page.appendChild(el('details', { 'class': 'notes' }, [
      el('summary', { text: '批注' }),
      el('div', { 'class': 'notes-body' }, D.notes.map(function (n) {
        var m = n.match(/^([^：]{1,4})：(.*)$/);
        return el('p', {}, m ? [el('span', { 'class': 'note-label', text: m[1] }), document.createTextNode(m[2])] : [document.createTextNode(n)]);
      }))
    ]));

    root.textContent = '';
    root.appendChild(page);
  }

  render();
})();
