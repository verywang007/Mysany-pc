import { useEffect, useState } from 'react';
import { App } from 'antd';
import Icon from '@/components/Icon';
import { getInvites, type InviteSummary } from '@/services/enterprise/profile';
import styles from '../index.module.css';

const TABS = [
  { key: 'all', label: '全部' },
  { key: 'done', label: '已处理' },
  { key: 'todo', label: '待处理' },
] as const;

/**
 * 通知邀请：全部 / 已处理 / 待处理 页签 + 规则说明 + 空状态。
 * 与原型一致：页签只切换高亮，不做过滤（原型无邀请数据，也没有行模板）。
 */
export default function InvitePane() {
  const { modal } = App.useApp();
  const [data, setData] = useState<InviteSummary>();
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('all');

  useEffect(() => {
    getInvites().then(setData);
  }, []);

  const showRule = () =>
    modal.confirm({
      title: '规则说明',
      content: '收到他人发起的租户邀请后，可在此处处理。处理结果会同步到通知列表。',
      icon: null,
      okText: '确定',
      cancelText: '取消',
    });

  return (
    <>
      <div className={styles.ivTabs}>
        {TABS.map((t) => (
          <span
            key={t.key}
            className={t.key === tab ? `${styles.ivTab} ${styles.on}` : styles.ivTab}
            onClick={() => setTab(t.key)}
          >
            {t.label}({data?.[t.key] ?? 0})
          </span>
        ))}
        <span className={styles.ivRule} onClick={showRule}>
          查看规则说明
        </span>
      </div>
      {data && data.rows.length === 0 && (
        <div className={styles.empty}>
          <Icon name="box" size={54} />
          暂无数据
        </div>
      )}
    </>
  );
}
