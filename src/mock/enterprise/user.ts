import type {
  Device,
  DeviceScope,
  InviteCandidate,
  User,
  UserDemoData,
} from '@/services/enterprise/user';

/**
 * 企业服务 › 用户管理 样本数据，取自原型 user-management.js 的常量与 DEFAULT_DATA。
 * 组织、角色、业务职责、设备、邀请候选人均为常量，不持久化；用户与邀请记录见 services 的本地存储。
 */

export const ORGANIZATIONS = ['2603181012测试客户', '测试组织1', '测试组织2', 'aa'];

export const ROLES = ['管理员', '车队长', '维修工', '机手'];

export const RESPONSIBILITIES = [
  'Equipment Manager',
  'Service Technician',
  'Equipment Owner',
  '设备管理员',
];

export const DEVICES: Device[] = [
  { id: 'd1', name: 'SY007CBHC0908', type: '挖掘机', org: '测试组织1' },
  { id: 'd2', name: 'HPGJ1041000683', type: '搅拌车', org: '2603181012测试客户' },
  { id: 'd3', name: 'AC0130CD0002', type: '全路面起重机', org: '2603181012测试客户' },
  { id: 'd4', name: 'TNEST202607232146', type: '搅拌车', org: '测试组织2' },
  { id: 'd5', name: 'SFT0200CD1135', type: '塔机', org: 'aa' },
  { id: 'd6', name: 'SY013NCC18558', type: '挖掘机', org: '测试组织1' },
  { id: 'd7', name: 'SR285CCF19518', type: '旋挖钻机', org: '2603181012测试客户' },
  { id: 'd8', name: 'TH1056CC0001', type: '伸缩臂叉车', org: '测试组织2' },
  { id: 'd9', name: 'SY036BBG15578', type: '挖掘机', org: 'aa' },
  { id: 'd10', name: 'KT090SE20279', type: '矿用宽体自卸车', org: '2603181012测试客户' },
  { id: 'd11', name: 'SW956E9CFB678', type: '电动装载机', org: '测试组织1' },
  { id: 'd12', name: 'SYM5350THB', type: '泵车', org: '2603181012测试客户' },
];

export const INVITE_CANDIDATES: InviteCandidate[] = [
  { id: 'c1', name: '陈凯歌', prefix: '+86', phone: '13341312180', email: 'chenk@example.com' },
  { id: 'c2', name: '李晓明', prefix: '+86', phone: '18800188000', email: 'invite@example.com' },
];

/** 邀请人：原型写死为当前登录用户的姓名 */
export const INVITER = '5656';

/** 原型的工厂函数 U()：username 恒等于 name；个人设备用户的 personalDevices 取 devices 的第 1 个 */
export function makeUser(
  id: string,
  name: string,
  prefix: string,
  phone: string,
  email: string,
  orgs: string[],
  roles: string[],
  scope: DeviceScope,
  duty: string,
  created: string,
  devices: string[] = [],
): User {
  return {
    id,
    name,
    prefix,
    phone,
    email,
    username: name,
    orgs,
    roles,
    deviceScope: scope,
    responsibility: duty,
    created,
    assignedDevices: devices,
    personalDevices: scope === '2' ? devices.slice(0, 1) : [],
    forcePassword: false,
  };
}

const ORG0 = '2603181012测试客户';

export const DEFAULT_USER_DATA: UserDemoData = {
  users: [
    makeUser(
      'u9',
      'xhh',
      '',
      '',
      'xhh@qq.com',
      [ORG0],
      ['管理员'],
      '0',
      '',
      '2026-05-14 09:15:18',
      ['d2', 'd3'],
    ),
    makeUser(
      'u8',
      '测试邮箱用户abc1',
      '',
      '',
      '847189223@qq.com',
      [ORG0],
      ['管理员'],
      '0',
      'Equipment Manager',
      '2026-05-09 19:51:51',
      ['d1', 'd2'],
    ),
    makeUser(
      'u7',
      '测试手机用户abc1',
      '+86',
      '17673451222',
      '847189111@qq.com',
      [ORG0],
      ['管理员'],
      '0',
      'Equipment Manager',
      '2026-05-09 19:51:50',
      ['d3'],
    ),
    makeUser(
      'u6',
      '测试手动新增邮箱用户45665',
      '',
      '',
      '84715555@qq.com',
      [ORG0],
      ['车队长'],
      '1',
      '',
      '2026-05-09 19:21:28',
      ['d4'],
    ),
    makeUser(
      'u5',
      '测试aaa',
      '+86',
      '176734561122',
      '',
      [ORG0],
      ['车队长'],
      '1',
      '',
      '2026-05-09 16:40:48',
      ['d5'],
    ),
    makeUser(
      'u4',
      '测试用户导入1昵称',
      '+49',
      '17610001111',
      '',
      [ORG0, 'aa'],
      ['维修工'],
      '1',
      'Service Technician',
      '2026-05-08 17:43:35',
      ['d6'],
    ),
    makeUser(
      'u2',
      '杨大明',
      '+86',
      '15673290484',
      '',
      ['测试组织1'],
      ['管理员'],
      '0',
      'Equipment Owner',
      '2026-04-28 17:15:00',
      ['d1', 'd6'],
    ),
    makeUser(
      'u3',
      '大绿',
      '+62',
      '1777777',
      '',
      [ORG0],
      ['维修工'],
      '1',
      '',
      '2026-04-16 17:58:23',
      ['d2'],
    ),
    makeUser(
      'u1',
      '大红',
      '+66',
      '1666666',
      '',
      ['测试组织1'],
      ['维修工'],
      '1',
      '',
      '2026-04-16 17:54:56',
      ['d1'],
    ),
    makeUser(
      'u10',
      '大紫',
      '+65',
      '1565656',
      '',
      ['测试组织2'],
      ['机手'],
      '2',
      '',
      '2026-04-16 17:51:31',
      ['d4', 'd8'],
    ),
    makeUser(
      'u0',
      '5656',
      '+86',
      '19955665566',
      'iii@qq.com',
      [ORG0],
      ['管理员'],
      '0',
      '设备管理员',
      '2026-04-16 17:23:24',
      ['d1', 'd2', 'd3'],
    ),
    makeUser(
      'u12',
      '测试设备用户',
      '+86',
      '13800138000',
      'device@test.com',
      [ORG0],
      ['机手'],
      '2',
      'Equipment Manager',
      '2026-04-16 16:30:00',
      ['d7'],
    ),
  ],
  invites: [],
};

/** 导入用户：原型不解析文件，选择任意文件都固定生成这 2 条预览（id、created 在选择文件时生成） */
export function makeImportSamples(stamp: number, created: string): User[] {
  return [
    makeUser(
      `imp-${stamp}-1`,
      '导入用户A',
      '+86',
      '13600000001',
      'import.a@test.com',
      [ORG0],
      ['维修工'],
      '1',
      'Service Technician',
      created,
    ),
    makeUser(
      `imp-${stamp}-2`,
      '导入用户B',
      '+86',
      '13600000002',
      'import.b@test.com',
      ['测试组织1'],
      ['机手'],
      '2',
      '',
      created,
    ),
  ];
}
