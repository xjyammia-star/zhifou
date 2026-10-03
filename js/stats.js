/* 知否知否 · 数据统计弹窗
   ----------------------------------------------------------
   页脚“数据统计”按钮（由 nav.js 放上去）第一次被点击时，才加载本文件和 data/site-stats.js，所以平时不增加页面负担。
   数字全部来自 data/site-stats.js，那个文件由 工具脚本\生成站点统计.js 从各板块数据自动数出来，不要手改。
   弹窗：Esc、点遮罩、点右上角×都能关；打开时页面不再滚动；系统开了“减少动态效果”就不做数字滚动。 */
(function () {
  'use strict';
  if (window.ZFStats) return;

  var CSS = [
    '.zfs-ov{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(12,9,7,.7);',
    '-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);animation:zfsIn .18s ease-out both}',
    '@keyframes zfsIn{from{opacity:0}to{opacity:1}}',
    '.zfs-panel{position:relative;box-sizing:border-box;width:100%;max-width:780px;max-height:90vh;overflow:auto;padding:22px 22px 26px;color:#f3e9d6;',
    'background:#1f1a16;border:1px solid #c2a15a;border-radius:12px;box-shadow:0 18px 60px rgba(0,0,0,.55);font-size:14px;line-height:1.7;',
    'font-family:"Noto Serif SC","Songti SC","Source Han Serif SC",serif;-webkit-overflow-scrolling:touch}',
    '.zfs-panel *{box-sizing:border-box}',
    '.zfs-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px}',
    '.zfs-title{margin:0;font-family:"Ma Shan Zheng","Noto Serif SC",serif;font-size:30px;line-height:1.2;font-weight:400;letter-spacing:.12em;color:#f6e7c1}',
    '.zfs-sub{margin:4px 0 0;font-size:12.5px;letter-spacing:.14em;color:#b9ad97}',
    '.zfs-x{flex:none;width:36px;height:36px;padding:0;border:0;border-radius:50%;background:transparent;color:#f3e9d6;font-size:24px;line-height:1;cursor:pointer}',
    '.zfs-x:hover,.zfs-x:focus-visible{background:rgba(194,161,90,.2)}',
    '.zfs-hero{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0 0 20px}',
    '.zfs-card{padding:12px 12px 10px;border:1px solid rgba(194,161,90,.4);border-radius:10px;background:rgba(194,161,90,.07);text-align:center}',
    '.zfs-n{font-family:"Ma Shan Zheng","Noto Serif SC",serif;font-size:36px;line-height:1.15;color:#f0d28a;white-space:nowrap}',
    '.zfs-u{margin-left:3px;font-size:13px;color:#d9c38e}',
    '.zfs-l{margin-top:2px;font-size:14px;letter-spacing:.1em;color:#f3e9d6}',
    '.zfs-nt{margin-top:2px;font-size:11.5px;line-height:1.55;color:#a99d88}',
    '.zfs-h2{margin:22px 0 10px;font-size:13px;letter-spacing:.3em;color:#c2a15a;font-weight:400;display:flex;align-items:center;gap:10px}',
    '.zfs-h2::after{content:"";flex:1;height:1px;background:rgba(194,161,90,.3)}',
    '.zfs-rows{display:grid;grid-template-columns:repeat(2,1fr);gap:2px 26px}',
    '.zfs-row{display:flex;align-items:baseline;gap:8px;padding:4px 0;border-bottom:1px dashed rgba(243,233,214,.14)}',
    '.zfs-row .a{flex:1;min-width:0}',
    '.zfs-row .a small{display:block;font-size:11.5px;line-height:1.5;color:#a99d88}',
    '.zfs-row .b{flex:none;font-size:17px;color:#f0d28a;white-space:nowrap}',
    '.zfs-row .b i{font-style:normal;margin-left:2px;font-size:12px;color:#d9c38e}',
    '.zfs-han{margin:0 0 4px;padding:12px 14px;border:1px solid rgba(194,161,90,.3);border-radius:10px;background:rgba(194,161,90,.05)}',
    '.zfs-han p{margin:0 0 8px}',
    '.zfs-chars{display:flex;flex-wrap:wrap;gap:5px}',
    '.zfs-chars span{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:1px solid rgba(194,161,90,.45);border-radius:4px;',
    'font-family:"Ma Shan Zheng","Noto Serif SC",serif;font-size:18px;color:#f6e7c1}',
    '.zfs-tools{display:flex;justify-content:flex-end;margin:-4px 0 8px}',
    '.zfs-tog{padding:3px 12px;border:1px solid #c2a15a;border-radius:999px;background:transparent;color:#e6d2a0;font:inherit;font-size:12px;letter-spacing:.1em;cursor:pointer}',
    '.zfs-tog:hover{background:rgba(194,161,90,.18)}',
    '.zfs-b{margin:0 0 8px;border:1px solid rgba(194,161,90,.28);border-radius:10px;background:rgba(243,233,214,.03)}',
    '.zfs-b>summary{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px 12px;padding:10px 14px;cursor:pointer;list-style:none}',
    '.zfs-b>summary::-webkit-details-marker{display:none}',
    '.zfs-b>summary::before{content:"＋";flex:none;width:16px;color:#c2a15a}',
    '.zfs-b[open]>summary::before{content:"－"}',
    '.zfs-bn{font-family:"Ma Shan Zheng","Noto Serif SC",serif;font-size:21px;letter-spacing:.2em;color:#f6e7c1}',
    '.zfs-bm{font-size:12px;color:#a99d88}',
    '.zfs-b .zfs-rows{padding:2px 14px 12px}',
    '.zfs-foot{margin:18px 0 0;font-size:11.5px;line-height:1.75;color:#8f8470}',
    '@media (max-width:640px){.zfs-hero{grid-template-columns:repeat(2,1fr)}.zfs-rows{grid-template-columns:1fr}.zfs-panel{padding:18px 16px 22px}.zfs-n{font-size:32px}.zfs-title{font-size:26px}}',
    '@media (prefers-reduced-motion:reduce){.zfs-ov{animation:none}}'
  ].join('');

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function fmt(n) {
    if (typeof n !== 'number') return String(n);
    return n % 1 ? n.toFixed(1) : n.toLocaleString('en-US');
  }
  var reduce = false;
  try { reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { reduce = false; }

  /* 数字从 0 滚到目标值 */
  function countUp(node, to) {
    if (reduce || typeof to !== 'number') { node.textContent = fmt(to); return; }
    var t0 = 0, dur = 750, dec = to % 1 ? 1 : 0;
    function frame(now) {
      if (!t0) t0 = now;
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3), v = to * e;
      node.textContent = dec ? v.toFixed(1) : Math.round(v).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(frame); else node.textContent = fmt(to);
    }
    requestAnimationFrame(frame);
  }

  function rowNode(r) {
    var row = el('div', 'zfs-row');
    var a = el('span', 'a', r.label);
    if (r.note) a.appendChild(el('small', '', r.note));
    var b = el('span', 'b', fmt(r.n));
    b.appendChild(el('i', '', r.unit || ''));
    row.appendChild(a); row.appendChild(b);
    return row;
  }

  var overlay = null, lastFocus = null;

  function build(S) {
    var ov = el('div', 'zfs-ov');
    ov.setAttribute('role', 'presentation');
    var panel = el('div', 'zfs-panel');
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', '数据统计');

    var head = el('div', 'zfs-head');
    var tt = el('div');
    tt.appendChild(el('h2', 'zfs-title', '数据一览'));
    tt.appendChild(el('p', 'zfs-sub', '知否知否 · 中国传统文化百科'));
    var x = el('button', 'zfs-x', '×'); x.type = 'button'; x.setAttribute('aria-label', '关闭');
    head.appendChild(tt); head.appendChild(x); panel.appendChild(head);

    /* 亮点数字 */
    var hero = el('div', 'zfs-hero'); var nums = [];
    S.hero.forEach(function (h) {
      var c = el('div', 'zfs-card');
      var n = el('div', 'zfs-n'); var num = el('span', '', fmt(h.n)); n.appendChild(num); n.appendChild(el('span', 'zfs-u', h.unit));
      c.appendChild(n); c.appendChild(el('div', 'zfs-l', h.label)); c.appendChild(el('div', 'zfs-nt', h.note));
      hero.appendChild(c); nums.push([num, h.n]);
    });
    panel.appendChild(hero);

    /* 全站规模 */
    panel.appendChild(el('h3', 'zfs-h2', '全站规模'));
    var ov2 = el('div', 'zfs-rows'); S.overview.forEach(function (r) { ov2.appendChild(rowNode(r)); }); panel.appendChild(ov2);

    /* 汉字页 */
    panel.appendChild(el('h3', 'zfs-h2', '汉字页'));
    var han = el('div', 'zfs-han');
    han.appendChild(el('p', '', '汉字页本身的文字量约 ' + fmt(S.hanzi.chars) + ' 字；页面里讲解的字例共 ' + S.hanzi.examples + ' 个（去重后）：'));
    var chars = el('div', 'zfs-chars'); S.hanzi.list.forEach(function (c) { chars.appendChild(el('span', '', c)); });
    han.appendChild(chars); panel.appendChild(han);

    /* 分板块 */
    panel.appendChild(el('h3', 'zfs-h2', '分板块'));
    var tools = el('div', 'zfs-tools'); var tog = el('button', 'zfs-tog', '全部展开'); tog.type = 'button'; tools.appendChild(tog); panel.appendChild(tools);
    var details = [];
    S.boards.forEach(function (b) {
      var d = el('details', 'zfs-b'); details.push(d);
      var s = el('summary');
      s.appendChild(el('span', 'zfs-bn', b.name));
      s.appendChild(el('span', 'zfs-bm', b.pages + ' 个栏目 · 页面文字约 ' + fmt(b.chars) + ' 万字 · ' + b.line));
      d.appendChild(s);
      var rows = el('div', 'zfs-rows'); b.rows.forEach(function (r) { rows.appendChild(rowNode(r)); }); d.appendChild(rows);
      panel.appendChild(d);
    });
    tog.addEventListener('click', function () {
      var open = tog.textContent === '全部展开';
      details.forEach(function (d) { d.open = open; });
      tog.textContent = open ? '全部收起' : '全部展开';
    });

    panel.appendChild(el('p', 'zfs-foot', '这些数字由脚本从站内各板块的数据自动数出来，内容更新后会跟着更新。' +
      '古籍、墓葬、诗词曲等按各自页面里的条目计；乐器、游戏按去重后的名称计，乐器含“八音”分类里点到的；“页面文字”指站内可读正文的汉字数，不含图片里的字。'));

    ov.appendChild(panel);
    return { ov: ov, panel: panel, close: x, nums: nums };
  }

  function close() {
    if (!overlay) return;
    document.removeEventListener('keydown', onKey, true);
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* 忽略 */ } }
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
    if (e.key !== 'Tab' || !overlay) return;
    /* 让键盘焦点只在弹窗里转 */
    var f = overlay.querySelectorAll('button, summary');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open() {
    if (overlay || !window.ZF_STATS) return;
    if (!document.getElementById('zfs-style')) { var st = document.createElement('style'); st.id = 'zfs-style'; st.textContent = CSS; document.head.appendChild(st); }
    lastFocus = document.activeElement;
    var b = build(window.ZF_STATS);
    overlay = b.ov;
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    b.close.addEventListener('click', close);
    document.body.appendChild(overlay);
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey, true);
    b.close.focus();
    b.nums.forEach(function (p) { countUp(p[0], p[1]); });
  }

  window.ZFStats = { open: open, close: close };
})();
