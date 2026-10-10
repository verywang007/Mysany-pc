import { useEffect, useState, type ReactNode } from 'react';
import { App, Button, Modal, Switch } from 'antd';
import CookiePreferences from '@/components/CookiePreferences';
import { PERSONAL_ADS_DESC } from '@/components/CookiePreferences/constants';
import DocModal from '@/components/DocModal';
import Icon from '@/components/Icon';
import { getSettingsDoc, type SettingsDocKey } from '@/services/common/agreements';
import {
  COOKIE_CATEGORY_TOTAL,
  enabledCookieCount,
  loadSettings,
  pickCookieFlags,
  saveSettings,
  type Settings,
} from '@/services/common/settings';
import styles from './index.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * 设置弹窗（顶栏用户下拉 → 设置）：隐私协议、用户服务协议、Cookies 设置、个性化广告。
 * 规格见 docs/page-specs/公共-设置弹窗.md。
 * - 打开时读取 ms_settings 生成草稿，「保存」才写入，取消 / × / 遮罩 / Esc 直接丢弃；
 * - 「查看」协议在同一弹窗层内切换为阅读页（900px），返回后草稿保留；
 * - Cookies 抽屉里确认即写入 Cookie 四类，并同步到草稿，不会带上未保存的个性化广告。
 */
export default function SettingsModal({ open, onClose }: Props) {
  const { message } = App.useApp();
  const [draft, setDraft] = useState<Settings>(loadSettings);
  const [page, setPage] = useState<'main' | SettingsDocKey>('main');
  const [cookieOpen, setCookieOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(loadSettings());
    setPage('main');
  }, [open]);

  const save = () => {
    saveSettings(draft);
    onClose();
    message.success('设置已保存');
  };

  const row = (icon: string, title: string, desc: ReactNode, right: ReactNode) => (
    <div className={styles.row}>
      <span className={styles.icon}>
        <Icon name={icon} />
      </span>
      <div className={styles.main}>
        <div className={styles.title}>{title}</div>
        <div className={styles.desc}>{desc}</div>
      </div>
      <div className={styles.right}>{right}</div>
    </div>
  );

  const link = (text: string, onClick: () => void) => (
    <span className={styles.link} onClick={onClick}>
      {text}
      <Icon name="chevronRight" size={11} strokeWidth={2.4} />
    </span>
  );

  return (
    <>
      <Modal
        open={open && page === 'main'}
        width={560}
        centered
        title="设置"
        className={styles.modal}
        onCancel={onClose}
        footer={
          <>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" onClick={save}>
              保存
            </Button>
          </>
        }
        // Cookies 抽屉打开时，Esc 只关闭抽屉（修正原型中抽屉与设置弹窗同时被关闭的问题）
        keyboard={!cookieOpen}
      >
        {row(
          'shield',
          '隐私协议',
          '了解我们收集哪些信息、如何使用与保护，以及你享有的权利。',
          link('查看', () => setPage('privacy')),
        )}
        {row(
          'doc',
          '用户服务协议',
          '了解服务范围、账号安全责任与使用规范。',
          link('查看', () => setPage('service')),
        )}
        {row(
          'cookie',
          'Cookies 设置',
          <>
            管理各类 Cookie 的启用状态，了解它们分别用于什么。
            <div className={styles.status}>
              已启用 {enabledCookieCount(draft)} / {COOKIE_CATEGORY_TOTAL} 类
            </div>
          </>,
          link('设置', () => setCookieOpen(true)),
        )}
        {row(
          'ads',
          '个性化广告',
          PERSONAL_ADS_DESC,
          <Switch
            className={styles.switch}
            checked={draft.personalAds}
            onChange={(v) => setDraft((d) => ({ ...d, personalAds: v }))}
          />,
        )}
      </Modal>

      <DocModal
        doc={open && page !== 'main' ? getSettingsDoc(page) : null}
        backText="返回设置"
        onBack={() => setPage('main')}
        onClose={onClose}
      />

      <CookiePreferences
        open={cookieOpen}
        onClose={() => {
          setCookieOpen(false);
          setDraft((d) => ({ ...d, ...pickCookieFlags(loadSettings()) }));
        }}
      />
    </>
  );
}
