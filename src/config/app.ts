/** 全局常量：顶栏展示信息与当前登录用户（原型环境写死，取自原型 data.js） */
export const APP_TITLE = 'MySANY';

export const LANGUAGE_OPTIONS = ['简体中文', 'English'];

export const CURRENT_USER = {
  name: '旺是旺旺的旺',
  avatar: '🧑',
};

export interface TenantOption {
  name: string;
  type: string;
  current?: boolean;
}

export const TENANT_LIST: TenantOption[] = [
  { name: '旺是旺旺的旺', type: '个人租户', current: true },
];

export const CURRENT_TENANT = TENANT_LIST.find((t) => t.current) ?? TENANT_LIST[0];

/** 浏览器标签页标题：「页面名 - MySANY」 */
export const pageTitle = (name: string) => `${name} - ${APP_TITLE}`;
