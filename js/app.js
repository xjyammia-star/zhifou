/* 知否知否 · 页面逻辑
   负责：判断“今天是哪个节气、哪一候”，并把资料文件里的内容摆到页面上。
   日期一律按北京时间（东八区）。测试用：在网址后加 ?date=2026-10-08 可以假装今天是那一天。 */
(function () {
  'use strict';

  var DATES = window.ZHIFOU_DATES;
  var JQ = window.ZHIFOU_JIEQI;
  var DAY = 86400000;
  var HOU_LABEL = ['初候', '二候', '三候'];
  var SEASON_NAME = { '春': '春季', '夏': '夏季', '秋': '秋季', '冬': '冬季' };
  var BIG_TERMS = ['春分', '夏至', '秋分', '冬至'];
  var JR = window.ZHIFOU_JIERI || null;

  /* ---------- 小工具 ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') n.className = v;
        else if (k === 'text') n.textContent = v;
        else n.setAttribute(k, v);
      });
    }
    if (kids !== undefined && kids !== null) {
      (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
        if (c === null || c === undefined || c === false) return;
        n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return n;
  }
  function svgEl(tag, attrs) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function termPageUrl(name) { return 'jieqi.html?id=' + encodeURIComponent(name); }
  function orderIndex(name) {
    for (var i = 0; i < JQ.order.length; i++) if (JQ.order[i][0] === name) return i;
    return -1;
  }
  function entryOf(name) { return JQ.entries[name] || null; }

  /* ---------- 日期：今天是哪个节气、哪一候 ---------- */
  function beijingToday() {
    var q = /[?&]date=(\d{4})-(\d{1,2})-(\d{1,2})/.exec(location.search);
    if (q) return Date.UTC(+q[1], +q[2] - 1, +q[3]);
    var t = new Date(Date.now() + 8 * 3600 * 1000);
    return Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
  }
  function fmtMD(ms) { var d = new Date(ms); return (d.getUTCMonth() + 1) + '月' + d.getUTCDate() + '日'; }
  function fmtYMD(ms) { return new Date(ms).getUTCFullYear() + '年' + fmtMD(ms); }
  function fmtRange(a, b) {
    var da = new Date(a), db = new Date(b);
    if (da.getUTCMonth() === db.getUTCMonth()) return (da.getUTCMonth() + 1) + '月' + da.getUTCDate() + '—' + db.getUTCDate() + '日';
    return fmtMD(a) + '—' + fmtMD(b);
  }

  /* 全部节气起始日（2026—2040），按时间排好 */
  var STARTS = (function () {
    var list = [];
    DATES.years.forEach(function (y, yi) {
      JQ.order.forEach(function (t) {
        var md = DATES.terms[t[0]][yi];
        list.push({ name: t[0], start: Date.UTC(y, md[0] - 1, md[1]) });
      });
    });
    list.sort(function (a, b) { return a.start - b.start; });
    return list;
  })();

  /* 约定：节气当天为初候第一天，之后每隔 5 天进入下一候 */
  function locate(today) {
    var i = -1;
    for (var k = 0; k < STARTS.length; k++) {
      if (STARTS[k].start <= today) i = k; else break;
    }
    if (i < 0) return null;
    var cur = STARTS[i], nxt = STARTS[i + 1] || null;
    if (!nxt && today - cur.start > 20 * DAY) return null;
    var endExcl = nxt ? nxt.start : cur.start + 15 * DAY;
    return {
      name: cur.name,
      index: orderIndex(cur.name),
      hou: Math.min(2, Math.floor((today - cur.start) / (5 * DAY))),
      ranges: [
        [cur.start, cur.start + 4 * DAY],
        [cur.start + 5 * DAY, cur.start + 9 * DAY],
        [cur.start + 10 * DAY, endExcl - DAY]
      ]
    };
  }

  /* ---------- 传统节日：日期与临近的节日 ---------- */
  var WEEK = ['日', '一', '二', '三', '四', '五', '六'];
  function fmtMDW(ms) { return fmtMD(ms) + ' 星期' + WEEK[new Date(ms).getUTCDay()]; }
  function fmtYMDW(ms) { return fmtYMD(ms) + ' 星期' + WEEK[new Date(ms).getUTCDay()]; }
  function festUrl(name) { return 'jieri.html?id=' + encodeURIComponent(name); }
  function festDates(name) {
    return ((JR && JR.dates[name]) || []).map(function (s) {
      var p = s.split('-');
      return Date.UTC(+p[0], +p[1] - 1, +p[2]);
    });
  }
  function nextFestDate(name, today) {
    var ds = festDates(name);
    for (var i = 0; i < ds.length; i++) if (ds[i] >= today) return ds[i];
    return null;
  }
  function upcomingFests(today) {
    var list = [];
    if (JR) {
      JR.order.forEach(function (n) {
        var d = nextFestDate(n, today);
        if (d !== null) list.push({ name: n, ms: d });
      });
    }
    list.sort(function (a, b) { return a.ms - b.ms; });
    return list;
  }
  function countText(ms, today) {
    var n = Math.round((ms - today) / DAY);
    return n === 0 ? '今天' : n === 1 ? '明天' : n === 2 ? '后天' : '还有 ' + n + ' 天';
  }

  /* ---------- 日晷环（二十四节气一圈，今天的节气转到右侧） ---------- */
  function buildDial(cur, live) {
    var svg = svgEl('svg', { viewBox: '0 0 720 720', role: 'img', 'aria-label': '二十四节气环，当前节气在右侧' });
    var C = 360, R_LABEL = 296, R_IN = 262, R_OUT = 346;
    [[346, 1.2, 0.5], [330, 1, 0.28], [262, 1, 0.4]].forEach(function (r) {
      svg.appendChild(svgEl('circle', { cx: C, cy: C, r: r[0], 'stroke-width': r[1], opacity: r[2], 'class': 'dial-ring' }));
    });
    svg.appendChild(svgEl('circle', { cx: C, cy: C, r: 252, 'class': 'dial-disk' }));
    for (var j = 0; j < 24; j++) {
      var a = (j * 15 + 7.5) * Math.PI / 180;
      svg.appendChild(svgEl('line', {
        x1: (C + R_IN * Math.cos(a)).toFixed(1), y1: (C + R_IN * Math.sin(a)).toFixed(1),
        x2: (C + R_OUT * Math.cos(a)).toFixed(1), y2: (C + R_OUT * Math.sin(a)).toFixed(1),
        'class': 'dial-sep'
      }));
    }
    JQ.order.forEach(function (t, k) {
      var name = t[0];
      var ang = (k - cur) * 15 * Math.PI / 180;
      var x = (C + R_LABEL * Math.cos(ang)).toFixed(1), y = (C + R_LABEL * Math.sin(ang)).toFixed(1);
      var open = !!entryOf(name);
      var isNow = live && k === cur;
      var g = svgEl('g', {});
      if (isNow) g.appendChild(svgEl('circle', { cx: x, cy: y, r: 26, 'class': 'dial-now' }));
      var text = svgEl('text', {
        x: x, y: y,
        'class': isNow ? 'dial-now-text' : 'dial-label' + (BIG_TERMS.indexOf(name) >= 0 ? ' is-big' : '') + (open ? ' is-open' : '')
      });
      text.textContent = name;
      g.appendChild(text);
      if (open) {
        var link = svgEl('a', { href: termPageUrl(name), 'aria-label': name + '，打开这一页' });
        link.appendChild(g);
        svg.appendChild(link);
      } else {
        g.appendChild(svgEl('title', {})).textContent = name + '：内容筹备中';
        svg.appendChild(g);
      }
    });
    if (live) svg.appendChild(svgEl('polygon', { points: '708,351 708,369 690,360', 'class': 'dial-pointer' }));
    return svg;
  }

  /* ---------- 首页：今日一页 ---------- */
  function renderHome(root) {
    var today = beijingToday();
    var loc = locate(today);
    var name = loc ? loc.name : null;
    var entry = name ? entryOf(name) : null;
    var season = name ? JQ.order[loc.index][1] : '';

    var subText = loc ? fmtMD(today) + ' · ' + HOU_LABEL[loc.hou] : '';
    var dial = el('div', { 'class': 'dial' }, [
      buildDial(loc ? loc.index : 0, !!loc),
      el('div', { 'class': 'dial-center' }, [
        el('div', { 'class': 'term-big', text: name || '—' }),
        el('div', { 'class': 'term-sub', text: subText }),
        el('div', { 'class': 'seal dial-seal', 'aria-hidden': 'true', text: season })
      ])
    ]);

    var left = el('div', { 'class': 'home-dial' }, [dial]);
    var houRow = null;
    if (entry) {
      houRow = el('div', { 'class': 'hou-row' }, entry.hou.map(function (h, i) {
        var isNow = i === loc.hou;
        return el('div', { 'class': 'hou-card' + (isNow ? ' is-now' : '') }, [
          el('div', { 'class': 'hou-label' }, [
            el('span', { 'class': 'l1', text: HOU_LABEL[i] + (isNow ? ' · 今候' : '') }),
            el('span', { 'class': 'l2', text: '约' + fmtRange(loc.ranges[i][0], loc.ranges[i][1]) })
          ]),
          el('div', { 'class': 'hou-name', text: h.name }),
          el('div', { 'class': 'hou-plain', text: h.plain })
        ]);
      }));
    }

    var right = el('div', { 'class': 'home-right' });
    right.appendChild(el('div', { 'class': 'today-top' }, [
      el('span', { 'class': 'eyebrow', text: '今日一页 · ' + fmtYMD(today) }),
      season ? el('div', { 'class': 'seal', 'aria-hidden': 'true', text: season }) : null
    ]));
    if (entry) {
      right.appendChild(el('h1', { 'class': 'hook', text: entry.hook }));
      right.appendChild(el('p', { 'class': 'answer', text: entry.answer }));
      right.appendChild(el('div', { 'class': 'ornament', 'aria-hidden': 'true' }));
      if (entry.body[0]) right.appendChild(el('p', { 'class': 'lede', text: entry.body[0] }));
      right.appendChild(el('div', { 'class': 'today-actions' }, [
        el('a', { 'class': 'btn', href: termPageUrl(name), text: '读完整这一页 →' })
      ]));
    } else {
      right.appendChild(el('h1', { 'class': 'hook', text: loc ? name + '：这一页还在筹备中' : '今天的页面还没有准备好' }));
      right.appendChild(el('p', { 'class': 'answer', text: '网站按资料逐份制作，做好一份，才会在首页出现一份。' }));
      right.appendChild(el('div', { 'class': 'today-actions' }, [
        el('a', { 'class': 'btn', href: 'jieqi.html', text: '看看已经做好的节气 →' })
      ]));
    }

    var ups = upcomingFests(today);
    var upcoming = null;
    if (ups.length) {
      var u = ups[0];
      upcoming = el('a', { 'class': 'upcoming', href: festUrl(u.name), 'aria-label': '临近的节日：' + u.name }, [
        el('span', { 'class': 'eyebrow', text: '临近的节日' }),
        el('span', { 'class': 'upcoming-name', text: u.name }),
        el('span', { 'class': 'upcoming-when', text: fmtMDW(u.ms) }),
        el('span', { 'class': 'tag', text: countText(u.ms, today) })
      ]);
    }
    root.appendChild(el('div', { 'class': 'home' }, [left, right, houRow, upcoming]));
    document.title = (name ? name + ' · ' : '') + '知否知否 · 每天读一页中国传统文化';
  }

  /* ---------- 节气页（模板） ---------- */
  function renderTerm(root, name) {
    var idx = orderIndex(name);
    var entry = idx >= 0 ? entryOf(name) : null;
    if (!entry) {
      root.appendChild(el('div', { 'class': 'list-page' }, [
        el('h1', { 'class': 'page-title', text: name && idx >= 0 ? name + '：这一页还在筹备中' : '没有找到这一页' }),
        el('p', { 'class': 'page-intro', text: '网站按资料逐份制作，做好一份，才会出现一份。' }),
        el('a', { 'class': 'btn', href: 'jieqi.html', text: '← 回到节气目录' })
      ]));
      document.title = '节气 · 知否知否';
      return;
    }

    var prevName = JQ.order[(idx + 23) % 24][0];
    var nextName = JQ.order[(idx + 1) % 24][0];
    function navItem(label, target, isPrev) {
      var text = isPrev ? '← ' + target : target + ' →';
      return entryOf(target)
        ? el('a', { href: termPageUrl(target), text: text })
        : el('span', { 'class': 'is-closed', title: '内容筹备中', text: text + '（筹备中）' });
    }

    var main = el('div', { 'class': 'term-main' });
    main.appendChild(el('div', { 'class': 'crumb' }, [
      el('span', { 'class': 'crumb-text' }, [
        el('a', { href: 'jieqi.html', text: '节气' }),
        ' · ' + SEASON_NAME[entry.season] + '第' + entry.seasonNo + '个 · 全年第' + entry.yearNo + '个 · 大致' + entry.approxDate
      ]),
      el('div', { 'class': 'seal', 'aria-hidden': 'true', text: entry.season })
    ]));
    main.appendChild(el('h1', { 'class': 'hook', text: entry.hook }));
    main.appendChild(el('p', { 'class': 'answer', text: entry.answer }));
    main.appendChild(el('div', { 'class': 'ornament', 'aria-hidden': 'true' }));
    entry.body.forEach(function (p) { main.appendChild(el('p', { 'class': 'block-text', text: p })); });

    main.appendChild(el('div', { 'class': 'section-title', text: '三候' }));
    main.appendChild(el('div', { 'class': 'hou-full' }, entry.hou.map(function (h, i) {
      return el('div', { 'class': 'hou-card' }, [
        el('div', { 'class': 'hou-label', text: HOU_LABEL[i] }),
        el('div', { 'class': 'hou-name', text: h.name }),
        el('div', { 'class': 'hou-plain', text: h.plain }),
        h.note ? el('div', { 'class': 'hou-note', text: h.note }) : null
      ]);
    })));

    if (entry.customs) {
      main.appendChild(el('div', { 'class': 'section-title', text: '习俗' }));
      main.appendChild(el('p', { 'class': 'block-text', text: entry.customs }));
    }
    if (entry.tip) {
      main.appendChild(el('div', { 'class': 'tip-box' }, [
        el('div', { 'class': 'tip-label', text: '小提示' }),
        el('p', { text: entry.tip })
      ]));
    }
    main.appendChild(el('div', { 'class': 'term-nav' }, [navItem('上一个', prevName, true), navItem('下一个', nextName, false)]));

    var side = el('aside', { 'class': 'term-side' });
    var notes = el('details', { 'class': 'notes' }, [
      el('summary', { text: '批注' }),
      el('div', { 'class': 'notes-body' }, entry.notes.map(function (n) {
        return el('p', {}, [el('span', { 'class': 'note-label', text: n.label }), n.text]);
      }))
    ]);
    if (window.matchMedia && window.matchMedia('(min-width: 1100px)').matches) notes.setAttribute('open', '');
    side.appendChild(notes);

    root.appendChild(el('div', { 'class': 'term-page' }, [main, side]));
    document.title = name + ' · 知否知否';
  }

  /* ---------- 节气目录 ---------- */
  function renderList(root) {
    var today = beijingToday();
    var loc = locate(today);
    var page = el('div', { 'class': 'list-page' }, [
      el('h1', { 'class': 'page-title', text: '二十四节气' }),
      el('p', { 'class': 'page-intro', text: Object.keys(JQ.entries).length >= JQ.order.length
        ? '点开任意一个节气，读它的一页。今天所在的节气有红点标记。'
        : '亮着的已经做好，灰色的还在筹备中。' })
    ]);
    ['春', '夏', '秋', '冬'].forEach(function (s) {
      var grid = el('div', { 'class': 'term-grid' });
      JQ.order.forEach(function (t, i) {
        if (t[1] !== s) return;
        var open = !!entryOf(t[0]);
        var isNow = loc && loc.index === i;
        var cls = 'term-tile' + (open ? ' is-open' : '') + (isNow ? ' is-now' : '');
        var inner = [
          el('span', { 'class': 'tile-name', text: t[0] }),
          el('span', { 'class': 'tile-meta', text: (open ? '第' + (i + 1) + '个' : '筹备中') + (isNow ? ' · 今天' : '') })
        ];
        grid.appendChild(open ? el('a', { 'class': cls, href: termPageUrl(t[0]) }, inner) : el('div', { 'class': cls }, inner));
      });
      page.appendChild(el('section', { 'class': 'season-block' }, [
        el('div', { 'class': 'section-title', text: SEASON_NAME[s] }),
        grid
      ]));
    });
    root.appendChild(page);
    document.title = '节气目录 · 知否知否';
  }

  /* ---------- 节日页（模板） ---------- */
  function renderFestival(root, name) {
    var entry = JR && JR.entries[name];
    if (!entry) {
      root.appendChild(el('div', { 'class': 'list-page' }, [
        el('h1', { 'class': 'page-title', text: '没有找到这一页' }),
        el('a', { 'class': 'btn', href: 'jieri.html', text: '← 回到节日目录' })
      ]));
      document.title = '节日 · 知否知否';
      return;
    }
    var today = beijingToday();
    var order = JR.order, idx = order.indexOf(name);
    var prevName = order[(idx + order.length - 1) % order.length];
    var nextName = order[(idx + 1) % order.length];
    var later = festDates(name).filter(function (d) { return d >= today; });

    var main = el('div', { 'class': 'term-main' });
    main.appendChild(el('div', { 'class': 'crumb' }, [
      el('span', { 'class': 'crumb-text' }, [
        el('a', { href: 'jieri.html', text: '节日' }),
        ' · 第' + entry.no + '个 · 共' + order.length + '个'
      ]),
      el('div', { 'class': 'seal', 'aria-hidden': 'true', text: '节' })
    ]));
    var whenKids = [];
    if (later.length) {
      whenKids.push(el('div', { 'class': 'fest-when-main' }, [
        el('span', { 'class': 'eyebrow', text: '下一次' }),
        el('span', { 'class': 'fest-date', text: fmtYMDW(later[0]) }),
        el('span', { 'class': 'tag', text: countText(later[0], today) })
      ]));
    }
    whenKids.push(el('div', { 'class': 'fest-when-sub', text: entry.lunar + ' · ' + entry.theme }));
    if (later.length > 1) {
      whenKids.push(el('div', { 'class': 'fest-when-sub', text: '再往后：' + later.slice(1, 4).map(fmtYMD).join('、') }));
    }
    main.appendChild(el('div', { 'class': 'fest-when' }, whenKids));

    main.appendChild(el('h1', { 'class': 'hook', text: entry.hook }));
    main.appendChild(el('p', { 'class': 'answer', text: entry.answer }));
    main.appendChild(el('div', { 'class': 'ornament', 'aria-hidden': 'true' }));
    entry.body.forEach(function (p) { main.appendChild(el('p', { 'class': 'block-text', text: p })); });
    if (entry.story && entry.story.length) {
      main.appendChild(el('div', { 'class': 'section-title', text: '典故' }));
      entry.story.forEach(function (p) { main.appendChild(el('p', { 'class': 'block-text', text: p })); });
    }
    if (entry.customs) {
      main.appendChild(el('div', { 'class': 'section-title', text: '习俗' }));
      main.appendChild(el('p', { 'class': 'block-text', text: entry.customs }));
    }
    if (entry.tip) {
      main.appendChild(el('div', { 'class': 'tip-box' }, [
        el('div', { 'class': 'tip-label', text: '小提示' }),
        el('p', { text: entry.tip })
      ]));
    }
    if (entry.relatedTerm && entryOf(entry.relatedTerm)) {
      main.appendChild(el('p', { 'class': 'block-text' }, [
        '相关节气：',
        el('a', { href: termPageUrl(entry.relatedTerm), text: entry.relatedTerm + ' →' })
      ]));
    }
    main.appendChild(el('div', { 'class': 'term-nav' }, [
      el('a', { href: festUrl(prevName), text: '← ' + prevName }),
      el('a', { href: festUrl(nextName), text: nextName + ' →' })
    ]));

    var side = el('aside', { 'class': 'term-side' });
    var notes = el('details', { 'class': 'notes' }, [
      el('summary', { text: '批注' }),
      el('div', { 'class': 'notes-body' }, entry.notes.map(function (n) {
        return el('p', {}, [el('span', { 'class': 'note-label', text: n.label }), n.text]);
      }))
    ]);
    if (window.matchMedia && window.matchMedia('(min-width: 1100px)').matches) notes.setAttribute('open', '');
    side.appendChild(notes);

    root.appendChild(el('div', { 'class': 'term-page' }, [main, side]));
    document.title = name + ' · 知否知否';
  }

  /* ---------- 节日目录（按下一次到来的先后排列） ---------- */
  function renderFestivalList(root) {
    var today = beijingToday();
    var ups = upcomingFests(today);
    var page = el('div', { 'class': 'list-page' }, [
      el('h1', { 'class': 'page-title', text: '传统节日' }),
      el('p', { 'class': 'page-intro', text: '按下一次到来的先后排列，红点是最近的一个。' })
    ]);
    var grid = el('div', { 'class': 'term-grid fest-grid' });
    ups.forEach(function (u, i) {
      grid.appendChild(el('a', { 'class': 'term-tile is-open' + (i === 0 ? ' is-now' : ''), href: festUrl(u.name) }, [
        el('span', { 'class': 'tile-name', text: u.name }),
        el('span', { 'class': 'tile-meta', text: fmtMD(u.ms) + ' · ' + countText(u.ms, today) })
      ]));
    });
    page.appendChild(grid);
    root.appendChild(page);
    document.title = '节日目录 · 知否知否';
  }

  /* ---------- 入口 ---------- */
  function start() {
    var root = document.getElementById('app');
    if (!root) return;
    root.textContent = '';
    var page = document.body.getAttribute('data-page');
    if (page === 'home') {
      renderHome(root);
    } else if (page === 'jieqi') {
      var m = /[?&]id=([^&]+)/.exec(location.search);
      if (m) renderTerm(root, decodeURIComponent(m[1])); else renderList(root);
    } else if (page === 'jieri') {
      var m2 = /[?&]id=([^&]+)/.exec(location.search);
      if (m2) renderFestival(root, decodeURIComponent(m2[1])); else renderFestivalList(root);
    }
  }
  start();
})();
