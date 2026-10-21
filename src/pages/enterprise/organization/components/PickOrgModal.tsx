import { useState } from 'react';
import { Button } from 'antd';
import { orgOptions, type OrgNode } from '@/services/enterprise/organization';
import OrgModal from './OrgModal';
import { RootTag } from './parts';
import styles from '../index.module.css';

interface Props {
  tree: OrgNode[];
  onCancel: () => void;
  /** 多选：返回勾选的组织 id 列表（设备会同时挂到这些组织） */
  onOk: (orgIds: string[]) => void;
}

/**
 * 根组织行内「分配」→ 选择组织（宽 460）：深度优先列出全部组织（含根），**多选**。
 * 设备为多归属模型：勾选几个组织就同时挂到几个组织，不清除已有归属。
 */
export default function PickOrgModal({ tree, onCancel, onOk }: Props) {
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <OrgModal
      title="选择组织"
      width={460}
      onCancel={onCancel}
      footer={
        <>
          <span className={styles.selectedCount}>已选 {picked.length} 个组织</span>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" disabled={!picked.length} onClick={() => onOk(picked)}>
            确定
          </Button>
        </>
      }
    >
      <p className={styles.pickTip}>选择该设备要分配到的组织，可多选。</p>
      <div className={styles.pickList} role="group" aria-label="选择组织">
        {orgOptions(tree).map((o) => {
          const on = picked.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              role="checkbox"
              aria-checked={on}
              className={on ? `${styles.pickItem} ${styles.on}` : styles.pickItem}
              style={{ paddingLeft: 16 + o.depth * 20 }}
              onClick={() => toggle(o.id)}
            >
              <span className={styles.pickBox} aria-hidden="true" />
              <span className={styles.pickName}>{o.name}</span>
              {o.root && <RootTag />}
            </button>
          );
        })}
      </div>
    </OrgModal>
  );
}
