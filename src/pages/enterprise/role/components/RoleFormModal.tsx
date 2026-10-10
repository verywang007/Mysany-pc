import { useEffect, useRef, useState } from 'react';
import { App, Button, Input, Modal, Radio, type InputRef } from 'antd';
import { createRole, roleNameExists, updateRole, type Role } from '@/services/enterprise/role';
import { FORM_ERRORS, MESSAGES, SCOPE_OPTIONS } from '../constants';
import styles from '../index.module.css';
import m from './RoleModal.module.css';

/** 打开方式：新增（role 为空）或编辑某个自定义角色 */
export interface RoleFormState {
  mode: 'add' | 'edit';
  role?: Role;
}

interface Props {
  state: RoleFormState | null;
  onClose: () => void;
  /** 保存成功（已写入存储）后回调，由列表回到第 1 页并刷新 */
  onSaved: () => void;
}

interface Errors {
  name?: string;
  scope?: string;
}

/**
 * 新增 / 编辑角色弹窗。点「保存」时才校验（先清空再逐项校验，多个错误同时显示），
 * 输入时不实时校验、不清错误；回车无提交行为；点遮罩不关闭，Esc 关闭。
 */
export default function RoleFormModal({ state, onClose, onSaved }: Props) {
  const { message } = App.useApp();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [scope, setScope] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const nameInput = useRef<InputRef>(null);

  useEffect(() => {
    if (!state) return;
    setName(state.role?.name ?? '');
    setDesc(state.role?.description ?? '');
    setScope(state.role?.scope ?? '');
    setErrors({});
  }, [state]);

  const save = async () => {
    if (!state) return;
    const n = name.trim();
    const next: Errors = {};
    if (!n) next.name = FORM_ERRORS.nameRequired;
    else if (await roleNameExists(n, state.role?.id)) next.name = FORM_ERRORS.nameExists;
    if (!scope) next.scope = FORM_ERRORS.scopeRequired;
    setErrors(next);
    if (next.name || next.scope) return;
    const input = { name: n, description: desc.trim(), scope };
    if (state.mode === 'add') await createRole(input);
    else if (state.role) await updateRole(state.role.id, input);
    onClose();
    onSaved();
    message.success(state.mode === 'add' ? MESSAGES.created : MESSAGES.updated);
  };

  return (
    <Modal
      open={!!state}
      title={state?.mode === 'edit' ? '编辑角色' : '新增角色'}
      width={520}
      centered
      maskClosable={false}
      keyboard
      destroyOnHidden
      className={m.modal}
      styles={{ mask: { background: 'var(--role-mask)' } }}
      onCancel={onClose}
      afterOpenChange={(open) => open && nameInput.current?.focus()}
      footer={[
        <Button key="cancel" className={styles.btn} onClick={onClose}>
          取消
        </Button>,
        <Button key="save" type="primary" className={styles.btn} onClick={() => void save()}>
          保存
        </Button>,
      ]}
    >
      <div className={m.formBlock}>
        <div className={m.formRow}>
          <label className={`${m.formLabel} ${m.required}`}>角色名称</label>
          <Input
            ref={nameInput}
            className={m.field}
            maxLength={50}
            placeholder="请输入"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className={m.help}>角色名称在租户内必须唯一</div>
          <div className={m.error}>{errors.name}</div>
        </div>
        <div className={m.formRow}>
          <label className={m.formLabel}>角色描述</label>
          <Input.TextArea
            className={m.textarea}
            maxLength={200}
            placeholder="请输入"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <div className={m.help}>描述角色的职能和权限范围</div>
        </div>
      </div>
      <div className={m.formBlock}>
        <div className={m.formRow}>
          <label className={`${m.formLabel} ${m.required}`}>设备权限类型</label>
          <Radio.Group
            className={m.scopeOptions}
            value={scope || undefined}
            onChange={(e) => setScope(String(e.target.value))}
          >
            {SCOPE_OPTIONS.map((s) => (
              <Radio
                key={s.value}
                value={s.value}
                className={scope === s.value ? `${m.scopeOption} ${m.active}` : m.scopeOption}
              >
                <strong>{s.label}</strong>
                <small>{s.desc}</small>
              </Radio>
            ))}
          </Radio.Group>
          <div className={m.error}>{errors.scope}</div>
        </div>
      </div>
    </Modal>
  );
}
