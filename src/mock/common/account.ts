import type { Profile } from '@/services/common/account';

/**
 * 当前登录用户的个人信息。
 * 按 2026-10-10 确认统一为企业租户账号 u0「5656」，字段取自原型 user-management.js 中的 u0；
 * 手机号按原型个人中心的显示方式脱敏（前 3 位 + **** + 后 4 位）。
 */
export const PROFILE: Profile = {
  id: 'u0',
  name: '5656',
  phone: '199****5566',
  email: 'iii@qq.com',
  role: '设备管理员',
  created: '2026-04-16 17:23:24',
  lastLogin: '-',
};
