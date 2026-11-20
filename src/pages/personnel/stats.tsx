import { useState } from 'react';
import { App, Button, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  exportAttendance,
  filterAttendance,
  listAttendance,
  type AttendanceFilter,
} from '@/services/personnel/attendance';
import { listProjects } from '@/services/project/projects';
import AttendanceFilters from './components/AttendanceFilters';
import AttendanceTable from './components/AttendanceTable';
import styles from './index.module.css';
interface PersonSummary {
  id: string;
  name: string;
  project: string;
  device: string;
  organization: string;
  role: string;
  days: Record<string, string>;
}
export default function AttendanceStats() {
  const { message } = App.useApp();
  const [filter, setFilter] = useState<AttendanceFilter>({});
  const [days, setDays] = useState(30);
  const dates = Array.from({ length: days }, (_, i) => dayjs().subtract(days - 1 - i, 'day'));
  const records = filterAttendance(listAttendance(), {
    ...filter,
    from: dates[0].format('YYYY-MM-DD'),
    to: dayjs().format('YYYY-MM-DD'),
  });
  const people = new Map<string, PersonSummary>();
  records.forEach((r) => {
    const person = people.get(r.account) ?? {
      id: r.account,
      name: r.name,
      project: r.project,
      device: r.device,
      organization: r.organization,
      role: r.role,
      days: {},
    };
    person.days[r.date] = r.status;
    people.set(r.account, person);
  });
  const rows = [...people.values()];
  const columns: ColumnsType<PersonSummary> = [
    { title: '序号', key: 'no', width: 70, fixed: 'left', render: (_, __, i) => i + 1 },
    { title: '姓名', dataIndex: 'name', width: 150, fixed: 'left' },
    { title: '项目名称', dataIndex: 'project', width: 160 },
    { title: '关联设备', dataIndex: 'device', width: 200 },
    { title: '所属组织', dataIndex: 'organization', width: 160 },
    { title: '角色', dataIndex: 'role', width: 110 },
    { title: '操作', key: 'actions', width: 90 },
    {
      title: `考勤统计（最近 ${days} 天）`,
      children: dates.map((date) => ({
        title: (
          <div className={date.day() === 0 || date.day() === 6 ? styles.weekend : ''}>
            {date.format('M/D')}
            <br />
            {'日一二三四五六'[date.day()]}
          </div>
        ),
        key: date.format('YYYY-MM-DD'),
        width: 80,
        render: (_, r) => r.days[date.format('YYYY-MM-DD')] || '-',
      })),
    },
  ];
  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Input
          className={styles.search}
          prefix={<SearchOutlined />}
          allowClear
          placeholder="搜索人员姓名"
          value={filter.keyword}
          onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
        />
        <Select
          value={days}
          options={[7, 14, 30, 90].map((value) => ({ value, label: `最近 ${value} 天` }))}
          onChange={setDays}
        />
        <Select
          allowClear
          placeholder="全部项目"
          value={filter.project}
          options={listProjects().map((p) => ({ value: p.name }))}
          onChange={(project) => setFilter({ ...filter, project })}
        />
        <AttendanceFilters
          order={['status', 'organization', 'role']}
          value={filter}
          onChange={setFilter}
        />
        <Button
          className={styles.pushRight}
          type="primary"
          onClick={() => {
            exportAttendance(
              '考勤统计',
              [
                '序号',
                '姓名',
                '项目名称',
                '关联设备',
                '所属组织',
                '角色',
                ...dates.map((d) => d.format('YYYY-MM-DD')),
              ],
              rows.map((r, i) => [
                i + 1,
                r.name,
                r.project,
                r.device,
                r.organization,
                r.role,
                ...dates.map((d) => r.days[d.format('YYYY-MM-DD')] || ''),
              ]),
            );
            message.success('Excel 已导出');
          }}
        >
          导出 Excel
        </Button>
      </div>
      <AttendanceTable<PersonSummary>
        rows={rows}
        columns={columns}
        summary
        width={1040 + days * 80}
      />
    </div>
  );
}
