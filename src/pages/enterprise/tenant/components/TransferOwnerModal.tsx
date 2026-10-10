import { useEffect, useRef, useState } from 'react';
import { App, Button, Select, type RefSelectProps } from 'antd';
import {
  findTenantUser,
  listTenantUsers,
  transferOwner,
  type TenantInfo,
  type TenantUser,
} from '@/services/enterprise/tenant';
import { OwnerInline } from './InfoItem';
import TenantModal from './TenantModal';
import styles from '../modal.module.css';

interface Props {
  open: boolean;
  owner: TenantUser;
  onClose: () => void;
  onTransferred: (tenant: TenantInfo) => void;
}

/** 转让租户负责人：无二次确认，确认后同步根组织负责人 */
export default function TransferOwnerModal({ open, owner, onClose, onTransferred }: Props) {
  const { message } = App.useApp();
  const [ownerId, setOwnerId] = useState<string>();
  const [error, setError] = useState('');
  const selectRef = useRef<RefSelectProps>(null);

  useEffect(() => {
    if (open) {
      setOwnerId(undefined);
      setError('');
    }
  }, [open]);

  const options = listTenantUsers()
    .filter((u) => u.id !== owner.id)
    .map((u) => ({
      value: u.id,
      label: u.name + (u.phone && u.phone !== '-' ? `（${u.phone}）` : ''),
    }));

  const confirm = async () => {
    // 与原型一致：报错后重新选择不会清除红框和错误，直到再次点确认
    if (!ownerId) {
      setError('请选择新负责人');
      return;
    }
    const tenant = await transferOwner(ownerId);
    onTransferred(tenant);
    message.success(`租户负责人已转让给“${findTenantUser(ownerId).name}”`);
  };

  return (
    <TenantModal
      open={open}
      title="转让租户负责人"
      onClose={onClose}
      onOpened={() => selectRef.current?.focus()}
      footer={
        <>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={confirm}>
            确认转让
          </Button>
        </>
      }
    >
      <div className={styles.formRow}>
        <label>当前负责人</label>
        <OwnerInline name={owner.name} phone={owner.phone} className={styles.ownerPanel} />
      </div>
      <div className={styles.formRow}>
        <label className={styles.required} htmlFor="tn-new-owner">
          新负责人
        </label>
        <Select
          ref={selectRef}
          id="tn-new-owner"
          className={styles.block}
          placeholder="请选择新负责人"
          value={ownerId}
          options={options}
          status={error ? 'error' : undefined}
          onChange={(v: string) => setOwnerId(v)}
        />
        <div className={styles.fieldError}>{error}</div>
      </div>
      <div className={styles.ownerNote}>租户负责人转让后，根组织负责人将同步更新为新负责人。</div>
    </TenantModal>
  );
}
