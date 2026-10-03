/* 知否知否 · 板块切换动画
   ----------------------------------------------------------
   进入某个板块首页时，在页面上方播放一小段动画，然后淡出，露出内容。九个板块各有一段：
     shi（时令）    ：按当前季节飘落——春花瓣、夏萤火、秋落叶、冬细雪；
     shen（神灵）   ：仙气云雾从下方升起、飘散，夹着金色光点；
     jianzhu（建筑）：台基、立柱、斗拱、屋顶的线条一笔一笔“画”出来；
     wu（器物）     ：天青釉色晕开，冰裂纹一样的细线慢慢长出；
     ziyu（字语）   ：竹叶飘落，墨色在中间晕开，浮现板块名；
     lisi（礼思）   ：一卷竹简从中间向两边展开；
     yi（艺术）     ：一笔带飞白的水墨横扫过画面，最后落下一枚朱红印章；
     wen（文学）    ：诗句里的字一个个闪现，最后停在“文学”两个字上；
     dianji（典籍） ：书架上的线装书一本本从下面立起来，书签上是“经史子集”这样的字，最后停在“典籍”两个字上。
   触发规则写在 js/nav.js 里（只在点一级导航切换板块时播放，同一次访问每个板块只播一次）。
   想马上看效果：在这个板块首页的网址后面加 ?fx=1 再打开。
   动画期间点一下、按键或滚动，会立刻淡出结束；系统开了“减少动态效果”则不播放。
   以后新增板块动画：在下面的 EFFECTS 里加一项，再到 nav.js 的 FX_KEYS 里加上板块名即可。 */
(function () {
  'use strict';
  if (window.ZFSectionFX) return;

  var CSS = [
    /* 通用 */
    '.zfx{position:fixed;left:0;top:0;right:0;bottom:0;z-index:9999;pointer-events:none;overflow:hidden;opacity:1}',
    '.zfx canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block}',
    '.zfx-title{position:absolute;left:0;right:0;top:44%;transform:translateY(-50%);text-align:center;',
    'font-family:"Ma Shan Zheng","Noto Serif SC",serif;font-size:clamp(56px,12vw,120px);letter-spacing:.32em;text-indent:.32em;line-height:1;opacity:0}',
    '@keyframes zfxTitle{0%{opacity:0;filter:blur(8px)}45%{opacity:1;filter:blur(0)}75%{opacity:1}100%{opacity:0}}',
    '@keyframes zfxWenBox{0%{opacity:0}14%{opacity:1}72%{opacity:1}100%{opacity:0}}',
    '@keyframes zfxTail{0%,80%{opacity:1}100%{opacity:0}}',
    '@keyframes zfxFadeIn{from{opacity:0}to{opacity:1}}',
    '@keyframes zfxRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}',
    /* 神灵 */
    '.zfx-shen .zfx-title{color:#e8dcc0;text-shadow:0 0 22px rgba(201,169,97,.55);animation:zfxTitle 1.5s ease-out .5s both}',
    /* 文学 */
    '.zfx-wen{background:radial-gradient(ellipse at center,rgba(41,31,66,.55) 0%,rgba(10,6,19,.88) 100%);animation:zfxWenBox 2.2s ease-in-out both}',
    '.zfx-wen .zfx-title{color:#fdf0f8;text-shadow:0 0 24px rgba(240,205,227,.7);animation:zfxTitle 1.3s ease-out .8s both}',
    '.zfx-ch{position:absolute;font-family:"Ma Shan Zheng","Noto Serif SC",serif;line-height:1;opacity:0;white-space:nowrap;',
    'text-shadow:0 0 12px rgba(240,205,227,.55);animation:zfxChar 1.3s ease-in-out both}',
    '@keyframes zfxChar{0%{opacity:0;transform:scale(.85);filter:blur(4px)}30%{opacity:.95;transform:scale(1);filter:blur(0)}',
    '62%{opacity:.8}100%{opacity:0;transform:translateY(-10px) scale(1.05);filter:blur(1px)}}',
    /* 时令 */
    '.zfx-shi .zfx-title{color:#2b2b2b;text-shadow:0 0 18px rgba(243,236,223,.95);animation:zfxTitle 1.4s ease-out .45s both}',
    '.zfx-shi-xia .zfx-title{color:#eef3cf;text-shadow:0 0 20px rgba(214,229,106,.55)}',
    '.zfx-shi-dong .zfx-title{color:#33454f;text-shadow:0 0 18px rgba(255,255,255,.9)}',
    /* 建筑 */
    '.zfx-jianzhu{background:rgba(36,22,16,.94);animation:zfxWenBox 2.5s ease-in-out both}',
    '.zfx-jianzhu .zfx-title{top:79%;font-size:clamp(34px,6vw,60px);color:#eadfc6;text-shadow:0 0 16px rgba(224,138,118,.4);animation:zfxTitle 1.5s ease-out 1s both}',
    '.zfx-jz-svg{position:absolute;left:50%;top:40%;width:min(78vw,760px);height:auto;transform:translate(-50%,-50%);overflow:visible}',
    '.zfx-jz-svg path{fill:none;stroke:#e6d9bd;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;',
    'animation:zfxDraw .55s ease-out var(--d,0s) both}',
    '.zfx-jz-svg path.r{stroke:#e08a76}',
    '@keyframes zfxDraw{to{stroke-dashoffset:0}}',
    /* 器物 */
    '.zfx-wu{animation:zfxWenBox 2.3s ease-in-out both}',
    '.zfx-glaze{position:absolute;left:0;top:0;right:0;bottom:0;',
    'background:radial-gradient(circle at 50% 50%,rgba(150,196,190,.92) 0%,rgba(186,215,210,.9) 55%,rgba(214,230,227,.86) 100%);',
    'animation:zfxGlaze 1s cubic-bezier(.3,.6,.3,1) both}',
    '@keyframes zfxGlaze{from{clip-path:circle(0% at 50% 50%)}to{clip-path:circle(150% at 50% 50%)}}',
    '.zfx-wu .zfx-title{color:#1d4c50;text-shadow:0 0 18px rgba(251,253,252,.9);animation:zfxTitle 1.5s ease-out .6s both}',
    /* 字语 */
    '.zfx-ziyu .zfx-title{color:#ecefe3;text-shadow:0 0 22px rgba(211,191,124,.6);animation:zfxTitle 1.5s ease-out .65s both}',
    /* 礼思 */
    '.zfx-lisi{background:linear-gradient(180deg,rgba(0,0,0,.22),rgba(0,0,0,0) 14%,rgba(0,0,0,0) 86%,rgba(0,0,0,.26)),',
    'repeating-linear-gradient(90deg,#ead7a4 0,#ead7a4 26px,#a9834a 26px,#a9834a 28px);',
    'animation:zfxUnroll .9s cubic-bezier(.3,.7,.2,1) both,zfxTail 2.5s linear both}',
    '@keyframes zfxUnroll{from{clip-path:inset(0 50% 0 50%)}to{clip-path:inset(0 0 0 0)}}',
    '.zfx-cord{position:absolute;left:0;right:0;height:5px;background:#7d2a20;box-shadow:0 2px 3px rgba(0,0,0,.35)}',
    '.zfx-roll{position:absolute;top:0;bottom:0;width:26px;background:linear-gradient(90deg,#5d3a1c,#b98a4c 45%,#5d3a1c);box-shadow:0 0 10px rgba(0,0,0,.4)}',
    '.zfx-roll.l{animation:zfxRollL .9s cubic-bezier(.3,.7,.2,1) both}',
    '.zfx-roll.r{animation:zfxRollR .9s cubic-bezier(.3,.7,.2,1) both}',
    '@keyframes zfxRollL{from{left:50%}to{left:0}}',
    '@keyframes zfxRollR{from{right:50%}to{right:0}}',
    '.zfx-cart{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:min(72vw,420px);height:clamp(110px,22vh,190px);',
    'background:#f8f0d8;border:2px solid #7a3f1c;border-radius:6px;box-shadow:0 6px 24px rgba(42,32,22,.35);opacity:0;animation:zfxFadeIn .5s ease-out .6s both}',
    '.zfx-lisi .zfx-title{color:#2a2016;text-shadow:0 0 10px rgba(248,240,216,.9);animation:zfxTitle 1.7s ease-out .75s both}',
    /* 艺术 */
    '.zfx-yi{animation:zfxTail 2.4s linear both}',
    '.zfx-yi .zfx-title{top:33%;font-size:clamp(50px,10vw,100px);color:#2b2724;text-shadow:0 0 14px rgba(241,236,224,.9);animation:zfxTitle 1.6s ease-out .3s both}',
    '.zfx-seal{position:absolute;left:76%;top:58%;width:clamp(44px,7vw,76px);height:clamp(44px,7vw,76px);background:#c04a1e;color:#f6ede0;',
    'display:flex;align-items:center;justify-content:center;font-family:"Ma Shan Zheng","Noto Serif SC",serif;font-size:clamp(28px,4.6vw,50px);line-height:1;',
    'border-radius:3px;opacity:0;animation:zfxStamp .5s cubic-bezier(.2,.9,.3,1) 1.25s both}',
    '@keyframes zfxStamp{0%{opacity:0;transform:scale(1.8) rotate(-6deg)}60%{opacity:.95;transform:scale(.96) rotate(-3deg)}100%{opacity:.95;transform:scale(1) rotate(-3deg)}}',
    /* 典籍 */
    '.zfx-dianji{background:rgba(18,13,9,.95);animation:zfxWenBox 2.6s ease-in-out both}',
    '.zfx-shelf{position:absolute;left:5%;right:5%;bottom:9%;height:46vh;display:flex;align-items:flex-end;justify-content:center;gap:3px;border-bottom:3px solid #8a6a3c}',
    '.zfx-bk{position:relative;flex:0 0 auto;border-radius:2px 2px 0 0;box-shadow:inset -3px 0 0 rgba(0,0,0,.3),inset 3px 0 0 rgba(255,255,255,.06);',
    'transform:translateY(112%);animation:zfxBook .75s cubic-bezier(.2,.8,.25,1) var(--d,0s) both}',
    '.zfx-bk::before,.zfx-bk::after{content:"";position:absolute;left:50%;width:5px;height:5px;border-radius:50%;background:rgba(240,220,170,.55);transform:translateX(-50%)}',
    '.zfx-bk::before{bottom:5%}.zfx-bk::after{bottom:16%}',
    '.zfx-bk i{position:absolute;left:50%;top:8%;transform:translateX(-50%);width:62%;padding:7px 0;background:#f1e6c8;color:#5a2a16;font-style:normal;font-weight:600;',
    'font-family:"Ma Shan Zheng","Noto Serif SC",serif;font-size:clamp(14px,2vw,22px);line-height:1;text-align:center;box-shadow:0 0 0 1px rgba(90,42,22,.4)}',
    '@keyframes zfxBook{from{transform:translateY(112%)}to{transform:none}}',
    '.zfx-dianji .zfx-title{top:30%;color:#f0dcaa;text-shadow:0 0 20px rgba(230,200,140,.5);animation:zfxTitle 1.5s ease-out .95s both}',
    /* 动画播放时，页面内容稍后从下方浮出 */
    '.zf-fx-shen #app{animation:zfxRise 1.2s ease-out .55s both}',
    '.zf-fx-wen #app{animation:zfxRise 1s ease-out .9s both}',
    '.zf-fx-shi #app{animation:zfxRise 1s ease-out .8s both}',
    '.zf-fx-jianzhu #app{animation:zfxRise 1s ease-out 1.7s both}',
    '.zf-fx-wu #app{animation:zfxRise 1s ease-out 1.2s both}',
    '.zf-fx-ziyu #app{animation:zfxRise 1s ease-out 1s both}',
    '.zf-fx-lisi #app{animation:zfxRise 1s ease-out 1.7s both}',
    '.zf-fx-yi #app{animation:zfxRise 1s ease-out 1.6s both}',
    '.zf-fx-dianji #app{animation:zfxRise 1s ease-out 1.6s both}'
  ].join('');

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function ease(x) { return x <= 0 ? 0 : (x >= 1 ? 1 : x * x * (3 - 2 * x)); }
  function small() { return Math.min(window.innerWidth, window.innerHeight) < 700; }
  /* 淡入 a 秒、淡出 b 秒的包络：整段动画总长 T */
  function env(t, T, a, b) { return ease(t / a) * (1 - ease((t - (T - b)) / b)); }

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

  /* 铺满屏幕的画布；分辨率最多取 1.5 倍，省力 */
  function setupCanvas(layer) {
    var cv = document.createElement('canvas');
    layer.insertBefore(cv, layer.firstChild);
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var W = Math.round(window.innerWidth * dpr), H = Math.round(window.innerHeight * dpr);
    cv.width = W; cv.height = H;
    return { ctx: cv.getContext('2d'), W: W, H: H, dpr: dpr };
  }

  /* 每帧调用 draw(t)，超过 T 秒就结束 */
  function loop(ctl, T, draw) {
    var t0 = 0, raf = 0;
    function frame(now) {
      if (!t0) t0 = now;
      var t = (now - t0) / 1000;
      if (t > T) { ctl.done(); return; }
      draw(t);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    ctl.onStop(function () { cancelAnimationFrame(raf); });
  }

  function after(ctl, ms) {
    var tm = setTimeout(function () { ctl.done(); }, ms);
    ctl.onStop(function () { clearTimeout(tm); });
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
    var c = setupCanvas(layer), ctx = c.ctx, W = c.W, H = c.H, dpr = c.dpr;
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
    loop(ctl, T, function (t) {
      var e = env(t, T, 0.25, 0.65);
      var eS = ease(t / 0.4) * (1 - ease((t - 1.25) / 0.75));
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = e * 0.6;
      ctx.fillStyle = '#0f1420';
      ctx.fillRect(0, 0, W, H);
      var k, p, pt, r;
      for (k = 0; k < puffs.length; k++) {
        p = puffs[k];
        pt = (t - p.d) / p.life;
        if (pt <= 0 || pt >= 1) continue;
        r = p.r * (1 + 0.35 * pt);
        ctx.globalAlpha = Math.sin(Math.PI * pt) * p.a * e * 1.6;
        ctx.drawImage(p.img, p.x + p.vx * t - r, p.y - p.vy * t - r, r * 2, r * 2);
      }
      for (k = 0; k < sparks.length; k++) {
        p = sparks[k];
        ctx.globalAlpha = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * p.tw + p.ph))) * eS * 0.9;
        ctx.drawImage(dot, p.x + Math.sin(t * p.sw + p.ph) * p.amp - p.s, p.y - p.vy * t - p.s, p.s * 2, p.s * 2);
      }
      ctx.globalAlpha = 1;
    });
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
    after(ctl, 2250);
  }

  /* ---------- 时令：按当前季节飘落 ---------- */
  function petalPath(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.95, -s * 0.6, s * 0.7, s * 0.6, 0, s);
    ctx.bezierCurveTo(-s * 0.7, s * 0.6, -s * 0.95, -s * 0.6, 0, -s);
    ctx.closePath();
  }
  function leafPath(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.1);
    ctx.quadraticCurveTo(s * 0.95, -s * 0.15, 0, s * 1.0);
    ctx.quadraticCurveTo(-s * 0.95, -s * 0.15, 0, -s * 1.1);
    ctx.closePath();
  }
  function shi(layer, ctl) {
    var T = 2.1;
    var c = setupCanvas(layer), ctx = c.ctx, W = c.W, H = c.H, dpr = c.dpr, mob = small(), i;
    var d = new Date(Date.now() + 8 * 3600 * 1000), v = (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
    var season = v >= 204 && v < 505 ? 'chun' : (v >= 505 && v < 807 ? 'xia' : (v >= 807 && v < 1107 ? 'qiu' : 'dong'));
    layer.classList.add('zfx-shi-' + season);
    var wash = { chun: '243,236,223', xia: '30,44,52', qiu: '243,236,223', dong: '205,216,224' }[season];
    var washA = { chun: 0.72, xia: 0.62, qiu: 0.72, dong: 0.78 }[season];
    var cols = {
      chun: ['#e8a0b0', '#f2c4cc', '#f6d5d8', '#d98aa0'],
      qiu: ['#c4573f', '#d08a3a', '#a8562f', '#b8862f', '#8a4324']
    }[season];
    var glow = sprite(64, season === 'xia' ? '206,232,96' : '255,255,255', season === 'xia' ? 0.22 : 0.3);
    var n = (mob ? 0.55 : 1) * { chun: 46, xia: 42, qiu: 34, dong: 70 }[season];
    var ps = [];
    for (i = 0; i < n; i++) {
      if (season === 'xia') {
        ps.push({ x: rnd(0.03, 0.97) * W, y: rnd(0.25, 0.97) * H, vx: rnd(-30, 30) * dpr, vy: rnd(-40, 10) * dpr,
          s: rnd(7, 16) * dpr, tw: rnd(3, 8), ph: rnd(0, 6.28), d: rnd(0, 0.6) });
      } else if (season === 'dong') {
        ps.push({ x: rnd(-0.05, 1.05) * W, y: rnd(-0.6, 0) * H, vx: rnd(-25, 25) * dpr, vy: H * rnd(0.32, 0.6),
          s: rnd(2.5, 7) * dpr, sw: rnd(1, 2.4), amp: rnd(6, 26) * dpr, ph: rnd(0, 6.28) });
      } else {
        ps.push({ x: rnd(-0.1, 1.05) * W, y: rnd(-0.7, -0.03) * H, vx: W * rnd(0.01, 0.07), vy: H * rnd(0.42, 0.78),
          s: rnd(7, 15) * dpr * (season === 'qiu' ? 1.15 : 1), sw: rnd(1.4, 3), amp: rnd(14, 46) * dpr,
          ph: rnd(0, 6.28), vr: rnd(2, 5), col: pick(cols), rot: rnd(0, 6.28) });
      }
    }
    loop(ctl, T, function (t) {
      var e = env(t, T, 0.25, 0.6), eP = ease(t / 0.3) * (1 - ease((t - (T - 0.6)) / 0.6));
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = e * washA;
      ctx.fillStyle = 'rgb(' + wash + ')';
      ctx.fillRect(0, 0, W, H);
      var k, p, x, y, a;
      for (k = 0; k < ps.length; k++) {
        p = ps[k];
        if (season === 'xia') {
          if (t < p.d) continue;
          a = (0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * p.tw + p.ph))) * eP;
          ctx.globalAlpha = a;
          ctx.drawImage(glow, p.x + p.vx * t - p.s, p.y + p.vy * t - p.s, p.s * 2, p.s * 2);
        } else if (season === 'dong') {
          x = p.x + p.vx * t + Math.sin(t * p.sw + p.ph) * p.amp;
          y = p.y + p.vy * t;
          ctx.globalAlpha = 0.9 * eP;
          ctx.drawImage(glow, x - p.s, y - p.s, p.s * 2, p.s * 2);
        } else {
          x = p.x + p.vx * t + Math.sin(t * p.sw + p.ph) * p.amp;
          y = p.y + p.vy * t;
          if (y < -30 || y > H + 30) continue;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(p.rot + Math.sin(t * p.sw + p.ph) * 0.8);
          ctx.scale(1, 0.35 + 0.65 * Math.abs(Math.cos(t * p.vr + p.ph)));
          ctx.globalAlpha = 0.92 * eP;
          ctx.fillStyle = p.col;
          if (season === 'chun') petalPath(ctx, p.s); else leafPath(ctx, p.s);
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    });
  }

  /* ---------- 建筑：线条一笔一笔画出来 ---------- */
  var JZ_PATHS = [
    ['M50 268 H550', 0, ''],
    ['M72 268 V250 H528 V268', 0.1, ''],
    ['M140 250 V152', 0.3, ''], ['M240 250 V152', 0.38, ''], ['M360 250 V152', 0.46, ''], ['M460 250 V152', 0.54, ''],
    ['M120 152 H480', 0.7, ''], ['M120 140 H480', 0.78, ''],
    ['M120 140 L140 126 H460 L480 140', 0.85, ''],
    ['M120 126 H480', 0.9, ''],
    ['M120 126 V112 H480 V126', 0.95, ''],
    ['M112 112 H488', 1.0, ''],
    ['M18 96 C70 118 190 106 300 42', 1.1, 'r'], ['M582 96 C530 118 410 106 300 42', 1.1, 'r'],
    ['M18 96 L46 110 C120 126 210 114 300 62', 1.3, 'r'], ['M582 96 L554 110 C480 126 390 114 300 62', 1.3, 'r'],
    ['M300 62 V42', 1.5, 'r'], ['M282 44 H318', 1.55, 'r'], ['M300 42 V28 M294 28 H306', 1.6, 'r']
  ];
  function jianzhu(layer, ctl) {
    var i, parts = '';
    for (i = 0; i < 4; i++) {
      var x = [140, 240, 360, 460][i], dl = (0.9 + i * 0.06).toFixed(2);
      parts += '<path pathLength="1" style="--d:' + dl + 's" d="M' + (x - 20) + ' 152 H' + (x + 20) + ' L' + (x + 28) + ' 140 H' + (x - 28) + ' Z"/>';
      parts += '<path pathLength="1" style="--d:' + (parseFloat(dl) + 0.05).toFixed(2) + 's" d="M' + (x - 50) + ' 140 H' + (x + 50) + '"/>';
    }
    var body = '';
    JZ_PATHS.forEach(function (p) {
      body += '<path pathLength="1"' + (p[2] ? ' class="' + p[2] + '"' : '') + ' style="--d:' + p[1] + 's" d="' + p[0] + '"/>';
    });
    var wrap = document.createElement('div');
    wrap.innerHTML = '<svg class="zfx-jz-svg" viewBox="0 0 600 300" aria-hidden="true">' + body + parts + '</svg>';
    layer.insertBefore(wrap.firstChild, layer.firstChild);
    after(ctl, 2550);
  }

  /* ---------- 器物：天青釉色晕开 + 冰裂纹 ---------- */
  function makeCracks(W, H, dpr, mob) {
    var segs = [];
    function grow(x, y, ang, birth, depth) {
      var n = 3 + Math.floor(Math.random() * 5), k, len, nx, ny;
      for (k = 0; k < n; k++) {
        len = rnd(36, 92) * dpr;
        nx = x + Math.cos(ang) * len; ny = y + Math.sin(ang) * len;
        segs.push([x, y, nx, ny, birth + k * 0.05]);
        x = nx; y = ny;
        if (x < -20 || y < -20 || x > W + 20 || y > H + 20) return;
        if (depth < 3 && Math.random() < 0.35) grow(x, y, ang + (Math.random() < 0.5 ? 1 : -1) * rnd(1.0, 1.9), birth + (k + 1) * 0.05, depth + 1);
        ang += (Math.random() < 0.5 ? 1 : -1) * rnd(0.5, 1.2) * (Math.random() < 0.6 ? 1 : 0.3);
      }
    }
    var seeds = mob ? 6 : 10, i, sx, sy, a0, b;
    for (i = 0; i < seeds; i++) {
      sx = W * rnd(0.15, 0.85); sy = H * rnd(0.15, 0.85); a0 = rnd(0, 6.28); b = rnd(0.25, 0.9);
      grow(sx, sy, a0, b, 0);
      grow(sx, sy, a0 + Math.PI, b, 0);
    }
    return segs;
  }
  function wu(layer, ctl) {
    var T = 2.3;
    var c = setupCanvas(layer), ctx = c.ctx, W = c.W, H = c.H, dpr = c.dpr;
    var glaze = document.createElement('div');
    glaze.className = 'zfx-glaze';
    layer.insertBefore(glaze, layer.firstChild);
    var segs = makeCracks(W, H, dpr, small());
    loop(ctl, T, function (t) {
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = 'round';
      ctx.lineWidth = 1.4 * dpr;
      ctx.strokeStyle = 'rgba(29,76,80,0.55)';
      ctx.beginPath();
      var k, s, f;
      for (k = 0; k < segs.length; k++) {
        s = segs[k];
        f = (t - s[4]) / 0.09;
        if (f <= 0) continue;
        if (f > 1) f = 1;
        ctx.moveTo(s[0], s[1]);
        ctx.lineTo(s[0] + (s[2] - s[0]) * f, s[1] + (s[3] - s[1]) * f);
      }
      ctx.stroke();
    });
  }

  /* ---------- 字语：竹叶飘落 + 墨色晕开 ---------- */
  function ziyu(layer, ctl) {
    var T = 2.2;
    var c = setupCanvas(layer), ctx = c.ctx, W = c.W, H = c.H, dpr = c.dpr, i;
    var cols = ['#7fb894', '#a9c9a0', '#d3bf7c', '#5f9a78', '#8fc0a0'];
    var n = small() ? 14 : 30, base = Math.min(W, H), ls = [];
    for (i = 0; i < n; i++) {
      ls.push({ x: rnd(-0.05, 1.05) * W, y: rnd(-0.75, -0.05) * H, vy: H * rnd(0.42, 0.78), sw: rnd(1.2, 2.6), amp: rnd(14, 44) * dpr,
        ph: rnd(0, 6.28), L: rnd(18, 38) * dpr, col: pick(cols) });
    }
    loop(ctl, T, function (t) {
      var e = env(t, T, 0.25, 0.65);
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = e * 0.84;
      ctx.fillStyle = 'rgb(34,53,41)';
      ctx.fillRect(0, 0, W, H);
      /* 墨色从中间晕开 */
      var R = base * (0.12 + 0.5 * ease((t - 0.15) / 1.2));
      var g = ctx.createRadialGradient(W / 2, H * 0.44, 0, W / 2, H * 0.44, R);
      g.addColorStop(0, 'rgba(8,16,11,0.78)');
      g.addColorStop(0.6, 'rgba(8,16,11,0.35)');
      g.addColorStop(1, 'rgba(8,16,11,0)');
      ctx.globalAlpha = e;
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      var k, p, s;
      for (k = 0; k < ls.length; k++) {
        p = ls[k];
        s = Math.sin(t * p.sw + p.ph);
        ctx.save();
        ctx.translate(p.x + s * p.amp, p.y + p.vy * t);
        ctx.rotate(0.5 + s * 0.9);
        ctx.globalAlpha = 0.88 * e;
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.moveTo(0, -p.L);
        ctx.quadraticCurveTo(p.L * 0.3, 0, 0, p.L);
        ctx.quadraticCurveTo(-p.L * 0.22, 0, 0, -p.L);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    });
  }

  /* ---------- 礼思：竹简展开 ---------- */
  function lisi(layer, ctl) {
    var mk = function (cls, top) {
      var d = document.createElement('div');
      d.className = cls;
      if (top) d.style.top = top;
      return d;
    };
    var first = layer.firstChild;
    layer.insertBefore(mk('zfx-cord', '24%'), first);
    layer.insertBefore(mk('zfx-cord', '74%'), first);
    layer.insertBefore(mk('zfx-cart'), first);
    layer.appendChild(mk('zfx-roll l'));
    layer.appendChild(mk('zfx-roll r'));
    after(ctl, 2550);
  }

  /* ---------- 艺术：水墨横扫 + 朱红印章 ---------- */
  function yi(layer, ctl) {
    var T = 2.4;
    var c = setupCanvas(layer), ctx = c.ctx, W = c.W, H = c.H, dpr = c.dpr, i, k;
    var N = 90, x0 = W * 0.14, x1 = W * 0.86, hMax = Math.min(H * 0.05, 44 * dpr), yc = H * 0.54;
    var xs = [], top = [], bot = [], u, half, wob;
    for (i = 0; i <= N; i++) {
      u = i / N;
      wob = Math.sin(u * 3.1 + 0.7) * H * 0.012;
      half = hMax * (0.32 + 0.68 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.06 + u * 0.96)), 0.55)) * (1 + (Math.random() - 0.5) * 0.1);
      xs.push(x0 + (x1 - x0) * u); top.push(yc + wob - half); bot.push(yc + wob + half);
    }
    var streaks = [], a, l;
    for (k = 0; k < 34; k++) {
      a = rnd(0.35, 0.95); l = rnd(0.05, 0.22);
      streaks.push({ a: Math.round(a * N), b: Math.round(Math.min(1, a + l) * N), f: rnd(-0.85, 0.85), w: rnd(1, 3.4) * dpr });
    }
    var seal = document.createElement('div');
    seal.className = 'zfx-seal';
    seal.textContent = '艺';
    layer.appendChild(seal);
    loop(ctl, T, function (t) {
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = ease(t / 0.2) * 0.95;
      ctx.fillStyle = '#f1ece0';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      var head = Math.floor(N * ease((t - 0.3) / 0.85)), j, s, y;
      if (head < 2) return;
      ctx.beginPath();
      ctx.moveTo(xs[0], top[0]);
      for (j = 1; j <= head; j++) ctx.lineTo(xs[j], top[j]);
      for (j = head; j >= 0; j--) ctx.lineTo(xs[j], bot[j]);
      ctx.closePath();
      ctx.fillStyle = '#1c1917';
      ctx.fill();
      /* 飞白：笔尾一带，墨色断断续续 */
      ctx.strokeStyle = '#f1ece0';
      ctx.lineCap = 'round';
      for (k = 0; k < streaks.length; k++) {
        s = streaks[k];
        if (Math.min(s.b, head) <= s.a) continue;
        ctx.lineWidth = s.w;
        ctx.beginPath();
        for (j = s.a; j <= Math.min(s.b, head); j++) {
          y = (top[j] + bot[j]) / 2 + s.f * (bot[j] - top[j]) / 2;
          if (j === s.a) ctx.moveTo(xs[j], y); else ctx.lineTo(xs[j], y);
        }
        ctx.stroke();
      }
    });
  }

  /* ---------- 典籍：书架上的线装书一本本立起来 ---------- */
  var BK_POOL = '经史子集易书诗礼乐春秋论孟老庄墨韩兵医算农天地文道法';
  var BK_COLS = ['#2d4a63', '#375672', '#4c3b2c', '#25414f', '#5d4733', '#33425a', '#3f3a2e'];
  function dianji(layer, ctl) {
    var shelf = document.createElement('div');
    shelf.className = 'zfx-shelf';
    var n = Math.max(8, Math.min(26, Math.floor(window.innerWidth * 0.9 / 42))), i, bk, lab;
    /* 书签上的字：把字池打乱后依次取，尽量不重复 */
    var chars = BK_POOL.split('').sort(function () { return Math.random() - 0.5; });
    for (i = 0; i < n; i++) {
      bk = document.createElement('div');
      bk.className = 'zfx-bk';
      bk.style.height = Math.round(rnd(62, 100)) + '%';
      bk.style.width = Math.round(rnd(30, 48)) + 'px';
      bk.style.background = BK_COLS[i % BK_COLS.length];
      bk.style.setProperty('--d', (i / n * 0.6 + rnd(0, 0.15)).toFixed(2) + 's');
      lab = document.createElement('i');
      lab.textContent = chars[i % chars.length];
      bk.appendChild(lab);
      shelf.appendChild(bk);
    }
    layer.insertBefore(shelf, layer.firstChild);
    after(ctl, 2600);
  }

  var EFFECTS = {
    shi: { title: '时令', run: shi },
    shen: { title: '神灵', run: shen },
    jianzhu: { title: '建筑', run: jianzhu },
    wu: { title: '器物', run: wu },
    ziyu: { title: '字语', run: ziyu },
    lisi: { title: '礼思', run: lisi },
    yi: { title: '艺术', run: yi },
    wen: { title: '文学', run: wen },
    dianji: { title: '典籍', run: dianji }
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
