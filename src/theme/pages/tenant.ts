/**
 * 租户管理页专用色（取自原型对应 CSS），CSS 里以 var(--tenant-<名称>) 引用。
 * 键名用 camelCase，会自动转成 kebab-case，例如 linkBlue → --tenant-link-blue。
 * 来源：原型 tenant-management.css / tenant-management.js（数量卡图标）。
 */
export const tenantColors = {
  /** 页签 */
  tab: '#657083',
  tabActive: '#202638',
  /** 标题、正文 */
  title: '#1f2937',
  titleStrong: '#111827',
  label: '#657083',
  value: '#202638',
  muted: '#5f6775',
  /** 卡片底 */
  cardBg: '#f8f8f9',
  ownerLine: '#e5e7eb',
  ownerDivider: '#c7cbd3',
  ownerPanelBg: '#f7f8fa',
  noteText: '#8a6215',
  noteBg: '#fff8e8',
  /** 数量卡渐变与图标 */
  countFrom: '#deefff',
  countTo: '#eff7ff',
  countIconShadow: 'rgba(38, 111, 222, .16)',
  iconOrgTop: '#69a9ff',
  iconOrgLeft: '#2f78e7',
  iconOrgRight: '#82beff',
  iconUserHead: '#67a7ff',
  iconUserBody: '#397fea',
  iconUserSide: '#8dc5ff',
  iconDevice: '#9ed5ff',
  /** 客户认证概览 */
  authFrom: '#f2f5ff',
  authTo: '#eef8ff',
  authDecoFrom: 'rgba(45, 102, 220, .9)',
  authDecoMid: 'rgba(120, 174, 255, .12)',
  authRing: 'rgba(255, 255, 255, .45)',
  authRingInner: 'rgba(255, 255, 255, .28)',
  authCircleBg: 'rgba(225, 241, 255, .74)',
  helpIcon: '#2563eb',
  /** 链接、标签 */
  link: '#1269e8',
  tagBg: '#eaf4ff',
  /** 表格 */
  tableBorder: '#dfe2e7',
  cellBorder: '#e5e7eb',
  cellText: '#525b70',
  headText: '#30364b',
  headBg: '#f7f7f8',
  empty: '#a4a9b2',
  /** 按钮、分页 */
  btnText: '#30364a',
  btnBorder: '#d7dae0',
  pageBorder: '#d9dce2',
  danger: '#ef4450',
  /** 弹窗 */
  modalTitle: '#272d42',
  modalClose: '#8b909b',
  formLabel: '#34394b',
  fieldText: '#252b3d',
  fieldBorder: '#d6dae1',
  focusRing: 'rgba(198, 0, 11, .08)',
  required: '#f5222d',
  tipText: '#2c7df0',
  tipBg: '#e8f4ff',
  tipIcon: '#3b82f6',
  verifyErr: '#f04134',
  verifyOk: '#00ad65',
  deleteText: '#4f586b',
  mask: 'rgba(0, 0, 0, .44)',
  modalShadow: '0 10px 36px rgba(0, 0, 0, .25)',
};
