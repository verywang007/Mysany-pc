/**
 * 用户管理页专用色（取自原型对应 CSS），CSS 里以 var(--user-<名称>) 引用。
 * 键名用 camelCase，会自动转成 kebab-case，例如 linkBlue → --user-link-blue。
 * 取自原型 user-management.css。
 */
export const userColors: Record<string, string> = {
  /** 查询控件、默认按钮边框 / 文字 */
  ctrlBorder: '#d7dae0',
  ctrlText: '#30364a',
  /** 浏览器默认占位文字色 */
  placeholder: '#757575',
  focusRing: '0 0 0 2px rgba(198, 0, 11, .07)',
  splitLine: 'rgba(255, 255, 255, .25)',
  menuShadow: '0 6px 18px rgba(0, 0, 0, .16)',

  /** 表格 */
  tableBorder: '#dfe2e7',
  cellLine: '#e2e5e9',
  cellText: '#535c71',
  headBg: '#f7f7f8',
  headText: '#30364b',
  rowHover: '#fafafa',
  fixShadow: '-8px 0 12px rgba(31, 41, 55, .04)',
  scrollbar: '#bdc1cb',
  empty: '#a0a5af',

  /** 标签与链接 */
  orgTag: '#ff8908',
  orgTagBg: '#fff0dc',
  roleTag: '#1269e8',
  roleTagBg: '#eaf4ff',
  link: '#1269e8',
  deleteLink: '#d7000f',

  /** 分页 */
  pageBorder: '#d9dce2',
  pageDisabled: '#c9cbd1',

  /** 按钮 */
  danger: '#ef4450',
  disabledBorder: '#f4d6d8',
  disabledBg: '#f8d7d9',

  /** 弹窗 */
  mask: 'rgba(0, 0, 0, .44)',
  modalShadow: '0 10px 36px rgba(0, 0, 0, .25)',
  modalTitle: '#272d42',
  modalClose: '#8b909b',
  blockBg: '#f8f8f9',
  label: '#34394b',
  fieldBorder: '#d6dae1',
  fieldText: '#252b3d',
  help: '#8a91a0',
  tip: '#2c7df0',
  tipBg: '#e8f4ff',
  warnText: '#535c70',
  warn: '#9f2f36',
  warnBg: '#fff0f1',

  /** 步骤条 */
  stepIdle: '#c9ccd3',
  stepIdleText: '#9398a3',

  /** 邀请状态 */
  pending: '#d97706',
  pendingBg: '#fff3d7',
  accepted: '#168548',
  acceptedBg: '#e8f7ee',
  rejected: '#d6313c',
  rejectedBg: '#fdecee',
  avatar: '#6ca6f7',

  /** 导入 */
  uploadText: '#697184',
  uploadBorder: '#bfc4ce',
  uploadBg: '#fafbfc',
  uploadIcon: '#8ca6d6',
  uploadSmall: '#9298a5',
  summary: '#1f6c3f',
  summaryBg: '#ebf7ef',

  /** 个人设备穿梭框 */
  paneLine: '#e5e7eb',
};
