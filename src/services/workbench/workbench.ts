import {
  AUDIT_CATEGORIES,
  AUDIT_EVENTS,
  MAINTAIN_STATS,
  QUICK_LINKS,
} from '@/mock/workbench/workbench';
import { delay } from '@/mock/utils';

export type Tone = 'red' | 'orange' | 'green' | 'gray';
export type QuickTone = 'amber' | 'slate' | 'green' | 'blue';
export type AuditCategoryKey = 'device' | 'maint' | 'fuel' | 'geo' | 'check';

export interface MaintainStat {
  n: number;
  label: string;
  tone: Tone;
}

export interface AuditCategory {
  k: AuditCategoryKey;
  /** 总数 */
  n: number;
  /** 新增数，为 0 时不显示「新」标签 */
  fresh: number;
  label: string;
}

export interface AuditEvent {
  id: string;
  title: string;
  /** 是否显示「新」标签 */
  fresh: boolean;
  /** 设备号 · 机型 */
  sub: string;
  /** YYYY-MM-DD HH:mm:ss (UTC+N) */
  time: string;
}

export interface QuickLink {
  /** 目标菜单 key（有 href 时忽略） */
  k: string;
  /** 外部链接：有值时新开浏览器标签页打开，不走站内路由 */
  href?: string;
  icon: string;
  label: string;
  tone: QuickTone;
}

export interface WorkbenchData {
  maintain: MaintainStat[];
  audit: AuditCategory[];
  quick: QuickLink[];
}

export async function getWorkbench(): Promise<WorkbenchData> {
  await delay(0);
  return { maintain: MAINTAIN_STATS, audit: AUDIT_CATEGORIES, quick: QUICK_LINKS };
}

/**
 * 某个审核分类的事件，按发生时间排序。
 * 与原型一致：只比较前 19 位（YYYY-MM-DD HH:mm:ss），忽略时区后缀。
 */
export async function listAuditEvents(
  category: AuditCategoryKey,
  desc: boolean,
): Promise<AuditEvent[]> {
  await delay(0);
  const key = (e: AuditEvent) => e.time.slice(0, 19);
  return [...(AUDIT_EVENTS[category] ?? [])].sort((a, b) => {
    const r = key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0;
    return desc ? -r : r;
  });
}
