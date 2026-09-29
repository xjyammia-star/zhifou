
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

  /* 造一个跟"三国人物关系弹窗"外观一致的居中弹窗，但内容换成"原文 + 白话讲解"，
     整页只建一次，点哪首作品就把哪首作品的数据填进去显示。 */
  function buildWorkModal() {
    var titleEl = el('h3', { 'class': 'wr-char-modal-title' });
    var formEl = el('div', { 'class': 'tp-modal-form' });
    var poemEl = el('div', { 'class': 'wr-poem tp-modal-poem' });
    var noteEl = el('p', { 'class': 'tp-modal-note' });
    var closeBtn = el('button', {
      'class': 'wr-char-modal-close', type: 'button', 'aria-label': '关闭'
    }, [el('span', { 'aria-hidden': 'true', text: '×' })]);
    var card = el('div', { 'class': 'wr-char-modal-card tp-modal-card', role: 'dialog', 'aria-modal': 'true' },
      [closeBtn, titleEl, formEl, poemEl, noteEl]);
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
      while (poemEl.firstChild) poemEl.removeChild(poemEl.firstChild);
      poemEl.appendChild(el('div', { 'class': 'wr-poem-body' }, (work.original || []).map(function (line) {
        return el('p', { text: line });
      })));
      noteEl.textContent = work.note || '';
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

  function groupNode(group, onPick) {
    return el('div', { 'class': 'tp-group' }, [
      el('div', { 'class': 'tp-group-label', text: group.label }),
      el('div', { 'class': 'tp-works' }, (group.works || []).map(function (w) { return workBtn(w, onPick); }))
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
      el('span', { 'class': 'tp-poet-count', text: '收录 ' + worksCount + ' 首' })
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
    return String(s || '').replace(/[\s，。、；：？！“”‘’"'（）()《》〈〉…—·,.;:?!\-]/g, '').toLowerCase();
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
      placeholder: '搜索诗人、作品名或诗句关键词，如：李白、静夜思、明月',
      'aria-label': '搜索诗人、作品名或诗句关键词'
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
      if (at < 0) return [raw];
      return [raw.slice(0, at), el('mark', { text: qq }), raw.slice(at + qq.length)];
    }

    function itemNode(hit, q) {
      var e = hit.e, r = e.rec, main, sub, t;
      if (hit.type === 'poet') {
        t = tag('诗人', 'tp-sr-tag-poet');
        main = el('span', { 'class': 'tp-sr-main', text: r.poet.name });
        sub = el('span', { 'class': 'tp-sr-sub', text: r.eraLabel + ' · 收录 ' + r.count + ' 首' });
      } else if (hit.type === 'title') {
        t = tag('作品', 'tp-sr-tag-work');
        main = el('span', { 'class': 'tp-sr-main', text: e.item.work.title });
        sub = el('span', { 'class': 'tp-sr-sub', text: r.poet.name + (e.item.work.form ? ' · ' + e.item.work.form : '') });
      } else {
        t = tag('诗句', 'tp-sr-tag-text');
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
