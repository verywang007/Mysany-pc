import { readJSON, writeJSON, STORAGE_KEYS } from '@/utils/storage';
import { initialAlarms } from '@/mock/monitor/alarms';
export interface MonitorAlarm {
  id: string;
  time: string;
  device: string;
  alias: string;
  deviceType: string;
  project: string;
  type: string;
  content: string;
  status: '未处理' | '已处理' | '已忽略';
  description: string;
  operator: string;
  processedAt: string;
}
export const listAlarms = (): MonitorAlarm[] => readJSON(STORAGE_KEYS.monitorAlarms, initialAlarms);
export const saveAlarms = (rows: MonitorAlarm[]) => writeJSON(STORAGE_KEYS.monitorAlarms, rows);
