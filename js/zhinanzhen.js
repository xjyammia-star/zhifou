
/* 知否知否 · 四大发明·指南针页脚本
   数据来自 data/zhinanzhen.js（window.ZHIFOU_ZHINANZHEN），本文件只负责排版。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_ZHINANZHEN, W = window.WU, root = document.getElementById('app');
  if (!D || !W || !root) return;
  var el = W.el;

  /* 罗盘小图：needleClass 是磁针的类名，angle 是磁针歪几度（SVG 里正数是顺时针）；固定的线稿，不来自数据 */
  function dialSvg(angle, withGuide) {
    var t = '';
    for (var i = 0; i < 24; i++) {
      var long = i % 6 === 0;
      t += '<line x1="100" y1="' + (long ? 12 : 14) + '" x2="100" y2="' + (long ? 24 : 19) + '" stroke="#6a4a36" stroke-width="' + (long ? 2 : 1.2) + '" transform="rotate(' + (i * 15) + ' 100 100)"/>';
    }
    var guide = withGuide ? '<line x1="100" y1="30" x2="100" y2="170" stroke="#2c6a6e" stroke-width="1.5" stroke-dasharray="5 4"/>' : '';
    var needle = '<g class="fm-needle' + (angle ? ' is-tilt' : '') + '">' +
      '<path d="M100 40 L107 100 L93 100 Z" fill="#1f3436"/>' +
      '<path d="M93 100 L107 100 L100 160 Z" fill="#b5443a"/>' +
      '<circle cx="100" cy="100" r="4.5" fill="#f5f0e3" stroke="#1f3436" stroke-width="1.5"/></g>';
    return '<svg viewBox="0 0 200 200" role="img" aria-label="一个罗盘，磁针红色的一头指向南">' +
      '<circle cx="100" cy="100" r="92" fill="#f5f0e3" stroke="#6a4a36" stroke-width="4"/>' + t +
      '<text x="100" y="46" text-anchor="middle" font-size="15" fill="#4a6260">北</text>' +
      '<text x="100" y="166" text-anchor="middle" font-size="15" fill="#b5443a">南</text>' +
      '<text x="170" y="105" text-anchor="middle" font-size="15" fill="#4a6260">东</text>' +
      '<text x="30" y="105" text-anchor="middle" font-size="15" fill="#4a6260">西</text>' +
      guide + needle + '</svg>';
  }
  function figure(angle, withGuide) {
    var f = el('div', { 'class': 'fm-figure wx-paper' });
    f.innerHTML = dialSvg(angle, withGuide);
    return f;
  }

  /* 先分清 */
  function apart() {
    var A = D.apart;
    return W.section('先分清：司南和指南针', [
      W.note(A.note),
      el('div', { 'class': 'fm-apart' }, A.items.map(function (it) {
        return el('div', { 'class': 'fm-card wx-paper' }, [
          el('span', { 'class': 'fm-card-meta', text: it.period }),
          el('span', { 'class': 'fm-card-name', text: it.name }),
          el('span', { 'class': 'fm-card-text', text: it.text })
        ]);
      }))
    ]);
  }

  /* 四种安置方法：左边是会摆动的罗盘，右边是四个方法 */
  function methods() {
    var M = D.methods;
    var fig = figure(0, false);
    var needle = fig.querySelector('.fm-needle');
    var icons = ['m1', 'm2', 'm3', 'm4'];
    var items = M.items.map(function (it, i) {
      return { name: it.name, icon: icons[i], rows: [{ label: '做法', text: it.how }, { label: '特点', text: it.trait, note: true }] };
    });
    var st = W.stepper({
      items: items, ordered: false, cols: 4, aria: '四种安置磁针的方法', first: W.idIndex(items),
      onSelect: function () {
        if (!needle) return;
        needle.classList.remove('is-swing');
        void needle.getBoundingClientRect();
        needle.classList.add('is-swing');
      }
    });
    return W.section('四种安置磁针的方法', [
      W.note(M.note),
      el('div', { 'class': 'fm-method' }, [fig, st]),
      W.source(M.source)
    ]);
  }

  /* 磁偏角 */
  function declination() {
    var C = D.declination;
    return W.section('磁偏角：磁针不全指南', [
      el('div', { 'class': 'fm-decl' }, [
        figure(-10, true),
        el('div', { 'class': 'fm-stack' }, [W.note(C.note), W.source(C.source), W.remind(C.caption)])
      ])
    ]);
  }

  /* 一只磁针上海船 */
  function boat() {
    var B = D.boat;
    return W.section('一只磁针上海船', [
      W.note(B.note),
      W.cards(B.items.map(function (x) { return { name: x.name, text: x.line }; }), { numbered: true }),
      W.source(B.source)
    ]);
  }

  function spread() {
    var S = D.spread;
    return W.section('传播与影响', [W.note(S.note), W.cards(S.items.map(function (x) { return { name: x.name, text: x.text }; }))]);
  }

  W.mount(root, W.head(D, '物 · 四大发明 · 指南针').concat([
    apart(), methods(), declination(), boat(), spread(), W.myths(D.myths), W.see(D.see)
  ]).concat(W.tipNotes(D)));
})();
