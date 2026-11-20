import { readJSON, writeJSON, STORAGE_KEYS } from '@/utils/storage';
import { buildXlsx } from '@/utils/xlsx';
import { initialAttendance, initialHolidays, initialRules } from '@/mock/personnel/attendance';
import { getOrganizations, getRoles } from '@/services/enterprise/user';
export interface AttendanceRecord {
  id: string;
  name: string;
  account: string;
  organization: string;
  role: string;
  project: string;
  device: string;
  date: string;
  rule: string;
  clockIn: string;
  clockOut: string;
  personHours: number;
  deviceHours: number;
  deviation: number;
  status: string;
  longitude?: number;
  latitude?: number;
  address: string;
  photo?: string;
}
export type PunchMethod = 'phone' | 'project' | 'device';
export interface AttendanceRule {
  id: string;
  name: string;
  organizations: string[];
  type: 'fixed' | 'flexible';
  onWindow: [string, string];
  offWindow: [string, string];
  lateMinutes: number;
  earlyMinutes: number;
  dailyHours: number;
  weekdays: number[];
  methods: PunchMethod[];
  projects: string[];
  watermark: boolean;
}
export interface AttendanceHoliday {
  id: string;
  name: string;
  start: string;
  end: string;
  type: '法定节假日' | '公司福利假';
  remark: string;
}
export interface AttendanceFilter {
  organization?: string;
  role?: string;
  status?: string;
  project?: string;
  keyword?: string;
  from?: string;
  to?: string;
}
export const listAttendance = (): AttendanceRecord[] =>
  readJSON(STORAGE_KEYS.attendanceRecords, initialAttendance);
export const listRules = (): AttendanceRule[] =>
  readJSON(STORAGE_KEYS.attendanceRules, initialRules);
export const saveRules = (rules: AttendanceRule[]) =>
  writeJSON(STORAGE_KEYS.attendanceRules, rules);
export const listHolidays = (): AttendanceHoliday[] =>
  readJSON(STORAGE_KEYS.attendanceHolidays, initialHolidays);
export const saveHolidays = (holidays: AttendanceHoliday[]) =>
  writeJSON(STORAGE_KEYS.attendanceHolidays, holidays);
export const attendanceOptions = () => ({
  organizations: getOrganizations(),
  roles: getRoles(),
  statuses: [...new Set(listAttendance().map((r) => r.status))],
});
export function filterAttendance(records: AttendanceRecord[], f: AttendanceFilter) {
  return records.filter(
    (r) =>
      (!f.organization || r.organization === f.organization) &&
      (!f.role || r.role === f.role) &&
      (!f.status || r.status === f.status) &&
      (!f.project || r.project === f.project) &&
      (!f.keyword ||
        [r.name, r.account, r.device].some((v) =>
          v.toLowerCase().includes(f.keyword!.toLowerCase()),
        )) &&
      (!f.from || r.date >= f.from) &&
      (!f.to || r.date <= f.to),
  );
}
export function exportAttendance(name: string, headers: string[], rows: (string | number)[][]) {
  const url = URL.createObjectURL(
    buildXlsx([{ name, rows: [headers, ...rows.map((row) => row.map(String))] }]),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `${name}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
