/* 知否知否 · 离线缓存（让网站能像 App 一样安装到手机桌面）
   原则：永远先联网取最新内容，取到就顺手存一份；断网时才用存的那份。
   所以网站更新后，用户看到的总是最新版，不会被旧缓存卡住。 */
var CACHE = 'zhifou-v1';

self.addEventListener('install', function () { self.skipWaiting(); });

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;          /* 图片、字体等外站内容不管 */
  if (url.pathname.indexOf('/api/') === 0) return;     /* 接口永远不缓存 */
  if (req.headers.has('range')) return;                /* 音频分段请求不缓存 */
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok && res.type === 'basic') {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () { /* 忽略 */ });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || (req.mode === 'navigate' ? caches.match('/index.html') : Response.error());
      });
    })
  );
});
