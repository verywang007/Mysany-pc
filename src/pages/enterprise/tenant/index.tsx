import { useEffect, useState } from 'react';
import { ConfigProvider } from 'antd';
import {
  findTenantUser,
  getAuthentication,
  loadTenantDemo,
  type AuthRecord,
  type TenantInfo,
} from '@/services/enterprise/tenant';
import AddAuthModal from './components/AddAuthModal';
import AuthDetailModal from './components/AuthDetailModal';
import AuthPane from './components/AuthPane';
import DeleteAuthModal from './components/DeleteAuthModal';
import EditContactModal from './components/EditContactModal';
import TenantPane from './components/TenantPane';
import TransferOwnerModal from './components/TransferOwnerModal';
import { TENANT_TABS, TENANT_THEME, type TenantTab } from './constants';
import styles from './index.module.css';

type ModalType = 'edit-contact' | 'transfer-owner' | 'add-auth' | 'auth-detail' | 'delete-auth';

/**
 * 企业服务 › 租户管理：租户管理 / 客户认证 两个页签（不改 URL、不持久化，与原型一致）。
 * 规格见 docs/page-specs/企业服务-租户管理.md。
 */
export default function TenantManagement() {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [tab, setTab] = useState<TenantTab>('tenant');
  const [authPage, setAuthPage] = useState(1);
  const [authPageSize, setAuthPageSize] = useState(10);
  const [authVersion, setAuthVersion] = useState(0);
  const [modal, setModal] = useState<ModalType | null>(null);
  /** 查看 / 删除的记录；关闭时保留，避免关闭动画中内容消失 */
  const [authTarget, setAuthTarget] = useState<AuthRecord>();

  // 每次进入本页都会把当前负责人写入 ms_tenant_owner_id（在 service 内）
  useEffect(() => {
    loadTenantDemo().then(setTenant);
  }, []);

  const close = () => setModal(null);
  const openAuth = (type: 'auth-detail' | 'delete-auth', id: string) => {
    setAuthTarget(getAuthentication(id));
    setModal(type);
  };
  const authChanged = () => {
    setAuthPage(1);
    setAuthVersion((v) => v + 1);
    close();
  };
  const tenantSaved = (t: TenantInfo) => {
    setTenant(t);
    close();
  };

  if (!tenant) return null;
  // 负责人不在候选名单中时回退显示 5656（与原型一致，ownerId 仍保留原值）
  const owner = findTenantUser(tenant.ownerId);

  return (
    <ConfigProvider theme={TENANT_THEME}>
      <div className={styles.page}>
        <div className={styles.tabs} role="tablist">
          {TENANT_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={t.key === tab}
              className={t.key === tab ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className={styles.content}>
          {tab === 'tenant' ? (
            <TenantPane
              tenant={tenant}
              owner={owner}
              onEditContact={() => setModal('edit-contact')}
              onTransfer={() => setModal('transfer-owner')}
            />
          ) : (
            <AuthPane
              page={authPage}
              pageSize={authPageSize}
              version={authVersion}
              onPageChange={(p, size) => {
                setAuthPage(p);
                setAuthPageSize(size);
              }}
              onAdd={() => setModal('add-auth')}
              onView={(id) => openAuth('auth-detail', id)}
              onDelete={(id) => openAuth('delete-auth', id)}
            />
          )}
        </div>
      </div>

      <EditContactModal
        open={modal === 'edit-contact'}
        tenant={tenant}
        onClose={close}
        onSaved={tenantSaved}
      />
      <TransferOwnerModal
        open={modal === 'transfer-owner'}
        owner={owner}
        onClose={close}
        onTransferred={tenantSaved}
      />
      <AddAuthModal open={modal === 'add-auth'} onClose={close} onAdded={authChanged} />
      <AuthDetailModal open={modal === 'auth-detail'} record={authTarget} onClose={close} />
      <DeleteAuthModal
        open={modal === 'delete-auth'}
        record={authTarget}
        onClose={close}
        onDeleted={authChanged}
      />
    </ConfigProvider>
  );
}
