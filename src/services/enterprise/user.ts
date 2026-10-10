import dayjs from 'dayjs';
import {
  DEFAULT_USER_DATA,
  DEVICES,
  INVITER,
  INVITE_CANDIDATES,
  ORGANIZATIONS,
  RESPONSIBILITIES,
  ROLES,
  makeImportSamples,
  makeUser,
} from '@/mock/enterprise/user';
import { delay, paginate } from '@/mock/utils';
import type { PageQuery, PageResult } from '@/types/common';
import { STORAGE_KEYS, readJSON, writeJSON } from '@/utils/storage';

/** 设备范围类型：'0' 全部设备 / '1' 组织+项目 / '2' 个人设备 */
export type DeviceScope = '0' | '1' | '2';

export interface User {
  id: string;
  name: string;
  /** 国际区号，如 +86；可为空串 */
  prefix: string;
  phone: string;
  email: string;
  /** 恒等于 name */
  username: string;
  orgs: string[];
  roles: string[];
  deviceScope: DeviceScope;
  /** 业务职责（单值），可为空串 */
  responsibility: string;
  /** YYYY-MM-DD HH:mm:ss */
  created: string;
  /** 已分配设备 id */
  assignedDevices: string[];
  /** 个人设备 id */
  personalDevices: string[];
  /** 首次登录强制修改密码（原型只保存，不生效） */
  forcePassword: boolean;
  /** 重置密码成功的时间 */
  passwordUpdatedAt?: string;
}

export type InviteStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface Invite {
  id: string;
  /** 候选人姓名 */
  user: string;
  /** phone || email（保存但不展示） */
  contact: string;
  roles: string[];
  orgs: string[];
  remark: string;
  inviter: string;
  status: InviteStatus;
  time: string;
}

export interface Device {
  id: string;
  /** 设备编号 */
  name: string;
  /** 设备类型 */
  type: string;
  /** 所属组织 */
  org: string;
}

export interface InviteCandidate {
  id: string;
  name: string;
  prefix: string;
  phone: string;
  email: string;
}

/** 本地存储结构（STORAGE_KEYS.userDemo） */
export interface UserDemoData {
  users: User[];
  invites: Invite[];
}

/** 主列表查询条件：空串表示不限 */
export interface UserQuery {
  query: string;
  org: string;
  role: string;
  scope: '' | DeviceScope;
}

/** 新增 / 编辑表单提交的字段 */
export interface UserInput {
  name: string;
  prefix: string;
  phone: string;
  email: string;
  orgs: string[];
  roles: string[];
  /** 业务职责多选的选中值（只保存第一个） */
  duties: string[];
}

/** 导入分配预览行 */
export interface AssignImportRow {
  user: string;
  org: string;
  model: string;
  code: string;
}

/* ---------------- 数据源 ---------------- */

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const now = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

/**
 * 读取演示数据：users、invites 都是数组时使用已保存的数据，否则用默认数据的深拷贝（不立即写回，首次修改时才写入）。
 */
function load(): UserDemoData {
  const d = readJSON<Partial<UserDemoData> | null>(STORAGE_KEYS.userDemo, null);
  if (d && Array.isArray(d.users) && Array.isArray(d.invites)) return d as UserDemoData;
  return clone(DEFAULT_USER_DATA);
}

let data: UserDemoData = load();

const save = () => writeJSON(STORAGE_KEYS.userDemo, data);
const findUser = (id: string) => data.users.find((u) => u.id === id);

/** 页面进入时重新读取本地存储（与原型「页面启动读取」一致） */
export function initUserStore(): void {
  data = load();
}

/* ---------------- 值集（原型代码常量） ---------------- */

export const getOrganizations = () => ORGANIZATIONS;
export const getRoles = () => ROLES;
export const getResponsibilities = () => RESPONSIBILITIES;
export const getDevices = () => DEVICES;

/** 设备范围由角色推导：含管理员 → 全部设备；否则含机手 → 个人设备；否则 → 组织+项目 */
export function deriveScope(roles: string[]): DeviceScope {
  if (roles.includes('管理员')) return '0';
  if (roles.includes('机手')) return '2';
  return '1';
}

/* ---------------- 用户 ---------------- */

function matches(u: User, q: UserQuery) {
  // 与原型一致：关键字不去首尾空格，姓名、手机号、邮箱以空格拼接后匹配（不含区号、用户名）
  const kw = q.query.toLowerCase();
  return (
    (!kw || [u.name, u.phone, u.email].join(' ').toLowerCase().includes(kw)) &&
    (!q.org || u.orgs.includes(q.org)) &&
    (!q.role || u.roles.includes(q.role)) &&
    (!q.scope || u.deviceScope === q.scope)
  );
}

export async function listUsers(query: UserQuery & PageQuery): Promise<PageResult<User>> {
  await delay(0);
  return clone(
    paginate(
      data.users.filter((u) => matches(u, query)),
      query,
    ),
  );
}

/** 全部用户（设备分配弹窗，不受主列表筛选影响） */
export async function listAllUsers(): Promise<User[]> {
  await delay(0);
  return clone(data.users);
}

export async function createUser(input: UserInput, forcePassword: boolean): Promise<void> {
  await delay(0);
  const user = makeUser(
    `u-${Date.now()}`,
    input.name,
    input.prefix,
    input.phone,
    input.email,
    input.orgs,
    input.roles,
    deriveScope(input.roles),
    input.duties[0] || '',
    now(),
    [],
  );
  // 初始密码本身不保存
  user.forcePassword = forcePassword;
  data.users.unshift(user);
  save();
}

/** 编辑：不改 created、forcePassword 和设备数据 */
export async function updateUser(id: string, input: UserInput): Promise<void> {
  await delay(0);
  const u = findUser(id);
  if (!u) return;
  Object.assign(u, {
    name: input.name,
    username: input.name,
    prefix: input.prefix,
    phone: input.phone,
    email: input.email,
    orgs: input.orgs,
    roles: input.roles,
    deviceScope: deriveScope(input.roles),
    responsibility: input.duties[0] || '',
  });
  save();
}

export async function deleteUser(id: string): Promise<void> {
  await delay(0);
  data.users = data.users.filter((u) => u.id !== id);
  save();
}

/** 重置密码：只记录时间，新密码不保存，不修改 forcePassword */
export async function resetUserPassword(id: string): Promise<void> {
  await delay(0);
  const u = findUser(id);
  if (!u) return;
  u.passwordUpdatedAt = now();
  save();
}

/* ---------------- 邀请 ---------------- */

/** 精确全等匹配手机号或邮箱（区号不参与） */
export async function findInviteCandidate(
  type: 'phone' | 'email',
  value: string,
): Promise<InviteCandidate | null> {
  await delay(0);
  const c = INVITE_CANDIDATES.find((x) => (type === 'phone' ? x.phone : x.email) === value);
  return c ? clone(c) : null;
}

export async function sendInvite(
  candidate: InviteCandidate,
  roles: string[],
  orgs: string[],
  remark: string,
): Promise<void> {
  await delay(0);
  data.invites.unshift({
    id: `inv-${Date.now()}`,
    user: candidate.name,
    contact: candidate.phone || candidate.email,
    roles,
    orgs,
    remark,
    inviter: INVITER,
    status: 'pending',
    time: now(),
  });
  save();
}

export async function listInvites(status: '' | InviteStatus): Promise<Invite[]> {
  await delay(0);
  return clone(data.invites.filter((i) => !status || i.status === status));
}

export async function cancelInvite(id: string): Promise<void> {
  await delay(0);
  const inv = data.invites.find((i) => i.id === id);
  if (!inv) return;
  inv.status = 'cancelled';
  save();
}

export async function reinvite(id: string): Promise<void> {
  await delay(0);
  const inv = data.invites.find((i) => i.id === id);
  if (!inv) return;
  inv.status = 'pending';
  inv.time = now();
  save();
}

/* ---------------- 导入 ---------------- */

/** 导入用户预览：原型不解析文件内容，固定生成 2 条 */
export async function previewUserImport(): Promise<User[]> {
  await delay(0);
  return makeImportSamples(Date.now(), now());
}

/** 保存导入：插到列表最前，不去重 */
export async function saveUserImport(rows: User[]): Promise<void> {
  await delay(0);
  data.users = clone(rows).concat(data.users);
  save();
}

/** 导入分配预览：原型不解析文件，取前 2 个用户依次配 DEVICES[i] */
export async function previewAssignImport(): Promise<AssignImportRow[]> {
  await delay(0);
  return data.users.slice(0, 2).map((u, i) => {
    const d = DEVICES[i % DEVICES.length];
    return { user: u.name, org: d.org, model: d.type, code: d.name };
  });
}

/** 保存导入分配：按姓名找第一个同名用户、按编号找设备，任一找不到则跳过；返回处理条数 */
export async function saveAssignImport(rows: AssignImportRow[]): Promise<number> {
  await delay(0);
  let done = 0;
  rows.forEach((r) => {
    const u = data.users.find((x) => x.name === r.user);
    const d = DEVICES.find((x) => x.name === r.code);
    if (!u || !d) return;
    if (!u.assignedDevices.includes(d.id)) u.assignedDevices.push(d.id);
    done++;
  });
  save();
  return done;
}

/* ---------------- 设备权限 ---------------- */

/** 批量设备分配：去重追加到 assignedDevices，不校验设备范围类型 */
export async function assignDevices(userIds: string[], deviceIds: string[]): Promise<void> {
  await delay(0);
  userIds.forEach((uid) => {
    const u = findUser(uid);
    if (!u) return;
    deviceIds.forEach((did) => {
      if (!u.assignedDevices.includes(did)) u.assignedDevices.push(did);
    });
  });
  save();
}

/** 个人设备：personalDevices = 草稿；assignedDevices 只并入不移除 */
export async function savePersonalDevices(userId: string, deviceIds: string[]): Promise<void> {
  await delay(0);
  const u = findUser(userId);
  if (!u) return;
  u.personalDevices = [...deviceIds];
  u.assignedDevices = Array.from(new Set((u.assignedDevices || []).concat(u.personalDevices)));
  save();
}
