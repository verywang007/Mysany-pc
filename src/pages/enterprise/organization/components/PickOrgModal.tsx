import { useState } from 'react';
import { Button } from 'antd';
import { orgOptions, type OrgNode } from '@/services/enterprise/organization';
import OrgModal from './OrgModal';
import { RootTag } from './parts';
import styles from '../index.module.css';

interface Props {
  tree: OrgNode[];
  onCancel: () => void;
  onOk: (orgId: string) => void;
}

/** 根组织行内「分配」→ 选择组织（宽 460）：深度优先列出全部组织（含根），单选 */
export default function PickOrgModal({ tree, onCancel, onOk }: Props) {
  const [picked, setPicked] = useState('');
  return (
    <OrgModal
      title="选择组织"
      width={460}
      onCancel={onCancel}
      footer={
        <>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" disabled={!picked} onClick={() => onOk(picked)}>
            确定
          </Button>
        </>
      }
    >
      <p className={styles.pickTip}>选择该设备要分配到的组织。</p>
      <div className={styles.pickList} role="radiogroup">
        {orgOptions(tree).map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={picked === o.id}
            className={picked === o.id ? `${styles.pickItem} ${styles.on}` : styles.pickItem}
            style={{ paddingLeft: 16 + o.depth * 20 }}
            onClick={() => setPicked(o.id)}
          >
            <span className={styles.pickRadio} aria-hidden="true" />
            <span className={styles.pickName}>{o.name}</span>
            {o.root && <RootTag />}
          </button>
        ))}
      </div>
    </OrgModal>
  );
}
