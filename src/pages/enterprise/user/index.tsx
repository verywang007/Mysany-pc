import { useEffect, useMemo, useState } from 'react';
import { App, Pagination } from 'antd';
import { CURRENT_USER } from '@/config/app';
import { initUserStore, listUsers, type User, type UserQuery } from '@/services/enterprise/user';
import { buildColumns, type RowAction } from './columns';
import BatchAssignModal from './components/BatchAssignModal';
import BoxTable from './components/BoxTable';
import controls from './components/controls.module.css';
import DeleteUserModal from './components/DeleteUserModal';
import ImportAssignModal from './components/ImportAssignModal';
import ImportUserModal from './components/ImportUserModal';
import InviteModal from './components/InviteModal';
import InviteRecordsModal from './components/InviteRecordsModal';
import PersonalDevicesModal from './components/PersonalDevicesModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import Toolbar, { type ToolbarAction } from './components/Toolbar';
import UserFormModal from './components/UserFormModal';
import { PAGE_SIZES } from './constants';
import styles from './index.module.css';

/** 当前打开的弹窗：同一时刻只有一个 */
type ModalState =
  | { type: ToolbarAction }
  | { type: 'edit' | 'reset' | 'delete' | 'personal'; user: User };

const EMPTY_FILTERS: UserQuery = { query: '', org: '', role: '', scope: '' };

/**
 * 企业服务 › 用户管理。规格见 docs/page-specs/企业服务-用户管理.md。
 * 查询条件、页码、每页条数只存在内存中；用户与邀请数据经 services 读写本地存储。
 */
export default function UserManagement() {
  const { message } = App.useApp();
  const [filters, setFilters] = useState<UserQuery>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [version, setVersion] = useState(0);
  const [modal, setModal] = useState<ModalState | null>(null);

  // 页面启动时读取本地存储
  useState(() => initUserStore());

  useEffect(() => {
    let alive = true;
    listUsers({ ...filters, page, pageSize }).then((res) => {
      if (!alive) return;
      // 删除后页码取 min(当前页, 新的最大页)
      const max = Math.max(1, Math.ceil(res.total / pageSize));
      if (page > max) {
        setPage(max);
        return;
      }
      setRows(res.list);
      setTotal(res.total);
    });
    return () => {
      alive = false;
    };
  }, [filters, page, pageSize, version]);

  const reload = () => setVersion((v) => v + 1);
  /** 新增 / 编辑 / 导入用户后回到第 1 页 */
  const reloadFirst = () => {
    setPage(1);
    reload();
  };
  const close = () => setModal(null);

  const onFilter = (patch: Partial<UserQuery>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };

  const columns = useMemo(
    () =>
      buildColumns((action: RowAction, user: User) => {
        if (action === 'delete' && user.id === CURRENT_USER.id) {
          message.error('当前登录用户不能删除');
          return;
        }
        setModal({ type: action, user });
      }),
    [message],
  );

  const renderModal = () => {
    if (!modal) return null;
    switch (modal.type) {
      case 'add':
        return <UserFormModal onClose={close} onSaved={reloadFirst} />;
      case 'edit':
        return <UserFormModal user={modal.user} onClose={close} onSaved={reloadFirst} />;
      case 'reset':
        return <ResetPasswordModal user={modal.user} onClose={close} />;
      case 'delete':
        return <DeleteUserModal user={modal.user} onClose={close} onDeleted={reload} />;
      case 'personal':
        return <PersonalDevicesModal user={modal.user} onClose={close} />;
      case 'invite':
        return <InviteModal onClose={close} />;
      case 'records':
        return <InviteRecordsModal onClose={close} />;
      case 'import':
        return <ImportUserModal onClose={close} onSaved={reloadFirst} />;
      case 'importAssign':
        return <ImportAssignModal onClose={close} onSaved={reload} />;
      case 'assign':
        return <BatchAssignModal onClose={close} />;
    }
  };

  return (
    <div className={`${styles.page} ${controls.controls}`}>
      <Toolbar filters={filters} onFilter={onFilter} onAction={(type) => setModal({ type })} />
      <BoxTable<User>
        className={styles.tableWrap}
        columns={columns}
        dataSource={rows}
        rowKey="id"
        minWidth={1520}
        empty="无结果"
      />
      <div className={styles.pagination}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          pageSizeOptions={PAGE_SIZES}
          showTotal={(t, [from, to]) => `显示第 ${from} 到 ${to} 条，共 ${t} 条记录`}
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
            // 切换每页条数后回到第 1 页
            if (size !== pageSize) {
              setPageSize(size);
              setPage(1);
            } else setPage(p);
          }}
        />
      </div>
      {renderModal()}
    </div>
  );
}
