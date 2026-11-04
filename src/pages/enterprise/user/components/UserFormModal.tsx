import { useState } from 'react';
import { App, Button, Checkbox, Input, Select, Space } from 'antd';
import {
  createUser,
  getOrganizations,
  getResponsibilities,
  getRoles,
  updateUser,
  type User,
  type UserInput,
} from '@/services/enterprise/user';
import { getTenantType } from '@/services/enterprise/tenant';
import {
  EMAIL_PATTERN,
  NAME_FORBIDDEN,
  PASSWORD_MISMATCH_TEXT,
  PASSWORD_RULE_TEXT,
  PHONE_PREFIXES,
  strongPassword,
  MODAL_WIDTH,
} from '../constants';
import Field from './Field';
import UmModal from './UmModal';
import styles from './modal.module.css';

interface Props {
  /** 传入用户为编辑，否则为新增 */
  user?: User;
  onClose: () => void;
  onSaved: () => void;
}

type ErrorKey = 'name' | 'contact' | 'email' | 'orgs' | 'roles' | 'password' | 'confirm';

/** 登录账户提示文案：代理商租户的用户名（姓名）也属于登录账户 */
const CONTACT_HELP = {
  enterprise: '手机号、邮箱为登录账户，至少填写一项',
  agent: '手机号、邮箱、用户名为登录账户，至少填写一项',
} as const;

const toOptions = (list: string[]) => list.map((v) => ({ value: v, label: v }));

/**
 * 新增 / 编辑用户。点「确定」时一次性校验全部字段；设备范围类型由角色推导（见 services）。
 * 业务职责控件为多选，但只保存第一个选中值（原型如此）。
 * 登录账户（手机号、邮箱、用户名）一经设置不可修改：
 * - 新增：点「确定」先弹提示确认；
 * - 编辑：已填写过的字段锁定（disabled），仅空白字段可补填，补填后点「确定」弹提示确认。
 * 手机号下方的常驻提示文案按租户类型区分（企业客户 / 代理商，见 getTenantType）。
 */
export default function UserFormModal({ user, onClose, onSaved }: Props) {
  const { message, modal } = App.useApp();
  const isAdd = !user;
  // 代理商租户：联系方式 + 用户名共同构成登录账户（仅影响提示文案）
  const isAgent = getTenantType().includes('代理商');
  const contactHelp = isAgent ? CONTACT_HELP.agent : CONTACT_HELP.enterprise;
  // 登录账户字段锁定：编辑时已填写过的不可再修改
  const nameLocked = !!user?.name;
  const phoneLocked = !!user?.phone;
  const emailLocked = !!user?.email;
  const [name, setName] = useState(user?.name ?? '');
  // 编辑时区号为空则显示 +86（原型如此，保存后会写入 +86）
  const [prefix, setPrefix] = useState(user?.prefix || '+86');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [force, setForce] = useState(true);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [duties, setDuties] = useState<string[]>(user?.responsibility ? [user.responsibility] : []);
  const [orgs, setOrgs] = useState<string[]>(user?.orgs ?? []);
  const [roles, setRoles] = useState<string[]>(user?.roles ?? []);
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});

  const submit = async (input: UserInput) => {
    if (isAdd) await createUser(input, force);
    else await updateUser(user.id, input);
    onClose();
    onSaved();
    message.success(isAdd ? '用户新增成功' : '用户信息已保存');
  };

  const save = async () => {
    const n = name.trim();
    const p = phone.trim();
    const e = email.trim();
    const next: Partial<Record<ErrorKey, string>> = {};
    if (!n) next.name = '请输入姓名';
    else if (NAME_FORBIDDEN.test(n)) next.name = '姓名不能包含特殊字符';
    if (!p && !e) next.contact = contactHelp;
    if (e && !EMAIL_PATTERN.test(e)) next.email = '请输入有效邮箱';
    if (!orgs.length) next.orgs = '请选择所属组织';
    if (!roles.length) next.roles = '请选择角色';
    if (isAdd) {
      if (!strongPassword(password)) next.password = PASSWORD_RULE_TEXT;
      if (!confirm || confirm !== password) next.confirm = PASSWORD_MISMATCH_TEXT;
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    const input: UserInput = { name: n, prefix, phone: p, email: e, orgs, roles, duties };
    // 登录账户一经设置不可修改：新增必先确认；编辑仅当补填了原本为空的手机号 / 邮箱时确认
    // （姓名在编辑时恒已填写并被锁定，无需判断）
    if (isAdd || (!!user && ((!!p && !user.phone) || (!!e && !user.email)))) {
      modal.confirm({
        title: '提示',
        content: '手机号、邮箱、用户名作为登录账户，确定后不可修改。',
        okText: '确定',
        cancelText: '取消',
        icon: null,
        onOk: () => submit(input),
      });
      return;
    }
    await submit(input);
  };

  // 修正原型缺陷：原型定义了 .bad 红框样式但从未使用，校验失败时字段不变红
  const status = (k: ErrorKey) => (errors[k] ? ('error' as const) : undefined);

  return (
    <UmModal
      title={isAdd ? '新增用户' : '编辑用户'}
      width={MODAL_WIDTH.form}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={save}>
            确定
          </Button>
        </>
      }
    >
      <div className={styles.block}>
        <Field label="姓名" required error={errors.name}>
          <Input
            autoFocus
            placeholder="请输入姓名"
            value={name}
            disabled={nameLocked}
            status={status('name')}
            onChange={(ev) => setName(ev.target.value)}
          />
        </Field>
        <Field
          label="手机号"
          help={phoneLocked ? '已设置为登录账户，不可修改' : contactHelp}
          error={errors.contact}
        >
          <Space.Compact className={styles.phone}>
            <Select
              value={prefix}
              options={toOptions(PHONE_PREFIXES)}
              onChange={setPrefix}
              disabled={phoneLocked}
              status={status('contact')}
            />
            <Input
              placeholder="请输入手机号"
              value={phone}
              disabled={phoneLocked}
              status={status('contact')}
              onChange={(ev) => setPhone(ev.target.value)}
            />
          </Space.Compact>
        </Field>
        <Field
          label="邮箱"
          help={emailLocked ? '已设置为登录账户，不可修改' : undefined}
          error={errors.email}
        >
          <Input
            placeholder="请输入邮箱"
            value={email}
            disabled={emailLocked}
            status={status('email')}
            onChange={(ev) => setEmail(ev.target.value)}
          />
        </Field>
      </div>

      {isAdd && (
        <div className={styles.block}>
          <Checkbox
            className={styles.check}
            checked={force}
            onChange={(ev) => setForce(ev.target.checked)}
          >
            <strong>首次登录强制修改密码</strong>
            <small className={styles.help}>
              勾选后，用户首次登录时需要强制修改密码，以确保账号安全
            </small>
          </Checkbox>
          <Field label="初始密码" required error={errors.password} style={{ marginTop: 18 }}>
            <Input
              type="password"
              placeholder="请输入初始密码"
              value={password}
              status={status('password')}
              onChange={(ev) => setPassword(ev.target.value)}
            />
          </Field>
          <Field label="确认密码" required error={errors.confirm}>
            <Input
              type="password"
              placeholder="请输入确认密码"
              value={confirm}
              status={status('confirm')}
              onChange={(ev) => setConfirm(ev.target.value)}
            />
          </Field>
        </div>
      )}

      <div className={styles.block}>
        <Field label="业务职责" showError={false}>
          <Select
            mode="multiple"
            value={duties}
            options={toOptions(getResponsibilities())}
            onChange={setDuties}
          />
        </Field>
        <Field label="所属组织" required error={errors.orgs}>
          <Select
            mode="multiple"
            value={orgs}
            options={toOptions(getOrganizations())}
            status={status('orgs')}
            onChange={setOrgs}
          />
        </Field>
        <Field label="分配角色" required error={errors.roles}>
          <Select
            mode="multiple"
            value={roles}
            options={toOptions(getRoles())}
            status={status('roles')}
            onChange={setRoles}
          />
        </Field>
      </div>
    </UmModal>
  );
}
