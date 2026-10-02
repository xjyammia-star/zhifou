/* 知否知否 · 建筑 · 陵墓与墓葬 · 详页（lingmu-detail.html?id=墓的代号）
   数据：先读首页索引 data/lingmu-index.js（找到这座墓、上一座、下一座），再按需加载 data/lm/<代号>.js。
   版面：页头 → 图片（带作者、授权、来源）→ 基本信息 → 各节（前几节默认展开，资料来源和存疑之处默认收起）→ 上一座/下一座。 */
(function () {
  'use strict';
  var L = window.LM, IDX = window.ZF_LM_INDEX, root = document.getElementById('app');
  if (!L || !IDX || !root) return;
  var el = L.el;

  var id = null;
  try { id = new URLSearchParams(location.search).get('id'); } catch (e) { /* 忽略 */ }

  var grp = null, pos = -1, byId = {};
  IDX.groups.forEach(function (g) {
    g.tombs.forEach(function (t, i) { byId[t.id] = t; if (t.id === id) { grp = g; pos = i; } });
  });

  function mount(kids) {
    var page = el('div', { 'class': 'wx-page lm-page' });
    kids.forEach(function (k) { if (k) page.appendChild(k); });
    root.textContent = '';
    root.appendChild(page);
  }
  function notFound() {
    mount([
      el('div', { 'class': 'wx-head' }, [
        el('div', { 'class': 'wx-eyebrow', text: '建筑 · 陵墓与墓葬' }),
        el('h1', { 'class': 'wx-hook', text: '没有找到这座墓' }),
        el('p', { 'class': 'wx-answer', text: '网址可能有误，或这一页还在整理。回到名墓名单看看吧。' })
      ]),
      el('p', { 'class': 'lm-back' }, [el('a', { href: 'lingmu.html#list', text: '← 回到陵墓与墓葬' })])
    ]);
    document.title = '陵墓与墓葬 · 建筑 · 知否知否';
  }
  if (!grp) { notFound(); return; }

  /* ---------- 图片 ---------- */
  function gallery(d) {
    var imgs = d.imgs || [];
    if (!imgs.length) return el('p', { 'class': 'lm-noimg', text: '这一页暂时没有合适的公开授权图片。' });
    var stage = el('div', { 'class': 'lm-stage' });
    var cap = el('p', { 'class': 'lm-cap' });
    var credit = el('p', { 'class': 'lm-credit' });
    var thumbs = el('div', { 'class': 'lm-thumbs', role: 'group', 'aria-label': '图片列表' });
    var tbs = [];
    function show(i) {
      var im = imgs[i];
      stage.textContent = '';
      stage.appendChild(el('img', {
        src: L.imgUrl(IDX.base, im, 1100),
        srcset: L.imgUrl(IDX.base, im, 640) + ' 640w, ' + L.imgUrl(IDX.base, im, 1100) + ' 1100w',
        sizes: '(max-width: 700px) 92vw, 1000px',
        width: im.w, height: im.h, alt: d.title + '：' + im.cap, decoding: 'async'
      }));
      cap.textContent = im.cap;
      credit.textContent = '';
      credit.appendChild(document.createTextNode('作者：' + (im.by || '未署名') + ' ｜ 授权：'));
      credit.appendChild(im.licUrl ? el('a', { href: im.licUrl, target: '_blank', rel: 'noopener noreferrer', text: im.lic }) : document.createTextNode(im.lic || '未标注'));
      credit.appendChild(document.createTextNode(' ｜ 来源：'));
      credit.appendChild(el('a', { href: im.link, target: '_blank', rel: 'noopener noreferrer', text: '维基共享资源' }));
      tbs.forEach(function (b, j) { b.setAttribute('aria-current', j === i ? 'true' : 'false'); });
    }
    imgs.forEach(function (im, i) {
      var b = el('button', { 'class': 'lm-thumb', type: 'button', 'aria-label': '看第 ' + (i + 1) + ' 张：' + im.cap, 'aria-current': 'false' }, [
        el('img', { src: L.imgUrl(IDX.base, im, 160), alt: '', loading: 'lazy', decoding: 'async' })
      ]);
      b.addEventListener('click', function () { show(i); });
      tbs.push(b);
      thumbs.appendChild(b);
    });
    show(0);
    var kids = [stage, cap, credit];
    if (imgs.length > 1) kids.push(thumbs);
    return el('div', { 'class': 'lm-gal' }, kids);
  }

  /* ---------- 各节 ---------- */
  var CLOSED = { '资料来源': 1, '存疑之处': 1 };
  function section(s, me) {
    var count = '';
    if (s.h === '历史背景故事' || s.h === '主要出土文物' || s.h === '常见误区与传闻辨析') {
      var n = s.els.filter(function (e) { return e.k === 'n' || e.k === 'b'; }).length;
      if (n) count = n + (s.h === '主要出土文物' ? ' 件（组）' : ' 条');
    }
    var extra = null;
    if (s.h === '与其他墓葬的比较') {
      extra = function (li, e) {
        if (!e.to || !e.to.length) return;
        var chips = el('span', { 'class': 'lm-chips' }, e.to.map(function (to) {
          var t = byId[to];
          return t ? el('a', { 'class': 'lm-chip', href: 'lingmu-detail.html?id=' + encodeURIComponent(to), text: '看“' + t.title + '” →' }) : null;
        }));
        li.appendChild(el('div', {}, [chips]));
      };
    }
    var det = el('details', { 'class': 'wx-paper lm-sec' }, [
      el('summary', {}, [s.h, count ? el('span', { 'class': 'lm-sec-n', text: count }) : null]),
      el('div', { 'class': 'lm-sec-body' }, L.renderEls(s.els, extra))
    ]);
    if (!CLOSED[s.h]) det.open = true;
    return det;
  }

  function render(d) {
    var kids = [];
    kids.push(el('div', { 'class': 'wx-head' }, [
      el('div', { 'class': 'wx-eyebrow', text: '建筑 · 陵墓与墓葬 · ' + grp.name }),
      el('h1', { 'class': 'wx-hook', text: d.title }),
      el('p', { 'class': 'wx-answer', text: d.line }),
      el('div', { 'class': 'lm-pills' }, [
        el('span', { 'class': 'lm-pill', text: d.dyn }),
        el('span', { 'class': 'lm-pill', text: d.place }),
        d.grp === 'F' ? el('span', { 'class': 'lm-pill is-warn', text: '不是墓葬' }) : null
      ])
    ]));
    kids.push(gallery(d));

    if (d.info && d.info.length) {
      kids.push(el('section', { 'class': 'wx-section', 'aria-label': '基本信息' }, [
        el('div', { 'class': 'wx-sec-title', text: '基本信息' }),
        el('dl', { 'class': 'wx-paper lm-facts' }, d.info.map(function (r) {
          return el('div', { 'class': 'lm-facts-row' }, [el('dt', { text: r[0] }), L.rich(el('dd'), r[1])]);
        }))
      ]));
    }

    var secs = d.secs.map(function (s) { return section(s, d); });
    if (secs.length) kids.push(el('section', { 'class': 'wx-section', 'aria-label': '详细介绍' }, [el('div', { 'class': 'wx-sec-title', text: '详细介绍' })].concat(secs)));

    var prev = pos > 0 ? grp.tombs[pos - 1] : null, next = pos < grp.tombs.length - 1 ? grp.tombs[pos + 1] : null;
    if (prev || next) {
      kids.push(el('div', { 'class': 'lm-pn' }, [
        prev ? el('a', { href: 'lingmu-detail.html?id=' + encodeURIComponent(prev.id) }, [el('small', { text: '上一座' }), prev.title]) : el('span'),
        next ? el('a', { 'class': 'is-next', href: 'lingmu-detail.html?id=' + encodeURIComponent(next.id) }, [el('small', { text: '下一座' }), next.title]) : el('span')
      ]));
    }
    kids.push(el('p', { 'class': 'lm-back' }, [el('a', { href: 'lingmu.html#list', text: '← 回到陵墓与墓葬名单' })]));

    mount(kids);
    document.title = d.title + ' · 陵墓与墓葬 · 知否知否';
  }

  var s = document.createElement('script');
  s.src = 'data/lm/' + id + '.js';
  s.onload = function () {
    var d = window.ZF_LM && window.ZF_LM[id];
    if (!d) { notFound(); return; }
    render(d);
  };
  s.onerror = notFound;
  document.head.appendChild(s);
})();
