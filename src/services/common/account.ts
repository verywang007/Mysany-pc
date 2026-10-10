import { useSyncExternalStore } from 'react';
import { CURRENT_TENANT, TENANT_LIST } from '@/config/app';
import { PROFILE } from '@/mock/common/account';

export interface Profile {
  id: string;
  name: string;
  /** 脱敏后的手机号 */
  phone: string;
  email: string;
  /** 业务职责（自由文本） */
  role: string;
  /** 账号创建时间 YYYY-MM-DD HH:mm:ss */
  created: string;
  /** 最后登录时间，无值为 '-' */
  lastLogin: string;
}

/**
 * 当前用户信息的内存数据源：个人中心修改后，顶栏用户名、工作台问候语同步更新。
 * 与原型一致只存在内存中，刷新后恢复初始值。
 */
let profile: Profile = { ...PROFILE };
const listeners = new Set<() => void>();

function emit(next: Profile) {
  profile = next;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** 订阅当前用户信息 */
export function useProfile(): Profile {
  return useSyncExternalStore(subscribe, () => profile);
}

export function updateProfile(patch: Partial<Omit<Profile, 'id'>>): Profile {
  emit({ ...profile, ...patch });
  return profile;
}

/** 手机号脱敏：13812345678 → 138****5678 */
export const maskPhone = (v: string) => `${v.slice(0, 3)}****${v.slice(7)}`;

export const getCurrentTenant = () => CURRENT_TENANT;
export const listTenants = () => TENANT_LIST;
