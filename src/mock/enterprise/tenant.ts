import type {
  AuthRecord,
  CustomerInfo,
  TenantDemo,
  TenantUser,
} from '@/services/enterprise/tenant';

/**
 * 租户管理样本数据，取自原型 tenant-management.js 的 TENANT_USERS / DEFAULT_DATA / VERIFY_CUSTOMERS。
 */

/** 租户负责人候选（10 人，无 u6、u8、u9，与原型一致） */
export const TENANT_USERS: TenantUser[] = [
  { id: 'u0', name: '5656', phone: '19955665566' },
  { id: 'u1', name: '大红', phone: '1666666' },
  { id: 'u2', name: '杨大明', phone: '15673290484' },
  { id: 'u3', name: '大绿', phone: '1777777' },
  { id: 'u4', name: '测试用户导入1昵称', phone: '17610001111' },
  { id: 'u5', name: '测试aaa', phone: '176734561122' },
  { id: 'u7', name: '测试手机用户abc1', phone: '17673451222' },
  { id: 'u10', name: '大紫', phone: '1565656' },
  { id: 'u11', name: '设备管理员', phone: '13800138000' },
  { id: 'u12', name: '安全主管', phone: '13900139000' },
];

const DEFAULT_AUTH: AuthRecord = {
  id: 'auth-1',
  customerName: 'EDIFICE ENGINEERING ENTERPRISE PVT. LTD',
  customerCode: '0214007279',
  customerCategory: '公司',
  customerClassification: '三一终端客户',
  country: '印度',
  phone: '-',
  email: '-',
  address: '-',
  creationDate: '2026-07-01 22:59:05',
};

/** 本页默认数据（未写入存储前使用） */
export const DEFAULT_TENANT_DEMO: TenantDemo = {
  tenant: {
    tenantType: '企业客户',
    contactName: '2603181012测试客户1212',
    customerCode: '0214006482',
    phoneCountryCode: '385',
    contactPhone: '93101803',
    companyName: '2603181012测试客户',
    contactEmail: '9310180326icsoi@test.com',
    registrationNo: '1666',
    address: '2603181012测试客户详细地址',
    activationTime: '2026-04-16 09:32:49',
    orgCount: 4,
    userCount: 12,
    deviceCount: 233,
    ownerId: 'u0',
  },
  authentications: [DEFAULT_AUTH],
};

/** 模拟 D365 客户查询：以客户编码为 key；0214007279 为默认认证记录的拷贝（含 id、creationDate） */
export const VERIFY_CUSTOMERS: Record<string, CustomerInfo> = {
  '0214007279': { ...DEFAULT_AUTH },
  '0214009001': {
    customerName: '三一示例工程有限公司',
    customerCode: '0214009001',
    customerCategory: '公司',
    customerClassification: '三一终端客户',
    country: '中国',
    phone: '+86 13800138000',
    email: 'demo@sany.com.cn',
    address: '湖南省长沙市经济技术开发区',
  },
  '0214008008': {
    customerName: 'GLOBAL INFRA EQUIPMENT LTD.',
    customerCode: '0214008008',
    customerCategory: '公司',
    customerClassification: '三一海外客户',
    country: '印度尼西亚',
    phone: '+62 8123456789',
    email: 'contact@globalinfra.example',
    address: 'Jakarta, Indonesia',
  },
};
