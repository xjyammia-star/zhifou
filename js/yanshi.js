/* 知否知否 · 艺 · 古代游戏“演示”
   作用：给游艺页里的“投壶”“升官图”两张卡片加一个“演示”标签，点开后弹出一个小窗口，
   让读者用最简单的方式体会一下这个游戏是怎么回事。
   只演示概念：没有对手、没有计分排名、不讲详细规则。画面全部是本站原创简笔图。
   用法：页面 html 在 youyi.js 之后引入本文件即可（js/yanshi.js）。 */
(function () {
  'use strict';
  var root = document.getElementById('app');
  if (!root) return;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  /* ---------- 弹窗外壳 ---------- */
  var current = null;
  function openModal(title, build) {
    closeModal();
    var prevFocus = document.activeElement;
    var stop = null;
    var body = el('div', { 'class': 'ys-body' });
    var closeBtn = el('button', { 'class': 'ys-close', type: 'button', 'aria-label': '关闭', text: '×' });
    var box = el('div', { 'class': 'ys-box', role: 'dialog', 'aria-modal': 'true', 'aria-label': title + ' · 演示' }, [
      el('div', { 'class': 'ys-head' }, [el('span', { 'class': 'ys-title', text: title + ' · 演示' }), closeBtn]),
      body,
      el('p', { 'class': 'ys-foot', text: '只是帮你体会一下这个游戏的样子：没有输赢，也不是完整的规则。画面为本站原创示意。' })
    ]);
    var overlay = el('div', { 'class': 'ys-overlay' }, [box]);
    function close() {
      if (stop) stop();
      document.removeEventListener('keydown', onKey);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.body.classList.remove('ys-lock');
      current = null;
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);
    document.body.classList.add('ys-lock');
    stop = build(body) || null;
    closeBtn.focus();
    current = close;
  }
  function closeModal() { if (current) current(); }

  /* ---------- 投壶 ---------- */
  function touhu(body) {
    var W = 480, H = 300, GY = 262, SX = 84, SY = 206, VX = 372, MOUTH_Y = 178, G = 520, K = 4.6, MAXP = 110;
    var EARS = [VX - 17, VX + 17];
    var canvas = el('canvas', { 'class': 'ys-canvas', width: W, height: H, 'aria-label': '投壶演示画面' });
    var msg = el('p', { 'class': 'ys-msg', text: '按住左边的箭，向左下方拉开，松手投出。' });
    var left = el('span', { 'class': 'ys-count' });
    var again = el('button', { 'class': 'ys-btn', type: 'button', text: '再来一轮' });
    again.style.display = 'none';
    body.appendChild(canvas);
    body.appendChild(msg);
    body.appendChild(el('div', { 'class': 'ys-row' }, [left, again]));
    body.appendChild(el('p', { 'class': 'ys-note', text: '投壶原是宴会上的礼仪游戏：宾主轮流把箭投向壶口，也可以投进壶耳。投得准、投得远，都靠平时练。' }));

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    var arrowsLeft = 4, drag = null, flying = null, landed = [], raf = 0, last = 0, dead = false;

    function updateCount() { left.textContent = '还剩 ' + arrowsLeft + ' 支箭'; }
    updateCount();

    function pos(e) {
      var r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
    }
    function pullVec(p) {
      var dx = SX - p.x, dy = SY - p.y, len = Math.sqrt(dx * dx + dy * dy);
      if (len > MAXP) { dx = dx * MAXP / len; dy = dy * MAXP / len; len = MAXP; }
      return { vx: dx * K, vy: dy * K, len: len };
    }
    canvas.addEventListener('pointerdown', function (e) {
      if (flying || arrowsLeft <= 0) return;
      var p = pos(e);
      if (Math.abs(p.x - SX) > 70 || Math.abs(p.y - SY) > 70) return;
      drag = pullVec(p); drag.p = p;
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var p = pos(e); drag = pullVec(p); drag.p = p;
    });
    function release() {
      if (!drag) return;
      var d = drag; drag = null;
      if (d.len < 12) return;
      arrowsLeft--; updateCount();
      flying = { x: SX, y: SY, vx: d.vx, vy: d.vy, done: false, hit: null, touched: false };
      msg.textContent = '';
    }
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', function () { drag = null; });

    function finish(kind, x) {
      var text = '';
      if (kind === 'mouth') text = '入壶口。';
      else if (kind === 'ear') text = '穿过壶耳！比入壶口更难。';
      else if (kind === 'bump') text = '碰到壶身，弹开了。';
      else text = '没投中，落在地上。';
      landed.push({ kind: kind, x: x, n: landed.length });
      flying = null;
      msg.textContent = text + (arrowsLeft > 0 ? ' 再拉一次试试。' : ' 这一轮的箭投完了。');
      if (arrowsLeft <= 0) again.style.display = '';
    }
    again.addEventListener('click', function () {
      arrowsLeft = 4; landed = []; updateCount(); again.style.display = 'none';
      msg.textContent = '按住左边的箭，向左下方拉开，松手投出。';
    });

    function step(dt) {
      var f = flying; if (!f) return;
      var px = f.x, py = f.y;
      f.vy += G * dt; f.x += f.vx * dt; f.y += f.vy * dt;
      if (f.done) return;
      if (py < MOUTH_Y && f.y >= MOUTH_Y && f.vy > 0) {
        var t = (MOUTH_Y - py) / (f.y - py), x = px + (f.x - px) * t;
        if (Math.abs(x - VX) < 10) { f.done = true; return finish('mouth', x - VX); }
        for (var i = 0; i < EARS.length; i++) {
          if (Math.abs(x - EARS[i]) < 4.5) { f.done = true; return finish('ear', EARS[i]); }
        }
        if (Math.abs(x - VX) < 30) { f.touched = true; f.vx = -Math.abs(f.vx) * 0.25; f.vy *= 0.2; }
      }
      if (f.y >= GY) { f.done = true; finish(f.touched ? 'bump' : 'miss', Math.max(20, Math.min(W - 20, f.x))); }
      if (f.x > W + 40 || f.x < -40) { f.done = true; finish('miss', Math.max(20, Math.min(W - 20, f.x))); }
    }

    function arrow(x, y, ang, col) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      ctx.strokeStyle = col || '#3b2a1a'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(8, 0); ctx.stroke();
      ctx.fillStyle = col || '#3b2a1a';
      ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(6, -3.5); ctx.lineTo(6, 3.5); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#c9302c'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-24, -4); ctx.moveTo(-30, 0); ctx.lineTo(-24, 4); ctx.stroke();
      ctx.restore();
    }
    function vase() {
      ctx.fillStyle = '#b0693a'; ctx.strokeStyle = '#4a2a14'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(VX - 11, MOUTH_Y - 2); ctx.lineTo(VX - 11, 202);
      ctx.bezierCurveTo(VX - 34, 214, VX - 30, 244, VX - 20, GY);
      ctx.lineTo(VX + 20, GY);
      ctx.bezierCurveTo(VX + 30, 244, VX + 34, 214, VX + 11, 202);
      ctx.lineTo(VX + 11, MOUTH_Y - 2); ctx.closePath(); ctx.fill(); ctx.stroke();
      EARS.forEach(function (ex) {
        ctx.fillStyle = '#b0693a';
        ctx.fillRect(ex - 6, MOUTH_Y + 2, 12, 16); ctx.strokeRect(ex - 6, MOUTH_Y + 2, 12, 16);
        ctx.fillStyle = '#2b190c'; ctx.fillRect(ex - 3.5, MOUTH_Y + 2, 7, 4);
      });
      ctx.fillStyle = '#2b190c'; ctx.beginPath(); ctx.ellipse(VX, MOUTH_Y - 2, 11, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#e7c98a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(VX - 24, 226); ctx.quadraticCurveTo(VX, 234, VX + 24, 226); ctx.stroke();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#efe6d3'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#c9b98f'; ctx.fillRect(0, GY, W, H - GY);
      ctx.strokeStyle = '#8a7b62'; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(SX + 26, GY - 4); ctx.lineTo(SX + 26, GY + 20); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#8a7b62'; ctx.font = '12px sans-serif'; ctx.fillText('投线', SX + 14, GY + 34);
      vase();
      landed.forEach(function (a) {
        if (a.kind === 'mouth') arrow(VX + a.x * 0.4 + (a.n % 2 ? 4 : -4), MOUTH_Y - 18, -Math.PI / 2 + (a.n % 2 ? 0.08 : -0.08), '#3b2a1a');
        else if (a.kind === 'ear') arrow(a.x, MOUTH_Y - 16, -Math.PI / 2, '#3b2a1a');
        else arrow(a.x, GY - 3, -0.05 + (a.n % 2) * 0.1, '#6b5a44');
      });
      if (drag && !flying) {
        var sx = SX, sy = SY, vx = drag.vx, vy = drag.vy;
        ctx.fillStyle = 'rgba(122,53,18,.55)';
        for (var i = 1; i < 26; i++) {
          var t = i * 0.045;
          ctx.beginPath(); ctx.arc(sx + vx * t, sy + vy * t + 0.5 * G * t * t, 2.2, 0, Math.PI * 2); ctx.fill();
        }
        arrow(drag.p.x < SX ? SX - (SX - Math.max(drag.p.x, SX - MAXP)) * 0.5 : SX, SY, Math.atan2(vy, vx), '#3b2a1a');
        ctx.fillStyle = '#7a3512'; ctx.fillRect(10, 12, 100, 8);
        ctx.fillStyle = '#e9b98a'; ctx.fillRect(11, 13, 98 * (1 - drag.len / MAXP * 0), 6);
        ctx.fillStyle = '#7a3512'; ctx.fillRect(11, 13, 98 * drag.len / MAXP, 6);
        ctx.fillStyle = '#6a5f54'; ctx.font = '12px sans-serif'; ctx.fillText('力度', 116, 20);
      } else if (flying) {
        arrow(flying.x, flying.y, Math.atan2(flying.vy, flying.vx));
      } else if (arrowsLeft > 0) {
        arrow(SX, SY, -0.55);
        ctx.fillStyle = 'rgba(122,53,18,.75)'; ctx.font = '12px sans-serif'; ctx.fillText('拉这里', SX - 26, SY + 26);
      }
    }
    function loop(ts) {
      if (dead) return;
      var dt = last ? Math.min((ts - last) / 1000, 0.05) : 0.016; last = ts;
      if (flying) step(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return function () { dead = true; cancelAnimationFrame(raf); };
  }

  /* ---------- 升官图 ---------- */
  /* 这是按升官图的思路做的简化示意：官职名称参考明清常见官阶，各种传世版本的格子和规则并不相同。 */
  var CELLS = [
    { n: '白丁', d: '起点：还没有功名的读书人。' },
    { n: '童生', d: '通过县试，有了参加考试的资格。' },
    { n: '秀才', d: '进入府学、县学，算是有了功名。' },
    { n: '荒废学业', d: '贪玩误了功课，退两格。', mv: -2 },
    { n: '举人', d: '乡试中式，可以参加会试，也有资格做小官。' },
    { n: '进士', d: '会试、殿试及第，仕途真正开始。' },
    { n: '翰林院庶吉士', d: '进入翰林院，被看作前途好的起点，前进一格。', mv: 1 },
    { n: '知县', d: '一县之长，管钱粮、刑名和教化。' },
    { n: '被人弹劾', d: '因过失被弹劾，降职，退三格。', mv: -3 },
    { n: '知府', d: '一府之长，管辖几个县。' },
    { n: '布政使', d: '一省管钱粮民政的长官。' },
    { n: '巡抚', d: '政绩突出，破格提拔，前进一格。', mv: 1 },
    { n: '总督', d: '统管一省或数省的军政大员。' },
    { n: '尚书', d: '中央六部之一的长官。' },
    { n: '大学士', d: '入阁参与机要，常被看作宰相一级的位置。终点。' }
  ];
  var COLS = 5;
  function shengguan(body) {
    var pos = 0, busy = false, timers = [];
    var dice = el('button', { 'class': 'ys-dice', type: 'button', 'aria-label': '掷骰子', text: '⚀' });
    var roll = el('button', { 'class': 'ys-btn', type: 'button', text: '掷骰' });
    var reset = el('button', { 'class': 'ys-btn is-ghost', type: 'button', text: '重新开始' });
    var msg = el('p', { 'class': 'ys-msg', text: '点“掷骰”，看看这一步走到哪个官职。' });
    var board = el('div', { 'class': 'ys-board', style: 'grid-template-columns:repeat(' + COLS + ',1fr)' });
    var cells = CELLS.map(function (c, i) {
      var row = Math.floor(i / COLS), col = i % COLS;
      if (row % 2 === 1) col = COLS - 1 - col;
      var cls = 'ys-cell' + (c.mv ? (c.mv > 0 ? ' is-up' : ' is-down') : '') + (i === 0 ? ' is-start' : '') + (i === CELLS.length - 1 ? ' is-end' : '');
      var node = el('div', { 'class': cls, style: 'grid-row:' + (row + 1) + ';grid-column:' + (col + 1) }, [
        el('span', { 'class': 'ys-idx', text: String(i + 1) }),
        el('span', { 'class': 'ys-name', text: c.n })
      ]);
      board.appendChild(node);
      return node;
    });
    var token = el('span', { 'class': 'ys-token', 'aria-hidden': 'true' });
    body.appendChild(board);
    body.appendChild(el('div', { 'class': 'ys-row' }, [dice, roll, reset]));
    body.appendChild(msg);
    body.appendChild(el('p', { 'class': 'ys-note', text: '升官图是明清流行的掷骰游戏：从平民一路“考”上去，格子里写着各级官职，运气好升得快，运气差也会被贬。这里是简化的示意，各种版本的格子和规则并不相同。' }));

    function place() {
      cells.forEach(function (c) { c.classList.remove('is-here'); });
      cells[pos].classList.add('is-here');
      cells[pos].appendChild(token);
    }
    place();
    function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); }
    function walk(to, then) {
      var dir = to > pos ? 1 : -1;
      (function go() {
        if (pos === to) return then();
        pos += dir; place();
        later(go, 320);
      })();
    }
    function settle(n) {
      var c = CELLS[pos];
      if (pos === CELLS.length - 1) {
        msg.textContent = '掷出 ' + n + ' 点，到「' + c.n + '」。' + c.d + ' 走到终点了，点“重新开始”再玩一局。';
        busy = false; roll.disabled = true; return;
      }
      msg.textContent = '掷出 ' + n + ' 点，到「' + c.n + '」。' + c.d;
      if (c.mv) {
        later(function () {
          var to = Math.max(0, Math.min(CELLS.length - 1, pos + c.mv));
          walk(to, function () {
            msg.textContent += ' → 现在在「' + CELLS[pos].n + '」。';
            busy = false;
          });
        }, 700);
      } else busy = false;
    }
    var faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    function doRoll() {
      if (busy) return; busy = true;
      var k = 0, final = 1 + Math.floor(Math.random() * 6);
      msg.textContent = '掷骰中……';
      (function spin() {
        dice.textContent = faces[Math.floor(Math.random() * 6)];
        if (++k < 8) return later(spin, 70);
        dice.textContent = faces[final - 1];
        var to = Math.min(CELLS.length - 1, pos + final);
        walk(to, function () { settle(final); });
      })();
    }
    roll.addEventListener('click', doRoll);
    dice.addEventListener('click', doRoll);
    reset.addEventListener('click', function () {
      timers.forEach(clearTimeout); timers = [];
      pos = 0; busy = false; roll.disabled = false; dice.textContent = '⚀'; place();
      msg.textContent = '点“掷骰”，看看这一步走到哪个官职。';
    });
    return function () { timers.forEach(clearTimeout); };
  }

  /* ---------- 华容道 ---------- */
  /* 4 列 × 5 行的滑块盘；最常见的“横刀立马”开局。目标：让“曹操”滑到底部中间的出口。 */
  function huarong(body) {
    var CW = 4, CH = 5;
    var START = [
      { n: '曹操', x: 1, y: 0, w: 2, h: 2, c: 'cao' },
      { n: '张飞', x: 0, y: 0, w: 1, h: 2, c: 'jiang' },
      { n: '赵云', x: 3, y: 0, w: 1, h: 2, c: 'jiang' },
      { n: '马超', x: 0, y: 2, w: 1, h: 2, c: 'jiang' },
      { n: '黄忠', x: 3, y: 2, w: 1, h: 2, c: 'jiang' },
      { n: '关羽', x: 1, y: 2, w: 2, h: 1, c: 'guan' },
      { n: '兵', x: 1, y: 3, w: 1, h: 1, c: 'bing' },
      { n: '兵', x: 2, y: 3, w: 1, h: 1, c: 'bing' },
      { n: '兵', x: 0, y: 4, w: 1, h: 1, c: 'bing' },
      { n: '兵', x: 3, y: 4, w: 1, h: 1, c: 'bing' }
    ];
    var ps = [];
    var wrap = el('div', { 'class': 'ys-hr-wrap' });
    var board = el('div', { 'class': 'ys-hr', role: 'group', 'aria-label': '华容道棋盘' });
    var exit = el('div', { 'class': 'ys-hr-exit', text: '出口' });
    wrap.appendChild(board); wrap.appendChild(exit);
    var msg = el('p', { 'class': 'ys-msg', text: '把方块推到空位里：按住方块向空位的方向拖一下，或者直接点它。目标是让“曹操”走到下面的出口。' });
    var reset = el('button', { 'class': 'ys-btn is-ghost', type: 'button', text: '重新开始' });
    body.appendChild(wrap);
    body.appendChild(msg);
    body.appendChild(el('div', { 'class': 'ys-row' }, [reset]));
    body.appendChild(el('p', { 'class': 'ys-note', text: '华容道是一种滑块拼图，名字来自三国里曹操败走华容道的故事：大方块是曹操，其他人物挡在前后，要一步步挪开让路。这里只演示“推方块”的感觉。' }));

    function fits(p, nx, ny) {
      if (nx < 0 || ny < 0 || nx + p.w > CW || ny + p.h > CH) return false;
      for (var i = 0; i < ps.length; i++) {
        var q = ps[i]; if (q === p) continue;
        if (nx < q.x + q.w && nx + p.w > q.x && ny < q.y + q.h && ny + p.h > q.y) return false;
      }
      return true;
    }
    function layout() {
      ps.forEach(function (p) {
        p.node.style.left = (p.x * 25) + '%'; p.node.style.top = (p.y * 20) + '%';
        p.node.style.width = (p.w * 25) + '%'; p.node.style.height = (p.h * 20) + '%';
      });
      if (ps[0].x === 1 && ps[0].y === 3) msg.textContent = '曹操走到出口了——这就是华容道要做的事。可以点“重新开始”再试一遍。';
    }
    var DIRS = { l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1] };
    function tryMove(p, d) {
      var v = DIRS[d]; if (!fits(p, p.x + v[0], p.y + v[1])) return false;
      p.x += v[0]; p.y += v[1]; layout(); return true;
    }
    function init() {
      board.innerHTML = ''; ps = [];
      START.forEach(function (s) {
        var p = { n: s.n, x: s.x, y: s.y, w: s.w, h: s.h };
        p.node = el('div', { 'class': 'ys-hr-p is-' + s.c, role: 'button', tabindex: '0', 'aria-label': s.n }, [el('span', { text: s.n })]);
        var sx = 0, sy = 0, down = false, moved = false;
        p.node.addEventListener('pointerdown', function (e) { down = true; moved = false; sx = e.clientX; sy = e.clientY; p.node.setPointerCapture && p.node.setPointerCapture(e.pointerId); e.preventDefault(); });
        p.node.addEventListener('pointermove', function (e) {
          if (!down) return;
          var dx = e.clientX - sx, dy = e.clientY - sy;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 16) return;
          var d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u');
          moved = true; tryMove(p, d); sx = e.clientX; sy = e.clientY;
        });
        p.node.addEventListener('pointerup', function () {
          if (down && !moved) {
            var ok = ['l', 'r', 'u', 'd'].filter(function (d) { var v = DIRS[d]; return fits(p, p.x + v[0], p.y + v[1]); });
            if (ok.length === 1) tryMove(p, ok[0]);
            else if (ok.length > 1) msg.textContent = '这块有几个方向可以走，请按住它往想去的方向拖一下。';
            else msg.textContent = '这块四周都被挡住了，先挪开别的方块。';
          }
          down = false;
        });
        p.node.addEventListener('pointercancel', function () { down = false; });
        board.appendChild(p.node); ps.push(p);
      });
      layout();
    }
    init();
    reset.addEventListener('click', function () {
      init(); msg.textContent = '把方块推到空位里：按住方块向空位的方向拖一下，或者直接点它。目标是让“曹操”走到下面的出口。';
    });
  }

  /* ---------- 七巧板 ---------- */
  /* 边长 4 的正方形切成七块：两块大三角、一块中三角、两块小三角、一块正方形、一块平行四边形。 */
  function qiqiao(body) {
    var NS = 'http://www.w3.org/2000/svg';
    var SHAPES = [
      { n: '大三角一', p: [[0, 0], [4, 0], [2, 2]], c: '#c9563a' },
      { n: '大三角二', p: [[0, 0], [2, 2], [0, 4]], c: '#d98a3a' },
      { n: '中三角', p: [[4, 2], [4, 4], [2, 4]], c: '#3f7f6a' },
      { n: '小三角一', p: [[4, 0], [4, 2], [3, 1]], c: '#4c6fa5' },
      { n: '小三角二', p: [[2, 2], [3, 3], [1, 3]], c: '#8a5a9c' },
      { n: '正方形', p: [[2, 2], [3, 1], [4, 2], [3, 3]], c: '#c9a63a' },
      { n: '平行四边形', p: [[1, 3], [3, 3], [2, 4], [0, 4]], c: '#7a8f3a' }
    ];
    var VW = 12, VH = 9, S = 40;
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + VH);
    svg.setAttribute('class', 'ys-canvas ys-qq');
    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', '七巧板演示画面');
    var msg = el('p', { 'class': 'ys-msg', text: '按住一块拖动；点一下选中，再用下面的按钮旋转或翻转。' });
    var bRot = el('button', { 'class': 'ys-btn', type: 'button', text: '旋转选中的块' });
    var bFlip = el('button', { 'class': 'ys-btn is-ghost', type: 'button', text: '翻转' });
    var bSq = el('button', { 'class': 'ys-btn is-ghost', type: 'button', text: '拼回正方形' });
    var bShuf = el('button', { 'class': 'ys-btn is-ghost', type: 'button', text: '打散' });
    body.appendChild(svg);
    body.appendChild(msg);
    body.appendChild(el('div', { 'class': 'ys-row' }, [bRot, bFlip, bSq, bShuf]));
    body.appendChild(el('p', { 'class': 'ys-note', text: '七巧板由这七块板组成，用它们可以拼出人物、动物、房屋等许多图案。这里没有题目，只让你亲手拖一拖、转一转。' }));

    var items = [], sel = null;
    SHAPES.forEach(function (s) {
      var cx = 0, cy = 0; s.p.forEach(function (q) { cx += q[0]; cy += q[1]; }); cx /= s.p.length; cy /= s.p.length;
      var g = document.createElementNS(NS, 'g'); g.setAttribute('style', 'cursor:grab;touch-action:none');
      var poly = document.createElementNS(NS, 'polygon');
      poly.setAttribute('points', s.p.map(function (q) { return (q[0] - cx) + ',' + (q[1] - cy); }).join(' '));
      poly.setAttribute('fill', s.c); poly.setAttribute('stroke', '#fff6e6'); poly.setAttribute('stroke-width', '0.06'); poly.setAttribute('stroke-linejoin', 'round');
      g.appendChild(poly); svg.appendChild(g);
      var it = { g: g, poly: poly, home: [cx + 4, cy + 2.5], x: cx + 4, y: cy + 2.5, rot: 0, flip: 1 };
      items.push(it);
      var drag = null;
      g.addEventListener('pointerdown', function (e) {
        var pt = toSvg(e); drag = { dx: it.x - pt.x, dy: it.y - pt.y, moved: false };
        select(it); svg.appendChild(g); g.setPointerCapture && g.setPointerCapture(e.pointerId); e.preventDefault();
      });
      g.addEventListener('pointermove', function (e) {
        if (!drag) return; var pt = toSvg(e);
        it.x = Math.max(0.5, Math.min(VW - 0.5, pt.x + drag.dx)); it.y = Math.max(0.5, Math.min(VH - 0.5, pt.y + drag.dy)); drag.moved = true; draw(it);
      });
      g.addEventListener('pointerup', function () { drag = null; });
      g.addEventListener('pointercancel', function () { drag = null; });
    });
    function toSvg(e) {
      var r = svg.getBoundingClientRect();
      return { x: (e.clientX - r.left) * VW / r.width, y: (e.clientY - r.top) * VH / r.height };
    }
    function draw(it) { it.g.setAttribute('transform', 'translate(' + it.x + ' ' + it.y + ') rotate(' + it.rot + ') scale(' + it.flip + ' 1)'); }
    function select(it) {
      sel = it;
      items.forEach(function (o) { o.poly.setAttribute('stroke', o === it ? '#2b190c' : '#fff6e6'); o.poly.setAttribute('stroke-width', o === it ? '0.12' : '0.06'); });
    }
    function need() { if (!sel) { msg.textContent = '先点一下要转的那一块。'; return false; } return true; }
    bRot.addEventListener('click', function () { if (need()) { sel.rot = (sel.rot + 45) % 360; draw(sel); } });
    bFlip.addEventListener('click', function () { if (need()) { sel.flip *= -1; draw(sel); } });
    bSq.addEventListener('click', function () { items.forEach(function (it) { it.x = it.home[0]; it.y = it.home[1]; it.rot = 0; it.flip = 1; draw(it); }); msg.textContent = '七块板拼成了一个正方形。'; });
    bShuf.addEventListener('click', function () {
      items.forEach(function (it, i) {
        it.x = 1.6 + (i % 4) * 2.6 + Math.random() * 0.6; it.y = 1.8 + Math.floor(i / 4) * 3.6 + Math.random() * 0.6;
        it.rot = [0, 45, 90, 135, 180, 225, 270, 315][Math.floor(Math.random() * 8)]; draw(it);
      });
      msg.textContent = '打散了。试着拖一拖、转一转，把它们拼回正方形，或者拼出别的样子。';
    });
    items.forEach(draw);
  }

  var DEMOS = { '投壶': touhu, '升官图': shengguan, '华容道': huarong, '七巧板': qiqiao };

  /* ---------- 给卡片加“演示”标签 ---------- */
  function decorate() {
    var cards = root.querySelectorAll('details.zy-card');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      if (c.getAttribute('data-ys')) continue;
      var nameEl = c.querySelector('.zy-card-name');
      if (!nameEl) continue;
      var name = nameEl.textContent.trim();
      if (!DEMOS.hasOwnProperty(name)) continue;
      c.setAttribute('data-ys', '1');
      var btn = el('button', { 'class': 'ys-tag', type: 'button', text: '▶ 演示', 'aria-label': name + ' 演示' });
      (function (nm, b) {
        b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); openModal(nm, DEMOS[nm]); });
        b.addEventListener('keydown', function (e) { e.stopPropagation(); });
      })(name, btn);
      nameEl.parentNode.insertBefore(btn, nameEl.nextSibling);
    }
  }
  decorate();
  if (window.MutationObserver) {
    var pending = false;
    new MutationObserver(function () {
      if (pending) return; pending = true;
      setTimeout(function () { pending = false; decorate(); }, 30);
    }).observe(root, { childList: true, subtree: true });
  }
})();
