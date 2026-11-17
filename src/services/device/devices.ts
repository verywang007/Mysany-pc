import { readJSON, writeJSON, STORAGE_KEYS } from '@/utils/storage';
import { initialDevices } from '@/mock/device/devices';
export interface StopRecord {
  id: string;
  start: string;
  end?: string;
  reason: string;
  recovery?: string;
  operator: string;
}
export interface MaintenanceRecord {
  id: string;
  date: string;
  person: string;
  hours: number;
  project: string;
  fee: number;
}
export interface Device {
  id: string;
  type: string;
  online: boolean;
  running: string;
  updated: string;
  asset: string;
  alias: string;
  ownership: string;
  organization: string;
  project: string;
  brand: string;
  contact: string;
  phone: string;
  supplier: string;
  dailyHours: number;
  hours: number;
  stops: StopRecord[];
  maintenance: MaintenanceRecord[];
}
export function listDevices(): Device[] {
  return readJSON(STORAGE_KEYS.devices, initialDevices);
}
export function saveDevices(devices: Device[]) {
  writeJSON(STORAGE_KEYS.devices, devices);
}
export function exportCsv(name: string, headers: string[], rows: (string | number)[][]) {
  const quote = (value: string | number) => '"' + String(value).split('"').join('""') + '"';
  const blob = new Blob(
    ['\uFEFF' + [headers, ...rows].map((row) => row.map(quote).join(',')).join('\r\n')],
    { type: 'text/csv;charset=utf-8' },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}
