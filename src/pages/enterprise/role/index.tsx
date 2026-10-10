import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Button, Input, Pagination, Select, Table } from 'antd';
import {
  deleteRole,
  getRole,
  listRoles,
  restoreDefaultPermissions,
  type Role,
  type RoleFilters,
} from '@/services/enterprise/role';
import type { PageResult } from '@/types/common';
import { getRoleColumns } from './columns';
import RoleDetail from './components/RoleDetail';
import RoleFormModal, { type RoleFormState } from './components/RoleFormModal';
import {
  EMPTY_FILTERS,
  EMPTY_USER_FILTERS,
  MESSAGES,
  PAGE_SIZE_OPTIONS,
  ROLE_TYPE_OPTIONS,
  SCOPE_OPTIONS,
} from './constants';
import { useRoleConfirm } from './useRoleConfirm';
import styles from './index.module.css';

/**
 * 企业服务 › 角色管理：列表视图与详情视图在页面内切换（不改路由，刷新回到列表第 1 页）。
 * 规格见 docs/page-specs/企业服务-角色管理.md。
 */
export default function RoleManagement() {
  const { message } = App.useApp();
  const confirm = useRoleConfirm();
  const [filters, setFilters] = useState<RoleFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState<PageResult<Role>>({ list: [], total: 0 });
  const [reload, setReload] = useState(0);
  const [form, setForm] = useState<RoleFormState | null>(null);
  // 详情：detail 为进入时读取的角色，entry 用于每次进入都重置详情内部状态
  const [detail, setDetail] = useState<{ role: Role; entry: number } | null>(null);
  const [userFilters, setUserFilters] = useState(EMPTY_USER_FILTERS);

  const refreshList = () => setReload((n) => n + 1);

  useEffect(() => {
    if (detail) return;
    let alive = true;
    void listRoles({ ...filters, page, pageSize }).then((r) => alive && setData(r));
    return () => {
      alive = false;
    };
  }, [filters, page, pageSize, reload, detail]);

  // 筛选实时生效，并回到第 1 页
  const setFilter = (patch: Partial<RoleFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };

  const enterDetail = async (id: string) => {
    const role = await getRole(id);
    if (role) setDetail((d) => ({ role, entry: (d?.entry ?? 0) + 1 }));
  };

  const backToList = useCallback(() => setDetail(null), []);

  const requestRestore = (r: Role) =>
    confirm({
      title: '确认恢复默认',
      content: `确认将角色“${r.name}”的功能权限恢复为系统默认值吗？`,
      okText: '确认',
      onOk: async () => {
        await restoreDefaultPermissions(r.id);
        refreshList();
        message.success(MESSAGES.restored);
      },
    });

  const requestDelete = (r: Role) => {
    if (r.assignedUserIds.length) {
      confirm({
        title: '无法删除',
        content: `角色“${r.name}”已关联 ${r.assignedUserIds.length} 名用户，请先移除关联用户。`,
        okText: '知道了',
        onOk: () => undefined,
      });
      return;
    }
    confirm({
      title: '确认删除',
      content: `确认删除角色“${r.name}”吗？删除后不可恢复。`,
      okText: '删除',
      danger: true,
      onOk: async () => {
        await deleteRole(r.id);
        // 修正原型缺陷：删除最后一页唯一一条后页码不回退，会显示空表「无结果」而总数不为 0
        const { total } = await listRoles({ ...filters, page: 1, pageSize });
        setPage((p) => Math.min(p, Math.max(1, Math.ceil(total / pageSize))));
        refreshList();
        message.success(MESSAGES.deleted);
      },
    });
  };

  const columns = getRoleColumns({
    onDetail: (r) => void enterDetail(r.id),
    onEdit: (r) => setForm({ mode: 'edit', role: r }),
    onDelete: requestDelete,
    onRestore: requestRestore,
  });

  const typeOptions = useMemo(() => ROLE_TYPE_OPTIONS, []);
  const scopeOptions = useMemo(
    () => SCOPE_OPTIONS.map(({ value, label }) => ({ value, label })),
    [],
  );

  return (
    <div className={styles.page}>
      {detail ? (
        <RoleDetail
          key={detail.entry}
          initialRole={detail.role}
          userFilters={userFilters}
          onUserFiltersChange={setUserFilters}
          onBack={backToList}
        />
      ) : (
        <>
          <div className={styles.filter}>
            {/* 修正原型缺陷：原型每输入一个字符整块重渲染导致输入框丢焦点 */}
            <Input
              className={styles.input}
              placeholder="请输入角色名称"
              value={filters.name}
              onChange={(e) => setFilter({ name: e.target.value })}
            />
            <Select
              className={styles.select}
              placeholder="请选择角色类型"
              allowClear
              value={filters.type || undefined}
              options={typeOptions}
              onChange={(v?: string) => setFilter({ type: v ?? '' })}
            />
            <Select
              className={styles.select}
              placeholder="请选择设备权限类型"
              allowClear
              value={filters.scope || undefined}
              options={scopeOptions}
              onChange={(v?: string) => setFilter({ scope: v ?? '' })}
            />
            <Button
              type="primary"
              className={`${styles.btn} ${styles.add}`}
              onClick={() => setForm({ mode: 'add' })}
            >
              新增角色
            </Button>
          </div>
          <div className={`${styles.tableWrap} ${styles.roleTableWrap}`}>
            <Table<Role>
              className={styles.table}
              rowKey="id"
              tableLayout="fixed"
              columns={columns}
              dataSource={data.list}
              pagination={false}
              scroll={{ x: 1040, y: 305 }}
              locale={{ emptyText: <div className={styles.empty}>无结果</div> }}
            />
          </div>
          <div className={styles.pagination}>
            {/* 修正原型缺陷：原型每页条数下拉不回显所选值 */}
            <Pagination
              current={page}
              pageSize={pageSize}
              total={data.total}
              showTotal={(t) => `${t} 条记录`}
              showSizeChanger
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              showLessItems={false}
              itemRender={(_, type, el) =>
                type === 'prev' ? (
                  <button type="button">‹</button>
                ) : type === 'next' ? (
                  <button type="button">›</button>
                ) : (
                  el
                )
              }
              onChange={(p, size) => {
                if (size !== pageSize) {
                  setPageSize(size);
                  setPage(1);
                } else setPage(p);
              }}
            />
          </div>
        </>
      )}
      <RoleFormModal
        state={form}
        onClose={() => setForm(null)}
        onSaved={() => {
          // 筛选条件不清空（与原型一致，新角色可能不在当前筛选结果中）
          setPage(1);
          refreshList();
        }}
      />
    </div>
  );
}
