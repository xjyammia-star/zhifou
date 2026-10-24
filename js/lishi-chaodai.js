/* 知否知否 · 历史 · 朝代页（通用）
   用法：lishi-chaodai.html?d=qin  （d 是朝代代号，见 data/lishi-index.js）
   数据：data/lishi-<代号>.js（由 工具脚本/生成历史数据.py 自动生成），按需加载，不一次全读；
         data/lishi-names.js 是“人名 → 在哪个朝代、哪张卡片”的对照表，用来把文中提到的人物连起来。
   点帝王或人物，弹出一个居中的小窗口显示介绍（和唐诗、宋词一样）；窗口里提到的其他人物也能点开，并有“返回”。
   排版工具：js/zycommon.js */
(function () {
  'use strict';
  var I = window.ZHIFOU_LISHI_INDEX, Z = window.ZY;
  var NAMES = window.ZHIFOU_LISHI_NAMES || {};
  var root = document.getElementById('app');
  if (!I || !Z || !root) return;
  var el = Z.el;

  var readyList = I.dynasties.filter(function (d) { return d.ready; });
  var key = Z.qs('d') || (readyList[0] && readyList[0].key);
  var meta = null;
  I.dynasties.forEach(function (d) { if (d.key === key) meta = d; });
  var dynName = {};
  I.dynasties.forEach(function (d) { dynName[d.key] = d.name; });

  /* ---------- 小工具 ---------- */
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var nameRe = null;
  (function () {
    var ks = Object.keys(NAMES).filter(function (k) { return k.length >= 2; }).sort(function (a, b) { return b.length - a.length; });
    if (ks.length) nameRe = new RegExp(ks.map(esc).join('|'), 'g');
  })();

  var openEntity = function () {};   /* 后面再定义：打开一张人物/帝王卡 */

  /* 一段纯文字里，把人名变成可点的链接。ctx = { d: 当前朝代, skip: {不用连的名字}, used: {已经连过的名字} } */
  function linkify(text, ctx) {
    if (!text) return [];
    if (!nameRe || !ctx) return [text];
    var out = [], last = 0, m;
    nameRe.lastIndex = 0;
    while ((m = nameRe.exec(text))) {
      var nm = m[0];
      if (ctx.skip[nm] || ctx.used[nm]) continue;
      var cand = NAMES[nm] || [], pick = null;
      cand.forEach(function (c) { if (!pick && c[0] === ctx.d) pick = c; });
      if (!pick) pick = cand[0];
      if (!pick) continue;
      if (m.index > last) out.push(text.slice(last, m.index));
      var a = el('a', { 'class': 'ss-ref', href: '#', 'data-d': pick[0], 'data-n': pick[1], title: '看看' + nm + '的介绍', text: nm });
      out.push(a);
      ctx.used[nm] = 1;
      last = m.index + nm.length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }

  /* 文字 → 节点：“〔待核〕”换成红色小标记，人名连成链接 */
  function rich(t, ctx) {
    var out = [];
    String(t || '').split(/(〔[^〕]*待核[^〕]*〕)/).forEach(function (p) {
      if (!p) return;
      if (/^〔[^〕]*待核[^〕]*〕$/.test(p)) out.push(el('em', { 'class': 'ss-check', text: '待核' }));
      else linkify(p, ctx).forEach(function (n) { out.push(n); });
    });
    return out;
  }
  function gradeEl(g) {
    if (g === '待核') return el('em', { 'class': 'ss-check', text: '待核' });
    if (g === '部分待核') return el('em', { 'class': 'ss-check is-part', text: '部分待核' });
    return null;
  }
  function newCtx(d, selfNames) {
    var skip = {};
    (selfNames || []).forEach(function (n) { skip[n] = 1; });
    return { d: d, skip: skip, used: {} };
  }
  function span(t, ctx) { return el('span', {}, rich(t, ctx)); }
  function ul(items) {
    return el('ul', { 'class': 'ss-list' }, items.map(function (x) { return el('li', {}, x); }));
  }
  function cut(s, n) { s = s || ''; return s.length > n ? s.slice(0, n) + '…' : s; }
  function fieldOf(card, k) {
    for (var i = 0; i < card.f.length; i++) if (card.f[i].k === k) return card.f[i].v || '';
    return '';
  }

  /* 加载某个朝代的数据（已经读过的不再读） */
  function ensureData(dKey, cb) {
    var all = window.ZHIFOU_LISHI || {};
    if (all[dKey]) { cb(all[dKey]); return; }
    var ok = false;
    I.dynasties.forEach(function (d) { if (d.key === dKey && d.ready) ok = true; });
    if (!ok) return;
    var s = document.createElement('script');
    s.src = 'data/lishi-' + dKey + '.js';
    s.onload = function () { var a = window.ZHIFOU_LISHI || {}; if (a[dKey]) cb(a[dKey]); };
    document.head.appendChild(s);
  }
  function findCard(D, name) {
    var i;
    for (i = 0; i < D.keyEmperors.length; i++) if (D.keyEmperors[i].name === name) return { card: D.keyEmperors[i], kind: '帝王' };
    for (i = 0; i < D.people.length; i++) if (D.people[i].name === name) return { card: D.people[i], kind: '人物' };
    return null;
  }

  /* ---------- 页头与切换条 ---------- */
  function dynBar() {
    var nav = el('nav', { 'class': 'ss-dynbar', 'aria-label': '切换朝代' });
    I.dynasties.forEach(function (d) {
      if (d.ready) nav.appendChild(el('a', { href: 'lishi-chaodai.html?d=' + d.key, 'aria-current': d.key === key ? 'page' : null, text: d.name }));
      else nav.appendChild(el('span', { 'class': 'is-soon', title: '整理中', text: d.name }));
    });
    return nav;
  }

  function fail(msg) {
    Z.mount(root, [
      el('header', { 'class': 'zy-head' }, [el('div', { 'class': 'zy-eyebrow', text: '历史' }), el('h1', { 'class': 'zy-hook', text: '这个朝代还在整理中' }), el('p', { 'class': 'zy-answer', text: msg })]),
      dynBar(),
      el('p', {}, [el('a', { href: 'lishi.html', text: '回到历史总览 →' })])
    ]);
  }

  if (!meta || !meta.ready) { fail(meta ? meta.name + '的内容还在整理，核对完成后会上线。' : '没有找到这个朝代。'); return; }

  ensureData(meta.key, function (D) { render(D); });
  setTimeout(function () { if (!(window.ZHIFOU_LISHI && window.ZHIFOU_LISHI[meta.key]) && !document.querySelector('.zy-page')) fail('数据读取失败，请刷新再试。'); }, 8000);

  /* ---------- 弹窗 ---------- */
  var modal = null, stack = [], curEnt = null, lastFocus = null;

  function setQs(id) {
    try {
      var u = new URL(location.href);
      if (id) u.searchParams.set('id', id); else u.searchParams.delete('id');
      history.replaceState(null, '', u.toString());
    } catch (e) { /* 忽略 */ }
  }

  function buildModal() {
    var back = el('button', { 'class': 'ss-modal-back', type: 'button', text: '← 返回' });
    var closeBtn = el('button', { 'class': 'ss-modal-close', type: 'button', 'aria-label': '关闭' }, [el('span', { 'aria-hidden': 'true', text: '×' })]);
    var tag = el('div', { 'class': 'ss-modal-tag' });
    var title = el('h3', { 'class': 'ss-modal-title' });
    var facts = el('div', { 'class': 'ss-modal-facts' });
    var body = el('div', { 'class': 'ss-modal-body' });
    var card = el('div', { 'class': 'ss-modal-card', role: 'dialog', 'aria-modal': 'true', 'aria-label': '详细介绍' }, [back, closeBtn, tag, title, facts, body]);
    var overlay = el('div', { 'class': 'ss-modal-overlay', 'aria-hidden': 'true' }, [card]);
    document.body.appendChild(overlay);

    function close() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('ss-noscroll');
      stack = []; curEnt = null;
      setQs(null);
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* 忽略 */ } }
    }
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    closeBtn.addEventListener('click', close);
    back.addEventListener('click', function () {
      var prev = stack.pop();
      if (prev) openEntity(prev.d, prev.name, false);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });
    /* 窗口里的人名链接 */
    body.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a.ss-ref') : null;
      if (!a) return;
      e.preventDefault();
      openEntity(a.getAttribute('data-d'), a.getAttribute('data-n'), true);
    });
    return { overlay: overlay, card: card, back: back, tag: tag, title: title, facts: facts, body: body, closeBtn: closeBtn };
  }

  /* 有人物像的卡片：朝代代号/卡片名 -> 登记名（lishiren/…） */
  var PORTRAIT = { 'qin/秦始皇': '秦始皇', 'xihan/汉高祖': '刘邦', 'qin/项羽': '项羽', 'qin/陈胜': '陈胜', 'qin/徐福': '徐福', 'xihan/霍去病': '霍去病', 'xihan/张骞': '张骞', 'xihan/苏武': '苏武', 'donghan/班超': '班超', 'donghan/蔡伦': '蔡伦', 'donghan/张衡': '张衡', 'donghan/华佗': '华佗', 'donghan/董卓': '董卓', 'xihan/汉武帝': '汉武帝', 'xihan/司马迁': '司马迁', 'nanbeichao/北魏孝文帝': '北魏孝文帝', 'nanbeichao/祖冲之': '祖冲之', 'nanbeichao/郦道元': '郦道元', 'nanbeichao/贾思勰': '贾思勰', 'nanbeichao/范缜': '范缜', 'nanbeichao/梁武帝': '梁武帝', 'nanbeichao/陶弘景': '陶弘景', 'nanbeichao/谢灵运': '谢灵运', 'nanbeichao/刘勰': '刘勰', 'sui/隋文帝': '隋文帝', 'sui/隋炀帝': '隋炀帝', 'sui/独孤皇后': '独孤皇后', 'sui/高颎': '高颎', 'sui/宇文恺': '宇文恺', 'sui/李春': '李春', 'sui/裴矩': '裴矩', 'sui/智顗': '智顗', 'sui/陆法言': '陆法言', 'sui/李密': '李密', 'tang/唐高祖': '唐高祖', 'tang/唐太宗': '唐太宗', 'tang/唐高宗': '唐高宗', 'tang/武则天': '武则天', 'tang/唐玄宗': '唐玄宗', 'tang/唐宪宗': '唐宪宗', 'tang/房玄龄': '房玄龄', 'tang/魏徵': '魏徵', 'tang/李靖': '李靖', 'tang/狄仁杰': '狄仁杰', 'tang/张九龄': '张九龄', 'tang/郭子仪': '郭子仪', 'tang/颜真卿': '颜真卿', 'tang/刘晏': '刘晏', 'tang/玄奘': '玄奘', 'tang/孙思邈': '孙思邈', 'tang/鉴真': '鉴真', 'tang/一行': '一行', 'tang/文成公主': '文成公主', 'tang/杜佑': '杜佑', 'wudai/后梁太祖': '后梁太祖', 'wudai/后唐庄宗': '后唐庄宗', 'wudai/后唐明宗': '后唐明宗', 'wudai/后晋高祖': '后晋高祖', 'wudai/后周太祖': '后周太祖', 'wudai/后周世宗': '后周世宗', 'wudai/吴越武肃王': '吴越武肃王', 'wudai/南唐烈祖': '南唐烈祖', 'wudai/南唐后主': '南唐后主', 'wudai/前蜀高祖': '前蜀高祖', 'wudai/后蜀后主': '后蜀后主', 'wudai/楚武穆王': '楚武穆王', 'wudai/闽忠懿王': '闽忠懿王', 'wudai/南汉高祖': '南汉高祖', 'wudai/冯道': '冯道', 'wudai/周德威': '周德威', 'wudai/张承业': '张承业', 'wudai/桑维翰': '桑维翰', 'wudai/王朴': '王朴', 'wudai/钱弘俶': '钱弘俶', 'wudai/毋昭裔': '毋昭裔', 'wudai/文益': '文益', 'beisong/北宋太祖': '北宋太祖', 'beisong/北宋太宗': '北宋太宗', 'beisong/北宋真宗': '北宋真宗', 'beisong/北宋仁宗': '北宋仁宗', 'beisong/北宋英宗': '北宋英宗', 'beisong/北宋神宗': '北宋神宗', 'beisong/北宋哲宗': '北宋哲宗', 'beisong/北宋徽宗': '北宋徽宗', 'beisong/北宋钦宗': '北宋钦宗', 'beisong/赵普': '赵普', 'beisong/曹彬': '曹彬', 'beisong/寇准': '寇准', 'beisong/范仲淹': '范仲淹', 'beisong/欧阳修': '欧阳修', 'beisong/包拯': '包拯', 'beisong/王安石': '王安石', 'beisong/司马光': '司马光', 'beisong/苏轼': '苏轼', 'beisong/沈括': '沈括', 'beisong/苏颂': '苏颂', 'beisong/狄青': '狄青', 'beisong/李纲': '李纲', 'beisong/章献刘太后（刘娥）': '章献刘太后', 'liao/辽太祖': '辽太祖', 'liao/辽太宗': '辽太宗', 'liao/辽世宗': '辽世宗', 'liao/辽穆宗': '辽穆宗', 'liao/辽景宗': '辽景宗', 'liao/辽圣宗': '辽圣宗', 'liao/辽兴宗': '辽兴宗', 'liao/辽道宗': '辽道宗', 'liao/辽天祚帝': '辽天祚帝', 'liao/述律平': '述律平', 'liao/耶律倍': '耶律倍', 'liao/韩延徽': '韩延徽', 'liao/耶律屋质': '耶律屋质', 'liao/萧绰': '萧绰', 'liao/耶律隆运': '耶律隆运', 'liao/耶律休哥': '耶律休哥', 'liao/耶律仁先': '耶律仁先', 'liao/耶律乙辛': '耶律乙辛', 'liao/萧观音': '萧观音', 'xixia/西夏景宗': '西夏景宗', 'xixia/西夏毅宗': '西夏毅宗', 'xixia/西夏惠宗': '西夏惠宗', 'xixia/西夏崇宗': '西夏崇宗', 'xixia/西夏仁宗': '西夏仁宗', 'xixia/西夏桓宗': '西夏桓宗', 'xixia/西夏襄宗': '西夏襄宗', 'xixia/西夏神宗': '西夏神宗', 'xixia/西夏献宗': '西夏献宗', 'xixia/西夏末帝': '西夏末帝', 'xixia/李继迁': '李继迁', 'xixia/李德明': '李德明', 'xixia/野利仁荣': '野利仁荣', 'xixia/没藏氏': '没藏氏', 'xixia/梁氏（惠宗母）': '梁氏惠宗母', 'xixia/任得敬': '任得敬', 'xixia/骨勒茂才': '骨勒茂才', 'xixia/高良惠': '高良惠', 'xixia/种世衡': '种世衡', 'nansong/南宋高宗': '南宋高宗', 'nansong/南宋孝宗': '南宋孝宗', 'nansong/南宋光宗': '南宋光宗', 'nansong/南宋宁宗': '南宋宁宗', 'nansong/南宋理宗': '南宋理宗', 'nansong/南宋度宗': '南宋度宗', 'nansong/南宋恭帝': '南宋恭帝', 'nansong/南宋端宗': '南宋端宗', 'nansong/南宋帝昺': '南宋帝昺', 'nansong/宗泽': '宗泽', 'nansong/岳飞': '岳飞', 'nansong/韩世忠': '韩世忠', 'nansong/秦桧': '秦桧', 'nansong/虞允文': '虞允文', 'nansong/朱熹': '朱熹', 'nansong/贾似道': '贾似道', 'nansong/孟珙': '孟珙', 'nansong/谢道清': '谢道清', 'nansong/文天祥': '文天祥', 'nansong/陆秀夫': '陆秀夫', 'nansong/宋慈': '宋慈', 'jin/金太祖': '金太祖', 'jin/金太宗': '金太宗', 'jin/金熙宗': '金熙宗', 'jin/金海陵王': '金海陵王', 'jin/金世宗': '金世宗', 'jin/金章宗': '金章宗', 'jin/金卫绍王': '金卫绍王', 'jin/金宣宗': '金宣宗', 'jin/金哀宗': '金哀宗', 'jin/金末帝': '金末帝', 'jin/完颜宗翰': '完颜宗翰', 'jin/完颜宗弼': '完颜宗弼', 'jin/完颜娄室': '完颜娄室', 'jin/完颜希尹': '完颜希尹', 'jin/韩企先': '韩企先', 'jin/乌林答氏': '乌林答氏', 'jin/徒单克宁': '徒单克宁', 'jin/洪皓': '洪皓', 'jin/完颜陈和尚': '完颜陈和尚', 'jin/赵秉文': '赵秉文', 'jin/刘完素': '刘完素', 'jin/王重阳': '王重阳', 'yuan/元太祖': '元太祖', 'yuan/元太宗': '元太宗', 'yuan/元宪宗': '元宪宗', 'yuan/元世祖': '元世祖', 'yuan/元成宗': '元成宗', 'yuan/元武宗': '元武宗', 'yuan/元仁宗': '元仁宗', 'yuan/元英宗': '元英宗', 'yuan/元泰定帝': '元泰定帝', 'yuan/元文宗': '元文宗', 'yuan/元顺帝': '元顺帝', 'yuan/木华黎': '木华黎', 'yuan/速不台': '速不台', 'yuan/耶律楚材': '耶律楚材', 'yuan/丘处机': '丘处机', 'yuan/八思巴': '八思巴', 'yuan/刘秉忠': '刘秉忠', 'yuan/郭守敬': '郭守敬', 'yuan/伯颜（灭宋）': '伯颜灭宋', 'yuan/察必皇后': '察必皇后', 'yuan/黄道婆': '黄道婆', 'yuan/脱脱': '脱脱', 'yuan/刘福通': '刘福通', 'yuan/奇皇后': '奇皇后', 'ming/明太祖': '明太祖', 'ming/明惠帝': '明惠帝', 'ming/明成祖': '明成祖', 'ming/明仁宗': '明仁宗', 'ming/明宣宗': '明宣宗', 'ming/明英宗': '明英宗', 'ming/明代宗': '明代宗', 'ming/明宪宗': '明宪宗', 'ming/明孝宗': '明孝宗', 'ming/明武宗': '明武宗', 'ming/明世宗': '明世宗', 'ming/明穆宗': '明穆宗', 'ming/明神宗': '明神宗', 'ming/明熹宗': '明熹宗', 'ming/明思宗': '明思宗', 'ming/徐达': '徐达', 'ming/刘基': '刘基', 'ming/方孝孺': '方孝孺', 'ming/姚广孝': '姚广孝', 'ming/郑和': '郑和', 'ming/杨士奇': '杨士奇', 'ming/于谦': '于谦', 'ming/王振': '王振', 'ming/刘瑾': '刘瑾', 'ming/王守仁': '王守仁', 'ming/严嵩': '严嵩', 'ming/徐阶': '徐阶', 'ming/戚继光': '戚继光', 'ming/海瑞': '海瑞', 'ming/张居正': '张居正', 'ming/魏忠贤': '魏忠贤', 'ming/袁崇焕': '袁崇焕', 'ming/李自成': '李自成', 'ming/马皇后（朱元璋后）': '马皇后', 'ming/张皇后（仁宗后）': '张皇后', 'ming/李时珍': '李时珍', 'ming/徐光启': '徐光启', 'ming/宋应星': '宋应星', 'ming/徐霞客': '徐霞客', 'ming/利玛窦': '利玛窦', 'qing/清太祖': '清太祖', 'qing/清太宗': '清太宗', 'qing/清世祖': '清世祖', 'qing/清圣祖': '清圣祖', 'qing/清世宗': '清世宗', 'qing/清高宗': '清高宗', 'qing/清仁宗': '清仁宗', 'qing/清宣宗': '清宣宗', 'qing/清文宗': '清文宗', 'qing/清穆宗': '清穆宗', 'qing/清德宗': '清德宗', 'qing/清宣统帝': '清宣统帝', 'qing/多尔衮': '多尔衮', 'qing/孝庄文皇后': '孝庄文皇后', 'qing/范文程': '范文程', 'qing/郑成功': '郑成功', 'qing/施琅': '施琅', 'qing/汤若望': '汤若望', 'qing/张廷玉': '张廷玉', 'qing/和珅': '和珅', 'qing/纪昀': '纪昀', 'qing/林则徐': '林则徐', 'qing/魏源': '魏源', 'qing/洪秀全': '洪秀全', 'qing/曾国藩': '曾国藩', 'qing/左宗棠': '左宗棠', 'qing/李鸿章': '李鸿章', 'qing/奕訢': '奕訢', 'qing/慈禧太后': '慈禧太后', 'qing/张之洞': '张之洞', 'qing/翁同龢': '翁同龢', 'qing/康有为': '康有为', 'qing/梁启超': '梁启超', 'qing/谭嗣同': '谭嗣同', 'qing/刘铭传': '刘铭传', 'qing/沈葆桢': '沈葆桢', 'qing/梅文鼎': '梅文鼎', 'qing/代善': '代善', 'qing/济尔哈朗': '济尔哈朗', 'qing/索尼': '索尼', 'qing/吴三桂': '吴三桂', 'qing/鳌拜': '鳌拜', 'qing/索额图': '索额图', 'qing/明珠': '明珠', 'qing/靳辅': '靳辅', 'qing/于成龙（北溟）': '于成龙', 'qing/李光地': '李光地', 'qing/南怀仁': '南怀仁', 'qing/年羹尧': '年羹尧', 'qing/隆科多': '隆科多', 'qing/鄂尔泰': '鄂尔泰', 'qing/田文镜': '田文镜', 'qing/允祥': '允祥', 'qing/李卫': '李卫', 'qing/傅恒': '傅恒', 'qing/阿桂': '阿桂', 'qing/福康安': '福康安', 'qing/兆惠': '兆惠', 'qing/戴震': '戴震', 'qing/琦善': '琦善', 'qing/关天培': '关天培', 'qing/陶澍': '陶澍', 'qing/耆英': '耆英', 'qing/杨秀清': '杨秀清', 'qing/李秀成': '李秀成', 'qing/洪仁玕': '洪仁玕', 'qing/胡林翼': '胡林翼', 'qing/僧格林沁': '僧格林沁', 'qing/肃顺': '肃顺', 'qing/文祥': '文祥', 'qing/慈安太后': '慈安太后', 'qing/刘坤一': '刘坤一', 'qing/荣禄': '荣禄', 'qing/载沣': '载沣', 'qing/隆裕太后': '隆裕太后', 'qing/盛宣怀': '盛宣怀', 'qing/赫德': '赫德', 'xiashangzhou/夏禹': '夏禹', 'xiashangzhou/夏启': '夏启', 'xiashangzhou/夏桀': '夏桀', 'xiashangzhou/商汤': '商汤', 'xiashangzhou/商盘庚': '商盘庚', 'xiashangzhou/商武丁': '商武丁', 'xiashangzhou/商帝辛': '商帝辛', 'xiashangzhou/周武王': '周武王', 'xiashangzhou/周成王': '周成王', 'xiashangzhou/周康王': '周康王', 'xiashangzhou/周昭王': '周昭王', 'xiashangzhou/周穆王': '周穆王', 'xiashangzhou/周厉王': '周厉王', 'xiashangzhou/周宣王': '周宣王', 'xiashangzhou/周幽王': '周幽王', 'xiashangzhou/伊尹': '伊尹', 'xiashangzhou/傅说': '傅说', 'xiashangzhou/妇好': '妇好', 'xiashangzhou/箕子': '箕子', 'xiashangzhou/微子启': '微子启', 'xiashangzhou/比干': '比干', 'xiashangzhou/周文王': '周文王', 'xiashangzhou/吕尚': '吕尚', 'xiashangzhou/周公旦': '周公旦', 'xiashangzhou/召公奭': '召公奭', 'xiashangzhou/伯禽': '伯禽', 'xiashangzhou/康叔': '康叔', 'xiashangzhou/祭公谋父': '祭公谋父', 'xiashangzhou/召穆公': '召穆公', 'xiashangzhou/芮良夫': '芮良夫', 'xiashangzhou/共伯和': '共伯和', 'xiashangzhou/尹吉甫': '尹吉甫', 'xiashangzhou/仲山甫': '仲山甫', 'xiashangzhou/申侯': '申侯', 'xiashangzhou/郑桓公': '郑桓公', 'xiashangzhou/史伯': '史伯', 'xiashangzhou/秦非子': '秦非子', 'xiashangzhou/太伯与仲雍': '太伯与仲雍', 'xiashangzhou/管叔与蔡叔': '管叔与蔡叔', 'xiashangzhou/飞廉与恶来': '飞廉与恶来', 'chunqiu/周平王': '周平王', 'chunqiu/周桓王': '周桓王', 'chunqiu/周襄王': '周襄王', 'chunqiu/周敬王': '周敬王', 'chunqiu/郑庄公': '郑庄公', 'chunqiu/齐桓公': '齐桓公', 'chunqiu/宋襄公': '宋襄公', 'chunqiu/晋文公': '晋文公', 'chunqiu/秦穆公': '秦穆公', 'chunqiu/楚庄王': '楚庄王', 'chunqiu/晋悼公': '晋悼公', 'chunqiu/吴王阖闾': '吴王阖闾', 'chunqiu/吴王夫差': '吴王夫差', 'chunqiu/越王勾践': '越王勾践', 'chunqiu/管仲': '管仲', 'chunqiu/鲍叔牙': '鲍叔牙', 'chunqiu/晏婴': '晏婴', 'chunqiu/崔杼': '崔杼', 'chunqiu/陈完': '陈完', 'chunqiu/狐偃': '狐偃', 'chunqiu/赵衰': '赵衰', 'chunqiu/先轸': '先轸', 'chunqiu/郤缺': '郤缺', 'chunqiu/赵盾': '赵盾', 'chunqiu/士会': '士会', 'chunqiu/栾书': '栾书', 'chunqiu/韩厥': '韩厥', 'chunqiu/魏绛': '魏绛', 'chunqiu/叔向': '叔向', 'chunqiu/赵鞅': '赵鞅', 'chunqiu/百里奚': '百里奚', 'chunqiu/蹇叔': '蹇叔', 'chunqiu/由余': '由余', 'chunqiu/孙叔敖': '孙叔敖', 'chunqiu/申包胥': '申包胥', 'chunqiu/伍子胥': '伍子胥', 'chunqiu/孙武': '孙武', 'chunqiu/范蠡': '范蠡', 'chunqiu/文种': '文种', 'chunqiu/伯嚭': '伯嚭', 'chunqiu/子产': '子产', 'chunqiu/季文子': '季文子', 'chunqiu/孔子': '孔子', 'chunqiu/王子朝': '王子朝', 'chunqiu/单穆公': '单穆公', 'chunqiu/石碏': '石碏', 'chunqiu/华元': '华元', 'zhanguo/周威烈王': '周威烈王', 'zhanguo/周赧王': '周赧王', 'zhanguo/魏文侯': '魏文侯', 'zhanguo/魏惠王': '魏惠王', 'zhanguo/赵武灵王': '赵武灵王', 'zhanguo/齐威王': '齐威王', 'zhanguo/齐宣王': '齐宣王', 'zhanguo/齐湣王': '齐湣王', 'zhanguo/楚悼王': '楚悼王', 'zhanguo/楚怀王': '楚怀王', 'zhanguo/燕昭王': '燕昭王', 'zhanguo/秦孝公': '秦孝公', 'zhanguo/秦惠文王': '秦惠文王', 'zhanguo/秦昭襄王': '秦昭襄王', 'zhanguo/李悝': '李悝', 'zhanguo/吴起': '吴起', 'zhanguo/商鞅': '商鞅', 'zhanguo/申不害': '申不害', 'zhanguo/邹忌': '邹忌', 'zhanguo/赵奢': '赵奢', 'zhanguo/苏秦': '苏秦', 'zhanguo/张仪': '张仪', 'zhanguo/公孙衍': '公孙衍', 'zhanguo/苏代': '苏代', 'zhanguo/甘茂': '甘茂', 'zhanguo/鲁仲连': '鲁仲连', 'zhanguo/毛遂': '毛遂', 'zhanguo/蔺相如': '蔺相如', 'zhanguo/孙膑': '孙膑', 'zhanguo/庞涓': '庞涓', 'zhanguo/田忌': '田忌', 'zhanguo/白起': '白起', 'zhanguo/乐毅': '乐毅', 'zhanguo/田单': '田单', 'zhanguo/廉颇': '廉颇', 'zhanguo/李牧': '李牧', 'zhanguo/赵括': '赵括', 'zhanguo/信陵君': '信陵君', 'zhanguo/孟尝君': '孟尝君', 'zhanguo/平原君': '平原君', 'zhanguo/春申君': '春申君', 'zhanguo/魏冉': '魏冉', 'zhanguo/范雎': '范雎', 'zhanguo/屈原': '屈原', 'zhanguo/郭隗': '郭隗', 'zhanguo/荆轲': '荆轲', 'zhanguo/太子丹': '太子丹', 'zhanguo/燕王喜': '燕王喜', 'zhanguo/李冰': '李冰', 'zhanguo/郑国': '郑国', 'zhanguo/孟子': '孟子', 'zhanguo/荀子': '荀子', 'zhanguo/韩非': '韩非', 'zhanguo/智瑶': '智瑶', 'zhanguo/赵襄子': '赵襄子', 'sanguo/程普': '程普', 'sanguo/王平': '王平', 'tang/唐僖宗': '唐僖宗', 'yuan/陈友谅': '陈友谅', 'qing/丁汝昌': '丁汝昌', 'qing/邓世昌': '邓世昌', 'sanguo/蜀汉先主': '刘备', 'sanguo/周瑜': '周瑜', 'sanguo/吴大帝': '孙权', 'sanguo/诸葛亮': '诸葛亮', 'sanguo/关羽': '关羽', 'sanguo/司马懿': '司马懿', 'liangjin/王羲之': '王羲之', 'liangjin/陶渊明': '陶渊明', 'liangjin/谢安': '谢安', 'liangjin/祖逖': '祖逖', 'liangjin/刘裕': '刘裕', 'liangjin/顾恺之': '顾恺之', 'xiashangzhou/毕公': '毕公', 'xiashangzhou/秦仲': '秦仲', 'chunqiu/祭仲': '祭仲', 'chunqiu/申叔时': '申叔时', 'chunqiu/子鱼': '子鱼', 'chunqiu/伍举': '伍举', 'zhanguo/西门豹': '西门豹', 'zhanguo/司马错': '司马错', 'zhanguo/肥义': '肥义', 'zhanguo/邹衍': '邹衍', 'zhanguo/慎到': '慎到', 'qin/王贲': '王贲', 'qin/蒙毅': '蒙毅', 'xihan/灌婴': '灌婴', 'xihan/娄敬': '娄敬', 'xihan/刘濞': '刘濞', 'xihan/金日磾': '金日磾', 'xihan/上官桀': '上官桀', 'xihan/张安世': '张安世', 'xihan/耿寿昌': '耿寿昌', 'xihan/江充': '江充', 'xihan/刘据': '刘据', 'xihan/呼韩邪单于': '呼韩邪单于', 'xihan/王昭君': '王昭君', 'donghan/窦固': '窦固', 'donghan/班勇': '班勇', 'donghan/陈宠': '陈宠', 'donghan/李傕': '李傕', 'donghan/郭汜': '郭汜', 'donghan/阴丽华': '阴丽华', 'donghan/梁商': '梁商', 'donghan/耿秉': '耿秉', 'sanguo/丁奉': '丁奉', 'sanguo/王经': '王经', 'liangjin/祖约': '祖约', 'liangjin/苟晞': '苟晞', 'liangjin/麹允': '麹允', 'tang/田令孜': '田令孜', 'tang/王重荣': '王重荣', 'chunqiu/共叔段': '共叔段', 'chunqiu/武姜': '武姜', 'qin/吴广': '吴广', 'xihan/刘章': '刘章', 'xihan/卫子夫': '卫子夫', 'donghan/何太后': '何太后', 'donghan/陈寔': '陈寔', 'sui/翟让': '翟让', 'sui/杜伏威': '杜伏威', 'tang/李建成': '李建成', 'tang/尉迟敬德': '尉迟敬德', 'tang/太平公主': '太平公主', 'tang/韦后': '韦后', 'tang/仇士良': '仇士良', 'tang/李训': '李训', 'tang/王仙芝': '王仙芝', 'beisong/王小波': '王小波', 'beisong/李顺': '李顺', 'nansong/钟相': '钟相', 'nansong/杨幺': '杨幺', 'yuan/郭子兴': '郭子兴', 'qing/胤禩': '胤禩', 'qing/胤礽': '胤礽', 'qing/王聪儿': '王聪儿', 'qing/林爽文': '林爽文', 'qing/石达开': '石达开', 'qing/张乐行': '张乐行', 'chunqiu/田常': '田常', 'donghan/卢植': '卢植', 'beisong/高俅': '高俅', 'qing/曹雪芹': '曹雪芹', 'qing/袁世凯': '袁世凯', 'chunqiu/老子': '老子', 'zhanguo/庄子': '庄子', 'zhanguo/墨子': '墨子', 'zhanguo/扁鹊': '扁鹊', 'qin/虞姬': '虞姬', 'xihan/樊哙': '樊哙', 'xihan/司马相如': '司马相如', 'xihan/窦太后': '窦太后', 'xihan/赵飞燕': '赵飞燕', 'donghan/袁术': '袁术', 'donghan/孔融': '孔融', 'donghan/祢衡': '祢衡', 'donghan/蔡文姬': '蔡文姬', 'donghan/公孙瓒': '公孙瓒', 'donghan/刘表': '刘表', 'donghan/刘璋': '刘璋', 'donghan/陶谦': '陶谦', 'donghan/孙坚': '孙坚', 'donghan/马腾': '马腾', 'sanguo/典韦': '典韦', 'sanguo/于禁': '于禁', 'sanguo/庞德': '庞德', 'sanguo/徐庶': '徐庶', 'sanguo/孟获': '孟获', 'sanguo/关平': '关平', 'sanguo/曹彰': '曹彰', 'sanguo/曹冲': '曹冲', 'sanguo/甄后': '甄后', 'sanguo/孙尚香': '孙尚香', 'liangjin/王献之': '王献之', 'liangjin/周处': '周处', 'sui/萧皇后': '萧皇后', 'tang/李白': '李白', 'tang/杜甫': '杜甫', 'tang/王维': '王维', 'tang/孟浩然': '孟浩然', 'tang/高适': '高适', 'tang/岑参': '岑参', 'tang/王昌龄': '王昌龄', 'tang/杜牧': '杜牧', 'tang/李商隐': '李商隐', 'tang/刘禹锡': '刘禹锡', 'tang/贺知章': '贺知章', 'tang/秦琼': '秦琼', 'tang/程咬金': '程咬金', 'tang/李元吉': '李元吉', 'beisong/苏洵': '苏洵', 'beisong/苏辙': '苏辙', 'beisong/晏殊': '晏殊', 'beisong/柳永': '柳永', 'beisong/黄庭坚': '黄庭坚', 'beisong/秦观': '秦观', 'beisong/宋江': '宋江', 'nansong/李清照': '李清照', 'nansong/辛弃疾': '辛弃疾', 'nansong/陆游': '陆游', 'jin/元好问': '元好问', 'yuan/关汉卿': '关汉卿', 'yuan/赵孟頫': '赵孟頫', 'yuan/马致远': '马致远', 'yuan/马可·波罗': '马可·波罗', 'ming/史可法': '史可法', 'ming/唐寅': '唐寅', 'ming/汤显祖': '汤显祖', 'ming/吴承恩': '吴承恩', 'ming/罗贯中': '罗贯中', 'ming/施耐庵': '施耐庵', 'ming/陈圆圆': '陈圆圆', 'qing/蒲松龄': '蒲松龄', 'qing/纳兰性德': '纳兰性德', 'qing/刘墉': '刘墉', 'qing/孙中山': '孙中山', 'qing/詹天佑': '詹天佑', 'qing/李莲英': '李莲英', 'qing/秋瑾': '秋瑾', 'qing/章太炎': '章太炎', 'qin/秦二世': '秦二世', 'qin/秦王子婴': '秦王子婴', 'xihan/吕后': '吕后', 'xihan/汉文帝': '汉文帝', 'xihan/汉景帝': '汉景帝', 'xihan/汉昭帝': '汉昭帝', 'xihan/昌邑王': '昌邑王', 'xihan/汉宣帝': '汉宣帝', 'xihan/汉元帝': '汉元帝', 'xihan/汉成帝': '汉成帝', 'xihan/汉平帝': '汉平帝', 'xihan/孺子婴': '孺子婴', 'xin/新帝王莽': '新帝王莽', 'donghan/汉光武帝': '汉光武帝', 'donghan/汉明帝': '汉明帝', 'donghan/汉章帝': '汉章帝', 'donghan/汉和帝': '汉和帝', 'donghan/汉安帝': '汉安帝', 'donghan/北乡侯（少帝）': '北乡侯（少帝）', 'donghan/汉顺帝': '汉顺帝', 'donghan/汉桓帝': '汉桓帝', 'donghan/汉灵帝': '汉灵帝', 'donghan/少帝刘辩': '少帝刘辩', 'donghan/汉献帝': '汉献帝', 'donghan/和熹邓太后': '和熹邓太后', 'donghan/顺烈梁太后': '顺烈梁太后', 'sanguo/魏文帝': '魏文帝', 'sanguo/魏明帝': '魏明帝', 'sanguo/魏齐王': '魏齐王', 'sanguo/魏高贵乡公': '魏高贵乡公', 'sanguo/魏陈留王': '魏陈留王', 'sanguo/蜀汉后主': '蜀汉后主', 'sanguo/吴景帝': '吴景帝', 'sanguo/吴末帝': '吴末帝', 'liangjin/西晋武帝': '西晋武帝', 'liangjin/西晋惠帝': '西晋惠帝', 'liangjin/东晋元帝': '东晋元帝', 'liangjin/东晋孝武帝': '东晋孝武帝', 'liangjin/东晋安帝': '东晋安帝', 'liangjin/东晋恭帝': '东晋恭帝', 'liangjin/西晋怀帝': '西晋怀帝', 'liangjin/西晋愍帝': '西晋愍帝', 'liangjin/东晋明帝': '东晋明帝', 'liangjin/东晋成帝': '东晋成帝', 'nanbeichao/宋武帝': '宋武帝', 'nanbeichao/宋文帝': '宋文帝', 'nanbeichao/宋前废帝': '宋前废帝', 'nanbeichao/齐高帝': '齐高帝', 'nanbeichao/齐明帝': '齐明帝', 'nanbeichao/梁元帝': '梁元帝', 'nanbeichao/陈武帝': '陈武帝', 'nanbeichao/北魏道武帝': '北魏道武帝', 'nanbeichao/北魏太武帝': '北魏太武帝', 'nanbeichao/北齐文宣帝': '北齐文宣帝', 'nanbeichao/北周追尊文帝': '北周追尊文帝', 'nanbeichao/北周武帝': '北周武帝', 'sui/隋恭帝': '隋恭帝', 'sanguo/司马师': '司马师', 'sanguo/司马昭': '司马昭', 'sanguo/鲁肃': '鲁肃', 'sanguo/吕蒙': '吕蒙', 'sanguo/陆逊': '陆逊', 'sanguo/陆抗': '陆抗', 'sanguo/张飞': '张飞', 'sanguo/赵云': '赵云', 'sanguo/马超': '马超', 'sanguo/黄忠': '黄忠', 'sanguo/庞统': '庞统', 'sanguo/法正': '法正', 'sanguo/姜维': '姜维', 'sanguo/邓艾': '邓艾', 'sanguo/钟会': '钟会', 'sanguo/郭嘉': '郭嘉', 'sanguo/荀攸': '荀攸', 'sanguo/贾诩': '贾诩', 'sanguo/张辽': '张辽', 'sanguo/夏侯惇': '夏侯惇', 'sanguo/曹爽': '曹爽', 'sanguo/曹植': '曹植', 'sanguo/陈寿': '陈寿', 'sanguo/嵇康': '嵇康', 'sanguo/阮籍': '阮籍', 'sanguo/孙策': '孙策', 'sanguo/马谡': '马谡', 'sanguo/杨修': '杨修', 'sanguo/司马炎': '司马炎', 'sanguo/曹仁': '曹仁', 'sanguo/曹真': '曹真', 'sanguo/夏侯渊': '夏侯渊', 'sanguo/许褚': '许褚', 'sanguo/徐晃': '徐晃', 'sanguo/张郃': '张郃', 'sanguo/黄盖': '黄盖', 'sanguo/甘宁': '甘宁', 'sanguo/太史慈': '太史慈', 'sanguo/陈群': '陈群', 'sanguo/钟繇': '钟繇', 'sanguo/王朗': '王朗', 'sanguo/华歆': '华歆', 'sanguo/刘晔': '刘晔', 'sanguo/蒋济': '蒋济', 'sanguo/郭淮': '郭淮', 'sanguo/满宠': '满宠', 'sanguo/曹休': '曹休', 'sanguo/李严': '李严', 'sanguo/蒋琬': '蒋琬', 'sanguo/费祎': '费祎', 'sanguo/魏延': '魏延', 'sanguo/黄皓': '黄皓', 'sanguo/谯周': '谯周', 'sanguo/张昭': '张昭', 'sanguo/诸葛瑾': '诸葛瑾', 'sanguo/顾雍': '顾雍', 'sanguo/孙和': '孙和', 'sanguo/孙綝': '孙綝', 'sanguo/诸葛恪': '诸葛恪', 'sanguo/诸葛诞': '诸葛诞', 'sanguo/毌丘俭': '毌丘俭', 'sanguo/何晏': '何晏', 'sanguo/夏侯玄': '夏侯玄', 'sanguo/王弼': '王弼', 'sanguo/司马孚': '司马孚', 'sanguo/王濬': '王濬', 'sanguo/桓范': '桓范', 'sanguo/魏追尊武帝': '曹操', 'sanguo/吴会稽王': '孙亮', 'xihan/张良': '张良', 'xihan/韩信': '韩信', 'xihan/曹参': '曹参', 'xihan/陈平': '陈平', 'xihan/周勃': '周勃', 'xihan/英布': '英布', 'xihan/彭越': '彭越', 'xihan/吕产': '吕产', 'xihan/吕禄': '吕禄', 'xihan/贾谊': '贾谊', 'xihan/晁错': '晁错', 'xihan/周亚夫': '周亚夫', 'xihan/李广': '李广', 'xihan/董仲舒': '董仲舒', 'xihan/公孙弘': '公孙弘', 'xihan/主父偃': '主父偃', 'xihan/汲黯': '汲黯', 'xihan/张汤': '张汤', 'xihan/东方朔': '东方朔', 'xihan/桑弘羊': '桑弘羊', 'xihan/李陵': '李陵', 'xihan/田千秋': '田千秋', 'xihan/霍光': '霍光', 'xihan/赵充国': '赵充国', 'xihan/魏相': '魏相', 'xihan/丙吉': '丙吉', 'xihan/萧望之': '萧望之', 'xihan/刘向': '刘向', 'xihan/石显': '石显', 'xihan/王政君': '王政君', 'xihan/董贤': '董贤', 'xihan/王莽': '王莽', 'xihan/萧何': '萧何', 'xihan/陆贾': '陆贾', 'xihan/卫青': '卫青', 'beisong/潘美': '潘美', 'beisong/石守信': '石守信', 'beisong/杨业': '杨业', 'beisong/吕端': '吕端', 'beisong/王旦': '王旦', 'beisong/丁谓': '丁谓', 'beisong/吕夷简': '吕夷简', 'beisong/韩琦': '韩琦', 'beisong/富弼': '富弼', 'beisong/文彦博': '文彦博', 'beisong/吕惠卿': '吕惠卿', 'beisong/章惇': '章惇', 'beisong/王韶': '王韶', 'beisong/宣仁高太后': '宣仁高太后', 'beisong/蔡京': '蔡京', 'beisong/童贯': '童贯', 'beisong/李诫': '李诫', 'beisong/方腊': '方腊', 'beisong/种师道': '种师道', 'beisong/毕昇': '毕昇', 'beisong/周敦颐': '周敦颐', 'beisong/程颢': '程颢', 'beisong/程颐': '程颐', 'beisong/张载': '张载', 'beisong/米芾': '米芾', 'beisong/张择端': '张择端', 'beisong/王继恩': '王继恩', 'beisong/张余': '张余', 'beisong/张咏': '张咏', 'wudai/后梁末帝': '后梁末帝', 'wudai/后唐末帝': '后唐末帝', 'wudai/后晋出帝': '后晋出帝', 'wudai/后汉高祖': '后汉高祖', 'wudai/后周恭帝': '后周恭帝', 'wudai/南唐元宗': '南唐元宗', 'wudai/前蜀后主': '前蜀后主', 'wudai/后蜀高祖': '后蜀高祖', 'wudai/南汉后主': '南汉后主', 'wudai/楚文昭王': '楚文昭王', 'wudai/北汉世祖': '北汉世祖', 'wudai/李克用': '李克用', 'wudai/郭崇韬': '郭崇韬', 'wudai/王彦章': '王彦章', 'wudai/敬翔': '敬翔', 'wudai/安重诲': '安重诲', 'wudai/景延广': '景延广', 'wudai/杜重威': '杜重威', 'wudai/范质': '范质', 'wudai/魏仁浦': '魏仁浦', 'wudai/韩通': '韩通', 'wudai/李重进': '李重进', 'wudai/杨行密': '杨行密', 'wudai/徐温': '徐温', 'wudai/韩熙载': '韩熙载', 'wudai/罗隐': '罗隐', 'wudai/延寿': '延寿', 'wudai/冯延巳': '冯延巳', 'wudai/花蕊夫人': '花蕊夫人', 'wudai/周行逢': '周行逢', 'yuan/元定宗': '元定宗', 'yuan/元明宗': '元明宗', 'yuan/孛儿帖': '孛儿帖', 'yuan/博尔术': '博尔术', 'yuan/拖雷': '拖雷', 'yuan/拔都': '拔都', 'yuan/旭烈兀': '旭烈兀', 'yuan/阿里不哥': '阿里不哥', 'yuan/阿术': '阿术', 'yuan/史天泽': '史天泽', 'yuan/张柔': '张柔', 'yuan/姚枢': '姚枢', 'yuan/许衡': '许衡', 'yuan/阿合马': '阿合马', 'yuan/桑哥': '桑哥', 'yuan/卢世荣': '卢世荣', 'yuan/铁木迭儿': '铁木迭儿', 'yuan/拜住': '拜住', 'yuan/燕铁木儿': '燕铁木儿', 'yuan/伯颜（权臣）': '伯颜（权臣）', 'yuan/欧阳玄': '欧阳玄', 'yuan/韩山童': '韩山童', 'yuan/徐寿辉': '徐寿辉', 'yuan/方国珍': '方国珍', 'yuan/王祯': '王祯', 'yuan/朱世杰': '朱世杰', 'yuan/黄公望': '黄公望', 'yuan/王冕': '王冕', 'yuan/扩廓帖木儿': '扩廓帖木儿', 'yuan/韩林儿': '韩林儿' };


  /* ---------- 人物关系网：以当前人物为中心，画出他“关联人物”里点到的人，以及在本朝别的卡里提到他的人 ---------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    return n;
  }
  function relNodes(D, c, selfNames) {
    var list = [], seen = {};
    seen[D.key + '/' + c.name] = 1;
    function add(dk, card, label, inOnly) {
      var id = dk + '/' + card;
      if (seen[id]) return;
      seen[id] = 1;
      list.push({ d: dk, n: card, label: label, inn: !!inOnly });
    }
    /* 这张卡自己的文字里（不含出处）点到的人，按出现次数排；帝王卡的“关联人物”栏优先 */
    var txt = [], cnt = {}, order = [];
    c.f.forEach(function (f) {
      if (f.k === '出处') return;
      if (f.v) txt.push((f.k === '关联人物' ? '\u0001' : '') + f.v);
      (f.items || []).forEach(function (it) { txt.push(it.ev ? it.ev.t : it.t); });
    });
    txt.forEach(function (t) {
      var pri = t.charAt(0) === '\u0001';
      if (pri) t = t.slice(1);
      var m;
      nameRe.lastIndex = 0;
      while ((m = nameRe.exec(t))) {
        var nm = m[0];
        if (selfNames.indexOf(nm) >= 0) continue;
        var cand = NAMES[nm] || [], pick = null;
        cand.forEach(function (x) { if (!pick && x[0] === D.key) pick = x; });
        if (!pick) pick = cand[0];
        if (!pick) continue;
        var id = pick[0] + '/' + pick[1];
        if (!cnt[id]) { cnt[id] = { d: pick[0], n: pick[1], label: nm, k: 0 }; order.push(id); }
        cnt[id].k += pri ? 3 : 1;
      }
    });
    order.sort(function (x, y) { return cnt[y].k - cnt[x].k; });
    order.slice(0, 10).forEach(function (id) { add(cnt[id].d, cnt[id].n, cnt[id].label, false); });
    D.keyEmperors.concat(D.people).forEach(function (x) {
      if (x.name === c.name) return;
      var r = fieldOf(x, '关联人物');
      for (var i = 0; i < selfNames.length; i++) {
        if (selfNames[i].length >= 2 && r.indexOf(selfNames[i]) >= 0) { add(D.key, x.name, x.name, true); return; }
      }
    });
    return list.slice(0, 12);
  }
  function relGraph(D, c, selfNames) {
    var nodes = relNodes(D, c, selfNames);
    if (nodes.length < 2) return null;
    var W = 440, H = 320, cx = W / 2, cy = H / 2, rx = 160, ry = 112;
    var svg = svgEl('svg', { 'class': 'ss-rel', viewBox: '0 0 ' + W + ' ' + H, role: 'group', 'aria-label': c.name + '的人物关系网' });
    var pos = nodes.map(function (nd, i) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / nodes.length;
      return { x: cx + rx * Math.cos(ang), y: cy + ry * Math.sin(ang) };
    });
    nodes.forEach(function (nd, i) {
      svg.appendChild(svgEl('line', { x1: cx, y1: cy, x2: pos[i].x, y2: pos[i].y, 'class': nd.inn ? 'is-in' : '' }));
    });
    nodes.forEach(function (nd, i) {
      var label = nd.label.length > 6 ? nd.label.slice(0, 6) + '…' : nd.label;
      var w = label.length * 13 + 16, h = 24;
      var a = svgEl('a', { 'class': 'ss-ref', href: '#', 'data-d': nd.d, 'data-n': nd.n });
      a.appendChild(svgEl('rect', { x: pos[i].x - w / 2, y: pos[i].y - h / 2, width: w, height: h, rx: 12 }));
      var t = svgEl('text', { x: pos[i].x, y: pos[i].y + 4.5, 'text-anchor': 'middle' });
      t.textContent = label;
      a.appendChild(t);
      var ti = svgEl('title', {});
      ti.textContent = '看看' + nd.n + '的介绍';
      a.appendChild(ti);
      svg.appendChild(a);
    });
    var cn = c.name.length > 7 ? c.name.slice(0, 7) + '…' : c.name;
    var cw = cn.length * 15 + 22;
    var g = svgEl('g', { 'class': 'c' });
    g.appendChild(svgEl('rect', { x: cx - cw / 2, y: cy - 15, width: cw, height: 30, rx: 15 }));
    var ct = svgEl('text', { x: cx, y: cy + 5, 'text-anchor': 'middle' });
    ct.textContent = cn;
    g.appendChild(ct);
    svg.appendChild(g);
    return el('div', {}, [svg, el('p', { 'class': 'ss-rel-note', text: '点名字看他的介绍。实线：这张卡的“关联人物”里点到的人；虚线：本朝别的卡里提到他的人。' })]);
  }

  function fillModal(D, hit) {
    var c = hit.card;
    var selfNames = [c.name];
    var row = null;
    D.emperors.forEach(function (e) { if (e.name === c.name) row = e; });
    if (row && row.real) selfNames.push(row.real);
    var ctx = newCtx(D.key, selfNames);

    modal.tag.textContent = (dynName[D.key] || D.name) + ' · ' + hit.kind;
    modal.title.textContent = c.name;
    modal.facts.textContent = '';
    if (row) {
      [['姓名', row.real], ['在位', row.reign], ['年号', row.nh], ['庙号／谥号', row.mh]].forEach(function (p) {
        if (p[1]) modal.facts.appendChild(el('span', { 'class': 'ss-fact' }, [el('b', { text: p[0] }), p[1]]));
      });
    }
    var g = gradeEl(c.g);
    if (g) modal.facts.appendChild(g);

    var pairs = [], srcPair = null;
    c.f.forEach(function (f) {
      ctx = newCtx(D.key, selfNames);   /* 每个栏目各算各的：同一个人在不同栏目里都能点 */
      if (f.k === '出处') {
        if (f.list && f.list.length) srcPair = ['出处', el('p', { 'class': 'ss-srcs', text: f.list.join('　◆　') + (f.v ? '　' + f.v : '') })];
        return;
      }
      if (f.items) {
        pairs.push([f.k, ul(f.items.map(function (it) {
          if (it.ev) return [el('span', { 'class': 'ss-ly' }, rich(it.ev.y))].concat(rich(it.ev.t, ctx)).concat([gradeEl(it.ev.g)]);
          return rich(it.t, ctx);
        }))]);
      } else {
        pairs.push([f.k, span(f.v, ctx)]);
      }
    });
    /* 人物关系网：放在“关联人物”后面 */
    try {
      var rg = relGraph(D, c, selfNames);
      if (rg) {
        var at = -1;
        pairs.forEach(function (pp, i) { if (pp[0] === '关联人物') at = i; });
        if (at < 0) pairs.push(['关系网', rg]); else pairs.splice(at + 1, 0, ['关系网', rg]);
      }
    } catch (e) { /* 关系图出问题不影响文字 */ }
    /* 身后陵墓：手写对照表 data/lishi-lingmu.js，连到陵墓详页 */
    var LMS = (window.ZHIFOU_LISHI_LINGMU || {})[D.key + '/' + c.name];
    if (LMS && LMS.length) {
      pairs.push(['身后陵墓', el('div', {}, LMS.map(function (m) {
        return el('p', { 'class': 'ss-lm' }, [m.x + ' ', el('a', { 'class': 'ss-lmlink', href: 'lingmu-detail.html?id=' + encodeURIComponent(m.id), title: '到陵墓与墓葬页看' + m.t, text: '看“' + m.t + '”详页 →' })]);
      }))]);
    }
    if (srcPair) pairs.push(srcPair);
    /* 人物像：只有登记过的人物才显示（登记键 lishiren/人物名），查不到就不显示 */
    var oldPic = modal.card.querySelector('.zf-portrait');
    if (oldPic && oldPic.parentNode) oldPic.parentNode.removeChild(oldPic);
    try {
      var pi = window.ZIMG && window.ZIMG.get('lishiren', PORTRAIT[D.key + '/' + c.name] || '');
      if (pi) {
        var pic = el('figure', { 'class': 'zf zf-portrait' }, [
          el('img', { 'class': 'zf-img', src: pi.src, srcset: pi.srcset, sizes: '(max-width: 760px) 70vw, 300px', alt: c.name + '（AI 想象像）', width: pi.width, height: pi.height, decoding: 'async' }),
          el('figcaption', { 'class': 'zf-cap' }, [el('span', { 'class': 'zf-txt', text: pi.caption || '' }), pi.ai ? el('span', { 'class': 'zf-ai', text: pi.aiLabel }) : null])
        ]);
        modal.facts.parentNode.insertBefore(pic, modal.facts.nextSibling);
      }
    } catch (e) { /* 图片出问题不影响文字 */ }
    modal.body.textContent = '';
    var oldRow = modal.card.querySelector('.zf-tts-row');   /* 换了一位人物：去掉旧的“听介绍”按钮（朗读脚本会自动停下并重新放一个） */
    if (oldRow && oldRow.parentNode) oldRow.parentNode.removeChild(oldRow);
    modal.body.appendChild(Z.kv(pairs, { quote: [] }));
    modal.back.hidden = !stack.length;
    /* 分享卡片按钮（由 js/sharecard.js 提供；没加载或出错都不影响本页） */
    try { if (window.ShareCard) window.ShareCard.hookPerson({ card: modal.card, anchor: modal.body, D: D, hit: hit, dynName: dynName[D.key] || D.name, portrait: pi || null }); } catch (e) { /* 忽略 */ }
    modal.card.scrollTop = 0;
  }

  openEntity = function (dKey, name, push) {
    ensureData(dKey, function (D) {
      var hit = findCard(D, name);
      if (!hit) return;
      if (!modal) modal = buildModal();
      if (!modal.overlay.classList.contains('is-open')) lastFocus = document.activeElement;
      if (push && curEnt) stack.push(curEnt);
      curEnt = { d: dKey, name: name };
      fillModal(D, hit);
      modal.overlay.classList.add('is-open');
      modal.overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('ss-noscroll');
      setQs(dKey === key ? name : null);
      if (modal.closeBtn && modal.closeBtn.focus) { try { modal.closeBtn.focus({ preventScroll: true }); } catch (e) { /* 忽略 */ } }
    });
  };

  /* ---------- 页面 ---------- */
  function render(D) {
    var ov = {};
    D.overview.forEach(function (o) { ov[o.k] = o; });

    /* 页头 */
    var lead = ['国祚', '都城', '开国者', '亡国者'].filter(function (k) { return ov[k]; }).map(function (k) { return k + '：' + cut(String(ov[k].v).split(/[；。]/)[0], 24); }).join('　');
    var head = el('header', { 'class': 'zy-head' }, [
      el('div', { 'class': 'zy-eyebrow', text: '历史 · ' + meta.group }),
      el('h1', { 'class': 'zy-hook', text: D.name + '　' + meta.range }),
      el('p', { 'class': 'zy-answer', text: (ov['一句话'] && ov['一句话'].v) || meta.blurb }),
      lead ? el('p', { 'class': 'zy-lead', text: lead }) : null
    ]);

    /* 一张小卡片：点它弹出介绍 */
    function tile(c, line1, line2) {
      var b = el('button', { 'class': 'ss-tile', type: 'button', 'aria-label': '查看' + c.name + '的介绍' }, [
        el('span', { 'class': 'ss-tile-name', text: c.name }),
        line1 ? el('span', { 'class': 'ss-tile-l1', text: cut(line1, 28) }) : null,
        line2 ? el('span', { 'class': 'ss-tile-l2', text: line2 }) : null,
        c.g === '待核' || c.g === '部分待核' ? el('span', { 'class': 'ss-tile-flag' }, [gradeEl(c.g)]) : null
      ]);
      b.setAttribute('data-q', c.name + (line1 || '') + (line2 || ''));
      b.addEventListener('click', function () { openEntity(D.key, c.name, false); });
      return b;
    }

    /* ----- 概况 ----- */
    function buildOverview() {
      var ctx = newCtx(D.key, []);
      var pairs = D.overview.filter(function (o) { return ['一句话', '出处'].indexOf(o.k) < 0; }).map(function (o) { return [o.k, span(o.v, ctx)]; });
      var src = ov['出处'];
      var box = el('div', {}, [Z.kv(pairs)]);
      box.addEventListener('click', function (ev) {
        var a = ev.target && ev.target.closest ? ev.target.closest('a.ss-ref') : null;
        if (!a) return;
        ev.preventDefault();
        openEntity(a.getAttribute('data-d'), a.getAttribute('data-n'), false);
      });
      var kids = [box];
      if (D.grade) kids.push(el('p', { 'class': 'zy-note' }, ['整体把握程度：' + D.grade + '。', Z.LEGEND]));
      if (src && src.list && src.list.length) kids.push(Z.kv([['主要出处', el('p', { 'class': 'ss-srcs', text: src.list.join('　◆　') })]], { quote: [] }));
      return kids;
    }

    /* ----- 帝王 ----- */
    function buildEmperors() {
      var kids = [];
      var keyNames = {};
      D.keyEmperors.forEach(function (c) { keyNames[c.name] = c; });
      /* 帝王名单：每位帝王一张横条——左边是通称、姓名、在位，右边是年号、庙号谥号和一句话，宽度不再被表格挤窄 */
      var rows = D.emperors.map(function (e) {
        var nameCell;
        if (keyNames[e.name]) {
          var a = el('a', { 'class': 'ss-jump', href: '#', text: e.name });
          a.addEventListener('click', function (ev) { ev.preventDefault(); openEntity(D.key, e.name, false); });
          nameCell = [a, el('i', { 'class': 'ss-star', title: '点开看详细介绍', text: '★' })];
        } else nameCell = [e.name];
        var bodyRows = [];
        if (e.nh) bodyRows.push(el('div', { 'class': 'ss-emp-row' }, [el('span', { 'class': 'ss-emp-k', text: '年号' }), el('span', { 'class': 'ss-emp-v', text: e.nh })]));
        if (e.mh) bodyRows.push(el('div', { 'class': 'ss-emp-row' }, [el('span', { 'class': 'ss-emp-k', text: '庙号／谥号' }), el('span', { 'class': 'ss-emp-v', text: e.mh })]));
        if (e.line) bodyRows.push(el('div', { 'class': 'ss-emp-row ss-emp-line' }, [el('span', { 'class': 'ss-emp-k', text: '一句话' }), el('span', { 'class': 'ss-emp-v' }, rich(e.line))]));
        var idBox = el('div', { 'class': 'ss-emp-id' }, [
          el('div', { 'class': 'ss-emp-name' }, nameCell),
          el('div', { 'class': 'ss-emp-real', text: e.real }),
          el('div', { 'class': 'ss-emp-reign', text: e.reign })
        ]);
        /* 分享卡片按钮（由 js/sharecard.js 提供；没加载或出错都不影响本页）。有详细介绍的帝王，按钮在弹窗里 */
        try { if (!keyNames[e.name] && window.ShareCard && window.ShareCard.hookEmperorRow) window.ShareCard.hookEmperorRow({ box: idBox, D: D, e: e, dynName: dynName[D.key] || D.name }); } catch (err) { /* 忽略 */ }
        return el('article', { 'class': 'ss-emp' }, [
          idBox,
          el('div', { 'class': 'ss-emp-body' }, bodyRows)
        ]);
      });
      /* 有分组（如“南朝宋”“北魏”）的朝代，在每组前插一条小标题；标题里“，”后面的是补充说明 */
      var parts = [], lastG = null;
      D.emperors.forEach(function (e, i) {
        var g = e.grp || '';
        if (g && g !== lastG) {
          var cut = g.indexOf('，');
          var ttl = cut > 0 ? g.slice(0, cut) : g;
          var sub = cut > 0 ? g.slice(cut + 1) : '';
          parts.push(el('h3', { 'class': 'ss-emp-grp' }, [ttl, sub ? el('small', { text: sub }) : null]));
        }
        lastG = g;
        parts.push(rows[i]);
      });
      var table = el('div', { 'class': 'ss-emps' }, parts);
      kids.push(Z.section('帝王名单（' + D.emperors.length + '）', [Z.note('带 ★ 的帝王，点名字可以看详细介绍。'), table]));
      if (D.keyEmperors.length) {
        kids.push(Z.section('重点帝王（' + D.keyEmperors.length + '）', [
          Z.note('点一张看详细介绍：简介、主要功绩、重大事件、争议与评价和出处。'),
          el('div', { 'class': 'ss-tiles' }, D.keyEmperors.map(function (c) { return tile(c, fieldOf(c, '在位'), ''); }))
        ]));
      }
      return kids;
    }

    /* ----- 大事记 ----- */
    function buildEvents() {
      var evs = D.events.slice();
      var list = el('ol', { 'class': 'ss-timeline' });
      var count = el('p', { 'class': 'zy-note', 'aria-live': 'polite' });
      var rowsAll = evs.map(function (e) {
        var ctx = newCtx(D.key, []);
        var li = el('li', { 'class': 'ss-tl-item' }, [
          el('span', { 'class': 'ss-tl-y' }, rich(e.y)),
          el('div', { 'class': 'ss-tl-t' }, rich(e.t, ctx).concat([gradeEl(e.g)]).concat([e.s && e.s.length ? el('span', { 'class': 'ss-tl-s', text: '出处：' + e.s.join('　◆　') }) : null]))
        ]);
        li.setAttribute('data-q', e.y + e.t);
        list.appendChild(li);
        return li;
      });
      list.addEventListener('click', function (ev) {
        var a = ev.target && ev.target.closest ? ev.target.closest('a.ss-ref') : null;
        if (!a) return;
        ev.preventDefault();
        openEntity(a.getAttribute('data-d'), a.getAttribute('data-n'), false);
      });
      var box = el('input', { 'class': 'ss-search', type: 'search', placeholder: '在大事记里搜索：年份或关键词，如 前221、长城', 'aria-label': '搜索大事记' });
      function apply() {
        var q = box.value.trim(), n = 0;
        rowsAll.forEach(function (li) {
          var hit = !q || li.getAttribute('data-q').indexOf(q) >= 0;
          li.hidden = !hit;
          if (hit) n++;
        });
        count.textContent = q ? '找到 ' + n + ' 条。' : '共 ' + evs.length + ' 条，按时间先后排列；文中带下划线的人名可以点开看介绍。';
      }
      box.addEventListener('input', apply);
      apply();
      return [box, count, list];
    }

    /* ----- 人物 ----- */
    function buildPeople() {
      var tiles = D.people.map(function (p) { return tile(p, fieldOf(p, '生卒'), cut(fieldOf(p, '身份'), 30)); });
      var grid = el('div', { 'class': 'ss-tiles' }, tiles);
      var count = el('p', { 'class': 'zy-note', 'aria-live': 'polite' });
      var box = el('input', { 'class': 'ss-search', type: 'search', placeholder: '按姓名或身份搜索，如 丞相、将军', 'aria-label': '搜索人物' });
      function apply() {
        var q = box.value.trim(), n = 0;
        tiles.forEach(function (c) {
          var hit = !q || c.getAttribute('data-q').indexOf(q) >= 0;
          c.hidden = !hit;
          if (hit) n++;
        });
        count.textContent = q ? '找到 ' + n + ' 位。' : '共 ' + tiles.length + ' 位。点一张看生平、事迹和出处。';
      }
      box.addEventListener('input', apply);
      apply();
      return [box, count, grid];
    }

    /* ----- 制度 ----- */
    function buildTableGroup(g) {
      var tb = g.table;
      var hasSrc = tb.rows.some(function (r) { return r.s && r.s.length; });
      var hasG = tb.rows.some(function (r) { return r.g === '待核' || r.g === '部分待核'; });
      var headers = tb.head.slice();
      if (hasSrc || hasG) headers.push('出处');
      var rows = tb.rows.map(function (r) {
        var tds = r.c.map(function (c, i) {
          return el('td', { 'class': (g.title === '十六国简表' && i === 0) ? 'is-name' : null }, rich(c));
        });
        if (hasSrc || hasG) {
          tds.push(el('td', {}, [
            r.s && r.s.length ? el('span', { 'class': 'ss-tl-s', text: r.s.join('　◆　') }) : null,
            r.g === '待核' || r.g === '部分待核' ? gradeEl(r.g) : null
          ]));
        }
        return el('tr', {}, tds);
      });
      return el('div', { 'class': 'ss-sys' }, [
        el('h3', { text: g.title }),
        el('div', { 'class': 'ss-tablewrap' }, [el('table', { 'class': 'ss-table' }, [
          el('thead', {}, [el('tr', {}, headers.map(function (h) { return el('th', { text: h }); }))]),
          el('tbody', {}, rows)
        ])])
      ]);
    }

    function buildSystems() {
      return D.systems.map(function (g) {
        if (g.table) return buildTableGroup(g);
        return el('div', { 'class': 'ss-sys' }, [
          el('h3', { text: g.title }),
          ul(g.items.map(function (it) {
            return [it.l ? el('span', { 'class': 'ss-ly', text: it.l }) : null].concat(rich(it.t)).concat([gradeEl(it.g),
              it.s && it.s.length ? el('span', { 'class': 'ss-tl-s', text: '出处：' + it.s.join('　◆　') }) : null
            ]);
          }))
        ]);
      });
    }

    /* ----- 待核 ----- */
    function buildChecks() {
      var n = D.checks.filter(function (c) { return c.red; }).length;
      var kids = [Z.note(n > 0
        ? '下面是整理时没有查实、或不同书记载有出入的地方（红色“待核”）。看史书时请把它们当作“有疑问”，不要当结论。共 ' + n + ' 条。'
        : '下面是整理时遇到的、不同史书记载有出入或原典没有明说的地方，已经把几种说法并列写明。看史书时请留意这些差别。共 ' + D.checks.length + ' 条。')];
      D.checks.forEach(function (c) {
        kids.push(el('div', { 'class': 'ss-checkitem' }, [c.red ? el('em', { 'class': 'ss-check', text: '待核' }) : null].concat(rich(c.t)).concat([
          c.s && c.s.length ? el('span', { 'class': 'ss-tl-s', text: '出处：' + c.s.join('　◆　') }) : null
        ])));
      });
      return kids;
    }

    var nCheck = D.checks.filter(function (c) { return c.red; }).length;
    var defs = [
      { key: 'ov', label: '概况', build: buildOverview },
      { key: 'emp', label: '帝王（' + D.emperors.length + '）', build: buildEmperors },
      { key: 'ev', label: '大事记（' + D.events.length + '）', build: buildEvents },
      { key: 'people', label: '人物（' + D.people.length + '）', build: buildPeople },
      { key: 'sys', label: '制度', build: buildSystems },
      { key: 'check', label: nCheck > 0 ? '待核（' + nCheck + '）' : '史料说明（' + D.checks.length + '）', build: buildChecks }
    ];
    var t = Z.tabs(defs.map(function (d) {
      return { key: d.key, label: d.label, build: function () { return d.build(); } };
    }));

    /* 朝代头图：登记键 lishi/<朝代代号>，没有登记的朝代不显示 */
    var banner = null;
    try {
      var bi = window.ZIMG && window.ZIMG.get('lishi', meta.key);
      if (bi) {
        banner = el('figure', { 'class': 'zf zf-banner' }, [
          el('img', { 'class': 'zf-img', src: bi.src, srcset: bi.srcset, sizes: '(max-width: 760px) 94vw, 900px', alt: bi.caption || '', width: bi.width, height: bi.height, decoding: 'async' }),
          el('figcaption', { 'class': 'zf-cap' }, [el('span', { 'class': 'zf-txt', text: bi.caption || '' }), bi.ai ? el('span', { 'class': 'zf-ai', text: bi.aiLabel }) : null])
        ]);
      }
    } catch (e) { banner = null; }
    Z.mount(root, [head, banner, dynBar(), t.node, Z.note('每位帝王、每个人物的详细介绍里都列了出处；年份用公历，公元前写作“前221”。')]);
    document.title = D.name + ' · 历史 · 知否知否';

    /* 网址里带 ?id=名字：直接打开那一张 */
    var id = Z.qs('id');
    if (id) {
      var hit = findCard(D, id);
      if (hit) { t.show(hit.kind === '帝王' ? 'emp' : 'people', true); openEntity(D.key, id, false); }
      else if (D.emperors.some(function (e) { return e.name === id; })) t.show('emp', true);   /* 名单里没有详细介绍的帝王：只切到“帝王”标签 */
    }
  }
})();
