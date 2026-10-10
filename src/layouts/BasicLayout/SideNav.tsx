import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoubleLeftOutlined, DownOutlined } from '@ant-design/icons';
import Icon from '@/components/Icon';
import { MENU, leafRoute, type MenuNode } from '@/config/menu';
import styles from './SideNav.module.css';

interface Props {
  /** 当前页面对应的菜单叶子 key */
  activeKey?: string;
  collapsed: boolean;
  openKeys: string[];
  onToggleGroup: (key: string) => void;
  onToggleCollapsed: () => void;
}

const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(' ');

/** 浮层收起的延迟，与原型一致（鼠标从菜单移到浮层的途中不消失） */
const FLYOUT_HIDE_DELAY = 180;

/**
 * 左侧菜单：一级菜单 + 可展开分组；折叠态（64px）时悬停一级菜单弹出浮层子菜单。
 * 交互与原型 wb.js 的 renderMenu / flyout 一致。
 */
export default function SideNav({
  activeKey,
  collapsed,
  openKeys,
  onToggleGroup,
  onToggleCollapsed,
}: Props) {
  const navigate = useNavigate();
  const [flyout, setFlyout] = useState<{ node: MenuNode; anchorTop: number } | null>(null);
  const [flyoutTop, setFlyoutTop] = useState(0);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number>();

  const go = (leaf: MenuNode) => {
    setFlyout(null);
    navigate(leafRoute(leaf));
  };

  const cancelHide = () => window.clearTimeout(hideTimer.current);
  const scheduleHide = () => {
    cancelHide();
    hideTimer.current = window.setTimeout(() => setFlyout(null), FLYOUT_HIDE_DELAY);
  };

  // 浮层贴着菜单项显示，靠近底部时向上收，且不高于顶栏下方 56px
  useLayoutEffect(() => {
    if (!flyout || !flyoutRef.current) return;
    const h = flyoutRef.current.offsetHeight;
    setFlyoutTop(Math.max(56, Math.min(flyout.anchorTop, window.innerHeight - h - 10)));
  }, [flyout]);

  const onRowEnter = (node: MenuNode, el: HTMLElement) => {
    if (!collapsed) return;
    cancelHide();
    setFlyout({ node, anchorTop: el.getBoundingClientRect().top });
  };

  const onRowClick = (node: MenuNode) => {
    if (node.children) {
      if (!collapsed) onToggleGroup(node.key); // 折叠态由浮层处理
    } else {
      go(node);
    }
  };

  const renderRow = (node: MenuNode, on: boolean) => (
    <div
      className={cx(styles.row, on && styles.on)}
      onClick={() => onRowClick(node)}
      onMouseEnter={(e) => onRowEnter(node, e.currentTarget)}
    >
      {node.pro && <i className={styles.pro}>PRO</i>}
      <span className={styles.icon}>
        <Icon name={node.icon ?? 'box'} />
      </span>
      <span className={styles.label}>{node.label}</span>
      {node.children && <DownOutlined className={styles.arrow} />}
    </div>
  );

  const flyNode = flyout?.node;
  const flyKids = flyNode?.children?.length ? flyNode.children : null;

  return (
    <aside className={cx(styles.sider, collapsed && styles.collapsed)}>
      <nav className={styles.menu} aria-label="主导航" onMouseLeave={scheduleHide}>
        {MENU.map((node) => {
          if (!node.children) {
            return <div key={node.key}>{renderRow(node, node.key === activeKey)}</div>;
          }
          const hasOn = node.children.some((c) => c.key === activeKey);
          return (
            <div
              key={node.key}
              className={cx(
                styles.group,
                openKeys.includes(node.key) && styles.open,
                hasOn && styles.hasOn,
              )}
            >
              {renderRow(node, false)}
              <div className={styles.sub}>
                {node.children.map((c) => (
                  <div
                    key={c.key}
                    className={cx(styles.subItem, c.key === activeKey && styles.on)}
                    onClick={() => go(c)}
                  >
                    {c.label}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.deco} />
        <button
          type="button"
          className={styles.toggle}
          title="收起 / 展开"
          onClick={() => {
            onToggleCollapsed();
            setFlyout(null);
          }}
        >
          <DoubleLeftOutlined />
        </button>
      </div>

      {collapsed && flyNode && (
        <div
          ref={flyoutRef}
          className={styles.flyout}
          style={{ top: flyoutTop }}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        >
          {flyKids && <div className={styles.flyTitle}>{flyNode.label}</div>}
          {(flyKids ?? [flyNode]).map((c) => (
            <div
              key={c.key}
              className={cx(styles.flyItem, flyKids && c.key === activeKey && styles.on)}
              onClick={() => go(c)}
            >
              {c.label}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
