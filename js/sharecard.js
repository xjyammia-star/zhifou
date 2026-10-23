/* 知否知否 · 分享卡片（把一条内容画成一张可保存、可发给朋友的长图）
   ----------------------------------------------------------------------
   做什么：页面里有“分享卡片”按钮；点一下，浏览器当场把这一条内容画成一张长图
          （宽 1080，高 1350～2160 自动伸缩），右下角带二维码，扫码回到这一条内容的页面。
          可以：保存图片 / 调出手机的分享面板 / 微信里长按图片保存或发送。
   不联网生成：整张图都在用户自己的浏览器里画，不上传、不占服务器；二维码库只有点分享时才加载。
   规则：① 内容必须完整放进卡里，放不下就按“重要程度”从后往前删，并提示“更多内容请扫码”；
        ② 在放得下的前提下尽量完整；③ 不放“待核”字样；④ AI 插画、人物像必须带说明文字。
   现在支持：历史人物（lishi-chaodai.html）、唐诗（tangshi.html）。以后加新类型：
        在下面 TYPES 里加一种“拼卡片的方法”，再在对应页面的弹窗里调用 ShareCard.hook…… 即可。
   任何一步出错都只会提示“生成失败”，不会影响页面原有内容。 */
(function () {
  'use strict';
  if (window.ShareCard) return;

  var W = 1080, PAD_X = 92, PAD_TOP = 88, PAD_BOT = 70, MIN_H = 1350, MAX_H = 2160;
  var CW = W - PAD_X * 2;                  /* 正文宽度 896 */
  var QR_W = 180, FOOT_GAP = 40;
  var FOOT_LEFT_W = CW - QR_W - FOOT_GAP;  /* 页脚左边可用宽度 676 */
  var SERIF = '"Noto Serif SC","Source Han Serif SC","Songti SC","STSong","SimSun",serif';
  var KAI = '"Ma Shan Zheng","STKaiti","KaiTi","Kaiti SC",serif';
  var NUMS = '一二三四五六七八九十';

  /* ---------- 配色 ---------- */
  var THEMES = {
    hist: { bg: ['#141C1F', '#0F1518'], fg: '#E8E2D2', accent: '#D9B877', tagfg: '#11171A', sub: '#B9B2A0', muted: '#9AA5A3', body: '#DDD6C4',
            frame1: 'rgba(217,184,119,0.45)', frame2: 'rgba(217,184,119,0.22)', rule: 'rgba(217,184,119,0.30)', box: 'rgba(217,184,119,0.55)',
            qrbg: '#F1E9D4', qrfg: '#11171A', red: '#B3362E', redtxt: '#FBEFE6', strong: '#F1E9D4', note: '#8B9694', brand: '#D6493F', ph1: '#34484C', ph2: '#1D2A2E' },
    sea:  { light: true, bg: ['#F3EDDF', '#E7DFCB'], fg: '#2B2B2B', accent: '#8A4324', tagfg: '#F6EDE0', sub: '#6E6450', muted: '#7A705A', body: '#3A352A',
            frame1: 'rgba(138,67,36,0.40)', frame2: 'rgba(138,67,36,0.22)', rule: 'rgba(138,67,36,0.30)', box: 'rgba(138,67,36,0.45)',
            qrbg: '#FBF7EE', qrfg: '#2B2B2B', red: '#B23A2E', redtxt: '#F6EDE0', strong: '#1F1F1F', note: '#8B806A', brand: '#B23A2E', ph1: '#D9CFB8', ph2: '#C9BEA3' },
    shen: { bg: ['#181714', '#100F0D'], fg: '#E8E2D2', accent: '#CFA85A', tagfg: '#14110D', sub: '#B8AE98', muted: '#9A927D', body: '#DDD6C4',
            frame1: 'rgba(207,168,90,0.45)', frame2: 'rgba(207,168,90,0.22)', rule: 'rgba(207,168,90,0.30)', box: 'rgba(207,168,90,0.55)',
            qrbg: '#F1E9D4', qrfg: '#14110D', red: '#B3362E', redtxt: '#FBEFE6', strong: '#F1E9D4', note: '#8B8473', brand: '#D6493F', ph1: '#34484C', ph2: '#1D2A2E' },
    lit:  { light: true, bg: ['#F4ECF1', '#E9DDE7'], fg: '#2E2240', accent: '#5E3F6A', tagfg: '#F6EDF3', sub: '#6E5A7B', muted: '#6E5A7B', body: '#3A2E4A',
            frame1: 'rgba(94,63,106,0.40)', frame2: 'rgba(94,63,106,0.25)', rule: 'rgba(94,63,106,0.30)', box: 'rgba(94,63,106,0.40)',
            qrbg: '#FFFFFF', qrfg: '#1E1630', red: '#B3362E', redtxt: '#FBEFE6', strong: '#2E2240', note: '#8A7798', brand: '#B3362E', ph1: '#D9CBD6', ph2: '#C5B2C2' },
    dj:   { light: true, bg: ['#EEF0E2', '#DFE3CE'], fg: '#27302A', accent: '#3F5B45', tagfg: '#F1F3E6', sub: '#5E6B5C', muted: '#6B7867', body: '#2F382F',
            frame1: 'rgba(63,91,69,0.40)', frame2: 'rgba(63,91,69,0.22)', rule: 'rgba(63,91,69,0.30)', box: 'rgba(63,91,69,0.45)',
            qrbg: '#FBFBF4', qrfg: '#27302A', red: '#B23A2E', redtxt: '#F6EDE0', strong: '#1B241D', note: '#7C8878', brand: '#B23A2E', ph1: '#CDD3BD', ph2: '#BCC4A9' }
  };

  /* ---------- 小工具 ---------- */
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = function () { res(); }; s.onerror = function () { rej(new Error('load ' + src)); };
      document.head.appendChild(s);
    });
  }
  function withTimeout(p, ms) {
    return new Promise(function (res) {
      var done = false;
      var t = setTimeout(function () { if (!done) { done = true; res(null); } }, ms);
      Promise.resolve(p).then(function (v) { if (!done) { done = true; clearTimeout(t); res(v); } }, function () { if (!done) { done = true; clearTimeout(t); res(null); } });
    });
  }
  /* 去掉“待核”标记：〔…待核…〕、（待核）等；卡片上不放这种字样 */
  function clean(s) {
    return String(s == null ? '' : s)
      .replace(/〔[^〕]*待核[^〕]*〕/g, '')
      .replace(/[（(][^）)]*待核[^）)]*[）)]/g, '')
      .replace(/\s+/g, ' ').trim()
      .split(/(?<=[。！？；])/).filter(function (x) { return x.indexOf('待核') < 0; }).join('');   /* 仍含“待核”的整句也不上卡 */
  }
  /* 按句号等切成句子（保留标点） */
  function sentences(s) {
    var out = [], cur = '';
    Array.from(String(s || '')).forEach(function (ch) {
      cur += ch;
      if ('。！？；'.indexOf(ch) >= 0) { out.push(cur); cur = ''; }
    });
    if (cur.trim()) out.push(cur);
    return out;
  }
  /* 最多保留 n 个字：只在句末截断，不把一句话切断；一句都放不下才硬截并加省略号 */
  function cutBySentence(s, n) {
    s = String(s || '');
    if (s.length <= n) return s;
    var acc = '', ss = sentences(s);
    for (var i = 0; i < ss.length; i++) {
      if ((acc + ss[i]).length > n) break;
      acc += ss[i];
    }
    if (acc) return acc;
    return s.slice(0, Math.max(1, n - 1)).replace(/[，、；：\s]+$/, '') + '…';
  }
  function shortYears(v) {
    v = clean(v);
    var m = v.match(/(前?约?\d{1,4}(?:或\d{1,4})?\s*[–—\-－~至]\s*前?约?\d{1,4})/);
    if (m) return m[1].replace(/\s/g, '').replace(/[-－~至]/, '—');
    var m2 = v.match(/\d{3,4}/);
    return m2 ? v.split(/[；;，,。]/)[0].slice(0, 14) : '';
  }

  /* ---------- 文字排版（中文标点不出现在行首，括号不留在行尾） ---------- */
  var NO_START = '，。、；：！？）》」』”’〕】…—,.;:!?)';
  var NO_END = '（《「『“‘〔【(';
  var wcache = {};
  function cw(ctx, ch) {
    var k = ctx.font + '|' + ch;
    var v = wcache[k];
    if (v === undefined) { v = ctx.measureText(ch).width; wcache[k] = v; }
    return v;
  }
  function wrap(ctx, text, maxW) {
    var lines = [], paras = String(text == null ? '' : text).split('\n');
    paras.forEach(function (para) {
      var cur = '', w = 0;
      Array.from(para).forEach(function (ch) {
        var c = cw(ctx, ch);
        if (w + c > maxW && cur) {
          if (NO_START.indexOf(ch) >= 0) {
            if (w + c <= maxW + 34) { cur += ch; w += c; return; }                 /* 标点悬挂：多挤一个标点，不另起一行 */
            var arr = Array.from(cur);                                              /* 挤不下：把上一个字一起带到下一行，不让标点单独占一行 */
            if (arr.length > 1) {
              var tail = arr.pop(); lines.push(arr.join(''));
              cur = tail + ch; w = cw(ctx, tail) + c; return;
            }
          }
          var carry = '';
          var last = cur.slice(-1);
          if (NO_END.indexOf(last) >= 0) { carry = last; cur = cur.slice(0, -1); }
          else if (/[0-9–—]/.test(ch) && /[0-9–—]/.test(last)) {                       /* 年份、数字不在中间断开：整串带到下一行 */
            var k = cur.length; while (k > 0 && /[0-9–—前约]/.test(cur.charAt(k - 1))) k--;
            if (k > 0) { carry = cur.slice(k); cur = cur.slice(0, k); }
          }
          lines.push(cur);
          cur = carry + ch; w = 0; Array.from(cur).forEach(function (x) { w += cw(ctx, x); });
          return;
        }
        cur += ch; w += c;
      });
      lines.push(cur);
    });
    return lines;
  }
  function setFont(ctx, size, weight, family) { ctx.font = (weight || 400) + ' ' + size + 'px ' + (family || SERIF); }
  /* 带字距的文字（Safari 旧版不支持 letterSpacing，所以自己逐字画） */
  function spacedWidth(ctx, text, sp) { var w = 0; Array.from(text).forEach(function (ch) { w += cw(ctx, ch) + sp; }); return Math.max(0, w - sp); }
  function drawSpaced(ctx, text, x, y, sp) { var cx = x; Array.from(text).forEach(function (ch) { ctx.fillText(ch, cx, y); cx += cw(ctx, ch) + sp; }); }

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  /* ---------- 块：每一块有高度 h，和画自己的方法 paint(ctx, x, y) ---------- */
  function blockHead(M, th, o) {
    return { h: 50, paint: function (c, x, y) {
      setFont(c, 26, 600); var tw = spacedWidth(c, o.tag, 3.6);
      c.fillStyle = th.accent; rr(c, x, y, tw + 48, 50, 4); c.fill();
      c.fillStyle = th.tagfg; c.textBaseline = 'middle'; drawSpaced(c, o.tag, x + 24, y + 26, 3.6);
      setFont(c, 26, 400); c.fillStyle = th.sub; drawSpaced(c, o.sub || '', x + tw + 48 + 16, y + 26, 3.6);
      if (o.right) { setFont(c, 24, 400); c.fillStyle = th.muted; var rw = spacedWidth(c, o.right, 3.8); drawSpaced(c, o.right, x + CW - rw, y + 26, 3.8); }
    } };
  }
  function blockTitle(M, th, text, size, w, align) {
    setFont(M, size, 400, KAI);
    var lines = wrap(M, text, w || CW), lh = Math.round(size * 1.08);
    return { h: lines.length * lh, paint: function (c, x, y) {
      setFont(c, size, 400, KAI); c.fillStyle = th.accent; c.textBaseline = 'alphabetic';
      lines.forEach(function (l, i) {
        var tx = x;
        if (align === 'center') { tx = x + ((w || CW) - spacedWidth(c, l, size * 0.04)) / 2; }
        drawSpaced(c, l, tx, y + (i + 1) * lh - Math.round(size * 0.2), size * 0.04);
      });
    } };
  }
  function blockSec(M, th, label) {
    return { h: 66, paint: function (c, x, y) {
      setFont(c, 48, 400, KAI); c.fillStyle = th.accent; c.textBaseline = 'alphabetic';
      var tw = spacedWidth(c, label, 4.8); drawSpaced(c, label, x, y + 50, 4.8);
      c.fillStyle = th.rule; c.fillRect(x + tw + 20, y + 33, CW - tw - 20, 1.5);
    } };
  }
  function blockPara(M, th, text, size, opt) {
    opt = opt || {};
    setFont(M, size, opt.weight || 400);
    var lines = wrap(M, text, opt.w || CW), lh = Math.round(size * (opt.lh || 1.75));
    return { h: lines.length * lh, lines: lines.length, paint: function (c, x, y) {
      setFont(c, size, opt.weight || 400); c.fillStyle = opt.color || th.body; c.textBaseline = 'alphabetic';
      lines.forEach(function (l, i) {
        var tx = x;
        if (opt.align === 'center') tx = x + ((opt.w || CW) - spacedWidth(c, l, 0)) / 2;
        c.fillText(l, tx, y + (i + 1) * lh - Math.round((lh - size) / 2) - Math.round(size * 0.12));
      });
    } };
  }
  function blockSteps(M, th, items) {
    var tw = CW - 74, size = 30, lh = Math.round(size * 1.75), gap = 20;
    setFont(M, size, 400);
    var rows = items.map(function (t) { return wrap(M, t, tw); });
    var h = 0; rows.forEach(function (r, i) { h += Math.max(50, r.length * lh) + (i ? gap : 0); });
    return { h: h, paint: function (c, x, y) {
      var cy = y;
      rows.forEach(function (r, i) {
        c.fillStyle = th.red; c.beginPath(); c.arc(x + 25, cy + 25 + 6, 25, 0, Math.PI * 2); c.fill();
        setFont(c, 28, 600); c.fillStyle = th.redtxt; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(NUMS.charAt(i) || String(i + 1), x + 25, cy + 25 + 7); c.textAlign = 'left';
        setFont(c, size, 400); c.fillStyle = th.body; c.textBaseline = 'alphabetic';
        r.forEach(function (l, j) { c.fillText(l, x + 74, cy + (j + 1) * lh - Math.round((lh - size) / 2) - Math.round(size * 0.12)); });
        cy += Math.max(50, r.length * lh) + gap;
      });
    } };
  }
  /* 一行“标签 + 文字”（红框小标签） */
  function blockLabelRows(M, th, rows) {
    var size = 30, lh = Math.round(size * 1.8), tw = CW - 102, gap = 14;
    setFont(M, size, 400);
    var prepared = rows.map(function (r) { return { label: r[0], lines: wrap(M, r[1], tw) }; });
    var h = 0; prepared.forEach(function (r, i) { h += Math.max(60, r.lines.length * lh) + (i ? gap : 0); });
    return { h: h, paint: function (c, x, y) {
      var cy = y;
      prepared.forEach(function (r) {
        setFont(c, 26, 400); c.strokeStyle = th.red; c.lineWidth = 2; rr(c, x + 1, cy + 6, 76, 52, 6); c.stroke();
        c.fillStyle = th.light ? th.red : '#D9695F'; c.textBaseline = 'middle'; c.textAlign = 'center';
        c.fillText(r.label.slice(0, 3), x + 39, cy + 33); c.textAlign = 'left';
        setFont(c, size, 400); c.fillStyle = th.body; c.textBaseline = 'alphabetic';
        r.lines.forEach(function (l, j) { c.fillText(l, x + 102, cy + (j + 1) * lh - Math.round((lh - size) / 2) - Math.round(size * 0.12)); });
        cy += Math.max(60, r.lines.length * lh) + 14;
      });
    } };
  }
  function blockSpace(h) { return { h: h, paint: function () {} }; }
  /* 横幅插画（7:3）：神灵、异兽的配图；AI 插画要标注 */
  function blockBanner(M, th, img, aiLabel) {
    var h = Math.round(CW * 3 / 7), tagH = aiLabel ? 40 : 0;
    return { h: h + tagH, paint: function (c, x, y) {
      c.save(); c.beginPath(); c.rect(x, y, CW, h); c.clip();
      var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
      var sc = Math.max(CW / iw, h / ih), dw = iw * sc, dh = ih * sc;
      c.drawImage(img, x + (CW - dw) / 2, y + (h - dh) / 2, dw, dh);
      c.restore();
      c.strokeStyle = th.box; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, CW - 2, h - 2);
      if (aiLabel) {
        var ty = y + h + 10;
        setFont(c, 20, 400); var aw = spacedWidth(c, aiLabel, 1) + 18;
        c.strokeStyle = th.note; c.lineWidth = 1.2; rr(c, x, ty, aw, 28, 4); c.stroke();
        c.fillStyle = th.note; c.textBaseline = 'middle'; drawSpaced(c, aiLabel, x + 9, ty + 15, 1);
      }
    } };
  }
  /* 大事记：左边年份（金色），右边一句话 */
  function blockEvents(M, th, items) {
    var size = 30, lh = Math.round(size * 1.7), colW = 132, gap = 14;
    setFont(M, size, 400);
    var rows = items.map(function (it) { return { y: it[0], lines: wrap(M, it[1], CW - colW) }; });
    var h = 0; rows.forEach(function (r, i) { h += r.lines.length * lh + (i ? gap : 0); });
    return { h: h, paint: function (c, x, y) {
      var cy = y;
      rows.forEach(function (r) {
        setFont(c, 28, 600); c.fillStyle = th.accent; c.textBaseline = 'alphabetic';
        c.fillText(r.y, x, cy + lh - Math.round((lh - size) / 2) - Math.round(size * 0.12));
        setFont(c, size, 400); c.fillStyle = th.body;
        r.lines.forEach(function (l, j) { c.fillText(l, x + colW, cy + (j + 1) * lh - Math.round((lh - size) / 2) - Math.round(size * 0.12)); });
        cy += r.lines.length * lh + gap;
      });
    } };
  }
  /* 历代定都：左边政权名，右边年份（金色，靠右） */
  function blockDyn(M, th, items) {
    var size = 30, lh = Math.round(size * 1.6), yw = 300, gap = 8;
    setFont(M, size, 600);
    var rows = items.map(function (it) { return { n: wrap(M, it[0], CW - yw - 20), y: wrap(M, it[1], yw) }; });
    var h = 0; rows.forEach(function (r, i) { h += Math.max(r.n.length, r.y.length) * lh + (i ? gap : 0); });
    return { h: h, paint: function (c, x, y) {
      var cy = y;
      rows.forEach(function (r) {
        var n = Math.max(r.n.length, r.y.length), base = function (j) { return cy + (j + 1) * lh - Math.round((lh - size) / 2) - Math.round(size * 0.12); };
        setFont(c, size, 600); c.fillStyle = th.strong; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
        r.n.forEach(function (l, j) { c.fillText(l, x, base(j)); });
        setFont(c, 28, 600); c.fillStyle = th.accent; c.textAlign = 'right';
        r.y.forEach(function (l, j) { c.fillText(l, x + CW, base(j)); });
        c.textAlign = 'left';
        cy += n * lh + gap;
      });
    } };
  }
  /* 一览表：每位一行（单行版：名字 + 关系）或两行（名字 + 关系/结局） */
  function blockRoll(M, th, rows, mode) {
    var two = mode === 'two-line', nameW = two ? 250 : 190, textW = CW - nameW;
    var s1 = two ? 28 : 27, s2 = 25, l1 = two ? 38 : 36, l2 = 34, padV = two ? 11 : 6, minH = two ? 64 : 44;
    var prepared = rows.map(function (r) {
      setFont(M, s1, 400);
      var a = wrap(M, [r.rel || '', two ? '' : (r.note || r.tag || '')].filter(Boolean).join('　'), textW);
      setFont(M, s2, 400);
      var b = two && r.note ? wrap(M, r.note, textW) : [];
      return { name: r.name, a: a, b: b, h: Math.max(minH, a.length * l1 + b.length * l2) + padV * 2 };
    });
    var h = 0; prepared.forEach(function (r) { h += r.h; });
    return { h: h, paint: function (c, x, y) {
      var cy = y;
      prepared.forEach(function (r, i) {
        if (i) { c.fillStyle = th.rule; c.globalAlpha = 0.55; c.fillRect(x, cy, CW, 1); c.globalAlpha = 1; }
        setFont(c, 33, 400, KAI); c.fillStyle = th.accent; c.textBaseline = 'alphabetic';
        drawSpaced(c, r.name, x, cy + padV + 33, 1.2);
        setFont(c, s1, 400); c.fillStyle = th.body;
        r.a.forEach(function (l, j) { c.fillText(l, x + nameW, cy + padV + (j + 1) * l1 - 9); });
        setFont(c, s2, 400); c.fillStyle = th.muted;
        r.b.forEach(function (l, j) { c.fillText(l, x + nameW, cy + padV + r.a.length * l1 + (j + 1) * l2 - 9); });
        cy += r.h;
      });
    } };
  }

  /* 人物页头：左边人物像（没有就不画），右边名字 + 身份 + 基本信息 */
  function blockPersonTop(M, th, o, img) {
    var hasPic = !!img, colX = hasPic ? 380 + 52 : 0, colW = CW - colX;
    var name = o.name, size = 160;
    var Lname = Array.from(name).length;
    size = Math.max(72, Math.min(160, Math.floor(colW / (Lname * 1.08))));
    setFont(M, size, 400, KAI);
    var tl = wrap(M, name, colW), tlh = Math.round(size * 1.08), titleH = tl.length * tlh;
    var sub = o.subtitle ? wrap(M, o.subtitle, colW) : [];
    setFont(M, 30, 600);
    var subLines = o.subtitle ? wrap(M, o.subtitle, colW) : [];
    var y2 = titleH + 18 + (subLines.length ? subLines.length * 46 + 14 : 0);
    var facts = (o.facts || []);
    setFont(M, 27, 400);
    var factRows = facts.map(function (f) { return { k: f[0], lines: wrap(M, f[1], colW - 90) }; });
    var factsH = 0; factRows.forEach(function (r) { factsH += r.lines.length * 42 + 10; });
    var rightH = y2 + (factsH ? 26 + factsH : 0);
    /* 左边：像 + 说明 */
    var picH = 0, capLines = [];
    if (hasPic) {
      setFont(M, 20, 400);
      capLines = wrap(M, o.portraitCaption || '', 380);
      picH = 506 + 12 + capLines.length * 32 + (o.portraitAi ? 34 : 0);
    }
    var h = Math.max(picH, rightH);
    return { h: h, paint: function (c, x, y) {
      if (hasPic) {
        c.strokeStyle = th.box; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, 378, 504);
        c.save(); c.beginPath(); c.rect(x + 10, y + 10, 360, 486); c.clip();
        var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
        var sc = Math.max(360 / iw, 486 / ih), dw = iw * sc, dh = ih * sc;
        c.drawImage(img, x + 10 + (360 - dw) / 2, y + 10 + (486 - dh) / 2, dw, dh);
        c.restore();
        setFont(c, 20, 400); c.fillStyle = th.note; c.textBaseline = 'alphabetic';
        capLines.forEach(function (l, i) { c.fillText(l, x, y + 506 + 12 + (i + 1) * 32 - 8); });
        if (o.portraitAi) {
          var ty = y + 506 + 12 + capLines.length * 32 + 4;
          setFont(c, 20, 400); var aw = spacedWidth(c, o.portraitAi, 1) + 18;
          c.strokeStyle = th.note; c.lineWidth = 1.2; rr(c, x, ty, aw, 28, 4); c.stroke();
          c.fillStyle = th.note; c.textBaseline = 'middle'; drawSpaced(c, o.portraitAi, x + 9, ty + 15, 1);
        }
      }
      var rx = x + colX, cy = y;
      setFont(c, size, 400, KAI); c.fillStyle = th.accent; c.textBaseline = 'alphabetic';
      tl.forEach(function (l, i) { drawSpaced(c, l, rx, cy + (i + 1) * tlh - Math.round(size * 0.2), size * 0.04); });
      cy += titleH + 18;
      if (subLines.length) {
        setFont(c, 30, 600); c.fillStyle = th.strong;
        subLines.forEach(function (l, i) { c.fillText(l, rx, cy + (i + 1) * 46 - 12); });
        cy += subLines.length * 46 + 14;
      }
      if (factRows.length) {
        cy += 26 - 14 + 14;
        c.fillStyle = th.rule; c.fillRect(rx, cy - 14, colW, 1.5);
        factRows.forEach(function (r) {
          setFont(c, 27, 400); c.fillStyle = th.muted; c.fillText(r.k, rx, cy + 28);
          c.fillStyle = th.fg;
          r.lines.forEach(function (l, i) { c.fillText(l, rx + 90, cy + 28 + i * 42); });
          cy += r.lines.length * 42 + 10;
        });
      }
    } };
  }

  /* 诗：一行一行居中；上下各一条细线 */
  function blockPoem(M, th, lines, size, noTop) {
    setFont(M, size, 400);
    var lh = Math.round(size * 1.95), maxW = CW - 60, prepared = [];
    lines.forEach(function (ln) {
      var ws = wrap(M, ln, maxW);
      /* 折成几行时，最后一行只剩一两个字很难看：改成各行长度接近的“均衡折行” */
      if (ws.length > 1 && ws.length <= 3 && Array.from(ws[ws.length - 1]).length <= 3) {
        var tw = spacedWidth(M, ln, 2), nn = ws.length, w2 = Math.min(maxW, tw / nn + size * 1.2);
        var ws2 = wrap(M, ln, w2);
        if (ws2.length === ws.length) ws = ws2;
      }
      ws.forEach(function (l) { prepared.push(l); });
    });
    var h = prepared.length * lh + 56;
    return { h: h, lines: prepared.length, paint: function (c, x, y) {
      c.fillStyle = th.rule; if (!noTop) c.fillRect(x + 30, y, CW - 60, 1.5); c.fillRect(x + 30, y + h - 1.5, CW - 60, 1.5);
      setFont(c, size, 400); c.fillStyle = th.fg; c.textBaseline = 'alphabetic';
      prepared.forEach(function (l, i) {
        var lw = spacedWidth(c, l, 2);
        drawSpaced(c, l, x + (CW - lw) / 2, y + 28 + (i + 1) * lh - Math.round(lh * 0.28), 2);
      });
    } };
  }

  /* ---------- 页脚：分隔线 + 左边内容（紧贴分隔线下）+ 右边二维码 ---------- */
  function buildFooter(M, th, f) {
    var leftH = 0, label = f && f.label, lines = [];
    if (f && f.text) {
      f = { label: f.label, text: String(f.text).replace(/[；，、：\s]+$/, '').replace(/([^。！？”）…])$/, '$1。') };
      setFont(M, 30, 400);
      lines = wrap(M, f.text, FOOT_LEFT_W);
      leftH = 60 + 12 + lines.length * 52;
    }
    var qrH = 180 + 6 + 46 + 6 + 24;
    var h = Math.max(leftH, qrH);
    return { h: 26 + h, lines: lines, paint: function (c, x, y, qr) {
      c.fillStyle = th.rule; c.fillRect(x, y, CW, 2);
      var top = y + 26;
      if (f && f.text) {
        setFont(c, 46, 400, KAI); c.fillStyle = th.accent; c.textBaseline = 'alphabetic';
        var lw = spacedWidth(c, label, 4.6); drawSpaced(c, label, x, top + 46, 4.6);
        c.fillStyle = th.rule; c.fillRect(x + lw + 20, top + 30, FOOT_LEFT_W - lw - 20, 1.5);
        setFont(c, 30, 400); c.fillStyle = th.body;
        lines.forEach(function (l, i) { c.fillText(l, x, top + 60 + 12 + (i + 1) * 52 - 16); });
      }
      var qx = x + CW - QR_W;
      c.fillStyle = th.qrbg; rr(c, qx, top, QR_W, QR_W, 10); c.fill();
      if (qr) {
        var n = qr.getModuleCount(), inner = QR_W - 24, s = Math.max(2, Math.floor(inner / n)), off = (QR_W - s * n) / 2;
        c.fillStyle = th.qrfg;
        for (var r = 0; r < n; r++) for (var q = 0; q < n; q++) if (qr.isDark(r, q)) c.fillRect(qx + off + q * s, top + off + r * s, s, s);
      }
      setFont(c, 42, 400, KAI); c.fillStyle = th.brand; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      c.fillText('知否知否', qx + QR_W / 2, top + QR_W + 6 + 40);
      setFont(c, 20, 400); c.fillStyle = th.muted;
      c.fillText('扫码看详情', qx + QR_W / 2, top + QR_W + 6 + 46 + 6 + 18); c.textAlign = 'left';
    } };
  }

  /* ---------- 总排版：先量高度，放不下就按重要程度从后往前删 ---------- */
  function layout(spec, th, M) {
    var sections = spec.sections.map(function (s) { return { id: s.id, label: s.label, kind: s.kind, items: s.items.slice(), prio: s.prio, keepMin: s.keepMin || 1, drop: s.drop !== false, size: s.size, rollLayout: s.rollLayout }; });
    var trimmed = false;
    function build() {
      var blocks = [];
      var top = spec.top(M, th);                         /* 页头、标题等固定块 */
      top.forEach(function (b) { blocks.push(b); });
      sections.forEach(function (s) {
        if (!s.items.length) return;
        if (s.label) { blocks.push(blockSpace(36)); blocks.push(blockSec(M, th, s.label)); blocks.push(blockSpace(14)); }
        else blocks.push(blockSpace(28));
        if (s.kind === 'steps') blocks.push(blockSteps(M, th, s.items));
        else if (s.kind === 'rows') blocks.push(blockLabelRows(M, th, s.items));
        else if (s.kind === 'events') blocks.push(blockEvents(M, th, s.items));
        else if (s.kind === 'dyn') blocks.push(blockDyn(M, th, s.items));
        else if (s.kind === 'roll') blocks.push(blockRoll(M, th, s.items, s.rollLayout));
        else if (s.kind === 'poem') blocks.push(blockPoem(M, th, s.items, s.size || 40, !!s.label));
        else s.items.forEach(function (t, i) { if (i) blocks.push(blockSpace(10)); blocks.push(blockPara(M, th, t, s.size || 30)); });
      });
      if (trimmed && !spec.noMore) { blocks.push(blockSpace(22)); blocks.push(blockPara(M, th, '更多内容请扫码，在网站上查看。', 24, { color: th.note, lh: 1.5 })); }
      var h = 0; blocks.forEach(function (b) { h += b.h; });
      return { blocks: blocks, h: h };
    }
    var foot = buildFooter(M, th, spec.footer);
    var GAP = 34, res = build();
    function total() { return PAD_TOP + res.h + GAP + foot.h + PAD_BOT; }
    var guard = 0;
    while (total() > MAX_H && guard++ < 80) {
      /* 找可以删的：重要程度数字最大的栏目优先 */
      var cand = null;
      sections.forEach(function (s) {
        if (!s.items.length) return;
        var can = s.items.length > s.keepMin || s.drop || (s.kind === 'paras' && s.items[0].length > 60) || (s.kind === 'rows' && s.items.some(function (r) { return r[1].length > 40; }));
        if (can && (!cand || s.prio > cand.prio)) cand = s;
      });
      if (!cand) {
        /* 实在放不下：把重要程度最低的一整段拿掉（版头、基本信息不动） */
        sections.forEach(function (s) { if (s.items.length && s.kind !== 'rows' && s.prio >= 3 && (!cand || s.prio > cand.prio)) cand = s; });
        if (!cand) break;
        trimmed = true; cand.items = []; res = build(); continue;
      }
      trimmed = true;
      if (cand.items.length > cand.keepMin) cand.items.pop();
      else if (cand.drop) cand.items = [];
      else if (cand.kind === 'rows') {
        var li = 0; cand.items.forEach(function (r, i) { if (r[1].length > cand.items[li][1].length) li = i; });
        cand.items[li] = [cand.items[li][0], cutBySentence(cand.items[li][1], Math.floor(cand.items[li][1].length * 0.6)).replace(/[，、；\s]+$/, '')];
      }
      else cand.items[0] = cutBySentence(cand.items[0], Math.floor(cand.items[0].length * 0.7));
      res = build();
    }
    var H = Math.max(MIN_H, Math.min(MAX_H, Math.ceil(total() / 10) * 10));
    return { H: H, blocks: res.blocks, bodyH: res.h, foot: foot, gap: GAP, overflow: total() > MAX_H, trimmed: trimmed };
  }

  /* ---------- 画整张卡 ---------- */
  function render(spec, qr, img) {
    var th = THEMES[spec.theme] || THEMES.hist;
    var M = document.createElement('canvas').getContext('2d');
    M.textBaseline = 'alphabetic';
    var specNow = spec; specNow.img = img || null;
    var L = layout(specNow, th, M);
    var cv = document.createElement('canvas'); cv.width = W; cv.height = L.H;
    var c = cv.getContext('2d');
    var g = c.createLinearGradient(0, 0, 0, L.H); g.addColorStop(0, th.bg[0]); g.addColorStop(1, th.bg[1]);
    c.fillStyle = g; c.fillRect(0, 0, W, L.H);
    c.strokeStyle = th.frame1; c.lineWidth = 2; c.strokeRect(29, 29, W - 58, L.H - 58);
    c.strokeStyle = th.frame2; c.lineWidth = 1; c.strokeRect(42.5, 42.5, W - 85, L.H - 85);
    var y = PAD_TOP;
    L.blocks.forEach(function (b) { b.paint(c, PAD_X, y); y += b.h; });
    var fy = L.H - PAD_BOT - L.foot.h;
    L.foot.paint(c, PAD_X, fy, qr);
    return { canvas: cv, layout: L };
  }

  /* ---------- 各类内容的拼法 ---------- */
  var TYPES = {
    person: function (o) {
      var c = o.hit.card, fields = {};
      c.f.forEach(function (f) { fields[f.k] = f; });
      function val(k) { var f = fields[k]; if (!f) return ''; if (f.items) return f.items.map(function (it) { return clean(it.ev ? (it.ev.y + it.ev.t) : it.t); }).join('；'); return clean(f.v); }
      var years = val('生卒'), identity = val('身份');
      var nameFull = c.name, nameBig = nameFull.replace(/[（(].*$/, '');
      var steps = sentences(val('事迹')).map(function (s) { return s.trim().replace(/[；，、]$/, '。'); }).filter(Boolean);
      /* 句子太多就两两合并，最多 5 条 */
      while (steps.length > 5) {
        var merged = [];
        for (var i = 0; i < steps.length; i += 2) merged.push(steps[i] + (steps[i + 1] || ''));
        steps = merged;
      }
      var rows = [];
      if (val('与帝王的关系')) rows.push(['关系', val('与帝王的关系')]);
      if (val('与本朝大事的关联')) rows.push(['大事', val('与本朝大事的关联')]);
      var judge = val('历史评价');
      var sections = [];
      if (steps.length) sections.push({ id: 'deeds', label: '主要事迹', kind: 'steps', items: steps, prio: 3, keepMin: 2, drop: false });
      var pic = o.portrait && o.img ? o.img : null;
      /* 有人物像时，右边还有空位：把“帝王”“大事”两行放到右边；没像就放到下面单独成栏 */
      if (!pic) rows.forEach(function (r, i) { sections.push({ id: 'row' + i, label: '相关', kind: 'rows', items: [r], prio: 5 + i, keepMin: 1 }); });
      return {
        theme: 'hist', kind: 'person', title: nameBig,
        file: '知否知否-' + nameBig,
        sections: mergeRows(sections),
        top: function (M, th) {
          var arr = [blockHead(M, th, { tag: '历史', sub: o.dynName + ' · ' + o.hit.kind, right: shortYears(years) }), blockSpace(48)];
          arr.push(blockPersonTop(M, th, {
            name: nameBig, subtitle: (nameBig !== nameFull ? nameFull + (identity ? '：' + cutBySentence(identity, 30) : '') : cutBySentence(identity, 40)).replace(/[。；，]+$/, ''),
            facts: (years ? [['生卒', cutBySentence(years.split('；')[0], 24).replace(/[。；，]+$/, '')]] : []).concat(pic ? rows.map(function (r) { return [r[0], cutBySentence(r[1], 60)]; }) : []),
            portraitCaption: pic ? clean(o.portrait.caption) : '', portraitAi: pic && o.portrait.ai ? (o.portrait.aiLabel || 'AI 生成插画') : ''
          }, pic));
          return arr;
        },
        footer: judge ? { label: '后世评价', text: cutBySentence(judge, 120) } : (val('与本朝大事的关联') ? { label: '与大事的关联', text: cutBySentence(val('与本朝大事的关联'), 120) } : null),
        img: pic
      };
      function mergeRows(secs) {
        /* “相关”两行合并成一个栏目，方便整体删 */
        var rr_ = secs.filter(function (s) { return s.kind === 'rows'; }), other = secs.filter(function (s) { return s.kind !== 'rows'; });
        if (rr_.length) other.push({ id: 'rows', label: '相关', kind: 'rows', items: rr_.map(function (s) { return s.items[0]; }), prio: 5, keepMin: 1 });
        return other;
      }
    },

    /* 节气 / 节日 / 十二时辰 / 十二生肖：同一种版式（米黄底，左边插画，右边名字和基本信息） */
    season: function (o) {
      var e = o.entry, k = o.kind, name = o.name;
      var SEASON = { '春': '春季', '夏': '夏季', '秋': '秋季', '冬': '冬季' };
      var tag, headSub, right = '', subtitle = '', facts = [];
      if (k === 'term') { tag = '节气'; headSub = (SEASON[e.season] || '') + '第' + e.seasonNo + '个 · 全年第' + e.yearNo + '个'; right = e.approxDate; subtitle = e.nature; facts = [['时间', '大致' + e.approxDate], ['季节', SEASON[e.season] || e.season]]; }
      else if (k === 'festival') { tag = '节日'; headSub = '第' + e.no + '个 · 共 15 个'; subtitle = e.theme; facts = [['日期', e.lunar]]; }
      else if (k === 'shichen') { tag = '时辰'; headSub = '第' + e.no + '个 · 共 12 个'; right = e.time; subtitle = e.theme; facts = [['时间', e.time]]; }
      else { tag = '生肖'; headSub = '第' + e.no + '个 · 共 12 个'; right = e.time; subtitle = e.theme; facts = [['时辰', e.time]]; }
      var sections = [];
      if (k === 'term' && e.hou && e.hou.length) {
        var LB = ['初候', '二候', '三候'];
        sections.push({ id: 'hou', label: '三候', kind: 'rows', items: e.hou.map(function (h, i) { return [LB[i] || '候', clean(h.name + '：' + h.plain)]; }), prio: 3, keepMin: 3, drop: false });
      }
      var body = (e.body || []).map(clean).filter(Boolean);
      if (body.length) sections.push({ id: 'body', label: '', kind: 'paras', items: body, prio: 2, keepMin: 1, drop: false, size: 31 });
      var cus = clean(e.customs);
      if (cus) sections.push({ id: 'cus', label: '习俗', kind: 'paras', items: [cus], prio: 4, keepMin: 1, drop: false, size: 31 });
      var story = (e.story || []).map(clean).filter(Boolean);
      if (story.length) sections.push({ id: 'story', label: '典故', kind: 'paras', items: story, prio: 5, keepMin: 1, drop: true, size: 31 });
      var pic = o.portrait && o.img ? o.img : null;
      var tip = clean(e.tip);
      return {
        theme: 'sea', kind: 'season', title: name, file: '知否知否-' + name,
        sections: sections,
        top: function (M, th) {
          var arr = [blockHead(M, th, { tag: tag, sub: headSub, right: right }), blockSpace(48)];
          arr.push(blockPersonTop(M, th, {
            name: name, subtitle: clean(subtitle), facts: facts.map(function (f) { return [f[0], clean(f[1])]; }),
            portraitCaption: pic ? clean(o.portrait.caption) : '', portraitAi: pic && o.portrait.ai ? (o.portrait.aiLabel || 'AI 生成插画') : ''
          }, pic));
          arr.push(blockSpace(34));
          arr.push(blockPara(M, th, clean(e.hook), 38, { color: th.strong, lh: 1.5, weight: 600 }));
          arr.push(blockSpace(14));
          arr.push(blockPara(M, th, clean(e.answer), 31, { color: th.body, lh: 1.75 }));
          return arr;
        },
        footer: tip ? { label: '小提示', text: cutBySentence(tip, 110) } : null,
        img: pic
      };
    },

    /* 科普长文页（干支、月份与农历、数九三伏、十二生肖）：问题 + 简答 + 每一节的要点 */
    essay: function (o) {
      var d = o.data, sections = [];
      var items = (d.sections || []).map(function (sec) {
        var first = sentences(clean((sec.body || [])[0] || ''))[0] || '';
        return clean(sec.title) + '：' + cutBySentence(first, 52);
      });
      if (items.length) sections.push({ id: 'secs', label: '这一篇讲了什么', kind: 'steps', items: items, prio: 3, keepMin: 3, drop: false });
      var pic = o.portrait && o.img ? o.img : null, tip = clean(d.tip);
      return {
        theme: 'sea', kind: 'essay', title: o.title, file: '知否知否-' + o.title,
        sections: sections,
        top: function (M, th) {
          var arr = [blockHead(M, th, { tag: '科普', sub: '时令 · ' + o.title }), blockSpace(48)];
          arr.push(blockPersonTop(M, th, {
            name: o.title, subtitle: cutBySentence(clean(d.theme), 60), facts: [],
            portraitCaption: pic ? clean(o.portrait.caption) : '', portraitAi: pic && o.portrait.ai ? (o.portrait.aiLabel || 'AI 生成插画') : ''
          }, pic));
          arr.push(blockSpace(34));
          arr.push(blockPara(M, th, clean(d.hook), 38, { color: th.strong, lh: 1.5, weight: 600 }));
          arr.push(blockSpace(14));
          arr.push(blockPara(M, th, clean(d.answer), 31, { color: th.body, lh: 1.75 }));
          return arr;
        },
        footer: tip ? { label: '小提示', text: cutBySentence(tip, 110) } : null,
        img: pic
      };
    },

    /* 神灵 / 异兽：五个页面（上古神话、神灵、道教、佛教、山海经）共用一种版式 */
    deity: function (o) {
      var c = o.c, page = o.page, ex = o.extra || null;
      function t(v) { return clean(Array.isArray(v) ? v.join('、') : v); }
      var PAGE = { shenhua: '上古神话', shenling: '民间神灵', daojiao: '道教', fojiao: '佛教', shanhai: '山海经' }[page] || '神灵';
      var kicker = '', alias = '', sub = '', line = clean(c.line), rows = [], secs = [], source = '';
      var name = c.full || c.name;
      if (page === 'shenhua') {
        kicker = c.group; rows = [['身份', t(c.role)]];
        secs = [['故事', c.story, 2], ['典故', c.allusion, 3], ['辨析', c.note, 6]]; source = c.source;
      } else if (page === 'daojiao' || page === 'fojiao') {
        kicker = c.tier || c.cat; sub = t(c.identity); alias = (c.alias && c.alias.length) ? '又称：' + c.alias.join('、') : '';
        rows = [['职司', t(c.roles)], ['关系', t(c.relation)]];
        secs = [['简介', c.body, 2], ['故事', c.story, 3], ['辨析', c.note, 6]]; source = c.source;
      } else if (page === 'shenling') {
        kicker = c.cat; alias = (c.alias && c.alias.length) ? '又称：' + c.alias.join('、') : '';
        rows = [['职司', t(c.roles)], ['场景', t(c.scene)]];
        secs = [['简介', c.body, 2], ['习俗', c.custom, 3], ['辨析', c.note, 6]]; source = c.source;
      } else if (page === 'shanhai') {
        kicker = t(c.places); rows = [['外形', t(c.look)]];
        secs = [['特点', c.feature, 2], ['含义', c.meaning, 2], ['原文', c.text, 4], ['后世', c.later, 5], ['辨析', c.note, 6]]; source = c.source;
      }
      if (ex && ex.extra) secs.splice(Math.min(secs.length, 2), 0, [ex.label || '补充', ex.extra, 3]);
      var sections = [];
      var rr_ = rows.filter(function (r) { return clean(r[1]); }).map(function (r) { return [r[0], clean(r[1])]; });
      if (rr_.length) sections.push({ id: 'rows', label: '', kind: 'rows', items: rr_, prio: 1, keepMin: rr_.length, drop: false });
      secs.forEach(function (x, i) { var tx = clean(x[1]); if (tx) sections.push({ id: 's' + i, label: x[0], kind: 'paras', items: [tx], prio: x[2], keepMin: 1, drop: x[2] >= 5, size: 31 }); });
      var pic = o.portrait && o.img ? o.img : null;
      return {
        theme: 'shen', kind: 'deity', title: name, file: '知否知否-' + c.name,
        sections: sections,
        top: function (M, th) {
          var len = Array.from(name).length, size = len <= 4 ? 140 : len <= 6 ? 116 : len <= 8 ? 96 : 76;
          var arr = [blockHead(M, th, { tag: '神灵', sub: PAGE + (kicker ? ' · ' + clean(kicker) : '') }), blockSpace(pic ? 34 : 46)];
          if (pic) { arr.push(blockBanner(M, th, pic, o.portrait.ai ? (o.portrait.aiLabel || 'AI 生成插画') : '')); arr.push(blockSpace(22)); }
          arr.push(blockTitle(M, th, name, size, CW));
          if (sub) { arr.push(blockSpace(10)); arr.push(blockPara(M, th, sub, 30, { color: th.sub, lh: 1.5 })); }
          if (alias) { arr.push(blockSpace(6)); arr.push(blockPara(M, th, alias, 27, { color: th.muted, lh: 1.5 })); }
          if (line) { arr.push(blockSpace(16)); arr.push(blockPara(M, th, line, 34, { color: th.strong, lh: 1.6 })); }
          return arr;
        },
        footer: clean(source) ? { label: '出处', text: cutBySentence(clean(source), 100) } : null,
        img: pic
      };
    },

    /* 战役、政变与起义：一句话 + 时间地点双方结果 + 起因 + 结果与影响；不放“经过”，经过请扫码 */
    event: function (o) {
      var b = o.b, F = {};
      (b.f || []).forEach(function (x) { F[x.k] = x; });
      function val(k) { return F[k] ? clean(F[k].v) : ''; }
      var isBattle = o.kind === '战役';
      var rows = [];
      if (b.timeShort) rows.push(['时间', clean(b.timeShort)]);
      if (b.placeShort) rows.push(['地点', clean(b.placeShort)]);
      var who = isBattle ? clean(b.sides || '') : clean(b.peopleShort || '');
      if (who) rows.push([isBattle ? '双方' : '人物', who]);
      if (b.result) rows.push(['结果', clean(b.result)]);
      var sections = [];
      if (rows.length) sections.push({ id: 'facts', label: '', kind: 'rows', items: rows, prio: 1, keepMin: rows.length, drop: false });
      var why = val('起因'), res = val('结果与影响'), force = val('兵力与伤亡') || val('规模与伤亡');
      if (why) sections.push({ id: 'why', label: '起因', kind: 'paras', items: [why], prio: 3, keepMin: 1, drop: false, size: 31 });
      if (res) sections.push({ id: 'res', label: '结果与影响', kind: 'paras', items: [res], prio: 2, keepMin: 1, drop: false, size: 31 });
      if (force) sections.push({ id: 'force', label: isBattle ? '兵力' : '规模', kind: 'paras', items: [force], prio: 6, keepMin: 1, drop: true, size: 28 });
      return {
        theme: 'hist', kind: 'event', noMore: true, title: b.name, file: '知否知否-' + b.name,
        sections: sections,
        top: function (M, th) {
          var len = Array.from(b.name).length, size = len <= 4 ? 140 : len <= 6 ? 120 : len <= 8 ? 100 : 80;
          var arr = [blockHead(M, th, { tag: '历史', sub: o.kind + (o.group ? ' · ' + o.group : ''), right: shortYears(b.timeShort || '') }), blockSpace(46), blockTitle(M, th, b.name, size, CW), blockSpace(20)];
          if (b.line) arr.push(blockPara(M, th, clean(b.line), 34, { color: th.strong, lh: 1.6 }));
          return arr;
        },
        footer: { label: '详细经过', text: '起因、经过、结果的完整叙述，以及兵力记载、相关人物和出处，请扫码，在网站上查看。' }
      };
    },

    /* 重点帝王（弹窗里有详细介绍的那些）：用站内已有的内容 */
    emperor: function (o) {
      var c = o.hit.card, fields = {}, row = o.row || {};
      c.f.forEach(function (f) { fields[f.k] = f; });
      function val(k) { var f = fields[k]; if (!f) return ''; if (f.items) return f.items.map(function (it) { return clean(it.ev ? (it.ev.y + it.ev.t) : it.t); }).join('；'); return clean(f.v); }
      function noDot(t) { return String(t || '').replace(/[。；，\s]+$/, ''); }
      var years = val('生卒'), reign = noDot(row.reign || val('在位')), real = noDot(row.real || val('姓名'));
      var mh = noDot(cutBySentence(clean(row.mh || ''), 30));
      var sections = [];
      var intro = val('简介');
      if (intro) sections.push({ id: 'intro', label: '简介', kind: 'paras', items: [intro], prio: 2, keepMin: 1, drop: false });
      var df = fields['主要功绩'] || fields['主要事迹'], deeds = [];
      if (df) deeds = (df.items ? df.items.map(function (it) { return clean(it.t); }) : sentences(clean(df.v))).filter(Boolean).slice(0, 4);
      if (deeds.length) sections.push({ id: 'deeds', label: '主要功绩', kind: 'steps', items: deeds, prio: 4, keepMin: 2, drop: false });
      var ef = fields['重大事件'], evs = [];
      if (ef && ef.items) evs = ef.items.filter(function (it) { return it.ev; }).map(function (it) { return [clean(it.ev.y), clean(it.ev.t)]; }).slice(0, 5);
      if (evs.length) sections.push({ id: 'events', label: '重大事件', kind: 'events', items: evs, prio: 5, keepMin: 2, drop: true });
      var judge = val('争议与评价');
      var pic = o.portrait && o.img ? o.img : null;
      var facts = [];
      if (reign) facts.push(['在位', reign]);
      if (row.nh) facts.push(['年号', noDot(cutBySentence(clean(row.nh), 44))]);
      if (mh) facts.push(['庙号', mh]);
      if (years) facts.push(['生卒', noDot(cutBySentence(years.split('；')[0], 24))]);
      return {
        theme: 'hist', kind: 'emperor', title: c.name, file: '知否知否-' + c.name,
        sections: sections,
        top: function (M, th) {
          var arr = [blockHead(M, th, { tag: '历史', sub: o.dynName + ' · 帝王', right: shortYears(reign) }), blockSpace(48)];
          arr.push(blockPersonTop(M, th, {
            name: c.name, subtitle: real, facts: facts,
            portraitCaption: pic ? clean(o.portrait.caption) : '', portraitAi: pic && o.portrait.ai ? (o.portrait.aiLabel || 'AI 生成插画') : ''
          }, pic));
          return arr;
        },
        footer: judge ? { label: '争议与评价', text: cutBySentence(judge, 110) } : null,
        img: pic
      };
    },

    /* 名单里的普通帝王：用卡片专用的补充内容（data/sharecard-diwang.js） */
    emperorLite: function (o) {
      var e = o.row, p = o.parts || [], sections = [];
      function add(id, label, t, prio) { t = clean(t); if (t) sections.push({ id: id, label: label, kind: 'paras', items: [t], prio: prio, keepMin: 1, drop: false, size: 32 }); }
      add('line', '概述', e.line, 2);
      add('who', '身世', p[0], 3);
      add('deeds', '事迹', p[1], 4);
      add('end', '结局', p[2], 3);
      var facts = [];
      if (e.reign) facts.push(['在位', clean(e.reign)]);
      if (e.nh) facts.push(['年号', cutBySentence(clean(e.nh), 44).replace(/[。；，\s]+$/, '')]);
      if (e.mh) facts.push(['庙号', cutBySentence(clean(e.mh), 40).replace(/[。；，\s]+$/, '')]);
      return {
        theme: 'hist', kind: 'emperor', title: e.name, file: '知否知否-' + e.name,
        sections: sections,
        top: function (M, th) {
          var arr = [blockHead(M, th, { tag: '历史', sub: o.dynName + ' · 帝王', right: shortYears(e.reign) }), blockSpace(48)];
          arr.push(blockPersonTop(M, th, { name: e.name, subtitle: clean(e.real || ''), facts: facts }, null));
          return arr;
        },
        footer: null
      };
    },

    /* 一览卡：把内容太少、不够单独成卡的帝王合在一张表里 */
    roll: function (o) {
      var c = o.card;
      var read = clean(c.read || '').replace(/扫码[^。]*。?$/, '');
      var rows = c.rows.map(function (r) { return { name: r.name, rel: clean(r.rel), note: clean(r.note || r.tag || '') }; });
      var sections = [{ id: 'roll', label: '', kind: 'roll', items: rows, prio: 1, keepMin: rows.length, drop: false, rollLayout: c.layout }];
      if (read) sections.push({ id: 'read', label: '', kind: 'paras', items: [read], prio: 9, keepMin: 1, drop: true, size: 28 });
      return {
        theme: 'hist', kind: 'roll', title: c.title, file: '知否知否-' + c.title,
        sections: sections,
        top: function (M, th) {
          var len = Array.from(c.title).length, size = len <= 4 ? 130 : len <= 6 ? 110 : len <= 9 ? 90 : 72;
          var arr = [blockHead(M, th, { tag: '历史', sub: c.sub, right: c.range }), blockSpace(46), blockTitle(M, th, c.title, size, CW), blockSpace(16)];
          arr.push(blockPara(M, th, clean(c.intro), 30, { color: th.sub, lh: 1.6 }));
          return arr;
        },
        footer: null
      };
    },

    poem: function (o) {
      var w = o.work, poet = o.ctx.poet, orig = (w.original || []).map(clean).filter(Boolean);
      var chars = orig.join('').length, long = chars > 150;
      var mj = long ? (o.mingju || null) : null;
      var lines = orig, intro = clean(w.note);
      /* 讲解只取前面的“创作背景/大意”几段，去掉“艺术特点与历史地位”等长评；每段按整句截短 */
      var pieces = String(w.note || '').split(/\n+/).filter(function (t) { return t && !/^(艺术特点|作品意义|历史地位|阅读边界|版本)/.test(t); })
        .map(function (t) { return clean(t).replace(/^(创作背景|创作时间|大意|作品大意)[：:]/, function (m) { return /^创作时间/.test(m) ? '创作时间：' : ''; }); }).filter(Boolean);
      var noteArr = [], budget = 170;
      pieces.slice(0, 3).forEach(function (t) { if (budget < 30) return; var c = cutBySentence(t, budget); noteArr.push(c); budget -= c.length; });
      var noteLabel = o.pageName === '元曲' ? '说明' : '诗意';
      var note = intro, sections = [];
      if (long) {
        if (mj && mj.length) {
          sections.push({ id: 'mj', label: '名句', kind: 'poem', items: mj, prio: 2, keepMin: 2, drop: false, size: 38 });
        } else {
          sections.push({ id: 'mj', label: '节选', kind: 'poem', items: orig.slice(0, 6), prio: 2, keepMin: 2, drop: false, size: 38 });
        }
        if (note) sections.push({ id: 'note', label: noteLabel, kind: 'paras', items: noteArr.length ? noteArr : [cutBySentence(note, 150)], prio: 4, keepMin: 1, drop: false });
        sections.push({ id: 'more', label: '', kind: 'paras', items: [(o.pageName === '元曲' || o.pageName === '楚辞' || o.pageName === '诗经' ? '全文约 ' : '全诗约 ') + chars + ' 字，读全文和逐句讲解，请扫码到网站上看。'], prio: 9, keepMin: 1, drop: true, size: 26 });
      } else {
        var size = orig.length >= 11 ? 30 : orig.length >= 9 ? 34 : 40;
        sections.push({ id: 'poem', label: '', kind: 'poem', items: orig, prio: 1, keepMin: orig.length, drop: false, size: size });
        if (note) sections.push({ id: 'note', label: '讲解', kind: 'paras', items: noteArr.length ? noteArr : [note], prio: 4, keepMin: 1, drop: false });
        if (w.trans) sections.push({ id: 'trans', label: '白话', kind: 'paras', items: [clean(w.trans)], prio: 6, keepMin: 1, drop: true });
      }
      var life = clean(poet.life || '');
      return {
        theme: 'lit', kind: 'poem', title: w.title, file: '知否知否-' + w.title,
        sections: sections,
        top: function (M, th) {
          var arr = [blockHead(M, th, { tag: '文学', sub: o.pageName + (o.ctx.era ? ' · ' + o.ctx.era : '') }), blockSpace(54)];
          var len = Array.from(w.title).length, size = len <= 4 ? 150 : len <= 6 ? 120 : len <= 9 ? 96 : 76;
          arr.push(blockTitle(M, th, w.title, size, CW));
          setFont(M, 30, 400);
          var sub = poet.name + (w.form ? '　' + w.form : '');
          arr.push(blockSpace(16));
          arr.push(blockPara(M, th, sub, 31, { color: th.sub, lh: 1.5 }));
          return arr;
        },
        footer: life ? { label: (o.pageName === '诗经' || o.pageName === '楚辞' ? '这一组' : o.pageName === '汉魏诗' ? '简介' : '诗人小传'), text: cutBySentence(life, 110) } : null
      };
    },

    /* 二十八宿：一宿 / 一象 / 中宫（三垣） */
    xiu: function (o) {
      var D = o.D, pic = o.portrait && o.img ? o.img : null, sections = [], title, sub, line;
      var mis = (D.misreads || [])[0];
      var footer = mis ? { label: '常见误读', text: cutBySentence(clean(mis.title + '：' + mis.text), 110) } : null;
      function addRows(rows) { rows = rows.filter(function (r) { return r[1]; }); if (rows.length) sections.push({ id: 'rows', label: '', kind: 'rows', items: rows, prio: 1, keepMin: rows.length, drop: false }); }
      function addPara(id, label, text, prio, drop) { text = clean(text); if (text) sections.push({ id: id, label: label, kind: 'paras', items: [text], prio: prio, keepMin: 1, drop: drop !== false, size: 31 }); }
      if (o.kind === 'xiu') {
        var x = o.x, b = o.b;
        title = x.name + '宿'; sub = b.dir + '方' + b.name + ' · 第' + (b.xiu.indexOf(x.name) + 1) + '宿'; line = clean(x.note);
        addRows([['意象', clean(x.image)], ['天区', clean(x.sky)]]);
        addPara('ext', '延伸', x.ext, 3, true);
        addPara('beast', '所属四象', b.focus, 4, true);
      } else if (o.kind === 'beast') {
        var q = o.b, fs = sentences(clean(q.focus));
        title = q.name; sub = q.dir + '方 · ' + q.season + ' · ' + q.color + '色'; line = fs[0] || '';
        addRows([['七宿', q.xiu.join('、')]]);
        addPara('rest', '', fs.slice(1).join(''), 2, false);
        addPara('ans', '二十八宿是什么', D.answer, 3, true);
      } else {
        var cs = sentences(clean(D.center.text));
        title = D.center.title; sub = '圆圈中间的北天'; line = cs[0] || '';
        addPara('rest', '', cs.slice(1).join(''), 2, false);
        addPara('ans', '二十八宿是什么', D.answer, 3, true);
      }
      return {
        theme: 'shen', kind: 'xiu', title: title, file: '知否知否-' + title, sections: sections,
        top: function (M, th) {
          var len = Array.from(title).length, size = len <= 4 ? 140 : len <= 6 ? 116 : 96;
          var arr = [blockHead(M, th, { tag: '神灵', sub: '二十八宿 · ' + sub }), blockSpace(pic ? 34 : 46)];
          if (pic) { arr.push(blockBanner(M, th, pic, o.portrait.ai ? (o.portrait.aiLabel || 'AI 生成插画') : '')); arr.push(blockSpace(22)); }
          arr.push(blockTitle(M, th, title, size, CW));
          if (line) { arr.push(blockSpace(18)); arr.push(blockPara(M, th, line, 34, { color: th.strong, lh: 1.6 })); }
          return arr;
        },
        footer: footer, img: pic
      };
    },

    /* 典籍：一本书一张卡 */
    book: function (o) {
      var d = o.d, sections = [];
      var rows = (d.info || []).filter(function (r) { return r[0] && !/^(书名与别名|分类|作者)$/.test(r[0]); }).slice(0, 3)
        .map(function (r) { return [{ '成书年代': '年代', '体裁与性质': '体裁', '卷篇规模': '规模' }[r[0]] || r[0].slice(0, 3), cutBySentence(clean(r[1]), 40).replace(/[；，、\s]+$/, '')]; }).filter(function (r) { return r[1]; });
      if (rows.length) sections.push({ id: 'rows', label: '', kind: 'rows', items: rows, prio: 1, keepMin: Math.min(2, rows.length), drop: false });
      var sm = clean((d.summary || [])[0]); if (sm) sections.push({ id: 'sum', label: '内容概要', kind: 'paras', items: [cutBySentence(sm, 130).replace(/[；，、\s]+$/, '。')], prio: 2, keepMin: 1, drop: false, size: 31 });
      var wy = clean((d.why || [])[0]); if (wy) sections.push({ id: 'why', label: '为什么重要', kind: 'paras', items: [cutBySentence(wy, 150)], prio: 3, keepMin: 1, drop: true, size: 31 });
      var qs = (d.quotes || []).map(function (t) { return cutBySentence(clean(t), 58); }).filter(Boolean).slice(0, 4);
      if (qs.length) sections.push({ id: 'quotes', label: '名句与典故', kind: 'steps', items: qs, prio: 4, keepMin: 2, drop: true });
      var sel = (d.selections || [])[0];
      if (sel && sel.o) sections.push({ id: 'sel', label: '代表性选段', kind: 'paras', items: [cutBySentence(clean(sel.o), 80) + '——' + clean(sel.t)], prio: 5, keepMin: 1, drop: true, size: 31 });
      var my = clean((d.myths || [])[0]);
      var title = d.title, line = clean(d.line);
      return {
        theme: 'dj', kind: 'book', title: title, file: '知否知否-' + title.replace(/[《》]/g, ''), sections: sections,
        top: function (M, th) {
          var len = Array.from(title).length, size = len <= 4 ? 140 : len <= 6 ? 116 : len <= 8 ? 96 : 76;
          var arr = [blockHead(M, th, { tag: '典籍', sub: o.catName + (d.dyn ? ' · ' + d.dyn : '') }), blockSpace(46)];
          arr.push(blockTitle(M, th, title, size, CW));
          if (d.auth) { arr.push(blockSpace(10)); arr.push(blockPara(M, th, clean(d.auth), 30, { color: th.sub, lh: 1.5 })); }
          if (line) { arr.push(blockSpace(18)); arr.push(blockPara(M, th, cutBySentence(line, 120), 34, { color: th.strong, lh: 1.6 })); }
          return arr;
        },
        footer: my ? { label: '常见误区', text: cutBySentence(my, 110) } : null, img: null
      };
    },

    /* 都城：一座城市一张卡 */
    city: function (o) {
      var c = o.c, sections = [];
      function fv(k) { for (var i = 0; i < c.f.length; i++) if (c.f[i].k === k) return c.f[i].v || ''; return ''; }
      function short(s, n) { s = clean(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
      var sc = c.sc || { dyn: [], ln: [], ev: [] };
      var nreg = sc.dyn.length;
      var rows = [['今地', short(c.place, 22)]];
      if (nreg) rows.push(['定都', nreg + '个时期或政权']);
      if (rows.length) sections.push({ id: 'rows', label: '', kind: 'rows', items: rows, prio: 1, keepMin: rows.length, drop: false });
      if (nreg) sections.push({ id: 'dyn', label: '历代定都', kind: 'dyn', items: sc.dyn.map(function (d) { return [d[0], d[1]]; }), prio: 2, keepMin: Math.min(nreg, 5), drop: false });
      if (sc.ln.length) sections.push({ id: 'ln', label: '', kind: 'rows', items: sc.ln.map(function (d) { return [d[0], d[1]]; }), prio: 3, keepMin: sc.ln.length, drop: false });
      if (sc.ev.length) sections.push({ id: 'ev', label: '重要大事', kind: 'events', items: sc.ev.map(function (d) { return [d[0], d[1]]; }), prio: 3, keepMin: Math.min(sc.ev.length, 3), drop: false });
      function eras(v) {   /* 一座城市有几个时期时，文字用【时期】分段 */
        return String(v || '').split(/(?=【[^】]{1,20}】)/).filter(function (x) { return x.trim(); }).map(function (p) {
          var m = /^【([^】]+)】([\s\S]*)$/.exec(p.trim());
          return m ? { l: m[1].split('·')[0], t: m[2] } : { l: '', t: p };
        });
      }
      function addEras(id, label, v, total, prio, drop, xz) {
        var es = eras(v), items = es.map(function (e) {
          var t = e.t;
          if (xz) { var mm = /考古所见——([\s\S]*)$/.exec(t); t = mm ? mm[1] : t.replace(/^文献记载——/, ''); }
          t = clean(t); if (!t) return '';
          var n = es.length > 1 ? Math.floor(total / es.length) : total;
          return (es.length > 1 && e.l ? e.l + '：' : '') + cutBySentence(t, n).replace(/[；，、\s]+$/, '。');
        }).filter(Boolean);
        if (items.length) sections.push({ id: id, label: label, kind: 'paras', items: items, prio: prio, keepMin: 1, drop: drop, size: 31 });
      }
      addEras('xz', '城市形制', fv('城市形制'), 120, 6, true, true);
      addEras('qs', '迁都与兴衰', fv('迁都与兴衰'), 130, 5, true, false);
      addEras('jz', '遗址与今日', fv('遗址与今日'), 100, 7, true, false);
      var title = c.show || c.name, line = clean(c.line);
      return {
        theme: 'hist', kind: 'city', title: title, file: '知否知否-都城-' + c.name, sections: sections,
        top: function (M, th) {
          var len = Array.from(title).length, size = len <= 3 ? 150 : len <= 5 ? 126 : len <= 8 ? 100 : 80;
          var arr = [blockHead(M, th, { tag: '都城', sub: o.groupName || '' }), blockSpace(46)];
          arr.push(blockTitle(M, th, title, size, CW));
          if (line) { arr.push(blockSpace(18)); arr.push(blockPara(M, th, cutBySentence(line, 90), 34, { color: th.strong, lh: 1.6 })); }
          return arr;
        },
        footer: sc.ln.length ? { label: '说明', text: '年数按所列起止年份粗算，期间可能有中断；城市名为古今通称。' } : null, img: null
      };
    },

    /* 陵墓：一座墓（或墓地）一张卡 */
    tomb: function (o) {
      var d = o.d, sections = [];
      function lm(t) { return clean(String(t == null ? '' : t).replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, '$1').replace(/\*\*/g, '')); }
      function short(s, n) { s = lm(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
      function info(re) { for (var i = 0; i < (d.info || []).length; i++) if (re.test(d.info[i][0])) return d.info[i][1]; return ''; }
      function sec(re) { for (var i = 0; i < (d.secs || []).length; i++) if (re.test(d.secs[i].h)) return d.secs[i]; return null; }
      function text(s) { return s ? lm((s.els || []).filter(function (e) { return e.k === 'p'; }).map(function (e) { return e.x; }).join('')) : ''; }
      var rows = [['年代', short(cutBySentence(lm(info(/^所属时代/)), 40).replace(/[；，、。\s]+$/, ''), 32)], ['地点', short(info(/^所在地/), 26)], ['类型', short(cutBySentence(lm(info(/^类型/)), 40).replace(/[；，、。\s]+$/, ''), 36)]].filter(function (r) { return r[1]; });
      if (rows.length) sections.push({ id: 'rows', label: '', kind: 'rows', items: rows, prio: 1, keepMin: Math.min(2, rows.length), drop: false });
      var bg = text(sec(/^墓主与历史背景/)); if (bg) sections.push({ id: 'bg', label: '墓主与背景', kind: 'paras', items: [cutBySentence(bg, 150).replace(/[；，、\s]+$/, '。')], prio: 2, keepMin: 1, drop: false, size: 31 });
      var zs = text(sec(/^陵墓与葬制/)); if (zs) sections.push({ id: 'zs', label: '陵墓与葬制', kind: 'paras', items: [cutBySentence(zs, 130).replace(/[；，、\s]+$/, '。')], prio: 3, keepMin: 1, drop: true, size: 31 });
      var cw = sec(/^主要出土文物/);
      if (cw) {
        var names = (cw.els || []).filter(function (e) { return e.k === 'n' && e.l; }).map(function (e) { return lm(e.l); }).slice(0, 6);
        if (names.length) sections.push({ id: 'cw', label: '代表文物', kind: 'paras', items: [names.join('、') + '。'], prio: 4, keepMin: 1, drop: true, size: 31 });
      }
      var jz = text(sec(/^历史价值/)); if (jz) sections.push({ id: 'jz', label: '历史价值', kind: 'paras', items: [cutBySentence(jz, 110).replace(/[；，、\s]+$/, '。')], prio: 5, keepMin: 1, drop: true, size: 31 });
      var my = sec(/^常见误区/), mye = my && (my.els || []).filter(function (e) { return e.k === 'b' && e.l; })[0];
      var myt = mye ? cutBySentence(lm(mye.l.replace(/^(误区|传闻)[：:]\s*/, '') + '——' + String(mye.x).replace(/^事实[：:]\s*/, '')), 110) : '';
      var title = d.title, line = lm(d.line);
      return {
        theme: 'hist', kind: 'tomb', title: title, file: '知否知否-陵墓-' + title, sections: sections,
        top: function (M, th) {
          var len = Array.from(title).length, size = len <= 4 ? 140 : len <= 6 ? 116 : len <= 9 ? 94 : 76;
          var arr = [blockHead(M, th, { tag: '陵墓', sub: (o.grpName ? o.grpName + ' · ' : '') + (d.dyn || '') }), blockSpace(46)];
          arr.push(blockTitle(M, th, title, size, CW));
          if (line) { arr.push(blockSpace(18)); arr.push(blockPara(M, th, cutBySentence(line, 100), 34, { color: th.strong, lh: 1.6 })); }
          return arr;
        },
        footer: myt ? { label: '常见误区', text: myt } : null, img: null
      };
    },

    /* 名著：一部书一张卡 */
    novel: function (o) {
      var sec = o.sec, B = sec.blocks || [], sections = [];
      function blk(re, type) { for (var i = 0; i < B.length; i++) if (B[i].type === type && re.test(B[i].heading || '')) return B[i]; return null; }
      var line = clean(String((B[0] && B[0].text) || '').replace(/^一句话[：:]\s*/, ''));
      var intro = clean((B[1] && B[1].type === 'para') ? B[1].text : '');
      var m = /^(《[^》]+》)[：:](.*)$/.exec(sec.title), big = m ? m[1] : sec.title, tail = m ? m[2] : '';
      if (intro) sections.push({ id: 'intro', label: '内容概述', kind: 'paras', items: [cutBySentence(intro, 160)], prio: 2, keepMin: 1, drop: false, size: 31 });
      var bg = blk(/成书背景/, 'facts');
      if (bg) {
        var rr = bg.items.slice(0, 3).map(function (it) { return clean(it.term) + '：' + cutBySentence(clean(it.note), 100); }).filter(Boolean);
        if (rr.length) sections.push({ id: 'bg', label: '成书背景', kind: 'steps', items: rr, prio: 3, keepMin: 2, drop: true });
      }
      var th_ = blk(/主题/, 'works');
      if (th_) {
        var tt = th_.items.slice(0, 4).map(function (it) { return clean(it.name) + '：' + cutBySentence(clean(it.note), 44); });
        if (tt.length) sections.push({ id: 'theme', label: '主题', kind: 'steps', items: tt, prio: 4, keepMin: 2, drop: true });
      }
      var al = blk(/成语|名句|说法/, 'allusions');
      if (al) {
        var aa = al.items.slice(0, 5).map(function (it) { var t = clean(it.term), n = clean(it.note); return t === n || !n ? cutBySentence(t, 56) : t + '：' + cutBySentence(n, 40); }).filter(Boolean);
        if (aa.length) sections.push({ id: 'al', label: '常用说法', kind: 'steps', items: aa, prio: 5, keepMin: 2, drop: true });
      }
      var rm = blk(/阅读提醒|误区/, 'allusions'), foot = null;
      if (rm && rm.items[0]) { var t0 = clean(rm.items[0].term), n0 = clean(rm.items[0].note); foot = { label: '阅读提醒', text: cutBySentence(/^误区$/.test(t0) || !n0 ? (n0 || t0) : t0 + '：' + n0, 120) }; }
      return {
        theme: 'lit', kind: 'novel', title: big, file: '知否知否-' + big.replace(/[《》]/g, ''), sections: sections,
        top: function (M, th) {
          var len = Array.from(big).length, size = len <= 4 ? 140 : len <= 6 ? 116 : len <= 8 ? 96 : 76;
          var arr = [blockHead(M, th, { tag: '名著', sub: '古典小说 · ' + sec.label }), blockSpace(46)];
          arr.push(blockTitle(M, th, big, size, CW));
          if (tail) { arr.push(blockSpace(10)); arr.push(blockPara(M, th, tail, 30, { color: th.sub, lh: 1.5 })); }
          if (line) { arr.push(blockSpace(18)); arr.push(blockPara(M, th, line, 34, { color: th.strong, lh: 1.6 })); }
          return arr;
        },
        footer: foot, img: null
      };
    },

    /* 字语（汉字、词语、称谓、万物、颜色、数字六页）：一张条目卡一张图 */
    zy: function (o) {
      var it = o.item, F = {}, order = [];
      (it.f || []).forEach(function (p) {
        var v = Array.isArray(p[1]) ? p[1].join('；') : String(p[1] == null ? '' : p[1]);
        v = clean(v); if (!v) return;
        if (F[p[0]]) F[p[0]] += '；' + v; else { F[p[0]] = v; order.push(p[0]); }
      });
      var strongKey = null;
      ['一句话解释', '一句话', '好记版', '意思', '合起来', '说明', '原来是'].forEach(function (k) { if (!strongKey && F[k]) strongKey = k; });
      var line = strongKey ? F[strongKey] : '';
      var used = { '把握程度': 1, '分组': 1 }; if (strongKey) used[strongKey] = 1;
      var sections = [], foot = null;
      var pairA = strongKey !== '原来是' && F['原来是'] && F['现在是'] ? [['原来是', cutBySentence(F['原来是'], 70)], ['现在是', cutBySentence(F['现在是'], 70)]] : null;
      if (pairA) { sections.push({ id: 'pair', label: '', kind: 'rows', items: pairA, prio: 1, keepMin: 2, drop: false }); used['原来是'] = used['现在是'] = 1; }
      else if (strongKey === '原来是' && F['现在是']) { sections.push({ id: 'pair', label: '', kind: 'rows', items: [['现在是', cutBySentence(F['现在是'], 90)]], prio: 1, keepMin: 1, drop: false }); used['现在是'] = 1; }
      var color = [];
      ['近似色', '色感'].forEach(function (k) { if (F[k]) { color.push([k, cutBySentence(F[k], 60)]); used[k] = 1; } });
      if (color.length) sections.push({ id: 'color', label: '', kind: 'rows', items: color, prio: 1, keepMin: color.length, drop: false });
      if (F['拆字']) {
        var cr = F['拆字'].split(/[。；]/).map(function (x) { var i = x.indexOf('｜'); return i > 0 ? [x.slice(0, i), x.slice(i + 1)] : null; }).filter(Boolean).slice(0, 4);
        if (cr.length) sections.push({ id: 'chars', label: '拆开看', kind: 'rows', items: cr, prio: 1, keepMin: cr.length, drop: false });
        used['拆字'] = 1;
      }
      if (F['提醒']) { foot = { label: '提醒', text: cutBySentence(F['提醒'], 110) }; used['提醒'] = 1; }
      var PR = { '常见误解': 3, '为什么这样设定': 2, '数字对应': 2, '更准确': 2, '本义': 2, '常见用法': 3, '例子': 3, '出处': 5, '原文': 4 };
      order.forEach(function (k) {
        if (used[k]) return;
        var pr = PR[k] || 4;
        sections.push({ id: 'k' + k, label: k, kind: 'paras', items: [cutBySentence(k === '出处' ? F[k].split('◆')[0] : F[k], 150)], prio: pr, keepMin: 1, drop: pr >= 4, size: 31 });
      });
      var title = it.name;
      return {
        theme: 'sea', kind: 'zy', title: title, file: '知否知否-' + title.replace(/[《》\/\\:*?"<>|]/g, ''), sections: sections,
        top: function (M, th) {
          var len = Array.from(title).length, size = len <= 4 ? 140 : len <= 6 ? 116 : len <= 8 ? 96 : 76;
          var subTxt = o.page + (o.sec ? ' · ' + o.sec : ''); if (Array.from(subTxt).length > 15) subTxt = Array.from(subTxt).slice(0, 15).join('');
          var arr = [blockHead(M, th, { tag: '字语', sub: subTxt }), blockSpace(46)];
          arr.push(blockTitle(M, th, title, size, CW));
          if (line) { arr.push(blockSpace(18)); arr.push(blockPara(M, th, cutBySentence(line, 120), 36, { color: th.strong, lh: 1.6, weight: 600 })); }
          return arr;
        },
        footer: foot, img: null
      };
    }
  };

  /* ---------- 生成并显示 ---------- */
  var ui = null;
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }

  function buildUI() {
    var overlay = el('div', 'sc-overlay'); overlay.setAttribute('aria-hidden', 'true');
    var box = el('div', 'sc-box'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', '分享卡片');
    var close = el('button', 'sc-close', '×'); close.type = 'button'; close.setAttribute('aria-label', '关闭');
    var stage = el('div', 'sc-stage');
    var msg = el('div', 'sc-msg', '正在生成卡片…');
    var img = el('img', 'sc-img'); img.alt = '分享卡片'; img.hidden = true;
    stage.appendChild(msg); stage.appendChild(img);
    var hint = el('p', 'sc-hint', '');
    var bar = el('div', 'sc-bar');
    var saveBtn = el('button', 'sc-act', '保存图片'); saveBtn.type = 'button';
    var shareBtn = el('button', 'sc-act sc-act-main', '发送给朋友'); shareBtn.type = 'button';
    bar.appendChild(saveBtn); bar.appendChild(shareBtn);
    box.appendChild(close); box.appendChild(stage); box.appendChild(hint); box.appendChild(bar);
    overlay.appendChild(box); document.body.appendChild(overlay);
    function hide() {
      overlay.classList.remove('is-open'); overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('sc-noscroll');
      if (ui.url) { try { URL.revokeObjectURL(ui.url); } catch (e) { /* 忽略 */ } ui.url = null; }
      ui.token++;
    }
    close.addEventListener('click', hide);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) hide(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('is-open')) hide(); });
    ui = { overlay: overlay, msg: msg, img: img, hint: hint, saveBtn: saveBtn, shareBtn: shareBtn, bar: bar, url: null, token: 0, blob: null, file: '', hide: hide };
    saveBtn.addEventListener('click', function () {
      if (!ui.blob) return;
      var a = document.createElement('a'); a.href = ui.url; a.download = ui.file + '.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    });
    shareBtn.addEventListener('click', function () {
      if (!ui.blob) return;
      try {
        var f = new File([ui.blob], ui.file + '.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: '知否知否' }).catch(function () { /* 用户取消 */ }); return; }
      } catch (e) { /* 走下面的提示 */ }
      ui.hint.textContent = '这个浏览器不能直接发送，请点“保存图片”，再从相册发给朋友。';
    });
    return ui;
  }
  function isWeChat() { return /MicroMessenger/i.test(navigator.userAgent || ''); }
  function canShareFiles() {
    try { var f = new File([new Blob(['x'])], 'a.png', { type: 'image/png' }); return !!(navigator.canShare && navigator.canShare({ files: [f] })); } catch (e) { return false; }
  }

  function loadImage(src) {
    return new Promise(function (res) {
      var im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = function () { res(im); }; im.onerror = function () { res(null); };
      im.src = src;
    });
  }
  function ensureFonts(textSample) {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var t = Array.from(new Set(Array.from(textSample + '历史帝王一览世系概述身世事迹结局重大事件争议与评价简介主要功绩在位年号庙号谥号生卒'))).join('').slice(0, 1600);
    return withTimeout(Promise.all([
      document.fonts.load('400 30px "Noto Serif SC"', t), document.fonts.load('600 30px "Noto Serif SC"', t),
      document.fonts.load('400 48px "Ma Shan Zheng"', t + '知否知否扫码看详情后世评价主要事迹')
    ]), 5000);
  }
  function ensureQR() {
    if (window.qrcode) return Promise.resolve();
    return loadScript('js/qrcode.min.js');
  }
  var mjPromise = null;
  function ensureMingju() {
    if (window.ZHIFOU_SHARE_EXTRA) return Promise.resolve(window.ZHIFOU_SHARE_EXTRA);
    if (!mjPromise) mjPromise = withTimeout(loadScript('data/sharecard-extra.js').then(function () { return window.ZHIFOU_SHARE_EXTRA || null; }), 6000);
    return mjPromise;
  }

  var shPromise = null;
  function ensureShen() {
    if (window.ZHIFOU_SHARE_SHEN) return Promise.resolve(window.ZHIFOU_SHARE_SHEN);
    if (!shPromise) shPromise = withTimeout(loadScript('data/sharecard-shenling.js').then(function () { return window.ZHIFOU_SHARE_SHEN || null; }), 6000).catch(function () { return null; });
    return shPromise;
  }
  var dwPromise = null;
  function ensureDiwang() {
    if (window.ZHIFOU_SHARE_DIWANG) return Promise.resolve(window.ZHIFOU_SHARE_DIWANG);
    if (!dwPromise) dwPromise = withTimeout(loadScript('data/sharecard-diwang.js').then(function () { return window.ZHIFOU_SHARE_DIWANG || null; }), 8000);
    return dwPromise;
  }

  function open(job) {
    /* job: { type, o, url, needMingju } */
    if (!ui) buildUI();
    var my = ++ui.token;
    ui.msg.hidden = false; ui.msg.textContent = '正在生成卡片…'; ui.img.hidden = true; ui.hint.textContent = ''; ui.bar.hidden = true; ui.blob = null;
    if (ui.url) { try { URL.revokeObjectURL(ui.url); } catch (e) { /* 忽略 */ } ui.url = null; }
    ui.overlay.classList.add('is-open'); ui.overlay.setAttribute('aria-hidden', 'false'); document.body.classList.add('sc-noscroll');
    var fail = function (e) { if (my !== ui.token) return; ui.msg.hidden = false; ui.msg.textContent = '卡片生成失败，请稍后再试。'; try { console.warn('[sharecard]', e); } catch (x) { /* 忽略 */ } };
    var pre = [ensureQR(), job.needMingju ? ensureMingju() : job.needDiwang ? ensureDiwang() : job.needShen ? ensureShen() : Promise.resolve(null), job.o.portrait ? withTimeout(loadImage(job.o.portrait.src), 8000) : Promise.resolve(null)];
    Promise.all(pre).then(function (r) {
      if (my !== ui.token) return;
      var extra = r[1], img = r[2];
      if (job.type === 'poem') {
        var key = job.o.pageName + '|' + job.o.ctx.poet.name + '|' + job.o.work.title;
        job.o.mingju = extra && extra.mingju && extra.mingju[key] ? extra.mingju[key] : null;
      }
      if (job.type === 'deity') {
        var exk = { shenhua: '上古神话人物', daojiao: '道教神灵', fojiao: '佛教人物', shanhai: '山海经异兽' }[job.o.page];
        job.o.extra = exk && extra && extra.extra ? (extra.extra[exk + '|' + job.o.c.name] || null) : null;
      }
      if (job.type === 'emperorLite') {
        if (!extra) throw new Error('no diwang data');
        var kk = job.o.key, parts = extra.cards && extra.cards[kk], cid = extra.index && extra.index[kk];
        if (parts) job.o.parts = parts;
        else if (cid) { job.type = 'roll'; job.o.card = extra.rolls.filter(function (x) { return x.id === cid; })[0]; }
        else throw new Error('no data for ' + kk);
      }
      job.o.img = img;
      var spec = TYPES[job.type](job.o);
      var sample = spec.title + JSON.stringify(spec.sections.map(function (s) { return s.items; })) + (spec.footer ? spec.footer.text : '');
      return ensureFonts(sample).then(function () {
        if (my !== ui.token) return;
        var qr = window.qrcode(0, 'M'); qr.addData(job.url); qr.make();
        var out = render(spec, qr, img);
        return new Promise(function (res) { out.canvas.toBlob(function (b) { res({ blob: b, spec: spec, out: out }); }, 'image/png'); });
      });
    }).then(function (r) {
      if (!r || my !== ui.token) return;
      if (!r.blob) throw new Error('toBlob failed');
      ui.blob = r.blob; ui.file = r.spec.file; ui.url = URL.createObjectURL(r.blob);
      ui.img.src = ui.url; ui.img.hidden = false; ui.msg.hidden = true; ui.bar.hidden = false;
      var wx = isWeChat(), can = canShareFiles();
      ui.shareBtn.hidden = !can || wx;
      ui.hint.textContent = wx ? '在微信里：长按上面的图片，可以保存到手机或发送给朋友、分享到朋友圈。' : (can ? '' : '点“保存图片”，再从相册发给朋友。');
      ui.saveBtn.hidden = wx;
      ui.overlay.querySelector('.sc-stage').scrollTop = 0;
      ui.last = { w: r.out.canvas.width, h: r.out.canvas.height, trimmed: r.out.layout.trimmed, overflow: r.out.layout.overflow, text: r.spec.title + JSON.stringify(r.spec.sections) + (r.spec.footer ? r.spec.footer.text : '') };
    }).catch(fail);
  }

  /* ---------- 按钮 ---------- */
  /* 站内配图登记表（data/images.js）里的一张图：返回 900 宽的地址和图注 */
  function imageInfo(kind, name) {
    var I = window.ZHIFOU_IMAGES, info = I && I.items && I.items[kind + '/' + name];
    if (!info) return null;
    var c = (info.crop && info.crop < 1) ? 'c_crop,g_center,h_' + info.crop + ',w_' + info.crop + '/' : '';
    return { src: I.base + c + 'c_limit,w_900/f_auto,q_auto/v' + info.v + '/' + info.id, caption: info.caption || '', ai: !!info.ai, aiLabel: I.aiLabel || 'AI 生成插画' };
  }
  function mkRow(onClick, cls) {
    /* 小号“分享”按钮：放在弹窗右上角、关闭“×”的左边，不占正文位置 */
    var b = el('button', cls || 'sc-corner');
    b.type = 'button';
    b.setAttribute('aria-label', '分享卡片：把这一条做成图片，分享给朋友');
    b.title = '分享卡片';
    b.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M7.5 7.5L12 3l4.5 4.5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg><span>分享</span>';
    b.addEventListener('click', onClick);
    return b;
  }
  function pageUrl(q) {
    var u = new URL(location.href); u.hash = '';
    u.search = '';
    Object.keys(q).forEach(function (k) { u.searchParams.set(k, q[k]); });
    return u.toString();
  }

  var POEM_PAGES = { tangshi: '唐诗', songci: '宋词', shijingpian: '诗经', chuci: '楚辞', qingci: '清词', hanweishi: '汉魏诗', yuanqu: '元曲' };

  /* 字语六页：页面标记 → 数据变量、页面名 */
  var ZY_PAGES = {
    hanzi: { v: 'ZHIFOU_ZY_HANZI', n: '汉字' }, ciyu: { v: 'ZHIFOU_ZY_CIYU', n: '词语' }, chengwei: { v: 'ZHIFOU_ZY_CHENGWEI', n: '称谓' },
    wanwu: { v: 'ZHIFOU_ZY_WANWU', n: '万物' }, yanse: { v: 'ZHIFOU_ZY_YANSE', n: '颜色' }, shuzi: { v: 'ZHIFOU_ZY_SHUZI', n: '数字' }
  };
  var ZY_STRONG = ['一句话解释', '一句话', '好记版', '意思', '合起来', '说明', '原来是'];
  /* 在数据里找到这张卡对应的条目；同名有几条时，用卡片上的小标题对一对。条目没有“一句话”这类主句、或整条待核的不做卡 */
  function findZyItem(D, o) {
    var cands = [];
    D.sections.forEach(function (sec) {
      (sec.items || []).forEach(function (it) { if (it.name === o.name && it.f && it.f.length) cands.push({ sec: sec.title, item: it }); });
    });
    function fm(it) { var m = {}; it.f.forEach(function (p) { if (m[p[0]] == null) m[p[0]] = Array.isArray(p[1]) ? p[1].join('；') : String(p[1]); }); return m; }
    var pick = null;
    if (cands.length > 1 && o.sub) {
      var key = String(o.sub).replace(/…$/, '');
      cands.forEach(function (c) { if (pick) return; var m = fm(c.item); Object.keys(m).forEach(function (k) { if (!pick && key && m[k].indexOf(key) === 0) pick = c; }); });
    }
    pick = pick || cands[0];
    if (!pick) return null;
    var m = fm(pick.item), ok = ZY_STRONG.some(function (k) { return m[k] && clean(m[k]); });
    if (!ok) return null;
    if (String(m['把握程度'] || '').trim() === '待核') return null;
    return pick;
  }

  var api = {
    /* 历史人物弹窗：每次换人都会调用一次。o = { card(弹窗元素), anchor(按钮插在它前面), D, hit, dynName, portrait } */
    hookPerson: function (o) {
      try {
        var old = o.card.querySelector('.sc-corner'); if (old && old.parentNode) old.parentNode.removeChild(old); o.card.classList.remove('sc-has-share');
        if (!o.hit || (o.hit.kind !== '人物' && o.hit.kind !== '帝王') || o.hit.card.g === '待核') return;
        var isEmp = o.hit.kind === '帝王';
        if (isEmp) { o.row = null; (o.D.emperors || []).forEach(function (e) { if (e.name === o.hit.card.name) o.row = e; }); }
        var row = mkRow(function () {
          open({ type: isEmp ? 'emperor' : 'person', needMingju: false, url: pageUrl({ d: o.D.key, id: o.hit.card.name }), o: o });
        });
        o.card.appendChild(row); o.card.classList.add('sc-has-share');
      } catch (e) { try { console.warn('[sharecard]', e); } catch (x) { /* 忽略 */ } }
    },
    /* 诗词作品弹窗：每次打开一首诗调用一次。o = { card, after(按钮插在它后面), work, ctx:{poet, era} } */
    hookPoem: function (o) {
      try {
        var old = o.card.querySelector('.sc-corner'); if (old && old.parentNode) old.parentNode.removeChild(old); o.card.classList.remove('sc-has-share');
        var page = document.body.getAttribute('data-page');
        var pageName = POEM_PAGES[page];
        if (!pageName || !o.ctx || !o.ctx.poet) return;
        var row = mkRow(function () {
          open({ type: 'poem', needMingju: true, url: pageUrl({ id: o.ctx.poet.name + '｜' + o.work.title }), o: { work: o.work, ctx: o.ctx, pageName: pageName } });
        });
        o.card.appendChild(row); o.card.classList.add('sc-has-share');
      } catch (e) { try { console.warn('[sharecard]', e); } catch (x) { /* 忽略 */ } }
    },
    /* 时令页（节气、节日、时辰、生肖、科普长文）：按钮放在页面顶部“面包屑”一行的右边，印章的左边
       o = { crumb, kind('term'|'festival'|'shichen'|'shengxiao'|'essay'), name, entry, title(科普页的短标题), imgKind, imgName } */
    hookSeason: function (o) {
      try {
        var old = o.crumb.querySelector('.sc-crumb'); if (old && old.parentNode) old.parentNode.removeChild(old);
        var isEssay = o.kind === 'essay';
        var info = imageInfo(o.imgKind || o.kind, o.imgName || o.name);
        var portrait = info ? { src: info.src, caption: info.caption, ai: info.ai, aiLabel: info.aiLabel } : null;
        var btn = mkRow(function () {
          open({ type: isEssay ? 'essay' : 'season', url: pageUrl(isEssay ? {} : { id: o.name }),
                 o: isEssay ? { data: o.entry, title: o.title, portrait: portrait } : { kind: o.kind, name: o.name, entry: o.entry, portrait: portrait } });
        }, 'sc-crumb');
        var seal = o.crumb.querySelector('.seal');
        if (seal) o.crumb.insertBefore(btn, seal); else o.crumb.appendChild(btn);
      } catch (e) { try { console.warn('[sharecard]', e); } catch (x) { /* 忽略 */ } }
    },
    /* 神灵 / 异兽详情窗：每次打开或翻到另一条都调用一次。o = { dialog, page('shenhua'|'shenling'|'daojiao'|'fojiao'|'shanhai'), c } */
    hookGod: function (o) {
      try {
        var old = o.dialog.querySelector('.sc-corner'); if (old && old.parentNode) old.parentNode.removeChild(old);
        if (!o.c || !o.c.name) return;
        var img = window.ZIMG && window.ZIMG.get ? window.ZIMG.get(o.page, o.c.name) : null;
        var row = mkRow(function () {
          open({ type: 'deity', needShen: true, url: pageUrl({ id: o.c.name }),
                 o: { page: o.page, c: o.c, portrait: img ? { src: String(img.src).replace('w_720', 'w_960'), caption: '', ai: img.ai, aiLabel: img.aiLabel } : null } });
        });
        o.dialog.appendChild(row);
      } catch (e) { try { console.warn('[sharecard]', e); } catch (x) { /* 忽略 */ } }
    },
    /* 战役 / 政变与起义弹窗：每次打开或翻到下一条都调用一次。o = { card, kind('战役'|'政变与起义'), group, b } */
    hookEvent: function (o) {
      try {
        var old = o.card.querySelector('.sc-corner'); if (old && old.parentNode) old.parentNode.removeChild(old); o.card.classList.remove('sc-has-share');
        if (!o.b || !o.b.name) return;
        var row = mkRow(function () {
          open({ type: 'event', needMingju: false, url: pageUrl({ id: o.b.name }), o: { b: o.b, kind: o.kind, group: o.group } });
        });
        o.card.appendChild(row); o.card.classList.add('sc-has-share');
      } catch (e) { try { console.warn('[sharecard]', e); } catch (x) { /* 忽略 */ } }
    },
    /* 帝王名单里的一行（没有详细介绍的那些）：o = { box(按钮放进它里面), D, e(这一行的数据), dynName } */
    hookEmperorRow: function (o) {
      try {
        if (!o.box || !o.e) return;
        var b = mkRow(function () {
          open({ type: 'emperorLite', needDiwang: true, url: pageUrl({ d: o.D.key, id: o.e.name }), o: { row: o.e, dynName: o.dynName, key: o.D.key + '|' + o.e.name } });
        }, 'sc-inline');
        o.box.appendChild(b);
      } catch (e) { try { console.warn('[sharecard]', e); } catch (x) { /* 忽略 */ } }
    },
    /* 二十八宿：星图下面的详情面板，每次换选中的宿 / 象 / 中宫都调用一次。o = { panel, kind('xiu'|'beast'|'center'), name, D, x, b } */
    hookXiu: function (o) {
      try {
        var old = o.panel.querySelector('.sc-corner'); if (old && old.parentNode) old.parentNode.removeChild(old);
        var imgKey = o.kind === 'xiu' ? o.x.beast : (o.kind === 'beast' ? o.name : '中宫');
        var img = window.ZIMG && window.ZIMG.get ? window.ZIMG.get('xingxiu', imgKey) : null;
        var id = o.kind === 'center' ? '中宫' : o.name;
        var row = mkRow(function () {
          open({ type: 'xiu', url: pageUrl({ id: id }),
                 o: { kind: o.kind, D: o.D, x: o.x, b: o.b, portrait: img ? { src: String(img.src).replace('w_720', 'w_960'), caption: '', ai: img.ai, aiLabel: img.aiLabel } : null } });
        });
        o.panel.appendChild(row);
      } catch (e) { try { console.warn('[sharecard]', e); } catch (x) { /* 忽略 */ } }
    },
    /* 典籍书页：o = { head(页头元素，按钮放在它后面), d(这本书的数据), catName } */
    hookBook: function (o) {
      try {
        if (!o.head || !o.d) return;
        var wrap = el('div', 'sc-line-wrap');
        wrap.appendChild(mkRow(function () { open({ type: 'book', url: pageUrl({ id: o.d.id }), o: { d: o.d, catName: o.catName } }); }, 'sc-line'));
        if (o.head.parentNode) o.head.parentNode.insertBefore(wrap, o.head.nextSibling);
      } catch (e) { try { console.warn('[sharecard]', e); } catch (x) { /* 忽略 */ } }
    },
    /* 都城：城市弹窗，每次换一座城都调用一次。o = { card(弹窗卡片), c(这座城的数据), groupName } */
    hookCity: function (o) {
      try {
        var old = o.card.querySelector('.sc-corner'); if (old && old.parentNode) old.parentNode.removeChild(old); o.card.classList.remove('sc-has-share');
        if (!o.c) return;
        var row = mkRow(function () { open({ type: 'city', url: pageUrl({ id: o.c.name }), o: { c: o.c, groupName: o.groupName } }); });
        o.card.appendChild(row); o.card.classList.add('sc-has-share');
      } catch (e) { try { console.warn('[sharecard]', e); } catch (x) { /* 忽略 */ } }
    },
    /* 陵墓详页：页头下面。o = { head(页头元素), d(这座墓的数据), grpName } */
    hookTomb: function (o) {
      try {
        if (!o.head || !o.d) return;
        var wrap = el('div', 'sc-line-wrap');
        wrap.appendChild(mkRow(function () { open({ type: 'tomb', url: pageUrl({ id: o.d.id }), o: { d: o.d, grpName: o.grpName } }); }, 'sc-line'));
        if (o.head.parentNode) o.head.parentNode.insertBefore(wrap, o.head.nextSibling);
      } catch (e) { try { console.warn('[sharecard]', e); } catch (x) { /* 忽略 */ } }
    },
    /* 名著：每一部书的标题下面。o = { node(这部书的 article), sec(这部书的数据) } */
    hookNovel: function (o) {
      try {
        if (!o.node || !o.sec) return;
        var h = o.node.querySelector('.wr-title'); if (!h) return;
        var wrap = el('div', 'sc-line-wrap');
        wrap.appendChild(mkRow(function () { open({ type: 'novel', url: pageUrl({}) + '#wr-' + o.sec.key, o: { sec: o.sec } }); }, 'sc-line'));
        h.parentNode.insertBefore(wrap, h.nextSibling);
      } catch (e) { try { console.warn('[sharecard]', e); } catch (x) { /* 忽略 */ } }
    },
    /* 字语六页（汉字、词语、称谓、万物、颜色、数字）的条目卡：d = 卡片元素，o = { name, sub, tag, id, body } */
    hookZyCard: function (d, o) {
      try {
        var page = document.body.getAttribute('data-page'), P = ZY_PAGES[page];
        if (!P || !d || !o || o.tag === '待核') return;
        var body = d.querySelector('.zy-card-body'); if (!body) return;
        var D = window[P.v]; if (!D || !D.sections) return;
        var hit = findZyItem(D, o); if (!hit) return;
        var wrap = el('div', 'sc-line-wrap');
        wrap.appendChild(mkRow(function () { open({ type: 'zy', url: pageUrl({ id: o.id || o.name }), o: { page: P.n, sec: hit.sec, item: hit.item } }); }, 'sc-line'));
        body.appendChild(wrap);
      } catch (e) { try { console.warn('[sharecard]', e); } catch (x) { /* 忽略 */ } }
    },
    _render: render, _types: TYPES, _open: open, _last: function () { return ui && ui.last; }, _findZy: function (page, o) { var P = ZY_PAGES[page], D = P && window[P.v]; return D ? findZyItem(D, o) : null; }
  };
  window.ShareCard = api;
})();
