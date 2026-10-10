import { COOKIES } from '@/mock/common/cookies';
import { STORAGE_KEYS, readJSON, writeJSON } from '@/utils/storage';

/**
 * 用户偏好设置（ms_settings）：Cookie 四个分类的启用状态 + 个性化广告开关。
 * 登录页的 Cookies 设置入口与工作台「设置」弹窗读写的是同一份数据。
 */

export type CookieCategoryKey = 'ckNecessary' | 'ckFunctional' | 'ckAnalytics' | 'ckAds';

export type CookieFlags = Record<CookieCategoryKey, boolean>;

export interface Settings extends CookieFlags {
  /** 个性化广告（工作台设置弹窗中的独立开关） */
  personalAds: boolean;
}

export interface CookieRow {
  name: string;
  /** 主机；「第一方 Cookie」同时作为分组名 */
  host: string;
  /** 持续时间 */
  dur: string;
  /** 第一方 / 第三者 */
  type: string;
  desc: string;
}

export const COOKIE_CATEGORY_KEYS: CookieCategoryKey[] = [
  'ckNecessary',
  'ckFunctional',
  'ckAnalytics',
  'ckAds',
];

export const DEFAULT_SETTINGS: Settings = {
  ckNecessary: true,
  ckFunctional: true,
  ckAnalytics: true,
  ckAds: false,
  personalAds: false,
};

/** 读取偏好；缺失字段用默认值补齐 */
export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...readJSON<Partial<Settings>>(STORAGE_KEYS.settings, {}) };
}

/** 写入偏好；必要类始终为开启 */
export function saveSettings(settings: Settings): void {
  writeJSON(STORAGE_KEYS.settings, { ...settings, ckNecessary: true });
}

/**
 * 只更新 Cookie 四个分类，其余字段保留已保存的值。
 * 修正原型缺陷：原型 Cookies 抽屉确认时会把设置弹窗里尚未保存的「个性化广告」一并写入。
 */
export function saveCookieFlags(flags: CookieFlags): Settings {
  const next = { ...loadSettings(), ...flags, ckNecessary: true };
  saveSettings(next);
  return next;
}

export function pickCookieFlags(settings: CookieFlags): CookieFlags {
  return Object.fromEntries(COOKIE_CATEGORY_KEYS.map((k) => [k, settings[k]])) as CookieFlags;
}

/** 已启用的分类数（必要类恒为启用，最小为 1） */
export function enabledCookieCount(settings: CookieFlags): number {
  return COOKIE_CATEGORY_KEYS.filter((k) => settings[k]).length;
}

export const COOKIE_CATEGORY_TOTAL = COOKIE_CATEGORY_KEYS.length;

/** 某个分类下的 Cookie 清单 */
export function listCookies(category: CookieCategoryKey): CookieRow[] {
  return COOKIES[category] ?? [];
}
