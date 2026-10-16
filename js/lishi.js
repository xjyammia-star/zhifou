/* 知否知否 · 历史 · 总览页
   四个标签：朝代（按朝代分组的卡片，原来的样子）、年表、帝王、人物。
   “朝代”用 data/lishi-index.js（由 工具脚本/生成历史数据.py 生成）；
   “年表／帝王／人物”用 data/lishi-all.js（由 工具脚本/生成历史汇总数据.py 生成），点开这几个标签时才加载，免得总览页变慢。
   排版工具：js/zycommon.js；样式：css/lishi.css、css/lishi-tabs.css */
(function () {
  'use strict';
  var D = window.ZHIFOU_LISHI_INDEX, Z = window.ZY;
  var root = document.getElementById('app');
  if (!D || !Z || !root) return;
  var el = Z.el;

  /* ---------- 标签：朝代（原来的总览） ---------- */
  function card(d) {
    var stat = d.ready
      ? '帝王 ' + d.nEmp + ' 位 · 大事 ' + d.nEv + ' 条 · 人物 ' + d.nPeople + ' 位'
      : '整理中，敬请期待';
    var kids = [
      el('span', { 'class': 'ss-dyn-name', text: d.name }),
      el('span', { 'class': 'ss-dyn-range', text: d.range }),
      el('span', { 'class': 'ss-dyn-line', text: d.blurb }),
      el('span', { 'class': 'ss-dyn-stat', text: stat })
    ];
    if (d.ready) return el('a', { 'class': 'ss-dyn', href: 'lishi-chaodai.html?d=' + d.key, 'aria-label': d.name + '：' + d.blurb }, kids);
    return el('div', { 'class': 'ss-dyn is-soon', 'aria-label': d.name + '（整理中）' }, kids);
  }
  function buildDynasties() {
    var groups = D.groups.map(function (g) {
      var list = D.dynasties.filter(function (d) { return d.group === g; });
      if (!list.length) return null;
      var done = list.filter(function (d) { return d.ready; }).length;
      return Z.section(g + (done < list.length ? '（' + done + '/' + list.length + ' 已上线）' : ''),
        [el('div', { 'class': 'ss-grid' }, list.map(card))]);
    });
    return groups.filter(Boolean);
  }

  /* ---------- 汇总数据：点开后三个标签才加载 ---------- */
  var ALL = null, loading = false, waiting = [], filled = false;
  function loadAll(cb) {
    if (window.ZHIFOU_LISHI_ALL) { ALL = window.ZHIFOU_LISHI_ALL; cb(); return; }
    waiting.push(cb);
    if (loading) return;
    loading = true;
    var s = document.createElement('script');
    s.src = 'data/lishi-all.js';
    s.onload = function () { ALL = window.ZHIFOU_LISHI_ALL; loading = false; waiting.splice(0).forEach(function (f) { f(); }); };
    s.onerror = function () { loading = false; waiting.splice(0).forEach(function (f) { f(true); }); };
    document.head.appendChild(s);
  }

  function richText(t) {
    var out = [];
    String(t || '').split(/(〔[^〕]*待核[^〕]*〕)/).forEach(function (p) {
      if (!p) return;
      if (/^〔[^〕]*待核[^〕]*〕$/.test(p)) out.push(el('em', { 'class': 'ss-check', text: '待核' }));
      else out.push(p);
    });
    return out;
  }
  function gradeEl(g) {
    if (g === '待核') return el('em', { 'class': 'ss-check', text: '待核' });
    if (g === '部分待核') return el('em', { 'class': 'ss-check is-part', text: '部分待核' });
    return null;
  }
  function dynSelect(onChange) {
    var sel = el('select', { 'class': 'lt-sel', 'aria-label': '选择朝代' }, [el('option', { value: '', text: '全部朝代' })].concat(
      ALL.dyn.map(function (d, i) { return el('option', { value: String(i), text: d[1] }); })));
    sel.addEventListener('change', onChange);
    return sel;
  }
  function moreButton(shown, total, step, onClick) {
    if (shown >= total) return null;
    var b = el('button', { 'class': 'zy-btn lt-more', type: 'button', text: '再显示 ' + Math.min(step, total - shown) + ' 条（还有 ' + (total - shown) + ' 条）' });
    b.addEventListener('click', onClick);
    return b;
  }
  function parseYear(s) {
    s = String(s || '').replace(/\s+/g, '');
    var m = /^(前|公元前)?(\d{1,4})(年)?$/.exec(s);
    if (!m) return null;
    return m[1] ? -parseInt(m[2], 10) : parseInt(m[2], 10);
  }

  /* ---------- 标签：年表 ---------- */
  function fillTimeline(box) {
    var rows = [];
    ALL.ev.forEach(function (e) { rows.push({ k: 'e', di: e[0], y: e[1], n: e[2], t: e[3], g: e[4] }); });
    ALL.bt.forEach(function (b) { rows.push({ k: 'b', name: b[0], y: b[1], n: b[2], t: b[3], tags: b[4] }); });
    rows = rows.map(function (r, i) { r.i = i; return r; }).sort(function (a, b) {
      var an = a.n === null || a.n === undefined ? 99999 : a.n, bn = b.n === null || b.n === undefined ? 99999 : b.n;
      return an - bn || (a.k === b.k ? 0 : (a.k === 'e' ? -1 : 1)) || a.i - b.i;
    });
    var STEP = 150, limit = STEP, kind = '', dyn = '', q = '', jump = null;
    var sel = dynSelect(function () { dyn = sel.value; limit = STEP; render(); });
    var box1 = el('input', { 'class': 'ss-search lt-q', type: 'search', placeholder: '搜关键词，如 变法、赤壁、科举', 'aria-label': '搜索年表' });
    var jbox = el('input', { 'class': 'ss-search lt-year', type: 'search', placeholder: '从哪一年看起，如 1127 或 前221', 'aria-label': '跳到某一年' });
    var chips = Z.chips(['全部', '大事记', '战役'], function (i) { kind = ['', 'e', 'b'][i]; limit = STEP; render(); }, { aria: '内容类型' });
    var count = el('p', { 'class': 'zy-note', 'aria-live': 'polite' });
    var list = el('ul', { 'class': 'lt-list' });
    var more = el('div', { 'class': 'lt-morewrap' });
    box1.addEventListener('input', function () { q = box1.value.trim(); limit = STEP; render(); });
    jbox.addEventListener('input', function () { jump = parseYear(jbox.value); limit = STEP; render(); });
    function render() {
      var f = rows.filter(function (r) {
        if (kind && r.k !== kind) return false;
        if (dyn !== '' && (r.k !== 'e' || String(r.di) !== dyn)) return false;
        if (q && (r.y + r.t + (r.name || '')).indexOf(q) < 0) return false;
        return true;
      });
      var start = 0;
      if (jump !== null) {
        start = f.length;
        for (var i = 0; i < f.length; i++) { var n = f[i].n; if (n !== null && n !== undefined && n >= jump) { start = i; break; } }
      }
      var view = f.slice(start, start + limit);
      list.textContent = '';
      view.forEach(function (r) {
        var body, tag;
        if (r.k === 'b') {
          body = el('span', { 'class': 'lt-body' }, [el('b', { text: r.name + '：' })].concat(richText(r.t)));
          tag = el('a', { 'class': 'lt-tag is-battle', href: 'zhanyi.html?id=' + encodeURIComponent(r.name), title: '到战役页看看' + r.name, text: '战役' });
        } else {
          var dd = ALL.dyn[r.di];
          body = el('span', { 'class': 'lt-body' }, richText(r.t).concat([gradeEl(r.g)]));
          tag = el('a', { 'class': 'lt-tag', href: 'lishi-chaodai.html?d=' + dd[0] + '&tab=ev', title: '到' + dd[1] + '页看大事记', text: dd[1] });
        }
        list.appendChild(el('li', { 'class': 'lt-row' + (r.k === 'b' ? ' is-battle' : '') }, [el('span', { 'class': 'lt-y', text: r.y }), body, tag]));
      });
      count.textContent = '共 ' + f.length + ' 条' + (jump !== null ? '，从第 ' + (start + 1) + ' 条（' + (f[start] ? f[start].y : '末尾') + '）起显示' : '') + '；其中大事记 ' + f.filter(function (r) { return r.k === 'e'; }).length + ' 条，战役 ' + f.filter(function (r) { return r.k === 'b'; }).length + ' 场。';
      more.textContent = '';
      var mb = moreButton(view.length, f.length - start, STEP, function () { limit += STEP; render(); });
      if (mb) more.appendChild(mb);
    }
    box.textContent = '';
    [Z.note('把 21 个朝代的大事记和 52 场战役按年份排在一起。公元前写作“前221”。点右边的朝代名，到那个朝代页看大事记；点“战役”，到战役页看这场战役。'),
      el('div', { 'class': 'lt-bar' }, [sel, box1, jbox]), chips.node, count, list, more].forEach(function (n) { box.appendChild(n); });
    chips.pick(0);
    render();
  }

  /* ---------- 标签：帝王 ---------- */
  function fillEmperors(box) {
    var dyn = '', q = '', keyOnly = false;
    var sel = dynSelect(function () { dyn = sel.value; render(); });
    var sbox = el('input', { 'class': 'ss-search lt-q', type: 'search', placeholder: '按称呼、姓名、年号、庙号或谥号搜索，如 贞观、太祖', 'aria-label': '搜索帝王' });
    var chips = Z.chips(['全部', '重点帝王（有专门介绍）'], function (i) { keyOnly = i === 1; render(); }, { aria: '范围' });
    var count = el('p', { 'class': 'zy-note', 'aria-live': 'polite' });
    var tbody = el('tbody', {});
    sbox.addEventListener('input', function () { q = sbox.value.trim(); render(); });
    function render() {
      var n = 0;
      tbody.textContent = '';
      ALL.emp.forEach(function (e) {
        if (dyn !== '' && String(e[0]) !== dyn) return;
        if (keyOnly && !e[7]) return;
        if (q && (e[1] + e[2] + e[3] + e[4] + e[5] + e[6]).indexOf(q) < 0) return;
        n++;
        var dd = ALL.dyn[e[0]];
        var nameCell = e[7]
          ? el('a', { 'class': 'ss-jump', href: 'lishi-chaodai.html?d=' + dd[0] + '&id=' + encodeURIComponent(e[1]), title: '看' + e[1] + '的介绍', text: e[1] })
          : el('a', { 'class': 'ss-jump', href: 'lishi-chaodai.html?d=' + dd[0] + '&tab=emp', title: '到' + dd[1] + '页看帝王名单', text: e[1] });
        tbody.appendChild(el('tr', {}, [
          el('td', { 'class': 'is-nowrap' }, dd[1]),
          el('td', { 'class': 'is-name' }, [nameCell]),
          el('td', {}, e[2]), el('td', { 'class': 'is-nowrap' }, e[3]), el('td', { 'class': 'lt-nh' }, e[4]), el('td', {}, e[5]), el('td', {}, e[6])
        ]));
      });
      count.textContent = '共 ' + n + ' 位。' + (keyOnly ? '' : '带“重点”的帝王，点称呼可以直接看专门介绍；其余的点称呼到朝代页看名单。');
    }
    box.textContent = '';
    [Z.note('435 位帝王的年号、庙号和谥号都能搜。年份用公历，公元前写作“前221”。'),
      el('div', { 'class': 'lt-bar' }, [sel, sbox]), chips.node, count,
      el('div', { 'class': 'ss-tablewrap' }, [el('table', { 'class': 'ss-table lt-table' }, [
        el('thead', {}, [el('tr', {}, ['朝代', '称呼', '姓名', '在位', '年号', '庙号／谥号', '一句话'].map(function (h) { return el('th', { text: h }); }))]),
        tbody])])].forEach(function (n) { box.appendChild(n); });
    chips.pick(0);
    render();
  }

  /* ---------- 标签：人物 ---------- */
  var CATS = [
    ['军事', /将军|将领|名将|大将|统帅|主将|都督|元帅|提督|节度使|太尉|骠骑|车骑|校尉|经略|总兵|军事/],
    ['宰辅', /丞相|宰相|相国|首辅|大学士|军机大臣|尚书令|中书令|平章事|司徒|太傅|太师|太保|仆射|宰辅|权臣/],
    ['学术', /学者|经学|儒|思想|理学|心学|哲学|诸子|名家|纵横|阴阳家|兵家|墨家|法家|道家|学家|校书/],
    ['史学', /史官|史学|史家|太史|修史|史书|《[^》]*》作者|撰/],
    ['宗教', /僧|道士|道教|佛|法师|禅|天师|宗教|真人|国师|帝师|喇嘛/],
    ['科技', /医|历法|天文|数学|算学|工匠|水利|农学|地理|造纸|发明|制图|航海|营造|科技|博物/],
    ['外交', /出使|使节|外交|通西域|和亲|西行|使者/],
    ['后妃宗室', /皇后|太后|后妃|贵妃|公主|宗室|亲王|王子|郡王|太子|皇子|妃/]
  ];
  function fillPeople(box) {
    var STEP = 200, limit = STEP, dyn = '', q = '', cat = null;
    var sel = dynSelect(function () { dyn = sel.value; limit = STEP; render(); });
    var sbox = el('input', { 'class': 'ss-search lt-q', type: 'search', placeholder: '按姓名或身份搜索，如 宰相、史学家、将领', 'aria-label': '搜索人物' });
    var labels = ['全部'].concat(CATS.map(function (c) { return c[0]; }));
    var chips = Z.chips(labels, function (i) { cat = i ? CATS[i - 1][1] : null; limit = STEP; render(); }, { aria: '按身份筛选' });
    var count = el('p', { 'class': 'zy-note', 'aria-live': 'polite' });
    var tbody = el('tbody', {});
    var more = el('div', { 'class': 'lt-morewrap' });
    sbox.addEventListener('input', function () { q = sbox.value.trim(); limit = STEP; render(); });
    function render() {
      var f = ALL.ppl.filter(function (p) {
        if (dyn !== '' && String(p[0]) !== dyn) return false;
        if (cat && !cat.test(p[2])) return false;
        if (q && (p[1] + p[2]).indexOf(q) < 0) return false;
        return true;
      });
      tbody.textContent = '';
      f.slice(0, limit).forEach(function (p) {
        var dd = ALL.dyn[p[0]];
        tbody.appendChild(el('tr', {}, [
          el('td', { 'class': 'is-name' }, [el('a', { 'class': 'ss-jump', href: 'lishi-chaodai.html?d=' + dd[0] + '&id=' + encodeURIComponent(p[1]), title: '看' + p[1] + '的介绍', text: p[1] })]),
          el('td', { 'class': 'is-nowrap' }, dd[1]), el('td', {}, p[2]), el('td', { 'class': 'is-nowrap' }, p[3])
        ]));
      });
      count.textContent = '共 ' + f.length + ' 位。';
      more.textContent = '';
      var mb = moreButton(Math.min(limit, f.length), f.length, STEP, function () { limit += STEP; render(); });
      if (mb) more.appendChild(mb);
    }
    box.textContent = '';
    [Z.note('817 位重要人物，以政治、军事、外交、制度、科技、宗教、史学方面的人物为主。上面的分类是按“身份”文字里的关键词自动归的，只方便检索，不是严格的分类，一个人可以同时出现在几类里。'),
      el('div', { 'class': 'lt-bar' }, [sel, sbox]), chips.node, count,
      el('div', { 'class': 'ss-tablewrap' }, [el('table', { 'class': 'ss-table lt-table' }, [
        el('thead', {}, [el('tr', {}, ['人物', '朝代', '身份', '生卒'].map(function (h) { return el('th', { text: h }); }))]),
        tbody])]), more].forEach(function (n) { box.appendChild(n); });
    chips.pick(0);
    render();
  }

  /* ---------- 页面 ---------- */
  var boxes = {};
  function lazyBox(key, text) {
    var b = el('div', { 'class': 'lt-pane' }, [Z.note(text)]);
    boxes[key] = b;
    return [b];
  }
  var defs = [
    { key: 'dyn', label: '朝代（' + D.dynasties.filter(function (d) { return d.ready; }).length + '）', build: buildDynasties },
    { key: 'time', label: '年表', build: function () { return lazyBox('time', '正在载入年表……'); } },
    { key: 'emp', label: '帝王', build: function () { return lazyBox('emp', '正在载入帝王总表……'); } },
    { key: 'ppl', label: '人物', build: function () { return lazyBox('ppl', '正在载入人物……'); } }
  ];
  var t = Z.tabs(defs);
  Z.mount(root, [
    Z.head(D, '历史'),
    t.node,
    Z.note('说明：年份均用公历，公元前写作“前221”。同一事实各书记载不同时，页面里会把几种说法并列写出，不替读者下结论；还没有对照原典逐字核对的地方，标有红色“待核”。')
  ]);

  function ensureFilled() {
    if (filled) return;
    loadAll(function (err) {
      if (err) {
        Object.keys(boxes).forEach(function (k) { boxes[k].textContent = ''; boxes[k].appendChild(Z.note('数据读取失败，请刷新再试。')); });
        return;
      }
      if (filled) return;
      filled = true;
      fillTimeline(boxes.time);
      fillEmperors(boxes.emp);
      fillPeople(boxes.ppl);
    });
  }
  Array.prototype.forEach.call(root.querySelectorAll('.zy-tab'), function (b, i) {
    if (i > 0) b.addEventListener('click', ensureFilled);
  });
  var first = Z.qs('tab');
  if (first === 'time' || first === 'emp' || first === 'ppl') ensureFilled();
  document.title = '历史 · 知否知否';
})();
