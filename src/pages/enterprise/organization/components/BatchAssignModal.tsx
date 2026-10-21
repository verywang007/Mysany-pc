import { useState } from 'react';
import { Button, Table, type TableColumnsType } from 'antd';
import {
  allDeviceRows,
  findNode,
  findParent,
  orgOptions,
  type DeviceRow,
  type OrgNode,
  type OrgOption,
} from '@/services/enterprise/organization';
import OrgModal from './OrgModal';
import { RootTag, SearchBox } from './parts';
import styles from '../index.module.css';

interface OrgRow extends OrgOption {
  code: string;
  parentName: string;
  deviceCount: number;
}

const ORG_COLUMNS: TableColumnsType<OrgRow> = [
  {
    title: '组织名称',
    dataIndex: 'name',
    render: (name: string, o) => (
      <span className={styles.batchNameCell} title={name}>
        <span className={styles.batchName} style={{ paddingLeft: o.depth * 18 }}>
          {name}
        </span>
        {o.root && <RootTag />}
      </span>
    ),
  },
  { title: '组织编码', dataIndex: 'code' },
  { title: '上级组织', dataIndex: 'parentName' },
  // 与原型一致：取 node.devices.length，根组织显示其自身 devices 数（初始为 0）
  { title: '当前设备数', dataIndex: 'deviceCount' },
];

const DEVICE_COLUMNS: TableColumnsType<DeviceRow> = [
  { title: '设备编号', dataIndex: 'code', render: (v: string) => <span title={v}>{v}</span> },
  { title: '设备类型', dataIndex: 'model' },
  {
    title: '所属组织',
    dataIndex: 'orgName',
    render: (_v: string, d) => {
      const text = d.orgNames.length ? d.orgNames.join('、') : '-';
      return <span title={text}>{text}</span>;
    },
  },
];

const Steps = ({ step }: { step: 1 | 2 }) => (
  <div className={styles.steps}>
    <span className={step === 1 ? `${styles.step} ${styles.active}` : styles.step}>
      <i>1</i>选择组织
    </span>
    <span className={styles.stepLine} />
    <span className={step === 2 ? `${styles.step} ${styles.active}` : styles.step}>
      <i>2</i>选择设备
    </span>
  </div>
);

interface Props {
  tree: OrgNode[];
  onCancel: () => void;
  onOk: (orgId: string, deviceIds: string[]) => void;
}

const EMPTY = { emptyText: <div className={styles.emptyBlock}>暂无数据</div> };

/**
 * 根组织「分配设备」两步向导（宽 870）：① 选择组织（单选，不分页）→ ② 选择设备（全部设备，含已分配，
 * 无全选、不分页）。上一步 / 下一步保留已选组织、已选设备和两个搜索词。
 */
export default function BatchAssignModal({ tree, onCancel, onOk }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [orgId, setOrgId] = useState('');
  const [devices, setDevices] = useState<Set<string>>(() => new Set());
  const [orgInput, setOrgInput] = useState('');
  const [orgSearch, setOrgSearch] = useState('');
  const [deviceInput, setDeviceInput] = useState('');
  const [deviceSearch, setDeviceSearch] = useState('');

  const oq = orgSearch.toLowerCase();
  const orgRows: OrgRow[] = orgOptions(tree)
    .filter((o) => !oq || o.name.toLowerCase().includes(oq))
    .map((o) => {
      const node = findNode(tree, o.id);
      const parent = findParent(tree, o.id);
      return {
        ...o,
        code: node?.code || '-',
        parentName: parent ? parent.name : '-',
        deviceCount: node?.devices.length ?? 0,
      };
    });
  const dq = deviceSearch.toLowerCase();
  const deviceRows = allDeviceRows(tree).filter(
    (d) => !dq || `${d.code} ${d.model}`.toLowerCase().includes(dq),
  );
  const target = findNode(tree, orgId);

  const footer =
    step === 1 ? (
      <>
        <span className={styles.selectedCount}>已选组织：{orgId ? 1 : 0}</span>
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" disabled={!orgId} onClick={() => setStep(2)}>
          下一步
        </Button>
      </>
    ) : (
      <>
        <span className={styles.selectedCount}>
          为「{target?.name || '-'}」分配 {devices.size} 台设备
        </span>
        <Button onClick={onCancel}>取消</Button>
        <Button onClick={() => setStep(1)}>上一步</Button>
        <Button
          type="primary"
          disabled={!devices.size}
          onClick={() => target && onOk(target.id, [...devices])}
        >
          确认分配
        </Button>
      </>
    );

  return (
    <OrgModal title="设备分配" width={870} onCancel={onCancel} footer={footer}>
      <Steps step={step} />
      {step === 1 ? (
        <>
          <h4 className={styles.batchTitle}>选择组织</h4>
          <SearchBox
            placeholder="搜索组织名称"
            value={orgInput}
            onChange={setOrgInput}
            onSearch={() => setOrgSearch(orgInput.trim())}
          />
          <div className={styles.modalTableWrap}>
            <Table<OrgRow>
              className={styles.modalTable}
              rowKey="id"
              tableLayout="fixed"
              size="small"
              pagination={false}
              dataSource={orgRows}
              columns={ORG_COLUMNS}
              locale={EMPTY}
              rowSelection={{
                type: 'radio',
                columnWidth: 48,
                selectedRowKeys: orgId ? [orgId] : [],
                onSelect: (row) => setOrgId(row.id),
              }}
            />
          </div>
        </>
      ) : (
        <>
          <h4 className={styles.batchTitle}>选择设备</h4>
          <p className={styles.batchNote}>所选设备将新增到目标组织，原有归属保留。</p>
          <SearchBox
            placeholder="搜索设备编号或类型"
            value={deviceInput}
            onChange={setDeviceInput}
            onSearch={() => setDeviceSearch(deviceInput.trim())}
          />
          <div className={styles.modalTableWrap}>
            <Table<DeviceRow>
              className={styles.modalTable}
              rowKey="id"
              tableLayout="fixed"
              size="small"
              pagination={false}
              dataSource={deviceRows}
              columns={DEVICE_COLUMNS}
              locale={EMPTY}
              rowSelection={{
                columnWidth: 48,
                hideSelectAll: true,
                preserveSelectedRowKeys: true,
                selectedRowKeys: [...devices],
                onSelect: (row, checked) => {
                  const next = new Set(devices);
                  if (checked) next.add(row.id);
                  else next.delete(row.id);
                  setDevices(next);
                },
              }}
            />
          </div>
        </>
      )}
    </OrgModal>
  );
}
