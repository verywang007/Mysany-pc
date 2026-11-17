import { useState } from 'react';
import { App, Button, Drawer, Empty, Input, Select, Space, Steps, Table, Tag } from 'antd';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { exportCsv, listDevices, saveDevices, type Device } from '@/services/device/devices';
import BindModal from './components/BindModal';
import DeviceDetail from './components/DeviceDetail';
import styles from './index.module.css';
export default function DevicesPage() {
  const { modal, message } = App.useApp();
  const [params, setParams] = useSearchParams();
  const [devices, setDevices] = useState(listDevices);
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState<string>();
  const [running, setRunning] = useState<string>();
  const [online, setOnline] = useState<string>();
  const [ownership, setOwnership] = useState<string>();
  const [filters, setFilters] = useState(false);
  const [bind, setBind] = useState(false);
  const [sync, setSync] = useState(false);
  const selected = devices.find((d) => d.id === params.get('device'));
  const commit = (next: Device[]) => {
    setDevices(next);
    saveDevices(next);
  };
  const rows = devices.filter(
    (d) =>
      [d.id, d.asset, d.alias].some((v) => v.toLowerCase().includes(keyword.toLowerCase())) &&
      (!type || d.type === type) &&
      (!running || d.running === running) &&
      (!online || (d.online ? '在线' : '离线') === online) &&
      (!ownership || d.ownership === ownership),
  );
  const columns = [
    {
      title: '设备编号',
      dataIndex: 'id',
      width: 210,
      render: (id: string) => (
        <Button type="link" onClick={() => setParams({ device: id })}>
          {id}
        </Button>
      ),
    },
    { title: '设备类型', dataIndex: 'type', width: 140 },
    {
      title: '在线状态',
      key: 'online',
      width: 100,
      render: (_: unknown, d: Device) => (
        <Tag color={d.online ? 'green' : 'default'}>{d.online ? '在线' : '离线'}</Tag>
      ),
    },
    { title: '运行状态', dataIndex: 'running', width: 100 },
    { title: '数据更新时间', dataIndex: 'updated', width: 190 },
    { title: '资产编号', dataIndex: 'asset', render: (v: string) => v || '-' },
    { title: '设备归属类型', dataIndex: 'ownership', render: (v: string) => v || '-' },
    { title: '关联项目', dataIndex: 'project', render: (v: string) => v || '-' },
    { title: '所属组织', dataIndex: 'organization' },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_: unknown, d: Device) => (
        <Space>
          <Button type="link" onClick={() => setParams({ device: d.id })}>
            详情
          </Button>
          <Button
            type="link"
            onClick={() =>
              modal.confirm({
                title: '解绑设备',
                content: `确定解绑设备 ${d.id}？`,
                onOk: () => commit(devices.filter((item) => item.id !== d.id)),
              })
            }
          >
            解绑
          </Button>
        </Space>
      ),
    },
  ];
  if (selected)
    return (
      <DeviceDetail
        device={selected}
        devices={devices}
        onBack={() => setParams({})}
        onSelect={(id) => setParams({ device: id })}
        onChange={(d) => commit(devices.map((item) => (item.id === d.id ? d : item)))}
        initialTab={params.get('tab') || undefined}
      />
    );
  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Input
          className={styles.search}
          placeholder="设备序列号、项目自编号、资产编号、车牌号"
          prefix={<SearchOutlined />}
          allowClear
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Select
          className={styles.select}
          placeholder="设备类型"
          allowClear
          value={type}
          onChange={setType}
          options={[...new Set(devices.map((d) => d.type))].map((value) => ({ value }))}
        />
        <Select
          className={styles.select}
          placeholder="运行状态"
          allowClear
          value={running}
          onChange={setRunning}
          options={['工作', '行驶', '离线', '停机'].map((value) => ({ value }))}
        />
        <Button
          aria-label="更多筛选"
          icon={<FilterOutlined />}
          onClick={() => setFilters(!filters)}
        />
        <div className={styles.actions}>
          <Button
            onClick={() =>
              exportCsv(
                '设备清单',
                ['设备编号', '设备类型', '在线状态', '运行状态', '资产编号'],
                rows.map((d) => [d.id, d.type, d.online ? '在线' : '离线', d.running, d.asset]),
              )
            }
          >
            导出
          </Button>
          <Button
            onClick={() =>
              modal.info({
                title: '批量导入设备',
                content: '线上支持 .xlsx、10MB 以内、最多 50 条。当前本地原型尚未接入 Excel 导入。',
              })
            }
          >
            批量导入
          </Button>
          <Button onClick={() => setSync(true)}>同步设备</Button>
          <Button type="primary" onClick={() => setBind(true)}>
            绑定设备
          </Button>
        </div>
      </div>
      {filters && (
        <div className={styles.toolbar}>
          <Select
            className={styles.select}
            placeholder="在线状态"
            allowClear
            value={online}
            onChange={setOnline}
            options={['在线', '离线'].map((value) => ({ value }))}
          />
          <Select
            className={styles.select}
            placeholder="设备归属类型"
            allowClear
            value={ownership}
            onChange={setOwnership}
            options={['自有', '租赁', '分包'].map((value) => ({ value }))}
          />
          <Button
            onClick={() => {
              setKeyword('');
              setType(undefined);
              setRunning(undefined);
              setOnline(undefined);
              setOwnership(undefined);
            }}
          >
            重置
          </Button>
        </div>
      )}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={rows}
        scroll={{ x: 1500 }}
        pagination={{ showSizeChanger: true, showTotal: (n) => `${n} 条记录` }}
        locale={{ emptyText: '无结果' }}
      />
      <BindModal
        open={bind}
        devices={devices}
        onClose={() => setBind(false)}
        onBind={(d) => {
          commit([...devices, d]);
          message.success('绑定成功（本地演示）');
        }}
      />
      <Drawer
        title="同步设备"
        open={sync}
        onClose={() => setSync(false)}
        width={720}
        footer={
          <Space>
            <Button onClick={() => setSync(false)}>取消</Button>
            <Button disabled>下一步</Button>
          </Space>
        }
      >
        <Steps current={0} items={[{ title: '选择设备' }, { title: '维护信息' }]} />
        <p>系统将显示所有客户认证记录关联的、已交付且未绑定到当前租户的设备</p>
        <Empty description="无结果" />
        <p>已选择 0 台设备</p>
      </Drawer>
    </div>
  );
}
