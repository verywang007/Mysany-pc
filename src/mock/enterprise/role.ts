import type { PermissionNode, Role, RoleUser } from '@/services/enterprise/role';

/**
 * 企业服务 › 角色管理 样本数据，取自原型 role-management.js 的 PERMISSIONS / USERS / DEFAULT_ROLES。
 * 本页数据不与用户管理、组织管理页共享（与原型一致）。
 */

/** 功能权限树：12 个一级模块，共 60 个节点；id 用点号分层 */
export const PERMISSIONS: PermissionNode[] = [
  {
    id: 'machine',
    name: '设备管理',
    children: [
      { id: 'machine.bind', name: '绑定' },
      { id: 'machine.import', name: '导入' },
      { id: 'machine.export', name: '导出' },
      { id: 'machine.sync', name: '同步设备' },
      { id: 'machine.unbind', name: '解绑' },
      {
        id: 'machine.detail',
        name: '设备详情',
        children: [
          { id: 'machine.detail.edit', name: '编辑' },
          { id: 'machine.detail.stop', name: '停车' },
          { id: 'machine.detail.archive', name: '设备档案' },
          { id: 'machine.detail.realtime', name: '实时状态' },
          {
            id: 'machine.detail.track',
            name: '历史轨迹',
            children: [{ id: 'machine.detail.track.export', name: '导出' }],
          },
          { id: 'machine.detail.report', name: '统计报表' },
          {
            id: 'machine.detail.warning',
            name: '预警记录',
            children: [
              { id: 'machine.detail.warning.handle', name: '处理' },
              { id: 'machine.detail.warning.export', name: '导出' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'audit',
    name: '审核',
    children: [
      { id: 'audit.view', name: '查看审核' },
      { id: 'audit.handle', name: '处理审核' },
      { id: 'audit.task', name: '审核任务' },
    ],
  },
  { id: 'screen', name: '数据大屏' },
  {
    id: 'report',
    name: '机群报表',
    children: [
      { id: 'report.view', name: '查看' },
      { id: 'report.export', name: '导出' },
    ],
  },
  {
    id: 'project',
    name: '项目管理',
    children: [
      { id: 'project.view', name: '查看' },
      { id: 'project.add', name: '新增' },
      { id: 'project.edit', name: '编辑' },
      { id: 'project.delete', name: '删除' },
      { id: 'project.export', name: '导出' },
    ],
  },
  {
    id: 'monitor',
    name: '监控中心',
    children: [
      { id: 'monitor.map', name: '地图监控' },
      { id: 'monitor.warn', name: '预警中心' },
    ],
  },
  {
    id: 'maintenance',
    name: '设备保养',
    children: [
      { id: 'maintenance.list', name: '保养清单' },
      { id: 'maintenance.strategy', name: '设置策略' },
      { id: 'maintenance.book', name: '预约保养' },
      { id: 'maintenance.record', name: '保养记录' },
    ],
  },
  {
    id: 'repair',
    name: '维修管理',
    children: [
      { id: 'repair.list', name: '维修列表' },
      { id: 'repair.dispatch', name: '派工' },
      { id: 'repair.close', name: '关闭工单' },
    ],
  },
  {
    id: 'cost',
    name: '费用核算',
    children: [
      { id: 'cost.detail', name: '费用明细' },
      { id: 'cost.stats', name: '核算统计' },
    ],
  },
  {
    id: 'audio',
    name: '音视频服务',
    children: [
      { id: 'audio.terminal', name: '终端管理' },
      { id: 'audio.realtime', name: '实时视频' },
      { id: 'audio.playback', name: '录像回放' },
    ],
  },
  {
    id: 'enterprise',
    name: '企业服务',
    children: [
      { id: 'enterprise.tenant', name: '租户管理' },
      { id: 'enterprise.org', name: '组织管理' },
      { id: 'enterprise.user', name: '用户管理' },
      { id: 'enterprise.role', name: '角色管理' },
    ],
  },
  {
    id: 'truck',
    name: '重卡车队运营',
    children: [
      { id: 'truck.dashboard', name: '车队仪表盘' },
      { id: 'truck.analysis', name: '运营分析' },
      { id: 'truck.energy', name: '里程能耗' },
      { id: 'truck.report', name: '车队报告' },
    ],
  },
];

/** 本页用户字典（u0 为当前登录用户「5656」） */
export const ROLE_USERS: Record<string, Omit<RoleUser, 'id'>> = {
  u9: {
    name: 'xhh',
    login: 'xhh@qq.com',
    duty: '设备管理员',
    orgs: ['2603181012测试客户'],
    last: '2026-10-07 09:16:20',
  },
  u8: {
    name: '测试邮箱用户abc1',
    login: '847189223@qq.com',
    duty: '设备管理员',
    orgs: ['2603181012测试客户'],
    last: '2026-10-06 17:20:11',
  },
  u7: {
    name: '测试手机用户abc1',
    login: '17673451222',
    duty: '设备管理员',
    orgs: ['2603181012测试客户'],
    last: '2026-10-06 16:13:08',
  },
  u6: {
    name: '测试手动新增邮箱用户45665',
    login: '84715555@qq.com',
    duty: '设备操作手',
    orgs: ['2603181012测试客户'],
    last: '2026-09-29 10:08:44',
  },
  u5: {
    name: '测试aaa',
    login: '176734561122',
    duty: '设备操作手',
    orgs: ['2603181012测试客户'],
    last: '2026-09-25 14:22:30',
  },
  u4: {
    name: '测试用户导入1昵称',
    login: '17610001111',
    duty: '维修人员',
    orgs: ['2603181012测试客户', 'aa'],
    last: '2026-09-18 11:45:00',
  },
  u2: {
    name: '杨大明',
    login: '15673290484',
    duty: '设备所有人',
    orgs: ['测试组织1'],
    last: '2026-09-16 08:30:16',
  },
  u3: {
    name: '大绿',
    login: '1777777',
    duty: '维修人员',
    orgs: ['2603181012测试客户'],
    last: '2026-09-11 15:19:42',
  },
  u1: {
    name: '大红',
    login: '1666666',
    duty: '维修人员',
    orgs: ['测试组织1'],
    last: '2026-09-08 17:01:13',
  },
  u10: {
    name: '大紫',
    login: '1565656',
    duty: '设备操作手',
    orgs: ['测试组织2'],
    last: '2026-09-01 12:04:09',
  },
  u0: {
    name: '5656',
    login: '19955665566',
    duty: '设备管理员',
    orgs: ['2603181012测试客户'],
    last: '2026-10-08 08:21:10',
  },
};

/** 节点的全部后代 id */
function descendantIds(node: PermissionNode): string[] {
  return (node.children ?? []).flatMap((c) => [c.id, ...descendantIds(c)]);
}

/** 所选模块及其全部后代的 id（原型 idsByRoots） */
function idsByRoots(rootIds: string[]): string[] {
  const set = new Set<string>();
  const walk = (nodes: PermissionNode[]) =>
    nodes.forEach((n) => {
      if (rootIds.includes(n.id)) {
        set.add(n.id);
        descendantIds(n).forEach((x) => set.add(x));
      } else if (n.children) walk(n.children);
    });
  walk(PERMISSIONS);
  return Array.from(set);
}

function R(
  id: string,
  name: string,
  description: string,
  scope: string,
  assignedUserIds: string[],
  created: string,
  roots: string[],
): Role {
  const permissions = idsByRoots(roots);
  return {
    id,
    name,
    type: 'system',
    description,
    scope,
    assignedUserIds,
    created,
    permissions,
    defaultPermissions: permissions.slice(),
  };
}

/** 预置角色（4 条，全部为系统配置） */
export const DEFAULT_ROLES: Role[] = [
  R('r1', '车队长', '车队管理人', '1', ['u5', 'u6'], '2026-04-16 09:32:48', [
    'machine',
    'project',
    'monitor',
    'report',
  ]),
  R('r2', '机手', '设备操作人员，使用分配的设备', '2', ['u10'], '2026-04-16 09:32:47', ['machine']),
  R('r3', '维修工', '设备维修人员，负责设备维护', '1', ['u1', 'u3', 'u4'], '2026-04-16 09:32:46', [
    'machine',
    'maintenance',
    'repair',
  ]),
  R(
    'r4',
    '管理员',
    '系统管理员，拥有租户内所有权限',
    '0',
    ['u9', 'u8', 'u7', 'u2', 'u0'],
    '2026-04-16 09:32:44',
    PERMISSIONS.map((p) => p.id),
  ),
];
