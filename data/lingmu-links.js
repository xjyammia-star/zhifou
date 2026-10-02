/* ==========================================================
   知否知否 · 建筑 · 陵墓与墓葬 · 与本站其他页面的联系
   这个文件是手写的（不是脚本生成的）：写明每座墓可以连到站内哪些页面。
   链接的写法和各页的“?id=名称”直达一致；h 是地址，t 是显示的名字，n 是一句话说明。
   ========================================================== */
(function () {
  var SANG = { t: '礼仪 · 丧礼', n: '礼思板块里讲古代丧礼的流程与观念', h: 'liyi.html?id=丧礼' };
  var GONG = { t: '宫殿坛庙与城市', n: '建筑板块里讲都城、宫殿和陵墓布局的页面', h: 'gongdian.html' };
  var QING = { t: '清明节', n: '扫墓祭祖的传统节日', h: 'jieri.html?id=清明节' };
  var YUQI = { t: '青铜器与玉器', n: '器物板块里讲随葬的青铜器、玉器与玉衣', h: 'qingtong.html' };
  var DIJI = [SANG, GONG];
  window.ZF_LM_LINKS = {
    /* 首页“习俗与考古”专题下方的相关链接 */
    topics: [SANG, { t: '礼仪 · 凶礼', n: '五礼之一，包括丧葬与哀悼的礼仪', h: 'liyi.html?id=凶礼' }, QING, GONG, YUQI],
    /* 每座墓：代号 → 链接列表；没写的墓只显示“丧礼”这一条 */
    tombs: {
      qinshihuang: DIJI.concat([{ t: '《史记》', n: '典籍板块：《秦始皇本纪》是了解陵墓营建的主要文献', h: 'dianji-book.html?id=shiji' }]),
      hanmaoling: DIJI, hanyangling: DIJI, tangzhaoling: DIJI, tangqianling: DIJI, beisong: DIJI, xixia: DIJI,
      chengjisihan: [SANG], mingxiaoling: DIJI, mingshisanling: DIJI, shengjing: DIJI, qingdongling: DIJI, qingxiling: DIJI,
      fuhao: [{ t: '妇好墓器物', n: '器物板块：妇好墓出土的青铜器和玉器', h: 'qingtong.html?id=妇好墓器物' }, SANG],
      zenghouyi: [{ t: '曾侯乙编钟', n: '艺术板块：编钟的音律和铸造', h: 'yinyue.html?id=曾侯乙编钟' }, { t: '编钟', n: '艺术板块：乐器分类里的编钟', h: 'yinyue.html?id=编钟' }, SANG],
      mawangdui: [{ t: '马王堆帛画', n: '艺术板块：书画篆刻页里的 T 形帛画', h: 'shuhua.html?id=马王堆帛画' }, SANG],
      mancheng: [YUQI, SANG], nanyue: [YUQI, SANG], shizishan: [YUQI, SANG],
      liangzhu: [{ t: '良渚玉琮', n: '器物板块：良渚玉琮', h: 'qingtong.html?id=良渚玉琮' }, { t: '玉六器 · 琮', n: '器物板块：礼制里的玉琮', h: 'qingtong.html?id=琮' }],
      huangdiling: [{ t: '黄帝', n: '神灵板块：上古神话里的黄帝', h: 'shenhua.html?id=黄帝' }, QING],
      dayuling: [{ t: '禹', n: '神灵板块：上古神话里的大禹', h: 'shenhua.html?id=禹' }],
      konglin: [{ t: '孔子', n: '神灵板块：民间神灵里的孔子', h: 'shenling.html?id=孔子' }, QING, SANG],
      yuefei: [{ t: '岳飞', n: '神灵板块：民间神灵里的岳飞', h: 'shenling.html?id=岳飞' }, { t: '《满江红》', n: '文学板块：宋词里岳飞的《满江红》', h: 'songci.html?id=岳飞｜满江红·怒发冲冠' }],
      zhaojun: [{ t: '《汉宫秋》', n: '文学板块：元曲里写昭君出塞的杂剧', h: 'yuanqu.html?id=马致远｜汉宫秋·第三折' }],
      caocao: [{ t: '名著 · 三国演义', n: '文学板块：名著页里的三国演义', h: 'mingqing.html' }, SANG],
      famensi: [{ t: '释迦牟尼佛', n: '神灵板块：佛教体系里的释迦牟尼佛（佛指舍利供奉的对象）', h: 'fojiao.html?id=释迦牟尼佛' }]
    },
    fallback: [SANG]
  };
})();
