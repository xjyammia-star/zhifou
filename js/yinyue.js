
/* 知否知否 · 艺 · 音乐与戏曲页
   数据：data/yi-yinyue.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_YI_YINYUE, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;

  LS.mkPage({
    D: D,
    eyebrow: '艺 · 音乐与戏曲',
    title: '音乐与戏曲',
    suffix: ' · 艺 · 知否知否',
    tabs: [
      { key: 'yueqi', label: '乐器与乐理', blocks: [
        { sec: '看古代音乐的三条线索', grid: 'is-3' },
        { sec: '代表乐器' },
        { sec: '八音' },
        { sec: '五声音阶', grid: 'is-3' },
        { sec: '五声与调式', grid: 'is-3' },
        { sec: '十二律', kind: 'table',
          cols: [['律名', '@name'], ['序号', '序号'], ['六律或六吕', '六律六吕'], ['说明', '说明']] },
        { sec: '十二律的几点说明', grid: 'is-3' },
        { sec: '乐器、八音与乐理怎样联系' },
        { sec: '乐谱与音乐机构' },
        { sec: '古琴' },
        { sec: '古琴十大名曲' },
        { sec: '琵琶名曲与文学传统' },
        { sec: '音乐里的典故与人物' }
      ] },
      { key: 'xiqu', label: '戏曲', blocks: [
        { sec: '戏曲是什么', grid: 'is-3' },
        { sec: '戏曲的发展线索' },
        { sec: '明代的四大声腔' },
        { sec: '五种常见剧种' },
        { sec: '京剧的形成与其他声腔' },
        { sec: '唱念做打' },
        { sec: '四功五法' },
        { sec: '京剧的四个行当' },
        { sec: '京剧脸谱' },
        { sec: '看脸谱的三个层次', kind: 'steps' },
        { sec: '京剧名家' },
        { sec: '戏曲名作' },
        { sec: '行头与文武场' },
        { sec: '科班、戏班与戏楼' }
      ] }
    ]
  });
})();
