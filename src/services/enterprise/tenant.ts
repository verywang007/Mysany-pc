import dayjs from 'dayjs';
import { DEFAULT_TENANT_DEMO, TENANT_USERS, VERIFY_CUSTOMERS } from '@/mock/enterprise/tenant';
import { delay, paginate } from '@/mock/utils';
import type { PageQuery, PageResult } from '@/types/common';
import { STORAGE_KEYS, readJSON, readText, writeJSON, writeText } from '@/utils/storage';

export interface TenantInfo {
  tenantType: string;
  contactName: string;
  customerCode: string;
  /** 区号，不带 +，如 '385' */
  phoneCountryCode: string;
  contactPhone: string;
  companyName: string;
  contactEmail: string;
  registrationNo: string;
  address: string;
  activationTime: string;
  /** 以下三项是存储中的静态字段，不随组织 / 用户 / 设备实际数量变化（与原型一致） */
  orgCount: number;
  userCount: number;
  deviceCount: number;
  /** 租户负责人用户 id */
  ownerId: string;
}

/** D365 查询到的客户信息 */
export interface CustomerInfo {
  customerName: string;
  customerCode: string;
  customerCategory: string;
  customerClassification: string;
  country: string;
  phone: string;
  email: string;
  address: string;
}

/** 已认证的客户编码 */
export interface AuthRecord extends CustomerInfo {
  id: string;
  /** 认证时间 YYYY-MM-DD HH:mm:ss */
  creationDate: string;
}

export interface TenantUser {
  id: string;
  name: string;
  phone: string;
}

/** 存储结构 ms_tenant_management_demo */
export interface TenantDemo {
  tenant: TenantInfo;
  authentications: AuthRecord[];
}

export type ContactForm = Pick<
  TenantInfo,
  'contactName' | 'phoneCountryCode' | 'contactPhone' | 'contactEmail'
>;

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/** 组织管理数据 [0].leaderId（原型 rootOwnerFromOrganization） */
function rootOwnerFromOrganization(): string {
  const orgs = readJSON<unknown>(STORAGE_KEYS.orgDemo, null);
  if (!Array.isArray(orgs) || !orgs[0] || typeof orgs[0] !== 'object') return '';
  const leaderId = (orgs[0] as { leaderId?: unknown }).leaderId;
  return typeof leaderId === 'string' ? leaderId : '';
}

const fallbackOwnerId = () => readText(STORAGE_KEYS.tenantOwnerId) || rootOwnerFromOrganization();

function isTenantDemo(v: unknown): v is TenantDemo {
  if (!v || typeof v !== 'object') return false;
  const d = v as Partial<TenantDemo>;
  return !!d.tenant && typeof d.tenant === 'object' && Array.isArray(d.authentications);
}

/** 原型 loadData()：本页已保存过数据时以存储中的 ownerId 为准 */
function loadData(): TenantDemo {
  const saved = readJSON<unknown>(STORAGE_KEYS.tenantDemo, null);
  if (isTenantDemo(saved)) {
    if (!saved.tenant.ownerId) saved.tenant.ownerId = fallbackOwnerId() || 'u0';
    return saved;
  }
  const data = clone(DEFAULT_TENANT_DEMO);
  data.tenant.ownerId = fallbackOwnerId() || data.tenant.ownerId;
  return data;
}

/** 本页内存数据（对应原型 state.data），每次进入页面由 loadTenantDemo 重新读取 */
let current: TenantDemo | null = null;

const data = (): TenantDemo => {
  if (!current) current = loadData();
  return current;
};

const save = () => writeJSON(STORAGE_KEYS.tenantDemo, data());

/** 写 ms_tenant_owner_id；组织数据已存在且为非空数组时改写 [0].leaderId（原型 syncRootOwner） */
function syncRootOwner(ownerId: string) {
  writeText(STORAGE_KEYS.tenantOwnerId, ownerId);
  const orgs = readJSON<unknown>(STORAGE_KEYS.orgDemo, null);
  if (Array.isArray(orgs) && orgs[0] && typeof orgs[0] === 'object') {
    (orgs[0] as { leaderId?: string }).leaderId = ownerId;
    writeJSON(STORAGE_KEYS.orgDemo, orgs);
  }
}

/**
 * 进入页面时调用：读取本页数据，并把当前负责人写入 ms_tenant_owner_id（组织管理页会读取）。
 * 默认数据不写入 ms_tenant_management_demo，直到第一次保存。
 */
export async function loadTenantDemo(): Promise<TenantInfo> {
  await delay(0);
  current = loadData();
  writeText(STORAGE_KEYS.tenantOwnerId, current.tenant.ownerId || 'u0');
  return { ...current.tenant };
}

export const listTenantUsers = (): TenantUser[] => TENANT_USERS;

/** 找不到时回退为第一个用户（5656），与原型一致 */
export const findTenantUser = (id: string): TenantUser =>
  TENANT_USERS.find((u) => u.id === id) ?? TENANT_USERS[0];

export async function saveContact(form: ContactForm): Promise<TenantInfo> {
  await delay(0);
  Object.assign(data().tenant, form);
  save();
  return { ...data().tenant };
}

/** 转让租户负责人：保存本页数据并同步根组织负责人 */
export async function transferOwner(ownerId: string): Promise<TenantInfo> {
  await delay(0);
  data().tenant.ownerId = ownerId;
  save();
  syncRootOwner(ownerId);
  return { ...data().tenant };
}

/** 客户认证列表：按数组顺序（新认证在最前） */
export async function listAuthentications(query: PageQuery): Promise<PageResult<AuthRecord>> {
  await delay(0);
  return paginate(data().authentications, query);
}

export const getAuthentication = (id: string): AuthRecord | undefined =>
  data().authentications.find((a) => a.id === id);

/** 模拟 D365 查询：查不到返回 null；不检查是否已认证 */
export async function verifyCustomerCode(code: string): Promise<CustomerInfo | null> {
  await delay(0);
  const hit = VERIFY_CUSTOMERS[code];
  return hit ? clone(hit) : null;
}

export const isAuthenticated = (code: string) =>
  data().authentications.some((a) => a.customerCode === code);

export async function addAuthentication(customer: CustomerInfo): Promise<AuthRecord> {
  await delay(0);
  const record: AuthRecord = {
    ...clone(customer),
    id: `auth-${Date.now()}`,
    creationDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  };
  data().authentications.unshift(record);
  save();
  return record;
}

export async function deleteAuthentication(id: string): Promise<void> {
  await delay(0);
  const d = data();
  d.authentications = d.authentications.filter((a) => a.id !== id);
  save();
}
