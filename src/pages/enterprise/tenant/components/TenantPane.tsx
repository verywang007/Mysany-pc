import { EditOutlined } from '@ant-design/icons';
import type { TenantInfo, TenantUser } from '@/services/enterprise/tenant';
import { tenantColors as c } from '@/theme/pages/tenant';
import { InfoItem, OwnerInline } from './InfoItem';
import styles from '../index.module.css';

interface Props {
  tenant: TenantInfo;
  owner: TenantUser;
  onEditContact: () => void;
  onTransfer: () => void;
}

type CountType = 'org' | 'user' | 'device';

/** 数量卡右侧图标（原型 countIcon 的内联 SVG） */
function CountIcon({ type }: { type: CountType }) {
  if (type === 'org')
    return (
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="15" r="9" fill={c.iconOrgTop} />
        <circle cx="15" cy="45" r="9" fill={c.iconOrgLeft} />
        <circle cx="49" cy="45" r="9" fill={c.iconOrgRight} />
        <path d="M32 24v8M20 41l12-9 12 9" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  if (type === 'user')
    return (
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="21" r="13" fill={c.iconUserHead} />
        <path d="M10 57c2-15 11-22 22-22s20 7 22 22" fill={c.iconUserBody} />
        <circle cx="46" cy="24" r="9" fill={c.iconUserSide} opacity=".75" />
      </svg>
    );
  return (
    <svg viewBox="0 0 64 64" fill="none">
      <rect x="7" y="7" width="50" height="50" rx="15" fill={c.iconDevice} />
      <path
        d="m22 19 8 8-5 5-8-8a12 12 0 0 0 14 14l12 12 7-7-12-12a12 12 0 0 0-16-12z"
        fill="#fff"
      />
    </svg>
  );
}

/** 页签一：租户基础信息 + 租户负责人 + 数量卡片 */
export default function TenantPane({ tenant: t, owner, onEditContact, onTransfer }: Props) {
  const info: [string, string][] = [
    ['租户类型', t.tenantType],
    ['联系人姓名', t.contactName],
    ['客户编码', t.customerCode],
    ['联系人手机号', `+${t.phoneCountryCode} ${t.contactPhone}`],
    ['企业名称', t.companyName],
    ['联系人邮箱', t.contactEmail],
    ['企业注册号', t.registrationNo],
    ['注册地址', t.address],
    ['开通时间', t.activationTime],
  ];
  const counts: { label: string; value: number; icon: CountType }[] = [
    { label: '组织数量', value: t.orgCount, icon: 'org' },
    { label: '用户数量', value: t.userCount, icon: 'user' },
    { label: '设备数量', value: t.deviceCount, icon: 'device' },
  ];

  return (
    <section>
      <div className={styles.sectionHead}>
        <h1>租户基础信息</h1>
        <button type="button" className={styles.editContact} onClick={onEditContact}>
          <EditOutlined />
          编辑联系人信息
        </button>
      </div>
      <div className={styles.infoCard}>
        <div className={styles.infoGrid}>
          {info.map(([label, value]) => (
            <InfoItem key={label} label={label} value={value} />
          ))}
          <div className={styles.ownerBlock}>
            <div className={styles.ownerHead}>
              <div className={styles.infoLabel}>租户负责人</div>
              <button type="button" className={styles.link} onClick={onTransfer}>
                转让
              </button>
            </div>
            <OwnerInline name={owner.name} phone={owner.phone} />
          </div>
        </div>
      </div>
      <div className={styles.countGrid}>
        {counts.map((x) => (
          <div key={x.label} className={styles.countCard}>
            <div>
              <div className={styles.countLabel}>{x.label}</div>
              <div className={styles.countValue}>{x.value}</div>
            </div>
            <div className={styles.countIcon}>
              <CountIcon type={x.icon} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
