import { useCallback, useState } from 'react';
import { App, Button, Tabs } from 'antd';
import {
  getRole,
  removeRoleUser,
  restoreDefaultPermissions,
  saveRolePermissions,
  type Role,
  type RoleUser,
  type RoleUserFilters,
} from '@/services/enterprise/role';
import { DEFAULT_EXPANDED, MESSAGES, scopeName } from '../constants';
import { useRoleConfirm } from '../useRoleConfirm';
import PermissionPanel from './PermissionPanel';
import { RoleTypeTag } from './RoleTag';
import UserPanel from './UserPanel';
import styles from '../index.module.css';
import d from './RoleDetail.module.css';

type DetailTab = 'permissions' | 'users';

interface Props {
  /** 进入详情时读取的角色；组件按角色 id 重新挂载，页签、草稿、展开、搜索随之重置 */
  initialRole: Role;
  /** 用户分配筛选条件：由页面保存，在多个角色间沿用（与原型一致） */
  userFilters: RoleUserFilters;
  onUserFiltersChange: (f: RoleUserFilters) => void;
  /** 返回列表；未保存的权限草稿直接丢弃，无提示（与原型一致） */
  onBack: () => void;
}

export default function RoleDetail({
  initialRole,
  userFilters,
  onUserFiltersChange,
  onBack,
}: Props) {
  const { message } = App.useApp();
  const confirm = useRoleConfirm();
  const [role, setRole] = useState(initialRole);
  const [tab, setTab] = useState<DetailTab>('permissions');
  const [draft, setDraft] = useState(() => new Set(initialRole.permissions));
  const [expanded, setExpanded] = useState(() => new Set(DEFAULT_EXPANDED));
  const [search, setSearch] = useState('');

  /** 写操作后重新读取角色；角色已不存在时回到列表 */
  const refresh = useCallback(
    async (next?: Role) => {
      const r = next ?? (await getRole(role.id));
      if (!r) onBack();
      else setRole(r);
      return r;
    },
    [role.id, onBack],
  );

  const savePermissions = async () => {
    await refresh(await saveRolePermissions(role.id, Array.from(draft)));
    message.success(MESSAGES.permissionsSaved);
  };

  const resetPermissions = async () => {
    const r = await refresh();
    if (r) setDraft(new Set(r.permissions));
  };

  // 恢复默认：确认后直接写入存储（无需再点保存），并同步草稿
  const restore = () =>
    confirm({
      title: '确认恢复默认',
      content: `确认将角色“${role.name}”的功能权限恢复为系统默认值吗？`,
      okText: '确认',
      onOk: async () => {
        const r = await refresh(await restoreDefaultPermissions(role.id));
        if (r) setDraft(new Set(r.permissions));
        message.success(MESSAGES.restored);
      },
    });

  const removeUser = useCallback(
    (u: RoleUser) =>
      confirm({
        title: '移除角色',
        content: `确认从用户“${u.name}”中移除角色“${role.name}”吗？`,
        okText: '确认',
        danger: true,
        onOk: async () => {
          await refresh(await removeRoleUser(role.id, u.id));
          message.success(MESSAGES.userRemoved);
        },
      }),
    [confirm, message, refresh, role.id, role.name],
  );

  const summary = [
    { label: '角色描述', value: role.description || '-' },
    { label: '设备权限类型', value: scopeName(role.scope) },
    { label: '用户数量', value: `${role.assignedUserIds.length} 个` },
    { label: '创建时间', value: role.created },
  ];

  return (
    <>
      <Button className={`${styles.btn} ${d.back}`} onClick={onBack}>
        ← 返回角色列表
      </Button>
      <div className={d.summary}>
        <div className={d.summaryTitle}>
          <div className={d.avatar}>♙</div>
          <h1>{role.name}</h1>
          <RoleTypeTag type={role.type} />
        </div>
        <div className={d.summaryGrid}>
          {summary.map((s) => (
            <div key={s.label}>
              <div className={d.label}>{s.label}</div>
              <div className={d.value}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
      <Tabs
        className={d.tabs}
        activeKey={tab}
        tabBarGutter={28}
        animated={false}
        onChange={(k) => setTab(k as DetailTab)}
        items={[
          { key: 'permissions', label: '功能权限' },
          { key: 'users', label: '用户分配' },
        ]}
        tabBarExtraContent={
          tab === 'permissions' && (
            <div className={d.detailActions}>
              <Button type="primary" className={styles.btn} onClick={() => void savePermissions()}>
                保存
              </Button>
              <Button className={styles.btn} onClick={() => void resetPermissions()}>
                重置
              </Button>
              {role.type === 'system' && (
                <Button className={styles.btn} onClick={restore}>
                  恢复默认
                </Button>
              )}
            </div>
          )
        }
      />
      {/* 切换页签不清草稿：草稿保存在本组件 state 中 */}
      <div className={d.panel}>
        {tab === 'permissions' ? (
          <PermissionPanel
            draft={draft}
            onDraftChange={setDraft}
            expanded={expanded}
            onExpandedChange={setExpanded}
            search={search}
            onSearchChange={setSearch}
          />
        ) : (
          <UserPanel
            role={role}
            filters={userFilters}
            onFiltersChange={onUserFiltersChange}
            onRemove={removeUser}
          />
        )}
      </div>
    </>
  );
}
