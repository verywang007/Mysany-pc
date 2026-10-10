import type { RoleFilters, RoleType, RoleUserFilters } from '@/services/enterprise/role';

export const ROLE_TYPE_OPTIONS: { value: RoleType; label: string }[] = [
  { value: 'custom', label: '自定义' },
  { value: 'system', label: '系统配置' },
];

/** 设备权限类型：新增 / 编辑弹窗的单选卡片，也是筛选下拉的选项 */
export const SCOPE_OPTIONS = [
  {
    value: '0',
    label: '全部设备',
    desc: '用户可查看租户内所有设备，无需额外分配。适用于管理员、总监等高层管理人员。',
  },
  {
    value: '1',
    label: '组织+项目',
    desc: '用户可查看其所属组织和加入项目的设备，自动计算权限。适用于区域经理、项目经理等中层管理人员。',
  },
  {
    value: '2',
    label: '个人设备',
    desc: '用户只能查看特定分配的设备，需要管理员手动分配。适用于普通操作员、机手、维修工等基层人员。',
  },
];

/** 与原型一致：'0'、'1' 以外的任何值都显示「个人设备」 */
export const scopeName = (s: string) =>
  s === '0' ? '全部设备' : s === '1' ? '组织+项目' : '个人设备';

export const typeName = (t: RoleType) => (t === 'system' ? '系统配置' : '自定义');

/** 用户分配页签：组织、业务职责下拉（原型写死） */
export const USER_ORG_OPTIONS = ['2603181012测试客户', '测试组织1', '测试组织2', 'aa'];
export const USER_DUTY_OPTIONS = ['设备管理员', '设备操作手', '维修人员', '设备所有人'];

export const PAGE_SIZE_OPTIONS = [10, 20];

export const EMPTY_FILTERS: RoleFilters = { name: '', type: '', scope: '' };
export const EMPTY_USER_FILTERS: RoleUserFilters = { query: '', org: '', duty: '' };

/** 进入详情时的默认展开项（含原型中无对应节点的 'app'，保持原样） */
export const DEFAULT_EXPANDED = ['app', 'machine', 'machine.detail'];

/** 权限树根节点（「应用功能」）的 key */
export const ROOT_KEY = '__all';

export const PERMISSION_WARNING =
  '● 角色分配解绑权限后，解绑设备会影响整个组织的设备绑定关系，请谨慎分配权限。';

/** 新增 / 编辑弹窗校验文案 */
export const FORM_ERRORS = {
  nameRequired: '请输入角色名称',
  nameExists: '角色名称已存在',
  scopeRequired: '请选择设备权限类型',
};

export const MESSAGES = {
  created: '角色新增成功',
  updated: '角色信息已保存',
  deleted: '角色已删除',
  restored: '已恢复默认权限',
  permissionsSaved: '功能权限已保存',
  userRemoved: '角色已移除',
};
