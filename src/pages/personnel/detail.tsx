import { useState } from 'react';
import { App, Button, DatePicker, Radio } from 'antd';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import {
  exportAttendance,
  filterAttendance,
  listAttendance,
  type AttendanceFilter,
  type AttendanceRecord,
} from '@/services/personnel/attendance';
import AttendanceFilters from './components/AttendanceFilters';
import AttendanceMetrics from './components/AttendanceMetrics';
import AttendanceTable from './components/AttendanceTable';
import styles from './index.module.css';
interface MonthRow {
  id: string;
  name: string;
  organization: string;
  role: string;
  attendance: string;
  personHours: number;
  deviceHours: number;
  exceptions: string;
}
export default function AttendanceDetail() {
  const { message } = App.useApp();
  const [mode, setMode] = useState('每日考勤');
  const [date, setDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [filter, setFilter] = useState<AttendanceFilter>({});
  const monthly = mode === '月度考勤';
  const rows = filterAttendance(listAttendance(), {
    ...filter,
    from: date?.startOf(monthly ? 'month' : 'day').format('YYYY-MM-DD'),
    to: date?.endOf(monthly ? 'month' : 'day').format('YYYY-MM-DD'),
  });
  const people = new Map<string, AttendanceRecord[]>();
  rows.forEach((r) => people.set(r.account, [...(people.get(r.account) ?? []), r]));
  const monthlyRows: MonthRow[] = [...people].map(([id, records]) => ({
    id,
    name: records[0].name,
    organization: records[0].organization,
    role: records[0].role,
    attendance: `${new Set(records.map((r) => r.date)).size} / -`,
    personHours: records.reduce((n, r) => n + r.personHours, 0),
    deviceHours: records.reduce((n, r) => n + r.deviceHours, 0),
    exceptions: ['迟到', '早退', '缺勤']
      .map((s) => records.filter((r) => r.status === s).length)
      .join(' / '),
  }));
  const dailyColumns: ColumnsType<AttendanceRecord> = [
    {
      title: '姓名/账号',
      width: 170,
      render: (_, r) => (
        <>
          {r.name}
          <br />
          <span className={styles.muted}>{r.account}</span>
        </>
      ),
    },
    { title: '所属组织', dataIndex: 'organization', width: 140 },
    { title: '用户角色', dataIndex: 'role', width: 110 },
    { title: '班次/规则', dataIndex: 'rule', width: 140 },
    { title: '打卡时间', width: 220, render: (_, r) => `${r.clockIn} ~ ${r.clockOut}` },
    { title: '人员工时', dataIndex: 'personHours', width: 110 },
    { title: '关联设备', dataIndex: 'device', width: 190 },
    { title: '设备运行', dataIndex: 'deviceHours', width: 110 },
    { title: '工时偏差', dataIndex: 'deviation', width: 110, render: (v: number) => `${v}%` },
    { title: '状态', dataIndex: 'status', width: 100 },
    { title: '操作', width: 100 },
  ];
  const monthColumns: ColumnsType<MonthRow> = [
    { title: '姓名/账号', dataIndex: 'name', width: 170 },
    { title: '所属组织', dataIndex: 'organization', width: 160 },
    { title: '用户角色', dataIndex: 'role', width: 140 },
    { title: '实出勤/应出勤', dataIndex: 'attendance', width: 200 },
    { title: '人员累计工时', dataIndex: 'personHours', width: 200 },
    { title: '设备累计工时', dataIndex: 'deviceHours', width: 200 },
    { title: '迟到/早退/缺勤', dataIndex: 'exceptions', width: 200 },
    { title: '操作', width: 100 },
  ];
  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Radio.Group
          optionType="button"
          value={mode}
          options={['每日考勤', '月度考勤']}
          onChange={(e) => setMode(e.target.value)}
        />
        <div className={styles.actions}>
          <DatePicker
            value={date}
            picker={monthly ? 'month' : 'date'}
            format={monthly ? 'YYYY-MM' : 'YYYY-MM-DD'}
            onChange={setDate}
            placeholder={monthly ? '请选择月份' : '请选择日期'}
          />
          <AttendanceFilters value={filter} onChange={setFilter} />
          <Button
            type="primary"
            onClick={() => {
              if (monthly)
                exportAttendance(
                  '月度考勤',
                  monthColumns.map((c) => String(c.title)),
                  monthlyRows.map((r) => [
                    r.name,
                    r.organization,
                    r.role,
                    r.attendance,
                    r.personHours,
                    r.deviceHours,
                    r.exceptions,
                    '',
                  ]),
                );
              else
                exportAttendance(
                  '每日考勤',
                  dailyColumns.map((c) => String(c.title)),
                  rows.map((r) => [
                    r.name,
                    r.organization,
                    r.role,
                    r.rule,
                    `${r.clockIn} ~ ${r.clockOut}`,
                    r.personHours,
                    r.device,
                    r.deviceHours,
                    `${r.deviation}%`,
                    r.status,
                    '',
                  ]),
                );
              message.success('考勤数据已导出');
            }}
          >
            导出
          </Button>
        </div>
      </div>
      {!monthly && <AttendanceMetrics rows={rows} />}
      {monthly ? (
        <AttendanceTable rows={monthlyRows} columns={monthColumns} />
      ) : (
        <AttendanceTable rows={rows} columns={dailyColumns} width={1600} />
      )}
    </div>
  );
}
