/* 知否知否 · 艺 · 古代游戏“演示”（第五批：打马、六博、弹棋）
   作用：给 打马、六博、弹棋 这 3 张卡片加上“▶ 演示”。
   这三种游戏的完整规则都没有完整保存下来，所以只演示“最基本、有文献依据的部分”：
   打马 = 掷三枚骰子、走马、撞回起点（简化版）；六博 = 有哪些棋具（动画）；弹棋 = 用手指弹棋子（可点着玩）。
   页面上的说明里都写明了“规则不全 / 这是简化示意”。画面全部是本站原创。
   用法：页面 html 在 yanshi.js 之后引入本文件（js/yanshi5.js）。 */
(function () {
  'use strict';
  var Y = window.ZY_YS;
  if (!Y) return;
  var el = Y.el, D = Y.demos;

  var INK = '#3b2a1a', RED = '#b5432f', JADE = '#3f7f6a', OCH = '#d9a441', BLUE = '#4c6fa5', WOOD = '#a06a3a', PAPER = '#efe6d3';

  (function () {
    if (document.getElementById('ys5-style')) return;
    var css = [
      '.ys5-cv{display:block;width:100%;max-width:480px;margin:0 auto;background:#efe6d3;border-radius:8px;touch-action:none}',
      '.ys5-track{display:grid;grid-template-columns:repeat(9,1fr);gap:3px;max-width:440px;margin:8px auto}',
      '.ys5-c{position:relative;aspect-ratio:1/1;background:#fbf8f0;border:2px solid #3b2a1a;border-radius:6px;font-size:10px;color:#7a6650;display:flex;align-items:flex-start;justify-content:flex-start;padding:1px 2px;line-height:1}',
      '.ys5-c.is-start,.ys5-c.is-end{background:#f3e2b0;color:#3b2a1a;font-weight:bold}',
      '.ys5-h{position:absolute;bottom:1px;width:44%;height:44%;border-radius:50%;border:2px solid #3b2a1a;font-size:11px;font-weight:bold;color:#fff;display:flex;align-items:center;justify-content:center}',
      '.ys5-h.r{background:#b5432f;left:2px}',
      '.ys5-h.k{background:#3b2a1a;right:2px}',
      '.ys5-dice{display:flex;gap:8px;justify-content:center;margin:6px 0}',
      '.ys5-die{width:44px;height:44px;background:#fbf8f0;border:3px solid #3b2a1a;border-radius:8px;font-size:32px;line-height:38px;text-align:center;color:#3b2a1a}'
    ].join('');
    var s = document.createElement('style'); s.id = 'ys5-style'; s.textContent = css;
    document.head.appendChild(s);
  })();

  function note(body, text) { body.appendChild(el('p', { 'class': 'ys-note', text: text })); }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp01(x); return x * x * (3 - 2 * x); }

  /* ================= 打马（简化版） ================= */
  var FACE = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  var N = 27; /* 简化：27 格，0 = 赤岸驿，26 = 尚乘局 */
  D['打马'] = function (body) {
    var pos, turn, busy, tm = [], roll = null, done;
    var track = el('div', { 'class': 'ys5-track' });
    var cells = [];
    for (var i = 0; i < N; i++) {
      var c = el('div', { 'class': 'ys5-c' + (i === 0 ? ' is-start' : i === N - 1 ? ' is-end' : '') });
      c.textContent = i === 0 ? '赤岸驿' : i === N - 1 ? '尚乘局' : String(i);
      cells.push(c); track.appendChild(c);
    }
    var dice = el('div', { 'class': 'ys5-dice' });
    var dieEls = [0, 1, 2].map(function () { var d = el('div', { 'class': 'ys5-die', text: '·' }); dice.appendChild(d); return d; });
    var msg = el('p', { 'class': 'ys-msg' });
    var bRoll = el('button', { 'class': 'ys-btn', type: 'button', text: '掷三枚骰子' });
    var bH1 = el('button', { 'class': 'ys-btn', type: 'button', text: '走红马一号' });
    var bH2 = el('button', { 'class': 'ys-btn', type: 'button', text: '走红马二号' });
    var bReset = el('button', { 'class': 'ys-btn is-ghost', type: 'button', text: '重新开始' });
    body.appendChild(track); body.appendChild(dice); body.appendChild(msg);
    body.appendChild(el('div', { 'class': 'ys-row' }, [bRoll, bH1, bH2, bReset]));
    note(body, '打马是宋代的一种掷骰行马游戏，李清照写过《打马图经》讲它的玩法。原来的棋盘很长，每人有 20 匹马，用三枚骰子，还有很多“采”的名目和赏罚。这里是大大简化的示意：只保留“掷三骰、走马、走到对方的马那里就把它撞回起点”这几个意思，格子数和走法都是本站简化的，不是《打马图经》的原规则。');

    function reset() {
      tm.forEach(clearTimeout); tm = [];
      pos = { r: [0, 0], k: [0, 0] }; turn = 'r'; busy = false; roll = null; done = false;
      dieEls.forEach(function (d) { d.textContent = '·'; });
      msg.textContent = '你执红马，对方执黑马。先掷三枚骰子，点数加起来就是这一步能走的格数。';
      draw(); buttons();
    }
    function buttons() {
      bRoll.disabled = busy || roll !== null || turn !== 'r' || done;
      bH1.disabled = bH2.disabled = busy || roll === null || turn !== 'r' || done;
      bH1.style.display = bH2.style.display = roll === null ? 'none' : '';
    }
    function draw() {
      cells.forEach(function (c) { var hs = c.querySelectorAll('.ys5-h'); for (var q = 0; q < hs.length; q++) c.removeChild(hs[q]); });
      [['r', 'r'], ['k', 'k']].forEach(function (p) {
        pos[p[0]].forEach(function (x, i) { cells[x].appendChild(el('span', { 'class': 'ys5-h ' + p[1], text: String(i + 1) })); });
      });
    }
    function move(side, idx, steps) {
      var me = pos[side], other = pos[side === 'r' ? 'k' : 'r'];
      var np = Math.min(N - 1, me[idx] + steps), text = '';
      me[idx] = np;
      if (np === N - 1) text = '到了尚乘局！';
      else {
        var hit = -1;
        other.forEach(function (o, j) { if (o === np && np !== 0) hit = j; });
        if (hit >= 0) { other[hit] = 0; text = '撞上了对方的马，把它撞回了赤岸驿！'; }
      }
      draw();
      return text;
    }
    function check() {
      if (pos.r[0] === N - 1 && pos.r[1] === N - 1) { done = true; msg.textContent += ' 你的两匹马都到了尚乘局，这一局到此结束。'; return true; }
      if (pos.k[0] === N - 1 && pos.k[1] === N - 1) { done = true; msg.textContent += ' 对方的两匹马都到了尚乘局，这一局到此结束。'; return true; }
      return false;
    }
    bRoll.addEventListener('click', function () {
      var a = [1, 2, 3].map(function () { return 1 + Math.floor(Math.random() * 6); });
      roll = a[0] + a[1] + a[2];
      dieEls.forEach(function (d, i) { d.textContent = FACE[a[i]]; });
      msg.textContent = '三个骰子共 ' + roll + ' 点，选一匹红马走 ' + roll + ' 格。';
      buttons();
    });
    function mine(idx) {
      if (roll === null || busy) return;
      if (pos.r[idx] === N - 1) { msg.textContent = '这匹马已经到了尚乘局，选另一匹吧。'; return; }
      var t = move('r', idx, roll);
      msg.textContent = '红马' + (idx + 1) + '号走了 ' + roll + ' 格。' + t;
      roll = null;
      if (check()) { buttons(); return; }
      turn = 'k'; busy = true; buttons();
      tm.push(setTimeout(function () {
        var a = [1, 2, 3].map(function () { return 1 + Math.floor(Math.random() * 6); });
        dieEls.forEach(function (d, i) { d.textContent = FACE[a[i]]; });
        var s = a[0] + a[1] + a[2];
        var cand = [0, 1].filter(function (i) { return pos.k[i] < N - 1; });
        var k = cand[Math.floor(Math.random() * cand.length)];
        var tt = move('k', k, s);
        msg.textContent = '对方掷出 ' + s + ' 点，黑马' + (k + 1) + '号走了 ' + s + ' 格。' + tt + ' 轮到你了。';
        turn = 'r'; busy = false; check(); buttons();
      }, 900));
    }
    bH1.addEventListener('click', function () { mine(0); });
    bH2.addEventListener('click', function () { mine(1); });
    bReset.addEventListener('click', reset);
    reset();
    return function () { tm.forEach(clearTimeout); };
  };

  /* ================= 六博（棋具示意动画） ================= */
  D['六博'] = function (body) {
    var W = 480, H = 300;
    var cv = el('canvas', { 'class': 'ys-canvas ys5-cv', width: W, height: H, 'aria-label': '六博棋具示意动画' });
    body.appendChild(cv);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    var ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    var msg = el('p', { 'class': 'ys-msg' });
    var btn = el('button', { 'class': 'ys-btn', type: 'button', text: '再看一次' });
    body.appendChild(msg); body.appendChild(el('div', { 'class': 'ys-row' }, [btn]));
    note(body, '六博是先秦到汉代很流行的博戏。古书里能确认的有：两个人对局，用六根“箸”掷出点数（采），十二枚棋（黑白各六），两条“鱼”放在“水”里，棋子走到位置后可以“竖起来”（叫“骁棋”），进水“牵鱼”就得筹。但它的具体走法已经失传，出土的棋盘也和书里的描述不完全一样，所以这里只演示有哪些棋具，不演示怎么走。示意图不是真实棋盘。');
    var DUR = 13, t = 0, playing = false, last = 0, raf = 0, dead = false;
    var CAP = [
      [0, '六博是两个人玩的博戏。'],
      [1.5, '先用六根“箸”掷出一个点数。'],
      [5, '棋盘上有两处“水”，古书里说每方各有六枚棋子，一共十二枚，黑白各六。'],
      [8.5, '另有两条“鱼”，放在水里。'],
      [10.5, '棋子走到位置可以竖起来，叫“骁棋”；进水“牵鱼”就能得筹。']
    ];
    function bx(i) { return 150 + i * 32; }
    function draw() {
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      /* 棋盘：示意 */
      ctx.fillStyle = '#d8b884'; ctx.strokeStyle = INK; ctx.lineWidth = 3;
      ctx.fillRect(80, 100, 320, 130); ctx.strokeRect(80, 100, 320, 130);
      ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(59,42,26,.55)';
      for (var i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(80 + i * 320 / 6, 100); ctx.lineTo(80 + i * 320 / 6, 230); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(80, 165); ctx.lineTo(400, 165); ctx.stroke();
      /* 水 */
      var wa = t > 5 ? 1 : 0;
      var pulse = (t > 5 && t < 8.5) || (t > 10.5) ? 0.5 + 0.5 * Math.sin(t * 5) : 0;
      [[80, 165], [400, 165]].forEach(function (p) {
        ctx.fillStyle = 'rgba(76,111,165,' + (0.35 + 0.25 * pulse) + ')';
        ctx.beginPath(); ctx.ellipse(p[0], p[1], 26, 30, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = BLUE; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = BLUE; ctx.font = 'bold 16px serif'; ctx.textAlign = 'center'; ctx.fillText('水', p[0], p[1] + 6);
      });
      /* 六根箸：0～5 秒 */
      if (t > 1.5 && t < 5.5) {
        var k = clamp01((t - 1.5) / 2.2), landed = t > 3.7;
        for (var s = 0; s < 6; s++) {
          var x = 130 + s * 42, spin = landed ? 0 : Math.sin(t * 14 + s) * 1;
          var y = landed ? 60 : 20 + ease(k) * 40 - Math.abs(Math.sin(t * 6 + s)) * 24 * (1 - k);
          ctx.save(); ctx.translate(x, y); ctx.rotate(landed ? (s % 2 ? 0.1 : -0.08) : spin);
          var face = (s * 7 + 3) % 3 === 0;
          ctx.fillStyle = face ? '#f1e2b0' : '#a06a3a'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
          ctx.fillRect(-5, -28, 10, 56); ctx.strokeRect(-5, -28, 10, 56);
          ctx.restore();
        }
        if (landed) { ctx.fillStyle = INK; ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('六根箸（正反面不同，落地看朝上的面）', 240, 24); }
      }
      /* 棋子：5 秒起出现 */
      if (t > 5) {
        for (var j = 0; j < 12; j++) {
          var black = j < 6, idx = j % 6;
          var appear = clamp01((t - 5.2 - j * 0.18) / 0.5);
          if (appear <= 0) continue;
          var px = 100 + idx * 55 + (black ? 0 : 0), py = black ? 128 : 202;
          var stand = (j === 8 || j === 2) && t > 10.5;
          ctx.globalAlpha = appear;
          ctx.fillStyle = black ? INK : '#fbf8f0'; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
          if (stand) {
            ctx.beginPath(); ctx.rect(px - 8, py - 22, 16, 34); ctx.fill(); ctx.stroke();
            ctx.fillStyle = RED; ctx.font = 'bold 12px serif'; ctx.textAlign = 'center'; ctx.fillText('骁', px, py - 4);
          } else {
            ctx.beginPath(); ctx.arc(px, py, 13 * (0.6 + 0.4 * appear), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
      }
      /* 两条鱼：8.5 秒起，画在下方，写明“共两枚，放在水里” */
      if (t > 8.5) {
        var fa = clamp01((t - 8.5) / 0.8);
        ctx.globalAlpha = fa;
        [0, 1].forEach(function (n) {
          var fx = 205 + n * 70, fy = 268, sw = Math.sin(t * 6 + n) * 3;
          ctx.fillStyle = OCH; ctx.strokeStyle = INK; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(fx, fy, 20, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(fx - 18, fy); ctx.lineTo(fx - 32, fy - 9 + sw); ctx.lineTo(fx - 32, fy + 9 + sw); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(fx + 10, fy - 2, 1.8, 0, Math.PI * 2); ctx.fill();
        });
        ctx.fillStyle = INK; ctx.font = '13px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('鱼，共两条，放在“水”里', 300, 272);
        ctx.globalAlpha = 1;
      }
      ctx.textAlign = 'left';
      var s2 = '';
      for (var c = 0; c < CAP.length; c++) if (CAP[c][0] <= t) s2 = CAP[c][1];
      msg.textContent = s2;
    }
    function start() { t = 0; playing = true; last = 0; btn.disabled = true; btn.textContent = '播放中……'; }
    function frame(ts) {
      if (dead) return;
      var dt = last ? Math.min((ts - last) / 1000, 0.05) : 0.016; last = ts;
      if (playing) { t += dt; if (t >= DUR) { t = DUR; playing = false; btn.disabled = false; btn.textContent = '再看一次'; } }
      draw(); raf = requestAnimationFrame(frame);
    }
    btn.addEventListener('click', start);
    start(); raf = requestAnimationFrame(frame);
    return function () { dead = true; cancelAnimationFrame(raf); };
  };

  /* ================= 弹棋（弹一弹） ================= */
  D['弹棋'] = function (body) {
    var W = 480, H = 300, R = 13;
    var cv = el('canvas', { 'class': 'ys-canvas ys5-cv', width: W, height: H, 'aria-label': '弹棋：用手指弹棋子' });
    body.appendChild(cv);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    var ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    var msg = el('p', { 'class': 'ys-msg', text: '按住一枚白棋，向后拉，再松手，把它“弹”出去。' });
    var cnt = el('p', { 'class': 'ys-count', text: '已弹 0 次' });
    var bReset = el('button', { 'class': 'ys-btn is-ghost', type: 'button', text: '重新摆棋' });
    body.appendChild(msg); body.appendChild(cnt); body.appendChild(el('div', { 'class': 'ys-row' }, [bReset]));
    note(body, '弹棋是汉代到唐代流行的游戏：在中间隆起的木棋盘上，用手指把棋子弹出去，去撞对方的棋子。古书记载棋子数不统一，有的说黑白各六枚，有的说朱墨各十二枚；具体怎么算胜负，留下来的资料也不完整。这里只演示“用手指弹一弹、棋子会撞”，不分输赢，中间隆起的部分也只是画出来示意。');
    var BX = 110, BY = 10, BS = 280, ps, shots, drag = null, raf = 0, dead = false, last = 0;
    function setup() {
      ps = []; shots = 0; cnt.textContent = '已弹 0 次';
      for (var i = 0; i < 6; i++) {
        ps.push({ x: BX + 40 + i * 40, y: BY + 40, vx: 0, vy: 0, c: 'k' });
        ps.push({ x: BX + 40 + i * 40, y: BY + BS - 40, vx: 0, vy: 0, c: 'w' });
      }
    }
    function pos(e) {
      var r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
    }
    cv.addEventListener('pointerdown', function (e) {
      var p = pos(e);
      for (var i = 0; i < ps.length; i++) {
        var q = ps[i];
        if (q.c === 'w' && Math.hypot(q.x - p.x, q.y - p.y) < R + 6) { drag = { i: i, x: p.x, y: p.y }; try { cv.setPointerCapture(e.pointerId); } catch (x) { } e.preventDefault(); return; }
      }
    });
    cv.addEventListener('pointermove', function (e) { if (drag) { var p = pos(e); drag.x = p.x; drag.y = p.y; } });
    function release() {
      if (!drag) return;
      var q = ps[drag.i], dx = q.x - drag.x, dy = q.y - drag.y, len = Math.hypot(dx, dy);
      if (len > 8) {
        var sp = Math.min(len * 4.5, 620);
        q.vx = dx / len * sp; q.vy = dy / len * sp;
        shots++; cnt.textContent = '已弹 ' + shots + ' 次';
        msg.textContent = '弹出去了！看看撞到了谁。';
      }
      drag = null;
    }
    cv.addEventListener('pointerup', release);
    cv.addEventListener('pointercancel', function () { drag = null; });
    bReset.addEventListener('click', function () { setup(); msg.textContent = '棋摆好了。按住一枚白棋，向后拉，再松手。'; });

    function step(dt) {
      var f = Math.pow(0.985, dt * 60), i, j;
      for (i = 0; i < ps.length; i++) {
        var q = ps[i];
        q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= f; q.vy *= f;
        if (Math.hypot(q.vx, q.vy) < 4) { q.vx = 0; q.vy = 0; }
        if (q.x < BX + R) { q.x = BX + R; q.vx = Math.abs(q.vx) * 0.8; }
        if (q.x > BX + BS - R) { q.x = BX + BS - R; q.vx = -Math.abs(q.vx) * 0.8; }
        if (q.y < BY + R) { q.y = BY + R; q.vy = Math.abs(q.vy) * 0.8; }
        if (q.y > BY + BS - R) { q.y = BY + BS - R; q.vy = -Math.abs(q.vy) * 0.8; }
      }
      for (i = 0; i < ps.length; i++) for (j = i + 1; j < ps.length; j++) {
        var a = ps[i], b = ps[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
        if (d < 2 * R && d > 0.001) {
          var nx = dx / d, ny = dy / d, ov = 2 * R - d;
          a.x -= nx * ov / 2; a.y -= ny * ov / 2; b.x += nx * ov / 2; b.y += ny * ov / 2;
          var rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rv < 0) {
            var imp = -rv * 0.9;
            a.vx -= imp * nx; a.vy -= imp * ny; b.vx += imp * nx; b.vy += imp * ny;
          }
        }
      }
    }
    function render() {
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#d8b884'; ctx.strokeStyle = INK; ctx.lineWidth = 4;
      ctx.fillRect(BX, BY, BS, BS); ctx.strokeRect(BX, BY, BS, BS);
      /* 四角微隆起 */
      ctx.fillStyle = 'rgba(255,255,255,.28)';
      [[BX, BY], [BX + BS, BY], [BX, BY + BS], [BX + BS, BY + BS]].forEach(function (p) {
        ctx.beginPath(); ctx.arc(p[0], p[1], 34, 0, Math.PI * 2); ctx.fill();
      });
      /* 中央隆起：渐变圆 + 顶部小凹 */
      var g = ctx.createRadialGradient(BX + BS / 2 - 8, BY + BS / 2 - 8, 6, BX + BS / 2, BY + BS / 2, 62);
      g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(90,60,30,.22)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(BX + BS / 2, BY + BS / 2, 62, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(59,42,26,.4)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = 'rgba(59,42,26,.45)'; ctx.beginPath(); ctx.arc(BX + BS / 2, BY + BS / 2, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = INK; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('中间隆起', 8, 24); ctx.fillText('（示意）', 8, 42);
      ps.forEach(function (q) {
        ctx.fillStyle = q.c === 'k' ? INK : '#fbf8f0'; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(q.x, q.y, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      if (drag) {
        var q = ps[drag.i];
        ctx.strokeStyle = RED; ctx.lineWidth = 3; ctx.setLineDash([6, 5]);
        ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(drag.x, drag.y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(181,67,47,.6)'; ctx.lineWidth = 2;
        var dx = q.x - drag.x, dy = q.y - drag.y, len = Math.hypot(dx, dy) || 1;
        ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x + dx / len * Math.min(len, 120), q.y + dy / len * Math.min(len, 120)); ctx.stroke();
      }
    }
    function frame(ts) {
      if (dead) return;
      var dt = last ? Math.min((ts - last) / 1000, 0.03) : 0.016; last = ts;
      step(dt); render(); raf = requestAnimationFrame(frame);
    }
    setup(); raf = requestAnimationFrame(frame);
    return function () { dead = true; cancelAnimationFrame(raf); };
  };

  Y.decorate();
})();
