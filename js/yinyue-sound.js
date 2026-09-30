/* 知否知否 · 艺 · 音乐页“听一听”
   作用：给音乐页里的乐器卡片和“宫商角徵羽”五张卡片加上“▶ 听”按钮，播放真实录音。
   录音文件放在 audio/ 文件夹，全部来自维基共享资源，可自由使用；来源与授权写在卡片展开后的底部。
   用法：yinyue.html 在 js/yinyue.js 之后引入本文件即可。 */
(function () {
  'use strict';
  var root = document.getElementById('app');
  if (!root) return;

  var W = 'https://commons.wikimedia.org/wiki/File:';
  var SRC = {
    zuiyu: { f: 'guqin_zuiyu.mp3', who: '录音：CharlieHuang 演奏《醉渔唱晚》（片段）', lic: 'CC BY-SA 3.0', link: W + 'Guqin-Zuiyu_Changwan.ogg' },
    yangguan: { f: 'guqin_yangguan.mp3', who: '录音：CharlieHuang 演奏《阳关三叠》（片段）', lic: 'CC BY-SA 3.0', link: W + 'Guqin-Yangguan_Sandie.ogg' },
    erhu: { f: 'erhu_erquan.mp3', who: '二胡独奏《二泉映月》（片段，阿炳曲；演奏者见来源页）', lic: 'CC BY-SA 4.0', link: W + '%E4%BA%8C%E6%B3%89%E6%98%A0%E6%9C%88.ogg' },
    pipa: { f: 'pipa.mp3', who: '录音：Francesc Fort 琵琶', lic: 'CC BY-SA 4.0', link: W + 'Pipa_-_sound.ogg' },
    suona: { f: 'suona.mp3', who: '录音：Francesc Fort 唢呐', lic: 'CC BY-SA 4.0', link: W + 'Suona.ogg' },
    dizi: { f: 'dizi.mp3', who: '录音：Gorgoroth6669 笛子', lic: 'CC0', link: W + 'DiZi_Chinese_Flute_Sample.ogg' },
    xun: { f: 'xun.mp3', who: '录音：David290 演奏埙', lic: 'CC BY-SA 3.0', link: W + 'Recording_of_Xun.ogg' },
    sheng: { f: 'sheng_scale.mp3', who: '录音：S099001 笙吹奏半音阶（片段）', lic: 'CC0', link: W + 'Soprano_Sheng_Chromatic_Scale.ogg' },
    zheng: { f: 'zheng.mp3', who: '录音：neolein 古筝独奏（片段）', lic: 'CC0', site: 'Freesound', link: 'https://freesound.org/people/neolein/sounds/472707/' },
    xiao: { f: 'xiao.mp3', who: '录音：xserra 箫', lic: 'CC BY 4.0', site: 'Freesound', link: 'https://freesound.org/people/xserra/sounds/161912/' },
    zhongruan: { f: 'zhongruan.mp3', who: '录音：Francesc Fort 中阮', lic: 'CC BY-SA 4.0', link: W + 'Zhongruan.ogg' },
    pingsha: { f: 'pingsha.mp3', who: '古琴《平沙落雁》（片段，演奏者见来源页）', lic: 'CC BY 2.5', link: W + 'Pingsha_Luoyan.ogg' },
    gong: { f: 'gong.mp3', who: '录音：the_very_Real_Horst 大锣（片段）', lic: 'CC0', link: W + '240382_the-very-real-horst_chinese-gong-finish-session-2014-06-10-29-143.wav' },
    muyu: { f: 'muyu.mp3', who: '录音：the_very_Real_Horst 木鱼（片段）', lic: 'CC BY 4.0', site: 'Freesound', link: 'https://freesound.org/people/the_very_Real_Horst/sounds/205999/' },
    drum: { f: 'drum.mp3', who: '录音：kevp888 舞龙鼓乐（片段）', lic: 'CC BY 4.0', site: 'Freesound', link: 'https://freesound.org/people/kevp888/sounds/725086/' }
  };
  var CARDS = {
    '古琴': 'zuiyu', '古琴音乐的特点': 'zuiyu', '《阳关三叠》': 'yangguan', '二胡': 'erhu', '琵琶': 'pipa',
    '唢呐': 'suona', '笛': 'dizi', '土': 'xun', '匏': 'sheng',
    '古筝': 'zheng', '箫': 'xiao', '阮': 'zhongruan', '《平沙落雁》': 'pingsha', '金': 'gong', '木': 'muyu', '革': 'drum'
  };
  var WU = { '宫': 'gong', '商': 'shang', '角': 'jue', '徵': 'zhi', '羽': 'yu' };
  var WU_ORDER = ['宫', '商', '角', '徵', '羽'];
  var WU_CREDIT = { who: '五个音取自笙的真实录音（S099001 吹奏的半音阶），这里以 C 为“宫”，按十二平均律取 C、D、E、G、A', lic: 'CC0', link: W + 'Soprano_Sheng_Chromatic_Scale.ogg' };

  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text) n.textContent = text;
    return n;
  }
  var st = el('style', {}, '.yq-credit{margin:10px 0 2px;font-size:12.5px;line-height:1.7;color:#8a7a66}.yq-credit a{color:inherit;text-decoration:underline dotted}' +
    '.theme-yi .ys-tag.yq-tag{margin-right:8px}.theme-yi .ys-tag.yq-on{background:#3f6b4a}');
  document.head.appendChild(st);

  /* ---------- 播放：同一时刻只放一个声音 ---------- */
  var cache = {}, playing = null;   // playing = { audios:[], timers:[], btn, label, done }
  function stopAll() {
    if (!playing) return;
    var p = playing; playing = null;
    p.timers.forEach(clearTimeout);
    p.audios.forEach(function (a) { try { a.pause(); a.currentTime = 0; } catch (e) {} });
    p.btn.textContent = p.label; p.btn.classList.remove('yq-on');
  }
  function audio(file) {
    if (!cache[file]) { var a = new Audio('audio/' + file); a.preload = 'auto'; cache[file] = a; }
    return cache[file];
  }
  function playFiles(files, gap, btn, label) {
    var wasSame = playing && playing.btn === btn;
    stopAll();
    if (wasSame) return;
    var p = { audios: [], timers: [], btn: btn, label: label };
    playing = p; btn.textContent = '■ 停'; btn.classList.add('yq-on');
    files.forEach(function (f, i) {
      var a = audio(f); p.audios.push(a);
      p.timers.push(setTimeout(function () {
        if (playing !== p) return;
        try { a.currentTime = 0; var r = a.play(); if (r && r.catch) r.catch(function () { stopAll(); }); } catch (e) { stopAll(); }
        if (i === files.length - 1) {
          a.onended = function () { if (playing === p) stopAll(); };
        }
      }, i * gap));
    });
    // 保险：最后一个文件不触发 ended 时也收尾
    p.timers.push(setTimeout(function () { if (playing === p) stopAll(); }, (files.length - 1) * gap + 60000));
  }

  function credit(c, info) {
    var p = el('p', { 'class': 'yq-credit' });
    p.appendChild(document.createTextNode('🔊 ' + info.who + ' · '));
    var a = el('a', { href: info.link, target: '_blank', rel: 'noopener' }, (info.site || '维基共享资源') + ' · ' + info.lic);
    p.appendChild(a);
    c.appendChild(p);
  }

  function decorate() {
    var cards = root.querySelectorAll('details.zy-card');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      if (c.getAttribute('data-yq')) continue;
      var nameEl = c.querySelector('.zy-card-name');
      if (!nameEl) continue;
      var name = nameEl.textContent.trim();
      var isWu = WU.hasOwnProperty(name) && c.closest && !!c.closest('section, div');
      if (!CARDS.hasOwnProperty(name) && !isWu) continue;
      c.setAttribute('data-yq', '1');
      var bar = el('span', {});
      if (isWu) {
        var b1 = el('button', { 'class': 'ys-tag yq-tag', type: 'button', 'aria-label': '听“' + name + '”音' }, '▶ 听');
        var b2 = el('button', { 'class': 'ys-tag yq-tag', type: 'button', 'aria-label': '依次听宫商角徵羽' }, '▶ 依次听五声');
        (function (nm, x, y) {
          x.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); playFiles(['wusheng_' + WU[nm] + '.wav'], 0, x, '▶ 听'); });
          y.addEventListener('click', function (e) {
            e.preventDefault(); e.stopPropagation();
            playFiles(WU_ORDER.map(function (k) { return 'wusheng_' + WU[k] + '.wav'; }), 700, y, '▶ 依次听五声');
          });
          [x, y].forEach(function (b) { b.addEventListener('keydown', function (e) { e.stopPropagation(); }); });
        })(name, b1, b2);
        bar.appendChild(b1); bar.appendChild(b2);
        credit(c, WU_CREDIT);
      } else {
        var info = SRC[CARDS[name]];
        var b = el('button', { 'class': 'ys-tag yq-tag', type: 'button', 'aria-label': '听' + name + '的录音' }, '▶ 听');
        (function (x, inf) {
          x.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); playFiles([inf.f], 0, x, '▶ 听'); });
          x.addEventListener('keydown', function (e) { e.stopPropagation(); });
        })(b, info);
        bar.appendChild(b);
        credit(c, info);
      }
      nameEl.parentNode.insertBefore(bar, nameEl.nextSibling);
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
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopAll(); });
})();
