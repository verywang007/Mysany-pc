import { useCallback, useEffect, useState } from 'react';
import { Button, Select, type TableProps } from 'antd';
import {
  cancelInvite,
  listInvites,
  reinvite,
  type Invite,
  type InviteStatus,
} from '@/services/enterprise/user';
import { INVITE_STATUS_TEXT, INVITE_TIME_OPTIONS, MODAL_WIDTH } from '../constants';
import BoxTable from './BoxTable';
import { StatusTag, TagList } from './Tags';
import UmModal from './UmModal';
import modalStyles from './modal.module.css';
import panelStyles from './panels.module.css';

const styles = { ...modalStyles, ...panelStyles };

interface Props {
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  ...(Object.keys(INVITE_STATUS_TEXT) as InviteStatus[]).map((k) => ({
    value: k,
    label: INVITE_STATUS_TEXT[k],
  })),
];

/**
 * 邀请记录：按状态筛选；时间下拉未绑定逻辑（原型如此）。无分页。
 * 「取消邀请」「重新邀请」直接生效，无二次确认、无提示（原型如此）。
 */
export default function InviteRecordsModal({ onClose }: Props) {
  const [status, setStatus] = useState<'' | InviteStatus>('');
  const [time, setTime] = useState(INVITE_TIME_OPTIONS[0]);
  const [rows, setRows] = useState<Invite[]>([]);

  const load = useCallback(() => {
    listInvites(status).then(setRows);
  }, [status]);

  useEffect(load, [load]);

  const act = async (fn: (id: string) => Promise<void>, id: string) => {
    await fn(id);
    load();
  };

  const columns: TableProps<Invite>['columns'] = [
    { title: '用户', dataIndex: 'user' },
    {
      title: '分配角色',
      dataIndex: 'roles',
      render: (v: string[]) => <TagList list={v} kind="role" />,
    },
    {
      title: '所属组织',
      dataIndex: 'orgs',
      render: (v: string[]) => <TagList list={v} kind="org" />,
    },
    { title: '邀请说明', dataIndex: 'remark', render: (v: string) => v || '-' },
    { title: '邀请人', dataIndex: 'inviter' },
    {
      title: '验证状态',
      dataIndex: 'status',
      render: (v: InviteStatus) => <StatusTag status={v} />,
    },
    { title: '邀请时间', dataIndex: 'time' },
    {
      title: '操作',
      key: 'action',
      render: (_, r) =>
        r.status === 'pending' ? (
          <Button type="link" className={styles.link} onClick={() => act(cancelInvite, r.id)}>
            取消邀请
          </Button>
        ) : r.status !== 'accepted' ? (
          <Button type="link" className={styles.link} onClick={() => act(reinvite, r.id)}>
            重新邀请
          </Button>
        ) : null,
    },
  ];

  return (
    <UmModal
      title="邀请记录"
      width={MODAL_WIDTH.records}
      onClose={onClose}
      footer={<Button onClick={onClose}>关闭</Button>}
    >
      <div className={styles.miniFilter}>
        <Select
          autoFocus
          className={styles.filterSelect}
          value={status}
          options={STATUS_OPTIONS}
          onChange={setStatus}
        />
        <Select
          className={styles.filterSelect}
          value={time}
          options={INVITE_TIME_OPTIONS.map((v) => ({ value: v, label: v }))}
          onChange={setTime}
        />
      </div>
      <BoxTable<Invite>
        columns={columns}
        dataSource={rows}
        rowKey="id"
        minWidth={1000}
        height={350}
        empty="无结果"
      />
    </UmModal>
  );
}
