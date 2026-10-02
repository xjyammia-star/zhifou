/* 知否知否 · 朗读（用浏览器自带的语音朗读，不生成音频、不联网、不新增文件）
   ----------------------------------------------------------
   做什么：在页面里每一块"知识性的正文"旁边放一个小喇叭按钮（"听"），点一下读这一块，再点一下停；
          右下角有一个设置小圆钮，可以选声音、调语速、试听，选择会记住。
   规则：一次只读一块（点另一块立即换）；不做整页连读；换页或关闭弹窗就停；设备里没有中文语音就什么都不显示。
   不读：出处、引文、说明小字、图片署名、导航按钮上的字。
   接入新页面：只需要 ① 页面 html 末尾加一行 <script src="js/tts.js"></script>
              ② 在下面的 PAGES 里加一项，写明"这个页面哪些块读"（参照 scanJieqi、scanShenhua）。
   读错的字：加到下面的 PRON（读音修正表）里，全站生效；只影响朗读的声音，不改页面上看到的字。 */
(function () {
  'use strict';

  var PAGE = document.body.getAttribute('data-page') || '';
  var PAGES = { jieqi: scanJieqi, shenhua: scanShenhua };
  if (!PAGES[PAGE]) return;
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
    b.innerHTML = (on ? ICON_STOP : ICON_PLAY) + '<span class="zf-tts-t">' + (on ? '停' : '听') + '</span>';
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

  /* ---------- 按钮 ---------- */
  function tx(node) {
    if (!node) return '';
    var c = node.cloneNode(true);
    Array.prototype.forEach.call(c.querySelectorAll('.zf-tts, .zf-tts-row'), function (x) { x.parentNode.removeChild(x); });
    return (c.textContent || '').replace(/\s+/g, ' ').trim();
  }
  function mk(getText, label) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'zf-tts';
    b.setAttribute('aria-label', '朗读：' + (label || '这一段'));
    b.title = '朗读这一段';
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

  /* ---------- 节气页：每个节气一页 ---------- */
  function scanJieqi() {
    var main = document.querySelector('.term-main');
    if (!main) return;
    var h1 = main.querySelector('h1.hook'), ans = main.querySelector('.answer');
    if (h1) addTo(h1, function () { return tx(h1) + ' ' + tx(ans); }, '标题和答案');

    var kids = Array.prototype.slice.call(main.children);
    var firstSec = -1;
    kids.forEach(function (k, i) { if (firstSec < 0 && k.classList.contains('section-title')) firstSec = i; });
    var intro = kids.slice(0, firstSec < 0 ? kids.length : firstSec).filter(function (k) { return k.classList.contains('block-text'); });
    if (intro.length && !(intro[0].previousElementSibling && intro[0].previousElementSibling.classList.contains('zf-tts-row'))) {
      var row = document.createElement('div');
      row.className = 'zf-tts-row';
      row.appendChild(mk(function () { return intro.map(tx).join(' '); }, '介绍'));
      intro[0].parentNode.insertBefore(row, intro[0]);
    }

    kids.forEach(function (k) {
      if (!k.classList.contains('section-title')) return;
      var name = tx(k), nxt = k.nextElementSibling;
      if (!nxt) return;
      if (name === '三候' && nxt.classList.contains('hou-full')) {
        addTo(k, function () {
          return Array.prototype.map.call(nxt.querySelectorAll('.hou-card'), function (c) {
            /* 候名加白话；后面的补充说明（.hou-note）不读 */
            return tx(c.querySelector('.hou-label')) + '，' + tx(c.querySelector('.hou-name')) + '，' + tx(c.querySelector('.hou-plain')) + '。';
          }).join(' ');
        }, '三候');
      } else if (name === '习俗' && nxt.classList.contains('block-text')) {
        addTo(k, function () { return '习俗：' + tx(nxt); }, '习俗');
      }
    });

    var tip = main.querySelector('.tip-box');
    if (tip) addTo(tip.querySelector('.tip-label'), function () { return '小提示：' + tx(tip.querySelector('p')); }, '小提示');
  }

  /* ---------- 上古神话页：人物详情弹窗、故事列表 ---------- */
  var READ_FIELDS = { '身份': 1, '故事': 1, '典故': 1 };           /* “主要出处”不读 */
  function scanShenhua() {
    Array.prototype.forEach.call(document.querySelectorAll('.sl-detail'), function (d) {
      var title = d.querySelector('.sl-detail-title'), line = d.querySelector('.sl-detail-line');
      if (line) addTo(line, function () { return tx(title) + '。' + tx(line); }, '一句话');
      Array.prototype.forEach.call(d.querySelectorAll('.sl-field'), function (f) {
        var dt = f.querySelector('dt'), dd = f.querySelector('dd');
        if (!dt || !dd) return;
        var label = tx(dt);
        if (!READ_FIELDS[label]) return;
        addTo(dt, function () { return label + '：' + tx(dd); }, label);
      });
      var note = d.querySelector('.sl-note');
      if (note) addTo(note.querySelector('.tip-label'), function () { return '辨析：' + tx(note.querySelector('p')); }, '辨析');
    });
    Array.prototype.forEach.call(document.querySelectorAll('li.sh-story'), function (li) {
      var h = li.querySelector('.sh-story-title');
      if (!h) return;
      addTo(h, function () {
        var meaning = tx(li.querySelector('.sh-story-meaning')).replace(/^含义[：:]/, '含义：');
        /* 每则故事后面的“出处：……”不读 */
        return [tx(h), meaning, tx(li.querySelector('.sh-story-text')), tx(li.querySelector('.sh-story-tip'))].filter(Boolean).join(' ');
      }, '故事');
    });
  }

  /* ---------- 样式 ---------- */
  var css =
    '.zf-tts{display:inline-flex;align-items:center;gap:4px;margin-left:.8em;padding:2px 11px 2px 8px;min-height:28px;vertical-align:middle;' +
    'font:inherit;font-size:12.5px;font-weight:400;font-style:normal;letter-spacing:.1em;line-height:1.5;color:inherit;opacity:.78;background:transparent;' +
    'border:1px solid currentColor;border-radius:999px;cursor:pointer;text-transform:none}' +
    '.zf-tts svg{width:15px;height:15px;display:block;flex:none}' +
    '.zf-tts:hover,.zf-tts:focus-visible{opacity:1;background:rgba(128,128,128,.16)}' +
    '.zf-tts.is-on{opacity:1;background:rgba(194,161,90,.24);border-color:var(--zy-gold,#c2a15a)}' +
    'dt .zf-tts{display:flex;width:max-content;margin:6px 0 0 0}' +
    '.zf-tts-row{margin:0 0 6px}.zf-tts-row .zf-tts{margin-left:0}' +
    '.zf-tts-fab{position:fixed;right:18px;bottom:calc(22px + env(safe-area-inset-bottom,0px));z-index:41;width:46px;height:46px;padding:0;border-radius:50%;' +
    'cursor:pointer;display:flex;align-items:center;justify-content:center;color:#f6ecd8;background:rgba(43,38,34,.9);border:1px solid var(--zy-gold,#c2a15a);' +
    'box-shadow:0 4px 16px rgba(0,0,0,.4);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}' +
    '.zf-tts-fab svg{width:22px;height:22px;display:block}' +
    '.zf-tts-fab:hover,.zf-tts-fab:focus-visible,.zf-tts-fab[aria-expanded="true"]{background:rgba(70,58,48,.96)}' +
    'body.zf-has-tts .zf-totop{bottom:calc(76px + env(safe-area-inset-bottom,0px))}' +
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
    'body.zf-has-tts .zf-totop{bottom:calc(66px + env(safe-area-inset-bottom,0px))}.zf-tts-panel{right:12px;bottom:calc(66px + env(safe-area-inset-bottom,0px))}}';

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
    zhVoices.forEach(function (v, i) {
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
  function scan() { try { PAGES[PAGE](); } catch (e) { /* 页面结构变了也不能影响页面 */ } }
  function schedule() { if (scanTimer) return; scanTimer = setTimeout(function () { scanTimer = null; scan(); if (current && !document.body.contains(current)) stop(); }, 60); }
  function start() {
    if (started) return;
    if (!pickVoices()) return;
    started = true;
    chooseVoice();
    buildPanel();
    scan();
    try { new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true }); } catch (e) { /* 忽略 */ }
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
