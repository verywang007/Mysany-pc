import {
  CURRENT_USER_ID,
  DEFAULT_ORGS,
  DEVICE_IMPORT_TEMPLATE,
  ORG_DEVICES,
  ORG_USERS,
} from '@/mock/enterprise/organization';
import { delay } from '@/mock/utils';
import { readJSON, readText, STORAGE_KEYS, writeJSON } from '@/utils/storage';

/* ============================== 类型 ============================== */

export interface OrgUser {
  id: string;
  name: string;
  /** 缺失为 '-' */
  phone: string;
  /** 缺失为 '-' */
  email: string;
  roles: string[];
}

export interface OrgDevice {
  id: string;
  code: string;
  /** 设备类型中文名 */
  model: string;
}

export interface OrgMember {
  userId: string;
  /** YYYY-MM-DD */
  joined: string;
}

/**
 * 组织节点，结构与原型 localStorage['ms_org_management_demo'] 完全一致（租户管理页也读写它）。
 * 成员、设备只挂在各节点自身，不向上汇总。
 */
export interface OrgNode {
  id: string;
  name: string;
  /** 根为 '-' */
  code: string;
  /** 根为 null；与原型一致只写不读，查父节点用 findParent 遍历 */
  parentId: string | null;
  creatorId: string;
  leaderId: string;
  /** 空描述存为 '-' */
  description: string;
  /** 仅根节点为 true */
  root?: true;
  members: OrgMember[];
  /** 本组织直接拥有的设备 id */
  devices: string[];
  /** 设备分配时间 YYYY-MM-DD */
  deviceDates: Record<string, string>;
  children: OrgNode[];
}

/** 成员列表行 */
export interface MemberRow extends OrgUser {
  joined: string;
}

/**
 * 设备列表行。设备为**多归属**：同一台设备可同时挂到多个组织，
 * orgId / orgName / allocated 取深度优先第一个归属（主归属），orgIds / orgNames 为全部归属。
 */
export interface DeviceRow extends OrgDevice {
  /** 分配时间（主归属），未分配为 '-' */
  allocated: string;
  /** 主归属组织 id，未分配为 '' */
  orgId: string;
  /** 主归属组织名称，未分配为 '-' */
  orgName: string;
  /** 全部归属组织 id，未分配为 [] */
  orgIds: string[];
  /** 全部归属组织名称，未分配为 [] */
  orgNames: string[];
}

/** 深度优先展开的组织选项（含根） */
export interface OrgOption {
  id: string;
  name: string;
  depth: number;
  root: boolean;
}

/** 导入校验结果行 */
export interface ImportRow {
  code: string;
  orgName: string;
}

export interface OrgFormValues {
  name: string;
  description: string;
}

/* ============================== 纯查询（基于传入的组织树） ============================== */

export const CURRENT_ORG_USER_ID = CURRENT_USER_ID;

export const listOrgUsers = (): OrgUser[] => ORG_USERS;
export const listOrgDevices = (): OrgDevice[] => ORG_DEVICES;
export const findUser = (id: string | undefined) => ORG_USERS.find((u) => u.id === id);
export const findDevice = (id: string) => ORG_DEVICES.find((d) => d.id === id);

export function findNode(tree: OrgNode[], id: string): OrgNode | null {
  for (const n of tree) {
    if (n.id === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return null;
}

export function findParent(
  tree: OrgNode[],
  id: string,
  parent: OrgNode | null = null,
): OrgNode | null {
  for (const n of tree) {
    if (n.id === id) return parent;
    const found = findParent(n.children, id, n);
    if (found) return found;
  }
  return null;
}

/** 负责人：leaderId → creatorId → 当前用户 u0 */
export const ownerUser = (node: OrgNode): OrgUser | undefined =>
  findUser(node.leaderId) ?? findUser(node.creatorId) ?? findUser(CURRENT_USER_ID);

/** 设备的全部所属组织：深度优先收集所有 devices 含该 id 的节点（多归属） */
export function deviceOwners(tree: OrgNode[], deviceId: string): OrgNode[] {
  const out: OrgNode[] = [];
  const walk = (nodes: OrgNode[]) =>
    nodes.forEach((n) => {
      if (n.devices.includes(deviceId)) out.push(n);
      walk(n.children);
    });
  walk(tree);
  return out;
}

/** 设备主归属组织：多归属时取深度优先第一个（兼容单值展示与旧判断） */
export function deviceOwner(tree: OrgNode[], deviceId: string): OrgNode | null {
  return deviceOwners(tree, deviceId)[0] ?? null;
}

export function orgOptions(tree: OrgNode[]): OrgOption[] {
  const out: OrgOption[] = [];
  const walk = (nodes: OrgNode[], depth: number) =>
    nodes.forEach((n) => {
      out.push({ id: n.id, name: n.name, depth, root: !!n.root });
      walk(n.children, depth + 1);
    });
  walk(tree, 0);
  return out;
}

/** 成员按数组顺序映射用户，找不到的用户被过滤 */
export function memberRows(node: OrgNode): MemberRow[] {
  return node.members.flatMap((m) => {
    const u = findUser(m.userId);
    return u ? [{ ...u, joined: m.joined }] : [];
  });
}

const toDeviceRow = (tree: OrgNode[], d: OrgDevice): DeviceRow => {
  const owners = deviceOwners(tree, d.id);
  const first = owners[0];
  return {
    ...d,
    allocated: first ? (first.deviceDates[d.id] ?? '-') : '-',
    orgId: first ? first.id : '',
    orgName: first ? first.name : '-',
    orgIds: owners.map((n) => n.id),
    orgNames: owners.map((n) => n.name),
  };
};

/** 根组织为租户全局视图，展示全部设备（含未分配）；子组织展示本组织已分配设备（按分配顺序） */
export function deviceRows(tree: OrgNode[], node: OrgNode): DeviceRow[] {
  const devices = node.root
    ? ORG_DEVICES
    : node.devices.flatMap((id) => {
        const d = findDevice(id);
        return d ? [d] : [];
      });
  return devices.map((d) => toDeviceRow(tree, d));
}

/** 全部设备及当前归属（根组织两步向导第 2 步） */
export const allDeviceRows = (tree: OrgNode[]): DeviceRow[] =>
  ORG_DEVICES.map((d) => toDeviceRow(tree, d));

/** 子组织「分配设备」候选：未分配给任何组织的设备（多归属下即没有任何归属） */
export const unassignedDevices = (tree: OrgNode[]): OrgDevice[] =>
  ORG_DEVICES.filter((d) => deviceOwners(tree, d.id).length === 0);

/** 删除前的拦截，按顺序命中一条即返回提示文案 */
export function deleteBlockReason(node: OrgNode): string | null {
  if (node.children.length) return '请先删除该组织下的下级组织';
  if (node.members.length) return '请先移除该组织下的成员';
  if (node.devices.length) return '请先取消该组织下的设备分配';
  return null;
}

/** 浏览器本地日期 YYYY-MM-DD */
export function today(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

/**
 * 导入校验结果（原型仅做本地演示，不解析真实文件）：
 * 取当前未分配设备的前 3 台（一台都没有则取全部设备前 3 台），所属组织轮流取非根组织（没有则用全部组织）。
 */
export function buildImportPreview(tree: OrgNode[]): ImportRow[] {
  const all = orgOptions(tree);
  const nonRoot = all.filter((o) => !o.root);
  const hosts = nonRoot.length ? nonRoot : all;
  const free = unassignedDevices(tree);
  const pool = free.length ? free : ORG_DEVICES.slice(0, 3);
  return pool.slice(0, 3).map((d, i) => ({ code: d.code, orgName: hosts[i % hosts.length].name }));
}

export const deviceImportTemplate = () => DEVICE_IMPORT_TEMPLATE;

/* ============================== 加载与持久化 ============================== */

/**
 * 递归补全缺省字段；根节点负责人在 ms_tenant_owner_id 有值时被它覆盖（本页只读该键，从不写）。
 */
function normalize(nodes: OrgNode[], ownerId: string | null): OrgNode[] {
  nodes.forEach((node) => {
    node.children = node.children || [];
    node.members = node.members || [];
    node.devices = node.devices || [];
    node.deviceDates = node.deviceDates || {};
    if (!node.creatorId)
      node.creatorId = node.root ? CURRENT_USER_ID : node.leaderId || CURRENT_USER_ID;
    if (!node.leaderId) node.leaderId = node.creatorId;
    if (node.root && ownerId) node.leaderId = ownerId;
    normalize(node.children, ownerId);
  });
  return nodes;
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/** 当前组织树（内存），每次进入页面时从本地存储重新读取 */
let cache: OrgNode[] | null = null;

function load(): OrgNode[] {
  const saved = readJSON<unknown>(STORAGE_KEYS.orgDemo, null);
  const base = Array.isArray(saved) && saved.length ? (saved as OrgNode[]) : clone(DEFAULT_ORGS);
  return normalize(base, readText(STORAGE_KEYS.tenantOwnerId));
}

/**
 * 读取组织树：本地存储为非空数组时使用它，否则（不存在 / 空数组 / 解析失败）用默认数据。
 * 与原型一致，加载时不写回；没有重置入口，删除该键（或写入空数组）后刷新即恢复默认。
 */
export async function getOrganizations(): Promise<OrgNode[]> {
  await delay(0);
  cache = load();
  return cache;
}

/** 在副本上修改、整树写入本地存储，返回新树（引用变化便于页面重渲染） */
async function mutate<R>(fn: (tree: OrgNode[]) => R): Promise<{ tree: OrgNode[]; result: R }> {
  await delay(0);
  const tree = clone(cache ?? load());
  const result = fn(tree);
  writeJSON(STORAGE_KEYS.orgDemo, tree);
  cache = tree;
  return { tree, result };
}

const mustFind = (tree: OrgNode[], id: string) => {
  const n = findNode(tree, id);
  if (!n) throw new Error(`组织不存在：${id}`);
  return n;
};

/**
 * 多归属：把设备加入目标组织，**不清除**它在其他组织的归属；已存在则只刷新日期。
 * 因此「分配」= 增加归属，「取消分配」= 移除归属，两者互为逆操作（原「转移」语义取消）。
 */
function assignTo(node: OrgNode, ids: string[]) {
  ids.forEach((id) => {
    if (!node.devices.includes(id)) node.devices.push(id);
    node.deviceDates[id] = today();
  });
}

/** 创建子组织：创建者（当前用户）自动担任负责人，但不会被加入成员列表；追加到父节点末尾 */
export function createOrganization(parentId: string, values: OrgFormValues) {
  return mutate((tree) => {
    const parent = mustFind(tree, parentId);
    const stamp = Date.now().toString();
    const child: OrgNode = {
      id: `org-${stamp}`,
      name: values.name,
      code: `MYSANY${today().replace(/-/g, '')}${stamp.slice(-6)}`,
      parentId: parent.id,
      creatorId: CURRENT_USER_ID,
      leaderId: CURRENT_USER_ID,
      description: values.description || '-',
      members: [],
      devices: [],
      deviceDates: {},
      children: [],
    };
    parent.children.push(child);
    return child.id;
  });
}

export function updateOrganization(id: string, values: OrgFormValues) {
  return mutate((tree) => {
    const node = mustFind(tree, id);
    node.name = values.name;
    node.description = values.description || '-';
  });
}

/** 删除组织，返回其父节点 id（根组织不可删除） */
export function deleteOrganization(id: string) {
  return mutate((tree) => {
    const parent = findParent(tree, id);
    if (!parent) return null;
    parent.children = parent.children.filter((c) => c.id !== id);
    return parent.id;
  });
}

export function addMembers(orgId: string, userIds: string[]) {
  return mutate((tree) => {
    const node = mustFind(tree, orgId);
    userIds.forEach((userId) => node.members.push({ userId, joined: today() }));
  });
}

/** 移除成员：负责人也可移除，无任何拦截（与原型一致） */
export function removeMembers(orgId: string, userIds: string[]) {
  return mutate((tree) => {
    const node = mustFind(tree, orgId);
    node.members = node.members.filter((m) => !userIds.includes(m.userId));
  });
}

/**
 * 分配到多个组织：同一批设备同时挂到每个目标组织（多归属，不清除其他归属）。
 * 单选场景传一个 id 即可，行为与之前「分配到目标组织」一致，只是不再转移。
 */
export function assignDevices(orgIds: string[], deviceIds: string[]) {
  return mutate((tree) => {
    orgIds.forEach((orgId) => assignTo(mustFind(tree, orgId), deviceIds));
  });
}

/**
 * 取消分配：
 * - 不传 orgId：从设备的**全部**所属组织移除（彻底取消，用于根组织全局视图）
 * - 传 orgId：只从该组织移除，保留设备在其他组织的归属（用于子组织视图内取消）
 */
export function unassignDevices(deviceIds: string[], orgId?: string) {
  return mutate((tree) => {
    deviceIds.forEach((id) => {
      const owners = orgId ? [mustFind(tree, orgId)] : deviceOwners(tree, id);
      owners.forEach((owner) => {
        if (!owner?.devices.includes(id)) return;
        owner.devices = owner.devices.filter((x) => x !== id);
        delete owner.deviceDates[id];
      });
    });
  });
}

/** 保存导入：按设备编号找设备、按名称找第一个同名组织，找到则分配；返回成功台数 */
export function importDevices(rows: ImportRow[]) {
  return mutate((tree) => {
    let done = 0;
    rows.forEach((r) => {
      const device = ORG_DEVICES.find((d) => d.code === r.code);
      const hostId = orgOptions(tree).find((o) => o.name === r.orgName)?.id;
      const host = hostId ? findNode(tree, hostId) : null;
      if (!device || !host) return;
      assignTo(host, [device.id]);
      done++;
    });
    return done;
  });
}
