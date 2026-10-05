/* 知否知否 · 页面底部的访问次数（今日访问 / 累计访问）
   由 nav.js 在每个页面自动加载。数字来自 /api/hit（见 api/hit.js）。
   同一个浏览器窗口里，翻很多页只算 1 次访问；关掉再打开、第二天再来，会再算一次。
   接口连不上（比如本地直接打开文件）时，这一行不显示，不影响页面。 */
(function () {
  'use strict';
  var KEY = 'zf_visit_counted';
  function fmt(n) { return Number(n).toLocaleString('en-US'); }
  function show(d) {
    var inner = document.querySelector('.site-footer .footer-inner');
    if (!inner || !d || typeof d.total !== 'number') return;
    var old = inner.querySelector('.zf-visits');
    if (old) old.parentNode.removeChild(old);
    var s = document.createElement('span');
    s.className = 'zf-visits';
    s.setAttribute('aria-label', '访问次数');
    s.style.cssText = 'flex-basis:100%;text-align:center;font-size:12px;opacity:.85;letter-spacing:.03em';
    s.textContent = '今日访问 ' + fmt(d.today) + '　·　累计访问 ' + fmt(d.total);
    inner.appendChild(s);
  }
  function run() {
    var counted = false;
    try { counted = sessionStorage.getItem(KEY) === '1'; } catch (e) { /* 忽略 */ }
    fetch('/api/hit' + (counted ? '' : '?count=1'), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('x'); return r.json(); })
      .then(function (d) {
        if (!counted) { try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* 忽略 */ } }
        show(d);
      })
      .catch(function () { /* 连不上就不显示 */ });
  }
  if (location.protocol === 'file:') return;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
