import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { pageTitle } from '@/config/app';
import { HIDDEN_PAGES, LIFT_ACTIVATION_PATH, MENU, type MenuNode } from '@/config/menu';
import { LOGIN_PATH } from '@/router/resolve';
import { PAGES } from '@/router/pages';
import styles from './index.module.css';

type Status = '已实现' | '建设中' | '独立';

interface Scene {
  label: string;
  href: string;
  status: Status;
  systemPath?: string;
  parent?: string;
}

interface Group {
  name: string;
  icon?: string;
  scenes: Scene[];
}

const statusOf = (node: MenuNode): Status =>
  node.path && PAGES[node.path] ? '已实现' : '建设中';

const leafScene = (node: MenuNode, parent?: string): Scene => ({
  label: node.label,
  href: node.path ?? `/building/${node.key}`,
  status: statusOf(node),
  systemPath: node.systemPath,
  parent,
});

/**
 * 场景目录：把菜单树里所有叶子（含未实现的「建设中」占位）和独立入口平铺展示，
 * 点击直达对应路由。布局按一级菜单分组，最后单列「独立场景」。
 * 数据来源：config/menu.ts 与 router/pages.ts，保持单一事实。
 */
export default function Scenes() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = pageTitle('场景目录');
  }, []);

  const groups = useMemo<Group[]>(() => {
    const list: Group[] = MENU.map((node) => {
      if (node.children) {
        return {
          name: node.label,
          icon: node.icon,
          scenes: node.children.map((c) => leafScene(c, node.label)),
        };
      }
      // 一级菜单本身是叶子（工作台）
      return {
        name: node.label,
        icon: node.icon,
        scenes: [leafScene(node, node.label)],
      };
    });

    const standalone: Scene[] = [
      { label: '登录', href: LOGIN_PATH, status: '独立' },
      ...HIDDEN_PAGES.filter((p) => p.key !== 'scenes').map<Scene>((p) => ({
        label: p.label,
        href: p.path ?? '',
        status: '独立',
        systemPath: p.systemPath,
      })),
    ];
    // 保留对吊装激活的直接入口（不依赖隐式 LEAF 解析，便于其他人从场景目录直接打开）
    if (!standalone.some((s) => s.href === LIFT_ACTIVATION_PATH)) {
      standalone.push({ label: '吊装激活', href: LIFT_ACTIVATION_PATH, status: '独立' });
    }
    list.push({ name: '独立场景', scenes: standalone });

    return list;
  }, []);

  const total = groups.reduce((n, g) => n + g.scenes.length, 0);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h2 className={styles.title}>场景目录</h2>
        <p className={styles.subtitle}>
          所有页面与分支场景的集合（共 {total} 项）。点击卡片直达对应路由；未实现的菜单进入「建设中」占位页。
        </p>
      </header>

      {groups.map((g) => (
        <section key={g.name} className={styles.group}>
          <h3 className={styles.groupName}>{g.name}</h3>
          <div className={styles.cards}>
            {g.scenes.map((s) => (
              <div
                key={`${g.name}-${s.label}-${s.href}`}
                className={styles.card}
                role="button"
                tabIndex={0}
                onClick={() => s.href && navigate(s.href)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && s.href) {
                    e.preventDefault();
                    navigate(s.href);
                  }
                }}
              >
                <div className={styles.cardTop}>
                  <span className={styles.cardName}>{s.label}</span>
                  <span className={`${styles.tag} ${tagClass(s.status)}`}>{s.status}</span>
                </div>
                <div className={styles.path}>#{s.href}</div>
                {s.systemPath && <div className={styles.system}>系统路径：{s.systemPath}</div>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function tagClass(status: Status): string {
  if (status === '已实现') return styles.tagImpl!;
  if (status === '建设中') return styles.tagBuilding!;
  return styles.tagStandalone!;
}
