import { ownerUser, type OrgNode } from '@/services/enterprise/organization';
import { OwnerInline } from './parts';
import styles from '../index.module.css';

interface Props {
  node: OrgNode;
  parent: OrgNode | null;
}

const Item = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.infoItem}>
    <div className={styles.infoLabel}>{label}</div>
    <div className={styles.infoValue}>{value || '-'}</div>
  </div>
);

/** 组织信息卡：名称、编码、上级组织、负责人（跨 2 列）、描述 */
export default function OrgInfo({ node, parent }: Props) {
  const owner = ownerUser(node);
  return (
    <div className={styles.infoSection}>
      <h2>组织信息</h2>
      <div className={styles.infoCard}>
        <Item label="组织名称" value={node.name} />
        <Item label="组织编码" value={node.code || '-'} />
        <Item label="上级组织" value={parent ? parent.name : '-'} />
        <div className={`${styles.infoItem} ${styles.infoOwner}`}>
          <div className={styles.infoLabel}>组织负责人</div>
          <div className={styles.ownerInline}>
            <OwnerInline name={owner ? owner.name : '-'} phone={owner ? owner.phone : '-'} />
          </div>
        </div>
        <Item label="组织描述" value={node.description || '-'} />
      </div>
    </div>
  );
}
