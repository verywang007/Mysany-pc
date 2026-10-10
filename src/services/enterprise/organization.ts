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

/** 设备列表行：所属组织为深度优先第一个持有该设备的组织 */
export interface DeviceRow extends OrgDevice {
  /** 分配时间，未分配为 '-' */
  allocated: string;
  /** 所属组织 id，未分配为 '' */
  orgId: string;
  /** 所属组织名称，未分配为 '-' */
  orgName: string;
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

/** 设备所属组织：深度优先找到的第一个 devices 含该 id 的节点 */
export function deviceOwner(tree: OrgNode[], deviceId: string): OrgNode | null {
  for (const n of tree) {
    if (n.devices.includes(deviceId)) return n;
    const found = deviceOwner(n.children, deviceId);
    if (found) return found;
  }
  return null;
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
  const owner = deviceOwner(tree, d.id);
  return {
    ...d,
    allocated: owner ? (owner.deviceDates[d.id] ?? '-') : '-',
    orgId: owner ? owner.id : '',
    orgName: owner ? owner.name : '-',
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

/** 子组织「分配设备」候选：未分配给任何组织的设备 */
export const unassignedDevices = (tree: OrgNode[]): OrgDevice[] =>
  ORG_DEVICES.filter((d) => !deviceOwner(tree, d.id));

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

/** 已属于其他组织的设备先从原组织移除（含日期），再加入目标；日期一律刷新为今天 */
function assignTo(tree: OrgNode[], node: OrgNode, ids: string[]) {
  ids.forEach((id) => {
    const owner = deviceOwner(tree, id);
    if (owner && owner.id !== node.id) {
      owner.devices = owner.devices.filter((x) => x !== id);
      delete owner.deviceDates[id];
    }
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

export function assignDevices(orgId: string, deviceIds: string[]) {
  return mutate((tree) => assignTo(tree, mustFind(tree, orgId), deviceIds));
}

/** 取消分配：从设备实际所属组织移除（根视图同样按实际所属） */
export function unassignDevices(deviceIds: string[]) {
  return mutate((tree) => {
    deviceIds.forEach((id) => {
      const owner = deviceOwner(tree, id);
      if (!owner) return;
      owner.devices = owner.devices.filter((x) => x !== id);
      delete owner.deviceDates[id];
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
      assignTo(tree, host, [device.id]);
      done++;
    });
    return done;
  });
}
