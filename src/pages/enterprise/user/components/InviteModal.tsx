import { useState } from 'react';
import { App, Button, Input, Radio, Select } from 'antd';
import {
  findInviteCandidate,
  getOrganizations,
  getRoles,
  sendInvite,
  type InviteCandidate,
} from '@/services/enterprise/user';
import { INVITE_PREFIXES, MODAL_WIDTH } from '../constants';
import Field from './Field';
import UmModal from './UmModal';
import styles from './modal.module.css';

interface Props {
  onClose: () => void;
}

type SearchType = 'phone' | 'email';
const toOptions = (list: string[]) => list.map((v) => ({ value: v, label: v }));

/**
 * 邀请用户（两步）：① 按完整手机号 / 邮箱精确查找候选人（区号不参与匹配，不支持回车）
 * ② 配置角色、组织（本弹窗角色在前、组织在后）与邀请说明。只写邀请记录，不创建用户。
 */
export default function InviteModal({ onClose }: Props) {
  const { message } = App.useApp();
  const [searchType, setSearchType] = useState<SearchType>('phone');
  const [keyword, setKeyword] = useState('');
  const [candidate, setCandidate] = useState<InviteCandidate | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [orgs, setOrgs] = useState<string[]>([]);
  const [remark, setRemark] = useState('');
  const [error, setError] = useState<{ search?: string; roles?: string; orgs?: string }>({});

  // 切换方式 / 重新选择：与原型整体重绘一致，输入内容和错误清空
  const backToSearch = (type: SearchType) => {
    setSearchType(type);
    setKeyword('');
    setCandidate(null);
    setRoles([]);
    setOrgs([]);
    setRemark('');
    setError({});
  };

  const search = async () => {
    const c = await findInviteCandidate(searchType, keyword.trim());
    if (!c) {
      setError({ search: '未找到可邀请的用户' });
      return;
    }
    setError({});
    setCandidate(c);
  };

  const send = async () => {
    if (!candidate) return;
    if (!roles.length) {
      setError({ roles: '请选择角色' });
      return;
    }
    if (!orgs.length) {
      setError({ orgs: '请选择组织' });
      return;
    }
    await sendInvite(candidate, roles, orgs, remark.trim());
    onClose();
    message.success('邀请已发送');
  };

  const footer = (
    <>
      <Button onClick={onClose}>取消</Button>
      {/* 第 1 步「发送邀请」始终禁用 */}
      <Button type="primary" disabled={!candidate} onClick={send}>
        发送邀请
      </Button>
    </>
  );

  return (
    <UmModal title="邀请用户" width={MODAL_WIDTH.normal} onClose={onClose} footer={footer}>
      {!candidate ? (
        <>
          <Radio.Group
            className={styles.segment}
            optionType="button"
            value={searchType}
            onChange={(e) => backToSearch(e.target.value as SearchType)}
            options={[
              { value: 'phone', label: '手机号' },
              { value: 'email', label: '邮箱' },
            ]}
          />
          <div className={styles.searchRow}>
            {searchType === 'phone' && (
              <Select
                autoFocus
                className={styles.searchPrefix}
                defaultValue="+86"
                options={toOptions(INVITE_PREFIXES)}
              />
            )}
            <Input
              key={searchType}
              autoFocus={searchType === 'email'}
              placeholder={searchType === 'phone' ? '请输入完整手机号' : '请输入完整邮箱'}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Button type="primary" onClick={search}>
              搜索
            </Button>
          </div>
          <div className={styles.help}>
            请输入已注册 MySANY 账号的完整手机号或邮箱。演示联系人：13341312180 / invite@example.com
          </div>
          <div className={styles.error}>{error.search}</div>
        </>
      ) : (
        <>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{candidate.name.slice(0, 1)}</div>
            <div>
              <strong>{candidate.name}</strong>
              {/* 有手机号时总显示手机号（原型如此） */}
              <small>{candidate.phone || candidate.email}</small>
            </div>
            <Button type="link" className={styles.link} onClick={() => backToSearch(searchType)}>
              重新选择
            </Button>
          </div>
          <div className={styles.block}>
            <Field label="分配角色" required error={error.roles}>
              <Select
                autoFocus
                mode="multiple"
                value={roles}
                options={toOptions(getRoles())}
                status={error.roles ? 'error' : undefined}
                onChange={setRoles}
              />
            </Field>
            <Field label="所属组织" required error={error.orgs}>
              <Select
                mode="multiple"
                value={orgs}
                options={toOptions(getOrganizations())}
                status={error.orgs ? 'error' : undefined}
                onChange={setOrgs}
              />
            </Field>
          </div>
          <Field label="邀请说明" showError={false}>
            <Input.TextArea
              className={styles.remark}
              placeholder="请输入邀请原因（选填）"
              maxLength={500}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </Field>
        </>
      )}
    </UmModal>
  );
}
