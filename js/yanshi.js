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

  var DEMOS = { '投壶': touhu, '升官图': shengguan };

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
