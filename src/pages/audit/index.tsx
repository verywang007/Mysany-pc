import { useState, type Key } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  App,
  Button,
  DatePicker,
  Descriptions,
  Drawer,
  Dropdown,
  Input,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd';
import {
  ReloadOutlined,
  SettingOutlined,
  SearchOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import {
  categories,
  loadEvents,
  saveEvents,
  loadSettings,
  saveSettings,
  type AuditEvent,
  type Category,
} from '@/services/audit/events';
import styles from './index.module.css';

export default function AuditPage() {
  const { modal, message } = App.useApp();
  const navigate = useNavigate();
  const [events, setEvents] = useState(loadEvents);
  const [category, setCategory] = useState<Category>('device');
  const [grouped, setGrouped] = useState(false);
  const [status, setStatus] = useState<string>();
  const [eventType, setEventType] = useState<string>();
  const [deviceType, setDeviceType] = useState<string>();
  const [keyword, setKeyword] = useState('');
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null] | null>([
    dayjs().subtract(3, 'month'),
    dayjs(),
  ]);
  const [selected, setSelected] = useState<Key[]>([]);
  const [detailId, setDetailId] = useState<string>();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(loadSettings);
  const [updated, setUpdated] = useState(dayjs().format('MM/DD/YYYY HH:mm'));
  const current = categories.find((c) => c.key === category)!;
  const rows = events.filter(
    (e) =>
      e.category === category &&
      (!status || e.status === status) &&
      (!eventType || e.title === eventType) &&
      (!deviceType || e.deviceType === deviceType) &&
      e.device.includes(keyword) &&
      (!dates?.[0] || !dayjs(e.time).isBefore(dates[0].startOf('day'))) &&
      (!dates?.[1] || !dayjs(e.time).isAfter(dates[1].endOf('day'))),
  );
  const detail = events.find((e) => e.id === detailId);
  const detailIndex = rows.findIndex((e) => e.id === detailId);
  const pending = events.filter((e) => e.status === '待处理').length;
  const commit = (next: AuditEvent[]) => {
    setEvents(next);
    saveEvents(next);
  };
  const openDetail = (e: AuditEvent) => {
    setDetailId(e.id);
    commit(events.map((item) => (item.id === e.id ? { ...item, fresh: false } : item)));
  };
  const handle = (ids: Key[], nextStatus: string) => {
    let reason = '';
    modal.confirm({
      title: nextStatus === '已处理' ? '确认处理' : '忽略事件',
      content: (
        <div>
          <p>
            确定{nextStatus === '已处理' ? '确认处理' : '忽略'}选中的 {ids.length} 条事件？
          </p>
          {nextStatus === '已忽略' && (
            <Input.TextArea
              placeholder="请输入忽略原因"
              onChange={(e) => {
                reason = e.target.value;
              }}
            />
          )}
        </div>
      ),
      onOk: () => {
        const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
        commit(
          events.map((e) =>
            ids.includes(e.id) && e.status === '待处理'
              ? {
                  ...e,
                  status: nextStatus,
                  operator: '5656',
                  handledAt: time,
                  fresh: false,
                  records: [...e.records, `${time} 5656 ${nextStatus} ${reason}`],
                }
              : e,
          ),
        );
        setSelected([]);
        message.success('操作成功');
      },
    });
  };
  const columns = [
    {
      title: '事件内容',
      key: 'event',
      width: 300,
      render: (_: unknown, e: AuditEvent) => (
        <div>
          <strong>{e.title}</strong> {e.fresh && <Tag color="blue">新</Tag>}
          <div className={styles.secondary}>{e.summary}</div>
        </div>
      ),
    },
    { title: '发生时间', dataIndex: 'time', width: 190 },
    {
      title: '设备',
      key: 'device',
      width: 200,
      render: (_: unknown, e: AuditEvent) => (
        <div>
          {e.device}
          <div className={styles.secondary}>{e.deviceType}</div>
        </div>
      ),
    },
    {
      title: '处理状态',
      dataIndex: 'status',
      width: 100,
      render: (value: string) => (
        <span style={{ color: value === '待处理' ? 'var(--color-orange)' : 'var(--color-text3)' }}>
          {value}
        </span>
      ),
    },
    { title: '处理人', dataIndex: 'operator', width: 100 },
    { title: '处理时间', dataIndex: 'handledAt', width: 180 },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_: unknown, e: AuditEvent) => (
        <Button type="link" onClick={() => openDetail(e)}>
          详情
        </Button>
      ),
    },
  ];
  const table = (data: AuditEvent[]) => (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      rowSelection={{
        selectedRowKeys: selected,
        onChange: setSelected,
        getCheckboxProps: (e) => ({ disabled: e.status !== '待处理' }),
      }}
      scroll={{ x: 1150 }}
      pagination={{ showSizeChanger: true, showTotal: (total) => `共 ${total} 条数据` }}
      locale={{ emptyText: '无结果' }}
    />
  );
  const groupRows = [...new Set(rows.map((e) => e.device))].map((device) => ({
    device,
    events: rows.filter((e) => e.device === device),
  }));
  return (
    <div className={styles.page}>
      {pending > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`待处理 ${pending}，今日新增 ${events.filter((e) => e.time.startsWith(dayjs().format('YYYY-MM-DD'))).length}，滞留最长 ${Math.max(...events.filter((e) => e.status === '待处理').map((e) => dayjs().diff(dayjs(e.time), 'day')))} 天`}
        />
      )}
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.heading}>
            审核事件
            <Button
              aria-label="审核设置"
              type="text"
              icon={<SettingOutlined />}
              onClick={() => setSettingsOpen(true)}
            />
          </div>
          <div className={styles.updated}>
            最后更新 {updated}
            <Button
              aria-label="刷新"
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => {
                setEvents(loadEvents());
                setUpdated(dayjs().format('MM/DD/YYYY HH:mm'));
              }}
            />
          </div>
          {categories.map((c) => {
            const items = events.filter((e) => e.category === c.key && e.status === '待处理');
            return (
              <button
                key={c.key}
                className={category === c.key ? styles.active : styles.category}
                onClick={() => {
                  setCategory(c.key);
                  setSelected([]);
                  setEventType(undefined);
                }}
              >
                <WarningOutlined /> {c.label}
                <span>
                  {items.length > 0 && <Tag color="red">{items.length}</Tag>}
                  {items.some((e) => e.fresh) && (
                    <Tag color="blue">新{items.filter((e) => e.fresh).length}</Tag>
                  )}
                </span>
              </button>
            );
          })}
        </aside>
        <section className={styles.content}>
          <div className={styles.heading}>
            <h3>{current.label}列表</h3>
            <Space>
              按设备分组
              <Switch
                checked={grouped}
                onChange={(value) => {
                  setGrouped(value);
                  setSelected([]);
                }}
              />
            </Space>
          </div>
          <div className={styles.filters}>
            <Select
              placeholder="处理状态"
              allowClear
              value={status}
              onChange={(value) => {
                setStatus(value);
                setSelected([]);
              }}
              options={['待处理', '已处理', '已忽略'].map((value) => ({ value }))}
            />
            <Select
              placeholder="全部事件类型"
              allowClear
              value={eventType}
              onChange={setEventType}
              options={current.types.map((value) => ({ value }))}
            />
            <Select
              placeholder="全部设备"
              allowClear
              value={deviceType}
              onChange={setDeviceType}
              options={[...new Set(events.map((e) => e.deviceType))].map((value) => ({ value }))}
            />
            <Input
              prefix={<SearchOutlined />}
              placeholder="设备编号/车牌号/昵称"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
            />
            <Button disabled={!selected.length} onClick={() => handle(selected, '已处理')}>
              批量确认
            </Button>
            <Button disabled={!selected.length} onClick={() => handle(selected, '已忽略')}>
              批量忽略
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setStatus(undefined);
                setEventType(undefined);
                setDeviceType(undefined);
                setKeyword('');
                setDates([dayjs().subtract(3, 'month'), dayjs()]);
                setSelected([]);
              }}
            >
              重置
            </Button>
            <DatePicker.RangePicker value={dates} onChange={setDates} />
          </div>
          {grouped ? (
            <Table
              rowKey="device"
              dataSource={groupRows}
              columns={[
                { title: '设备信息', dataIndex: 'device' },
                { title: '条数', render: (_, r) => `${r.events.length}条` },
                { title: '设备类型', render: (_, r) => r.events[0].deviceType },
              ]}
              expandable={{ expandedRowRender: (r) => table(r.events) }}
              locale={{ emptyText: '无结果' }}
            />
          ) : (
            table(rows)
          )}
        </section>
      </div>
      <Drawer
        title={detail?.title}
        open={!!detail}
        onClose={() => setDetailId(undefined)}
        width={520}
        footer={
          <Space>
            <Button disabled={detailIndex <= 0} onClick={() => openDetail(rows[detailIndex - 1])}>
              上一条
            </Button>
            <Button
              disabled={detailIndex < 0 || detailIndex >= rows.length - 1}
              onClick={() => openDetail(rows[detailIndex + 1])}
            >
              下一条
            </Button>
          </Space>
        }
      >
        {detail && (
          <>
            <div className={styles.deviceCard}>
              <strong>{detail.device}</strong>
              <p>{detail.deviceType}</p>
              <Space wrap>
                <Button
                  type="primary"
                  disabled={detail.status !== '待处理'}
                  onClick={() => handle([detail.id], '已处理')}
                >
                  确认处理
                </Button>
                <Button
                  onClick={() =>
                    navigate(
                      '/devices?device=' +
                        encodeURIComponent(detail.device) +
                        '&tab=' +
                        encodeURIComponent('统计报表'),
                    )
                  }
                >
                  动态曲线
                </Button>
                <Dropdown
                  menu={{
                    items: [{ key: 'ignore', label: '忽略', disabled: detail.status !== '待处理' }],
                    onClick: () => handle([detail.id], '已忽略'),
                  }}
                >
                  <Button>更多</Button>
                </Dropdown>
              </Space>
            </div>
            <h4>事件详情</h4>
            <Descriptions
              column={1}
              items={[
                { key: 'type', label: '事件类型', children: detail.title },
                { key: 'status', label: '处理状态', children: detail.status },
                { key: 'time', label: '发生时间', children: detail.time },
                { key: 'summary', label: '事件摘要', children: detail.summary },
              ]}
            />
            <h4>操作记录</h4>
            {detail.records.length ? (
              detail.records.map((record) => <p key={record}>{record}</p>)
            ) : (
              <p className={styles.empty}>暂无操作记录</p>
            )}
          </>
        )}
      </Drawer>
      <Drawer
        title="审核设置"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        width={720}
      >
        {categories.map((c) => (
          <section key={c.key}>
            <h3>
              {c.label} 已开启 {c.types.filter((t) => settings[t] !== false).length}/
              {c.types.length}
            </h3>
            {c.types.map((t) => (
              <div className={styles.setting} key={t}>
                {t}
                <Switch
                  checked={settings[t] !== false}
                  onChange={(checked) => {
                    const next = { ...settings, [t]: checked };
                    setSettings(next);
                    saveSettings(next);
                  }}
                />
              </div>
            ))}
          </section>
        ))}
      </Drawer>
    </div>
  );
}
