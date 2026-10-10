import { useEffect, useRef, useState } from 'react';
import { App, Button, Input, Select, Space, type InputRef } from 'antd';
import { saveContact, type ContactForm, type TenantInfo } from '@/services/enterprise/tenant';
import { EMAIL_RE, MODAL_WIDTH, PHONE_CODE_OPTIONS } from '../constants';
import TenantModal from './TenantModal';
import styles from '../modal.module.css';

interface Props {
  open: boolean;
  tenant: TenantInfo;
  onClose: () => void;
  onSaved: (tenant: TenantInfo) => void;
}

type Errors = Partial<Record<'name' | 'phone' | 'email', string>>;

const pick = (t: TenantInfo): ContactForm => ({
  contactName: t.contactName,
  phoneCountryCode: t.phoneCountryCode,
  contactPhone: t.contactPhone,
  contactEmail: t.contactEmail,
});

/** 编辑联系人信息：点保存时一次性校验全部字段，多个错误同时显示 */
export default function EditContactModal({ open, tenant, onClose, onSaved }: Props) {
  const { message } = App.useApp();
  const [form, setForm] = useState<ContactForm>(() => pick(tenant));
  const [errors, setErrors] = useState<Errors>({});
  const nameRef = useRef<InputRef>(null);

  useEffect(() => {
    if (open) {
      setForm(pick(tenant));
      setErrors({});
    }
    // 只在打开时用当前数据重置表单
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (patch: Partial<ContactForm>) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    const name = form.contactName.trim();
    const code = form.phoneCountryCode;
    const phone = form.contactPhone.trim();
    const email = form.contactEmail.trim();
    const next: Errors = {};
    if (!name) next.name = '请输入联系人姓名';
    // 与原型一致：手机号不做格式 / 位数校验；出错时只标红号码输入框
    if (!code || !phone) next.phone = '请完整填写联系人手机号';
    if (!email) next.email = '请输入联系人邮箱';
    else if (!EMAIL_RE.test(email)) next.email = '请输入正确的邮箱地址';
    setErrors(next);
    if (Object.keys(next).length) return;
    const saved = await saveContact({
      contactName: name,
      phoneCountryCode: code,
      contactPhone: phone,
      contactEmail: email,
    });
    onSaved(saved);
    message.success('联系人信息已保存');
  };

  return (
    <TenantModal
      open={open}
      title="编辑联系人信息"
      width={MODAL_WIDTH.editContact}
      onClose={onClose}
      onOpened={() => nameRef.current?.focus()}
      footer={
        <>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={save}>
            保存
          </Button>
        </>
      }
    >
      <div className={styles.formRow}>
        <label className={styles.required} htmlFor="tn-contact-name">
          联系人姓名
        </label>
        <Input
          ref={nameRef}
          id="tn-contact-name"
          placeholder="请输入联系人姓名"
          value={form.contactName}
          status={errors.name ? 'error' : undefined}
          onChange={(e) => set({ contactName: e.target.value })}
        />
        <div className={styles.fieldError}>{errors.name}</div>
      </div>
      <div className={styles.formRow}>
        <label className={styles.required}>联系人手机号</label>
        <Space.Compact className={styles.phoneGroup}>
          <Select
            className={styles.phoneCode}
            value={form.phoneCountryCode}
            options={PHONE_CODE_OPTIONS}
            onChange={(v: string) => set({ phoneCountryCode: v })}
          />
          <Input
            className={styles.phoneInput}
            placeholder="请输入联系人手机号"
            value={form.contactPhone}
            status={errors.phone ? 'error' : undefined}
            onChange={(e) => set({ contactPhone: e.target.value })}
          />
        </Space.Compact>
        <div className={styles.fieldError}>{errors.phone}</div>
      </div>
      <div className={styles.formRow}>
        <label className={styles.required} htmlFor="tn-contact-email">
          联系人邮箱
        </label>
        <Input
          id="tn-contact-email"
          placeholder="请输入联系人邮箱"
          value={form.contactEmail}
          status={errors.email ? 'error' : undefined}
          onChange={(e) => set({ contactEmail: e.target.value })}
        />
        <div className={styles.fieldError}>{errors.email}</div>
      </div>
    </TenantModal>
  );
}
