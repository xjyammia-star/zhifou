/* 知否知否 · 礼与思 · 礼仪页
   数据：data/ls-liyi.js（由文案库自动生成）；排版工具：js/zycommon.js、js/lscommon.js */
(function () {
  'use strict';
  var D = window.ZHIFOU_LS_LIYI, LS = window.LS, Z = window.ZY;
  if (!D || !LS || !Z) return;
  var el = Z.el;

  /* 五服：查亲属。输入亲属名（或“缌麻”“大功”这样的服制），下面六组表格只留匹配的行 */
  var TOTAL = 40;
  function fuSearch() {
    var input = el('input', { type: 'search', 'class': 'ls-search', placeholder: '输入亲属名，如：堂兄弟、舅、岳父；或服制，如：缌麻', 'aria-label': '查亲属或服制' });
    var out = el('p', { 'class': 'zy-note ls-count', 'aria-live': 'polite', text: '共 ' + TOTAL + ' 项，按亲疏分成六组。' });
    function run() {
      var q = input.value.trim(), total = 0;
      Array.prototype.forEach.call(document.querySelectorAll('[data-ls-fu]'), function (sec) {
        var vis = 0;
        Array.prototype.forEach.call(sec.querySelectorAll('tr[data-ls-name]'), function (tr) {
          var hit = !q || tr.textContent.indexOf(q) >= 0;
          tr.hidden = !hit;
          if (hit) vis++;
        });
        sec.hidden = vis === 0;
        total += vis;
      });
      out.textContent = !q ? '共 ' + TOTAL + ' 项，按亲疏分成六组。' : (total ? '找到 ' + total + ' 项。' : '没有找到；试试更短的词，如“舅”“姑”。');
    }
    input.addEventListener('input', run);
    return Z.section('查一查', [el('div', { 'class': 'ls-searchbar' }, [input, out])]);
  }

  var FU_COLS = [['亲属', '@name'], ['《仪礼》', '《仪礼》'], ['后世变化与备注', '后世']];
  function fuBlock(name, title) {
    return { sec: name, title: title || name, kind: 'table', cols: FU_COLS, wide: true, attr: { 'data-ls-fu': '1' } };
  }

  LS.mkPage({
    D: D,
    eyebrow: '礼与思 · 礼仪',
    title: '礼仪',
    tabs: [
      { key: 'li', label: '礼是什么', blocks: [
        { sec: '礼是什么', grid: 'is-wide' },
        { sec: '三礼', title: '三礼：三部礼书', grid: 'is-3' },
        { sec: '五礼', grid: 'is-wide' },
        { sec: '人生的四个转折', grid: 'is-wide' }
      ] },
      { key: 'guan', label: '冠笄与婚礼', blocks: [
        { sec: '冠礼', grid: 'is-wide' },
        { sec: '三加', kind: 'steps', grid: 'is-3' },
        { sec: '笄礼', grid: 'is-wide' },
        { sec: '冠礼与笄礼的差异', kind: 'table', cols: [['项目', '@name'], ['冠礼', '冠礼'], ['笄礼', '笄礼']] },
        { sec: '婚礼', grid: 'is-wide' },
        { sec: '六礼', kind: 'steps', grid: 'is-wide' },
        { sec: '婚礼中的三个动作', grid: 'is-3' },
        { sec: '婚姻中的称谓', grid: 'is-3' }
      ] },
      { key: 'sang', label: '丧礼与祭礼', blocks: [
        { sec: '丧礼', grid: 'is-wide' },
        { sec: '丧礼的七个阶段', kind: 'steps', grid: 'is-wide' },
        { sec: '慎终追远', grid: 'is-wide' },
        { sec: '祭礼', grid: 'is-wide' },
        { sec: '祭祀的六个环节', kind: 'steps', grid: 'is-wide' },
        { sec: '祭礼里的两个特别之处', grid: 'is-wide' }
      ] },
      { key: 'wufu', label: '五服', blocks: [
        { sec: '五服的由来与地位', grid: 'is-wide' },
        { sec: '五服的五个等级', kind: 'table', cols: [['等级', '@name'], ['用布与做法', '用布与做法'], ['服期', '服期'], ['备注', '备注']] },
        { custom: fuSearch },
        fuBlock('上辈与直系'), fuBlock('同辈与配偶'), fuBlock('下辈'), fuBlock('父系旁亲'), fuBlock('母系外亲'), fuBlock('姻亲'),
        { sec: '读五服表的三个规律', grid: 'is-3' },
        { sec: '五服后世为什么会变', grid: 'is-3' },
        { sec: '怎么读五服图', grid: 'is-wide' }
      ] },
      { key: 'richang', label: '日常礼仪', blocks: [
        { sec: '揖', grid: 'is-wide' },
        { sec: '三揖', grid: 'is-3' },
        { sec: '九拜', kind: 'table', cols: [['名称', '@name'], ['动作', '动作'], ['用途', '用途']] },
        { sec: '拜礼的其他说法', grid: 'is-wide' },
        { sec: '座次与席位', grid: 'is-wide' },
        { sec: '宴饮与乡饮酒礼', grid: 'is-wide' },
        { sec: '乡饮酒礼的七个步骤', kind: 'steps', grid: 'is-wide' },
        { sec: '射礼', grid: 'is-wide' },
        { sec: '乡射礼的三番射', kind: 'steps', grid: 'is-3' },
        { sec: '馈赠、服饰与生育', grid: 'is-wide' }
      ] }
    ]
  });
})();
