import type { OrgDevice, OrgNode, OrgUser } from '@/services/enterprise/organization';

/**
 * 企业服务 › 组织管理 样本数据，取自原型 organization.js（L41-98），不来自 data.js。
 * 缺失值沿用原型的字符串 '-'。
 */

/** 当前登录用户（即「5656」），新建组织的创建者 / 负责人 */
export const CURRENT_USER_ID = 'u0';

export const ORG_USERS: OrgUser[] = [
  { id: 'u0', name: '5656', phone: '19955665566', email: 'iii@qq.com', roles: ['超级管理员'] },
  { id: 'u1', name: '大红', phone: '1666666', email: '-', roles: ['维修工'] },
  { id: 'u2', name: '杨大明', phone: '15673290484', email: '-', roles: ['管理员'] },
  { id: 'u3', name: '大绿', phone: '1777777', email: '-', roles: ['维修工'] },
  { id: 'u4', name: '测试用户导入1昵称', phone: '17610001111', email: '-', roles: ['维修工'] },
  { id: 'u5', name: '测试aaa', phone: '176734561122', email: '-', roles: ['车队长'] },
  {
    id: 'u6',
    name: '测试手动新增邮箱用户45665',
    phone: '-',
    email: '84715555@qq.com',
    roles: ['车队长'],
  },
  {
    id: 'u7',
    name: '测试手机用户abc1',
    phone: '17673451222',
    email: '847189111@qq.com',
    roles: ['管理员'],
  },
  { id: 'u8', name: '测试邮箱用户abc1', phone: '-', email: '847189223@qq.com', roles: ['管理员'] },
  { id: 'u9', name: 'xhh', phone: '-', email: 'xhh@qq.com', roles: ['管理员'] },
  { id: 'u10', name: '大紫', phone: '1565656', email: '-', roles: ['机手'] },
  {
    id: 'u11',
    name: '设备管理员',
    phone: '13800138000',
    email: 'device@test.com',
    roles: ['设备管理员'],
  },
  {
    id: 'u12',
    name: '安全主管',
    phone: '13900139000',
    email: 'safe@test.com',
    roles: ['安全主管', '管理员'],
  },
];

/** model 实为设备类型中文名 */
export const ORG_DEVICES: OrgDevice[] = [
  { id: 'd1', code: 'SY007CBHC0908', model: '挖掘机' },
  { id: 'd2', code: 'HPGJ1041000683', model: '搅拌车' },
  { id: 'd3', code: 'AC0130CD0002', model: '全路面起重机' },
  { id: 'd4', code: 'AC0160CC0541', model: '全路面起重机' },
  { id: 'd5', code: 'TNEST202607232146', model: '搅拌车' },
  { id: 'd6', code: 'SY0076CC07218', model: '汽车起重机' },
  { id: 'd7', code: 'SFT0200CD1135', model: '塔机' },
  { id: 'd8', code: 'SY013NCC18558', model: '挖掘机' },
  { id: 'd9', code: 'SR285CCF19518', model: '旋挖钻机' },
  { id: 'd10', code: 'TH1056CC0001', model: '伸缩臂叉车' },
  { id: 'd11', code: 'SY036BBG15578', model: '挖掘机' },
  { id: 'd12', code: 'KT090SE20279', model: '矿用宽体自卸车' },
  { id: 'd13', code: 'SW956E9CFB678', model: '电动装载机' },
  { id: 'd14', code: 'SW956E9CFB868', model: '电动装载机' },
  { id: 'd15', code: 'SY0758CC01278', model: '挖掘机' },
  { id: 'd16', code: 'SYM5350THB', model: '泵车' },
  { id: 'd17', code: 'SSR120AC0001', model: '压路机' },
  { id: 'd18', code: 'SAG200C0008', model: '平地机' },
];

/** 默认组织树：1 个根 + 3 个子组织。根必须位于数组第 0 个（租户管理页改写 [0].leaderId） */
export const DEFAULT_ORGS: OrgNode[] = [
  {
    id: 'root',
    name: '2603181012测试客户',
    code: '-',
    parentId: null,
    creatorId: 'u0',
    leaderId: 'u0',
    description: '-',
    root: true,
    members: [
      { userId: 'u3', joined: '2026-05-07' },
      { userId: 'u4', joined: '2026-05-09' },
      { userId: 'u5', joined: '2026-05-09' },
      { userId: 'u6', joined: '2026-05-09' },
      { userId: 'u7', joined: '2026-05-09' },
      { userId: 'u8', joined: '2026-05-09' },
      { userId: 'u9', joined: '2026-05-14' },
    ],
    devices: [],
    deviceDates: {},
    children: [
      {
        id: 'org-1',
        name: '测试组织1',
        code: 'MYSANY20260507000142',
        parentId: 'root',
        creatorId: 'u1',
        leaderId: 'u1',
        description: '-',
        members: [
          { userId: 'u1', joined: '2026-05-07' },
          { userId: 'u2', joined: '2026-05-08' },
        ],
        devices: ['d1', 'd2'],
        deviceDates: { d1: '2026-06-04', d2: '2026-06-04' },
        children: [],
      },
      {
        id: 'org-2',
        name: '测试组织2',
        code: 'MYSANY20260507000143',
        parentId: 'root',
        creatorId: 'u10',
        leaderId: 'u10',
        description: '-',
        members: [
          { userId: 'u1', joined: '2026-05-07' },
          { userId: 'u2', joined: '2026-05-08' },
        ],
        devices: ['d13'],
        deviceDates: { d13: '2026-06-05' },
        children: [],
      },
      {
        id: 'org-3',
        name: 'aa',
        code: 'MYSANY20260605000201',
        parentId: 'root',
        creatorId: 'u4',
        leaderId: 'u4',
        description: '-',
        members: [{ userId: 'u10', joined: '2026-05-07' }],
        devices: [],
        deviceDates: {},
        children: [],
      },
    ],
  },
];

/** 导入模板（UTF-8 BOM 由下载处补） */
export const DEVICE_IMPORT_TEMPLATE =
  '设备编号,所属组织\nSY007CBHC0908,测试组织1\nHPGJ1041000683,测试组织2\n';
