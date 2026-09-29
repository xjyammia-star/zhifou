/* 知否知否 · "建筑"页面里的真实照片
   ----------------------------------------------------------
   建筑各页（宫殿坛庙与城市、寺观塔与桥、园林、楼阁、民居、屋顶、木构架、时间线）是各自单独设计的，
   本文件不改它们的内容，只在页面画好之后，按“页面名/词条名”到图片登记表（data/images.js）里找照片：
   找到就把照片放进对应的卡片或说明面板里；找不到就什么也不加（先留空）。
   卡片：放在卡片最上面；带小线稿的卡片：放在线稿和文字之间；点选后才显示的说明面板：放在名字下面。
   点选切换时面板会重画，所以这里持续观察页面变化，重画后再补上照片。
   每张图下面有图注，以及摄影者/授权协议（点开是图片来源页）——按授权要求必须保留，不要删。 */
(function () {
  'use strict';
  var Z = window.ZIMG;
  if (!Z) return;
  var page = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');

  function mk(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); });
    return n;
  }

  function build(info, name, mode) {
    var fig = mk('figure', 'jz-fig is-' + mode, { 'data-jz-name': name });
    var frame = mk('div', 'jz-fig-frame');
    frame.appendChild(mk('img', 'jz-fig-bg', { src: info.src, alt: '', 'aria-hidden': 'true', loading: 'lazy', decoding: 'async' }));
    frame.appendChild(mk('img', 'jz-fig-img', { src: info.src, srcset: info.srcset, sizes: '(max-width: 640px) 92vw, 420px', alt: name + '：' + (info.caption || ''), loading: 'lazy', decoding: 'async' }));
    fig.appendChild(frame);
    var cap = mk('figcaption', 'jz-fig-cap');
    if (info.caption) cap.appendChild(mk('span', 'jz-fig-txt', { text: info.caption }));
    if (info.link) cap.appendChild(mk('a', 'jz-fig-src', { href: info.link, target: '_blank', rel: 'noopener noreferrer', text: info.source || '图片来源' }));
    else if (info.source) cap.appendChild(mk('span', 'jz-fig-src', { text: info.source }));
    fig.appendChild(cap);
    return fig;
  }

  function nameOf(h) { return (h.textContent || '').trim(); }

  /* 说明面板：名字（h3.wx-title）下面 */
  function inPanel(h) {
    var name = nameOf(h), next = h.nextElementSibling;
    if (next && next.classList.contains('jz-fig')) {
      if (next.getAttribute('data-jz-name') === name) return;
      next.parentNode.removeChild(next);
    }
    var info = Z.get(page, name);
    if (!info) return;
    h.parentNode.insertBefore(build(info, name, 'panel'), h.nextSibling);
  }

  /* 卡片：名字（h3.gd-card-name / h3.wx-roof-name）所在的 article */
  function inCard(h) {
    var name = nameOf(h);
    var art = h.closest('article');
    if (!art || art.querySelector(':scope > .jz-fig, :scope > .jz-fig-wrap')) return;
    var info = Z.get(page, name);
    if (!info) return;
    var body = null;
    for (var i = 0; i < art.children.length; i++) {
      if (art.children[i].contains(h) && /(^|\s)(mj-home-body|wx-roof-body)(\s|$)/.test(art.children[i].className)) body = art.children[i];
    }
    if (body) art.insertBefore(build(info, name, 'flat'), body);       /* 线稿和文字之间 */
    else art.insertBefore(build(info, name, 'top'), art.firstChild);   /* 卡片最上面 */
  }

  /* 陵墓“代表”：名字（span.wx-note-label）所在的一行前面 */
  function inRep(s) {
    var name = nameOf(s), p = s.parentNode;
    if (!p || !p.parentNode || !/gd-reps/.test(p.parentNode.className)) return;
    var prev = p.previousElementSibling;
    if (prev && prev.classList.contains('jz-fig') && prev.getAttribute('data-jz-name') === name) return;
    var info = Z.get(page, name);
    if (!info) return;
    p.parentNode.insertBefore(build(info, name, 'rep'), p);
  }

  function sweep() {
    var a = document.querySelectorAll('h3.wx-title'), i;
    for (i = 0; i < a.length; i++) inPanel(a[i]);
    a = document.querySelectorAll('h3.gd-card-name, h3.wx-roof-name');
    for (i = 0; i < a.length; i++) inCard(a[i]);
    a = document.querySelectorAll('.gd-reps .wx-note-label');
    for (i = 0; i < a.length; i++) inRep(a[i]);
  }

  var timer = 0;
  function later() { if (!timer) timer = setTimeout(function () { timer = 0; sweep(); }, 30); }
  if (window.MutationObserver) new MutationObserver(later).observe(document.body, { childList: true, subtree: true });
  if (document.readyState !== 'loading') sweep(); else document.addEventListener('DOMContentLoaded', sweep);
})();
