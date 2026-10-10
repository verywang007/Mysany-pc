import { Button } from 'antd';
import type { AuthRecord } from '@/services/enterprise/tenant';
import { MODAL_WIDTH } from '../constants';
import { CustomerGrid, InfoItem } from './InfoItem';
import TenantModal from './TenantModal';
import styles from '../modal.module.css';

interface Props {
  open: boolean;
  record?: AuthRecord;
  onClose: () => void;
}

/** 客户编号详情（只读） */
export default function AuthDetailModal({ open, record, onClose }: Props) {
  return (
    <TenantModal
      open={open && !!record}
      title="客户编号详情"
      width={MODAL_WIDTH.detail}
      onClose={onClose}
      footer={<Button onClick={onClose}>关闭</Button>}
    >
      {record && (
        <>
          <div className={styles.detailTitle}>客户基础信息</div>
          <div className={styles.card}>
            <CustomerGrid customer={record} />
          </div>
          <div className={`${styles.detailTitle} ${styles.detailTitleNext}`}>认证信息</div>
          <div className={styles.card}>
            <div className={styles.grid3}>
              <InfoItem label="认证时间" value={record.creationDate} />
            </div>
          </div>
        </>
      )}
    </TenantModal>
  );
}
