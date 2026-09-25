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
  var SC = window.ZHIFOU_SHICHEN || null;
  var GZ = window.ZHIFOU_GANZHI || null;
  var SX = window.ZHIFOU_SHENGXIAO || null;
  var SXK = window.ZHIFOU_SHENGXIAO_KEPU || null;
  var YF = window.ZHIFOU_YUEFEN || null;
  var SF = window.ZHIFOU_SHUJIUSANFU || null;
  var homeTimerSet = false;

  /* 配图：目前只有“秋分”“中秋节”两张水墨意境插画样稿，其余词条（含全部十二时辰）
     会陆续补上。没有配图的词条不受影响，页面照常显示，只是没有图片区块。 */
  var IMAGE_MAP = {
    term: { folder: '节气', items: { '秋分': { file: '秋分.jpg', caption: '雷始收声，蛰虫坯户', source: '《月令七十二候集解》' } } },
    festival: { folder: '节日', items: { '中秋节': { file: '中秋节.jpg', caption: '但愿人长久，千里共婵娟', source: '苏轼《水调歌头》' } } },
    shichen: { folder: '时辰', items: {} },
    shengxiao: { folder: '生肖', items: {} }
  };
  function imageBlock(kind, name) {
    var group = IMAGE_MAP[kind];
    var info = group && group.items[name];
    if (!info) return null;
    return el('div', { 'class': 'term-image' }, [
      el('img', { src: 'img/' + group.folder + '/' + encodeURIComponent(info.file), alt: name + ' · 水墨意境插画', loading: 'lazy' }),
      el('p', { 'class': 'term-image-caption' }, [
        info.caption,
        info.source ? el('span', { 'class': 'term-image-source', text: info.source }) : null
      ])
    ]);
  }

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
  function shichenPageUrl(name) { return 'shichen.html?id=' + encodeURIComponent(name); }
  function shichenIndex(name) { return SC ? SC.order.indexOf(name) : -1; }
  function shichenEntryOf(name) { return (SC && SC.entries[name]) || null; }
  function shengxiaoPageUrl(name) { return 'shengxiao.html?id=' + encodeURIComponent(name); }
  function shengxiaoIndex(name) { return SX ? SX.order.indexOf(name) : -1; }
  function shengxiaoEntryOf(name) { return (SX && SX.entries[name]) || null; }

  /* ---------- 十二时辰、干支：跟“此刻”的钟点、日期直接相关，不走 ?date= 模拟 ---------- */
  function realBeijingNow() {
    var t = new Date(Date.now() + 8 * 3600 * 1000);
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), h: t.getUTCHours(), min: t.getUTCMinutes() };
  }
  function currentShichenIndex(now) {
    /* 23:00—01:00 是子时（第0个），此后每两小时一个时辰，循环一圈 */
    return Math.floor(((now.h + 1) % 24) / 2);
  }
  var GZ_STEMS = '甲乙丙丁戊己庚辛壬癸';
  var GZ_BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
  function toJDN(y, m, d) {
    var a = Math.floor((14 - m) / 12);
    var y2 = y + 4800 - a;
    var m2 = m + 12 * a - 3;
    return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
  }
  function ganzhiOfDate(y, m, d) {
    /* 算法见《干支文案》批注：干支序数 = 儒略日数加49，除以60取余；已用两个公开可查的历史日期核对过。
       这里按“今天的公历日期”算，没有套用“一天的干支从子时开始换算”那种更严格的老算法，
       避免过了晚上11点“今日干支”突然跳到明天，反而让人看不懂。 */
    var idx = ((toJDN(y, m, d) + 49) % 60 + 60) % 60;
    return { stem: GZ_STEMS[idx % 10], branch: GZ_BRANCHES[idx % 12], name: GZ_STEMS[idx % 10] + GZ_BRANCHES[idx % 12] };
  }
  function currentShengxiaoName(today) {
    /* 生肖年按民俗口径（农历正月初一/春节）换算，笔记里也提到部分命理排盘按立春换算，
       这里选民俗口径，日常“今年属什么”最容易对上。
       做法：找到不晚于 today 的最近一个春节，那年的公历年份决定生肖——
       公式 (年份-4) mod 12 得到地支序号，正好和 SX.order 的排列顺序（子鼠…亥猪）一致，
       已用 2026=午马、2020=子鼠 两个已知年份核对过。 */
    if (!SX || !JR) return null;
    var ds = festDates('春节');
    var chosen = null;
    for (var i = 0; i < ds.length; i++) {
      if (ds[i] <= today) chosen = ds[i]; else break;
    }
    if (chosen === null) return null;
    var Y = new Date(chosen).getUTCFullYear();
    var branchIdx = ((Y - 4) % 12 + 12) % 12;
    return SX.order[branchIdx] || null;
  }

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
        el('a', { 'class': 'btn', href: termPageUrl(name), text: '展卷细读 →' })
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
    var nowStrip = null;
    if (SC) {
      var now = realBeijingNow();
      var sIdx = currentShichenIndex(now);
      var sName = SC.order[sIdx];
      var sEntry = shichenEntryOf(sName);
      var stripKids = [
        el('a', { 'class': 'now-card', href: shichenPageUrl(sName), 'aria-label': '现在时辰：' + sName }, [
          el('span', { 'class': 'eyebrow', text: '此刻' }),
          el('span', { 'class': 'now-name', text: sName }),
          el('span', { 'class': 'now-when', text: sEntry ? sEntry.time : '' })
        ])
      ];
      if (GZ) {
        var gz = ganzhiOfDate(now.y, now.m, now.d);
        stripKids.push(el('a', { 'class': 'now-card', href: 'ganzhi.html', 'aria-label': '今日干支：' + gz.name + '日' }, [
          el('span', { 'class': 'eyebrow', text: '今日干支' }),
          el('span', { 'class': 'now-name', text: gz.name + '日' })
        ]));
      }
      nowStrip = el('div', { 'class': 'now-strip' }, stripKids);
    }

    root.appendChild(el('div', { 'class': 'home' }, [left, right, houRow, upcoming, nowStrip]));
    document.title = (name ? name + ' · ' : '') + '知否知否 · 每天读一页中国传统文化';

    /* 时辰每两小时才会变，但为了让“此刻”看起来是活的，每分钟悄悄重新画一次首页 */
    if (SC && !homeTimerSet && typeof setInterval === 'function') {
      homeTimerSet = true;
      setInterval(function () {
        if (document.body.getAttribute('data-page') === 'home') start();
      }, 60000);
    }
  }

  /* ---------- 节气页（模板） ---------- */
  function renderTerm(root, name) {
    var idx = orderIndex(name);
    var entry = idx >= 0 ? entryOf(name) : null;
    if (!entry) {
      root.appendChild(el('div', { 'class': 'list-page' }, [
        el('h1', { 'class': 'page-title', text: name && idx >= 0 ? name + '：这一页还在筹备中' : '没有找到这一页' }),
        el('p', { 'class': 'page-intro', text: '网站按资料逐份制作，做好一份，才会出现一份。' }),
        el('a', { 'class': 'btn', href: 'jieqi.html', text: '← 回到廿四节气' })
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
    var img = imageBlock('term', name);
    if (img) side.appendChild(img);
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
    document.title = '廿四节气 · 知否知否';
  }

  /* ---------- 节日页（模板） ---------- */
  function renderFestival(root, name) {
    var entry = JR && JR.entries[name];
    if (!entry) {
      root.appendChild(el('div', { 'class': 'list-page' }, [
        el('h1', { 'class': 'page-title', text: '没有找到这一页' }),
        el('a', { 'class': 'btn', href: 'jieri.html', text: '← 回到传统节日' })
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
    var img = imageBlock('festival', name);
    if (img) side.appendChild(img);
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
    document.title = '传统节日 · 知否知否';
  }

  /* ---------- 十二时辰目录 ---------- */
  function renderShichenList(root) {
    var now = realBeijingNow();
    var curIdx = SC ? currentShichenIndex(now) : -1;
    var page = el('div', { 'class': 'list-page' }, [
      el('h1', { 'class': 'page-title', text: '十二时辰' }),
      el('p', { 'class': 'page-intro' }, [
        '时辰不按日期轮换，每天都按现代时钟循环一遍；红点是此刻所在的时辰。想先看看天干地支是怎么回事，',
        el('a', { href: 'ganzhi.html', text: '读这一篇 →' })
      ])
    ]);
    var grid = el('div', { 'class': 'term-grid' });
    if (SC) {
      SC.order.forEach(function (name, i) {
        var entry = SC.entries[name];
        var isNow = i === curIdx;
        var cls = 'term-tile is-open' + (isNow ? ' is-now' : '');
        grid.appendChild(el('a', { 'class': cls, href: shichenPageUrl(name) }, [
          el('span', { 'class': 'tile-name', text: name }),
          el('span', { 'class': 'tile-meta', text: entry.time + (isNow ? ' · 此刻' : '') })
        ]));
      });
    }
    page.appendChild(grid);
    root.appendChild(page);
    document.title = '十二时辰 · 知否知否';
  }

  /* ---------- 时辰页（模板） ---------- */
  function renderShichen(root, name) {
    var entry = shichenEntryOf(name);
    if (!SC || !entry) {
      root.appendChild(el('div', { 'class': 'list-page' }, [
        el('h1', { 'class': 'page-title', text: '没有找到这一页' }),
        el('a', { 'class': 'btn', href: 'shichen.html', text: '← 回到十二时辰' })
      ]));
      document.title = '十二时辰 · 知否知否';
      return;
    }
    var idx = shichenIndex(name);
    var n = SC.order.length;
    var prevName = SC.order[(idx + n - 1) % n];
    var nextName = SC.order[(idx + 1) % n];
    var now = realBeijingNow();
    var isNow = currentShichenIndex(now) === idx;

    var main = el('div', { 'class': 'term-main' });
    main.appendChild(el('div', { 'class': 'crumb' }, [
      el('span', { 'class': 'crumb-text' }, [
        el('a', { href: 'shichen.html', text: '十二时辰' }),
        ' · 第' + entry.no + '个（共' + n + '个） · ' + entry.time + (isNow ? ' · 正是此刻' : '')
      ]),
      el('div', { 'class': 'seal', 'aria-hidden': 'true', text: '时' })
    ]));
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
    if (GZ) {
      main.appendChild(el('p', { 'class': 'block-text' }, [
        '延伸阅读：',
        el('a', { href: 'ganzhi.html', text: '干支与六十甲子 →' })
      ]));
    }
    main.appendChild(el('div', { 'class': 'term-nav' }, [
      el('a', { href: shichenPageUrl(prevName), text: '← ' + prevName }),
      el('a', { href: shichenPageUrl(nextName), text: nextName + ' →' })
    ]));

    var side = el('aside', { 'class': 'term-side' });
    var img = imageBlock('shichen', name);
    if (img) side.appendChild(img);
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

  /* ---------- 干支科普页（单篇长文，不是按时间轮换的词条） ---------- */
  function renderGanzhi(root) {
    if (!GZ) {
      root.appendChild(el('div', { 'class': 'list-page' }, [
        el('h1', { 'class': 'page-title', text: '这一页还在筹备中' }),
        el('a', { 'class': 'btn', href: 'shichen.html', text: '← 回到十二时辰' })
      ]));
      document.title = '干支 · 知否知否';
      return;
    }
    var now = realBeijingNow();
    var gz = ganzhiOfDate(now.y, now.m, now.d);

    var main = el('div', { 'class': 'term-main' });
    main.appendChild(el('div', { 'class': 'crumb' }, [
      el('span', { 'class': 'crumb-text' }, [
        el('a', { href: 'shichen.html', text: '十二时辰' }),
        ' · 干支科普 · 今日 ' + gz.name + '日'
      ]),
      el('div', { 'class': 'seal', 'aria-hidden': 'true', text: '干' })
    ]));
    main.appendChild(el('h1', { 'class': 'hook', text: GZ.hook }));
    main.appendChild(el('p', { 'class': 'answer', text: GZ.answer }));
    main.appendChild(el('div', { 'class': 'ornament', 'aria-hidden': 'true' }));
    GZ.sections.forEach(function (sec) {
      main.appendChild(el('div', { 'class': 'section-title', text: sec.title }));
      sec.body.forEach(function (p) { main.appendChild(el('p', { 'class': 'block-text', text: p })); });
    });
    if (GZ.tip) {
      main.appendChild(el('div', { 'class': 'tip-box' }, [
        el('div', { 'class': 'tip-label', text: '小提示' }),
        el('p', { text: GZ.tip })
      ]));
    }
    main.appendChild(el('a', { 'class': 'btn', href: 'shichen.html', text: '← 回到十二时辰' }));

    var side = el('aside', { 'class': 'term-side' });
    var notes = el('details', { 'class': 'notes' }, [
      el('summary', { text: '批注' }),
      el('div', { 'class': 'notes-body' }, GZ.notes.map(function (n) {
        return el('p', {}, [el('span', { 'class': 'note-label', text: n.label }), n.text]);
      }))
    ]);
    if (window.matchMedia && window.matchMedia('(min-width: 1100px)').matches) notes.setAttribute('open', '');
    side.appendChild(notes);

    root.appendChild(el('div', { 'class': 'term-page' }, [main, side]));
    document.title = '干支与六十甲子 · 知否知否';
  }

  /* ---------- 十二生肖目录 ---------- */
  function renderShengxiaoList(root) {
    var today = beijingToday();
    var curName = currentShengxiaoName(today);
    var page = el('div', { 'class': 'list-page' }, [
      el('h1', { 'class': 'page-title', text: '十二生肖' }),
      el('p', { 'class': 'page-intro' }, [
        '生肖和十二时辰共用一套地支，只是不按钟点轮换，而是按出生年份对应；红点是今年（按农历春节换算）的生肖。想看赛跑传说、生肖年怎么算这些完整的科普内容，',
        el('a', { href: 'shengxiao-kepu.html', text: '读这一篇 →' })
      ])
    ]);
    var grid = el('div', { 'class': 'term-grid' });
    if (SX) {
      SX.order.forEach(function (name) {
        var entry = SX.entries[name];
        var isNow = name === curName;
        var cls = 'term-tile is-open' + (isNow ? ' is-now' : '');
        grid.appendChild(el('a', { 'class': cls, href: shengxiaoPageUrl(name) }, [
          el('span', { 'class': 'tile-name', text: name }),
          el('span', { 'class': 'tile-meta', text: entry.time + (isNow ? ' · 今年' : '') })
        ]));
      });
    }
    page.appendChild(grid);
    root.appendChild(page);
    document.title = '十二生肖 · 知否知否';
  }

  /* ---------- 生肖页（模板） ---------- */
  function renderShengxiao(root, name) {
    var entry = shengxiaoEntryOf(name);
    if (!SX || !entry) {
      root.appendChild(el('div', { 'class': 'list-page' }, [
        el('h1', { 'class': 'page-title', text: '没有找到这一页' }),
        el('a', { 'class': 'btn', href: 'shengxiao.html', text: '← 回到十二生肖' })
      ]));
      document.title = '十二生肖 · 知否知否';
      return;
    }
    var idx = shengxiaoIndex(name);
    var n = SX.order.length;
    var prevName = SX.order[(idx + n - 1) % n];
    var nextName = SX.order[(idx + 1) % n];
    var today = beijingToday();
    var isNow = currentShengxiaoName(today) === name;

    var main = el('div', { 'class': 'term-main' });
    main.appendChild(el('div', { 'class': 'crumb' }, [
      el('span', { 'class': 'crumb-text' }, [
        el('a', { href: 'shengxiao.html', text: '十二生肖' }),
        ' · 第' + entry.no + '个（共' + n + '个） · ' + entry.time + (isNow ? ' · 今年生肖' : '')
      ]),
      el('div', { 'class': 'seal', 'aria-hidden': 'true', text: '肖' })
    ]));
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
    if (SXK) {
      main.appendChild(el('p', { 'class': 'block-text' }, [
        '延伸阅读：',
        el('a', { href: 'shengxiao-kepu.html', text: '生肖科普 →' })
      ]));
    }
    main.appendChild(el('div', { 'class': 'term-nav' }, [
      el('a', { href: shengxiaoPageUrl(prevName), text: '← ' + prevName }),
      el('a', { href: shengxiaoPageUrl(nextName), text: nextName + ' →' })
    ]));

    var side = el('aside', { 'class': 'term-side' });
    var img = imageBlock('shengxiao', name);
    if (img) side.appendChild(img);
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

  /* ---------- 生肖科普页（单篇长文，不是按时间轮换的词条） ---------- */
  function renderShengxiaoKepu(root) {
    if (!SXK) {
      root.appendChild(el('div', { 'class': 'list-page' }, [
        el('h1', { 'class': 'page-title', text: '这一页还在筹备中' }),
        el('a', { 'class': 'btn', href: 'shengxiao.html', text: '← 回到十二生肖' })
      ]));
      document.title = '生肖科普 · 知否知否';
      return;
    }
    var today = beijingToday();
    var curName = currentShengxiaoName(today);

    var main = el('div', { 'class': 'term-main' });
    main.appendChild(el('div', { 'class': 'crumb' }, [
      el('span', { 'class': 'crumb-text' }, [
        el('a', { href: 'shengxiao.html', text: '十二生肖' }),
        ' · 生肖科普' + (curName ? ' · 今年生肖 ' + curName : '')
      ]),
      el('div', { 'class': 'seal', 'aria-hidden': 'true', text: '肖' })
    ]));
    main.appendChild(el('h1', { 'class': 'hook', text: SXK.hook }));
    main.appendChild(el('p', { 'class': 'answer', text: SXK.answer }));
    main.appendChild(el('div', { 'class': 'ornament', 'aria-hidden': 'true' }));
    SXK.sections.forEach(function (sec) {
      main.appendChild(el('div', { 'class': 'section-title', text: sec.title }));
      sec.body.forEach(function (p) { main.appendChild(el('p', { 'class': 'block-text', text: p })); });
    });
    if (SXK.tip) {
      main.appendChild(el('div', { 'class': 'tip-box' }, [
        el('div', { 'class': 'tip-label', text: '小提示' }),
        el('p', { text: SXK.tip })
      ]));
    }
    main.appendChild(el('a', { 'class': 'btn', href: 'shengxiao.html', text: '← 回到十二生肖' }));

    var side = el('aside', { 'class': 'term-side' });
    var notes = el('details', { 'class': 'notes' }, [
      el('summary', { text: '批注' }),
      el('div', { 'class': 'notes-body' }, SXK.notes.map(function (n) {
        return el('p', {}, [el('span', { 'class': 'note-label', text: n.label }), n.text]);
      }))
    ]);
    if (window.matchMedia && window.matchMedia('(min-width: 1100px)').matches) notes.setAttribute('open', '');
    side.appendChild(notes);

    root.appendChild(el('div', { 'class': 'term-page' }, [main, side]));
    document.title = '生肖科普 · 知否知否';
  }

  /* ---------- 月份与农历科普页（单篇长文，不是按时间轮换的词条） ---------- */
  function renderYuefen(root) {
    if (!YF) {
      root.appendChild(el('div', { 'class': 'list-page' }, [
        el('h1', { 'class': 'page-title', text: '这一页还在筹备中' }),
        el('a', { 'class': 'btn', href: 'index.html', text: '← 回到首页' })
      ]));
      document.title = '月份与农历 · 知否知否';
      return;
    }
    var main = el('div', { 'class': 'term-main' });
    main.appendChild(el('div', { 'class': 'crumb' }, [
      el('span', { 'class': 'crumb-text', text: '月份与农历' }),
      el('div', { 'class': 'seal', 'aria-hidden': 'true', text: '月' })
    ]));
    main.appendChild(el('h1', { 'class': 'hook', text: YF.hook }));
    main.appendChild(el('p', { 'class': 'answer', text: YF.answer }));
    main.appendChild(el('div', { 'class': 'ornament', 'aria-hidden': 'true' }));
    YF.sections.forEach(function (sec) {
      main.appendChild(el('div', { 'class': 'section-title', text: sec.title }));
      sec.body.forEach(function (p) { main.appendChild(el('p', { 'class': 'block-text', text: p })); });
    });
    if (YF.tip) {
      main.appendChild(el('div', { 'class': 'tip-box' }, [
        el('div', { 'class': 'tip-label', text: '小提示' }),
        el('p', { text: YF.tip })
      ]));
    }

    var side = el('aside', { 'class': 'term-side' });
    var notes = el('details', { 'class': 'notes' }, [
      el('summary', { text: '批注' }),
      el('div', { 'class': 'notes-body' }, YF.notes.map(function (n) {
        return el('p', {}, [el('span', { 'class': 'note-label', text: n.label }), n.text]);
      }))
    ]);
    if (window.matchMedia && window.matchMedia('(min-width: 1100px)').matches) notes.setAttribute('open', '');
    side.appendChild(notes);

    root.appendChild(el('div', { 'class': 'term-page' }, [main, side]));
    document.title = '月份与农历 · 知否知否';
  }

  /* ---------- 数九三伏科普页（单篇长文，不是按时间轮换的词条） ---------- */
  function renderShujiusanfu(root) {
    if (!SF) {
      root.appendChild(el('div', { 'class': 'list-page' }, [
        el('h1', { 'class': 'page-title', text: '这一页还在筹备中' }),
        el('a', { 'class': 'btn', href: 'index.html', text: '← 回到首页' })
      ]));
      document.title = '数九三伏 · 知否知否';
      return;
    }
    var main = el('div', { 'class': 'term-main' });
    main.appendChild(el('div', { 'class': 'crumb' }, [
      el('span', { 'class': 'crumb-text', text: '数九三伏' }),
      el('div', { 'class': 'seal', 'aria-hidden': 'true', text: '寒' })
    ]));
    main.appendChild(el('h1', { 'class': 'hook', text: SF.hook }));
    main.appendChild(el('p', { 'class': 'answer', text: SF.answer }));
    main.appendChild(el('div', { 'class': 'ornament', 'aria-hidden': 'true' }));
    SF.sections.forEach(function (sec) {
      main.appendChild(el('div', { 'class': 'section-title', text: sec.title }));
      sec.body.forEach(function (p) { main.appendChild(el('p', { 'class': 'block-text', text: p })); });
    });
    if (SF.tip) {
      main.appendChild(el('div', { 'class': 'tip-box' }, [
        el('div', { 'class': 'tip-label', text: '小提示' }),
        el('p', { text: SF.tip })
      ]));
    }

    var side = el('aside', { 'class': 'term-side' });
    var notes = el('details', { 'class': 'notes' }, [
      el('summary', { text: '批注' }),
      el('div', { 'class': 'notes-body' }, SF.notes.map(function (n) {
        return el('p', {}, [el('span', { 'class': 'note-label', text: n.label }), n.text]);
      }))
    ]);
    if (window.matchMedia && window.matchMedia('(min-width: 1100px)').matches) notes.setAttribute('open', '');
    side.appendChild(notes);

    root.appendChild(el('div', { 'class': 'term-page' }, [main, side]));
    document.title = '数九三伏 · 知否知否';
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
    } else if (page === 'shichen') {
      var m3 = /[?&]id=([^&]+)/.exec(location.search);
      if (m3) renderShichen(root, decodeURIComponent(m3[1])); else renderShichenList(root);
    } else if (page === 'ganzhi') {
      renderGanzhi(root);
    } else if (page === 'shengxiao') {
      var m4 = /[?&]id=([^&]+)/.exec(location.search);
      if (m4) renderShengxiao(root, decodeURIComponent(m4[1])); else renderShengxiaoList(root);
    } else if (page === 'shengxiao-kepu') {
      renderShengxiaoKepu(root);
    } else if (page === 'yuefen') {
      renderYuefen(root);
    } else if (page === 'shujiusanfu') {
      renderShujiusanfu(root);
    }
  }
  start();
})();
