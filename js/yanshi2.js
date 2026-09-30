/* 知否知否 · 艺 · 古代游戏“演示”（第二批）
   作用：在 yanshi.js 的基础上，再给游艺页里的 11 个游戏加上“▶ 演示”小游戏：
   捶丸、击壤、陀螺、双陆、藏钩、射覆、牌九、拆字、灯谜、对对子、斗草。
   只演示概念：没有对手、没有输赢排名、不讲详细规则。画面全部是本站原创。
   用法：页面 html 在 yanshi.js 之后引入本文件（js/yanshi2.js）。 */
(function () {
  'use strict';
  var Y = window.ZY_YS;
  if (!Y) return;
  var el = Y.el, D = Y.demos;

  /* ---------- 本文件用到的样式（自带，不改 yi.css） ---------- */
  var css = [
    '.ys2-cv{display:block;width:100%;max-width:480px;margin:0 auto;touch-action:none;background:#efe6d3;border-radius:8px}',
    '.ys2-stage{display:flex;justify-content:center;gap:24px;margin:12px 0;flex-wrap:wrap}',
    '.ys2-fist{border:0;background:none;cursor:pointer;padding:6px;border-radius:14px;text-align:center;font:inherit;color:#3b2a1a}',
    '.ys2-fist:hover{background:rgba(122,53,18,.08)}',
    '.ys2-fist:disabled{cursor:default;background:none}',
    '.ys2-fist svg{width:120px;height:120px;display:block}',
    '.ys2-fist.is-shake{animation:ys2-sh .22s ease-in-out 5}',
    '@keyframes ys2-sh{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-8px) rotate(4deg)}}',
    '.ys2-bowlwrap{position:relative;width:170px;height:120px;margin:12px auto}',
    '.ys2-item{position:absolute;left:0;right:0;bottom:8px;text-align:center;font-size:30px;font-weight:bold;color:#7a3512}',
    '.ys2-bowl{position:absolute;left:8px;right:8px;bottom:0;height:96px;border-radius:85px 85px 8px 8px;background:#a2452f;border:3px solid #3b2a1a;transition:transform .6s}',
    '.ys2-bowl.is-up{transform:translateY(-84px) rotate(-10deg)}',
    '.ys2-clue{text-align:center;font-size:17px;line-height:1.7;margin:6px 8px 10px;color:#3b2a1a}',
    '.ys2-opts{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:8px 0}',
    '.ys2-opts .ys-btn.is-bad{opacity:.4}',
    '.ys2-opts .ys-btn.is-sel{outline:3px solid #d9a441}',
    '.ys2-opts .ys-btn.is-done{background:#3f7f6a;color:#fff;border-color:#3f7f6a}',
    '.ys2-tilewrap{text-align:center}',
    '.ys2-tile{width:58px;height:112px;background:#fbf8f0;border:3px solid #3b2a1a;border-radius:8px;display:flex;flex-direction:column;box-shadow:2px 3px 0 rgba(0,0,0,.15);margin:0 auto}',
    '.ys2-half{flex:1;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);padding:6px}',
    '.ys2-half+.ys2-half{border-top:3px solid #3b2a1a}',
    '.ys2-pip{width:10px;height:10px;border-radius:50%;background:#1c1613;margin:auto}',
    '.ys2-pip.is-red{background:#c9302c}',
    '.ys2-tname{font-size:14px;color:#7a3512;min-height:20px;margin-top:8px}',
    '.ys2-glyph{display:flex;justify-content:center;align-items:center;gap:0;font-size:96px;line-height:1.15;color:#3b2a1a;min-height:230px;transition:gap .5s;font-family:KaiTi,STKaiti,"Noto Serif SC",serif}',
    '.ys2-glyph.is-v{flex-direction:column}',
    '.ys2-glyph.is-open{gap:30px}',
    '.ys2-glyph.is-v.is-open{gap:10px}',
    '.ys2-lantern{margin:12px auto;max-width:320px;padding:24px 18px;background:radial-gradient(#e0553a,#b5432f);color:#fff5dc;border-radius:44px/54px;border:3px solid #7a1f12;text-align:center;font-size:20px;line-height:1.7;box-shadow:0 5px 0 #d9a441}',
    '.ys2-ltag{display:inline-block;font-size:12px;background:#fff5dc;color:#7a1f12;border-radius:10px;padding:0 10px;margin-bottom:6px}',
    '.ys2-ans{margin-top:10px;font-size:26px;font-weight:bold;color:#ffe08a;min-height:1.5em}',
    '.ys2-up{text-align:center;font-size:36px;letter-spacing:6px;margin:14px 0 6px;color:#3b2a1a;font-family:KaiTi,STKaiti,"Noto Serif SC",serif}',
    '.ys2-cols{display:flex;justify-content:center;gap:40px;margin:12px 0}',
    '.ys2-col{display:flex;flex-direction:column;gap:10px}'
  ].join('\n');
  var st = el('style', { type: 'text/css' });
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- 公用小工具 ---------- */
  var timers;
  function newTimers() { timers = []; return timers; }
  function later(list, fn, ms) { var t = setTimeout(fn, ms); list.push(t); return t; }
  function clearAll(list) { list.forEach(clearTimeout); list.length = 0; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function mkCanvas(body, W, H, label) {
    var cv = el('canvas', { 'class': 'ys-canvas ys2-cv', width: W, height: H, 'aria-label': label });
    body.appendChild(cv);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    var ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    return { cv: cv, ctx: ctx };
  }
  function loop(fn) {
    var raf = 0, last = 0, dead = false;
    function f(ts) {
      if (dead) return;
      var dt = last ? Math.min((ts - last) / 1000, 0.05) : 0.016; last = ts;
      fn(dt);
      raf = requestAnimationFrame(f);
    }
    raf = requestAnimationFrame(f);
    return function () { dead = true; cancelAnimationFrame(raf); };
  }
  /* 按住、向后拉开、松手：返回 st.drag（正在拉时不为空） */
  function aim(cv, W, H, origin, can, onShoot, MAXP, K) {
    var st = { drag: null };
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; }
    function pull(p) {
      var o = origin(), dx = o.x - p.x, dy = o.y - p.y, len = Math.sqrt(dx * dx + dy * dy);
      if (len > MAXP) { dx = dx * MAXP / len; dy = dy * MAXP / len; len = MAXP; }
      return { vx: dx * K, vy: dy * K, len: len, p: p, o: o };
    }
    cv.addEventListener('pointerdown', function (e) {
      if (!can()) return;
      var p = pos(e), o = origin();
      if (Math.abs(p.x - o.x) > 80 || Math.abs(p.y - o.y) > 80) return;
      st.drag = pull(p);
      if (cv.setPointerCapture) cv.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    cv.addEventListener('pointermove', function (e) { if (st.drag) st.drag = pull(pos(e)); });
    cv.addEventListener('pointerup', function () {
      var d = st.drag; st.drag = null;
      if (d && d.len >= 12) onShoot(d.vx, d.vy);
    });
    cv.addEventListener('pointercancel', function () { st.drag = null; });
    return st;
  }
  function drawAim(ctx, d, G, MAXP) {
    ctx.fillStyle = 'rgba(122,53,18,.55)';
    for (var i = 1; i < 26; i++) {
      var t = i * 0.045;
      ctx.beginPath(); ctx.arc(d.o.x + d.vx * t, d.o.y + d.vy * t + 0.5 * G * t * t, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#7a3512'; ctx.fillRect(10, 12, 100, 8);
    ctx.fillStyle = '#e9b98a'; ctx.fillRect(11, 13, 98, 6);
    ctx.fillStyle = '#7a3512'; ctx.fillRect(11, 13, 98 * d.len / MAXP, 6);
    ctx.fillStyle = '#6a5f54'; ctx.font = '12px sans-serif'; ctx.fillText('力度', 116, 20);
  }
  function ground(ctx, W, H, GY) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#efe6d3'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#c9b98f'; ctx.fillRect(0, GY, W, H - GY);
    ctx.fillStyle = '#b9c79a'; ctx.fillRect(0, GY, W, 6);
  }
  function note(body, text) { body.appendChild(el('p', { 'class': 'ys-note', text: text })); }

  /* ---------- 捶丸 ---------- */
  D['捶丸'] = function (body) {
    var W = 480, H = 300, GY = 250, G = 520, K = 4.2, MAXP = 110, FR = 150, R = 6;
    var m = mkCanvas(body, W, H, '捶丸演示画面'), ctx = m.ctx;
    var msg = el('p', { 'class': 'ys-msg' });
    var cnt = el('span', { 'class': 'ys-count' });
    var bReset = el('button', { 'class': 'ys-btn is-ghost', type: 'button', text: '回到起点，换个窝' });
    body.appendChild(msg);
    body.appendChild(el('div', { 'class': 'ys-row' }, [cnt, bReset]));
    note(body, '捶丸是古代的球杖游戏：用球杖把球击向地上挖好的“窝”，谁用的杆数少，谁打得好。据记载，宋元时期很流行。这里只演示“击球入窝”的手感，球停在哪里，下一杆就从哪里打。');
    var ball, hole, state, strokes;
    function upd() { cnt.textContent = '已打 ' + strokes + ' 杆'; }
    function reset() {
      ball = { x: 56, y: GY - R, vx: 0, vy: 0 };
      hole = 310 + Math.random() * 110; state = 'idle'; strokes = 0; upd();
      msg.textContent = '按住球，向后拉开再松手，把球打向右边有旗子的窝。';
    }
    var a = aim(m.cv, W, H, function () { return { x: ball.x, y: ball.y }; }, function () { return state === 'idle'; },
      function (vx, vy) { ball.vx = vx; ball.vy = vy; state = 'fly'; strokes++; upd(); msg.textContent = ''; }, MAXP, K);
    function tryHole() {
      if (Math.abs(ball.x - hole) < 8 && Math.abs(ball.vx) < 260) {
        state = 'in'; ball.x = hole; ball.vx = 0; ball.vy = 0;
        msg.textContent = '入窝！用了 ' + strokes + ' 杆。点“回到起点，换个窝”再来一局。';
        return true;
      }
      return false;
    }
    function stopped() {
      state = 'idle'; ball.vx = 0;
      var d = Math.abs(hole - ball.x);
      msg.textContent = d < 45 ? '离窝已经很近了，轻轻推一下。' : (ball.x > hole ? '打过头了，可以往回打。' : '还差一段，再打一杆。');
    }
    bReset.addEventListener('click', reset);
    reset();
    var stop = loop(function (dt) {
      if (state === 'fly') {
        ball.vy += G * dt; ball.x += ball.vx * dt; ball.y += ball.vy * dt;
        if (ball.y >= GY - R) {
          ball.y = GY - R;
          if (!tryHole()) {
            if (ball.vy > 90) { ball.vy = -ball.vy * 0.32; ball.vx *= 0.72; }
            else { ball.vy = 0; state = 'roll'; }
          }
        }
        if (ball.x > W - 10) { ball.x = W - 10; ball.vx = 0; }
        if (ball.x < 10) { ball.x = 10; ball.vx = Math.abs(ball.vx) * 0.3; }
      } else if (state === 'roll') {
        var s = ball.vx > 0 ? 1 : -1;
        ball.vx -= s * FR * dt;
        if (ball.vx * s <= 0) stopped();
        else {
          ball.x += ball.vx * dt;
          if (ball.x > W - 10 || ball.x < 10) { ball.x = Math.max(10, Math.min(W - 10, ball.x)); stopped(); }
          else tryHole();
        }
      }
      ground(ctx, W, H, GY);
      ctx.strokeStyle = '#8a7b62'; ctx.lineWidth = 2; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.moveTo(56, GY + 4); ctx.lineTo(56, GY + 22); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#8a7b62'; ctx.font = '12px sans-serif'; ctx.fillText('起点', 44, GY + 38);
      ctx.fillStyle = '#2b190c'; ctx.beginPath(); ctx.ellipse(hole, GY + 1, 10, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3b2a1a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(hole, GY); ctx.lineTo(hole, GY - 56); ctx.stroke();
      ctx.fillStyle = '#c9302c'; ctx.beginPath(); ctx.moveTo(hole, GY - 56); ctx.lineTo(hole + 26, GY - 47); ctx.lineTo(hole, GY - 38); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fbf8f0'; ctx.strokeStyle = '#3b2a1a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ball.x, ball.y + (state === 'in' ? 5 : 0), R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (a.drag && state === 'idle') {
        drawAim(ctx, a.drag, G, MAXP);
        ctx.strokeStyle = '#7a4b24'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(ball.x - 3, ball.y + 2); ctx.lineTo(a.drag.o.x - (a.drag.vx / K) * 1.1, a.drag.o.y - (a.drag.vy / K) * 1.1); ctx.stroke(); ctx.lineCap = 'butt';
      } else if (state === 'idle' && strokes === 0) {
        ctx.fillStyle = 'rgba(122,53,18,.75)'; ctx.font = '12px sans-serif'; ctx.fillText('拉这里', ball.x - 16, ball.y - 18);
      }
    });
    return stop;
  };

  /* ---------- 击壤 ---------- */
  D['击壤'] = function (body) {
    var W = 480, H = 300, GY = 250, SX = 70, SY = 196, G = 520, K = 4.6, MAXP = 110;
    var m = mkCanvas(body, W, H, '击壤演示画面'), ctx = m.ctx;
    var msg = el('p', { 'class': 'ys-msg' });
    var cnt = el('span', { 'class': 'ys-count' });
    var again = el('button', { 'class': 'ys-btn', type: 'button', text: '换个位置再来' });
    body.appendChild(msg);
    body.appendChild(el('div', { 'class': 'ys-row' }, [cnt, again]));
    note(body, '击壤是很古老的投掷游戏：把一块木片放在远处，人站在线外，用手里的木片去打它。后世对具体玩法的说法不一，这里只演示“投出去、打中它”的感觉。');
    var left, tx, flying, landed, hit, over;
    function upd() { cnt.textContent = '还剩 ' + left + ' 块木片'; }
    function reset() {
      left = 3; tx = 260 + Math.random() * 150; flying = null; landed = []; hit = false; over = false; upd();
      again.style.display = 'none';
      msg.textContent = '远处平放着一块木片。按住左边的木片，向后拉开，松手投出去打它。';
    }
    var a = aim(m.cv, W, H, function () { return { x: SX, y: SY }; }, function () { return !flying && !over; },
      function (vx, vy) { left--; upd(); flying = { x: SX, y: SY, vx: vx, vy: vy, rot: 0 }; msg.textContent = ''; }, MAXP, K);
    function land() {
      var f = flying; flying = null;
      if (Math.abs(f.x - tx) < 26) {
        hit = true; over = true; landed.push({ x: f.x, r: 0.1 }); tx += 34;
        msg.textContent = '打中了！远处的木片被打得滑出去一截。';
      } else {
        landed.push({ x: Math.max(20, Math.min(W - 20, f.x)), r: (landed.length % 2 ? -0.08 : 0.06) });
        msg.textContent = (f.x < tx ? '落在它前面了，力气再大一点。' : '打过头了，力气再小一点。') + (left > 0 ? '' : ' 这一轮的木片用完了。');
        if (left <= 0) over = true;
      }
      if (over) again.style.display = '';
    }
    again.addEventListener('click', reset);
    reset();
    function wood(x, y, w, h, rot, col) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      ctx.fillStyle = col; ctx.strokeStyle = '#3b2a1a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2, -h / 2 + 1); ctx.lineTo(w / 2, h / 2 - 1); ctx.lineTo(-w / 2, h / 2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    var stop = loop(function (dt) {
      if (flying) {
        var f = flying;
        f.vy += G * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vx * dt * 0.015;
        if (f.y >= GY - 4 || f.x > W + 30 || f.x < -30) land();
      }
      ground(ctx, W, H, GY);
      ctx.strokeStyle = '#8a7b62'; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(SX + 26, GY - 4); ctx.lineTo(SX + 26, GY + 20); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#8a7b62'; ctx.font = '12px sans-serif'; ctx.fillText('投线', SX + 14, GY + 34);
      wood(tx, GY - 5, 46, 10, 0, '#7a4b24');
      landed.forEach(function (p) { wood(p.x, GY - 4, 34, 8, p.r, '#a06a3a'); });
      if (a.drag && !flying) {
        drawAim(ctx, a.drag, G, MAXP);
        wood(SX, SY, 34, 8, Math.atan2(a.drag.vy, a.drag.vx), '#a06a3a');
      } else if (flying) {
        wood(flying.x, flying.y, 34, 8, flying.rot, '#a06a3a');
      } else if (!over && left > 0) {
        wood(SX, SY, 34, 8, -0.5, '#a06a3a');
        ctx.fillStyle = 'rgba(122,53,18,.75)'; ctx.font = '12px sans-serif'; ctx.fillText('拉这里', SX - 20, SY + 26);
      }
    });
    return stop;
  };

  /* ---------- 陀螺 ---------- */
  D['陀螺'] = function (body) {
    var W = 480, H = 300, TX = 240, TY = 246;
    var m = mkCanvas(body, W, H, '陀螺演示画面'), ctx = m.ctx;
    var msg = el('p', { 'class': 'ys-msg' });
    var bWhip = el('button', { 'class': 'ys-btn', type: 'button', text: '抽一鞭' });
    var bNew = el('button', { 'class': 'ys-btn is-ghost', type: 'button', text: '再放一个' });
    body.appendChild(msg);
    body.appendChild(el('div', { 'class': 'ys-row' }, [bWhip, bNew]));
    note(body, '抽陀螺是民间常见的游戏：用鞭子不断抽打，陀螺才能一直转下去。不抽了，它转得越来越慢，最后摇晃着倒下。这里演示的就是这一点。');
    var w, th, ph, tilt, fallen, fallA, fallDir, whip;
    function reset() {
      w = 16; th = 0; ph = 0; tilt = 0; fallen = false; fallA = 0; fallDir = 1; whip = 0;
      msg.textContent = '点“抽一鞭”（或点画面），让它转得更久。';
    }
    function lash() {
      if (fallen) return;
      w = Math.min(w + 8, 30); whip = 0.3;
      msg.textContent = '啪！转得更快了。';
    }
    bWhip.addEventListener('click', lash);
    m.cv.addEventListener('pointerdown', function (e) { e.preventDefault(); lash(); });
    bNew.addEventListener('click', reset);
    reset();
    var stop = loop(function (dt) {
      if (!fallen) {
        w -= 1.6 * dt; th += w * dt;
        if (w < 9) { ph += (6 + (9 - w)) * dt; tilt = 0.55 * ((9 - w) / 9) * Math.sin(ph); if (w < 6 && msg.textContent.indexOf('晃') < 0 && msg.textContent.indexOf('啪') < 0) msg.textContent = '转得慢了，开始摇晃……'; }
        else tilt = 0;
        if (w <= 1.2) { fallen = true; fallDir = Math.sin(ph) >= 0 ? 1 : -1; fallA = tilt; msg.textContent = '倒下了。点“再放一个”，或者下次早点抽一鞭。'; }
      } else if (Math.abs(fallA) < 1.4) {
        fallA += fallDir * 2.4 * dt;
      }
      if (whip > 0) whip -= dt;
      ground(ctx, W, H, TY + 4);
      ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(TX, TY + 6, 40, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.translate(TX, TY); ctx.rotate(fallen ? fallA : tilt);
      ctx.fillStyle = '#c9503a'; ctx.strokeStyle = '#3b2a1a'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-24, -40); ctx.lineTo(-30, -58); ctx.lineTo(30, -58); ctx.lineTo(24, -40); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#d9a441'; ctx.beginPath(); ctx.moveTo(-26, -44); ctx.lineTo(26, -44); ctx.lineTo(24, -40); ctx.lineTo(-24, -40); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e7c98a'; ctx.beginPath(); ctx.ellipse(0, -58, 30, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 2;
      for (var k = 0; k < 6; k++) {
        var ang = th + k * Math.PI / 3;
        ctx.strokeStyle = k % 2 ? '#c9302c' : '#3b2a1a';
        ctx.beginPath(); ctx.moveTo(0, -58); ctx.lineTo(Math.cos(ang) * 28, -58 + Math.sin(ang) * 7); ctx.stroke();
      }
      ctx.strokeStyle = '#3b2a1a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -65); ctx.lineTo(0, -76); ctx.stroke();
      if (!fallen && w > 8) { ctx.globalAlpha = Math.min(0.3, (w - 8) / 50); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, -52, 36, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
      ctx.restore();
      if (whip > 0) {
        var p = 1 - whip / 0.3;
        ctx.strokeStyle = '#7a4b24'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(420, 60); ctx.quadraticCurveTo(360 - p * 60, 40 + p * 110, TX + 34, TY - 52); ctx.stroke(); ctx.lineCap = 'butt';
      }
    });
    return stop;
  };

  /* ---------- 双陆 ---------- */
  D['双陆'] = function (body) {
    var NS = 'http://www.w3.org/2000/svg', PW = 36, X0 = 24, N = 24;
    var tl = newTimers();
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 480 230'); svg.setAttribute('class', 'ys-canvas ys2-cv'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', '双陆棋盘');
    function add(tag, attrs, parent) {
      var n = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      (parent || svg).appendChild(n); return n;
    }
    function cx(i) { return i < 12 ? X0 + (11 - i) * PW + PW / 2 : X0 + (i - 12) * PW + PW / 2; }
    function cy(i) { return i < 12 ? 198 : 32; }
    add('rect', { x: 2, y: 2, width: 476, height: 226, rx: 8, fill: '#e3d3ae', stroke: '#7a4b24', 'stroke-width': 4 });
    for (var i = 0; i < N; i++) {
      var x = cx(i) - PW / 2, bottom = i < 12;
      var pts = bottom ? [x, 220, x + PW, 220, x + PW / 2, 124] : [x, 10, x + PW, 10, x + PW / 2, 106];
      add('polygon', { points: pts.join(' '), fill: i % 2 ? '#3f7f6a' : '#b5432f', stroke: '#3b2a1a', 'stroke-width': 1.5, opacity: 0.85 });
    }
    var label = add('text', { x: cx(0), y: 150, 'text-anchor': 'middle', 'font-size': 12, fill: '#3b2a1a' }); label.textContent = '起';
    var label2 = add('text', { x: cx(23), y: 90, 'text-anchor': 'middle', 'font-size': 12, fill: '#3b2a1a' }); label2.textContent = '终';
    var piece = add('g', {});
    add('circle', { cx: 0, cy: 0, r: 14, fill: '#fbf8f0', stroke: '#3b2a1a', 'stroke-width': 3 }, piece);
    add('circle', { cx: 0, cy: 0, r: 8, fill: 'none', stroke: '#b5432f', 'stroke-width': 2 }, piece);
    body.appendChild(svg);
    var pos = 0, dice = [0, 0], used = [true, true], busy = false, done = false;
    var faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    var d1 = el('button', { 'class': 'ys-dice', type: 'button', 'aria-label': '第一枚骰子', text: '⚀' });
    var d2 = el('button', { 'class': 'ys-dice', type: 'button', 'aria-label': '第二枚骰子', text: '⚁' });
    var roll = el('button', { 'class': 'ys-btn', type: 'button', text: '掷两枚骰子' });
    var reset = el('button', { 'class': 'ys-btn is-ghost', type: 'button', text: '重新开始' });
    var msg = el('p', { 'class': 'ys-msg', text: '点“掷两枚骰子”。' });
    body.appendChild(el('div', { 'class': 'ys-row' }, [d1, d2, roll, reset]));
    body.appendChild(msg);
    note(body, '双陆是掷骰子走棋的游戏，传入中国后在隋唐宋元都很流行。这里只演示两件事：掷两枚骰子，再按点数把棋子往前走。真正的棋盘上有很多棋子，规则也比这复杂得多。');
    function put() { piece.setAttribute('transform', 'translate(' + cx(pos) + ' ' + cy(pos) + ')'); }
    put();
    function refresh() {
      d1.textContent = dice[0] ? faces[dice[0] - 1] : '⚀'; d2.textContent = dice[1] ? faces[dice[1] - 1] : '⚁';
      d1.disabled = used[0] || busy || done; d2.disabled = used[1] || busy || done;
      d1.style.opacity = used[0] ? 0.35 : 1; d2.style.opacity = used[1] ? 0.35 : 1;
      roll.disabled = busy || done || !(used[0] && used[1]);
    }
    refresh();
    roll.addEventListener('click', function () {
      if (busy) return;
      dice = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]; used = [false, false];
      msg.textContent = '掷出 ' + dice[0] + ' 和 ' + dice[1] + '。点一枚骰子，棋子就按它的点数走；再点另一枚，接着走。';
      refresh();
    });
    function use(k) {
      if (busy || used[k] || done) return;
      used[k] = true; busy = true; refresh();
      var n = dice[k], target = pos + n;
      (function hop() {
        if (n === 0 || pos >= N - 1) {
          busy = false;
          if (pos >= N - 1 || target > N - 1) { done = true; msg.textContent = '走到终点了。点“重新开始”再来一遍。'; }
          else msg.textContent = (used[0] && used[1]) ? '两枚骰子都用完了，再掷一次。' : '还有一枚骰子没用，接着点它。';
          refresh(); return;
        }
        pos++; n--; put(); later(tl, hop, 170);
      })();
    }
    d1.addEventListener('click', function () { use(0); });
    d2.addEventListener('click', function () { use(1); });
    reset.addEventListener('click', function () {
      clearAll(tl); pos = 0; dice = [0, 0]; used = [true, true]; busy = false; done = false; put(); refresh();
      msg.textContent = '点“掷两枚骰子”。';
    });
    return function () { clearAll(tl); };
  };

  /* ---------- 藏钩 ---------- */
  var FIST = '<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="22" y="34" width="76" height="62" rx="16" fill="#f1cfa1" stroke="#3b2a1a" stroke-width="4"/><path d="M42 34v20M60 34v20M78 34v20" stroke="#3b2a1a" stroke-width="3.5" stroke-linecap="round"/><path d="M22 66c-12-2-14 16 0 16" fill="none" stroke="#3b2a1a" stroke-width="4" stroke-linecap="round"/></svg>';
  function openHand(withHook) {
    return '<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="22" y="34" width="76" height="62" rx="16" fill="#f7e2c2" stroke="#3b2a1a" stroke-width="4" stroke-dasharray="7 5"/>' +
      (withHook ? '<path d="M72 44v34c0 14-22 14-22-2" fill="none" stroke="#d9a441" stroke-width="9" stroke-linecap="round"/><path d="M72 44v34c0 14-22 14-22-2" fill="none" stroke="#3b2a1a" stroke-width="2.5" stroke-linecap="round"/>' : '<path d="M46 70h28" stroke="#b9a98a" stroke-width="4" stroke-linecap="round"/>') + '</svg>';
  }
  D['藏钩'] = function (body) {
    var tl = newTimers(), where = 0, stage = 'idle';
    var stageBox = el('div', { 'class': 'ys2-stage' });
    var hands = [0, 1].map(function (i) {
      var b = el('button', { 'class': 'ys2-fist', type: 'button', 'aria-label': i ? '右手' : '左手' });
      b.innerHTML = FIST + '<div>' + (i ? '右手' : '左手') + '</div>';
      stageBox.appendChild(b); return b;
    });
    var msg = el('p', { 'class': 'ys-msg' });
    var again = el('button', { 'class': 'ys-btn', type: 'button', text: '再藏一次' });
    body.appendChild(stageBox); body.appendChild(msg);
    body.appendChild(el('div', { 'class': 'ys-row' }, [again]));
    note(body, '藏钩是古代节日里的猜物游戏：一方把小小的“钩”握在手里，另一方来猜在哪只手里。古代节日聚会时常玩。这里由电脑来藏，你来猜。');
    function hide() {
      clearAll(tl); stage = 'hide'; where = Math.floor(Math.random() * 2); again.disabled = true;
      hands.forEach(function (h, i) { h.disabled = true; h.innerHTML = FIST + '<div>' + (i ? '右手' : '左手') + '</div>'; h.classList.add('is-shake'); });
      msg.textContent = '把钩藏进一只手里……';
      later(tl, function () {
        hands.forEach(function (h) { h.classList.remove('is-shake'); h.disabled = false; });
        stage = 'guess'; msg.textContent = '猜猜钩在哪只手里？点一只手。';
      }, 1200);
    }
    hands.forEach(function (h, i) {
      h.addEventListener('click', function () {
        if (stage !== 'guess') return;
        stage = 'done';
        hands.forEach(function (x, k) { x.disabled = true; x.innerHTML = openHand(k === where) + '<div>' + (k ? '右手' : '左手') + '</div>'; });
        msg.textContent = (i === where ? '猜对了，钩在' : '没猜中，钩在') + (where ? '右手' : '左手') + '里。';
        again.disabled = false;
      });
    });
    again.addEventListener('click', hide);
    hide();
    return function () { clearAll(tl); };
  };

  /* ---------- 射覆 ---------- */
  var SHEFU = [
    { clue: '说它像龙，却没有角；说它像蛇，却长着脚；总是小心翼翼地贴着墙爬。', opts: ['壁虎（守宫）', '蚯蚓', '乌龟'], ans: 0, tip: '汉武帝让术士猜盂下的东西，东方朔猜的就是“守宫”，也就是壁虎。' },
    { clue: '圆圆的，中间有个方孔，古人常用绳子把它们串成一串。', opts: ['团扇', '铜钱', '砚台'], ans: 1, tip: '圆形加方孔，是古代铜钱最明显的样子。' },
    { clue: '细长的杆，一头长着毛，要蘸了墨才能写字。', opts: ['竹筷', '扇子', '毛笔'], ans: 2, tip: '一头有毛，又能蘸墨，就是毛笔。' },
    { clue: '石头做的，中间凹下去一块，拿来研墨用。', opts: ['算盘', '灯笼', '砚台'], ans: 2, tip: '文房四宝里的“砚”，凹下去的地方用来盛水研墨。' }
  ];
  D['射覆的基本玩法'] = function (body) {
    var idx = -1, solved = false;
    var wrap = el('div', { 'class': 'ys2-bowlwrap' });
    var itemEl = el('div', { 'class': 'ys2-item' });
    var bowl = el('div', { 'class': 'ys2-bowl' });
    wrap.appendChild(itemEl); wrap.appendChild(bowl);
    var clue = el('p', { 'class': 'ys2-clue' });
    var opts = el('div', { 'class': 'ys2-opts' });
    var msg = el('p', { 'class': 'ys-msg' });
    var next = el('button', { 'class': 'ys-btn', type: 'button', text: '换一题' });
    body.appendChild(wrap); body.appendChild(clue); body.appendChild(opts); body.appendChild(msg);
    body.appendChild(el('div', { 'class': 'ys-row' }, [next]));
    note(body, '射覆是古人的猜物游戏：把一样东西盖在器皿下面，让人根据提示去猜。古人常用诗文典故来暗示，这里换成大白话的线索，帮你体会“看线索猜覆盖着的东西”。');
    function load(k) {
      idx = k; solved = false; var r = SHEFU[k];
      bowl.classList.remove('is-up'); itemEl.textContent = r.opts[r.ans].replace(/（.*）/, '');
      clue.textContent = '线索：' + r.clue; opts.innerHTML = '';
      r.opts.forEach(function (t, i) {
        var b = el('button', { 'class': 'ys-btn', type: 'button', text: t });
        b.addEventListener('click', function () {
          if (solved) return;
          if (i === r.ans) {
            solved = true; bowl.classList.add('is-up'); b.classList.add('is-done');
            msg.textContent = '猜中了，盖着的是“' + t + '”。' + r.tip;
          } else { b.classList.add('is-bad'); b.disabled = true; msg.textContent = '不是它。再对着线索想一想。'; }
        });
        opts.appendChild(b);
      });
      msg.textContent = '碗下盖着一样东西，根据线索猜一猜。';
    }
    next.addEventListener('click', function () {
      var n; do { n = Math.floor(Math.random() * SHEFU.length); } while (n === idx && SHEFU.length > 1);
      load(n);
    });
    load(0);
  };

  /* ---------- 牌九 ---------- */
  var PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  var TNAME = { '1-1': '地牌', '2-2': '板凳', '3-3': '长三', '4-4': '人牌', '5-5': '梅花牌', '6-6': '天牌', '1-3': '和牌' };
  function tileNode(a, b) {
    var t = el('div', { 'class': 'ys2-tile', role: 'img', 'aria-label': a + '点和' + b + '点的骨牌' });
    [a, b].forEach(function (n) {
      var h = el('div', { 'class': 'ys2-half' });
      for (var i = 0; i < 9; i++) {
        var on = PIPS[n].indexOf(i) >= 0;
        h.appendChild(el('span', { 'class': on ? 'ys2-pip' + (n === 1 || n === 4 ? ' is-red' : '') : '', style: on ? '' : 'width:10px;height:10px' }));
      }
      t.appendChild(h);
    });
    return t;
  }
  D['牌九'] = function (body) {
    var stageBox = el('div', { 'class': 'ys2-stage' });
    var msg = el('p', { 'class': 'ys-msg' });
    var draw = el('button', { 'class': 'ys-btn', type: 'button', text: '翻两张牌' });
    body.appendChild(stageBox); body.appendChild(msg);
    body.appendChild(el('div', { 'class': 'ys-row' }, [draw]));
    note(body, '牌九用的骨牌，每张牌面是两组点数，像把两枚骰子的点数刻在一张牌上。有的牌还有专门的名字，比如两个六点叫“天牌”。玩法很多，这里只演示看牌和数点。');
    function rand() { var a = 1 + Math.floor(Math.random() * 6), b = 1 + Math.floor(Math.random() * 6); return a <= b ? [a, b] : [b, a]; }
    function deal() {
      stageBox.innerHTML = '';
      var t = [rand(), rand()], sum = 0;
      t.forEach(function (p) {
        var w = el('div', { 'class': 'ys2-tilewrap' }, [tileNode(p[0], p[1]), el('div', { 'class': 'ys2-tname', text: TNAME[p[0] + '-' + p[1]] || p[0] + ' + ' + p[1] + ' = ' + (p[0] + p[1]) + ' 点' })]);
        stageBox.appendChild(w); sum += p[0] + p[1];
      });
      msg.textContent = '两张牌一共 ' + sum + ' 点，个位是 ' + (sum % 10) + '。牌九里常把点数相加、只看个位来比大小。';
    }
    draw.addEventListener('click', deal);
    deal();
  };

  /* ---------- 拆字 ---------- */
  var CHAI = [
    { c: '好', p: ['女', '子'], d: 'h', n: '“女”和“子”合在一起，就是“好”。' },
    { c: '明', p: ['日', '月'], d: 'h', n: '“日”和“月”合在一起，就是“明”。' },
    { c: '林', p: ['木', '木'], d: 'h', n: '两棵“木”并排，就是“林”。' },
    { c: '休', p: ['亻', '木'], d: 'h', n: '“亻”是“人”站在旁边的写法。人靠在树旁，就是“休”息。' },
    { c: '信', p: ['亻', '言'], d: 'h', n: '“亻”是“人”，加上“言”（说话），人说的话要算数，就是“信”。' },
    { c: '忠', p: ['中', '心'], d: 'v', n: '“中”在上，“心”在下：心放在正中，不偏不倚，就是“忠”。' },
    { c: '男', p: ['田', '力'], d: 'v', n: '“田”在上，“力”在下：在田里出力的人，就是“男”。' },
    { c: '想', p: ['相', '心'], d: 'v', n: '“相”在上，“心”在下：心里看着，就是“想”。“相”还能再拆成“木”和“目”。' }
  ];
  D['拆字'] = function (body) {
    var tl = newTimers(), cur = 0, open = false;
    var pickRow = el('div', { 'class': 'ys2-opts' });
    var glyph = el('div', { 'class': 'ys2-glyph', 'aria-live': 'polite' });
    var msg = el('p', { 'class': 'ys-msg' });
    var tog = el('button', { 'class': 'ys-btn', type: 'button', text: '拆开' });
    body.appendChild(pickRow); body.appendChild(glyph); body.appendChild(msg);
    body.appendChild(el('div', { 'class': 'ys-row' }, [tog]));
    note(body, '拆字是文人爱玩的文字游戏：把一个汉字拆成几个部分，或者把几个部分拼成一个字。灯谜里的“字谜”，很多就靠拆字来猜。这里选一个字，看它是由哪几部分合成的。');
    var btns = CHAI.map(function (r, i) {
      var b = el('button', { 'class': 'ys-btn is-ghost', type: 'button', text: r.c });
      b.addEventListener('click', function () { choose(i); });
      pickRow.appendChild(b); return b;
    });
    function render() {
      var r = CHAI[cur];
      glyph.className = 'ys2-glyph' + (r.d === 'v' ? ' is-v' : '') + (open ? ' is-open' : '');
      glyph.innerHTML = '';
      if (open) r.p.forEach(function (t) { glyph.appendChild(el('span', { text: t })); });
      else glyph.appendChild(el('span', { text: r.c }));
      tog.textContent = open ? '合上' : '拆开';
      msg.textContent = open ? r.n : '点“拆开”，看“' + r.c + '”是由哪几部分组成的。';
      btns.forEach(function (b, i) { b.classList.toggle('is-sel', i === cur); });
    }
    function choose(i) { clearAll(tl); cur = i; open = false; render(); later(tl, function () { open = true; render(); }, 350); }
    tog.addEventListener('click', function () { clearAll(tl); open = !open; render(); });
    choose(0);
    return function () { clearAll(tl); };
  };

  /* ---------- 灯谜 ---------- */
  var DM = [
    { t: '字谜', q: '一口咬掉牛尾巴', a: '告', e: '“牛”字去掉下面的一竖（尾巴），再加上“口”，就是“告”。' },
    { t: '字谜', q: '千里相会', a: '重', e: '“千”和“里”合在一起，就是“重”。' },
    { t: '字谜', q: '人在草木中', a: '茶', e: '“人”夹在上面的“艹”和下面的“木”中间，就是“茶”。' },
    { t: '字谜', q: '二人土上坐', a: '坐', e: '两个“人”在“土”上面，就是“坐”。' },
    { t: '字谜', q: '上小下大', a: '尖', e: '“小”在上，“大”在下，合起来就是“尖”。' },
    { t: '物谜', q: '麻屋子，红帐子，里面住个白胖子', a: '花生', e: '外面是粗糙的壳，里面是红衣的白胖果仁，就是花生。' },
    { t: '物谜', q: '小小诸葛亮，稳坐军中帐；摆下八卦阵，专捉飞来将', a: '蜘蛛', e: '蜘蛛结网守在中间，专等虫子自己撞上来。' }
  ];
  D['灯谜'] = function (body) {
    var idx = -1, shown = false;
    var tag = el('span', { 'class': 'ys2-ltag' });
    var q = el('div', {});
    var ans = el('div', { 'class': 'ys2-ans' });
    var lantern = el('div', { 'class': 'ys2-lantern' }, [tag, q, ans]);
    var msg = el('p', { 'class': 'ys-msg' });
    var bShow = el('button', { 'class': 'ys-btn', type: 'button', text: '看谜底' });
    var bNext = el('button', { 'class': 'ys-btn is-ghost', type: 'button', text: '换一条' });
    body.appendChild(lantern); body.appendChild(msg);
    body.appendChild(el('div', { 'class': 'ys-row' }, [bShow, bNext]));
    note(body, '灯谜是元宵节的传统：把谜语写在纸条上挂在灯笼下，人们边看灯边猜，猜中还可能有小奖。谜面有的靠拆字，有的靠描写物件，这里各选了几条流传很广的。');
    function load(k) {
      idx = k; shown = false; var r = DM[k];
      tag.textContent = r.t; q.textContent = r.q; ans.textContent = '';
      bShow.textContent = '看谜底'; msg.textContent = '先想一想，再点“看谜底”。';
    }
    bShow.addEventListener('click', function () {
      if (shown) return; shown = true; var r = DM[idx];
      ans.textContent = '谜底：' + r.a; msg.textContent = r.e; bShow.textContent = '已揭晓';
    });
    bNext.addEventListener('click', function () {
      var n; do { n = Math.floor(Math.random() * DM.length); } while (n === idx && DM.length > 1);
      load(n);
    });
    load(Math.floor(Math.random() * DM.length));
  };

  /* ---------- 对对子 ---------- */
  var DZ = [
    { up: '天', opts: ['地', '走', '红'], ans: 0, full: '天对地', tip: '“天”是名词，下联也要用名词。“走”是动作，“红”是颜色，词性都不合。' },
    { up: '雨', opts: ['快', '风', '吃'], ans: 1, full: '雨对风', tip: '“雨”和“风”都是天气里的事物，词性相同，意思也相配。' },
    { up: '山花', opts: ['飞快', '很红', '海树'], ans: 2, full: '山花对海树', tip: '两个字，都是“地方＋事物”：山里的花对海边的树。' },
    { up: '赤日', opts: ['苍穹', '慢走', '读书'], ans: 0, full: '赤日对苍穹', tip: '“赤”是红色，“苍”是青色，“日”和“穹”（天空）都是名词，颜色对颜色。' },
    { up: '来鸿', opts: ['吃饭', '去燕', '很好'], ans: 1, full: '来鸿对去燕', tip: '“来”对“去”，“鸿”（大雁）对“燕”，方向相反，鸟也相配。' }
  ];
  D['对对子'] = function (body) {
    var idx = -1, solved = false;
    var up = el('div', { 'class': 'ys2-up' });
    var opts = el('div', { 'class': 'ys2-opts' });
    var msg = el('p', { 'class': 'ys-msg' });
    var next = el('button', { 'class': 'ys-btn', type: 'button', text: '换一联' });
    body.appendChild(up); body.appendChild(opts); body.appendChild(msg);
    body.appendChild(el('div', { 'class': 'ys-row' }, [next]));
    note(body, '对对子是学写诗文的基本功：上联出一句，下联要字数相同，词性也要相配——名词对名词，动词对动词。这些例子来自蒙学读物《声律启蒙》。');
    function load(k) {
      idx = k; solved = false; var r = DZ[k];
      up.textContent = '上联：' + r.up + ' ——'; opts.innerHTML = '';
      shuffle(r.opts.map(function (t, i) { return { t: t, i: i }; })).forEach(function (o) {
        var b = el('button', { 'class': 'ys-btn', type: 'button', text: o.t });
        b.addEventListener('click', function () {
          if (solved) return;
          if (o.i === r.ans) { solved = true; b.classList.add('is-done'); msg.textContent = '对上了：' + r.full + '。' + r.tip; }
          else { b.classList.add('is-bad'); b.disabled = true; msg.textContent = '不太对。想一想上联是什么词性。'; }
        });
        opts.appendChild(b);
      });
      msg.textContent = '选一个合适的下联。';
    }
    next.addEventListener('click', function () {
      var n; do { n = Math.floor(Math.random() * DZ.length); } while (n === idx && DZ.length > 1);
      load(n);
    });
    load(0);
  };

  /* ---------- 斗草 ---------- */
  var DC = [['观音柳', '罗汉松'], ['君子竹', '美人蕉'], ['星星草', '月月红']];
  D['斗草'] = function (body) {
    var sel = null, doneCount = 0, tl = newTimers();
    var cols = el('div', { 'class': 'ys2-cols' });
    var colL = el('div', { 'class': 'ys2-col' }), colR = el('div', { 'class': 'ys2-col' });
    cols.appendChild(colL); cols.appendChild(colR);
    var msg = el('p', { 'class': 'ys-msg' });
    var again = el('button', { 'class': 'ys-btn is-ghost', type: 'button', text: '重新排一次' });
    body.appendChild(cols); body.appendChild(msg);
    body.appendChild(el('div', { 'class': 'ys-row' }, [again]));
    note(body, '斗草是端午前后的民间游戏，比法不止一种，其中一种是“对花草名”：一人说出一种花草，另一人要对出相配的名字。《红楼梦》第六十二回里，丫头们就这样比过。下面是书里出现的几对。');
    function build() {
      colL.innerHTML = ''; colR.innerHTML = ''; sel = null; doneCount = 0;
      msg.textContent = '先点左边一个花草名，再点右边和它相配的名字。';
      DC.forEach(function (p, i) {
        var b = el('button', { 'class': 'ys-btn', type: 'button', text: p[0] });
        b.dataset.i = i; b.addEventListener('click', function () { if (b.disabled) return; if (sel) sel.classList.remove('is-sel'); sel = b; b.classList.add('is-sel'); msg.textContent = '再点右边相配的名字。'; });
        colL.appendChild(b);
      });
      shuffle(DC.map(function (p, i) { return { t: p[1], i: i }; })).forEach(function (o) {
        var b = el('button', { 'class': 'ys-btn', type: 'button', text: o.t });
        b.addEventListener('click', function () {
          if (!sel || b.disabled) { if (!sel) msg.textContent = '先点左边的一个花草名。'; return; }
          if (+sel.dataset.i === o.i) {
            sel.classList.remove('is-sel'); sel.classList.add('is-done'); b.classList.add('is-done'); sel.disabled = true; b.disabled = true; sel = null; doneCount++;
            msg.textContent = doneCount === DC.length
              ? '全对上了。配对的门道：字数一样，类别相当——观音、罗汉都是佛教里的人物，君子、美人都是对人的称呼，星星、月月都是叠字。'
              : '对上了！再选下一对。';
          } else { msg.textContent = '这两个不太相配，再想想：字数、类别、说法是不是相当？'; sel.classList.remove('is-sel'); sel = null; }
        });
        colR.appendChild(b);
      });
    }
    again.addEventListener('click', build);
    build();
  };

  Y.decorate();
})();
