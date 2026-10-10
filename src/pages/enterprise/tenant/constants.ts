import type { ThemeConfig } from 'antd';
import { colors } from '@/theme';
import { tenantColors } from '@/theme/pages/tenant';
import type { CustomerInfo } from '@/services/enterprise/tenant';

export type TenantTab = 'tenant' | 'auth';

export const TENANT_TABS: { key: TenantTab; label: string }[] = [
  { key: 'tenant', label: '租户管理' },
  { key: 'auth', label: '客户认证' },
];

/** 联系人手机号区号（value 不带 +） */
export const PHONE_CODE_OPTIONS = [
  { value: '86', label: '+86 中国' },
  { value: '385', label: '+385 克罗地亚' },
  { value: '62', label: '+62 印度尼西亚' },
  { value: '91', label: '+91 印度' },
];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PAGE_SIZE_OPTIONS = [10, 20, 50];

/** 客户信息卡 / 详情卡字段（验证结果与详情共用） */
export const CUSTOMER_FIELDS: { label: string; key: keyof CustomerInfo }[] = [
  { label: '客户名称', key: 'customerName' },
  { label: '客户编码', key: 'customerCode' },
  { label: '客户类别', key: 'customerCategory' },
  { label: '客户分类', key: 'customerClassification' },
  { label: '国家/地区', key: 'country' },
  { label: '电话', key: 'phone' },
  { label: '邮箱', key: 'email' },
  { label: '地址', key: 'address' },
];

/** 弹窗宽度（原型 .tn-modal 及各修饰类） */
export const MODAL_WIDTH = { default: 600, editContact: 540, detail: 640, delete: 420 };

/**
 * 本页控件尺寸（原型 .tn-btn 高 34 / 圆角 3；弹窗输入框、下拉高 36 / 圆角 4；分页按钮 30）。
 * primary 悬停取原型的深红 #a90009。
 */
export const TENANT_THEME: ThemeConfig = {
  components: {
    Button: {
      controlHeight: 34,
      borderRadius: 3,
      paddingInline: 17,
      colorBorder: tenantColors.btnBorder,
      colorText: tenantColors.btnText,
      colorPrimaryHover: colors.primaryHover,
      colorPrimaryActive: colors.primaryHover,
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
    },
    Input: {
      controlHeight: 36,
      borderRadius: 4,
      colorBorder: tenantColors.fieldBorder,
      colorText: tenantColors.fieldText,
      activeShadow: `0 0 0 2px ${tenantColors.focusRing}`,
      errorActiveShadow: 'none',
    },
    Select: {
      controlHeight: 36,
      borderRadius: 4,
      colorBorder: tenantColors.fieldBorder,
      colorText: tenantColors.fieldText,
      activeOutlineColor: tenantColors.focusRing,
    },
    Pagination: {
      itemSize: 30,
      borderRadius: 4,
    },
  },
};

/** 删除按钮（原型 .tn-btn.danger #ef4450） */
export const DANGER_THEME: ThemeConfig = { token: { colorError: tenantColors.danger } };
