/* 知否知否 · 艺 · 古代游戏“演示”（第四批：飞花令、行酒令、斗蟋蟀、踏青）
   作用：给 飞花令、行酒令、斗蟋蟀、踏青 这 4 张卡片加上“▶ 演示”。
   飞花令、行酒令 是可以点着玩的小演示；斗蟋蟀、踏青 是 12 秒左右的原创简笔动画。
   只演示概念：没有输赢排名、不讲详细规则。画面全部是本站原创。
   用法：页面 html 在 yanshi.js 之后引入本文件（js/yanshi4.js）。 */
(function () {
  'use strict';
  var Y = window.ZY_YS;
  if (!Y) return;
  var el = Y.el, D = Y.demos;

  var INK = '#3b2a1a', RED = '#b5432f', JADE = '#3f7f6a', OCH = '#d9a441', BLUE = '#4c6fa5', WOOD = '#a06a3a', SKIN = '#f1cfa1', PAPER = '#efe6d3';

  /* ---------- 样式 ---------- */
  (function () {
    if (document.getElementById('ys4-style')) return;
    var css = [
      '.ys4-cv{display:block;width:100%;max-width:480px;margin:0 auto;background:#efe6d3;border-radius:8px}',
      '.ys4-keys{display:flex;gap:8px;justify-content:center;margin:8px 0}',
      '.ys4-keys .ys-btn.is-sel{background:#b5432f;color:#fff;border-color:#b5432f}',
      '.ys4-who{display:flex;gap:8px;justify-content:center;margin:8px 0;flex-wrap:wrap}',
      '.ys4-p{padding:4px 12px;border:2px solid #3b2a1a;border-radius:16px;font-size:14px;color:#3b2a1a;background:#fbf8f0;opacity:.55}',
      '.ys4-p.is-now{opacity:1;background:#d9a441;font-weight:bold}',
      '.ys4-list{margin:8px 0;padding:0;list-style:none}',
      '.ys4-list li{background:#fbf8f0;border:2px solid #3b2a1a;border-radius:8px;padding:8px 12px;margin:6px 0;font-size:17px;line-height:1.6;color:#3b2a1a}',
      '.ys4-list li small{display:block;font-size:12px;color:#7a6650}',
      '.ys4-list li b{color:#b5432f;font-size:1.15em}',
      '.ys4-list li em{font-style:normal;color:#3f7f6a;font-size:12px;margin-right:6px}',
      '.ys4-tube{width:130px;height:150px;margin:6px auto;display:block}',
      '.ys4-tube.is-shake{animation:ys4-sh .2s ease-in-out 6}',
      '@keyframes ys4-sh{0%,100%{transform:rotate(0)}25%{transform:rotate(-7deg)}75%{transform:rotate(7deg)}}',
      '.ys4-slip{background:#fbf8f0;border:2px solid #b5432f;border-radius:6px;padding:12px 16px;margin:8px auto;max-width:280px;text-align:center;font-size:18px;line-height:1.7;color:#3b2a1a;min-height:3.4em}',
      '.ys4-slip small{display:block;font-size:12px;color:#7a6650}'
    ].join('');
    var s = document.createElement('style'); s.id = 'ys4-style'; s.textContent = css;
    document.head.appendChild(s);
  })();

  function note(body, text) { body.appendChild(el('p', { 'class': 'ys-note', text: text })); }

  /* ---------- 动画外壳：画布 + 字幕 + “再看一次” ---------- */
  function player(body, o) {
    var W = 480, H = 300;
    var cv = el('canvas', { 'class': 'ys-canvas ys4-cv', width: W, height: H, 'aria-label': o.label });
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

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp01(x); return x * x * (3 - 2 * x); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* 简笔小人：脚在 (x,y) */
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

  /* ================= 飞花令 ================= */
  var FH = {
    '花': [
      ['春城无处不飞花', '韩翃《寒食》'],
      ['夜来风雨声，花落知多少', '孟浩然《春晓》'],
      ['花间一壶酒，独酌无相亲', '李白《月下独酌》'],
      ['人面桃花相映红', '崔护《题都城南庄》'],
      ['接天莲叶无穷碧，映日荷花别样红', '杨万里《晓出净慈寺送林子方》'],
      ['花开堪折直须折', '《金缕衣》（相传杜秋娘作）']
    ],
    '月': [
      ['海上生明月，天涯共此时', '张九龄《望月怀远》'],
      ['举头望明月，低头思故乡', '李白《静夜思》'],
      ['月落乌啼霜满天', '张继《枫桥夜泊》'],
      ['露从今夜白，月是故乡明', '杜甫《月夜忆舍弟》'],
      ['明月几时有，把酒问青天', '苏轼《水调歌头》'],
      ['明月松间照，清泉石上流', '王维《山居秋暝》']
    ],
    '春': [
      ['春眠不觉晓，处处闻啼鸟', '孟浩然《春晓》'],
      ['春风又绿江南岸', '王安石《泊船瓜洲》'],
      ['春蚕到死丝方尽', '李商隐《无题》'],
      ['春色满园关不住', '叶绍翁《游园不值》'],
      ['竹外桃花三两枝，春江水暖鸭先知', '苏轼《惠崇春江晚景》'],
      ['春城无处不飞花', '韩翃《寒食》']
    ]
  };
  var WHO = ['甲', '乙', '丙', '丁'];

  D['飞花令'] = function (body) {
    var key = '花', order = [], n = 0;
    var keys = el('div', { 'class': 'ys4-keys' });
    var kb = {};
    ['花', '月', '春'].forEach(function (k) {
      var b = el('button', { 'class': 'ys-btn', type: 'button', text: '“' + k + '”字令' });
      b.addEventListener('click', function () { setKey(k); });
      kb[k] = b; keys.appendChild(b);
    });
    var whoBox = el('div', { 'class': 'ys4-who' });
    var pchips = WHO.map(function (w) { var c = el('span', { 'class': 'ys4-p', text: w + '先生' }); whoBox.appendChild(c); return c; });
    var list = el('ul', { 'class': 'ys4-list' });
    var msg = el('p', { 'class': 'ys-msg' });
    var bNext = el('button', { 'class': 'ys-btn', type: 'button', text: '轮到下一位接' });
    var bReset = el('button', { 'class': 'ys-btn is-ghost', type: 'button', text: '重新开始' });
    body.appendChild(keys); body.appendChild(whoBox); body.appendChild(list); body.appendChild(msg);
    body.appendChild(el('div', { 'class': 'ys-row' }, [bNext, bReset]));
    note(body, '飞花令是酒令的一种，相传得名于唐诗“春城无处不飞花”。做法是先定一个字，大家轮流说出带这个字的诗句，接不上的人算输（古时候会罚酒）。各地规则不同，有的还规定这个字要出现在第几个位置，这里只做最简单的一种：句子里带这个字就行。');

    function mark() {
      pchips.forEach(function (c, i) { c.className = 'ys4-p' + (i === n % WHO.length && n < order.length ? ' is-now' : ''); });
    }
    function setKey(k) {
      key = k; order = shuffle(FH[k]); n = 0; list.innerHTML = '';
      Object.keys(kb).forEach(function (x) { kb[x].className = 'ys-btn' + (x === k ? ' is-sel' : ''); });
      msg.textContent = '令官出令：说一句带“' + k + '”字的诗。请' + WHO[0] + '先生开头。';
      bNext.disabled = false; bNext.textContent = '让' + WHO[0] + '先生接一句'; mark();
    }
    bNext.addEventListener('click', function () {
      if (n >= order.length) return;
      var r = order[n], li = el('li', {});
      li.appendChild(el('em', { text: WHO[n % WHO.length] + '先生' }));
      r[0].split(key).forEach(function (part, i, arr) {
        li.appendChild(document.createTextNode(part));
        if (i < arr.length - 1) li.appendChild(el('b', { text: key }));
      });
      li.appendChild(el('small', { text: r[1] }));
      list.appendChild(li); n++;
      if (n >= order.length) {
        msg.textContent = '这一轮接完了！换一个字，再来一轮吧。'; bNext.disabled = true; bNext.textContent = '本轮结束';
      } else {
        msg.textContent = '轮到' + WHO[n % WHO.length] + '先生了，想想还有哪句带“' + key + '”？'; bNext.textContent = '让' + WHO[n % WHO.length] + '先生接一句';
      }
      mark();
    });
    bReset.addEventListener('click', function () { setKey(key); });
    setKey('花');
  };

  /* ================= 行酒令（抽筹） ================= */
  var SLIPS = [
    ['说一句带“月”字的诗', '大家都会的，先热热身'],
    ['说一个带数字的成语', '例如一言为定、三心二意'],
    ['说一种茶的名字', '绿茶、红茶、乌龙都可以'],
    ['说一个古代游戏的名字', '这个页面里就有不少'],
    ['说一句带“酒”字的诗', '李白、杜甫的诗里最多'],
    ['对一个下联：“春风”', '想想“秋月”“夏雨”'],
    ['给大家讲一个成语故事', '一分钟内讲完'],
    ['这一筹免答', '令官请你喝一杯茶']
  ];
  D['行酒令'] = function (body) {
    var busy = false, tm = [];
    var tube = el('div', { 'class': 'ys4-tube' });
    tube.innerHTML = '<svg viewBox="0 0 130 150" width="130" height="150" aria-hidden="true">'
      + '<g stroke="#3b2a1a" stroke-width="2" stroke-linecap="round">'
      + '<line x1="45" y1="60" x2="40" y2="12" stroke="#d9a441" stroke-width="7"/><line x1="58" y1="60" x2="58" y2="6" stroke="#d9a441" stroke-width="7"/>'
      + '<line x1="72" y1="60" x2="76" y2="10" stroke="#d9a441" stroke-width="7"/><line x1="85" y1="60" x2="94" y2="16" stroke="#d9a441" stroke-width="7"/>'
      + '<circle cx="40" cy="12" r="3" fill="#b5432f"/><circle cx="58" cy="6" r="3" fill="#b5432f"/><circle cx="76" cy="10" r="3" fill="#b5432f"/><circle cx="94" cy="16" r="3" fill="#b5432f"/></g>'
      + '<path d="M32 58 L98 58 L94 142 Q65 150 36 142 Z" fill="#a06a3a" stroke="#3b2a1a" stroke-width="3"/>'
      + '<ellipse cx="65" cy="58" rx="33" ry="6" fill="#7a4a25" stroke="#3b2a1a" stroke-width="3"/>'
      + '<rect x="50" y="80" width="30" height="42" rx="4" fill="#efe6d3" stroke="#3b2a1a" stroke-width="2"/>'
      + '<text x="65" y="108" text-anchor="middle" font-size="20" fill="#b5432f" font-family="serif" font-weight="bold">令</text></svg>';
    var slip = el('div', { 'class': 'ys4-slip', text: '令官坐在席上，先摇一摇筹筒。' });
    var msg = el('p', { 'class': 'ys-msg', text: '点“摇筒抽筹”，抽到什么，就照筹上说的做。' });
    var b = el('button', { 'class': 'ys-btn', type: 'button', text: '摇筒抽筹' });
    body.appendChild(tube); body.appendChild(slip); body.appendChild(msg);
    body.appendChild(el('div', { 'class': 'ys-row' }, [b]));
    note(body, '酒令是古人宴席上助兴的游戏：由“令官”定规矩，大家照着做，做不到的要罚酒。酒令花样很多，射覆、击鼓传花、飞花令、划拳都算。抽筹是其中一种：把令词写在竹筹、木筹上，装进筒里，轮流抽。这里的筹词是本站编的，只用来演示玩法。');
    b.addEventListener('click', function () {
      if (busy) return; busy = true; b.disabled = true;
      slip.textContent = '哗啦啦……'; msg.textContent = '';
      tube.className = 'ys4-tube is-shake';
      tm.push(setTimeout(function () {
        tube.className = 'ys4-tube';
        var r = SLIPS[Math.floor(Math.random() * SLIPS.length)];
        slip.textContent = '';
        slip.appendChild(document.createTextNode(r[0]));
        slip.appendChild(el('small', { text: r[1] }));
        msg.textContent = '抽到了！照着筹上说的做，做不到就“罚酒一杯”（这里我们以茶代酒）。';
        busy = false; b.disabled = false; b.textContent = '再抽一支';
      }, 1300));
    });
    return function () { tm.forEach(clearTimeout); };
  };

  /* ================= 斗蟋蟀（小动画） ================= */
  function cricket(ctx, x, y, dir, s, t, chirp, phase) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(dir * s, s);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    var w = Math.sin(t * 9 + phase);
    /* 后腿、前腿 */
    ctx.strokeStyle = '#2d1a0c'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-12, -10); ctx.lineTo(-28, -30); ctx.lineTo(-44, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-2, -8); ctx.lineTo(-10, 0); ctx.moveTo(10, -8); ctx.lineTo(20, 0); ctx.moveTo(18, -8); ctx.lineTo(32, 0); ctx.stroke();
    /* 身体 */
    ctx.fillStyle = '#4a2b17'; ctx.strokeStyle = '#2d1a0c'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, -16, 26, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    /* 翅膀（鸣叫时振动） */
    ctx.save(); ctx.translate(-14, -22); ctx.rotate(-0.25 + (chirp ? w * 0.22 : 0));
    ctx.fillStyle = '#8a5a30'; ctx.beginPath(); ctx.ellipse(16, 0, 20, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    /* 头 */
    ctx.fillStyle = '#3a2010'; ctx.beginPath(); ctx.arc(28, -17, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f1cfa1'; ctx.beginPath(); ctx.arc(31, -20, 1.8, 0, Math.PI * 2); ctx.fill();
    /* 触须 */
    ctx.strokeStyle = '#2d1a0c'; ctx.lineWidth = 1.6;
    var sw = Math.sin(t * 5 + phase) * 8;
    ctx.beginPath(); ctx.moveTo(33, -24); ctx.quadraticCurveTo(58, -50 + sw, 84, -46 - sw); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(31, -25); ctx.quadraticCurveTo(50, -58 - sw, 74, -62 + sw); ctx.stroke();
    ctx.restore();
    if (chirp) {
      ctx.strokeStyle = RED; ctx.lineWidth = 2; ctx.globalAlpha = 0.35 + 0.35 * Math.abs(Math.sin(t * 9 + phase));
      for (var i = 0; i < 2; i++) {
        ctx.beginPath(); ctx.arc(x - dir * 8, y - 30 * s, 20 * s + i * 9, -Math.PI * 0.7, -Math.PI * 0.3); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  D['斗蟋蟀'] = function (body) {
    var win = 0;
    return player(body, {
      label: '两只蟋蟀在斗盆里相斗的动画', dur: 12,
      init: function () { win = Math.random() < 0.5 ? 0 : 1; },
      caps: [
        [0, '两只蟋蟀被放进圆圆的“斗盆”里。'],
        [2, '主人用一根细草轻轻拨它们的触须，让它们精神起来。'],
        [4, '两只都振翅鸣叫，慢慢靠近，互相试探。'],
        [6, '扑上去交锋，你进我退。'],
        [8, '一只败下阵来，转身退开。'],
        [10, '另一只振翅长鸣，宣告“胜利”。']
      ],
      note: '斗蟋蟀在宋代就很流行，相传南宋有专门讲它的书《促织经》。“促织”是蟋蟀的古称。这里只是示意：胜负每次随机，不代表哪种蟋蟀更强，也不涉及任何赌博。',
      draw: function (ctx, t) {
        var GY = 236;
        /* 斗盆：剖面 */
        ctx.fillStyle = '#c9a070'; ctx.strokeStyle = INK; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(40, 120); ctx.lineTo(440, 120); ctx.lineTo(430, 250); ctx.quadraticCurveTo(240, 275, 50, 250); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#e6d0a8';
        ctx.beginPath(); ctx.moveTo(54, 126); ctx.lineTo(426, 126); ctx.lineTo(420, 242); ctx.quadraticCurveTo(240, 262, 60, 242); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#b08850'; ctx.fillRect(34, 112, 412, 12); ctx.strokeRect(34, 112, 412, 12);
        /* 位置 */
        var xa = 140, xb = 340;
        if (t < 4) { xa = 140; xb = 340; }
        else if (t < 6) { var k = ease((t - 4) / 2); xa = 140 + 65 * k; xb = 340 - 65 * k; }
        else if (t < 8) { var j = Math.sin((t - 6) * 9); xa = 205 + 9 * j; xb = 275 + 9 * j; }
        else {
          var r = ease((t - 8) / 2);
          if (win === 0) { xa = 205 + 22 * r; xb = 275 + 75 * r; }
          else { xa = 205 - 75 * r; xb = 275 - 22 * r; }
        }
        var da = 1, db = -1;
        if (t > 9.5) { if (win === 0) db = 1; else da = -1; }
        var chA = (t > 3 && t < 4) || (t > 4 && t < 8) || (t > 10 && win === 0);
        var chB = (t > 3.5 && t < 8) || (t > 10 && win === 1);
        /* 影子 */
        ctx.fillStyle = 'rgba(0,0,0,.12)';
        ctx.beginPath(); ctx.ellipse(xa - 6, GY + 2, 30, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(xb + 6, GY + 2, 30, 5, 0, 0, Math.PI * 2); ctx.fill();
        cricket(ctx, xa, GY, da, 1, t, chA, 0);
        cricket(ctx, xb, GY, db, 1, t, chB, 2);
        /* 探草：从上方伸入，先拨左边再拨右边 */
        if (t >= 2 && t < 4) {
          var tx = t < 3 ? xa + 60 : xb - 60, ty = GY - 52 + Math.sin(t * 10) * 4;
          ctx.strokeStyle = '#8a6a2a'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(tx + 120, 20); ctx.lineTo(tx, ty); ctx.stroke();
          ctx.strokeStyle = '#c9b060'; ctx.lineWidth = 1.5;
          for (var q = -2; q <= 2; q++) { ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx - 10 + q * 3, ty + 9 + Math.abs(q)); ctx.stroke(); }
        }
        /* 碰撞火花 */
        if (t >= 6 && t < 8) {
          ctx.strokeStyle = OCH; ctx.lineWidth = 2;
          for (var m = 0; m < 5; m++) {
            var a = m * 1.26 + t * 3;
            ctx.beginPath(); ctx.moveTo(240 + Math.cos(a) * 8, GY - 22 + Math.sin(a) * 8); ctx.lineTo(240 + Math.cos(a) * 20, GY - 22 + Math.sin(a) * 20); ctx.stroke();
          }
        }
      }
    });
  };

  /* ================= 踏青（小动画） ================= */
  D['踏青'] = function (body) {
    return player(body, {
      label: '春天里几个人到郊外游玩的动画', dur: 12,
      caps: [
        [0, '春天来了，天气转暖，人们相约到郊外走走。'],
        [3.5, '路边柳条发了新芽，桃花也开了。'],
        [7, '有人带了风筝，在草地上放起来。'],
        [10, '这就是“踏青”：趁着春光出门赏景、游玩。']
      ],
      note: '踏青就是春天到郊外游玩，唐宋时人们常在清明前后出门。赏花、放风筝、荡秋千都是春游时常见的活动。这里是简笔示意。',
      draw: function (ctx, t, W, H) {
        var GY = 236, sc = t * 22;
        /* 太阳 */
        ctx.fillStyle = OCH; ctx.beginPath(); ctx.arc(410, 46, 22, 0, Math.PI * 2); ctx.fill();
        /* 远山（慢） */
        ctx.fillStyle = '#b9c9a8';
        ctx.beginPath(); ctx.moveTo(0, GY);
        for (var x = 0; x <= W; x += 10) ctx.lineTo(x, GY - 62 - 26 * Math.sin((x + sc * 0.3) / 60) - 14 * Math.sin((x + sc * 0.3) / 23));
        ctx.lineTo(W, GY); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#9fb88c';
        ctx.beginPath(); ctx.moveTo(0, GY);
        for (var x2 = 0; x2 <= W; x2 += 10) ctx.lineTo(x2, GY - 30 - 16 * Math.sin((x2 + sc * 0.6) / 45));
        ctx.lineTo(W, GY); ctx.closePath(); ctx.fill();
        /* 地面 */
        ctx.fillStyle = '#c8d8a6'; ctx.fillRect(0, GY, W, H - GY);
        ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, GY); ctx.lineTo(W, GY); ctx.stroke();
        /* 树：柳树与桃花树，交替出现 */
        for (var i = 0; i < 4; i++) {
          var tx = ((i * 190 - sc * 1.0) % 760 + 760) % 760 - 100;
          if (i % 2 === 0) {
            /* 柳树 */
            ctx.strokeStyle = '#5b3a1e'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(tx, GY); ctx.lineTo(tx + 4, GY - 90); ctx.stroke();
            ctx.strokeStyle = '#6fa05a'; ctx.lineWidth = 2;
            for (var k = -6; k <= 6; k++) {
              var sx = tx + 4 + k * 7, sw = Math.sin(t * 2 + k * 0.6) * 5;
              ctx.beginPath(); ctx.moveTo(tx + 4 + k * 3, GY - 92 + Math.abs(k)); ctx.quadraticCurveTo(sx, GY - 60, sx + sw, GY - 32 - Math.abs(k) * 2); ctx.stroke();
            }
          } else {
            /* 桃花树 */
            ctx.strokeStyle = '#5b3a1e'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(tx, GY); ctx.lineTo(tx - 2, GY - 60); ctx.stroke();
            var bl = clamp01((t - 2) / 3);
            ctx.fillStyle = 'rgba(232,140,160,' + (0.35 + 0.55 * bl) + ')';
            [[-20, -80, 24], [10, -92, 26], [26, -68, 22], [-4, -66, 22]].forEach(function (c) {
              ctx.beginPath(); ctx.arc(tx + c[0], GY + c[1], c[2], 0, Math.PI * 2); ctx.fill();
            });
          }
        }
        /* 草地上的小花 */
        for (var f = 0; f < 14; f++) {
          var fx = ((f * 47 - sc * 1.4) % 660 + 660) % 660 - 90, fy = GY + 12 + (f % 3) * 14;
          var g = clamp01((t - 1 - f * 0.12) / 1.2);
          if (g <= 0) continue;
          ctx.fillStyle = f % 2 ? '#f0c040' : '#f4f4f0';
          ctx.beginPath(); ctx.arc(fx, fy - 3 * g, 3 * g, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#5f8f4a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, fy - 3 * g); ctx.stroke();
        }
        /* 三个人 */
        var bob = function (p) { return Math.sin(t * 6 + p) * 4; };
        var p3 = { x: 250, y: GY + 4 };
        var kx = 355 + 20 * Math.sin(t * 0.9), ky = 84 + 10 * Math.sin(t * 1.3);
        var showKite = t > 6;
        var kg = ease((t - 6) / 1.5);
        var hx = p3.x + 12, hy = p3.y - 60;
        /* 风筝线与风筝 */
        if (showKite) {
          var cx = hx + (kx - hx) * kg, cy = hy + (ky - hy) * kg + (1 - kg) * 0;
          ctx.strokeStyle = 'rgba(59,42,26,.7)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo((hx + cx) / 2, (hy + cy) / 2 + 26, cx, cy); ctx.stroke();
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(0.25 * Math.sin(t * 2));
          ctx.fillStyle = RED; ctx.strokeStyle = INK; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(14, 0); ctx.lineTo(0, 22); ctx.lineTo(-14, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, 22); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.stroke();
          ctx.strokeStyle = BLUE; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 22);
          for (var s = 1; s <= 6; s++) ctx.lineTo(Math.sin(t * 4 + s) * 6, 22 + s * 7);
          ctx.stroke(); ctx.restore();
        }
        man(ctx, 130, GY + 6 + bob(0) * 0.3, 1.0, JADE, 0, null, 5 * Math.sin(t * 6));
        man(ctx, 190, GY + 10 + bob(1) * 0.3, 0.9, OCH, 0, null, 5 * Math.sin(t * 6 + 1.5));
        man(ctx, p3.x, p3.y + 4, 1.0, BLUE, 0, showKite ? { x: hx, y: hy } : null, 5 * Math.sin(t * 6 + 3));
      }
    });
  };

  Y.decorate();
})();
