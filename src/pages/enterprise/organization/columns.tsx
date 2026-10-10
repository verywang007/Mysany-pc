import type { TableColumnsType } from 'antd';
import type { DeviceRow, MemberRow, OrgNode } from '@/services/enterprise/organization';
import { RoleTags } from './components/parts';
import styles from './index.module.css';

const link = (text: string, onClick: () => void) => (
  <button type="button" className={styles.linkBtn} onClick={onClick}>
    {text}
  </button>
);

/** 主列表 · 组织成员 */
export function memberColumns(
  node: OrgNode,
  onRemove: (row: MemberRow) => void,
): TableColumnsType<MemberRow> {
  return [
    {
      title: '用户姓名',
      dataIndex: 'name',
      width: '20%',
      render: (name: string, u) => (
        <span title={name}>
          {name}
          {node.leaderId === u.id && (
            <span className={styles.leaderBadge} title="组织负责人">
              人
            </span>
          )}
        </span>
      ),
    },
    { title: '手机号码', dataIndex: 'phone', width: '14%', render: (v: string) => v || '-' },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: '18%',
      render: (v: string) => <span title={v || '-'}>{v || '-'}</span>,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      width: '18%',
      render: (roles: string[]) => <RoleTags roles={roles} />,
    },
    { title: '加入时间', dataIndex: 'joined', width: '13%', render: (v: string) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 86,
      align: 'center',
      render: (_, u) => link('移除', () => onRemove(u)),
    },
  ];
}

/** 主列表 · 设备分配：每行只出现一个按钮，有所属组织为「取消分配」，否则为「分配」 */
export function deviceColumns(
  onUnassign: (row: DeviceRow) => void,
  onAssign: (row: DeviceRow) => void,
): TableColumnsType<DeviceRow> {
  return [
    {
      title: '设备编号',
      dataIndex: 'code',
      width: '24%',
      render: (v: string) => <span title={v}>{v}</span>,
    },
    { title: '设备类型', dataIndex: 'model', width: '18%' },
    { title: '分配时间', dataIndex: 'allocated', width: '17%' },
    {
      title: '所属组织',
      dataIndex: 'orgName',
      width: '23%',
      render: (v: string) => <span title={v}>{v}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 86,
      align: 'center',
      render: (_, d) =>
        d.orgId ? link('取消分配', () => onUnassign(d)) : link('分配', () => onAssign(d)),
    },
  ];
}
