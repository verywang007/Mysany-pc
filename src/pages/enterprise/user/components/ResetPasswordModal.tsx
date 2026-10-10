import { useState } from 'react';
import { App, Button, Input } from 'antd';
import { resetUserPassword, type User } from '@/services/enterprise/user';
import {
  PASSWORD_MISMATCH_TEXT,
  PASSWORD_RULE_TEXT,
  strongPassword,
  MODAL_WIDTH,
} from '../constants';
import Field from './Field';
import UmModal from './UmModal';
import styles from './modal.module.css';

interface Props {
  user: User;
  onClose: () => void;
}

type ErrorKey = 'admin' | 'next' | 'confirm';

/**
 * 重置密码（两步）：① 管理员身份验证（只校验非空，原型如此）② 设置新密码。
 * 成功后只记录 passwordUpdatedAt，新密码不保存。
 */
export default function ResetPasswordModal({ user, onClose }: Props) {
  const { message } = App.useApp();
  const [step, setStep] = useState<1 | 2>(1);
  const [admin, setAdmin] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});

  const verify = () => {
    if (!admin) {
      setErrors({ admin: '请输入管理员密码' });
      return;
    }
    setErrors({});
    setStep(2);
  };

  const save = async () => {
    // 修正原型缺陷：原型第 2 步校验前不清空旧错误，两条错误可能同时显示；这里每次只显示当前这一条
    if (!strongPassword(next)) {
      setErrors({ next: PASSWORD_RULE_TEXT });
      return;
    }
    if (next !== confirm) {
      setErrors({ confirm: PASSWORD_MISMATCH_TEXT });
      return;
    }
    await resetUserPassword(user.id);
    onClose();
    message.success('密码重置成功');
  };

  const status = (k: ErrorKey) => (errors[k] ? ('error' as const) : undefined);

  return (
    <UmModal
      title={`重置'${user.name}'密码`}
      width={MODAL_WIDTH.small}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>取消</Button>
          {step === 1 ? (
            <Button type="primary" onClick={verify}>
              确定
            </Button>
          ) : (
            <Button type="primary" onClick={save}>
              确认重置
            </Button>
          )}
        </>
      }
    >
      {step === 1 ? (
        <>
          <div className={styles.infoTip}>请输入密码验证管理员身份</div>
          <Field label="管理员密码" required error={errors.admin} style={{ marginTop: 16 }}>
            <Input
              key="admin"
              autoFocus
              type="password"
              placeholder="请输入"
              value={admin}
              status={status('admin')}
              onChange={(e) => setAdmin(e.target.value)}
            />
          </Field>
        </>
      ) : (
        <>
          <Field label="新密码" required error={errors.next}>
            <Input
              key="next"
              autoFocus
              type="password"
              placeholder="请输入"
              value={next}
              status={status('next')}
              onChange={(e) => setNext(e.target.value)}
            />
          </Field>
          <Field label="确认密码" required error={errors.confirm}>
            <Input
              type="password"
              placeholder="请输入"
              value={confirm}
              status={status('confirm')}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </Field>
        </>
      )}
    </UmModal>
  );
}
