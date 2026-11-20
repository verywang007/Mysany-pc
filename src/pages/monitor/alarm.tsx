import { useMemo, useState, type Key } from 'react';
import { App, Button, DatePicker, Empty, Input, Radio, Select, Table, Tag, Tooltip } from 'antd';
import { ExportOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { exportCsv } from '@/services/device/devices';
import { listProjects } from '@/services/project/projects';
import { listAlarms, saveAlarms, type MonitorAlarm } from '@/services/monitor/alarms';
import ProcessAlarm from './components/ProcessAlarm';
import styles from './index.module.css';
const referenceDay = dayjs('2026-11-18');
export default function AlarmPage() {
  const { message } = App.useApp();
  const [alarms, setAlarms] = useState(listAlarms);
  const [period, setPeriod] = useState('近30天');
  const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    referenceDay.subtract(29, 'day'),
    referenceDay,
  ]);
  const [keyword, setKeyword] = useState('');
  const [project, setProject] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [type, setType] = useState<string>();
  const [deviceType, setDeviceType] = useState<string>();
  const [selected, setSelected] = useState<Key[]>([]);
  const [processing, setProcessing] = useState<MonitorAlarm[]>();
  const [page, setPage] = useState(1);
  const rows = alarms.filter(
    (a) =>
      (!keyword ||
        [a.device, a.alias].some((v) => v.toLowerCase().includes(keyword.toLowerCase()))) &&
      (!project || a.project === project) &&
      (!status || a.status === status || (status === '待处理' && a.status === '未处理')) &&
      (!type || a.type === type) &&
      (!deviceType || a.deviceType === deviceType) &&
      (!dates ||
        (a.time.slice(0, 10) >= dates[0].format('YYYY-MM-DD') &&
          a.time.slice(0, 10) <= dates[1].format('YYYY-MM-DD'))),
  );
  const pending = rows.filter((a) => a.status === '未处理');
  const trend = useMemo(() => {
    if (!dates) return [];
    const length = Math.min(366, dates[1].diff(dates[0], 'day') + 1);
    return Array.from({ length }, (_, i) => {
      const d = dates[0].add(i, 'day');
      return {
        date: d.format('MM.DD'),
        value: rows.filter((a) => a.time.startsWith(d.format('YYYY-MM-DD'))).length,
      };
    });
  }, [dates, rows]);
  const columns = [
    { title: '预警时间', dataIndex: 'time', width: 190 },
    { title: '设备序列号', dataIndex: 'device', width: 190 },
    { title: '自编号', dataIndex: 'alias', width: 100, render: (v: string) => v || '-' },
    { title: '设备类型', dataIndex: 'deviceType', width: 140 },
    { title: '所属项目', dataIndex: 'project', width: 130, render: (v: string) => v || '-' },
    { title: '预警类型', dataIndex: 'type', width: 140 },
    { title: '预警内容', dataIndex: 'content', width: 330, ellipsis: true },
    {
      title: '处理状态',
      dataIndex: 'status',
      width: 110,
      render: (v: string) => (
        <Tag color={v === '未处理' ? 'orange' : v === '已处理' ? 'green' : 'default'}>{v}</Tag>
      ),
    },
    {
      title: '处理说明',
      dataIndex: 'description',
      width: 180,
      ellipsis: true,
      render: (v: string) => v || '-',
    },
    { title: '处理人', dataIndex: 'operator', width: 110, render: (v: string) => v || '-' },
    { title: '处理时间', dataIndex: 'processedAt', width: 190, render: (v: string) => v || '-' },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, a: MonitorAlarm) =>
        a.status === '未处理' ? (
          <Button type="link" onClick={() => setProcessing([a])}>
            处理
          </Button>
        ) : null,
    },
  ];
  const resetPage = () => {
    setPage(1);
    setSelected([]);
  };
  return (
    <div className={styles.page}>
      <div className={styles.filters}>
        <Radio.Group
          optionType="button"
          options={['今日', '近7天', '近30天', '自定义']}
          value={period}
          onChange={(e) => {
            const v = e.target.value as string;
            setPeriod(v);
            if (v !== '自定义')
              setDates([
                referenceDay.subtract(v === '今日' ? 0 : v === '近7天' ? 6 : 29, 'day'),
                referenceDay,
              ]);
            resetPage();
          }}
        />
        <DatePicker.RangePicker
          value={dates}
          onChange={(v) => {
            setDates(v?.[0] && v[1] ? [v[0], v[1]] : null);
            setPeriod('自定义');
            resetPage();
          }}
        />
        <Input
          prefix={<SearchOutlined />}
          allowClear
          placeholder="设备编号/序列号"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            resetPage();
          }}
        />
        <Select
          allowClear
          placeholder="请选择项目"
          value={project}
          options={listProjects().map((p) => ({ value: p.name }))}
          onChange={(v) => {
            setProject(v);
            resetPage();
          }}
        />
        <Select
          allowClear
          placeholder="请选择处理状态"
          value={status}
          options={['待处理', '已处理', '已忽略'].map((value) => ({ value }))}
          onChange={(v) => {
            setStatus(v);
            resetPage();
          }}
        />
        <div className={styles.actions}>
          <Button
            type="primary"
            disabled={!selected.length}
            onClick={() => setProcessing(pending.filter((a) => selected.includes(a.id)))}
          >
            批量处理
          </Button>
          <Button
            icon={<ExportOutlined />}
            disabled={!rows.length}
            onClick={() => {
              exportCsv(
                '预警记录',
                columns.filter((c) => 'dataIndex' in c).map((c) => c.title),
                rows.map((a) => [
                  a.time,
                  a.device,
                  a.alias,
                  a.deviceType,
                  a.project,
                  a.type,
                  a.content,
                  a.status,
                  a.description,
                  a.operator,
                  a.processedAt,
                ]),
              );
              message.success('已导出当前筛选结果');
            }}
          >
            导出
          </Button>
        </div>
        <Select
          allowClear
          placeholder="请选择设备类型"
          value={deviceType}
          options={[...new Set(alarms.map((a) => a.deviceType))].map((value) => ({ value }))}
          onChange={(v) => {
            setDeviceType(v);
            resetPage();
          }}
        />
        <Select
          allowClear
          placeholder="请选择预警类型"
          value={type}
          options={[...new Set(alarms.map((a) => a.type))].map((value) => ({ value }))}
          onChange={(v) => {
            setType(v);
            resetPage();
          }}
        />
      </div>
      <section className={styles.stats}>
        <div className={styles.total}>
          预警次数
          <strong>
            {rows.length}
            <small> 次</small>
          </strong>
        </div>
        <div className={styles.pending}>
          待处理
          <strong>
            {pending.length}
            <small> 次</small>
          </strong>
        </div>
        <div className={styles.trend}>
          <div>预警趋势</div>
          <div className={styles.bars} aria-label="每日预警次数">
            {trend.map((d, i) => (
              <Tooltip key={i} title={`${d.date}：${d.value} 次`}>
                <div className={styles.barSlot}>
                  <div
                    className={styles.bar}
                    style={{
                      height: `${(d.value / Math.max(1, ...trend.map((t) => t.value))) * 65}px`,
                    }}
                  />
                  {i % Math.max(1, Math.ceil(trend.length / 10)) === 0 && <span>{d.date}</span>}
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
      </section>
      <Table<MonitorAlarm>
        bordered
        rowKey="id"
        columns={columns}
        dataSource={rows}
        scroll={{ x: 2000, y: 'calc(100vh - 410px)' }}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />,
        }}
        rowSelection={{
          selectedRowKeys: selected,
          onChange: setSelected,
          preserveSelectedRowKeys: false,
          getCheckboxProps: (a) => ({ disabled: a.status !== '未处理' }),
        }}
        pagination={{
          current: page,
          onChange: (p) => {
            setPage(p);
            setSelected([]);
          },
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (n, r) => `显示第 ${n ? r[0] : 0} 到 ${r[1]} 条，共 ${n} 条记录`,
        }}
      />
      {processing?.length ? (
        <ProcessAlarm
          rows={processing}
          onCancel={() => setProcessing(undefined)}
          onSave={(values) => {
            const ids = new Set(processing.map((a) => a.id));
            const next = alarms.map((a) =>
              ids.has(a.id)
                ? {
                    ...a,
                    ...values,
                    processedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    operator: '5656',
                  }
                : a,
            );
            saveAlarms(next);
            setAlarms(next);
            setProcessing(undefined);
            setSelected([]);
            message.success('处理成功');
          }}
        />
      ) : null}
    </div>
  );
}
