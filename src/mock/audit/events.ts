import type { AuditEvent } from '@/services/audit/events';
const times = [
  '2026-10-01 17:45:53',
  '2026-09-18 08:22:57',
  '2026-09-07 16:59:37',
  '2026-09-05 11:14:07',
  '2026-09-02 06:53:37',
  '2026-08-16 06:28:11',
];
export const initialEvents: AuditEvent[] = times.map((time, i) => ({
  id: String(i),
  category: 'device',
  title: i === 0 ? 'SOC过低' : '蓄电池电压低',
  summary: i === 0 ? '电量低于15%，请及时充电。' : '蓄电池电压低于24V，请关注。',
  device: 'HSZX4541015706',
  deviceType: '电动自卸车',
  time,
  fresh: i > 1,
  status: '待处理',
  operator: '-',
  handledAt: '-',
  records: [],
}));
