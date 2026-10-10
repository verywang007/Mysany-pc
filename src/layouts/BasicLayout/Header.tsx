import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Dropdown, type MenuProps } from 'antd';
import { BellOutlined, CaretDownFilled, DownOutlined, GlobalOutlined } from '@ant-design/icons';
import logo from '@/assets/icon-mysanyLogo.svg';
import { CURRENT_TENANT, CURRENT_USER, LANGUAGE_OPTIONS, TENANT_LIST } from '@/config/app';
import { LOGIN_PATH } from '@/router/resolve';
import SettingsModal from '@/components/SettingsModal';
import { useGoMenu } from '@/router/useGoMenu';
import { useProfile } from '@/services/common/account';
import { listMessages, type Message } from '@/services/common/messages';
import styles from './Header.module.css';

interface Props {
  collapsed: boolean;
}

/** 下拉浮层紧贴顶栏底边（原型为顶栏高度 - 4px） */
const DROPDOWN_ALIGN = { offset: [0, -8] as [number, number] };

/** 顶栏：logo + 消息 / 语言 / 租户 / 用户 四个下拉，交互与原型 wb.js 一致 */
export default function Header({ collapsed }: Props) {
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const go = useGoMenu();
  const { name } = useProfile();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadVisible, setUnreadVisible] = useState(true);
  const [bellOpen, setBellOpen] = useState(false);
  const [lang, setLang] = useState(LANGUAGE_OPTIONS[0]);

  useEffect(() => {
    listMessages().then(setMessages);
  }, []);

  const langMenu: MenuProps = {
    items: LANGUAGE_OPTIONS.map((l) => ({ key: l, label: l })),
    selectable: true,
    selectedKeys: [lang],
    onClick: ({ key }) => {
      setLang(key);
      message.success(`语言已切换为 ${key}`);
    },
  };

  const tenantMenu: MenuProps = {
    items: TENANT_LIST.map((t) => ({ key: t.name, label: t.name })),
    selectable: true,
    selectedKeys: TENANT_LIST.filter((t) => t.current).map((t) => t.name),
  };

  const userMenu: MenuProps = {
    items: [
      { key: 'personal', label: '个人中心' },
      { key: 'settings', label: '设置' },
      { key: 'logout', label: '退出登录' },
    ],
    onClick: ({ key }) => {
      if (key === 'personal') {
        go('personal');
      } else if (key === 'settings') {
        setSettingsOpen(true);
      } else {
        modal.confirm({
          title: '退出登录',
          content: '确定要退出当前账号吗？',
          okText: '确定',
          cancelText: '取消',
          icon: null,
          onOk: () => navigate(LOGIN_PATH),
        });
      }
    },
  };

  const markAllRead = () => {
    setUnreadVisible(false);
    setBellOpen(false);
    message.success('已全部标记为已读');
  };

  return (
    <header className={styles.header}>
      <div className={collapsed ? `${styles.logo} ${styles.logoCollapsed}` : styles.logo}>
        <img src={logo} alt="My SANY" />
      </div>
      <div className={styles.spacer} />
      <div className={styles.right}>
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          align={DROPDOWN_ALIGN}
          open={bellOpen}
          onOpenChange={setBellOpen}
          popupRender={() => (
            <div className={styles.msgPanel}>
              <div className={styles.msgHead}>
                通知 ({messages.length})
                <span className={styles.msgClear} onClick={markAllRead}>
                  全部已读
                </span>
              </div>
              <div className={styles.msgList}>
                {messages.map((m) => (
                  <div key={m.id} className={styles.msgRow}>
                    <i>{m.time}</i>
                    <b>{m.title}</b>
                    <span>{m.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        >
          <span className={styles.item} aria-label="通知">
            <span className={styles.bell}>
              <BellOutlined />
              {unreadVisible && <em className={styles.badge}>{messages.length}</em>}
            </span>
          </span>
        </Dropdown>

        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          align={DROPDOWN_ALIGN}
          menu={langMenu}
        >
          <span className={styles.item}>
            <GlobalOutlined />
            <span>{lang}</span>
          </span>
        </Dropdown>

        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          align={DROPDOWN_ALIGN}
          menu={tenantMenu}
        >
          <span className={styles.item}>
            <span>{CURRENT_TENANT.name}</span>
            <CaretDownFilled className={styles.caret} />
          </span>
        </Dropdown>

        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          align={DROPDOWN_ALIGN}
          menu={userMenu}
        >
          <span className={styles.item}>
            <span className={styles.avatar}>{CURRENT_USER.avatar}</span>
            <span>{name}</span>
            <DownOutlined className={styles.caret} />
          </span>
        </Dropdown>
      </div>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
