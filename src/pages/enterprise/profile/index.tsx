import { useState } from 'react';
import Icon from '@/components/Icon';
import InfoPane from './components/InfoPane';
import InvitePane from './components/InvitePane';
import PasswordPane from './components/PasswordPane';
import { PROFILE_TABS, type ProfileTab } from './constants';
import styles from './index.module.css';

/**
 * 个人中心：个人信息 / 修改密码 / 通知邀请 三个页签。
 * 规格见 docs/page-specs/企业服务-个人中心.md。
 */
export default function Profile() {
  const [tab, setTab] = useState<ProfileTab>('info');

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        {PROFILE_TABS.map((t) => (
          <div
            key={t.key}
            className={t.key === tab ? `${styles.navItem} ${styles.on}` : styles.navItem}
            onClick={() => setTab(t.key)}
          >
            <Icon name={t.icon} size={15} />
            {t.label}
          </div>
        ))}
      </nav>
      <div className={styles.body}>
        {/* 切换页签不重置修改密码表单（各页签保持挂载） */}
        <div hidden={tab !== 'info'}>
          <InfoPane />
        </div>
        <div hidden={tab !== 'pwd'}>
          <PasswordPane />
        </div>
        <div hidden={tab !== 'invite'}>
          <InvitePane />
        </div>
      </div>
    </div>
  );
}
