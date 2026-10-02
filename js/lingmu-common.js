/* 知否知否 · 建筑 · 陵墓与墓葬 · 共用小工具
   首页（lingmu.js）和详页（lingmu-detail.js）共用：造元素、带加粗和站内链接的文字、把笔记元素排成段落/列表、图片网址。
   本文件只管排版，不含内容；内容在 data/lingmu-index.js 和 data/lm/*.js（脚本生成）。 */
window.LM = (function () {
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

  /* 文字里的 **加粗**、[[代号|名字]]（站内墓葬链接）、网址 */
  var TOKEN = /(\*\*[^*]+\*\*|\[\[[^\]|]+\|[^\]]+\]\]|https?:\/\/[^\s，。；）)]+)/;
  function rich(node, text) {
    String(text == null ? '' : text).split(TOKEN).forEach(function (part) {
      if (!part) return;
      var m;
      if (part.slice(0, 2) === '**' && part.slice(-2) === '**' && part.length > 4) {
        node.appendChild(el('b', { text: part.slice(2, -2) }));
      } else if ((m = /^\[\[([^\]|]+)\|([^\]]+)\]\]$/.exec(part))) {
        node.appendChild(el('a', { 'class': 'lm-xref', href: 'lingmu-detail.html?id=' + encodeURIComponent(m[1]), text: m[2] }));
      } else if (/^https?:\/\//.test(part)) {
        node.appendChild(el('a', { href: part, target: '_blank', rel: 'noopener noreferrer', text: part }));
      } else {
        node.appendChild(document.createTextNode(part));
      }
    });
    return node;
  }

  /* 把笔记里的元素 [{k:'p'|'b'|'n'|'q', l:标签, x:文字}] 排成段落、圆点列表、编号列表、引用 */
  function renderEls(list, extra) {
    var out = [], ul = null, ol = null;
    function flush() { ul = null; ol = null; }
    (list || []).forEach(function (e) {
      var body;
      if (e.k === 'b') {
        if (!ul) { ul = el('ul', { 'class': 'lm-ul' }); out.push(ul); }
        ol = null;
        var li = el('li', { 'class': 'lm-li' });
        if (e.l) { li.appendChild(el('span', { 'class': 'lm-lab' }, [rich(el('span'), e.l)])); li.appendChild(document.createTextNode('：')); }
        rich(li, e.x);
        if (extra) extra(li, e);
        ul.appendChild(li);
      } else if (e.k === 'n') {
        if (!ol) { ol = el('ol', { 'class': 'lm-ol' }); out.push(ol); }
        ul = null;
        var li2 = el('li');
        if (e.l) { li2.appendChild(el('b', {}, [rich(el('span'), e.l)])); li2.appendChild(document.createTextNode('：')); }
        rich(li2, e.x);
        if (extra) extra(li2, e);
        ol.appendChild(li2);
      } else if (e.k === 'q') {
        flush(); out.push(rich(el('p', { 'class': 'lm-q' }), e.x));
      } else {
        flush(); out.push(rich(el('p', { 'class': 'lm-p' }), e.x));
      }
    });
    return out;
  }

  function imgUrl(base, im, w) {
    return base + 'c_limit,w_' + w + '/f_auto,q_auto/v' + im.v + '/' + im.id;
  }

  return { el: el, rich: rich, renderEls: renderEls, imgUrl: imgUrl };
})();
