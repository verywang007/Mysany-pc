/** 顶部模块页签（原型写死，只切换选中态） */
export const MODULE_TABS = [
  '概览',
  '工作台',
  '起重机',
  '导入',
  '报告',
  '图纸',
  '项目设置',
  '设置',
  '帮助',
];

/** 左侧 SMART LIFT 菜单（原型写死，只切换选中态） */
export const SMART_LIFT_NAV = [
  { key: 'welcome', label: '欢迎使用' },
  { key: 'create', label: '创建项目' },
  { key: 'list', label: '项目列表' },
  { key: 'force', label: '受力计算' },
] as const;

export type SmartLiftNavKey = (typeof SMART_LIFT_NAV)[number]['key'];

/** 轮播张数（3 张同图并排显示） */
export const SLIDE_COUNT = 3;
