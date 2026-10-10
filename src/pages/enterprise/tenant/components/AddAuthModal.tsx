import { useEffect, useRef, useState } from 'react';
import { App, Button, Input, type InputRef } from 'antd';
import {
  addAuthentication,
  isAuthenticated,
  verifyCustomerCode,
  type CustomerInfo,
} from '@/services/enterprise/tenant';
import { CustomerGrid } from './InfoItem';
import TenantModal from './TenantModal';
import styles from '../modal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

/**
 * 添加客户认证：先验证（D365 查询），再提交。
 * 与原型一致：验证阶段不判断是否已认证；输入时不更新红框 / 错误文字；
 * 提交报错时信息卡保留上一次验证的客户。
 */
export default function AddAuthModal({ open, onClose, onAdded }: Props) {
  const { message } = App.useApp();
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState<CustomerInfo | null>(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (open) {
      setCode('');
      setVerified(null);
      setError('');
      setOk('');
    }
  }, [open]);

  // 原型每次重渲染弹窗后都会重新聚焦客户编码输入框
  const refocus = () => setTimeout(() => inputRef.current?.focus(), 20);

  const verify = async () => {
    refocus();
    const input = code.trim();
    // 先查询再一次性更新状态，避免信息卡闪烁
    const data = input ? await verifyCustomerCode(input) : null;
    setCode(input);
    setVerified(data);
    setOk(data ? '客户编码有效' : '');
    setError(!input ? '请输入D365客户编码' : !data ? '未查询到有效的客户信息' : '');
  };

  const submit = async () => {
    refocus();
    const input = code.trim();
    setCode(input);
    if (!verified || verified.customerCode !== input) {
      setError('请先验证客户编码');
      setOk('');
      return;
    }
    if (isAuthenticated(input)) {
      setError('该客户编码已完成认证');
      setOk('');
      return;
    }
    await addAuthentication(verified);
    onAdded();
    message.success('客户认证添加成功');
  };

  return (
    <TenantModal
      open={open}
      title="添加客户认证"
      onClose={onClose}
      onOpened={() => inputRef.current?.focus()}
      footer={
        <>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={submit}>
            提交认证
          </Button>
        </>
      }
    >
      <div className={styles.infoTip}>
        <i>!</i>请输入完整的客户编号，系统将自动验证其有效性
      </div>
      <div className={styles.verifyRow}>
        <div className={styles.formRow}>
          <label className={styles.required} htmlFor="tn-auth-code">
            客户编码
          </label>
          <Input
            ref={inputRef}
            id="tn-auth-code"
            placeholder="请输入D365客户编码"
            value={code}
            status={error ? 'error' : undefined}
            onChange={(e) => setCode(e.target.value)}
            onPressEnter={(e) => {
              e.preventDefault();
              verify();
            }}
          />
        </div>
        <Button className={styles.verifyBtn} onClick={verify}>
          验证
        </Button>
      </div>
      {error ? (
        <div className={`${styles.verifyMsg} ${styles.err}`}>● {error}</div>
      ) : ok ? (
        <div className={`${styles.verifyMsg} ${styles.ok}`}>● {ok}</div>
      ) : null}
      {verified && (
        <div className={styles.card}>
          <CustomerGrid customer={verified} />
        </div>
      )}
    </TenantModal>
  );
}
