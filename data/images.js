/* ==========================================================
   知否知否 · 图片登记表（由 工具脚本\生成图片登记表.py 生成，请勿手改）
   图片放在 Cloudinary（云名称 dc7qejbjd）；网页按这里的登记显示图片和图注。
   键的格式：类别/名称，如 term/立春、festival/中秋节。没有登记的词条不显示图片。
   id 图片编号；v 版本号（图片更新时自动变，防止旧图缓存）；dw、dh 网页里显示的宽高比例；
   crop 保留比例（0.9=四周各裁掉 5% 的旧边框，1=不裁）；ai 为 true 时图注下显示“AI 生成插画”。
   ========================================================== */
window.ZHIFOU_IMAGES = {
  base: 'https://res.cloudinary.com/dc7qejbjd/image/upload/',
  aiLabel: 'AI 生成插画',
  items: {
    'term/立春': { id: 'zhifou/jieqi/lichun', v: 1790486951, dw: 900, dh: 1200, crop: 0.9, caption: '东风解冻，蛰虫始振', source: '《月令七十二候集解》', ai: true },
    'term/雨水': { id: 'zhifou/jieqi/yushui', v: 1790486952, dw: 900, dh: 1200, crop: 0.9, caption: '獭祭鱼，鸿雁来', source: '《月令七十二候集解》', ai: true },
    'term/惊蛰': { id: 'zhifou/jieqi/jingzhe', v: 1790486953, dw: 900, dh: 1200, crop: 0.9, caption: '桃始华，仓庚鸣', source: '《月令七十二候集解》', ai: true },
    'term/春分': { id: 'zhifou/jieqi/chunfen', v: 1790486954, dw: 900, dh: 1200, crop: 0.9, caption: '玄鸟至，雷乃发声', source: '《月令七十二候集解》', ai: true },
    'term/清明': { id: 'zhifou/jieqi/qingming', v: 1790486955, dw: 900, dh: 1200, crop: 0.9, caption: '桐始华，田鼠化为鴽', source: '《月令七十二候集解》', ai: true },
    'term/谷雨': { id: 'zhifou/jieqi/guyu', v: 1790486957, dw: 900, dh: 1200, crop: 0.9, caption: '萍始生，鸣鸠拂其羽', source: '《月令七十二候集解》', ai: true },
    'term/立夏': { id: 'zhifou/jieqi/lixia', v: 1790486958, dw: 900, dh: 1200, crop: 0.9, caption: '蝼蝈鸣，蚯蚓出', source: '《月令七十二候集解》', ai: true },
    'term/小满': { id: 'zhifou/jieqi/xiaoman', v: 1790486960, dw: 900, dh: 1200, crop: 0.9, caption: '苦菜秀，靡草死', source: '《月令七十二候集解》', ai: true },
    'term/芒种': { id: 'zhifou/jieqi/mangzhong', v: 1790486961, dw: 900, dh: 1200, crop: 0.9, caption: '螳螂生，鵙始鸣', source: '《月令七十二候集解》', ai: true },
    'term/夏至': { id: 'zhifou/jieqi/xiazhi', v: 1790486962, dw: 900, dh: 1200, crop: 0.9, caption: '鹿角解，蝉始鸣', source: '《月令七十二候集解》', ai: true },
    'term/小暑': { id: 'zhifou/jieqi/xiaoshu', v: 1790486963, dw: 900, dh: 1200, crop: 0.9, caption: '温风至，蟋蟀居宇', source: '《月令七十二候集解》', ai: true },
    'term/大暑': { id: 'zhifou/jieqi/dashu', v: 1790486965, dw: 900, dh: 1200, crop: 0.9, caption: '腐草为萤，土润溽暑', source: '《月令七十二候集解》', ai: true },
    'term/立秋': { id: 'zhifou/jieqi/liqiu', v: 1790486966, dw: 900, dh: 1200, crop: 0.9, caption: '凉风至，白露降', source: '《月令七十二候集解》', ai: true },
    'term/处暑': { id: 'zhifou/jieqi/chushu', v: 1790486967, dw: 900, dh: 1200, crop: 0.9, caption: '鹰乃祭鸟，天地始肃', source: '《月令七十二候集解》', ai: true },
    'term/白露': { id: 'zhifou/jieqi/bailu', v: 1790486968, dw: 900, dh: 1200, crop: 0.9, caption: '鸿雁来，玄鸟归', source: '《月令七十二候集解》', ai: true },
    'term/秋分': { id: 'zhifou/jieqi/qiufen', v: 1790486969, dw: 900, dh: 1200, crop: 0.9, caption: '雷始收声，蛰虫坯户', source: '《月令七十二候集解》', ai: true },
    'term/寒露': { id: 'zhifou/jieqi/hanlu', v: 1790486970, dw: 900, dh: 1200, crop: 0.9, caption: '鸿雁来宾，雀入大水为蛤', source: '《月令七十二候集解》', ai: true },
    'term/霜降': { id: 'zhifou/jieqi/shuangjiang', v: 1790486972, dw: 900, dh: 1200, crop: 0.9, caption: '豺乃祭兽，草木黄落', source: '《月令七十二候集解》', ai: true },
    'term/立冬': { id: 'zhifou/jieqi/lidong', v: 1790486973, dw: 900, dh: 1200, crop: 0.9, caption: '水始冰，地始冻', source: '《月令七十二候集解》', ai: true },
    'term/小雪': { id: 'zhifou/jieqi/xiaoxue', v: 1790486974, dw: 900, dh: 1200, crop: 0.9, caption: '虹藏不见，天气上升、地气下降', source: '《月令七十二候集解》', ai: true },
    'term/大雪': { id: 'zhifou/jieqi/daxue', v: 1790486975, dw: 900, dh: 1200, crop: 0.9, caption: '鴠鸟不鸣，虎始交', source: '《月令七十二候集解》', ai: true },
    'term/冬至': { id: 'zhifou/jieqi/dongzhi', v: 1790486977, dw: 900, dh: 1200, crop: 0.9, caption: '蚯蚓结，麋角解', source: '《月令七十二候集解》', ai: true },
    'term/小寒': { id: 'zhifou/jieqi/xiaohan', v: 1790486978, dw: 900, dh: 1200, crop: 0.9, caption: '雁北乡，鹊始巢', source: '《月令七十二候集解》', ai: true },
    'term/大寒': { id: 'zhifou/jieqi/dahan', v: 1790486980, dw: 900, dh: 1200, crop: 0.9, caption: '鸡始乳，征鸟厉疾', source: '《月令七十二候集解》', ai: true },
    'festival/中秋节': { id: 'zhifou/jieri/zhongqiujie', v: 1790486981, dw: 900, dh: 1204, crop: 1, caption: '但愿人长久，千里共婵娟', source: '苏轼《水调歌头》', ai: true }
  }
};
