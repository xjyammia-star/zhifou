
/* 知否知否 · 艺 · 音乐与戏曲页
   数据：data/yi-yinyue.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_YI_YINYUE, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;

  LS.mkPage({
    D: D,
    eyebrow: '艺术 · 音乐与戏曲',
    title: '音乐与戏曲',
    suffix: ' · 艺术 · 知否知否',
    tabs: [
      { key: 'yueqi', label: '乐器与乐理', blocks: [
        { sec: '看古代音乐的三条线索', img: 'yinyue', grid: 'is-3' },
        { sec: '代表乐器', img: 'yinyue' },
        { sec: '八音', img: 'yinyue' },
        { sec: '五声音阶', img: 'yinyue', grid: 'is-3' },
        { sec: '五声与调式', img: 'yinyue', grid: 'is-3' },
        { sec: '十二律', kind: 'table',
          cols: [['律名', '@name'], ['序号', '序号'], ['六律或六吕', '六律六吕'], ['说明', '说明']] },
        { sec: '十二律的几点说明', img: 'yinyue', grid: 'is-3' },
        { sec: '乐器、八音与乐理怎样联系', img: 'yinyue' },
        { sec: '乐谱与音乐机构', img: 'yinyue' },
        { sec: '古琴', img: 'yinyue' },
        { sec: '古琴十大名曲', img: 'yinyue' },
        { sec: '琵琶名曲与文学传统', img: 'yinyue' },
        { sec: '音乐里的典故与人物', img: 'yinyue' }
      ] },
      { key: 'xiqu', label: '戏曲', blocks: [
        { sec: '戏曲是什么', img: 'yinyue', grid: 'is-3' },
        { sec: '戏曲的发展线索', img: 'yinyue' },
        { sec: '明代的四大声腔', img: 'yinyue' },
        { sec: '五种常见剧种', img: 'yinyue' },
        { sec: '京剧的形成与其他声腔', img: 'yinyue' },
        { sec: '唱念做打', img: 'yinyue' },
        { sec: '四功五法', img: 'yinyue' },
        { sec: '京剧的四个行当', img: 'yinyue' },
        { sec: '京剧脸谱', img: 'yinyue' },
        { sec: '看脸谱的三个层次', kind: 'steps' },
        { sec: '京剧名家', img: 'yinyue' },
        { sec: '戏曲名作', img: 'yinyue' },
        { sec: '行头与文武场', img: 'yinyue' },
        { sec: '科班、戏班与戏楼', img: 'yinyue' }
      ] }
    ]
  });
})();
