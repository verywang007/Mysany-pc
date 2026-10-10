import { useState } from 'react';
import { Button, Input } from 'antd';
import type { OrgUser } from '@/services/enterprise/organization';
import { DESC_MAX, NAME_MAX, validateOrgName } from '../constants';
import OrgModal from './OrgModal';
import { OwnerInline } from './parts';
import styles from '../index.module.css';

export interface OrgFormInit {
  mode: 'add' | 'edit';
  name: string;
  /** 原值为 '-' 时传空 */
  description: string;
  /** 上级组织名称：创建为父节点名称；编辑为父节点名称，无父时为「根组织」 */
  parentName: string;
  /** 只读展示的负责人：创建为当前用户，编辑为 ownerUser(node) */
  owner: OrgUser | undefined;
}

interface Props {
  init: OrgFormInit;
  onCancel: () => void;
  onSave: (values: { name: string; description: string }) => void;
}

/**
 * 创建 / 编辑组织（宽 600）。只在点「保存」时校验，命中一条即停，错误显示在名称下方；
 * 输入过程中不实时校验，Enter 不提交（与原型一致）。
 */
export default function OrgFormModal({ init, onCancel, onSave }: Props) {
  const [name, setName] = useState(init.name);
  const [desc, setDesc] = useState(init.description);
  const [error, setError] = useState<{ msg: string; bad: boolean } | null>(null);

  const save = () => {
    const n = name.trim();
    const err = validateOrgName(n);
    setError(err);
    if (!err) onSave({ name: n, description: desc.trim() });
  };

  return (
    <OrgModal
      title={init.mode === 'edit' ? '编辑组织' : '创建组织'}
      width={600}
      onCancel={onCancel}
      footer={
        <>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={save}>
            保存
          </Button>
        </>
      }
    >
      <div className={styles.formRow}>
        <label className={styles.required} htmlFor="org-form-name">
          组织名称
        </label>
        <Input
          id="org-form-name"
          autoFocus
          maxLength={NAME_MAX}
          placeholder="请输入"
          status={error?.bad ? 'error' : undefined}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className={styles.fieldError}>{error?.msg}</div>
      </div>
      <div className={styles.formRow}>
        <label htmlFor="org-form-parent">上级组织</label>
        <Input id="org-form-parent" disabled value={init.parentName} />
        <div className={styles.fieldError} />
      </div>
      <div className={styles.formRow}>
        <label>组织负责人</label>
        <div className={styles.formOwner}>
          <OwnerInline name={init.owner?.name ?? '-'} phone={init.owner?.phone ?? '-'} />
        </div>
        <div className={styles.formHelp}>组织负责人由创建者自动担任。</div>
      </div>
      <div className={styles.formRow}>
        <label htmlFor="org-form-desc">组织描述</label>
        <div className={styles.textareaWrap}>
          <Input.TextArea
            id="org-form-desc"
            maxLength={DESC_MAX}
            placeholder="请输入"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <span className={styles.count}>
            {desc.length} / {DESC_MAX}
          </span>
        </div>
        <div className={styles.fieldError} />
      </div>
    </OrgModal>
  );
}
