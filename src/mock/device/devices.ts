import type { Device } from '@/services/device/devices';
const ids = [
  '12SY0216K3018',
  'EV4600CD0095',
  'HSZX4541015706',
  'LFXAH69W4S3080783',
  'PY5723CA0673',
  'SY0058CA96828',
];
const types = ['挖掘机', '纯电动牵引车', '电动自卸车', '半挂牵引车', '平地机', '挖掘机'];
export const initialDevices: Device[] = ids.map((id, i) => ({
  id,
  type: types[i],
  online: i === 1 || i === 5,
  running: i === 1 ? '行驶' : i === 5 ? '工作' : '离线',
  updated: i === 4 ? '2024-08-23 16:31:18' : '2026-11-16 17:21:36',
  asset: '',
  alias: '',
  ownership: i === 0 ? '自有' : '',
  organization: '5656',
  project: '',
  brand: 'Sany',
  contact: '',
  phone: '',
  supplier: '',
  dailyHours: 0,
  hours: i === 0 ? 32824.84 : 0,
  stops: [],
  maintenance:
    i === 0
      ? [31500, 31500, 31600, 31605, 31606, 31606, 31490.248].map((hours, n) => ({
          id: 'maintenance-' + n,
          date: n === 6 ? '2026-06-12' : '2026-10-27',
          person: n === 6 ? 'mike' : '',
          hours,
          project: '',
          fee: 0,
        }))
      : [],
}));
