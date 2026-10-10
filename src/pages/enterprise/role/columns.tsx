import type { TableColumnsType } from 'antd';
import type { Role, RoleUser } from '@/services/enterprise/role';
import { RoleTypeTag, Tag } from './components/RoleTag';
import { scopeName } from './constants';
import styles from './index.module.css';

export interface RoleRowActions {
  onDetail: (r: Role) => void;
  onEdit: (r: Role) => void;
  onDelete: (r: Role) => void;
  onRestore: (r: Role) => void;
}

const link = (label: string, onClick: () => void, danger = false) => (
  <button
    type="button"
    className={danger ? `${styles.link} ${styles.linkDanger}` : styles.link}
    onClick={onClick}
  >
    {label}
  </button>
);

/** 角色列表列（宽度取自原型 renderList） */
export function getRoleColumns(a: RoleRowActions): TableColumnsType<Role> {
  return [
    { title: '角色名称', dataIndex: 'name', width: 140 },
    {
      title: '角色类型',
      dataIndex: 'type',
      width: 110,
      render: (_, r) => <RoleTypeTag type={r.type} />,
    },
    {
      title: '角色描述',
      dataIndex: 'description',
      width: 240,
      // title 为原始描述（空时为空串），显示时空值用「-」
      onCell: (r) => ({ title: r.description ?? '' }),
      render: (_, r) => r.description || '-',
    },
    {
      title: '设备权限类型',
      dataIndex: 'scope',
      width: 150,
      render: (_, r) => <Tag tone="scope">{scopeName(r.scope)}</Tag>,
    },
    {
      title: '关联用户数',
      key: 'users',
      width: 140,
      render: (_, r) => r.assignedUserIds.length,
    },
    { title: '创建时间', dataIndex: 'created', width: 180 },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      // 系统角色只有「恢复默认」，自定义角色只有「编辑」「删除」
      render: (_, r) => (
        <>
          {link('详情', () => a.onDetail(r))}
          {r.type === 'custom' ? (
            <>
              {link('编辑', () => a.onEdit(r))}
              {link('删除', () => a.onDelete(r), true)}
            </>
          ) : (
            link('恢复默认', () => a.onRestore(r))
          )}
        </>
      ),
    },
  ];
}

/** 用户分配表列 */
export function getUserColumns(onRemove: (u: RoleUser) => void): TableColumnsType<RoleUser> {
  return [
    { title: '用户姓名', dataIndex: 'name' },
    { title: '登录凭证', dataIndex: 'login' },
    { title: '业务职责', dataIndex: 'duty' },
    {
      title: '所属组织',
      dataIndex: 'orgs',
      render: (_, u) =>
        u.orgs.map((o) => (
          <Tag key={o} tone="org">
            {o}
          </Tag>
        )),
    },
    { title: '最后登录时间', dataIndex: 'last', render: (_, u) => u.last || '-' },
    {
      title: '操作',
      key: 'actions',
      render: (_, u) => link('移除角色', () => onRemove(u), true),
    },
  ];
}
