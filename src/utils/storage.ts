/**
 * 本地存储：所有 localStorage 键名集中在这里，页面和组件不要直接读写 localStorage。
 * 键名沿用旧版 HTML 原型，已有的本地偏好和演示数据升级后继续生效。
 * 读写失败（隐私模式、配额满）时静默降级，原型照常可用。
 */
export const STORAGE_KEYS = {
  /** 设置：Cookie 各分类开关 + 个性化广告（登录后「设置」弹窗读写） */
  settings: 'ms_settings',
  /** Cookie 同意横幅是否已做出过选择，'1' 表示已选择（不再弹出） */
  cookieConsent: 'ms_cookie_consent',
  /** 界面语言（登录页） */
  lang: 'mysany_lang',
  /** 侧栏是否折叠，'1' / '0' */
  siderCollapsed: 'ms_collapsed',
  /** 侧栏展开的分组 key 列表 */
  siderOpen: 'ms_open',
  /** 最后访问的菜单 key */
  route: 'ms_route',
  /** 已同意的协议版本（协议变更） */
  policyAgreedVersion: 'mysany.policy.agreedVersion',
  /** 租户管理演示数据 { tenant, authentications } */
  tenantDemo: 'ms_tenant_management_demo',
  /** 租户负责人用户 id：租户管理页写入，组织管理页只读（覆盖根组织负责人） */
  tenantOwnerId: 'ms_tenant_owner_id',
  /** 组织管理演示数据（组织树数组）；租户管理页转让负责人时会改写 [0].leaderId */
  orgDemo: 'ms_org_management_demo',
  /** 用户管理演示数据 { users, invites } */
  userDemo: 'ms_user_management_demo',
  /** 角色管理演示数据 Role[] */
  roleDemo: 'ms_role_management_demo',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export function readText(key: StorageKey): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeText(key: StorageKey, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* 忽略 */
  }
}

export function readJSON<T>(key: StorageKey, fallback: T): T {
  const raw = readText(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: StorageKey, value: unknown): void {
  writeText(key, JSON.stringify(value));
}

export function removeItem(key: StorageKey): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* 忽略 */
  }
}
