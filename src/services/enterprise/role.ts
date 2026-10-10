import dayjs from 'dayjs';
import { DEFAULT_ROLES, PERMISSIONS, ROLE_USERS } from '@/mock/enterprise/role';
import { delay, exact, paginate } from '@/mock/utils';
import type { PageQuery, PageResult } from '@/types/common';
import { STORAGE_KEYS, readJSON, writeJSON } from '@/utils/storage';

/** 角色类型：系统配置 / 自定义 */
export type RoleType = 'system' | 'custom';

/**
 * 角色。scope：'0' 全部设备 | '1' 组织+项目 | '2' 个人设备（字符串；与原型一致，
 * '0'、'1' 以外的任何值都按「个人设备」显示，所以类型保留为 string）。
 */
export interface Role {
  id: string;
  name: string;
  type: RoleType;
  description: string;
  scope: string;
  /** 关联用户 id，用户分配表按此顺序展示 */
  assignedUserIds: string[];
  /** YYYY-MM-DD HH:mm:ss */
  created: string;
  /** 权限 id（含父节点 id） */
  permissions: string[];
  /** 恢复默认用；自定义角色为 [] */
  defaultPermissions: string[];
}

export interface PermissionNode {
  id: string;
  name: string;
  children?: PermissionNode[];
}

export interface RoleUser {
  id: string;
  name: string;
  /** 登录凭证：手机号或邮箱 */
  login: string;
  /** 业务职责 */
  duty: string;
  orgs: string[];
  /** 最后登录时间，可能为空 */
  last: string;
}

export interface RoleFilters {
  name: string;
  type: string;
  scope: string;
}

export interface RoleUserFilters {
  query: string;
  org: string;
  duty: string;
}

/** 新增 / 编辑弹窗提交的字段 */
export interface RoleInput {
  name: string;
  description: string;
  scope: string;
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/**
 * 读取角色数据：存储中是非空数组则使用，否则（不存在、解析失败、空数组、非数组）用预置数据。
 * 预置数据不会在读取时写入存储，第一次写操作时才整体写入（与原型一致）。
 */
function loadRoles(): Role[] {
  const stored = readJSON<unknown>(STORAGE_KEYS.roleDemo, null);
  if (Array.isArray(stored) && stored.length) return stored as Role[];
  return clone(DEFAULT_ROLES);
}

const saveRoles = (roles: Role[]) => writeJSON(STORAGE_KEYS.roleDemo, roles);

/** 读取 → 修改 → 写回；找不到角色时不写存储，返回 undefined */
function mutateRole(id: string, fn: (r: Role) => void): Role | undefined {
  const roles = loadRoles();
  const role = roles.find((r) => r.id === id);
  if (!role) return undefined;
  fn(role);
  saveRoles(roles);
  return role;
}

/** 功能权限树（静态） */
export const getPermissionTree = (): PermissionNode[] => PERMISSIONS;

/**
 * 角色列表。名称为不区分大小写的子串匹配，且不 trim（与原型一致，输入空格也参与匹配）；
 * 类型、设备权限类型精确匹配；按数组顺序（新增在最前），无排序。
 */
export async function listRoles(query: RoleFilters & PageQuery): Promise<PageResult<Role>> {
  await delay(0);
  const q = query.name.toLowerCase();
  const rows = loadRoles().filter(
    (r) =>
      (!q || r.name.toLowerCase().includes(q)) &&
      exact(r.type, query.type) &&
      exact(r.scope, query.scope),
  );
  return paginate(rows, query);
}

export async function getRole(id: string): Promise<Role | undefined> {
  await delay(0);
  return loadRoles().find((r) => r.id === id);
}

/** 名称是否已被其他角色使用（区分大小写全等，与原型一致） */
export async function roleNameExists(name: string, excludeId = ''): Promise<boolean> {
  await delay(0);
  return loadRoles().some((r) => r.name === name && r.id !== excludeId);
}

/** 新增自定义角色，插到最前 */
export async function createRole(input: RoleInput): Promise<Role> {
  await delay(0);
  const roles = loadRoles();
  const role: Role = {
    id: `r-${Date.now()}`,
    name: input.name,
    type: 'custom',
    description: input.description,
    scope: input.scope,
    assignedUserIds: [],
    created: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    permissions: [],
    defaultPermissions: [],
  };
  roles.unshift(role);
  saveRoles(roles);
  return role;
}

/** 编辑：只改名称、描述、设备权限类型，不动权限和用户 */
export async function updateRole(id: string, input: RoleInput): Promise<Role | undefined> {
  await delay(0);
  return mutateRole(id, (r) => {
    r.name = input.name;
    r.description = input.description;
    r.scope = input.scope;
  });
}

export async function deleteRole(id: string): Promise<void> {
  await delay(0);
  saveRoles(loadRoles().filter((r) => r.id !== id));
}

/** 恢复默认：功能权限 = defaultPermissions，立即写入（不经过详情页的「保存」） */
export async function restoreDefaultPermissions(id: string): Promise<Role | undefined> {
  await delay(0);
  return mutateRole(id, (r) => {
    r.permissions = (r.defaultPermissions ?? []).slice();
  });
}

export async function saveRolePermissions(
  id: string,
  permissions: string[],
): Promise<Role | undefined> {
  await delay(0);
  return mutateRole(id, (r) => {
    r.permissions = permissions;
  });
}

/** 从角色中移除用户 */
export async function removeRoleUser(roleId: string, userId: string): Promise<Role | undefined> {
  await delay(0);
  return mutateRole(roleId, (r) => {
    r.assignedUserIds = r.assignedUserIds.filter((id) => id !== userId);
  });
}

/**
 * 角色的关联用户（按 assignedUserIds 顺序），只保留用户字典中存在的。
 * 文本条件同时匹配姓名和登录凭证、不 trim；组织为包含；业务职责为全等（与原型一致）。
 */
export async function listRoleUsers(roleId: string, filters: RoleUserFilters): Promise<RoleUser[]> {
  await delay(0);
  const role = loadRoles().find((r) => r.id === roleId);
  if (!role) return [];
  const q = filters.query.toLowerCase();
  return role.assignedUserIds
    .filter((id) => ROLE_USERS[id]?.name)
    .map((id) => ({ id, ...ROLE_USERS[id] }))
    .filter(
      (u) =>
        (!q || `${u.name} ${u.login}`.toLowerCase().includes(q)) &&
        (!filters.org || u.orgs.includes(filters.org)) &&
        exact(u.duty, filters.duty),
    );
}
