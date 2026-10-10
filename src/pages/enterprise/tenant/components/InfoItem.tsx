import type { CustomerInfo } from '@/services/enterprise/tenant';
import { CUSTOMER_FIELDS } from '../constants';
import styles from '../index.module.css';

/** 标签 + 值，空值显示「-」（原型 infoItem） */
export function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.infoItem}>
      <div className={styles.infoLabel}>{label}</div>
      <div className={styles.infoValue}>{value || '-'}</div>
    </div>
  );
}

/** 客户信息 3 列网格（验证结果卡、详情卡共用） */
export function CustomerGrid({ customer }: { customer: CustomerInfo }) {
  return (
    <div className={styles.customerGrid}>
      {CUSTOMER_FIELDS.map((f) => (
        <InfoItem key={f.key} label={f.label} value={customer[f.key]} />
      ))}
    </div>
  );
}

/** 负责人：姓名 ▏ 电话 */
export function OwnerInline({
  name,
  phone,
  className,
}: {
  name: string;
  phone: string;
  className?: string;
}) {
  return (
    <div className={className ?? styles.ownerInline}>
      <span className={styles.ownerName}>{name}</span>
      <span className={styles.ownerDivider} aria-hidden="true" />
      <span>{phone || '-'}</span>
    </div>
  );
}
