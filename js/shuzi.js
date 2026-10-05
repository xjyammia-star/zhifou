/* 知否知否 · 字语 · 数字文化页
   数据：data/zy-shuzi.js（由文案库自动生成）；排版工具：js/zycommon.js
   两个标签页：数字成语 / 数字体系，每个标签页里按“分组”选 */
(function () {
  'use strict';
  var D = window.ZHIFOU_ZY_SHUZI, Z = window.ZY;
  var root = document.getElementById('app');
  if (!D || !Z || !root) return;
  var S = function (t) { return Z.sec(D, t); };
  var tabsApi = null;
  var goTab = function (k) { return function () { tabsApi.show(k); }; };

  var CY_GROUPS = ['固定名单', '事件和位置', '宗教仪式和礼俗', '名单有争议'];
  var TX_GROUPS = ['一到十', '十二与周期', '五行配套', '百千万与计数', '数字固定词', '吉凶数'];

  function cyCard(it) {
    return Z.gcard(it, { sub: '数字对应', subMax: 34, order: ['数字对应', '意思', '出处', '提醒'] });
  }
  function txCard(it) {
    return Z.gcard(it, { sub: '一句话解释', order: ['为什么这样设定', '出处', '常见误解', '提醒'] });
  }

  function build(secName, groups, make, tabKey, aria) {
    return function () {
      var s = S(secName);
      return [Z.section(secName + '：' + s.items.length + ' 张', [Z.note(s.bold['说明']), Z.note(Z.LEGEND)]
        .concat(Z.filtered(s.items, groups, make, { aria: aria, before: goTab(tabKey) })))];
    };
  }

  tabsApi = Z.tabs([
    { key: 'cy', label: '数字成语', build: build('数字成语', CY_GROUPS, cyCard, 'cy', '数字成语分组') },
    { key: 'tx', label: '数字体系', build: build('数字体系', TX_GROUPS, txCard, 'tx', '数字体系分组') }
  ]);

  Z.mount(root, [Z.head(D, '字语 · 数字文化'), tabsApi.node, Z.see(D)].concat(Z.tipNotes(D)));
  document.title = '数字文化 · 字语 · 知否知否';
  Z.openFromQuery();
})();
