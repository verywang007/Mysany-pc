import { useState } from 'react';
import { App, Button, Empty, Input, Radio, Select, Tag } from 'antd';
import { EnvironmentOutlined, ReloadOutlined, UnorderedListOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import GeoMap from '@/components/GeoMap';
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
export default function AttendanceMonitor() {
  const { message } = App.useApp();
  const [records, setRecords] = useState(listAttendance);
  const [filter, setFilter] = useState<AttendanceFilter>({});
  const [applied, setApplied] = useState<AttendanceFilter>({});
  const [period, setPeriod] = useState('今日');
  const [view, setView] = useState('监控');
  const [updated, setUpdated] = useState(dayjs().format('HH:mm:ss'));
  const from = dayjs()
    .startOf(period === '今日' ? 'day' : 'month')
    .subtract(period === '本季度' ? dayjs().month() % 3 : 0, 'month')
    .format('YYYY-MM-DD');
  const rows = filterAttendance(records, { ...applied, from, to: dayjs().format('YYYY-MM-DD') });
  const refresh = () => {
    setRecords(listAttendance());
    setUpdated(dayjs().format('HH:mm:ss'));
  };
  return (
    <div className={styles.page}>
      <div className={styles.updated}>
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          aria-label="刷新考勤监控"
          onClick={refresh}
        />
        最后更新：{updated}
      </div>
      <AttendanceMetrics rows={rows} monitor />
      <div className={styles.toolbar}>
        <AttendanceFilters value={filter} onChange={setFilter} />
        <Input.Group compact className={styles.monitorSearch}>
          <Select
            value={period}
            options={['今日', '本月', '本季度'].map((value) => ({ value }))}
            onChange={setPeriod}
          />
          <Input
            allowClear
            placeholder="设备编号"
            value={filter.keyword}
            onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
            onPressEnter={() => setApplied(filter)}
          />
        </Input.Group>
        <Button
          onClick={() => {
            setApplied(filter);
            refresh();
          }}
        >
          查询
        </Button>
        <div className={styles.actions}>
          <Button
            type="primary"
            onClick={() => {
              exportAttendance(
                '考勤监控报表',
                ['人员信息', '关联设备', '考勤时间', '人员工时', '设备工时', '偏差率', '状态'],
                rows.map((r) => [
                  r.name,
                  r.device,
                  `${r.clockIn} ~ ${r.clockOut}`,
                  r.personHours,
                  r.deviceHours,
                  `${r.deviation}%`,
                  r.status,
                ]),
              );
              message.success('报表已导出');
            }}
          >
            导出报表
          </Button>
          <Radio.Group value={view} onChange={(e) => setView(e.target.value)}>
            <Radio.Button value="监控">
              <EnvironmentOutlined /> 监控
            </Radio.Button>
            <Radio.Button value="报表">
              <UnorderedListOutlined /> 报表
            </Radio.Button>
          </Radio.Group>
        </div>
      </div>
      {view === '监控' ? (
        <div className={styles.monitorMap}>
          <GeoMap
            center={[112, 28]}
            zoom={5}
            points={rows
              .filter((r) => r.longitude !== undefined && r.latitude !== undefined)
              .map((r) => ({
                id: r.id,
                longitude: r.longitude!,
                latitude: r.latitude!,
                label: r.name,
                online: true,
              }))}
          />
          <aside className={styles.live}>
            <h3>
              实时打卡流 <Tag color="green">Live</Tag>
            </h3>
            {rows.length ? (
              rows.map((r) => (
                <div className={styles.liveRecord} key={r.id}>
                  <strong>{r.name}</strong>
                  <p>
                    {r.clockIn} {r.device || '-'}
                  </p>
                  <Tag>{r.status}</Tag>
                </div>
              ))
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
            )}
          </aside>
        </div>
      ) : (
        <AttendanceTable<AttendanceRecord>
          rows={rows}
          columns={[
            { title: '人员信息', dataIndex: 'name', width: 180 },
            { title: '关联设备', dataIndex: 'device', width: 210 },
            { title: '考勤时间', width: 220, render: (_, r) => `${r.clockIn} ~ ${r.clockOut}` },
            { title: '人员工时', dataIndex: 'personHours', width: 140 },
            { title: '设备工时', dataIndex: 'deviceHours', width: 140 },
            { title: '偏差率', dataIndex: 'deviation', width: 130, render: (v: number) => `${v}%` },
            { title: '状态', dataIndex: 'status', width: 120 },
            { title: '操作', width: 100 },
          ]}
        />
      )}
    </div>
  );
}
