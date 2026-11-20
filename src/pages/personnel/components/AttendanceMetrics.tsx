import { Progress } from 'antd';
import { ClockCircleOutlined, TeamOutlined, CarOutlined, WarningOutlined } from '@ant-design/icons';
import type { AttendanceRecord } from '@/services/personnel/attendance';
import styles from '../index.module.css';
export default function AttendanceMetrics({
  rows,
  monitor = false,
}: {
  rows: AttendanceRecord[];
  monitor?: boolean;
}) {
  const personHours = rows.reduce((sum, row) => sum + row.personHours, 0);
  const deviceHours = rows.reduce((sum, row) => sum + row.deviceHours, 0);
  const abnormal = rows.filter((row) => Math.abs(row.deviation) > 20).length;
  const count = new Set(rows.map((row) => row.account)).size;
  const metrics = monitor
    ? [
        {
          label: '今日出勤率',
          value: count ? '100%' : '0%',
          unit: '',
          compare: true,
          percent: count ? 100 : 0,
        },
        {
          label: '人机工时匹配度',
          value: rows.length
            ? `${Math.round(((rows.length - abnormal) / rows.length) * 100)}%`
            : '0%',
          unit: '',
          compare: true,
          percent: rows.length ? ((rows.length - abnormal) / rows.length) * 100 : 0,
        },
        { label: '异常考勤记录', value: abnormal, unit: '人次', percent: abnormal },
        {
          label: '关联设备在线',
          value: '0',
          unit: `/${new Set(rows.map((row) => row.device).filter(Boolean)).size}台`,
          percent: 0,
        },
      ]
    : [
        {
          label: '总出勤人数',
          value: count ? `${count} / ${count}` : '- / -',
          unit: '',
          icon: <TeamOutlined />,
        },
        {
          label: '总人员工时',
          value: rows.length ? personHours.toFixed(1) : '-',
          unit: 'h',
          icon: <ClockCircleOutlined />,
        },
        {
          label: '总设备工时',
          value: rows.length ? deviceHours.toFixed(1) : '-',
          unit: 'h',
          icon: <CarOutlined />,
        },
        {
          label: '工时异常（>20%）',
          value: rows.length ? abnormal : '-',
          unit: '人次',
          icon: <WarningOutlined />,
        },
      ];
  return (
    <div className={styles.metrics}>
      {metrics.map((m) => (
        <div key={m.label} className={`${styles.metric} ${monitor ? styles.monitorMetric : ''}`}>
          <div>
            <div className={styles.metricLabel}>{m.label}</div>
            <div className={styles.metricValue}>
              {m.value}
              <small>{m.unit}</small>
              {'compare' in m && <span className={styles.compare}>- 较昨日</span>}
            </div>
          </div>
          {'percent' in m ? (
            <Progress
              type="circle"
              percent={m.percent}
              size={70}
              strokeWidth={10}
              format={() =>
                m.label === '异常考勤记录' ? String(abnormal) : `${Math.round(m.percent ?? 0)}%`
              }
            />
          ) : (
            <div className={styles.metricIcon}>{m.icon}</div>
          )}
        </div>
      ))}
    </div>
  );
}
