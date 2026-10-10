import { useEffect, useState } from 'react';
import { App, Button, Input, type TableProps } from 'antd';
import {
  assignDevices,
  getDevices,
  listAllUsers,
  type Device,
  type User,
} from '@/services/enterprise/user';
import BoxTable from './BoxTable';
import { TagList } from './Tags';
import { MODAL_WIDTH } from '../constants';
import UmModal from './UmModal';
import modalStyles from './modal.module.css';
import panelStyles from './panels.module.css';

const styles = { ...modalStyles, ...panelStyles };

interface Props {
  onClose: () => void;
}

const userColumns: TableProps<User>['columns'] = [
  { title: '姓名', dataIndex: 'name' },
  {
    title: '所属组织',
    dataIndex: 'orgs',
    render: (v: string[]) => <TagList list={v} kind="org" />,
  },
  { title: '角色', dataIndex: 'roles', render: (v: string[]) => <TagList list={v} kind="role" /> },
  { title: '当前设备数', dataIndex: 'assignedDevices', render: (v: string[]) => v.length },
];

const deviceColumns: TableProps<Device>['columns'] = [
  { title: '设备编号', dataIndex: 'name' },
  { title: '设备类型', dataIndex: 'type' },
  { title: '所属组织', dataIndex: 'org' },
];

/** 复选框列：无全选，表头为空；搜索过滤后已选项保留 */
function selection<T extends { id: string }>(
  picked: Set<string>,
  setPicked: (next: Set<string>) => void,
): TableProps<T>['rowSelection'] {
  return {
    columnWidth: 48,
    hideSelectAll: true,
    selectedRowKeys: Array.from(picked),
    onSelect: (row, checked) => {
      const next = new Set(picked);
      if (checked) next.add(row.id);
      else next.delete(row.id);
      setPicked(next);
    },
  };
}

/**
 * 设备分配（两步）：① 选择用户（全部用户，按姓名模糊搜索）② 选择设备（编号 + 类型模糊搜索）。
 * 上一步 / 下一步之间保留已选；确认后把所选设备去重追加到每个所选用户，不校验设备范围类型（原型如此）。
 */
export default function BatchAssignModal({ onClose }: Props) {
  const { message } = App.useApp();
  const [step, setStep] = useState<1 | 2>(1);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [deviceSearch, setDeviceSearch] = useState('');
  const [pickedUsers, setPickedUsers] = useState<Set<string>>(new Set());
  const [pickedDevices, setPickedDevices] = useState<Set<string>>(new Set());

  useEffect(() => {
    listAllUsers().then(setUsers);
  }, []);

  const us = userSearch.toLowerCase();
  const ds = deviceSearch.toLowerCase();
  const shownUsers = users.filter((u) => !us || u.name.toLowerCase().includes(us));
  const shownDevices = getDevices().filter(
    (d) => !ds || `${d.name} ${d.type}`.toLowerCase().includes(ds),
  );

  const confirm = async () => {
    await assignDevices(Array.from(pickedUsers), Array.from(pickedDevices));
    onClose();
    message.success('设备分配成功');
  };

  const footer =
    step === 1 ? (
      <>
        <span className={styles.count}>已选用户：{pickedUsers.size}</span>
        <Button onClick={onClose}>取消</Button>
        <Button type="primary" disabled={!pickedUsers.size} onClick={() => setStep(2)}>
          下一步
        </Button>
      </>
    ) : (
      <>
        <span className={styles.count}>
          为 {pickedUsers.size} 位用户分配 {pickedDevices.size} 台设备
        </span>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={() => setStep(1)}>上一步</Button>
        <Button type="primary" disabled={!pickedDevices.size} onClick={confirm}>
          确认分配
        </Button>
      </>
    );

  return (
    <UmModal title="设备分配" width={MODAL_WIDTH.wide} onClose={onClose} footer={footer}>
      <div className={styles.steps}>
        <span className={step === 1 ? `${styles.step} ${styles.stepOn}` : styles.step}>
          <i>1</i>选择用户
        </span>
        <span className={styles.stepLine} />
        <span className={step === 2 ? `${styles.step} ${styles.stepOn}` : styles.step}>
          <i>2</i>选择设备
        </span>
      </div>
      {step === 1 ? (
        <>
          <h4 className={styles.subTitle}>选择用户</h4>
          <div className={styles.miniFilter}>
            <Input
              key="user"
              autoFocus
              className={styles.miniInput}
              placeholder="搜索用户姓名"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
          <BoxTable<User>
            columns={userColumns}
            dataSource={shownUsers}
            rowKey="id"
            minWidth={720}
            height={330}
            rowSelection={selection<User>(pickedUsers, setPickedUsers)}
          />
        </>
      ) : (
        <>
          <h4 className={styles.subTitle}>选择设备</h4>
          <div className={styles.miniFilter}>
            <Input
              key="device"
              autoFocus
              className={styles.miniInput}
              placeholder="搜索设备名称或编号"
              value={deviceSearch}
              onChange={(e) => setDeviceSearch(e.target.value)}
            />
          </div>
          <BoxTable<Device>
            columns={deviceColumns}
            dataSource={shownDevices}
            rowKey="id"
            minWidth={720}
            height={330}
            rowSelection={selection<Device>(pickedDevices, setPickedDevices)}
          />
        </>
      )}
    </UmModal>
  );
}
