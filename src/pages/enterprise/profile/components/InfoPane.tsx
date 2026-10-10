import { useState, type ReactNode } from 'react';
import { App } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import Icon from '@/components/Icon';
import {
  getCurrentTenant,
  listTenants,
  maskPhone,
  updateProfile,
  useProfile,
} from '@/services/common/account';
import { EMAIL_RE, PHONE_RE } from '../constants';
import PromptModal, { type PromptOptions } from './PromptModal';
import styles from '../index.module.css';

/** 个人信息：6 个字段（姓名 / 业务职责可修改，手机号 / 邮箱可换绑）+ 租户信息 */
export default function InfoPane() {
  const { message } = App.useApp();
  const profile = useProfile();
  const [prompt, setPrompt] = useState<PromptOptions | null>(null);
  const tenant = getCurrentTenant();

  // 修改仅存于内存，刷新后恢复（与原型一致）
  const editText = (field: 'name' | 'role', title: string) =>
    setPrompt({
      title,
      initial: profile[field],
      onOk: (v) => {
        if (!v) return '内容不能为空';
        updateProfile({ [field]: v });
        message.success('修改成功');
      },
    });

  const rebind = (field: 'phone' | 'email') =>
    setPrompt(
      field === 'phone'
        ? {
            title: '换绑手机号',
            desc: '本地演示：直接填写新的手机号即可。',
            placeholder: '请输入新手机号',
            onOk: (v) => {
              if (!PHONE_RE.test(v)) return '手机号格式不正确';
              updateProfile({ phone: maskPhone(v) });
              message.success('换绑成功');
            },
          }
        : {
            title: '换绑邮箱',
            desc: '本地演示：直接填写新的邮箱即可。',
            placeholder: '请输入新邮箱',
            onOk: (v) => {
              if (!EMAIL_RE.test(v)) return '邮箱格式不正确';
              updateProfile({ email: v });
              message.success('换绑成功');
            },
          },
    );

  const edit = (onClick: () => void) => (
    <span className={styles.edit} title="修改" onClick={onClick}>
      <EditOutlined />
    </span>
  );
  const rebindLink = (onClick: () => void) => (
    <span className={styles.lnk} onClick={onClick}>
      换绑
    </span>
  );

  const fields: [string, string, ReactNode?][] = [
    ['用户姓名', profile.name, edit(() => editText('name', '修改用户姓名'))],
    ['手机号', profile.phone, rebindLink(() => rebind('phone'))],
    ['邮箱', profile.email, rebindLink(() => rebind('email'))],
    ['业务职责', profile.role, edit(() => editText('role', '修改业务职责'))],
    ['账号创建时间', profile.created],
    ['最后登录时间', profile.lastLogin],
  ];

  const tenantCard = (t: { name: string; type: string; current?: boolean }, pill: boolean) => (
    <div className={styles.tenant}>
      <span className={styles.tenantIcon}>
        <Icon name="hex" size={20} />
      </span>
      <div>
        <div className={styles.tenantName}>{t.name}</div>
        <div className={styles.tenantType}>{t.type}</div>
      </div>
      {pill && t.current && <span className={styles.pill}>当前</span>}
    </div>
  );

  return (
    <>
      <h3 className={styles.h}>个人信息</h3>
      <div className={styles.infoCard}>
        {fields.map(([label, value, action]) => (
          <div key={label}>
            <div className={styles.label}>{label}</div>
            <div className={styles.value}>
              {value}
              {action}
            </div>
          </div>
        ))}
      </div>

      <h3 className={styles.h}>租户信息</h3>
      <div className={styles.tenantWrap}>
        <div className={styles.tenantLabel}>当前租户</div>
        {tenantCard(tenant, false)}
        <div className={`${styles.tenantLabel} ${styles.tenantListLabel}`}>所属租户列表</div>
        {listTenants().map((t) => (
          <div key={t.name}>{tenantCard(t, true)}</div>
        ))}
      </div>

      <PromptModal
        options={prompt}
        onClose={() => setPrompt(null)}
        onError={(msg) => message.error(msg)}
      />
    </>
  );
}
