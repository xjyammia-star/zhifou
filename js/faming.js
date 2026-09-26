
/* 知否知否 · 四大发明·总览页脚本
   数据来自 data/faming.js（window.ZHIFOU_FAMING），本文件只负责排版。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_FAMING, W = window.WU, root = document.getElementById('app');
  if (!D || !W || !root) return;
  var el = W.el;

  var KIND_CLASS = { '造纸术': 'k-zaozhi', '印刷术': 'k-yinshua', '火药': 'k-huoyao', '指南针': 'k-zhinanzhen', '概念': 'k-gainian' };
  var KIND_ICON = { '造纸术': 'zaozhi', '印刷术': 'yinshua', '火药': 'huoyao', '指南针': 'zhinanzhen' };

  /* 说法的来历 */
  function origin() {
    var o = D.origin;
    return W.section('这个说法怎么来的', [
      W.note(o.note),
      W.steps3(o.steps.map(function (s) { return { name: s.name, who: s.who, text: s.say }; })),
      W.remind(o.remind)
    ]);
  }

  /* 四层对照：桌面是一张表，手机上是四张卡片 */
  function layers() {
    var L = D.layers;
    var thead = el('tr', {}, [el('th', { scope: 'col' })].concat(L.kinds.map(function (k) {
      return el('th', { scope: 'col', 'class': KIND_CLASS[k], text: k });
    })));
    var rows = L.items.map(function (it) {
      return el('tr', {}, [el('th', { scope: 'row' }, [
        el('span', { 'class': 'fm-layer-name', text: it.name }),
        el('span', { 'class': 'fm-layer-meaning', text: it.meaning })
      ])].concat(it.cells.map(function (c) { return el('td', { text: c }); })));
    });
    var table = el('div', { 'class': 'fm-layers' }, [el('table', { 'aria-label': '四项发明的四层对照' }, [el('thead', {}, [thead]), el('tbody', {}, rows)])]);
    var cards = el('div', { 'class': 'fm-layers-cards' }, L.items.map(function (it) {
      var kids = [el('span', { 'class': 'fm-card-name', text: it.name }), el('span', { 'class': 'fm-layer-meaning', text: it.meaning })];
      L.kinds.forEach(function (k, i) {
        kids.push(el('div', { 'class': 'fm-line ' + KIND_CLASS[k] }, [el('span', { 'class': 'fm-kind', text: k }), el('span', { text: it.cells[i] })]));
      });
      return el('div', { 'class': 'fm-layer-card wx-paper' }, kids);
    }));
    return W.section('四层对照', [W.note(L.note), table, cards]);
  }

  /* 手卷时间线 */
  function timeline() {
    var T = D.timeline, filter = '全部', chips = [], items = [];
    var count = el('span', { 'class': 'wx-count', 'aria-live': 'polite' });
    var track = el('div', { 'class': 'fm-tl-track' });
    var scroller = el('div', { 'class': 'fm-tl', tabindex: '0', role: 'region', 'aria-label': '手卷时间线，可左右滑动' }, [track]);

    T.items.forEach(function (it) {
      var kinds = it.kinds.map(function (k) { return el('span', { 'class': 'fm-kind ' + KIND_CLASS[k], text: k }); });
      var card = el('article', { 'class': 'fm-tl-item wx-paper ' + KIND_CLASS[it.kinds[0]] }, [
        el('div', { 'class': 'fm-tl-year', text: it.name }),
        el('div', { 'class': 'fm-tl-tags' }, kinds),
        el('div', { 'class': 'fm-tl-event', text: it.event }),
        el('div', { 'class': 'fm-tl-note', text: it.note })
      ]);
      items.push({ node: card, kinds: it.kinds });
      track.appendChild(card);
    });

    function apply() {
      var n = 0;
      items.forEach(function (x) {
        var show = filter === '全部' || x.kinds.indexOf(filter) >= 0;
        x.node.hidden = !show;
        if (show) n++;
      });
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-k') === filter ? 'true' : 'false'); });
      count.textContent = '共 ' + n + ' 个节点';
      scroller.scrollLeft = 0;
    }
    var bar = el('div', { 'class': 'wx-chips', role: 'group', 'aria-label': '按发明筛选' });
    ['全部', '造纸术', '印刷术', '火药', '指南针', '概念'].forEach(function (k) {
      var b = el('button', { 'class': 'wx-chip-w', type: 'button', 'data-k': k, 'aria-pressed': 'false', text: k });
      b.addEventListener('click', function () { filter = k; apply(); });
      chips.push(b);
      bar.appendChild(b);
    });
    function arrow(txt, dir, label) {
      var b = el('button', { 'class': 'wx-step-btn', type: 'button', 'aria-label': label, text: txt });
      b.addEventListener('click', function () { scroller.scrollBy({ left: dir * 432, behavior: 'smooth' }); });
      return b;
    }
    var tools = el('div', { 'class': 'fm-tl-tools' }, [bar, el('div', { 'class': 'fm-tl-arrows' }, [count, arrow('←', -1, '向左'), arrow('→', 1, '向右')])]);
    apply();
    return W.section('时间线', [W.note(T.note), tools, scroller]);
  }

  /* 连起来的四条链 */
  function chains() {
    var C = D.chains;
    return W.section('连起来的四条链', [W.note(C.note), W.cards(C.items.map(function (c) { return { name: c.name, text: c.line }; }), { numbered: true })]);
  }

  /* 四个页面 */
  function pages() {
    return W.section('四项发明，各看一页', [el('div', { 'class': 'fm-grid' }, D.pages.map(function (p) {
      return el('a', { 'class': 'fm-card wx-paper ' + KIND_CLASS[p.name], href: p.href, 'aria-label': p.name + '：' + p.line }, [
        W.iconBox(KIND_ICON[p.name], 'fm-cell-ic'),
        el('span', { 'class': 'fm-card-name', text: p.name }),
        el('span', { 'class': 'fm-card-text', text: p.line }),
        el('div', { 'class': 'fm-pills' }, p.tags.map(function (t) { return el('span', { 'class': 'fm-pill', text: t }); })),
        el('span', { 'class': 'fm-go', 'aria-hidden': 'true', text: '进入 →' })
      ]);
    }))]);
  }

  W.mount(root, W.head(D, '物 · 四大发明').concat([
    origin(), layers(), timeline(), chains(), W.myths(D.myths), pages()
  ]).concat(W.tipNotes(D)));
})();
