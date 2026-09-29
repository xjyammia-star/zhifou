/* 知否知否 · 板块切换动画
   ----------------------------------------------------------
   进入某个板块首页时，在页面上方播放一小段动画，然后淡出，露出内容。
   目前有两个板块做了样板：
     shen（神灵）：仙气云雾从下方升起、飘散，夹着金色光点；
     wen（文学）：诗句里的字一个个闪现，最后停在“文学”两个字上。
   触发规则写在 js/nav.js 里（只在点一级导航切换板块时播放，同一次访问每个板块只播一次）。
   想马上看效果：在这个板块首页的网址后面加 ?fx=1 再打开。
   动画期间点一下、按键或滚动，会立刻淡出结束；系统开了“减少动态效果”则不播放。
   以后给别的板块加动画：在下面的 EFFECTS 里加一项，再到 nav.js 的 FX_KEYS 里加上板块名即可。 */
(function () {
  'use strict';
  if (window.ZFSectionFX) return;

  var CSS = [
    '.zfx{position:fixed;left:0;top:0;right:0;bottom:0;z-index:9999;pointer-events:none;overflow:hidden;opacity:1}',
    '.zfx canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block}',
    '.zfx-title{position:absolute;left:0;right:0;top:44%;transform:translateY(-50%);text-align:center;',
    'font-family:"Ma Shan Zheng","Noto Serif SC",serif;font-size:clamp(56px,12vw,120px);letter-spacing:.32em;text-indent:.32em;line-height:1;opacity:0}',
    '.zfx-shen .zfx-title{color:#e8dcc0;text-shadow:0 0 22px rgba(201,169,97,.55);animation:zfxTitle 1.5s ease-out .5s both}',
    '.zfx-wen{background:radial-gradient(ellipse at center,rgba(41,31,66,.55) 0%,rgba(10,6,19,.88) 100%);animation:zfxWenBox 2.2s ease-in-out both}',
    '.zfx-wen .zfx-title{color:#fdf0f8;text-shadow:0 0 24px rgba(240,205,227,.7);animation:zfxTitle 1.3s ease-out .8s both}',
    '.zfx-ch{position:absolute;font-family:"Ma Shan Zheng","Noto Serif SC",serif;line-height:1;opacity:0;white-space:nowrap;',
    'text-shadow:0 0 12px rgba(240,205,227,.55);animation:zfxChar 1.3s ease-in-out both}',
    '@keyframes zfxChar{0%{opacity:0;transform:scale(.85);filter:blur(4px)}30%{opacity:.95;transform:scale(1);filter:blur(0)}',
    '62%{opacity:.8}100%{opacity:0;transform:translateY(-10px) scale(1.05);filter:blur(1px)}}',
    '@keyframes zfxTitle{0%{opacity:0;filter:blur(8px)}45%{opacity:1;filter:blur(0)}75%{opacity:1}100%{opacity:0}}',
    '@keyframes zfxWenBox{0%{opacity:0}14%{opacity:1}72%{opacity:1}100%{opacity:0}}',
    '@keyframes zfxRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}',
    '.zf-fx-shen #app{animation:zfxRise 1.2s ease-out .55s both}',
    '.zf-fx-wen #app{animation:zfxRise 1s ease-out .9s both}'
  ].join('');

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function ease(x) { return x <= 0 ? 0 : (x >= 1 ? 1 : x * x * (3 - 2 * x)); }
  function small() { return Math.min(window.innerWidth, window.innerHeight) < 700; }

  function makeLayer(key, title) {
    var d = document.createElement('div');
    d.className = 'zfx zfx-' + key;
    d.setAttribute('aria-hidden', 'true');
    var t = document.createElement('div');
    t.className = 'zfx-title';
    t.textContent = title;
    d.appendChild(t);
    document.documentElement.appendChild(d);
    return d;
  }

  /* 预先画好一个柔和的圆形光斑，之后反复拿来贴，比每帧现画渐变省力得多 */
  function sprite(size, rgb, mid) {
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var x = c.getContext('2d');
    var g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(' + rgb + ',1)');
    g.addColorStop(mid, 'rgba(' + rgb + ',0.35)');
    g.addColorStop(1, 'rgba(' + rgb + ',0)');
    x.fillStyle = g;
    x.fillRect(0, 0, size, size);
    return c;
  }

  /* ---------- 神灵：仙气云雾 + 金色光点 ---------- */
  function shen(layer, ctl) {
    var T = 2.0;
    var cv = document.createElement('canvas');
    layer.insertBefore(cv, layer.firstChild);
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var W = Math.round(window.innerWidth * dpr), H = Math.round(window.innerHeight * dpr);
    cv.width = W; cv.height = H;
    var fogA = sprite(256, '236,224,196', 0.45), fogB = sprite(256, '190,205,235', 0.45), dot = sprite(48, '233,205,140', 0.25);
    var mob = small();
    var puffs = [], sparks = [], i;
    var nP = mob ? 9 : 16, nS = mob ? 26 : 56, base = Math.min(W, H);
    for (i = 0; i < nP; i++) {
      puffs.push({
        img: i % 3 === 0 ? fogB : fogA,
        x: rnd(-0.05, 1.05) * W, y: rnd(0.65, 1.2) * H, r: base * rnd(0.3, 0.6),
        vy: H * rnd(0.10, 0.24), vx: W * rnd(-0.03, 0.03),
        d: rnd(0, 0.55), life: rnd(1.2, 1.6), a: rnd(0.16, 0.3)
      });
    }
    for (i = 0; i < nS; i++) {
      sparks.push({
        x: rnd(0, 1) * W, y: rnd(0.55, 1.1) * H, s: rnd(5, 13) * dpr,
        vy: rnd(40, 120) * dpr, tw: rnd(4, 9), ph: rnd(0, 6.28), amp: rnd(4, 16) * dpr, sw: rnd(1, 2.5)
      });
    }
    var t0 = 0, raf = 0;
    function frame(now) {
      if (!t0) t0 = now;
      var t = (now - t0) / 1000;
      if (t > T) { ctl.done(); return; }
      var env = ease(t / 0.25) * (1 - ease((t - 1.35) / 0.65));
      var envS = ease(t / 0.4) * (1 - ease((t - 1.25) / 0.75));
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = env * 0.6;
      ctx.fillStyle = '#0f1420';
      ctx.fillRect(0, 0, W, H);
      var k, p, pt, r;
      for (k = 0; k < puffs.length; k++) {
        p = puffs[k];
        pt = (t - p.d) / p.life;
        if (pt <= 0 || pt >= 1) continue;
        r = p.r * (1 + 0.35 * pt);
        ctx.globalAlpha = Math.sin(Math.PI * pt) * p.a * env * 1.6;
        ctx.drawImage(p.img, p.x + p.vx * t - r, p.y - p.vy * t - r, r * 2, r * 2);
      }
      for (k = 0; k < sparks.length; k++) {
        p = sparks[k];
        ctx.globalAlpha = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * p.tw + p.ph))) * envS * 0.9;
        ctx.drawImage(dot, p.x + Math.sin(t * p.sw + p.ph) * p.amp - p.s, p.y - p.vy * t - p.s, p.s * 2, p.s * 2);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    ctl.onStop(function () { cancelAnimationFrame(raf); });
  }

  /* ---------- 文学：诗句里的字闪现 ---------- */
  var POOL = '床前明月光疑是地上霜举头望明月低头思故乡关关雎鸠在河之洲窈窕淑女君子好逑' +
    '春江潮水连海平海上明月共潮生落霞与孤鹜齐飞秋水共长天一色大江东去浪淘尽千古风流人物' +
    '天下大势分久必合合久必分满纸荒唐言一把辛酸泪山重水复疑无路柳暗花明又一村';
  var COLORS = ['#f0cde3', '#d7a0c0', '#fdf0f8', '#c589ac', '#f2e5f3'];
  function wen(layer, ctl) {
    var n = small() ? 26 : 50, i, x, y, tries, s;
    for (i = 0; i < n; i++) {
      tries = 0;
      do { x = rnd(4, 94); y = rnd(10, 92); tries++; }
      while (tries < 8 && x > 28 && x < 72 && y > 34 && y < 60);
      s = document.createElement('span');
      s.className = 'zfx-ch';
      s.textContent = POOL.charAt(Math.floor(Math.random() * POOL.length));
      s.style.left = x + '%';
      s.style.top = y + '%';
      s.style.fontSize = Math.round(rnd(20, 54)) + 'px';
      s.style.color = COLORS[i % COLORS.length];
      s.style.animationDelay = rnd(0, 1.0).toFixed(2) + 's';
      s.style.animationDuration = rnd(0.9, 1.4).toFixed(2) + 's';
      layer.appendChild(s);
    }
    var tm = setTimeout(function () { ctl.done(); }, 2250);
    ctl.onStop(function () { clearTimeout(tm); });
  }

  var EFFECTS = {
    shen: { title: '神灵', run: shen },
    wen: { title: '文学', run: wen }
  };

  var playing = false;
  function play(key) {
    var eff = EFFECTS[key];
    if (!eff || playing) return;
    try { if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) {}
    playing = true;
    if (!document.getElementById('zfx-style')) {
      var st = document.createElement('style');
      st.id = 'zfx-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    var html = document.documentElement;
    var layer = makeLayer(key, eff.title);
    var stops = [], finished = false, failsafe = 0;
    var EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'];

    function cleanup() {
      if (finished) return;
      finished = true;
      clearTimeout(failsafe);
      EVENTS.forEach(function (n) { window.removeEventListener(n, skip); });
      stops.forEach(function (f) { f(); });
      if (layer.parentNode) layer.parentNode.removeChild(layer);
      html.classList.remove('zf-fx-on', 'zf-fx-' + key);
      playing = false;
    }
    /* 点一下、按键或滚动：立刻淡出结束 */
    function skip() {
      if (finished) return;
      EVENTS.forEach(function (n) { window.removeEventListener(n, skip); });
      var cur = getComputedStyle(layer).opacity;
      layer.style.animation = 'none';
      layer.style.opacity = cur;
      void layer.offsetWidth;
      layer.style.transition = 'opacity .25s';
      layer.style.opacity = '0';
      html.classList.remove('zf-fx-on', 'zf-fx-' + key);
      setTimeout(cleanup, 280);
    }
    var ctl = { done: cleanup, onStop: function (f) { stops.push(f); } };
    html.classList.add('zf-fx-on', 'zf-fx-' + key);
    EVENTS.forEach(function (n) { window.addEventListener(n, skip, { passive: true }); });
    failsafe = setTimeout(cleanup, 4500);
    try { eff.run(layer, ctl); } catch (err) { cleanup(); }
  }

  window.ZFSectionFX = { play: play, keys: Object.keys(EFFECTS) };
})();
