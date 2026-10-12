import type {
  AuditCategory,
  AuditCategoryKey,
  AuditEvent,
  MaintainStat,
  QuickLink,
} from '@/services/workbench/workbench';

/** 工作台数据，取自原型 data.js（maintain / audit / auditList / quick） */

/** 计划保养 */
export const MAINTAIN_STATS: MaintainStat[] = [
  {
    n: 2,
    label: '待保养',
    tone: 'red',
  },
  {
    n: 0,
    label: '临期保养',
    tone: 'orange',
  },
  {
    n: 2,
    label: '正常保养',
    tone: 'green',
  },
  {
    n: 0,
    label: '未设置保养策略',
    tone: 'gray',
  },
];

/** 审核概览：fresh 为「新」的数量 */
export const AUDIT_CATEGORIES: AuditCategory[] = [
  {
    k: 'device',
    n: 19,
    fresh: 17,
    label: '设备异常',
  },
  {
    k: 'maint',
    n: 85,
    fresh: 84,
    label: '维保事项',
  },
  {
    k: 'fuel',
    n: 0,
    fresh: 0,
    label: '燃油异常',
  },
  {
    k: 'geo',
    n: 0,
    fresh: 0,
    label: '位置预警',
  },
  {
    k: 'check',
    n: 0,
    fresh: 0,
    label: '检查异常',
  },
];

/** 审核事件列表，按审核分类分组；fresh 为是否显示「新」标签 */
export const AUDIT_EVENTS: Record<AuditCategoryKey, AuditEvent[]> = {
  device: [
    {
      id: 'device-1',
      title: '故障码 | 空滤阻塞(P072)',
      fresh: true,
      sub: 'SY0758CC01278 · 挖掘机',
      time: '2026-09-28 13:12:36 (UTC+7)',
    },
    {
      id: 'device-2',
      title: '故障码 | HCU-电源电压过低(E001)',
      fresh: true,
      sub: 'SY0758CC01278 · 挖掘机',
      time: '2026-09-27 09:51:57 (UTC+7)',
    },
    {
      id: 'device-3',
      title: '故障码 | 冷却水温过高(P068)',
      fresh: true,
      sub: 'SY0758CC01278 · 挖掘机',
      time: '2026-09-26 16:55:41 (UTC+7)',
    },
  ],
  maint: [
    {
      id: 'maint-1',
      title:
        '保养超期 | 超时保养提醒 — 已超过保养日期，超期 781h，请尽快安排保养，如需远程支持立即预约。',
      fresh: true,
      sub: 'SW956E9CFB678 · 电动装载机',
      time: '2026-09-27 18:52:53 (UTC+8)',
    },
    {
      id: 'maint-2',
      title:
        '保养超期 | 超时保养提醒 — 已超过保养日期，超期 738h，请尽快安排保养，如需远程支持立即预约。',
      fresh: true,
      sub: 'SW956E9CFB868 · 电动装载机',
      time: '2026-09-27 18:52:52 (UTC+8)',
    },
    {
      id: 'maint-3',
      title:
        '保养超期 | 超时保养提醒 — 已超过保养日期，超期 761h，请尽快安排保养，如需远程支持立即预约。',
      fresh: true,
      sub: 'SW956E9CFB678 · 电动装载机',
      time: '2026-09-26 18:56:03 (UTC+8)',
    },
  ],
  fuel: [],
  geo: [],
  check: [],
};

/**
 * 快速链接：k 为菜单 key。
 * 按 2026-10-10 确认，第 4 项由「项目管理」改为「吊装规划」入口（吊装规划已移出一级菜单）。
 * 按 2026-10-11 确认，吊装规划入口跳转到「发电机组智慧运营系统」开通状态页（/lift-activation）。
 * 按 2026-10-12 确认，吊装规划入口改为新开浏览器标签页进入外部系统。
 */
export const QUICK_LINKS: QuickLink[] = [
  {
    k: 'monitor-map',
    icon: 'pin',
    label: '地图监控',
    tone: 'amber',
  },
  {
    k: 'monitor-alarm',
    icon: 'warn',
    label: '预警中心',
    tone: 'slate',
  },
  {
    k: 'maintain',
    icon: 'maintain',
    label: '设备保养',
    tone: 'green',
  },
  {
    k: 'lift-plan',
    icon: 'lift',
    label: '吊装规划',
    tone: 'blue',
    href: 'https://dzgh-test.sany.com.cn/#/project/welcome',
  },
];
