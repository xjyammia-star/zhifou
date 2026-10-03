/* 知否知否 · 朗读（用浏览器自带的语音朗读，不生成音频、不联网、不新增文件）
   ----------------------------------------------------------
   做什么：在页面里每一块"知识性的正文"旁边放一个小喇叭按钮（"听"），点一下读这一块，再点一下停；
          右下角有一个设置小圆钮，可以选声音、调语速、试听，选择会记住。
   规则：一次只读一块（点另一块立即换）；不做整页连读；换页或关闭弹窗就停；设备里没有中文语音就什么都不显示。
   不读：出处、引文、图片说明和署名、"另见"链接、页面底部的"说明"、导航和按钮上的字、表格、示意图里的文字。
   怎么认块：不按页面逐个写，而是按排版用的类名自动认（各页的排版方式只有几种）：
     页头（zy-head / wx-head / xx-head）、分区（zy-section / wx-section / xx-section）、
     可展开的卡片（zy-card / fm-card / lm-sec / lm-blk / dj-sec）、小提示（tip-box / zy-tip / wx-tip）、
     节气等"时令"页（term-main）、神灵页的详情弹窗（sl-detail）、诗词弹窗（tp-modal-card）、名著页（wr-block）。
   接入新页面：页面 html 末尾加一行 <script src="js/tts.js"></script> 就行；排版用了上面这些类名的，自动就有按钮。
   读错的字：加到下面的 PRON（读音修正表）里，全站生效；只影响朗读的声音，不改页面上看到的字。 */
(function () {
  'use strict';

  var synth = window.speechSynthesis;
  if (!synth || !window.SpeechSynthesisUtterance) return;

  /* ---------- 读音修正表：[页面上的字, 朗读时换成的字] ---------- */
  var PRON = [
    ['鴠鸟', '旦鸟'],
    ['颛顼', '专须'],
    ['帝喾', '帝酷'],
    ['伏羲', '伏希'], ['常羲', '常希'], ['羲和', '希和'],
    ['女魃', '女拔'],
    ['夔', '魁']
  ];

  /* ---------- 记住的设置 ---------- */
  var KEY_V = 'zf-tts-voice', KEY_R = 'zf-tts-rate';
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 浏览器不让存就算了 */ } }
  var rate = parseFloat(lsGet(KEY_R));
  if (!(rate >= 0.6 && rate <= 1.4)) rate = 0.9;       /* 默认比正常略慢 */
  var voice = null, zhVoices = [];

  /* ---------- 中文语音 ---------- */
  function pickVoices() {
    var all = [];
    try { all = synth.getVoices() || []; } catch (e) { all = []; }
    zhVoices = all.filter(function (v) { return /^zh/i.test(v.lang || '') || /chinese|中文|普通话|国语/i.test(v.name || ''); });
    zhVoices.sort(function (a, b) {
      var sa = (/^zh[-_]cn/i.test(a.lang) ? 0 : 1) * 2 + (/natural|neural|online/i.test(a.name) ? 0 : 1);
      var sb = (/^zh[-_]cn/i.test(b.lang) ? 0 : 1) * 2 + (/natural|neural|online/i.test(b.name) ? 0 : 1);
      return sa - sb;
    });
    return zhVoices.length;
  }
  function chooseVoice() {
    var saved = lsGet(KEY_V);
    voice = null;
    zhVoices.forEach(function (v) { if (!voice && saved && v.voiceURI === saved) voice = v; });
    if (!voice) voice = zhVoices[0] || null;
  }

  /* ---------- 文字整理：去掉不该读的符号，按句子切成小段 ---------- */
  function clean(t) {
    t = String(t || '').replace(/\s+/g, ' ');
    /* 文字里夹着的“出处：《……》。”不读 */
    t = t.replace(/(^|[。；！？\s])(?:资料)?出处[：:]\s*[^。；！？]*[。；！？]?/g, '$1');
    t = t.replace(/(^|[。；！？\s])另见[：:]\s*[^。；！？]*[。；！？]?/g, '$1');      /* “另见：某某页”这类链接说明也不读 */
    t = t.replace(/(\d)\s*[—–－]\s*(\d)/g, '$1到$2');
    t = t.replace(/[→←↑↓·•▪]/g, ' ');
    PRON.forEach(function (p) { t = t.split(p[0]).join(p[1]); });
    return t.trim();
  }
  function chunk(t) {
    var parts = t.match(/[^。！？；!?;\n]+[。！？；!?;\n]?/g) || [t];
    var out = [], cur = '';
    parts.forEach(function (s) {
      if (s.length > 90) {
        if (cur) { out.push(cur); cur = ''; }
        (s.match(/[^，、,]+[，、,]?/g) || [s]).forEach(function (q) {
          if ((cur + q).length > 60) { if (cur) out.push(cur); cur = q; } else cur += q;
        });
        if (cur) { out.push(cur); cur = ''; }
      } else if ((cur + s).length > 70) { out.push(cur); cur = s; }
      else cur += s;
    });
    if (cur) out.push(cur);
    return out.filter(function (x) { return /\S/.test(x); });
  }

  /* ---------- 播放（一次只播一块） ---------- */
  var ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  var ICON_STOP = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/></svg>';
  var token = 0, current = null;

  function setBtn(b, on) {
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.innerHTML = (on ? ICON_STOP : ICON_PLAY) + '<span class="zf-tts-t">' + (on ? '停' : (b._txt || '听')) + '</span>';
  }
  function stop() {
    token++;
    try { synth.cancel(); } catch (e) { /* 忽略 */ }
    if (current) { setBtn(current, false); current = null; }
  }
  function speakChunks(chunks, my) {
    var i = 0;
    (function next() {
      if (my !== token) return;
      if (i >= chunks.length) { stop(); return; }
      var u = new SpeechSynthesisUtterance(chunks[i++]);
      u.lang = (voice && voice.lang) || 'zh-CN';
      if (voice) u.voice = voice;
      u.rate = rate;
      u.onend = next;
      u.onerror = function (e) {
        if (my !== token) return;
        if (e && (e.error === 'interrupted' || e.error === 'canceled')) return;
        next();
      };
      synth.speak(u);
    })();
  }
  function play(btn, text) {
    if (current === btn) { stop(); return; }
    stop();
    var chunks = chunk(clean(text));
    if (!chunks.length) return;
    current = btn;
    setBtn(btn, true);
    var my = token;
    setTimeout(function () { if (my === token) speakChunks(chunks, my); }, 80);   /* cancel 之后稍等一下再开口，免得有的浏览器吞掉 */
  }

  /* ---------- 取"该读的文字" ----------
     不读的东西（出处、署名、图片说明、另见链接、导航、按钮、表格、示意图……）统一在 NOISE 里列出来，
     取文字时先把它们从副本里去掉。每个块（段落、列表项、标题……）末尾没有标点的，补一个句号，读起来才有停顿。 */
  var NOISE = [
    '.zf-tts', '.zf-tts-row', 'button', 'svg', 'canvas', 'select', 'input', 'textarea', 'script', 'style', 'figure', 'figcaption', 'table', 'nav', 'iframe',
    '[aria-hidden="true"]', '[hidden]',
    '.zy-notes', '.wx-notes', '.notes', 'details.notes',
    '[class*="-src"]', '[class*="source"]', '[class*="credit"]', '[class*="caption"]',
    '.zy-see', '.wx-see', '.wx-hint', '[class*="next-label"]', '.sl-origin', '.sl-stepper', '.sl-image',
    '[class*="eyebrow"]', '[class*="crumb"]', '.seal', '.ornament',
    '[class*="tabbar"]', '[class*="chips"]', '[class*="search"]', '[class*="-nav"]', '[class*="legend"]', '[class*="filter"]',
    '.hou-note', '.sh-rowlabel', '.sh-rownote', '.sh-edge-label', '.sh-node-text', '.dj-sec-n', '.dj-back', '.dj-pn'
  ].join(',');
  var CARD_SEL = 'details.zy-card, details.fm-card, details.lm-sec, details.lm-blk, details.dj-sec';
  var SKIP_TITLE = /资料来源|延伸阅读|全文与|代表性选段|原文节选|图片线索|存疑之处|与本站其他内容的联系|^另见/;
  var BLOCK = { P: 1, DIV: 1, LI: 1, UL: 1, OL: 1, DL: 1, DT: 1, DD: 1, H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1, SUMMARY: 1, SECTION: 1, ARTICLE: 1, HEADER: 1, BLOCKQUOTE: 1, DETAILS: 1, ASIDE: 1 };
  var ENDP = /[。！？；，、：.!?;:,）)”"」』】…]$/;

  function walk(n, out) {
    if (n.nodeType === 3) { out.push(n.nodeValue); return; }
    if (n.nodeType !== 1) return;
    var tag = n.tagName;
    if (tag === 'BR') { out.push('\u0001'); return; }
    var blk = BLOCK[tag] || (tag === 'SPAN' && /card-(name|sub|tag|title|meta)/.test(n.className || ''));
    /* 一排紧挨着的链接（如“上古神话 山海经异兽 ……”）之间补个顿号，免得读成一个词 */
    if (tag === 'A') {
      var pv = n.previousSibling;
      while (pv && pv.nodeType === 3 && !pv.nodeValue.replace(/\s+/g, '')) pv = pv.previousSibling;
      if (pv && pv.nodeType === 1 && pv.tagName === 'A') out.push('、');
    }
    if (blk) out.push('\u0001');
    for (var c = n.firstChild; c; c = c.nextSibling) walk(c, out);
    if (tag === 'DT') out.push('：');
    if (blk) out.push('\u0001');
  }
  function flat(node) {
    var out = [];
    walk(node, out);
    var segs = out.join('').split('\u0001').map(function (s) { return s.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
    return segs.map(function (s) { return ENDP.test(s) ? s : s + '。'; }).join(' ');
  }
  /* 取一个元素里该读的文字；skipCards 为真时，里面可展开的卡片整块跳过（卡片有自己的按钮） */
  function tx(node, skipCards) {
    if (!node) return '';
    var c = node.cloneNode(true);
    if (c.querySelectorAll) {
      Array.prototype.forEach.call(c.querySelectorAll(NOISE), function (x) { if (x.parentNode) x.parentNode.removeChild(x); });
      if (skipCards) Array.prototype.forEach.call(c.querySelectorAll(CARD_SEL), function (x) { if (x.parentNode) x.parentNode.removeChild(x); });
    }
    return flat(c);
  }
  /* 取一个元素的"子元素们"的文字，其中 exclude 里的不取（比如标题自己、卡片的摘要行） */
  function kidsText(node, exclude, skipCards) {
    var parts = [];
    for (var c = node.firstChild; c; c = c.nextSibling) {
      if (exclude && exclude.indexOf(c) >= 0) continue;
      if (c.nodeType === 3) { var t = c.nodeValue.replace(/\s+/g, ' ').trim(); if (t) parts.push(ENDP.test(t) ? t : t + '。'); continue; }
      if (c.nodeType !== 1) continue;
      if (skipCards && c.matches && c.matches(CARD_SEL)) continue;
      if (c.matches && c.matches(NOISE)) continue;
      var s = tx(c, skipCards);
      if (s) parts.push(s);
    }
    return parts.join(' ');
  }

  /* ---------- 按钮 ---------- */
  function mk(getText, label, txt) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'zf-tts';
    b._txt = txt || '听';
    b.setAttribute('aria-label', '朗读：' + (label || '这一段'));
    b.title = '朗读：' + (label || '这一段');
    setBtn(b, false);
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); play(b, getText()); });
    return b;
  }
  function hasBtn(host) {
    for (var i = 0; i < host.children.length; i++) if (host.children[i].classList.contains('zf-tts')) return true;
    return false;
  }
  function addTo(host, getText, label) {
    if (!host || hasBtn(host)) return;
    host.appendChild(mk(getText, label));
  }
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  function childMatching(node, re) {
    for (var i = 0; i < node.children.length; i++) if (re.test(node.children[i].className || '')) return node.children[i];
    return null;
  }
  function hasRowBefore(el) { var p = el.previousElementSibling; return !!(p && p.classList.contains('zf-tts-row')); }

  /* ---------- 1. 页头：标题 + 一句话答案 + 导语 ---------- */
  function scanHeads() {
    each('.zy-head, .wx-head, .xx-head', function (head) {
      var h1 = head.querySelector('h1');
      if (!h1) return;
      var nx = head.nextElementSibling;
      var extra = nx && /(^|\s)(wx-lead|xx-intro|zy-lead)(\s|$)/.test(nx.className || '') ? nx : null;
      addTo(h1, function () { return tx(head) + (extra ? ' ' + tx(extra) : ''); }, '标题和导语');
    });
  }

  /* ---------- 2. 分区：标题旁一个按钮，读这一区里卡片以外的正文 ---------- */
  function scanSections() {
    each('.zy-section, .wx-section, .xx-section', function (sec) {
      var title = childMatching(sec, /sec-title|section-title/);
      if (!title || hasBtn(title)) return;
      var name = tx(title).replace(/[。]$/, '');
      if (SKIP_TITLE.test(name)) return;
      var body = kidsText(sec, [title], true);
      if (body.length < 30) return;
      addTo(title, function () { return name + '。' + kidsText(sec, [title], true); }, name);
    });
  }

  /* ---------- 3. 可展开的卡片：展开后，卡片内容最前面一个按钮，读卡片名加正文 ---------- */
  function scanCards() {
    each(CARD_SEL, function (d) {
      var sum = null, first = null, hasRow = false;
      for (var i = 0; i < d.children.length; i++) {
        var k = d.children[i];
        if (k.classList.contains('zf-tts-row')) hasRow = true;
        else if (k.tagName === 'SUMMARY') sum = k;
        else if (!first) first = k;
      }
      if (hasRow || !sum || !first) return;
      var name = tx(sum).replace(/[。]$/, '');
      if (SKIP_TITLE.test(name)) return;
      if (!kidsText(d, [sum], false)) return;
      var row = document.createElement('div');
      row.className = 'zf-tts-row';
      row.appendChild(mk(function () { return name + '。' + kidsText(d, [sum], false); }, name));
      d.insertBefore(row, first);
    });
  }

  /* ---------- 4. 小提示 / 辨析：标题标签旁一个按钮 ---------- */
  function scanTips() {
    each('.zy-tip, .wx-tip, .tip-box', function (t) {
      var label = t.querySelector('[class*="tip-label"]');
      if (!label) return;
      addTo(label, function () { return tx(label).replace(/[。]$/, '') + '：' + kidsText(t, [label], false); }, '小提示');
    });
  }

  /* ---------- 5. 时令页（节气、节日、干支、生肖科普、月份、数九三伏）：term-main ---------- */
  function scanTerm() {
    var main = document.querySelector('.term-main');
    if (!main) return;
    var h1 = main.querySelector('h1.hook'), ans = main.querySelector('.answer');
    if (h1) addTo(h1, function () { return tx(h1) + ' ' + tx(ans); }, '标题和答案');

    var kids = Array.prototype.slice.call(main.children);
    var firstSec = -1;
    kids.forEach(function (k, i) { if (firstSec < 0 && k.classList.contains('section-title')) firstSec = i; });
    var intro = kids.slice(0, firstSec < 0 ? kids.length : firstSec).filter(function (k) { return k.classList.contains('block-text'); });
    if (intro.length && !hasRowBefore(intro[0])) {
      var row = document.createElement('div');
      row.className = 'zf-tts-row';
      row.appendChild(mk(function () { return intro.map(function (p) { return tx(p); }).join(' '); }, '介绍'));
      intro[0].parentNode.insertBefore(row, intro[0]);
    }

    kids.forEach(function (k, i) {
      if (!k.classList.contains('section-title')) return;
      var name = tx(k).replace(/[。]$/, '');
      /* 这一节 = 标题后面、下一个标题（或小提示、上下一个）之前的所有元素 */
      var group = [];
      for (var j = i + 1; j < kids.length; j++) {
        if (/(^|\s)(section-title|tip-box|term-nav)(\s|$)/.test(kids[j].className || '')) break;
        group.push(kids[j]);
      }
      if (!group.length) return;
      addTo(k, function () {
        return name + '。' + group.map(function (g) {
          if (g.classList.contains('hou-full')) {
            /* 三候：候名加白话；补充说明（.hou-note）不读 */
            return Array.prototype.map.call(g.querySelectorAll('.hou-card'), function (c) {
              return tx(c.querySelector('.hou-label')) + '，' + tx(c.querySelector('.hou-name')) + '，' + tx(c.querySelector('.hou-plain')) + '。';
            }).join(' ');
          }
          return tx(g);
        }).join(' ');
      }, name);
    });
  }

  /* ---------- 6. 神灵页的详情弹窗（上古神话、道教、佛教、山海经、民间神灵） ---------- */
  var SKIP_FIELD = /^(主要)?出处$/;          /* “出处”不读 */
  function scanSlDialog() {
    each('.sl-detail', function (d) {
      var title = d.querySelector('.sl-detail-title'), line = d.querySelector('.sl-detail-line');
      if (line) addTo(line, function () { return tx(title) + '。' + tx(line); }, '一句话');
      Array.prototype.forEach.call(d.querySelectorAll('.sl-field'), function (f) {
        var dt = f.querySelector('dt'), dd = f.querySelector('dd');
        if (!dt || !dd) return;
        var label = tx(dt).replace(/[：。]$/, '');
        if (SKIP_FIELD.test(label)) return;
        addTo(dt, function () { return label + '：' + tx(dd); }, label);
      });
    });
    /* 上古神话页的“故事”列表：每则故事标题旁一个按钮；每则后面的出处行不读 */
    each('li.sh-story', function (li) {
      var h = li.querySelector('.sh-story-title');
      if (!h) return;
      addTo(h, function () {
        var meaning = tx(li.querySelector('.sh-story-meaning')).replace(/^含义[：:]/, '含义：');
        return [tx(h), meaning, tx(li.querySelector('.sh-story-text')), tx(li.querySelector('.sh-story-tip'))].filter(Boolean).join(' ');
      }, '故事');
    });
  }

  /* ---------- 7. 诗词弹窗（唐诗、宋词、元曲、诗经、楚辞、汉乐府魏晋诗）：整页只有一个弹窗，内容每次替换 ----------
     弹窗里放一排固定的按钮：听原文、听译文（没有译文就隐藏）、听讲解（没有讲解就隐藏）。注解和逐句解读不读。 */
  function poemText(card) {
    var title = tx(card.querySelector('.wr-char-modal-title')).replace(/[。]$/, '');
    var lines = Array.prototype.map.call(card.querySelectorAll('.tp-modal-poem p'), function (p) {
      var t = tx(p);
      return /[。！？；，、：]$/.test(t) ? t : t.replace(/[。]$/, '') + '，';      /* 每句末尾补个标点，读的时候才有停顿 */
    });
    return (title ? title + '。' : '') + lines.join(' ');
  }
  function scanWenModal() {
    var card = document.querySelector('.tp-modal-card');
    if (card) {
      var row = null;
      for (var i = 0; i < card.children.length; i++) if (card.children[i].classList.contains('zf-tts-row')) row = card.children[i];
      if (!row) {
        row = document.createElement('div');
        row.className = 'zf-tts-row';
        row._b = {
          poem: mk(function () { return poemText(card); }, '原文', '听原文'),
          trans: mk(function () { return tx(card.querySelector('.tp-trans-body')); }, '白话译文', '听译文'),
          note: mk(function () { return tx(card.querySelector('.tp-modal-note')); }, '讲解', '听讲解')
        };
        row.appendChild(row._b.poem); row.appendChild(row._b.trans); row.appendChild(row._b.note);
        card.insertBefore(row, card.querySelector('.tp-modal-poem') || null);
      }
      row._b.trans.hidden = !tx(card.querySelector('.tp-trans-body'));
      row._b.note.hidden = !tx(card.querySelector('.tp-modal-note'));
    }
    /* 诗人的生平小传：段落末尾一个按钮 */
    each('.tp-poet', function (p) {
      var life = p.querySelector('.tp-poet-life'), nm = p.querySelector('.tp-poet-name');
      if (life) addTo(life, function () { return tx(nm) + '。' + tx(life); }, '生平');
    });
  }

  /* ---------- 8. 名著页：每个内容块的标题旁一个按钮 ---------- */
  function scanWr() {
    each('.wr-block', function (b) {
      var h = b.querySelector('.wr-block-h');
      if (!h || hasBtn(h)) return;
      var name = tx(h).replace(/[。]$/, '');
      if (SKIP_TITLE.test(name)) return;
      addTo(h, function () { return name + '。' + kidsText(b, [h], false); }, name);
    });
  }

  var SCANNERS = [scanHeads, scanSections, scanCards, scanTips, scanTerm, scanSlDialog, scanWenModal, scanWr];

  /* ---------- 样式 ---------- */
  var css =
    '.zf-tts{display:inline-flex;align-items:center;gap:4px;margin-left:.8em;padding:2px 11px 2px 8px;min-height:28px;vertical-align:middle;' +
    'font:inherit;font-size:12.5px;font-weight:400;font-style:normal;letter-spacing:.1em;line-height:1.5;color:inherit;opacity:.78;background:transparent;' +
    'border:1px solid currentColor;border-radius:999px;cursor:pointer;text-transform:none;white-space:nowrap}' +
    '.zf-tts svg{width:15px;height:15px;display:block;flex:none}' +
    '.zf-tts:hover,.zf-tts:focus-visible{opacity:1;background:rgba(128,128,128,.16)}' +
    '.zf-tts.is-on{opacity:1;background:rgba(194,161,90,.24);border-color:var(--zy-gold,#c2a15a)}' +
    'dt .zf-tts{display:flex;width:max-content;margin:6px 0 0 0}' +
    '.zf-tts[hidden]{display:none}' +
    '.zf-tts-row{margin:0 0 8px;display:flex;flex-wrap:wrap;gap:8px}.zf-tts-row .zf-tts{margin-left:0}' +
    'summary + .zf-tts-row{margin-top:10px}' +
    '.zf-tts-fab{position:fixed;right:18px;bottom:calc(22px + env(safe-area-inset-bottom,0px));z-index:41;width:46px;height:46px;padding:0;border-radius:50%;' +
    'cursor:pointer;display:flex;align-items:center;justify-content:center;color:#f6ecd8;background:rgba(43,38,34,.9);border:1px solid var(--zy-gold,#c2a15a);' +
    'box-shadow:0 4px 16px rgba(0,0,0,.4);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}' +
    '.zf-tts-fab svg{width:22px;height:22px;display:block}' +
    '.zf-tts-fab:hover,.zf-tts-fab:focus-visible,.zf-tts-fab[aria-expanded="true"]{background:rgba(70,58,48,.96)}' +
    'body.zf-has-tts .zf-totop, body.zf-has-tts .tp-totop{bottom:calc(76px + env(safe-area-inset-bottom,0px))}' +
    '.zf-tts-panel{position:fixed;right:18px;bottom:calc(78px + env(safe-area-inset-bottom,0px));z-index:42;width:292px;max-width:calc(100vw - 24px);box-sizing:border-box;' +
    'padding:14px 16px 12px;color:#f3e9d6;background:rgba(36,31,27,.97);border:1px solid var(--zy-gold,#c2a15a);border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.5);' +
    'font-size:14px;line-height:1.7}' +
    '.zf-tts-panel[hidden]{display:none}' +
    '.zf-tts-ph{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;font-size:13px;letter-spacing:.25em;color:var(--zy-gold,#c2a15a)}' +
    '.zf-tts-x{width:32px;height:32px;padding:0;border:0;background:transparent;color:inherit;font-size:20px;line-height:1;cursor:pointer}' +
    '.zf-tts-panel label{display:block;margin:8px 0 0}' +
    '.zf-tts-panel .zf-tts-lab{display:flex;justify-content:space-between;font-size:13px;color:#d9ccb4}' +
    '.zf-tts-panel select{display:block;width:100%;margin-top:4px;min-height:36px;padding:0 8px;color:#f3e9d6;background:#2b2622;border:1px solid rgba(243,233,214,.35);border-radius:4px;font:inherit;font-size:13px}' +
    '.zf-tts-panel input[type=range]{display:block;width:100%;margin:8px 0 0}' +
    '.zf-tts-try{margin-top:10px;min-height:36px;padding:0 16px;color:#f3e9d6;background:transparent;border:1px solid var(--zy-gold,#c2a15a);border-radius:999px;font:inherit;font-size:13px;letter-spacing:.1em;cursor:pointer}' +
    '.zf-tts-try:hover{background:rgba(194,161,90,.22)}' +
    '.zf-tts-tip{margin:10px 0 0;font-size:12px;line-height:1.7;color:#b9ad97}' +
    '@media (max-width:600px){.zf-tts-fab{right:12px;bottom:calc(16px + env(safe-area-inset-bottom,0px));width:42px;height:42px}' +
    'body.zf-has-tts .zf-totop, body.zf-has-tts .tp-totop{bottom:calc(66px + env(safe-area-inset-bottom,0px))}.zf-tts-panel{right:12px;bottom:calc(66px + env(safe-area-inset-bottom,0px))}}' +
    /* 电脑宽度下，设置钮和面板盖在作品弹窗（层级 60）之上，边听边调语速；手机上弹窗占满屏，不盖 */
    '@media (min-width:900px){.zf-tts-fab{z-index:61}.zf-tts-panel{z-index:62}}';

  /* ---------- 设置面板 ---------- */
  function buildPanel() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    document.body.classList.add('zf-has-tts');

    var fab = document.createElement('button');
    fab.type = 'button'; fab.className = 'zf-tts-fab'; fab.setAttribute('aria-label', '朗读设置'); fab.setAttribute('aria-expanded', 'false'); fab.title = '朗读设置：声音和语速';
    fab.innerHTML = ICON_PLAY;

    var panel = document.createElement('div');
    panel.className = 'zf-tts-panel'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', '朗读设置');
    var head = document.createElement('div'); head.className = 'zf-tts-ph';
    head.appendChild(document.createTextNode('朗读设置'));
    var x = document.createElement('button'); x.type = 'button'; x.className = 'zf-tts-x'; x.setAttribute('aria-label', '关闭'); x.textContent = '×';
    head.appendChild(x); panel.appendChild(head);

    var l1 = document.createElement('label'); l1.appendChild(document.createTextNode('声音'));
    var sel = document.createElement('select');
    zhVoices.forEach(function (v) {
      var o = document.createElement('option'); o.value = v.voiceURI;
      o.textContent = v.name.replace(/^Microsoft\s+/i, '') + (/natural|neural|online/i.test(v.name) ? '（自然音色）' : '');
      if (v === voice) o.selected = true;
      sel.appendChild(o);
    });
    l1.appendChild(sel); panel.appendChild(l1);

    var l2 = document.createElement('label');
    var lab = document.createElement('span'); lab.className = 'zf-tts-lab';
    var s1 = document.createElement('span'); s1.textContent = '语速';
    var s2 = document.createElement('span');
    function showRate() { s2.textContent = rate.toFixed(2) + ' 倍' + (Math.abs(rate - 1) < 0.01 ? '（正常）' : ''); }
    lab.appendChild(s1); lab.appendChild(s2); l2.appendChild(lab);
    var rg = document.createElement('input'); rg.type = 'range'; rg.min = '0.6'; rg.max = '1.4'; rg.step = '0.05'; rg.value = String(rate);
    rg.setAttribute('aria-label', '语速'); showRate();
    l2.appendChild(rg); panel.appendChild(l2);

    var tryBtn = document.createElement('button'); tryBtn.type = 'button'; tryBtn.className = 'zf-tts-try'; tryBtn.textContent = '试听';
    panel.appendChild(tryBtn);
    var tip = document.createElement('p'); tip.className = 'zf-tts-tip';
    tip.textContent = '声音好不好听，取决于你用的浏览器和系统：在 Windows 上，Edge 浏览器通常最自然。读错的字，告诉我，我来修正。';
    panel.appendChild(tip);

    function open(v) { panel.hidden = !v; fab.setAttribute('aria-expanded', v ? 'true' : 'false'); }
    fab.addEventListener('click', function (e) { e.stopPropagation(); open(panel.hidden); });
    x.addEventListener('click', function () { open(false); fab.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) open(false); });
    document.addEventListener('click', function (e) { if (!panel.hidden && !panel.contains(e.target) && e.target !== fab) open(false); });
    sel.addEventListener('change', function () {
      zhVoices.forEach(function (v) { if (v.voiceURI === sel.value) voice = v; });
      lsSet(KEY_V, sel.value);
    });
    rg.addEventListener('input', function () { rate = parseFloat(rg.value) || 0.9; lsSet(KEY_R, String(rate)); showRate(); });
    tryBtn.addEventListener('click', function () {
      stop();
      var my = ++token;
      setTimeout(function () { if (my === token) speakChunks(['知否知否，每天读一页中国传统文化。'], my); }, 80);
    });
    document.body.appendChild(panel);
    document.body.appendChild(fab);
  }

  /* ---------- 启动：等中文语音出现；一直没有就什么都不显示 ---------- */
  var started = false, scanTimer = null;
  function scan() {
    SCANNERS.forEach(function (fn) { try { fn(); } catch (e) { /* 某一类块出错，不能影响页面和别的块 */ } });
  }
  function schedule() {
    if (scanTimer) return;
    scanTimer = setTimeout(function () {
      scanTimer = null;
      scan();
      if (!current) return;
      /* 正在读的那一块已经不在页面上了（换页、重画），或所在的弹窗已经关上，就停 */
      var ov = current.closest ? current.closest('.wr-char-modal-overlay') : null;
      if (!document.body.contains(current) || (ov && !ov.classList.contains('is-open'))) stop();
    }, 80);
  }
  function start() {
    if (started) return;
    if (!pickVoices()) return;
    started = true;
    chooseVoice();
    buildPanel();
    scan();
    try { new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-hidden'] }); } catch (e) { /* 忽略 */ }
    window.addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
  }
  function init() {
    start();
    if (started) return;
    try { synth.addEventListener('voiceschanged', start); } catch (e) { synth.onvoiceschanged = start; }
    var n = 0;
    var iv = setInterval(function () { start(); if (started || ++n > 12) clearInterval(iv); }, 400);   /* 有的浏览器不发“语音列表变了”的通知，所以再轮询几次 */
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
