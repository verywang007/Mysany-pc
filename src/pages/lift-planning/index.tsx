import { useEffect, useState } from 'react';
import { App } from 'antd';
import { useGoMenu } from '@/router/useGoMenu';
import { listRecentProjects, type LiftProject } from '@/services/lift-planning/projects';
import { BrandHook, Crane, FolderIcon, GridIcon, ListIcon, NavIcon } from './components/icons';
import { MODULE_TABS, SLIDE_COUNT, SMART_LIFT_NAV, type SmartLiftNavKey } from './constants';
import styles from './index.module.css';

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');

/**
 * 吊装规划（SANY SMART LIFT 首页框架）。规格见 docs/page-specs/吊装规划.md。
 * 与原型一致：模块页签、左侧菜单只切换选中态并提示，内容始终为「欢迎使用」首页；
 * 状态均不持久化。入口为工作台「快速链接」（已移出一级菜单）。
 */
export default function LiftPlanning() {
  const { message } = App.useApp();
  const go = useGoMenu();
  const [tab, setTab] = useState(MODULE_TABS[0]);
  const [nav, setNav] = useState<SmartLiftNavKey>('welcome');
  const [slide, setSlide] = useState(0);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [projects, setProjects] = useState<LiftProject[]>([]);

  useEffect(() => {
    listRecentProjects().then(setProjects);
  }, []);

  const switchTo = (name: string) => message.success(`已切换到「${name}」`);

  return (
    <div className={styles.page}>
      <div className={styles.tabs} role="tablist">
        {MODULE_TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={t === tab}
            className={cx(styles.tab, t === tab && styles.on)}
            onClick={() => {
              setTab(t);
              switchTo(t);
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        <aside className={styles.side}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <BrandHook />
            </div>
            <div className={styles.brandSany}>SANY</div>
            <div className={styles.brandName}>SANY SMART LIFT</div>
          </div>
          <nav className={styles.nav}>
            {SMART_LIFT_NAV.map((n) => (
              <button
                key={n.key}
                type="button"
                className={cx(styles.navItem, n.key === nav && styles.on)}
                onClick={() => {
                  setNav(n.key);
                  switchTo(n.label);
                }}
              >
                <NavIcon name={n.key} />
                <span>{n.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className={styles.content}>
          <h2 className={styles.title}>欢迎使用</h2>

          <div className={styles.slides}>
            {Array.from({ length: SLIDE_COUNT }, (_, i) => (
              <div
                key={i}
                className={cx(styles.slide, i === slide && styles.on)}
                onClick={() => setSlide(i)}
              >
                <Crane />
              </div>
            ))}
          </div>
          <div className={styles.dots}>
            {Array.from({ length: SLIDE_COUNT }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`第${i + 1}张`}
                className={cx(styles.dot, i === slide && styles.on)}
                onClick={() => setSlide(i)}
              />
            ))}
          </div>

          <div className={styles.recentHead}>
            <h3>最近项目</h3>
            <div className={styles.views} role="group" aria-label="视图切换">
              <button
                type="button"
                title="卡片视图"
                aria-label="卡片视图"
                className={cx(styles.viewBtn, view === 'grid' && styles.on)}
                onClick={() => setView('grid')}
              >
                <GridIcon />
              </button>
              <button
                type="button"
                title="列表视图"
                aria-label="列表视图"
                className={cx(styles.viewBtn, view === 'list' && styles.on)}
                onClick={() => setView('list')}
              >
                <ListIcon />
              </button>
            </div>
          </div>

          <div className={cx(styles.projects, view === 'list' ? styles.list : styles.grid)}>
            {projects.map((p) => (
              <div
                key={p.id}
                className={styles.project}
                onClick={() => message.success(`打开项目「${p.name}」`)}
              >
                <div className={styles.thumb}>
                  <Crane />
                </div>
                <div className={styles.meta}>
                  <div className={styles.name}>
                    <FolderIcon />
                    <span>{p.name}</span>
                  </div>
                  <div className={styles.time}>{p.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <span className={styles.arrow}>‹</span>
            <span className={styles.slogan}>三一改变世界</span>
            <span className={styles.arrow}>›</span>
          </div>
        </section>
      </div>

      {/* 修正原型缺陷：原型只跳回工作台.html 而不重置路由，回去不一定是工作台首页 */}
      <button type="button" className={styles.cancel} onClick={() => go('workbench')}>
        取 消
      </button>
    </div>
  );
}
