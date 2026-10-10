/**
 * 全局常量：顶栏展示信息与当前登录用户（原型环境写死）。
 * 按 2026-10-10 确认，全站统一使用企业租户账号（原型企业服务各页的 u0「5656」/「2603181012测试客户」），
 * 不再使用原型工作台的个人租户「旺是旺旺的旺」。企业服务各页 mock 中的当前用户 id 均为 u0。
 */
export const APP_TITLE = 'MySANY';

export const LANGUAGE_OPTIONS = ['简体中文', 'English'];

export const CURRENT_USER = {
  id: 'u0',
  name: '5656',
  avatar: '🧑',
};

export interface TenantOption {
  name: string;
  type: string;
  current?: boolean;
}

export const TENANT_LIST: TenantOption[] = [
  { name: '2603181012测试客户', type: '企业租户', current: true },
];

export const CURRENT_TENANT = TENANT_LIST.find((t) => t.current) ?? TENANT_LIST[0];

/** 浏览器标签页标题：「页面名 - MySANY」 */
export const pageTitle = (name: string) => `${name} - ${APP_TITLE}`;
