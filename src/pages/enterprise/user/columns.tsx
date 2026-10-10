import { Button, type TableProps } from 'antd';
import type { User } from '@/services/enterprise/user';
import { TagList } from './components/Tags';
import { scopeName } from './constants';
import { formatPhone } from './utils';
import styles from './index.module.css';

export type RowAction = 'edit' | 'reset' | 'personal' | 'delete';

const plain = { ellipsis: { showTitle: false } };

/** 主列表列定义：首列左固定、末列右固定，所有单元格单行省略 */
export function buildColumns(
  onAction: (action: RowAction, user: User) => void,
): TableProps<User>['columns'] {
  return [
    // 姓名单元格带 title 悬浮显示全名
    { title: '姓名', dataIndex: 'name', width: 180, fixed: 'left', ellipsis: true },
    {
      title: '手机号',
      key: 'phone',
      width: 140,
      ...plain,
      render: (_, u) => formatPhone(u.prefix, u.phone) || '-',
    },
    { title: '邮箱', dataIndex: 'email', width: 180, ...plain, render: (v: string) => v || '-' },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 180,
      ...plain,
      render: (v: string) => v || '-',
    },
    {
      title: '所属组织',
      dataIndex: 'orgs',
      width: 240,
      ...plain,
      render: (v: string[]) => <TagList list={v} kind="org" />,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      width: 220,
      ...plain,
      render: (v: string[]) => <TagList list={v} kind="role" />,
    },
    {
      title: '设备范围类型',
      dataIndex: 'deviceScope',
      width: 150,
      ...plain,
      render: (v: string) => scopeName(v),
    },
    // 业务职责为空时显示空白，不是 -（原型如此）
    { title: '业务职责', dataIndex: 'responsibility', width: 170, ...plain },
    { title: '创建时间', dataIndex: 'created', width: 180, ...plain },
    {
      title: '操作',
      key: 'action',
      width: 255,
      fixed: 'right',
      ...plain,
      render: (_, u) => (
        <span className={styles.actions}>
          <Button type="link" onClick={() => onAction('edit', u)}>
            编辑
          </Button>
          <Button type="link" onClick={() => onAction('reset', u)}>
            重置密码
          </Button>
          {u.deviceScope === '2' && (
            <Button type="link" onClick={() => onAction('personal', u)}>
              个人设备
            </Button>
          )}
          <Button type="link" className={styles.deleteLink} onClick={() => onAction('delete', u)}>
            删除
          </Button>
        </span>
      ),
    },
  ];
}
