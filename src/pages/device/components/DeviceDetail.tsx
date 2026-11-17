import { useState } from 'react';
import {
  Alert,
  App,
  Button,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
} from 'antd';
import { ArrowLeftOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { exportCsv, type Device } from '@/services/device/devices';
import styles from '../index.module.css';
interface Props {
  device: Device;
  devices: Device[];
  onBack: () => void;
  onSelect: (id: string) => void;
  onChange: (d: Device) => void;
  initialTab?: string;
}
const tabNames = [
  '实时状态',
  '设备档案',
  '历史轨迹',
  '统计报表',
  '保养管理',
  '预警记录',
  '报停记录',
  '参与项目',
];
function Chart({ bar = false }: { bar?: boolean }) {
  return (
    <svg className={styles.chart} viewBox="0 0 600 160" role="img" aria-label="设备数据示意图">
      {[20, 60, 100, 140].map((y) => (
        <line key={y} x1="20" x2="580" y1={y} y2={y} />
      ))}
      {bar ? (
        [30, 80, 40, 100, 65, 90, 35].map((v, i) => (
          <rect key={i} x={40 + i * 75} y={140 - v} width="35" height={v} />
        ))
      ) : (
        <path d="M20 140 L100 140 L150 60 L240 60 L280 140 L350 140 L390 35 L470 35 L500 140 L580 140" />
      )}
    </svg>
  );
}
export default function DeviceDetail({
  device: d,
  devices,
  onBack,
  onSelect,
  onChange,
  initialTab,
}: Props) {
  const { modal, message } = App.useApp();
  const [tab, setTab] = useState(initialTab || '实时状态');
  const [edit, setEdit] = useState(false);
  const [stop, setStop] = useState(false);
  const [form] = Form.useForm<Device>();
  const [stopForm] = Form.useForm();
  const [auto, setAuto] = useState(true);
  const [updated, setUpdated] = useState(d.updated);
  const [view, setView] = useState('日视图');
  const [chart, setChart] = useState('图表');
  const [trajectory, setTrajectory] = useState('轨迹点');
  const [date, setDate] = useState(dayjs());
  const [maintenanceType, setMaintenanceType] = useState<string>();
  const index = devices.findIndex((item) => item.id === d.id);
  const activeStop = d.stops.find((r) => !r.end);
  const emptyTable = (titles: string[]) => (
    <Table
      dataSource={[]}
      columns={titles.map((title) => ({ title, key: title }))}
      locale={{ emptyText: '无结果' }}
      pagination={{ showTotal: (n) => `${n} 条记录` }}
      scroll={{ x: 800 }}
    />
  );
  const exportEmpty = (name: string, titles: string[]) => exportCsv(name, titles, []);
  const range = <DatePicker.RangePicker />;
  const stopDevice = async () => {
    const values = await stopForm.validateFields();
    onChange({
      ...d,
      stops: [
        ...d.stops,
        {
          id: String(Date.now()),
          start: values.start.format('YYYY-MM-DD HH:mm:ss'),
          reason: values.reason,
          operator: '5656',
        },
      ],
    });
    setStop(false);
    stopForm.resetFields();
    message.success('报停成功');
  };
  const recover = () =>
    modal.confirm({
      title: '恢复设备',
      content: '确定结束当前报停并恢复设备？',
      onOk: () =>
        onChange({
          ...d,
          stops: d.stops.map((r) =>
            r.end ? r : { ...r, end: dayjs().format('YYYY-MM-DD HH:mm:ss'), recovery: '恢复设备' },
          ),
        }),
    });
  const metrics = [
    ['发动机转速', '782', 'RPM'],
    ['油位', '100', '%'],
    ['档位', '11', ''],
    ['发动机水温', '62', '℃'],
  ];
  const realtime = (
    <>
      <div className={styles.toolbar}>
        {!d.online && (
          <span className={styles.secondary}>
            当前设备离线，页面呈现的数据为离线前最后一次更新的数据，最后一次数据更新时间：{updated}
          </span>
        )}
        <Space style={{ marginLeft: 'auto' }}>
          <Switch checked={auto} onChange={setAuto} />
          自动刷新(1s)
          <Button
            aria-label="刷新工况"
            icon={<ReloadOutlined />}
            onClick={() => {
              setUpdated(dayjs().format('YYYY-MM-DD HH:mm:ss'));
              message.success('已刷新本地设备数据');
            }}
          />
        </Space>
      </div>
      <div className={styles.grid}>
        <section className={styles.card}>
          <h3>最新工况</h3>
          <div className={styles.metrics}>
            {metrics.map(([name, value, unit]) => (
              <div key={name}>
                <div className={styles.metric}>
                  {d.type === '挖掘机' ? value : '-'}
                  <small>{unit}</small>
                </div>
                {name}
              </div>
            ))}
          </div>
          <h3>今日工时</h3>
          <div className={styles.metric}>{d.type === '挖掘机' ? '7' : '0'}h</div>
          <Chart />
          <h3>今日油耗</h3>
          <div className={styles.metric}>0L</div>
          <Chart bar />
        </section>
        <section>
          <div className={styles.card}>
            <h3>设备位置</h3>
            <div className={styles.map}>
              <span>
                {d.id}
                <br />
                本地地图预览
              </span>
            </div>
          </div>
          <div className={styles.card}>
            <h3>今日预警</h3>
            <Button type="link" onClick={() => setTab('预警记录')}>
              更多
            </Button>
            <p>暂无数据上报</p>
          </div>
          <div className={styles.card}>
            <h3>设备动态</h3>
            <p>开机 16:06:53 (UTC+8)</p>
            <p>关机 04:45:51 (UTC+8)</p>
          </div>
        </section>
      </div>
      <section className={styles.card}>
        <h3>历史累计数据</h3>
        <div className={styles.metric}>{d.hours}h</div>累计工时
      </section>
    </>
  );
  const archive = (
    <section className={styles.card}>
      <div className={styles.toolbar}>
        <span>档案最后更新：{d.updated}，更新人：5656</span>
        <Button
          icon={<EditOutlined />}
          onClick={() => {
            form.setFieldsValue(d);
            setEdit(true);
          }}
        >
          编辑台账
        </Button>
      </div>
      <h3>台账信息</h3>
      <Descriptions
        column={{ xs: 1, md: 2, xl: 3 }}
        items={[
          ['项目自编号', d.alias],
          ['资产编号', d.asset],
          ['设备类型', d.type],
          ['关联项目', d.project],
          ['联系人', d.contact],
          ['联系电话', d.phone],
          ['所属组织', d.organization],
          ['设备归属类型', d.ownership],
          ['供应方', d.supplier],
          ['每日应作工时', d.dailyHours + ' h'],
        ].map(([label, value]) => ({ key: label, label, children: value || '-' }))}
      />
      <h3>主机厂信息</h3>
      <Descriptions
        items={[
          { key: 'iot', label: '物联状态', children: '已物联' },
          { key: 'brand', label: '设备品牌', children: d.brand },
          { key: 'warranty', label: '质保状态', children: '过保' },
        ]}
      />
      <h3>绑定信息</h3>
      <Descriptions
        items={[
          { key: 'time', label: '绑定时间', children: '2026-09-22 17:22:04' },
          { key: 'bound', label: '绑定状态', children: '绑定' },
        ]}
      />
    </section>
  );
  const history = (
    <section className={styles.card}>
      <div className={styles.toolbar}>
        <DatePicker.RangePicker showTime />
        <Button onClick={() => setDate(date.subtract(1, 'day'))}>上一天</Button>
        <Button onClick={() => setDate(date.add(1, 'day'))}>下一天</Button>
        <Button onClick={() => message.info('本地设备暂无轨迹数据')}>查询</Button>
        <Button onClick={() => exportEmpty('设备轨迹', ['时间', '经度', '纬度'])}>导出</Button>
        <Radio.Group
          value={trajectory}
          onChange={(e) => setTrajectory(e.target.value)}
          options={['轨迹点', '轨迹线', '热力图']}
        />
      </div>
      <div className={styles.map}>
        {date.format('YYYY-MM-DD')} · {trajectory} · 暂无轨迹数据
      </div>
    </section>
  );
  const reports = (
    <section className={styles.card}>
      <div className={styles.toolbar}>
        <Radio.Group
          value={view}
          onChange={(e) => setView(e.target.value)}
          options={['日视图', '周视图', '月视图']}
        />
        <DatePicker
          value={date}
          onChange={(v) => v && setDate(v)}
          picker={view === '月视图' ? 'month' : view === '周视图' ? 'week' : 'date'}
        />
        <Radio.Group
          value={chart}
          onChange={(e) => setChart(e.target.value)}
          options={['图表', '列表']}
        />
      </div>
      {chart === '列表' ? (
        emptyTable(['日期', '总工时', '油耗', '预警次数'])
      ) : (
        <div className={styles.grid}>
          {[
            '开工时段分布',
            '工时统计',
            '档位用时分布',
            '预警统计',
            '油耗分析',
            '核心参数动态曲线',
            '泵压力分析',
          ].map((title) => (
            <div key={title}>
              <h3>{title}</h3>
              {title === '核心参数动态曲线' && (
                <Select
                  defaultValue="发动机水温"
                  options={['发动机水温', '油位', '发动机转速', 'SOC'].map((value) => ({ value }))}
                />
              )}
              <Chart bar={title !== '核心参数动态曲线'} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
  const maintenance = (
    <section className={styles.card}>
      <div className={styles.metrics}>
        <div>
          <h3>上次保养</h3>2026-10-27<div className={styles.metric}>31606h</div>
        </div>
        <div>
          <h3>保养工况</h3>实时更新<div className={styles.metric}>32605.102h</div>
        </div>
        <div>
          <h3>下次保养</h3>目标工时：32606 h<p>距离下次保养进度 0%</p>
        </div>
      </div>
      <div className={styles.toolbar}>
        {range}
        <Select
          className={styles.select}
          value={maintenanceType}
          onChange={setMaintenanceType}
          allowClear
          placeholder="保养类型"
          options={['自行保养', '官方保养'].map((value) => ({ value }))}
        />
        <Button>查询</Button>
      </div>
      <Table
        rowKey="id"
        dataSource={maintenanceType === '官方保养' ? [] : d.maintenance}
        columns={[
          { title: '保养日期', dataIndex: 'date' },
          { title: '保养类型', render: () => '自行保养' },
          { title: '保养项目摘要', dataIndex: 'project' },
          { title: '保养人', dataIndex: 'person' },
          { title: '保养时工况', render: (_, r) => `总工时：${r.hours}h` },
          { title: '总费用', dataIndex: 'fee' },
          {
            title: '操作',
            render: (_, r) => (
              <Space>
                <Button
                  type="link"
                  onClick={() =>
                    modal.info({
                      title: '保养记录详情',
                      width: 700,
                      content: (
                        <>
                          <h3>基本信息</h3>
                          <p>
                            保养日期 {r.date} 保养人 {r.person || '-'}
                          </p>
                          <p>工况信息 总工时：{r.hours}h</p>
                          <h3>配件清单</h3>
                          <p>无结果</p>
                          <h3>费用明细</h3>
                          <p>总费用 {r.fee || '-'}</p>
                          <h3>附件信息</h3>
                          <p>-</p>
                        </>
                      ),
                    })
                  }
                >
                  详情
                </Button>
                <Button
                  type="link"
                  onClick={() =>
                    modal.info({ title: '编辑保养记录', content: '保养编辑表单尚待线上逐项核对。' })
                  }
                >
                  编辑
                </Button>
                <Button
                  type="link"
                  onClick={() =>
                    modal.confirm({
                      title: '删除保养记录',
                      content: '确定删除该记录？',
                      onOk: () =>
                        onChange({
                          ...d,
                          maintenance: d.maintenance.filter((item) => item.id !== r.id),
                        }),
                    })
                  }
                >
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
        scroll={{ x: 900 }}
      />
    </section>
  );
  const stops = (
    <section className={styles.card}>
      <div className={styles.toolbar}>
        {range}
        <Input placeholder="请输入报停原因" style={{ width: 200 }} />
        <Input placeholder="请输入恢复说明" style={{ width: 200 }} />
        <Button
          onClick={() =>
            exportCsv(
              '报停记录',
              ['开始', '结束', '原因'],
              d.stops.map((r) => [r.start, r.end || '', r.reason]),
            )
          }
        >
          导出
        </Button>
        <Button onClick={() => setStop(true)}>新增报停记录</Button>
      </div>
      <Table
        rowKey="id"
        dataSource={d.stops}
        columns={[
          { title: '报停开始时间', dataIndex: 'start' },
          { title: '报停结束时间', dataIndex: 'end' },
          { title: '报停时长', render: (_, r) => dayjs(r.end).diff(dayjs(r.start), 'hour') + 'h' },
          { title: '报停原因', dataIndex: 'reason' },
          { title: '恢复说明', dataIndex: 'recovery' },
          { title: '记录人', dataIndex: 'operator' },
        ]}
        locale={{ emptyText: '无结果' }}
      />
    </section>
  );
  const warnings = (
    <section className={styles.card}>
      <div className={styles.toolbar}>
        {range}
        <Select
          className={styles.select}
          placeholder="预警类型"
          allowClear
          options={['SOC过低', '故障码', '油位低'].map((value) => ({ value }))}
        />
        <Select
          className={styles.select}
          placeholder="处理状态"
          allowClear
          options={['待处理', '已处理'].map((value) => ({ value }))}
        />
        <Button disabled>批量处理</Button>
        <Button onClick={() => exportEmpty('预警记录', ['预警时间', '预警类型', '预警内容'])}>
          导出
        </Button>
      </div>
      {emptyTable([
        '预警时间',
        '预警类型',
        '预警内容',
        '处理状态',
        '备注',
        '操作人',
        '处理时间',
        '操作',
      ])}
    </section>
  );
  const projects = (
    <section className={styles.card}>
      <div className={styles.toolbar}>
        <Input placeholder="请输入项目名称" style={{ width: 200 }} />
        <Select
          className={styles.select}
          placeholder="项目状态"
          allowClear
          options={['进行中', '已完成'].map((value) => ({ value }))}
        />
        {range}
        <Button
          onClick={() =>
            exportEmpty('参与项目', ['项目名称', '进场时间', '退场时间', '在场天数', '项目状态'])
          }
        >
          导出
        </Button>
      </div>
      {emptyTable(['项目名称', '进场时间', '退场时间', '在场天数', '项目状态'])}
    </section>
  );
  const panels = [realtime, archive, history, reports, maintenance, warnings, stops, projects];
  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack}>
          返回设备列表
        </Button>
        <Space style={{ marginLeft: 'auto' }}>
          <Button disabled={index === 0} onClick={() => onSelect(devices[index - 1].id)}>
            上一台
          </Button>
          <Select
            value={d.id}
            style={{ width: 220 }}
            options={devices.map((item) => ({ value: item.id }))}
            onChange={onSelect}
          />
          <Button
            disabled={index === devices.length - 1}
            onClick={() => onSelect(devices[index + 1].id)}
          >
            下一台
          </Button>
          {index + 1} / {devices.length}
        </Space>
      </div>
      <div className={styles.card}>
        <div className={styles.summary}>
          <div>
            设备编号/自编号
            <h3>
              {d.id}/{d.alias || '-'}
            </h3>
          </div>
          <div>
            设备类型<h3>{d.type}</h3>
          </div>
          <div>
            关联项目<h3>{d.project || '-'}</h3>
          </div>
          <div>
            设备状态
            <h3>
              {activeStop ? '报停' : d.online ? '在线' : '离线'} {d.running}
            </h3>
          </div>
          <Button
            style={{ marginLeft: 'auto' }}
            onClick={() => (activeStop ? recover() : setStop(true))}
          >
            {activeStop ? '恢复' : '报停'}
          </Button>
        </div>
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={tabNames.map((label, i) => ({ key: label, label, children: panels[i] }))}
        />
      </div>
      <Modal
        title="台账信息"
        open={edit}
        onCancel={() => setEdit(false)}
        onOk={async () => {
          const values = await form.validateFields();
          onChange({ ...d, ...values });
          setEdit(false);
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          {[
            ['alias', '项目自编号'],
            ['asset', '资产编号'],
            ['contact', '联系人'],
            ['phone', '联系电话'],
            ['supplier', '供应方'],
          ].map(([name, label]) => (
            <Form.Item key={name} name={name} label={label}>
              <Input placeholder="请输入" />
            </Form.Item>
          ))}
          <Form.Item name="ownership" label="设备归属类型">
            <Select allowClear options={['自有', '租赁', '分包'].map((value) => ({ value }))} />
          </Form.Item>
          <Form.Item name="dailyHours" label="每日应作工时" rules={[{ required: true }]}>
            <InputNumber min={0} max={24} addonAfter="小时" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="设备报停"
        open={stop}
        onCancel={() => setStop(false)}
        onOk={stopDevice}
        okText="报停"
        cancelText="取消"
      >
        <Form form={stopForm} layout="vertical">
          <Form.Item
            name="start"
            label="报停开始时间"
            rules={[{ required: true, message: '请选择报停开始时间' }]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            name="reason"
            label="报停原因"
            rules={[{ required: true, whitespace: true, message: '请输入报停原因' }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
      {auto && <Alert type="info" message="当前为本地演示数据" />}
    </div>
  );
}
