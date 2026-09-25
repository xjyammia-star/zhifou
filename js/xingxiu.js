/* 知否知否 · 二十八宿星图页脚本
   数据来自 data/xingxiu.js（window.ZHIFOU_XINGXIU），本文件只负责画图和交互。 */
(function () {
  'use strict';
  var D = window.ZHIFOU_XINGXIU;
  var root = document.getElementById('app');
  if (!D || !root) return;

  var NS = 'http://www.w3.org/2000/svg';
  var RAD = Math.PI / 180;
  var CX = 360, CY = 360;
  var BEAST_COLOR = { '青龙': '#7fb8a4', '玄武': '#7f92b8', '白虎': '#d8d4c8', '朱雀': '#d9826b' };
  var BEAST_START = { '青龙': 225, '玄武': 135, '白虎': 45, '朱雀': -45 };
  var SEASON_WORD = { '春': '春天', '夏': '夏天', '秋': '秋天', '冬': '冬天' };

  /* 详情框上方的配图。有了图，把图片文件放进 img/shen/ 文件夹，
     再把下面对应的空引号改成图片路径即可，例如：'青龙': 'img/shen/xingxiu-qinglong.jpg'。
     点某一宿时，显示它所属四象的那张图；空着的就显示"配图待补"占位。 */
  var IMAGES = { '青龙': '', '玄武': '', '白虎': '', '朱雀': '', '中宫': '' };

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (Array.isArray(kids) ? kids : (kids ? [kids] : [])).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function svg(tag, attrs, text) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text != null) n.textContent = text;
    return n;
  }
  function pt(r, deg) { return [CX + r * Math.cos(deg * RAD), CY + r * Math.sin(deg * RAD)]; }
  function f(n) { return n.toFixed(2); }

  /* 按北京时间判断当前属于哪个传统季节（以立春、立夏、立秋、立冬的大致日期为界） */
  function currentSeason() {
    var d = new Date(Date.now() + 8 * 3600 * 1000);
    var v = (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
    if (v >= 204 && v < 505) return '春';
    if (v >= 505 && v < 807) return '夏';
    if (v >= 807 && v < 1107) return '秋';
    return '冬';
  }

  var beastByName = {}, beastBySeason = {}, xiuByName = {}, xiuIndex = {};
  D.beasts.forEach(function (b) { beastByName[b.name] = b; beastBySeason[b.season] = b; });
  D.xiu.forEach(function (x, i) { xiuByName[x.name] = x; xiuIndex[x.name] = i; });
  var season = currentSeason();
  var seasonBeast = beastBySeason[season];

  var state = { kind: 'beast', name: seasonBeast.name };
  var nodes = {}, sectors = {}, centerG = null, panel = null;

  /* ---------- 星图 ---------- */
  function buildRing() {
    var s = svg('svg', { 'class': 'xx-svg', viewBox: '0 0 720 720', role: 'group', 'aria-label': '二十八宿圆形星图，点击星宿或四象查看详情' });
    [[350, 'is-outer'], [278, ''], [150, ''], [110, 'is-thin']].forEach(function (r) {
      s.appendChild(svg('circle', { cx: CX, cy: CY, r: r[0], 'class': 'xx-ring-line ' + r[1] }));
    });

    D.beasts.forEach(function (b) {
      var a = BEAST_START[b.name];
      var o1 = pt(350, a), o2 = pt(350, a - 90), i1 = pt(150, a - 90), i2 = pt(150, a);
      var d = 'M' + f(o1[0]) + ' ' + f(o1[1]) + ' A350 350 0 0 0 ' + f(o2[0]) + ' ' + f(o2[1]) +
        ' L' + f(i1[0]) + ' ' + f(i1[1]) + ' A150 150 0 0 1 ' + f(i2[0]) + ' ' + f(i2[1]) + ' Z';
      var sec = svg('path', { d: d, 'class': 'xx-sector' + (b.season === season ? ' is-season' : '') });
      sec.addEventListener('click', function () { select('beast', b.name, true); });
      sectors[b.name] = sec;
      s.appendChild(sec);
    });

    D.beasts.forEach(function (b) {
      var a = BEAST_START[b.name];
      var u = pt(110, a), v = pt(350, a);
      s.appendChild(svg('line', { x1: f(u[0]), y1: f(u[1]), x2: f(v[0]), y2: f(v[1]), 'class': 'xx-cardinal' }));
      for (var k = 1; k < 7; k++) {
        var p = pt(278, a - k * 90 / 7), q = pt(350, a - k * 90 / 7);
        s.appendChild(svg('line', { x1: f(p[0]), y1: f(p[1]), x2: f(q[0]), y2: f(q[1]), 'class': 'xx-tick' }));
      }
    });

    D.beasts.forEach(function (b) {
      var a = BEAST_START[b.name] - 45;
      var g = svg('g', { 'class': 'xx-beast', role: 'button', tabindex: '0', 'aria-label': b.dir + '方' + b.name + '，七宿' });
      var n = pt(216, a);
      g.appendChild(svg('text', { x: f(n[0]), y: f(n[1]), 'class': 'xx-beast-name', fill: BEAST_COLOR[b.name] }, b.name));
      var isNow = b.season === season;
      g.appendChild(svg('text', { x: f(n[0]), y: f(n[1] + 30), 'class': 'xx-beast-sub' }, b.dir + ' · ' + b.season));
      if (isNow) g.appendChild(svg('text', { x: f(n[0]), y: f(n[1] + 48), 'class': 'xx-beast-sub is-now' }, '当季'));
      g.addEventListener('click', function () { select('beast', b.name, true); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select('beast', b.name, true); } });
      s.appendChild(g);
    });

    D.xiu.forEach(function (x) {
      var b = beastByName[x.beast];
      var j = b.xiu.indexOf(x.name);
      var p = pt(314, BEAST_START[b.name] - (j + 0.5) * 90 / 7);
      var g = svg('g', { 'class': 'xx-node', role: 'button', tabindex: '0', 'aria-label': x.name + '宿，' + b.dir + '方' + b.name });
      g.appendChild(svg('circle', { cx: f(p[0]), cy: f(p[1]), r: 29, 'class': 'xx-node-bg' }));
      g.appendChild(svg('text', { x: f(p[0]), y: f(p[1]), 'class': 'xx-node-text' }, x.name));
      g.addEventListener('click', function () { select('xiu', x.name, true); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select('xiu', x.name, true); } });
      nodes[x.name] = g;
      s.appendChild(g);
    });

    centerG = svg('g', { 'class': 'xx-center', role: 'button', tabindex: '0', 'aria-label': '中宫，三垣' });
    centerG.appendChild(svg('circle', { cx: CX, cy: CY, r: 96, 'class': 'xx-center-bg' }));
    centerG.appendChild(svg('text', { x: CX, y: CY - 10, 'class': 'xx-center-title' }, '中宫'));
    centerG.appendChild(svg('text', { x: CX, y: CY + 28, 'class': 'xx-center-sub' }, '三垣'));
    centerG.addEventListener('click', function () { select('center', '', true); });
    centerG.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select('center', '', true); } });
    s.appendChild(centerG);

    return s;
  }

  /* ---------- 详情面板 ---------- */
  function field(label, text, cls) {
    return el('div', { 'class': 'xx-field' + (cls ? ' ' + cls : '') }, [el('dt', { text: label }), el('dd', { text: text })]);
  }
  function stepBtn(label, kind, name) {
    var b = el('button', { type: 'button', 'class': 'xx-btn', text: label });
    b.addEventListener('click', function () { select(kind, name, true); });
    return b;
  }

  function renderPanel() {
    panel.textContent = '';
    var imgKey = state.kind === 'xiu' ? xiuByName[state.name].beast : (state.kind === 'beast' ? state.name : '中宫');
    var body = el('div', { 'class': 'xx-panel-body' });
    var foot = null;
    panel.appendChild(body);
    panel.appendChild(imageSlot(imgKey));
    if (state.kind === 'xiu') {
      var x = xiuByName[state.name], b = beastByName[x.beast];
      var i = xiuIndex[x.name], n = D.xiu.length;
      body.appendChild(el('div', { 'class': 'xx-panel-kicker', text: b.dir + '方' + b.name + ' · 第 ' + (b.xiu.indexOf(x.name) + 1) + ' 宿' }));
      var t = el('h2', { 'class': 'xx-panel-title', text: x.name + '宿' });
      t.style.color = BEAST_COLOR[b.name];
      body.appendChild(t);
      var dl = el('dl', { 'class': 'xx-fields' });
      dl.appendChild(field('字面意象', x.image));
      dl.appendChild(field('古人怎么说', x.note));
      if (x.ext) dl.appendChild(field('延伸', x.ext, 'is-ext'));
      dl.appendChild(field('现代天区（大致参照）', x.sky));
      body.appendChild(dl);
      foot = el('div', { 'class': 'xx-stepper' }, [
        stepBtn('← ' + D.xiu[(i + n - 1) % n].name, 'xiu', D.xiu[(i + n - 1) % n].name),
        stepBtn(D.xiu[(i + 1) % n].name + ' →', 'xiu', D.xiu[(i + 1) % n].name)
      ]);
    } else if (state.kind === 'beast') {
      var q = beastByName[state.name];
      body.appendChild(el('div', { 'class': 'xx-panel-kicker', text: q.dir + '方 · ' + q.season + ' · ' + q.color + '色' }));
      var tt = el('h2', { 'class': 'xx-panel-title', text: q.name });
      tt.style.color = BEAST_COLOR[q.name];
      body.appendChild(tt);
      body.appendChild(el('p', { 'class': 'xx-panel-text', text: q.focus }));
      var chips = el('div', { 'class': 'xx-chips', role: 'group', 'aria-label': q.name + '七宿' });
      q.xiu.forEach(function (nm) {
        var c = el('button', { type: 'button', 'class': 'xx-chip', text: nm });
        c.addEventListener('click', function () { select('xiu', nm, true); });
        chips.appendChild(c);
      });
      body.appendChild(chips);
    } else {
      body.appendChild(el('div', { 'class': 'xx-panel-kicker', text: '圆圈中间的北天' }));
      body.appendChild(el('h2', { 'class': 'xx-panel-title', text: D.center.title }));
      body.appendChild(el('p', { 'class': 'xx-panel-text', text: D.center.text }));
    }
    if (foot) panel.appendChild(foot);
    watchOverflow(body);
  }

  /* 配图位：有图就显示图，没有就显示占位 */
  function imageSlot(key) {
    var box = el('div', { 'class': 'xx-image' });
    if (IMAGES[key]) {
      box.appendChild(el('img', { src: IMAGES[key], alt: key + '配图', loading: 'lazy' }));
    } else {
      box.classList.add('is-empty');
      box.appendChild(el('span', { 'class': 'xx-image-note', text: '配图待补 · ' + key }));
    }
    return box;
  }

  /* 文字区放不下时可以上下滚动；没滚到底时，底部有淡出提示 */
  function watchOverflow(body) {
    function update() {
      var more = body.scrollHeight - body.clientHeight - body.scrollTop > 4;
      body.classList.toggle('has-more', more);
    }
    body.addEventListener('scroll', update);
    update();
    if (window.requestAnimationFrame) window.requestAnimationFrame(update);
  }

  function select(kind, name, user) {
    state = { kind: kind, name: name };
    var activeBeast = kind === 'beast' ? name : (kind === 'xiu' ? xiuByName[name].beast : null);
    Object.keys(nodes).forEach(function (k) {
      var g = nodes[k];
      g.classList.toggle('is-selected', kind === 'xiu' && k === name);
      g.classList.toggle('is-dim', !!activeBeast && kind === 'beast' && xiuByName[k].beast !== activeBeast);
    });
    Object.keys(sectors).forEach(function (k) { sectors[k].classList.toggle('is-selected', k === activeBeast); });
    centerG.classList.toggle('is-selected', kind === 'center');
    renderPanel();
    if (user && window.innerWidth < 960 && panel.scrollIntoView) {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    }
  }

  /* ---------- 页面 ---------- */
  function sectionTitle(text) { return el('div', { 'class': 'section-title', text: text }); }

  function render() {
    var page = el('div', { 'class': 'xx-page' });

    page.appendChild(el('div', { 'class': 'xx-head' }, [
      el('div', { 'class': 'xx-eyebrow', text: '神 · 星图' }),
      el('h1', { 'class': 'xx-hook', text: D.hook }),
      el('p', { 'class': 'xx-answer', text: D.answer })
    ]));

    panel = el('aside', { 'class': 'xx-panel', 'aria-live': 'polite', 'aria-label': '详情' });
    var slot = el('div', { 'class': 'xx-panel-slot' }, [panel]);
    var seasonLine = el('span', { 'class': 'xx-season-line',
      text: '按传统配属，现在属于' + SEASON_WORD[season] + '，对应' + seasonBeast.dir + '方' + seasonBeast.name + '。' });
    var cap = el('p', { 'class': 'xx-cap' }, [seasonLine, document.createTextNode(D.orient)]);
    page.appendChild(el('section', { 'class': 'xx-explore', 'aria-label': '二十八宿星图' }, [
      el('div', { 'class': 'xx-ring' }, [buildRing()]), cap, slot
    ]));

    page.appendChild(el('section', { 'class': 'xx-section' }, [
      sectionTitle('先弄清楚：什么是“宿”'),
      el('p', { 'class': 'xx-intro', text: D.intro }),
      el('div', { 'class': 'xx-uses' }, D.uses.map(function (u) {
        return el('div', { 'class': 'xx-use' }, [el('h3', { text: u.title }), el('p', { text: u.text })]);
      }))
    ]));

    page.appendChild(el('section', { 'class': 'xx-section' }, [
      sectionTitle('常见误读'),
      el('div', { 'class': 'xx-misreads' }, D.misreads.map(function (m) {
        return el('details', { 'class': 'xx-misread' }, [el('summary', { text: m.title }), el('p', { text: m.text })]);
      }))
    ]));

    page.appendChild(el('section', { 'class': 'xx-section' }, [
      sectionTitle('想亲眼看看？从这里开始'),
      el('ol', { 'class': 'xx-steps' }, D.steps.map(function (st, i) {
        return el('li', { 'class': 'xx-step' }, [
          el('span', { 'class': 'xx-step-no', 'aria-hidden': 'true', text: String(i + 1) }),
          el('div', {}, [el('h3', { text: st.title }), el('p', { text: st.text })])
        ]);
      }))
    ]));

    page.appendChild(el('div', { 'class': 'tip-box' }, [el('div', { 'class': 'tip-label', text: '小提示' }), el('p', { text: D.tip })]));

    page.appendChild(el('details', { 'class': 'notes' }, [
      el('summary', { text: '批注' }),
      el('div', { 'class': 'notes-body' }, D.notes.map(function (n) {
        var m = n.match(/^([^：]{1,4})：(.*)$/);
        return el('p', {}, m ? [el('span', { 'class': 'note-label', text: m[1] }), document.createTextNode(m[2])] : [document.createTextNode(n)]);
      }))
    ]));

    root.textContent = '';
    root.appendChild(page);
    select('beast', seasonBeast.name, false);
  }

  render();
})();
