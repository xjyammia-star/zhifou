
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

    function close() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
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

    return { open: open, close: close };
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
    return el('section', { 'class': 'tp-era', 'aria-label': era.label }, [
      el('div', { 'class': 'tp-era-title', text: era.label }),
      el('div', { 'class': 'tp-poet-grid' }, (era.poets || []).map(function (p) { return poetCard(p, onPick); }))
    ]);
  }

  /* mount(容器id, 数据, {eyebrow})：eyebrow 是页头小字（比如"文 · 唐诗"）。 */
  function mount(rootId, D, opts) {
    opts = opts || {};
    var root = document.getElementById(rootId);
    if (!Z || !root || !D || !D.eras || !D.eras.length) return;

    var modal = buildWorkModal();
    function onPick(work) { modal.open(work); }

    var eras = el('div', { 'class': 'tp-eras' }, D.eras.map(function (era) { return eraSection(era, onPick); }));

    Z.mount(root, [
      Z.head(D, opts.eyebrow || '文'),
      Z.section(opts.sectionTitle || '按作者浏览', [eras])
    ].concat(Z.tipNotes(D)));

    document.title = (D.hook || '') + ' · 知否知否';

    /* 页面搭好之后，再看网址里有没有 ?id=，有就展开对应诗人、弹出对应作品 */
    if (Z.openFromQuery) Z.openFromQuery();
  }

  window.ZHIFOU_WENPOETS = { mount: mount };
})();
