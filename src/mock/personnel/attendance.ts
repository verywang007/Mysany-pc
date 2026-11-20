import type {
  AttendanceHoliday,
  AttendanceRecord,
  AttendanceRule,
} from '@/services/personnel/attendance';
// 2026-11-18 企业租户「2603181012测试客户」四页均为空；不编造打卡记录。
export const initialAttendance: AttendanceRecord[] = [];
export const initialRules: AttendanceRule[] = [];
export const initialHolidays: AttendanceHoliday[] = [];
