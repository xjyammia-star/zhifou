/* 知否知否 · 注册离线缓存（出错不影响页面） */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    try { navigator.serviceWorker.register('/sw.js').catch(function () { /* 忽略 */ }); } catch (e) { /* 忽略 */ }
  });
}
