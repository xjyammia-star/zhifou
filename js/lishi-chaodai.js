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
  var PORTRAIT = { 'qin/秦始皇': '秦始皇', 'xihan/汉高祖': '刘邦', 'qin/项羽': '项羽', 'qin/陈胜': '陈胜', 'qin/徐福': '徐福', 'xihan/霍去病': '霍去病', 'xihan/张骞': '张骞', 'xihan/苏武': '苏武', 'donghan/班超': '班超', 'donghan/蔡伦': '蔡伦', 'donghan/张衡': '张衡', 'donghan/华佗': '华佗', 'donghan/董卓': '董卓', 'xihan/汉武帝': '汉武帝', 'xihan/司马迁': '司马迁', 'nanbeichao/北魏孝文帝': '北魏孝文帝', 'nanbeichao/祖冲之': '祖冲之', 'nanbeichao/郦道元': '郦道元', 'nanbeichao/贾思勰': '贾思勰', 'nanbeichao/范缜': '范缜', 'nanbeichao/梁武帝': '梁武帝', 'nanbeichao/陶弘景': '陶弘景', 'nanbeichao/谢灵运': '谢灵运', 'nanbeichao/刘勰': '刘勰', 'sui/隋文帝': '隋文帝', 'sui/隋炀帝': '隋炀帝', 'sui/独孤皇后': '独孤皇后', 'sui/高颎': '高颎', 'sui/宇文恺': '宇文恺', 'sui/李春': '李春', 'sui/裴矩': '裴矩', 'sui/智顗': '智顗', 'sui/陆法言': '陆法言', 'sui/李密': '李密', 'tang/唐高祖': '唐高祖', 'tang/唐太宗': '唐太宗', 'tang/唐高宗': '唐高宗', 'tang/武则天': '武则天', 'tang/唐玄宗': '唐玄宗', 'tang/唐宪宗': '唐宪宗', 'tang/房玄龄': '房玄龄', 'tang/魏徵': '魏徵', 'tang/李靖': '李靖', 'tang/狄仁杰': '狄仁杰', 'tang/张九龄': '张九龄', 'tang/郭子仪': '郭子仪', 'tang/颜真卿': '颜真卿', 'tang/刘晏': '刘晏', 'tang/玄奘': '玄奘', 'tang/孙思邈': '孙思邈', 'tang/鉴真': '鉴真', 'tang/一行': '一行', 'tang/文成公主': '文成公主', 'tang/杜佑': '杜佑', 'wudai/后梁太祖': '后梁太祖', 'wudai/后唐庄宗': '后唐庄宗', 'wudai/后唐明宗': '后唐明宗', 'wudai/后晋高祖': '后晋高祖', 'wudai/后周太祖': '后周太祖', 'wudai/后周世宗': '后周世宗', 'wudai/吴越武肃王': '吴越武肃王', 'wudai/南唐烈祖': '南唐烈祖', 'wudai/南唐后主': '南唐后主', 'wudai/前蜀高祖': '前蜀高祖', 'wudai/后蜀后主': '后蜀后主', 'wudai/楚武穆王': '楚武穆王', 'wudai/闽忠懿王': '闽忠懿王', 'wudai/南汉高祖': '南汉高祖', 'wudai/冯道': '冯道', 'wudai/周德威': '周德威', 'wudai/张承业': '张承业', 'wudai/桑维翰': '桑维翰', 'wudai/王朴': '王朴', 'wudai/钱弘俶': '钱弘俶', 'wudai/毋昭裔': '毋昭裔', 'wudai/文益': '文益', 'sanguo/蜀汉先主': '刘备', 'sanguo/周瑜': '周瑜', 'sanguo/吴大帝': '孙权', 'sanguo/诸葛亮': '诸葛亮', 'sanguo/关羽': '关羽', 'sanguo/司马懿': '司马懿', 'liangjin/王羲之': '王羲之', 'liangjin/陶渊明': '陶渊明', 'liangjin/谢安': '谢安', 'liangjin/祖逖': '祖逖', 'liangjin/刘裕': '刘裕', 'liangjin/顾恺之': '顾恺之' };

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
        return el('article', { 'class': 'ss-emp' }, [
          el('div', { 'class': 'ss-emp-id' }, [
            el('div', { 'class': 'ss-emp-name' }, nameCell),
            el('div', { 'class': 'ss-emp-real', text: e.real }),
            el('div', { 'class': 'ss-emp-reign', text: e.reign })
          ]),
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
    }
  }
})();
