/**
 * 菜单树：侧栏菜单、路由、页面标题的唯一来源。
 *
 * - 内容按测试环境企业租户账号实际返回的 Web 菜单整理（2026-10-08），从原型 data.js 迁移。
 * - `key` 沿用原型，会写入本地存储（ms_route / ms_open），不要随意修改。
 * - 带 `path` 且在 router/pages.ts 注册了组件的叶子是已实现页面；其余叶子进入「建设中」占位页。
 * - `systemPath` 是线上系统中的路由，仅作对照。
 * - 有 `children` 字段即为可展开分组（即使只有一个子项）。
 */
export interface MenuNode {
  key: string;
  label: string;
  /** components/Icon 中的图标名，仅一级菜单使用 */
  icon?: string;
  /** 左上角 PRO 角标 */
  pro?: boolean;
  path?: string;
  systemPath?: string;
  /** 隐藏页面在侧栏中高亮的菜单 key（不填则不高亮） */
  activeKey?: string;
  children?: MenuNode[];
}

export const MENU: MenuNode[] = [
  {
    key: 'workbench',
    label: '工作台',
    icon: 'home',
    path: '/workbench',
    systemPath: '/standard/workbench',
  },
  { key: 'device', label: '设备管理', icon: 'device', systemPath: '/standard/machine/machine' },
  {
    key: 'audit',
    label: '审核',
    icon: 'audit',
    children: [
      { key: 'audit-event', label: '审核', systemPath: '/standard/audit/auditEvent' },
      { key: 'audit-task', label: '审核任务' },
    ],
  },
  {
    key: 'training',
    label: '培训中心',
    icon: 'training',
    children: [{ key: 'training-knowledge', label: '知识库' }],
  },
  {
    key: 'screen',
    label: '数据大屏',
    icon: 'screen',
    pro: true,
    systemPath: '/standard/cloudLeasingScreen/cloudLeasingScreen',
  },
  {
    key: 'fleet-report',
    label: '机群报表',
    icon: 'report',
    systemPath: '/standard/report/report-management',
  },
  {
    key: 'personnel',
    label: '人员管理',
    icon: 'personnel',
    pro: true,
    children: [
      { key: 'personnel-monitor', label: '考勤监控' },
      { key: 'personnel-stats', label: '考勤统计' },
      { key: 'personnel-detail', label: '考勤明细' },
      { key: 'personnel-config', label: '考勤配置' },
    ],
  },
  { key: 'project', label: '项目管理', icon: 'project', systemPath: '/standard/project/list' },
  {
    key: 'monitor',
    label: '监控中心',
    icon: 'monitor',
    children: [
      { key: 'monitor-map', label: '地图监控', systemPath: '/standard/monitor/map' },
      { key: 'monitor-alarm', label: '预警中心', systemPath: '/standard/monitor/alarm' },
    ],
  },
  {
    key: 'maintain',
    label: '设备保养',
    icon: 'maintain',
    systemPath: '/standard/maintenance/maintenance',
  },
  {
    key: 'repair',
    label: '维修管理',
    icon: 'repair',
    pro: true,
    children: [
      { key: 'repair-list', label: '维修列表', systemPath: '/standard/repair/repair' },
      { key: 'repair-approval', label: '费用审批', systemPath: '/standard/repair/costApproval' },
      { key: 'repair-parts', label: '配件管理', systemPath: '/standard/repair/parts' },
      { key: 'repair-engineer', label: '工程师配置', systemPath: '/standard/repair/engineer' },
      { key: 'repair-vehicle', label: '服务车配置', systemPath: '/standard/repair/serviceVehicle' },
    ],
  },
  {
    key: 'cost',
    label: '费用核算',
    icon: 'cost',
    pro: true,
    children: [
      {
        key: 'cost-details',
        label: '费用明细',
        systemPath: '/standard/costAccountingStats/costDetails',
      },
      {
        key: 'cost-workload',
        label: '工作量明细',
        systemPath: '/standard/costAccountingStats/workloadDetails',
      },
      {
        key: 'cost-stats',
        label: '核算统计',
        systemPath: '/standard/costAccountingStats/accountingStats',
      },
    ],
  },
  {
    key: 'audio-video',
    label: '音视频服务',
    icon: 'video',
    pro: true,
    children: [
      { key: 'audio-terminal', label: '终端管理', systemPath: '/standard/audioVideo/terminal' },
    ],
  },
  {
    key: 'enterprise',
    label: '企业服务',
    icon: 'ent',
    children: [
      {
        key: 'tenant',
        label: '租户管理',
        path: '/enterprise/tenant',
        systemPath: '/standard/configuration/tenant',
      },
      {
        key: 'personal',
        label: '个人中心',
        path: '/enterprise/profile',
        systemPath: '/standard/configuration/personal',
      },
      {
        key: 'organization',
        label: '组织管理',
        path: '/enterprise/organization',
        systemPath: '/standard/configuration/organization',
      },
      {
        key: 'user-management',
        label: '用户管理',
        path: '/enterprise/user',
        systemPath: '/standard/configuration/user',
      },
      {
        key: 'role-management',
        label: '角色管理',
        path: '/enterprise/role',
        systemPath: '/standard/configuration/role',
      },
      { key: 'selfservice', label: '自助服务', path: '/enterprise/self-service' },
    ],
  },
  {
    key: 'truck',
    label: '重卡车队运营',
    icon: 'truck',
    children: [
      { key: 'truck-screen', label: '运营大屏' },
      { key: 'truck-dashboard', label: '车队仪表盘' },
      { key: 'truck-analysis', label: '运营分析' },
      { key: 'truck-energy', label: '里程能耗' },
      { key: 'truck-charge', label: '充电数据' },
      { key: 'truck-fence', label: '电子围栏' },
      { key: 'truck-report', label: '车队报告' },
      { key: 'truck-driving', label: '驾驶行为' },
    ],
  },
];

/** 未实现页面的路由前缀，后接菜单 key */
export const BUILDING_PREFIX = '/building/';

/** 吊装规划入口的落地页：发电机组智慧运营系统开通状态页（主布局之外，见 main.tsx） */
export const LIFT_ACTIVATION_PATH = '/lift-activation';

/** Cookie 同意页：全屏独立页面，路由级守卫触发（见 main.tsx） */
export const COOKIE_CONSENT_PATH = '/cookies-consent';

/**
 * 不在侧栏显示、但有独立页面的入口（从其他页面跳转进入）。
 * 吊装规划：按 2026-10-10 确认，从一级菜单移除，改由工作台「快速链接」进入。
 * 按 2026-10-12 确认，工作台快速链接改为新开标签页进入外部系统
 * （https://dzgh-test.sany.com.cn/#/project/welcome）；/lift-activation 落地页仅保留直接输 URL 访问。
 */
export const HIDDEN_PAGES: MenuNode[] = [
  {
    key: 'lift-plan',
    label: '吊装规划',
    path: LIFT_ACTIVATION_PATH,
    systemPath: '/standard/liftPlanning/liftPlanning',
  },
  /** 协议变更演示页（原型 协议变更.html）：工作台 + 更新提示弹窗 */
  { key: 'policy-update', label: '协议更新提示', path: '/policy-update', activeKey: 'workbench' },
  /** 场景目录：所有页面集合（仅通过顶栏按钮 / URL 访问，不在侧栏显示） */
  { key: 'scenes', label: '场景目录', path: '/scenes' },
  /** Cookie 同意页：路由级守卫触发 + URL 直接访问（不在侧栏显示） */
  { key: 'cookie-consent', label: 'Cookies 同意', path: COOKIE_CONSENT_PATH },
];

export interface MenuLeaf extends MenuNode {
  /** 所属一级菜单 key（自身就是一级时为 undefined） */
  parentKey?: string;
}

const LEAVES: MenuLeaf[] = [
  ...MENU.flatMap((m) => (m.children ? m.children.map((c) => ({ ...c, parentKey: m.key })) : [m])),
  ...HIDDEN_PAGES,
];

/** 叶子菜单对应的路由：已实现的用 path，未实现的进入建设中页 */
export function leafRoute(leaf: MenuNode): string {
  return leaf.path ?? `${BUILDING_PREFIX}${leaf.key}`;
}

export function findLeafByKey(key: string): MenuLeaf | undefined {
  return LEAVES.find((l) => l.key === key);
}

export function findLeafByRoute(route: string): MenuLeaf | undefined {
  return LEAVES.find((l) => leafRoute(l) === route);
}
