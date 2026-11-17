import { readJSON, writeJSON, STORAGE_KEYS } from '@/utils/storage';
import { initialEvents } from '@/mock/audit/events';
export type Category = 'device' | 'maint' | 'fuel' | 'geo' | 'check';
export interface AuditEvent {
  id: string;
  category: Category;
  title: string;
  summary: string;
  device: string;
  deviceType: string;
  time: string;
  fresh: boolean;
  status: string;
  operator: string;
  handledAt: string;
  records: string[];
}
export const categories: { key: Category; label: string; types: string[] }[] = [
  {
    key: 'device',
    label: '设备异常',
    types: [
      '冷却水温高',
      '故障码',
      'SOC过低',
      '危险力矩',
      '蓄电池电压低',
      '超速',
      '发动机转速',
      '主卷超载',
      '设备离线预警',
      '长时间停机',
      '危险负载',
      '绝缘告警',
      '长时间驻车',
      '电机温度',
      '高液压油温',
    ],
  },
  { key: 'maint', label: '维保事项', types: ['保养超期', '保养临期'] },
  { key: 'fuel', label: '燃油异常', types: ['油位低'] },
  { key: 'geo', label: '位置预警', types: ['电子围栏预警'] },
  { key: 'check', label: '检查异常', types: ['检查需处理'] },
];
export function loadEvents(): AuditEvent[] {
  return readJSON(STORAGE_KEYS.auditEvents, initialEvents);
}
export function saveEvents(events: AuditEvent[]) {
  writeJSON(STORAGE_KEYS.auditEvents, events);
}
export function loadSettings(): Record<string, boolean> {
  return readJSON(STORAGE_KEYS.auditSettings, {});
}
export function saveSettings(settings: Record<string, boolean>) {
  writeJSON(STORAGE_KEYS.auditSettings, settings);
}
