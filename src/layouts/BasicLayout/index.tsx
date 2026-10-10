import { Suspense, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { pageTitle } from '@/config/app';
import { resolveRoute } from '@/router/resolve';
import { STORAGE_KEYS, writeText } from '@/utils/storage';
import Header from './Header';
import SideNav from './SideNav';
import { useSiderState } from './useSiderState';
import styles from './index.module.css';

/**
 * 主布局：顶栏 + 侧栏 + 内容区。登录后的页面都在这里渲染。
 * 与 sany-admin 的差异：MySANY 门户没有多页签栏和水印，切换菜单即切换页面。
 */
export default function BasicLayout() {
  const { pathname } = useLocation();
  const sider = useSiderState();
  const route = resolveRoute(pathname);
  const { revealLeaf } = sider;
  const leafKey = route.leaf ? (route.leaf.activeKey ?? route.leaf.key) : undefined;

  useEffect(() => {
    document.title = pageTitle(route.title);
    if (leafKey) {
      writeText(STORAGE_KEYS.route, leafKey);
      revealLeaf(leafKey);
    }
    window.scrollTo(0, 0);
  }, [route.title, leafKey, revealLeaf]);

  const { Component } = route;
  return (
    <div className={sider.collapsed ? `${styles.layout} ${styles.collapsed}` : styles.layout}>
      <Header collapsed={sider.collapsed} />
      <SideNav
        activeKey={leafKey}
        collapsed={sider.collapsed}
        openKeys={sider.openKeys}
        onToggleGroup={sider.toggleGroup}
        onToggleCollapsed={() => sider.setCollapsed(!sider.collapsed)}
      />
      <main className={styles.main}>
        <Suspense fallback={<Spin className={styles.loading} />}>
          <Component key={pathname} />
        </Suspense>
      </main>
    </div>
  );
}
