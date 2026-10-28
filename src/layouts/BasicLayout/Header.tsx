import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Dropdown, Tooltip, type MenuProps } from 'antd';
import {
  AppstoreOutlined,
  BellOutlined,
  CaretDownFilled,
  DownOutlined,
  GlobalOutlined,
  RightOutlined,
} from '@ant-design/icons';
import logo from '@/assets/icon-mysanyLogo.svg';
import { CURRENT_TENANT, CURRENT_USER, LANGUAGE_OPTIONS, TENANT_LIST } from '@/config/app';
import { LOGIN_PATH } from '@/router/resolve';
import Icon from '@/components/Icon';
import MessageCenter, { type MessageTab } from '@/components/MessageCenter';
import SettingsModal from '@/components/SettingsModal';
import { useGoMenu } from '@/router/useGoMenu';
import { useProfile } from '@/services/common/account';
import { knowledgeCommentPath } from '@/services/training/knowledge';
import {
  formatMessageTime,
  listMessages,
  MESSAGE_TYPES,
  type Message,
} from '@/services/common/messages';
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
  const [bellOpen, setBellOpen] = useState(false);
  const [center, setCenter] = useState<{ open: boolean; tab: MessageTab }>({
    open: false,
    tab: 'all',
  });
  const [lang, setLang] = useState(LANGUAGE_OPTIONS[0]);

  useEffect(() => {
    listMessages().then(setMessages);
  }, []);

  const unreadCount = messages.filter((m) => !m.read).length;

  /** 下拉按分类汇总：每类取最新一条，有未读显示红点；按最新时间倒序 */
  const groups = useMemo(
    () =>
      MESSAGE_TYPES.map((t) => {
        const list = messages.filter((m) => m.type === t.key);
        return { ...t, latest: list[0], hasUnread: list.some((m) => !m.read) };
      })
        .filter((g) => g.latest)
        .sort((a, b) => b.latest.time.localeCompare(a.latest.time)),
    [messages],
  );

  const markRead = (ids: string[]) => {
    const set = new Set(ids);
    setMessages((prev) => prev.map((m) => (set.has(m.id) ? { ...m, read: true } : m)));
  };

  const openCenter = (tab: MessageTab) => {
    setBellOpen(false);
    setCenter({ open: true, tab });
  };

  const openComment = (m: Message) => {
    if (!m.comment) return;
    setCenter((c) => ({ ...c, open: false }));
    navigate(knowledgeCommentPath(m.comment));
  };

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
    markRead(messages.map((m) => m.id));
    setBellOpen(false);
    message.success('已全部标记为已读');
  };

  return (
    <header className={styles.header}>
      <div className={collapsed ? `${styles.logo} ${styles.logoCollapsed}` : styles.logo}>
        <img src={logo} alt="My SANY" />
      </div>
      <Tooltip title="场景目录">
        <button
          type="button"
          aria-label="场景目录"
          className={styles.scenesBtn}
          onClick={() => navigate('/scenes')}
        >
          <AppstoreOutlined />
        </button>
      </Tooltip>
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
                消息通知
                {unreadCount > 0 && (
                  <span className={styles.msgClear} onClick={markAllRead}>
                    全部已读
                  </span>
                )}
              </div>
              <div className={styles.msgList}>
                {groups.map((g) => (
                  <div key={g.key} className={styles.msgRow} onClick={() => openCenter(g.key)}>
                    <span className={styles.msgIcon}>
                      <Icon name={g.icon} size={22} />
                    </span>
                    <div className={styles.msgMain}>
                      <div className={styles.msgTop}>
                        {g.hasUnread && <i className={styles.msgDot} />}
                        <b>{g.label}</b>
                        <time>{formatMessageTime(g.latest.time)}</time>
                      </div>
                      <div className={styles.msgDesc}>{g.latest.title}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.msgFoot}>
                <span onClick={() => openCenter('all')}>
                  查看更多 <RightOutlined />
                </span>
              </div>
            </div>
          )}
        >
          <span className={styles.item} aria-label="通知">
            <span className={styles.bell}>
              <BellOutlined />
              {unreadCount > 0 && (
                <em className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</em>
              )}
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
      <MessageCenter
        open={center.open}
        tab={center.tab}
        messages={messages}
        onRead={markRead}
        onOpenComment={openComment}
        onClose={() => setCenter((c) => ({ ...c, open: false }))}
      />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
