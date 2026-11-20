import { listDevices, type Device } from '@/services/device/devices';
// 地图示例位置来自线上地图标记，坐标为原型演示位置，非实时遥测。
const locations: Record<string, [number, number]> = {
  EV4600CD0095: [35, 29.53],
  '12SY0216K3018': [112.9, 23],
  HSZX4541015706: [111, 22],
  LFXAH69W4S3080783: [28.1, -26.2],
  PY5723CA0673: [102, 23],
  SY0058CA96828: [112, 26],
};
const updatedTimes: Record<string, string> = {
  EV4600CD0095: '2026-11-18 12:30:36',
  '12SY0216K3018': '2026-11-18 12:33:15',
  HSZX4541015706: '2026-11-18 12:11:55',
  LFXAH69W4S3080783: '2026-11-18 10:08:57',
  PY5723CA0673: '2024-08-23 16:31:18',
  SY0058CA96828: '2026-11-18 10:25:02',
};
export type MapDevice = Device & { longitude: number; latitude: number; address: string };
export function listMapDevices(): MapDevice[] {
  return listDevices()
    .map((d) => ({
      ...d,
      online: d.id === 'EV4600CD0095',
      running:
        d.id === 'EV4600CD0095' || d.id === 'PY5723CA0673'
          ? '关机'
          : d.id === 'HSZX4541015706'
            ? '充电'
            : '离线',
      updated: updatedTimes[d.id] ?? d.updated,
      longitude: locations[d.id]?.[0] ?? 112,
      latitude: locations[d.id]?.[1] ?? 28,
      address: d.id === 'EV4600CD0095' ? '亚喀巴, Aqaba Qasabah District, 亚喀巴省, 约旦' : '-',
    }))
    .sort((a, b) => Number(b.online) - Number(a.online));
}
