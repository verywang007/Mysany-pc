import { useEffect, useState, type ReactNode } from 'react';
import { App, Button, Drawer, Switch } from 'antd';
import {
  CloseOutlined,
  LeftOutlined,
  MinusOutlined,
  PlusOutlined,
  RightOutlined,
} from '@ant-design/icons';
import logo from '@/assets/icon-mysanyLogo.svg';
import {
  listCookies,
  loadSettings,
  pickCookieFlags,
  saveCookieFlags,
  type CookieCategoryKey,
  type CookieFlags,
} from '@/services/common/settings';
import { COOKIE_CATEGORIES } from './constants';
import styles from './index.module.css';

interface Props {
  open: boolean;
  /**
   * 关闭回调。applied 为 true 表示已写入（全部拒绝 / 确认我的选择），false 为直接关闭（× / 遮罩 / Esc）。
   * 两种情况调用方都应重新读取状态（与原型一致）。
   */
  onClose: (applied: boolean) => void;
}

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');

/**
 * Cookies 偏好中心：右侧 480px 抽屉，登录页与工作台「设置」共用。
 * 交互见 docs/page-specs/公共-Cookies偏好中心.md。
 * 每次打开都从 ms_settings 读取，开关只改抽屉内的临时副本，「全部拒绝」「确认我的选择」才写入。
 */
export default function CookiePreferences({ open, onClose }: Props) {
  const { message } = App.useApp();
  const [draft, setDraft] = useState<CookieFlags>(() => pickCookieFlags(loadSettings()));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [listCategory, setListCategory] = useState<CookieCategoryKey | null>(null);
  const [hostsExpanded, setHostsExpanded] = useState<Record<string, boolean>>({});

  // 每次打开重置为已保存的状态，手风琴全部收起
  useEffect(() => {
    if (!open) return;
    setDraft(pickCookieFlags(loadSettings()));
    setExpanded({});
    setListCategory(null);
  }, [open]);

  const commit = (flags: CookieFlags, tip: string) => {
    saveCookieFlags(flags);
    onClose(true);
    message.success(tip);
  };

  const allowAll = () => {
    // 与原型一致：只改临时副本，不写存储
    setDraft({ ckNecessary: true, ckFunctional: true, ckAnalytics: true, ckAds: true });
    message.info('已允许全部 Cookie');
  };

  const rejectAll = () =>
    commit(
      { ckNecessary: true, ckFunctional: false, ckAnalytics: false, ckAds: false },
      '已拒绝全部非必要 Cookie',
    );

  const openList = (key: CookieCategoryKey) => {
    setListCategory(key);
    setHostsExpanded({});
  };

  return (
    <Drawer
      open={open}
      width={480}
      placement="right"
      closable={false}
      title={null}
      onClose={() => onClose(false)}
      rootClassName={styles.root}
      styles={{ body: { padding: 0 } }}
      aria-label="Cookies 偏好中心"
      destroyOnHidden
    >
      <div className={styles.drawer}>
        <div className={styles.head}>
          <img src={logo} alt="My SANY" />
          <span className={styles.close} title="关闭" onClick={() => onClose(false)}>
            <CloseOutlined />
          </span>
        </div>

        <div className={styles.body} key={listCategory ?? 'main'}>
          {listCategory ? (
            <CookieList
              category={listCategory}
              hostsExpanded={hostsExpanded}
              onToggleHost={(h) => setHostsExpanded((s) => ({ ...s, [h]: !s[h] }))}
              onBack={() => setListCategory(null)}
            />
          ) : (
            <>
              <div className={styles.h2}>首选项中心</div>
              <p className={styles.p}>
                Cookie
                是网站放置在你设备上的小文件，用于让网站正常运行、记住你的偏好，并帮助我们了解页面的使用情况。
              </p>
              <p className={styles.p}>
                你可以按类别选择是否允许。必要类别无法关闭，因为它们是网站运行所必需的；关闭其他类别可能会影响部分功能和你看到的内容的相关性。点击各分类标题可查看详细说明。
              </p>
              <div className={styles.h3}>浏览器设置</div>
              <p className={styles.p}>
                你也可以在浏览器中阻止或删除 Cookie，但届时网站的部分功能可能无法正常运行。
              </p>

              <div className={styles.section}>
                <h3>管理许可偏好</h3>
                <Button className={styles.allowAll} onClick={allowAll}>
                  全部允许
                </Button>
              </div>

              {COOKIE_CATEGORIES.map((c) => {
                const isOpen = !!expanded[c.key];
                return (
                  <div key={c.key} className={cx(styles.card, isOpen && styles.open)}>
                    <div
                      className={styles.cardHead}
                      onClick={() => setExpanded((s) => ({ ...s, [c.key]: !s[c.key] }))}
                    >
                      <span className={styles.plus}>
                        {isOpen ? <MinusOutlined /> : <PlusOutlined />}
                      </span>
                      <span className={styles.cardName}>{c.title}</span>
                      {c.locked ? (
                        <span className={styles.always}>始终处于活动状态</span>
                      ) : (
                        <Switch
                          className={styles.switch}
                          checked={draft[c.key]}
                          // 开关在标题行内，点开关不能带动手风琴展开 / 收起
                          onClick={(checked, e) => {
                            e.stopPropagation();
                            setDraft((d) => ({ ...d, [c.key]: checked }));
                          }}
                        />
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <p>{c.desc}</p>
                      <div className={styles.more}>
                        <span onClick={() => openList(c.key)}>
                          Cookie 详细信息
                          <RightOutlined />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className={styles.foot}>
          <Button onClick={rejectAll}>全部拒绝</Button>
          <Button type="primary" onClick={() => commit(draft, 'Cookie 偏好已保存')}>
            确认我的选择
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

interface ListProps {
  category: CookieCategoryKey;
  hostsExpanded: Record<string, boolean>;
  onToggleHost: (host: string) => void;
  onBack: () => void;
}

/** Cookie 列表二级页：按主机首次出现的顺序分组 */
function CookieList({ category, hostsExpanded, onToggleHost, onBack }: ListProps) {
  const cat = COOKIE_CATEGORIES.find((c) => c.key === category);
  const rows = listCookies(category);
  const hosts = [...new Set(rows.map((r) => r.host))];

  const field = (k: string, v: ReactNode) => (
    <div className={styles.field}>
      <span className={styles.fieldKey}>{k}</span>
      <span className={styles.fieldValue}>{v}</span>
    </div>
  );

  return (
    <>
      <div className={styles.back}>
        <span className={styles.backBtn} onClick={onBack}>
          <LeftOutlined />
        </span>
        <h3>Cookie 列表</h3>
      </div>
      <div className={styles.cat}>
        {cat?.title} · 共 {rows.length} 项
      </div>
      {hosts.length === 0 ? (
        <p className={cx(styles.p, styles.empty)}>该分类下暂无 Cookie。</p>
      ) : (
        hosts.map((h) => (
          <div key={h} className={cx(styles.host, hostsExpanded[h] && styles.open)}>
            <div className={styles.hostHead} onClick={() => onToggleHost(h)}>
              <span className={styles.hostIcon}>
                {hostsExpanded[h] ? <MinusOutlined /> : <PlusOutlined />}
              </span>
              <span className={styles.hostName}>{h}</span>
            </div>
            <div className={styles.hostBody}>
              {rows
                .filter((r) => r.host === h)
                .map((r) => (
                  <div key={r.name} className={styles.cookieCard}>
                    {field('名称', r.name)}
                    {field('主机', r.host)}
                    {field('持续时间', r.dur)}
                    {field('类型', r.type)}
                    {field('类别', cat?.title)}
                    {field('说明', r.desc)}
                  </div>
                ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}
