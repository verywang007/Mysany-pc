/**
 * 组织管理页专用色（取自原型对应 CSS），CSS 里以 var(--organization-<名称>) 引用。
 * 键名用 camelCase，会自动转成 kebab-case，例如 linkBlue → --organization-link-blue。
 */
export const organizationColors: Record<string, string> = {
  /** 页面底色、聚焦外发光 */
  pageBg: '#f5f6f8',
  focusRing: '0 0 0 2px rgba(198, 0, 11, .08)',
  scrollbar: '#cfd3db',

  /* 组织树 */
  searchBorder: '#d9dde4',
  treeText: '#33394d',
  treeHover: '#f5f5f5',
  treeSelectedBg: '#fde7e8',
  treeToggle: '#8e91a3',
  treeAction: '#50566b',
  treeActionHoverBg: 'rgba(255, 255, 255, .72)',
  menuText: '#30354a',
  menuDanger: '#d7000f',
  menuShadow: '0 4px 16px rgba(5, 12, 50, .18)',

  /* 组织信息卡 */
  infoBg: '#f8f8f9',
  infoLabel: '#687083',
  infoValue: '#202638',
  ownerDivider: '#c7cbd3',

  /* 按钮、页签 */
  btnBorder: '#d7dae0',
  btnText: '#30364a',
  tabText: '#2f3447',
  dangerBtn: '#ef4450',
  btnDisabledBorder: '#dedfe3',
  btnDisabledText: '#b8bbc3',
  btnDisabledFill: '#f8d7d9',

  /* 表格 */
  tableBorder: '#dfe2e7',
  tableGrid: '#e5e7eb',
  tableHeadBg: '#f7f7f8',
  tableHeadText: '#30364b',
  tableText: '#4f586e',
  rowHover: '#fafafa',
  link: '#1269e8',
  roleTagBg: '#eaf4ff',
  leader: '#739bff',

  /* 分页 */
  pagerBorder: '#d9dce2',
  pagerDisabled: '#c9cbd1',

  /* 弹窗 */
  mask: 'rgba(0, 0, 0, .44)',
  modalShadow: '0 10px 36px rgba(0, 0, 0, .25)',
  modalTitle: '#272d42',
  modalClose: '#8b909b',
  formLabel: '#34394b',
  fieldBorder: '#d6dae1',
  fieldText: '#252b3d',
  fieldDisabledText: '#a4a8b0',
  help: '#8a91a0',
  count: '#9aa0aa',
  searchIcon: '#596174',
  modalTableText: '#535c72',
  modalEmpty: '#a0a5af',
  pickItemLine: '#eef0f3',
  pickOnBg: '#fff5f5',
  pickRadio: '#cfd4dd',
  rootTagBg: '#f2f3f5',
  stepText: '#9398a3',
  stepCircle: '#c9ccd3',
  selectedCount: '#535c70',
  confirmText: '#555d70',
  confirmIcon: '#faad14',

  /* 导入 */
  uploadBorder: '#bfc4ce',
  uploadBg: '#fafbfc',
  uploadText: '#697184',
  uploadIcon: '#8ca6d6',
  uploadSmall: '#9298a5',
  summaryText: '#1f6c3f',
  summaryBg: '#ebf7ef',
  okText: '#168548',
  okBg: '#e8f7ee',
};
