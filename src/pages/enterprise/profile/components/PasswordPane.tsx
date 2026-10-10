import { useState, type FormEvent } from 'react';
import { App, Button, Input } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { changePassword } from '@/services/enterprise/profile';
import { VERIFY_MODES, isValidPassword, type VerifyMode } from '../constants';
import styles from '../index.module.css';

type Field = 'verify' | 'next' | 'repeat';
const EMPTY = { verify: '', next: '', repeat: '' };

/**
 * 修改密码：三种验证方式（旧密码 / 短信 / 邮箱）、密码显隐、提交时三项同时校验。
 * 校验规则与文案沿用原型；短信 / 邮箱模式没有「获取验证码」按钮（原型如此）。
 */
export default function PasswordPane() {
  const { message } = App.useApp();
  const [mode, setMode] = useState<VerifyMode>('old');
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const current = VERIFY_MODES.find((m) => m.key === mode)!;

  const set = (k: Field, v: string) => setValues((s) => ({ ...s, [k]: v }));

  const switchMode = (m: VerifyMode) => {
    setMode(m);
    set('verify', '');
    // 修正原型缺陷：原型切换方式时只清空错误文字，不清除红框
    setErrors((e) => ({ ...e, verify: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<Field, string>> = {};
    if (!values.verify.trim()) next.verify = `请输入${current.label}`;
    // 新密码、确认密码不去首尾空格
    if (!values.next) next.next = '请输入新密码';
    else if (!isValidPassword(values.next)) next.next = '密码需 8-20 位，且同时包含字母和数字';
    if (values.repeat !== values.next) next.repeat = '两次输入的密码不一致';
    setErrors(next);
    if (Object.keys(next).length) return;

    await changePassword();
    setValues(EMPTY);
    message.success('密码修改成功（本地演示，未提交服务器）');
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    message.info('已重置');
  };

  const field = (k: Field, label: string, password: boolean) => {
    const props = {
      value: values[k],
      placeholder: '请输入',
      status: errors[k] ? ('error' as const) : undefined,
      onChange: (e: { target: { value: string } }) => set(k, e.target.value),
      className: styles.ipt,
    };
    return (
      <div className={styles.fld}>
        <label>
          <span className={styles.req}>*</span>
          {label}
        </label>
        {password ? <Input.Password {...props} /> : <Input {...props} />}
        <div className={styles.err}>{errors[k]}</div>
      </div>
    );
  };

  return (
    <>
      <div className={styles.pwHead}>
        <h3 className={styles.h}>修改密码</h3>
        <p>为了您的账号安全，请定期修改密码</p>
      </div>
      <form className={styles.pw} autoComplete="off" onSubmit={submit}>
        <div className={styles.fld}>
          <label>
            <span className={styles.req}>*</span>验证方式
          </label>
          <div className={styles.rads}>
            {VERIFY_MODES.map((m) => (
              <span
                key={m.key}
                className={m.key === mode ? `${styles.rad} ${styles.on}` : styles.rad}
                onClick={() => switchMode(m.key)}
              >
                {m.option}
              </span>
            ))}
          </div>
        </div>
        {field('verify', current.label, mode === 'old')}
        {field('next', '新密码', true)}
        {field('repeat', '确认密码', true)}
        <Button type="primary" htmlType="submit" block className={styles.pwBtn}>
          确认修改
        </Button>
        <Button block icon={<ReloadOutlined />} onClick={reset} className={styles.pwBtn}>
          重置
        </Button>
      </form>
    </>
  );
}
