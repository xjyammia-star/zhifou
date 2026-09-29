
/* 知否知否 · "文"板块 · 诗人卡片墙通用渲染器（唐诗 / 以后的宋词、元曲共用）
   ------------------------------------------------------------
   跟 js/wen-read.js（"长文阅读页"）是两套不同的排版逻辑：
   这一套是"卡片墙 + 详情弹窗"——按时代分组，每个时代下面是一排诗人卡片；
   点一位诗人的卡片，展开看小传和这位诗人的作品目录（按题材/组诗分类，只显示作品名）；
   再点一首作品的名字，弹出一张居中卡片，显示原文和白话讲解。
   点作品弹窗这部分，直接复用了 js/wen-read.js 里"三国人物关系弹窗"已经写好的
   居中弹窗样式（css/wen-read.css 里的 wr-char-modal-*），没有重新发明一套弹窗。
   数据格式参考 data/tangshi.js 开头的说明注释。 */
(function () {
  'use strict';
  var Z = window.ZY;
  var el = Z && Z.el;

  /* 搜索功能要用的"花名册"：建卡片墙的时候顺手登记每位诗人的卡片和每首作品的按钮，
     搜索命中后就靠它找到该展开、该高亮的那个页面元素。 */
  var registry = [];
  var currentEraLabel = '';
  var unit = '首', textTag = '诗句', searchPh = '搜索诗人、作品名或诗句关键词，如：李白、静夜思、明月';   /* 作品的量词：唐诗"首"，元曲"篇"（mount 时可以改） */
  var glossLabel = '注解';   /* 注解区块的标题：唐诗/元曲叫"注解"，宋词叫"词句解读"（mount 时可以改） */

  /* ---------- 弹窗里各个区块的填充（原文 / 讲解 / 注解 / 出处） ----------
     数据里 gloss（注解）和 source（出处）是可选的：唐诗没有，元曲有；没有就不显示对应区块。 */
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  /* 元曲的曲词常以"【曲牌】曲词"或"〔曲牌〕曲词"开头，把曲牌名单独标出来，方便看出唱到哪一支曲子 */
  function fillPoem(poemEl, lines) {
    clear(poemEl);
    poemEl.appendChild(el('div', { 'class': 'wr-poem-body' }, (lines || []).map(function (line) {
      var m = /^([【〔][^】〕]+[】〕])\s*([\s\S]*)$/.exec(line);
      if (!m) return el('p', { text: line });
      return el('p', {}, [el('span', { 'class': 'tp-qupai', text: m[1] }), m[2]]);
    })));
  }

  /* 讲解：用换行分段。宋词的讲解每段开头有"创作背景：""艺术特点与历史地位："这样的小标题，
     只认下面这几个固定的标题，把它单独加粗提亮；别的作品（唐诗、元曲）的讲解不受影响。 */
  var NOTE_HEADS = /^(创作时间|作者说明|创作背景|艺术特点与历史地位)：/;
  function fillNote(noteEl, text) {
    clear(noteEl);
    String(text || '').split('\n').forEach(function (t) {
      t = t.trim();
      if (!t) return;
      var m = NOTE_HEADS.exec(t);
      noteEl.appendChild(m
        ? el('p', {}, [el('strong', { 'class': 'tp-note-h', text: m[1] }), t.slice(m[1].length)])
        : el('p', { text: t }));
    });
  }

  /* 白话译文（宋词有，唐诗、元曲没有这个字段就不显示）：一整段译文，默认展开 */
  function fillTrans(transEl, text) {
    clear(transEl);
    transEl.hidden = true;
    var paras = String(text || '').split('\n').map(function (t) { return t.trim(); }).filter(Boolean);
    if (!paras.length) return;
    var d = el('details', { 'class': 'tp-trans' }, [
      el('summary', { 'class': 'tp-gloss-summary', text: '白话译文' }),
      el('div', { 'class': 'tp-trans-body' }, paras.map(function (t) { return el('p', { text: t }); }))
    ]);
    d.open = true;
    transEl.appendChild(d);
    transEl.hidden = false;
  }

  /* 注解：每一项可以是一句话，也可以是 { h: 曲牌名, t: [句子…] }（杂剧一折里每支曲牌各有一组注解）。
     条目不多时默认展开，很多时（比如整折曲词）默认收起，避免弹窗太长。 */
  function fillGloss(glossEl, gloss, startClosed) {
    clear(glossEl);
    glossEl.hidden = true;
    if (!gloss || !gloss.length) return;
    var total = 0;
    gloss.forEach(function (g) { total += (typeof g === 'string') ? 1 : (g.t || []).length; });
    var body = el('div', { 'class': 'tp-gloss-body' });
    var plain = el('ul', { 'class': 'tp-gloss-list' });
    gloss.forEach(function (g) {
      if (typeof g === 'string') {
        plain.appendChild(el('li', { text: g }));
      } else {
        if (plain.childNodes.length) { body.appendChild(plain); plain = el('ul', { 'class': 'tp-gloss-list' }); }
        body.appendChild(el('div', { 'class': 'tp-gloss-h', text: g.h }));
        body.appendChild(el('ul', { 'class': 'tp-gloss-list' }, (g.t || []).map(function (t) { return el('li', { text: t }); })));
      }
    });
    if (plain.childNodes.length) body.appendChild(plain);
    var d = el('details', { 'class': 'tp-gloss' }, [
      el('summary', { 'class': 'tp-gloss-summary', text: glossLabel + '（' + total + ' 条）' }), body
    ]);
    if (total <= 12 && !startClosed) d.open = true;
    glossEl.appendChild(d);
    glossEl.hidden = false;
  }

  /* 出处：可点击的链接，新窗口打开 */
  function fillSrc(srcEl, sources) {
    clear(srcEl);
    srcEl.hidden = true;
    if (!sources || !sources.length) return;
    srcEl.appendChild(el('span', { 'class': 'tp-src-label', text: '出处：' }));
    sources.forEach(function (s, i) {
      if (i) srcEl.appendChild(document.createTextNode('；'));
      srcEl.appendChild(el('a', { href: s.u, target: '_blank', rel: 'noopener noreferrer', text: s.t }));
    });
    srcEl.hidden = false;
  }

  /* 造一个跟"三国人物关系弹窗"外观一致的居中弹窗，但内容换成"原文 + 讲解（+ 注解、出处）"，
     整页只建一次，点哪首作品就把哪首作品的数据填进去显示。 */
  function buildWorkModal() {
    var titleEl = el('h3', { 'class': 'wr-char-modal-title' });
    var formEl = el('div', { 'class': 'tp-modal-form' });
    var poemEl = el('div', { 'class': 'wr-poem tp-modal-poem' });
    var transEl = el('div', { 'class': 'tp-modal-trans' });
    var noteEl = el('div', { 'class': 'tp-modal-note' });
    var glossEl = el('div', { 'class': 'tp-modal-gloss' });
    var srcEl = el('div', { 'class': 'tp-modal-src' });
    var closeBtn = el('button', {
      'class': 'wr-char-modal-close', type: 'button', 'aria-label': '关闭'
    }, [el('span', { 'aria-hidden': 'true', text: '×' })]);
    var card = el('div', { 'class': 'wr-char-modal-card tp-modal-card', role: 'dialog', 'aria-modal': 'true' },
      [closeBtn, titleEl, formEl, poemEl, transEl, noteEl, glossEl, srcEl]);
    var overlay = el('div', { 'class': 'wr-char-modal-overlay', 'aria-hidden': 'true' }, [card]);
    document.body.appendChild(overlay);

    var api = { open: null, close: null, onClose: null };

    function close() {
      var wasOpen = overlay.classList.contains('is-open');
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      /* 搜索跳转过来时，关掉弹窗后让对应的作品按钮再亮一下，方便找到刚才那首诗在哪 */
      if (wasOpen && api.onClose) { var f = api.onClose; api.onClose = null; f(); }
    }
    function open(work) {
      titleEl.textContent = work.title || '';
      formEl.textContent = work.form || '';
      fillPoem(poemEl, work.original);
      fillTrans(transEl, work.trans);
      fillNote(noteEl, work.note);
      fillGloss(glossEl, work.gloss, !!work.trans);   /* 有译文时，逐句解读默认收起，弹窗不至于太长 */
      fillSrc(srcEl, work.source);
      /* 有注解/出处的作品（元曲）内容更多，弹窗放宽一点；唐诗不受影响 */
      card.classList.toggle('tp-modal-wide', !!((work.gloss && work.gloss.length) || (work.source && work.source.length) || work.trans));
      card.scrollTop = 0;
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
    }
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    api.open = open;
    api.close = close;
    return api;
  }

  /* 一首作品在作品目录里显示成一个可点击的小按钮，只露出名字（和体裁小字），
     点了才弹出原文和讲解，这样一位作品很多的诗人展开后也不会占太大篇幅。 */
  function workBtn(work, onPick) {
    var b = el('button', { 'class': 'tp-work-btn', type: 'button' }, [
      el('span', { 'class': 'tp-work-title', text: work.title }),
      work.form ? el('span', { 'class': 'tp-work-form', text: work.form }) : null
    ]);
    b.addEventListener('click', function () { onPick(work); });
    return b;
  }

  /* 一组作品：组名 +（可选）一段简介 + 作品按钮。
     简介 intro 用于元曲的杂剧（一部剧一组，先说这部剧写什么）；没有收录曲文的剧目只显示简介。 */
  function groupNode(group, onPick) {
    var works = group.works || [];
    return el('div', { 'class': 'tp-group' }, [
      el('div', { 'class': 'tp-group-label', text: group.label }),
      group.intro ? el('div', { 'class': 'tp-group-intro' }, String(group.intro).split('\n').filter(function (t) { return t.trim(); }).map(function (t) {
        return el('p', { text: t.trim() });
      })) : null,
      works.length
        ? el('div', { 'class': 'tp-works' }, works.map(function (w) { return workBtn(w, onPick); }))
        : (group.intro ? el('div', { 'class': 'tp-group-empty', text: '曲文暂未收录，先看上面的简介。' }) : null)
    ]);
  }

  /* 一位诗人一张卡片：收起时只看到姓名和小传的头一句；点开才展开完整小传和作品目录。
     用原生 <details> 实现折叠，跟"礼与思""字·语"板块的卡片是同一个交互习惯。 */
  function poetCard(poet, onPick) {
    var lifeFirst = (poet.life || '').split('。')[0];
    var worksCount = (poet.groups || []).reduce(function (n, g) { return n + (g.works || []).length; }, 0);
    var d = el('details', { 'class': 'tp-poet' });
    d.appendChild(el('summary', { 'class': 'tp-poet-summary' }, [
      el('span', { 'class': 'tp-poet-name', text: poet.name }),
      el('span', { 'class': 'tp-poet-hint', text: lifeFirst + '。' }),
      el('span', { 'class': 'tp-poet-count', text: '收录 ' + worksCount + ' ' + unit })
    ]));
    var body = el('div', { 'class': 'tp-poet-body' }, [
      el('p', { 'class': 'tp-poet-life', text: poet.life }),
      el('div', { 'class': 'tp-poet-groups' }, (poet.groups || []).map(function (g) { return groupNode(g, onPick); }))
    ]);
    d.appendChild(body);

    /* 登记给搜索功能用：这位诗人的卡片，以及卡片里每一首作品的按钮（顺序和数据里的作品顺序一致） */
    var flatWorks = [];
    (poet.groups || []).forEach(function (g) { (g.works || []).forEach(function (w) { flatWorks.push(w); }); });
    var btns = d.querySelectorAll('.tp-work-btn');
    registry.push({
      poet: poet, node: d, eraLabel: currentEraLabel, count: worksCount,
      works: flatWorks.map(function (w, i) { return { work: w, btn: btns[i] }; })
    });

    /* 首页"每日一签"抽到某一首诗时，会带着 ?id=诗人｜作品名 跳过来；
       这里给每一首作品登记一个"直达"：展开这位诗人的卡片，并直接弹出这首诗的详情。
       用"诗人｜作品名"而不是单独用作品名，是因为个别作品名在不同诗人之间会重复（比如《感遇（其二）》）。 */
    if (Z.onOpen) {
      (poet.groups || []).forEach(function (g) {
        (g.works || []).forEach(function (w) {
          Z.onOpen(poet.name + '｜' + w.title, function () {
            d.open = true;
            onPick(w);
            return d;
          });
        });
      });
    }

    return d;
  }

  function eraSection(era, onPick) {
    currentEraLabel = era.label || '';
    return el('section', { 'class': 'tp-era', 'aria-label': era.label }, [
      el('div', { 'class': 'tp-era-title', text: era.label }),
      el('div', { 'class': 'tp-poet-grid' }, (era.poets || []).map(function (p) { return poetCard(p, onPick); }))
    ]);
  }

  /* ================= 搜索：诗人名 / 作品名 / 原文关键词 =================
     搜索框固定在页面顶部（滚动时一直可见）。输入就出提示，点一条结果：
     - 诗人：展开这位诗人的卡片（小传 + 作品目录），滚到卡片位置，高亮
     - 作品 / 原文关键词：展开所属诗人，滚到这首诗的按钮并高亮，同时弹出原文和讲解
     不新增页面，全部在当前页面里完成。目前按简体字匹配。 */

  var MAX_RESULTS = 40;

  /* 匹配前先去掉空格和标点，这样输入"床前明月光疑是地上霜"（不带逗号）也能匹配到原文 */
  function norm(s) {
    return String(s || '').replace(/[\s，。、；：？！“”‘’"'（）()《》〈〉【】〔〕…—·,.;:?!\-]/g, '').toLowerCase();
  }

  /* 给每位诗人、每首作品建一条可搜索的记录 */
  function buildIndex() {
    var idx = [];
    registry.forEach(function (r) {
      idx.push({ kind: 'poet', rec: r, key: norm(r.poet.name) });
      r.works.forEach(function (w) {
        var lines = (w.work.original || []).map(norm);
        var starts = [], acc = 0;
        lines.forEach(function (l) { starts.push(acc); acc += l.length; });
        idx.push({
          kind: 'work', rec: r, item: w, key: norm(w.work.title),
          text: lines.join(''), lineStarts: starts
        });
      });
    });
    return idx;
  }

  /* 返回按"诗人 → 作品名 → 原文"排好的命中列表；名字开头匹配的排在前面 */
  function runSearch(idx, q) {
    var k = norm(q);
    if (!k) return { list: [], total: 0 };
    var poets = [], titles = [], texts = [];
    idx.forEach(function (e) {
      if (e.kind === 'poet') {
        var p = e.key.indexOf(k);
        if (p >= 0) poets.push({ e: e, rank: p === 0 ? 0 : 1 });
        return;
      }
      var t = e.key.indexOf(k);
      if (t >= 0) { titles.push({ e: e, rank: t === 0 ? 0 : 1 }); return; }
      var pos = e.text.indexOf(k);
      if (pos >= 0) {
        var li = 0;
        for (var i = 0; i < e.lineStarts.length; i++) { if (e.lineStarts[i] <= pos) li = i; }
        texts.push({ e: e, rank: 0, line: li });
      }
    });
    function byRank(a, b) { return a.rank - b.rank; }
    poets.sort(byRank); titles.sort(byRank);
    var all = poets.map(function (x) { return { type: 'poet', e: x.e }; })
      .concat(titles.map(function (x) { return { type: 'title', e: x.e }; }))
      .concat(texts.map(function (x) { return { type: 'text', e: x.e, line: x.line }; }));
    return { list: all.slice(0, MAX_RESULTS), total: all.length };
  }

  /* 高亮：加一个类，样式里做几次闪烁后保持淡金色边框，几秒后自动取消 */
  var hitNode = null, hitTimer = null;
  function clearHit() {
    if (hitNode) hitNode.classList.remove('tp-hit');
    hitNode = null;
    if (hitTimer) { clearTimeout(hitTimer); hitTimer = null; }
  }
  function flash(node) {
    if (!node) return;
    clearHit();
    hitNode = node;
    void node.offsetWidth; /* 让浏览器重新播放一次动画 */
    node.classList.add('tp-hit');
    hitTimer = setTimeout(clearHit, 6000);
  }

  function buildSearch(modal) {
    var idx = buildIndex();
    var input = el('input', {
      'class': 'tp-search-input', type: 'text', autocomplete: 'off', autocapitalize: 'off',
      spellcheck: 'false', enterkeyhint: 'search',
      placeholder: searchPh,
      'aria-label': searchPh
    });
    var clearBtn = el('button', { 'class': 'tp-search-clear', type: 'button', 'aria-label': '清空搜索', hidden: 'hidden' }, [
      el('span', { 'aria-hidden': 'true', text: '×' })
    ]);
    var list = el('ul', { 'class': 'tp-search-list', role: 'listbox', hidden: 'hidden' });
    var box = el('div', { 'class': 'tp-search-box' }, [input, clearBtn, list]);
    var bar = el('div', { 'class': 'tp-search', role: 'search' }, [box]);

    var items = [];   /* 当前下拉里的可点击条目 */
    var active = -1;
    var composing = false;

    function hideList() { list.hidden = true; active = -1; }
    function setActive(n) {
      if (!items.length) return;
      if (active >= 0 && items[active]) items[active].classList.remove('is-active');
      active = (n + items.length) % items.length;
      items[active].classList.add('is-active');
      if (items[active].scrollIntoView) items[active].scrollIntoView({ block: 'nearest' });
    }

    /* 选中一条结果后的跳转 */
    function jump(hit) {
      hideList();
      input.blur();
      var r = hit.e.rec;
      r.node.open = true;
      if (hit.type === 'poet') {
        setTimeout(function () {
          r.node.scrollIntoView({ behavior: 'smooth', block: 'start' });
          flash(r.node);
        }, 60);
      } else {
        var btn = hit.e.item.btn;
        setTimeout(function () {
          if (btn && btn.scrollIntoView) btn.scrollIntoView({ block: 'center' });
          /* 弹窗关闭后再让这首诗的按钮亮一下，看得见它在哪位诗人名下 */
          modal.onClose = function () { flash(btn); };
          modal.open(hit.e.item.work);
        }, 60);
      }
    }

    function tag(text, cls) { return el('span', { 'class': 'tp-sr-tag ' + cls, text: text }); }

    /* 原文那一行里，把匹配的词标出来（匹配不到就原样显示，比如关键词跨两句时） */
    function lineWithMark(line, q) {
      var raw = String(line || '');
      var qq = q.replace(/\s+/g, '');
      var at = qq ? raw.indexOf(qq) : -1;
      if (at < 0) return [raw.length > 44 ? raw.slice(0, 44) + '…' : raw];
      var from = Math.max(0, at - 14), to = Math.min(raw.length, at + qq.length + 24);
      return [(from > 0 ? '…' : '') + raw.slice(from, at), el('mark', { text: qq }), raw.slice(at + qq.length, to) + (to < raw.length ? '…' : '')];
    }

    function itemNode(hit, q) {
      var e = hit.e, r = e.rec, main, sub, t;
      if (hit.type === 'poet') {
        t = tag('诗人', 'tp-sr-tag-poet');
        main = el('span', { 'class': 'tp-sr-main', text: r.poet.name });
        sub = el('span', { 'class': 'tp-sr-sub', text: r.eraLabel + ' · 收录 ' + r.count + ' ' + unit });
      } else if (hit.type === 'title') {
        t = tag('作品', 'tp-sr-tag-work');
        main = el('span', { 'class': 'tp-sr-main', text: e.item.work.title });
        sub = el('span', { 'class': 'tp-sr-sub', text: r.poet.name + (e.item.work.form ? ' · ' + e.item.work.form : '') });
      } else {
        t = tag(textTag, 'tp-sr-tag-text');
        main = el('span', { 'class': 'tp-sr-main' }, lineWithMark((e.item.work.original || [])[hit.line], q));
        sub = el('span', { 'class': 'tp-sr-sub', text: '《' + e.item.work.title + '》' + r.poet.name });
      }
      var b = el('button', { 'class': 'tp-sr-item', type: 'button', role: 'option' }, [t, main, sub]);
      /* mousedown 而不是 click：避免输入框先失焦、下拉先收起，导致点击落空 */
      b.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
      b.addEventListener('click', function () { jump(hit); });
      return b;
    }

    function render() {
      var q = input.value;
      clearBtn.hidden = !q;
      list.textContent = '';
      items = []; active = -1;
      if (!norm(q)) { hideList(); return; }
      var res = runSearch(idx, q);
      if (!res.list.length) {
        list.appendChild(el('li', { 'class': 'tp-sr-empty', text: '没有找到"' + q.trim() + '"。换个字或词试试（目前按简体字搜索）。' }));
      } else {
        res.list.forEach(function (hit) {
          var b = itemNode(hit, q.trim());
          items.push(b);
          list.appendChild(el('li', { 'class': 'tp-sr-row' }, [b]));
        });
        if (res.total > res.list.length) {
          list.appendChild(el('li', { 'class': 'tp-sr-more', text: '共 ' + res.total + ' 条，只显示前 ' + res.list.length + ' 条，多输入几个字可以缩小范围' }));
        }
      }
      list.hidden = false;
    }

    input.addEventListener('compositionstart', function () { composing = true; });
    input.addEventListener('compositionend', function () { composing = false; render(); });
    input.addEventListener('input', function () { if (!composing) render(); });
    input.addEventListener('focus', function () { if (norm(input.value)) render(); });
    input.addEventListener('keydown', function (ev) {
      if (ev.isComposing) return;
      if (ev.key === 'ArrowDown') { ev.preventDefault(); if (list.hidden) render(); setActive(active + 1); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); setActive(active - 1); }
      else if (ev.key === 'Enter') {
        ev.preventDefault();
        if (list.hidden) render();
        if (items.length) (items[active >= 0 ? active : 0]).click();
      } else if (ev.key === 'Escape') {
        if (!list.hidden) hideList(); else { input.value = ''; render(); }
      }
    });
    clearBtn.addEventListener('click', function () { input.value = ''; render(); input.focus(); });
    document.addEventListener('click', function (ev) { if (!bar.contains(ev.target)) hideList(); });

    return bar;
  }

  /* mount(容器id, 数据, {eyebrow})：eyebrow 是页头小字（比如"文 · 唐诗"）。 */
  function mount(rootId, D, opts) {
    opts = opts || {};
    unit = opts.unit || '首';
    textTag = opts.textTag || '诗句';
    glossLabel = opts.glossLabel || '注解';
    if (opts.searchPlaceholder) searchPh = opts.searchPlaceholder;
    var root = document.getElementById(rootId);
    if (!Z || !root || !D || !D.eras || !D.eras.length) return;

    var modal = buildWorkModal();
    function onPick(work) { modal.open(work); }

    registry = [];
    var eras = el('div', { 'class': 'tp-eras' }, D.eras.map(function (era) { return eraSection(era, onPick); }));
    var searchBar = buildSearch(modal);

    Z.mount(root, [
      Z.head(D, opts.eyebrow || '文'),
      searchBar,
      Z.section(opts.sectionTitle || '按作者浏览', [eras])
    ].concat(Z.tipNotes(D)));

    document.title = (D.hook || '') + ' · 知否知否';

    /* 页面搭好之后，再看网址里有没有 ?id=，有就展开对应诗人、弹出对应作品 */
    if (Z.openFromQuery) Z.openFromQuery();
  }

  window.ZHIFOU_WENPOETS = { mount: mount };
})();
