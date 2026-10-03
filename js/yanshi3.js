/* 知否知否 · 艺 · 古代游戏“演示”（第三批：小动画）
   作用：给 曲水流觞、击鼓传花、孔明锁、秋千、拔河、龙舟、蹴鞠、马球、角抵 这 9 张卡片加上“▶ 演示”小动画。
   这些游戏不方便让读者自己玩，所以做成 10～14 秒的原创简笔动画，可以“再看一次”。
   只演示概念：没有输赢排名、不讲详细规则。画面全部是本站原创。
   用法：页面 html 在 yanshi.js 之后引入本文件（js/yanshi3.js）。 */
(function () {
  'use strict';
  var Y = window.ZY_YS;
  if (!Y) return;
  var el = Y.el, D = Y.demos;

  var INK = '#3b2a1a', RED = '#b5432f', JADE = '#3f7f6a', OCH = '#d9a441', BLUE = '#4c6fa5', WOOD = '#a06a3a', SKIN = '#f1cfa1', PAPER = '#efe6d3';

  /* ---------- 动画外壳：画布 + 字幕 + “再看一次” ---------- */
  function player(body, o) {
    var W = 480, H = 300;
    var cv = el('canvas', { 'class': 'ys-canvas ys2-cv', width: W, height: H, 'aria-label': o.label });
    body.appendChild(cv);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    var ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    var msg = el('p', { 'class': 'ys-msg' });
    var btn = el('button', { 'class': 'ys-btn', type: 'button', text: '再看一次' });
    body.appendChild(msg);
    body.appendChild(el('div', { 'class': 'ys-row' }, [btn]));
    body.appendChild(el('p', { 'class': 'ys-note', text: o.note }));
    var t = 0, playing = false, raf = 0, last = 0, dead = false;
    function caption() {
      var s = '';
      for (var i = 0; i < o.caps.length; i++) if (o.caps[i][0] <= t) s = o.caps[i][1];
      msg.textContent = s;
    }
    function start() {
      if (o.init) o.init();
      t = 0; playing = true; last = 0; btn.disabled = true; btn.textContent = '播放中……';
    }
    function frame(ts) {
      if (dead) return;
      var dt = last ? Math.min((ts - last) / 1000, 0.05) : 0.016; last = ts;
      if (playing) {
        t += dt;
        if (t >= o.dur) { t = o.dur; playing = false; btn.disabled = false; btn.textContent = '再看一次'; }
      }
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      o.draw(ctx, t, W, H);
      caption();
      raf = requestAnimationFrame(frame);
    }
    btn.addEventListener('click', start);
    start();
    raf = requestAnimationFrame(frame);
    return function () { dead = true; cancelAnimationFrame(raf); };
  }

  /* ---------- 简笔小人：脚在 (x,y)，s 是大小，lean 是前倾角，hand 是手抓的位置 ---------- */
  function man(ctx, x, y, s, col, lean, hand, legs) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(lean || 0); ctx.scale(s, s);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    var lg = legs || 0;
    ctx.strokeStyle = INK; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(0, -28); ctx.lineTo(-8 - lg, 0); ctx.moveTo(0, -28); ctx.lineTo(8 + lg, 0); ctx.stroke();
    ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, -54); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, -54); ctx.stroke();
    if (hand) {
      var dx = (hand.x - x) / s, dy = (hand.y - y) / s, c = Math.cos(-(lean || 0)), sn = Math.sin(-(lean || 0));
      var hx = dx * c - dy * sn, hy = dx * sn + dy * c;
      ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -52); ctx.lineTo(hx, hy); ctx.stroke();
    }
    ctx.fillStyle = SKIN; ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, -67, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, -70, 9, Math.PI, 0); ctx.fill();
    ctx.restore();
  }
  function line(ctx, x1, y1, x2, y2, w, col) {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  function ease(u) { u = Math.max(0, Math.min(1, u)); return 1 - Math.pow(1 - u, 2.2); }
  function clamp01(u) { return Math.max(0, Math.min(1, u)); }
  function note(s) { return s; }

  /* ---------- 曲水流觞 ---------- */
  D['曲水流觞'] = function (body) {
    var XS = [70, 150, 230, 310, 390], STOP = 2;
    function sy(x) { return 196 + 30 * Math.sin((x - 20) / 50); }
    return player(body, {
      label: '曲水流觞动画', dur: 13,
      note: '曲水流觞是文人雅集的游戏：大家坐在弯弯的水道边，把酒杯放在水面上，酒杯顺水漂流，停在谁面前，谁就取杯饮酒、作诗。东晋永和九年的兰亭雅集最有名。这里是简化的示意。',
      caps: [[0, '把酒杯放进弯弯的水道，让它顺水漂流。'], [5, '酒杯越漂越慢……'], [8.2, '停在了这位面前。'], [10, '停在谁面前，谁就要饮酒、作诗。']],
      draw: function (ctx, t) {
        ctx.fillStyle = '#b9c79a'; ctx.fillRect(0, 0, 480, 300);
        ctx.strokeStyle = '#6f8a5a'; ctx.lineWidth = 42; ctx.lineCap = 'butt'; ctx.beginPath();
        for (var x = -10; x <= 490; x += 6) { var y = sy(x); if (x === -10) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke();
        ctx.strokeStyle = '#8fb4c8'; ctx.lineWidth = 36; ctx.beginPath();
        for (x = -10; x <= 490; x += 6) { y = sy(x); if (x === -10) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
        for (var k = 0; k < 9; k++) {
          var rx = ((k * 58 + t * 30) % 500) - 10, ry = sy(rx) + (k % 2 ? 6 : -6);
          ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + 12, ry + 1); ctx.stroke();
        }
        var cx = 20 + (XS[STOP] - 20) * ease(t / 8), cy = sy(cx);
        var raised = t > 8.4;
        XS.forEach(function (px, i) {
          var by = sy(px) - 34;
          var hand = null;
          if (i === STOP && raised) hand = { x: px + 18, y: by - 66 };
          man(ctx, px, by, 0.9, [RED, JADE, BLUE, OCH, '#8a5a9c'][i], 0, hand, 0);
        });
        if (raised) { cx = XS[STOP] + 18; cy = sy(XS[STOP]) - 34 - 66 * 0.9 - 4; }
        ctx.fillStyle = '#a2452f'; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.ellipse(cx, cy, 12, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        line(ctx, cx - 12, cy, cx - 17, cy - 3, 2.5, INK); line(ctx, cx + 12, cy, cx + 17, cy - 3, 2.5, INK);
        if (t > 10) {
          var bx = XS[STOP] + 40, by2 = sy(XS[STOP]) - 132;
          ctx.fillStyle = '#fff5dc'; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.ellipse(bx, by2, 26, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = INK; ctx.font = '22px "Ma Shan Zheng", "Noto Serif SC", serif'; ctx.textAlign = 'center'; ctx.fillText('诗', bx, by2 + 8); ctx.textAlign = 'left';
        }
      }
    });
  };

  /* ---------- 击鼓传花 ---------- */
  D['击鼓传花'] = function (body) {
    var N = 6, hops, start0, endIdx, endT;
    function init() {
      start0 = Math.floor(Math.random() * N); hops = []; var tt = 0.8, iv = 0.75;
      while (tt < 9.4) { hops.push(tt); tt += iv; iv = Math.max(0.24, iv * 0.9); }
      endT = tt; endIdx = (start0 + hops.length) % N;
    }
    init();
    function pos(i) { var a = -Math.PI / 2 + i * 2 * Math.PI / N; return { x: 240 + Math.cos(a) * 105, y: 150 + Math.sin(a) * 88 }; }
    return player(body, {
      label: '击鼓传花动画', dur: 13, init: init,
      note: '击鼓传花是宴席上的助兴游戏：一个人击鼓，其他人围坐传递一枝花，鼓声一停，花在谁手里，谁就要表演节目或者饮酒。这里的鼓声用画面上的鼓来表示。',
      caps: [[0, '击鼓开始，大家把花一个接一个地往下传。'], [5, '鼓声越来越急，花也传得越来越快……'], [9.8, '鼓声停了！花在这位手里。'], [11, '他要表演一个节目。']],
      draw: function (ctx, t) {
        var cur = start0, prevT = 0, k;
        for (k = 0; k < hops.length && hops[k] <= t; k++) { prevT = hops[k]; }
        var from = (start0 + Math.max(0, k - 1)) % N, to = (start0 + k) % N;
        var fp = pos(from), tp = pos(to), u = 0, hx, hy;
        if (k === 0) { hx = pos(start0).x; hy = pos(start0).y - 40; }
        else if (t < endT - 0.01 || t < prevT + 0.16) {
          u = clamp01((t - prevT) / 0.16); hx = fp.x + (tp.x - fp.x) * u; hy = fp.y + (tp.y - fp.y) * u - 40 - Math.sin(u * Math.PI) * 18;
        } else { hx = tp.x; hy = tp.y - 40; }
        var beat = 0; for (var j = 0; j < hops.length; j++) { var d = t - hops[j]; if (d >= 0 && d < 0.18) beat = Math.max(beat, 1 - d / 0.18); }
        var holder = k === 0 ? start0 : (u >= 1 || t >= prevT + 0.16 ? to : from);
        var stopped = t >= endT;
        for (var i = 0; i < N; i++) {
          var p = pos(i);
          ctx.fillStyle = [RED, JADE, BLUE, OCH, '#8a5a9c', '#7a8f3a'][i]; ctx.strokeStyle = INK; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(p.x, p.y, 20, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(p.x, p.y - 24, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(p.x, p.y - 27, 11, Math.PI, 0); ctx.fill();
          if (stopped && i === endIdx) { ctx.strokeStyle = OCH; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(p.x, p.y - 8, 40 + Math.sin(t * 6) * 2, 0, Math.PI * 2); ctx.stroke(); }
        }
        var s = 1 + beat * 0.15;
        ctx.save(); ctx.translate(240, 152); ctx.scale(s, s);
        ctx.fillStyle = '#a2452f'; ctx.strokeStyle = INK; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-22, -12); ctx.lineTo(-22, 14); ctx.quadraticCurveTo(0, 26, 22, 14); ctx.lineTo(22, -12); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#e7c98a'; ctx.beginPath(); ctx.ellipse(0, -12, 22, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = '#e0553a'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
        for (var q = 0; q < 5; q++) { var a2 = q * 1.2566; ctx.beginPath(); ctx.ellipse(hx + Math.cos(a2) * 7, hy + Math.sin(a2) * 7, 5, 4, a2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
        ctx.fillStyle = OCH; ctx.beginPath(); ctx.arc(hx, hy, 3.5, 0, Math.PI * 2); ctx.fill();
        if (!stopped && beat > 0) { ctx.strokeStyle = 'rgba(122,53,18,.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(240, 152, 34 + (1 - beat) * 18, 0, Math.PI * 2); ctx.stroke(); }
      }
    });
  };

  /* ---------- 孔明锁 ---------- */
  D['孔明锁'] = function (body) {
    var CX = 240, CY = 150, L = 136, DIST = [125, 62, 96];
    var P = [
      { dir: [1, 0], off: [0, -15], col: '#c98a4a', t0: 1.6, sg: -1, ax: 0 },
      { dir: [0, 1], off: [-15, 0], col: '#a06a3a', t0: 3.0, sg: -1, ax: 1 },
      { dir: [0.7071, -0.7071], off: [10.6, 10.6], col: '#d9a441', t0: 4.4, sg: 1, ax: 2 },
      { dir: [1, 0], off: [0, 15], col: '#8a5a2a', t0: 5.6, sg: 1, ax: 0 },
      { dir: [0, 1], off: [15, 0], col: '#b9793a', t0: 6.6, sg: 1, ax: 1 },
      { dir: [0.7071, -0.7071], off: [-10.6, -10.6], col: '#e3b45a', t0: 7.6, sg: -1, ax: 2 }
    ];
    var ORDER = [0, 1, 2, 3, 4, 5];
    return player(body, {
      label: '孔明锁拆解动画', dur: 14,
      note: '孔明锁是传统的榫卯玩具：六根木条互相咬合、彼此卡住，不用钉子和胶水，却能拼成一个整体。玩的时候要找到那根能先滑动的“钥匙条”，再一根根拆开。它常被说成诸葛亮发明的，这个说法并没有可靠的史料支持。图中是简化示意，并不是真实的拆法。',
      caps: [[0, '六根木条互相咬合，拼成一个整体。'], [1.4, '先找到能滑动的那一根，慢慢抽出来……'], [5, '一根抽出，别的木条就松了，再依次抽出。'], [8.6, '六根木条全部分开。'], [10, '再按相反的顺序，一根根拼回去。']],
      draw: function (ctx, t) {
        var back = t > 10 ? (t - 10) / 3.2 : 0;
        ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.beginPath(); ctx.ellipse(CX, 262, 120, 14, 0, 0, Math.PI * 2); ctx.fill();
        P.forEach(function (p, i) {
          var out;
          if (t <= 10) out = ease((t - p.t0) / 1.4);
          else out = 1 - ease((back * 6 - (5 - i)) / 1.2 * 1.0 + 0.0);
          out = clamp01(out);
          if (t > 10) { var u = clamp01((t - 10 - (5 - i) * 0.5) / 0.9); out = 1 - ease(u); }
          var d = p.sg * out * DIST[p.ax];
          var ox = CX + p.off[0] + p.dir[0] * d, oy = CY + p.off[1] + p.dir[1] * d + (t > 1 ? 0 : 0);
          var hl = L / 2;
          var x1 = ox - p.dir[0] * hl, y1 = oy - p.dir[1] * hl, x2 = ox + p.dir[0] * hl, y2 = oy + p.dir[1] * hl;
          line(ctx, x1, y1, x2, y2, 26, INK);
          line(ctx, x1, y1, x2, y2, 20, p.col);
          line(ctx, x1, y1, x2, y2, 2, 'rgba(59,42,26,.35)');
        });
      }
    });
  };

  /* ---------- 秋千 ---------- */
  D['秋千'] = function (body) {
    var PX = 240, PY = 56, LEN = 158;
    return player(body, {
      label: '秋千动画', dur: 11,
      note: '荡秋千是寒食、清明前后很受欢迎的游戏，尤其在闺阁女子中流行。人坐在踏板上，双脚一蹬一收，就能越荡越高。这里是简化的示意。',
      caps: [[0, '轻轻推一下，秋千荡起来。'], [4, '身体一前一后配合，越荡越高。'], [8.5, '荡到最高处，又慢慢落回来。']],
      draw: function (ctx, t) {
        ctx.fillStyle = '#b9c79a'; ctx.fillRect(0, 262, 480, 38);
        line(ctx, 130, 262, 148, PY - 6, 12, INK); line(ctx, 130, 262, 148, PY - 6, 8, '#a2452f');
        line(ctx, 350, 262, 332, PY - 6, 12, INK); line(ctx, 350, 262, 332, PY - 6, 8, '#a2452f');
        line(ctx, 138, PY - 4, 342, PY - 4, 14, INK); line(ctx, 138, PY - 4, 342, PY - 4, 9, '#a2452f');
        var amp = 0.1 + 0.62 * ease(t / 8) * (t > 8.5 ? Math.max(0.35, 1 - (t - 8.5) / 3) : 1);
        var th = amp * Math.sin(t * 2 * Math.PI / 2.3);
        ctx.save(); ctx.translate(PX, PY); ctx.rotate(th);
        line(ctx, -16, 0, -16, LEN, 3, INK); line(ctx, 16, 0, 16, LEN, 3, INK);
        ctx.fillStyle = WOOD; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.fillRect(-26, LEN, 52, 7); ctx.strokeRect(-26, LEN, 52, 7);
        var sw = Math.cos(t * 2 * Math.PI / 2.3);
        ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(0, LEN - 4); ctx.lineTo(16 + sw * 8, LEN - 4); ctx.lineTo(18 + sw * 12, LEN + 26); ctx.stroke();
        ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(0, LEN - 4); ctx.lineTo(0, LEN - 32); ctx.stroke();
        ctx.strokeStyle = '#c9503a'; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(0, LEN - 4); ctx.lineTo(0, LEN - 32); ctx.stroke();
        ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-1, LEN - 30); ctx.lineTo(-14, LEN - 16); ctx.moveTo(1, LEN - 30); ctx.lineTo(14, LEN - 16); ctx.stroke();
        ctx.fillStyle = SKIN; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, LEN - 44, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, LEN - 47, 10, Math.PI, 0); ctx.fill();
        ctx.beginPath(); ctx.arc(-9, LEN - 44, 4, 0, Math.PI * 2); ctx.arc(9, LEN - 44, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    });
  };

  /* ---------- 拔河 ---------- */
  D['拔河'] = function (body) {
    var dir = 1;
    function init() { dir = Math.random() < 0.5 ? -1 : 1; }
    init();
    return player(body, {
      label: '拔河动画', dur: 12, init: init,
      note: '拔河古时叫“牵钩”“拖钩”，据说起源很早。两队人拉住一根长绳的两头，往各自的方向使劲，把中间的标记拉过界线的一方获胜。这里是简化的示意。',
      caps: [[0, '两队各拉住绳子的一头。'], [2, '一开始不分上下，绳子来回晃动。'], [7.5, '有一队渐渐占了上风……'], [10.5, '标记被拉过了界线，这一轮结束。']],
      draw: function (ctx, t) {
        ctx.fillStyle = '#b9c79a'; ctx.fillRect(0, 232, 480, 68);
        ctx.strokeStyle = '#8a7b62'; ctx.lineWidth = 3; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(240, 96); ctx.lineTo(240, 250); ctx.stroke(); ctx.setLineDash([]);
        var off = t < 7 ? 22 * Math.sin(t * 1.7) * (t < 1.5 ? t / 1.5 : 1) : 22 * Math.sin(7 * 1.7) + dir * 62 * ease((t - 7) / 3.6);
        var sway = Math.sin(t * 5) * 2;
        var RY = 176;
        line(ctx, 40 + off, RY, 440 + off, RY, 8, INK); line(ctx, 40 + off, RY, 440 + off, RY, 5, '#d9a441');
        ctx.fillStyle = RED; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(240 + off, RY - 4); ctx.lineTo(240 + off, RY - 40); ctx.lineTo(262 + off, RY - 32); ctx.lineTo(240 + off, RY - 24); ctx.stroke(); ctx.fill();
        var lead = dir * off > 40 ? 0.12 : 0;
        [110, 152, 194].forEach(function (x, i) { man(ctx, x + off, 232, 1, RED, -0.42 - lead * (dir > 0 ? -1 : 1) + sway * 0.01, { x: 180 + i * 20 + off - 60 + 60, y: RY }, 4); });
        [286, 328, 370].forEach(function (x, i) { man(ctx, x + off, 232, 1, BLUE, 0.42 + lead * (dir > 0 ? -1 : 1) - sway * 0.01, { x: 268 + i * 22 + off, y: RY }, 4); });
      }
    });
  };

  /* ---------- 龙舟 ---------- */
  D['龙舟'] = function (body) {
    return player(body, {
      label: '龙舟动画', dur: 12,
      note: '划龙舟是端午节的传统活动：船头雕着龙头，船上的人随着鼓点一起划桨。鼓手敲一下，桨手划一下，全船步调一致，船才跑得快。这里是简化的示意。',
      caps: [[0, '龙舟出发，鼓手坐在船头敲鼓。'], [3, '鼓点一下，全船的桨一起划下去。'], [8, '鼓越敲越紧，船越划越快。']],
      draw: function (ctx, t) {
        ctx.fillStyle = '#cfe0e6'; ctx.fillRect(0, 0, 480, 300);
        ctx.fillStyle = '#8fb4c8'; ctx.fillRect(0, 170, 480, 130);
        ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2.5;
        var spd = 60 + 30 * clamp01(t / 8);
        for (var k = 0; k < 12; k++) {
          var wx = (((k * 47 - t * spd) % 520) + 520) % 520 - 20, wy = 190 + (k % 4) * 27;
          ctx.beginPath(); ctx.moveTo(wx, wy); ctx.quadraticCurveTo(wx + 12, wy - 5, wx + 24, wy); ctx.stroke();
        }
        var rate = 1.7 + 0.5 * clamp01(t / 8), ph = t * rate * 2 * Math.PI, bob = Math.sin(ph) * 1.5;
        ctx.save(); ctx.translate(0, bob);
        ctx.fillStyle = '#c9302c'; ctx.strokeStyle = INK; ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(60, 176); ctx.lineTo(370, 176); ctx.quadraticCurveTo(384, 178, 390, 160); ctx.quadraticCurveTo(360, 216, 300, 216); ctx.lineTo(120, 216); ctx.quadraticCurveTo(80, 212, 60, 176); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = OCH; ctx.fillRect(66, 184, 300, 5);
        ctx.fillStyle = JADE; ctx.beginPath(); ctx.moveTo(384, 168); ctx.quadraticCurveTo(400, 130, 420, 138); ctx.quadraticCurveTo(436, 142, 428, 154); ctx.lineTo(414, 152); ctx.quadraticCurveTo(404, 150, 396, 176); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(416, 144, 2.6, 0, Math.PI * 2); ctx.fill();
        line(ctx, 404, 132, 396, 118, 3, INK); line(ctx, 414, 132, 414, 116, 3, INK);
        [110, 154, 198, 242].forEach(function (x, i) {
          var a = 0.9 * Math.sin(ph);
          var sx = x, sy = 150;
          man(ctx, x, 178, 0.62, i % 2 ? BLUE : OCH, 0.1, { x: sx + 22 + 10 * Math.cos(a), y: sy + 6 }, 0);
          var px = sx + 22 + 10 * Math.cos(a), py = sy + 6;
          line(ctx, px - 8, py - 22, px + 30 * Math.sin(a) + 14, py + 46 + 8 * Math.cos(a), 4, WOOD);
        });
        man(ctx, 320, 178, 0.62, RED, 0, { x: 342 + 6 * Math.sin(ph * 2), y: 150 }, 0);
        ctx.fillStyle = '#a2452f'; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.ellipse(348, 160, 11, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(60, 214, 330, 4);
      }
    });
  };

  /* ---------- 蹴鞠 ---------- */
  D['蹴鞠'] = function (body) {
    var T = 1.1;
    return player(body, {
      label: '蹴鞠动画', dur: 12,
      note: '蹴鞠是古代的足球游戏，“蹴”是踢，“鞠”是球。除了两队对抗，还有不对抗的“白打”：一个人或几个人用脚、膝盖、肩等部位把球颠起来，不让它落地，还可以变出各种花样。这里演示的是颠球。',
      caps: [[0, '用脚把球踢起来。'], [3, '球落下来，再接着踢，不让它落地。'], [8, '一下接一下，配合得好，球能一直在空中。']],
      draw: function (ctx, t) {
        ctx.fillStyle = '#b9c79a'; ctx.fillRect(0, 250, 480, 50);
        var u = (t % T) / T, n = Math.floor(t / T) + 1;
        var h = 118 * 4 * u * (1 - u);
        var bx = 240 + 9 * Math.sin(t * 2), by = 232 - h;
        var kick = Math.max(0, 1 - u * 5) + Math.max(0, (u - 0.86) * 7);
        ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(bx, 254, 16 - h * 0.06, 4, 0, 0, Math.PI * 2); ctx.fill();
        var fx = 218 + 24 * kick, fy = 244 - 34 * kick;
        line(ctx, 190, 222, 196, 250, 8, INK);
        line(ctx, 190, 222, fx, fy, 8, INK);
        line(ctx, 190, 222, 196, 250, 4, '#c9503a'); line(ctx, 190, 222, fx, fy, 4, '#c9503a');
        ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(190, 224); ctx.lineTo(186, 176); ctx.stroke();
        ctx.strokeStyle = RED; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(190, 224); ctx.lineTo(186, 176); ctx.stroke();
        line(ctx, 186, 180, 160, 196 - kick * 6, 5, INK); line(ctx, 186, 180, 214, 190 + kick * 6, 5, INK);
        ctx.fillStyle = SKIN; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(184, 160, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(184, 157, 12, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#f7f0de'; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(bx, by, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx - 14, by); ctx.quadraticCurveTo(bx, by - 8 + Math.sin(t * 4) * 3, bx + 14, by); ctx.moveTo(bx, by - 14); ctx.lineTo(bx, by + 14); ctx.stroke();
        ctx.fillStyle = '#7a3512'; ctx.font = '16px sans-serif'; ctx.fillText('第 ' + n + ' 下', 380, 60);
      }
    });
  };

  /* ---------- 马球 ---------- */
  D['马球'] = function (body) {
    function horse(ctx, x, y, ph, col) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      var legs = [[-28, 1], [-20, -1], [22, -1], [30, 1]];
      legs.forEach(function (l) {
        var a = Math.sin(ph + (l[1] > 0 ? 0 : Math.PI)) * 0.9;
        line(ctx, x + l[0], y + 8, x + l[0] + Math.sin(a) * 26, y + 8 + Math.cos(a) * 30, 8, INK);
        line(ctx, x + l[0], y + 8, x + l[0] + Math.sin(a) * 26, y + 8 + Math.cos(a) * 30, 4, col);
      });
      ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(x, y, 44, 19, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 30, y - 10); ctx.lineTo(x + 52, y - 40); ctx.lineTo(x + 68, y - 34); ctx.lineTo(x + 66, y - 20); ctx.lineTo(x + 46, y - 2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x + 62, y - 30, 2.2, 0, Math.PI * 2); ctx.fill();
      line(ctx, x + 44, y - 32, x + 34, y - 8, 6, INK);
      ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 42, y - 6); ctx.quadraticCurveTo(x - 62, y + 4 + Math.sin(ph) * 5, x - 60, y + 26); ctx.stroke();
    }
    return player(body, {
      label: '马球动画', dur: 12,
      note: '马球（古时叫“击鞠”）是唐代很流行的马上运动：骑手骑着马，用球杖把球击向对方的球门。这里只演示“策马、挥杖、击球入门”的一小段。',
      caps: [[0, '骑手策马向前，追着球跑。'], [5.2, '追上球，挥杖击打！'], [7, '球飞向球门……'], [9.2, '球从两根门柱中间穿过去了。']],
      draw: function (ctx, t) {
        ctx.fillStyle = '#b9c79a'; ctx.fillRect(0, 236, 480, 64);
        for (var k = 0; k < 8; k++) { var gx = (((k * 70 - t * 90) % 560) + 560) % 560 - 40; line(ctx, gx, 262, gx + 8, 254, 3, '#7a8f3a'); line(ctx, gx + 8, 262, gx + 12, 256, 3, '#7a8f3a'); }
        var hx = 60 + 130 * ease(t / 6.4) * (t < 6.4 ? 1 : 1) + (t > 6.4 ? Math.min(30, (t - 6.4) * 12) : 0);
        var ph = t * 11 * (t < 8.5 ? 1 : Math.max(0.2, 1 - (t - 8.5) / 3));
        horse(ctx, hx, 200 + Math.abs(Math.sin(ph)) * -4, ph, '#8a5a2a');
        var sw = t < 5.2 ? -0.7 : (t < 6.3 ? -0.7 + (t - 5.2) / 1.1 * 2.6 : 1.9);
        var rx = hx + 8, ry = 160;
        ctx.strokeStyle = INK; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(rx, ry + 12); ctx.lineTo(rx + 4, ry - 22); ctx.stroke();
        ctx.strokeStyle = BLUE; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(rx, ry + 12); ctx.lineTo(rx + 4, ry - 22); ctx.stroke();
        ctx.fillStyle = SKIN; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(rx + 6, ry - 34, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(rx + 6, ry - 37, 9, Math.PI, 0); ctx.fill();
        var hxp = rx + 12, hyp = ry - 12;
        line(ctx, rx + 4, ry - 18, hxp, hyp, 5, INK);
        var sxp = hxp + Math.sin(sw) * 70, syp = hyp + Math.cos(sw) * 70;
        line(ctx, hxp, hyp, sxp, syp, 5, WOOD);
        ctx.strokeStyle = WOOD; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(sxp, syp, 7, 0, Math.PI * 2); ctx.stroke();
        var bx, by;
        if (t < 6.3) { bx = 262; by = 252; }
        else { var u = clamp01((t - 6.3) / 2.8); bx = 262 + (436 - 262) * u + (u >= 1 ? Math.min(30, (t - 9.1) * 14) : 0); by = 252 - Math.sin(u * Math.PI) * 60 - (u * 30) * (1 - u) * 0; if (t > 9.1) by = 214 + Math.min(30, (t - 9.1) * 30); }
        var gxp = 436;
        line(ctx, gxp - 20, 250, gxp - 20, 150, 8, INK); line(ctx, gxp - 20, 250, gxp - 20, 150, 4, '#c9302c');
        line(ctx, gxp + 20, 250, gxp + 20, 150, 8, INK); line(ctx, gxp + 20, 250, gxp + 20, 150, 4, '#c9302c');
        line(ctx, gxp - 20, 152, gxp + 20, 152, 6, INK);
        ctx.fillStyle = '#f7f0de'; ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(bx, by, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (t > 9.2) { ctx.fillStyle = '#c9302c'; ctx.font = '18px "Ma Shan Zheng", "Noto Serif SC", serif'; ctx.fillText('入门', gxp - 18, 138); }
      }
    });
  };

  /* ---------- 角抵 ---------- */
  D['角抵'] = function (body) {
    return player(body, {
      label: '角抵动画', dur: 11,
      note: '角抵是古代的摔跤类游戏，也叫“角力”“相扑”。两个人面对面，靠力气和技巧较量，把对方摔倒或推出场地。汉代宫廷里有“角抵戏”，民间也很流行。这里是简化的示意。',
      caps: [[0, '两人面对面站定，抓住对方。'], [2, '你推我挡，谁也不肯让步。'], [7.2, '一方抓住时机，把对方摔倒。'], [9.8, '一轮较量结束。']],
      draw: function (ctx, t) {
        ctx.fillStyle = '#c9b98f'; ctx.fillRect(0, 240, 480, 60);
        ctx.strokeStyle = '#8a7b62'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(240, 262, 190, 20, 0, 0, Math.PI * 2); ctx.stroke();
        var sh = t < 7 ? 14 * Math.sin(t * 2.4) : 14 * Math.sin(7 * 2.4);
        var f = clamp01((t - 7) / 1.6);
        var lx = 206 + sh - 30 * f, rx = 274 + sh + 6 * f;
        var lleanL = 0.38 - 1.75 * ease(f), lleanR = -0.38 + 0.12 * ease(f);
        var fall = ease(f);
        var shoulderL = { x: lx + Math.sin(lleanL) * 54, y: 240 - Math.cos(lleanL) * 54 };
        var shoulderR = { x: rx + Math.sin(lleanR) * 54, y: 240 - Math.cos(lleanR) * 54 };
        man(ctx, lx, 240 + fall * 16, 1.05, RED, lleanL, f < 0.05 ? shoulderR : null, 6);
        man(ctx, rx, 240, 1.05, BLUE, lleanR, f < 0.05 ? shoulderL : { x: rx - 26, y: 196 }, 6);
        if (t > 8.4) { ctx.fillStyle = 'rgba(255,255,255,.7)'; for (var k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(lx + 20 + k * 14, 254 + (k % 2) * 4, 3 + k % 2, 0, Math.PI * 2); ctx.fill(); } }
      }
    });
  };

  Y.decorate();
})();
