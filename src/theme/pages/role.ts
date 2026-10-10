/**
 * 角色管理页专用色（取自原型对应 CSS），CSS 里以 var(--role-<名称>) 引用。
 * 键名用 camelCase，会自动转成 kebab-case，例如 linkBlue → --role-link-blue。
 */
export const roleColors: Record<string, string> = {
  /** 输入框 / 下拉 / 普通按钮边框 */
  inputBorder: '#d7dae0',
  /** 弹窗内输入框边框 */
  fieldBorder: '#d6dae1',
  /** 输入框、按钮文字 */
  ink: '#30364a',
  focusRing: '0 0 0 2px rgba(198, 0, 11, .07)',
  fieldFocusRing: '0 0 0 2px rgba(198, 0, 11, .08)',
  btnDisabled: '#c2c5cc',
  btnDisabledBg: '#f5f5f5',
  /** 确认弹窗危险按钮 */
  dangerBtn: '#ef4450',
  /** 表格 */
  tableWrapBorder: '#dfe2e7',
  tableBorder: '#e2e5e9',
  tableText: '#535c71',
  tableHead: '#30364b',
  tableHeadBg: '#f7f7f8',
  rowHover: '#fafafa',
  empty: '#a0a5af',
  /** 操作链接 */
  link: '#1269e8',
  linkDanger: '#d7000f',
  /** 标签：系统配置 / 自定义 / 设备权限类型 / 组织 */
  tagSystem: '#1269e8',
  tagSystemBg: '#eaf4ff',
  tagCustom: '#8a4fc2',
  tagCustomBg: '#f2eafb',
  tagScope: '#5b6979',
  tagScopeBg: '#e9eaec',
  tagOrg: '#f68800',
  tagOrgBg: '#ffefd7',
  /** 分页 */
  pageBorder: '#d9dce2',
  pageDisabled: '#c9cbd1',
  pageDisabledBg: '#fafafa',
  /** 详情：摘要卡、页签 */
  cardBorder: '#eef0f3',
  avatarFrom: '#347bf0',
  avatarTo: '#b5d5ff',
  label: '#657083',
  value: '#202638',
  tabsLine: '#e7e9ed',
  tab: '#687083',
  /** 权限警示条 */
  warnBorder: '#f4d374',
  warnText: '#7d5b12',
  warnBg: '#fff9e7',
  /** 滚动条滑块 */
  scrollbar: '#c4c8d1',
  /** 弹窗 */
  mask: 'rgba(0, 0, 0, .44)',
  modalShadow: '0 10px 36px rgba(0, 0, 0, .25)',
  modalClose: '#8b909b',
  formBlockBg: '#f8f8f9',
  formLabel: '#34394b',
  help: '#8a91a0',
  scopeDesc: '#72798a',
  confirmText: '#535c70',
};
