import { useEffect, useState, type KeyboardEvent } from 'react';
import { App } from 'antd';
import Icon from '@/components/Icon';
import { useGoMenu } from '@/router/useGoMenu';
import { useProfile } from '@/services/common/account';
import { getWorkbench, type WorkbenchData } from '@/services/workbench/workbench';
import AuditOverview from './components/AuditOverview';
import SectionHeader from './components/SectionHeader';
import { greeting } from './constants';
import styles from './index.module.css';

/**
 * 工作台：问候语、搜索、计划保养、审核概览、快速链接。
 * 规格见 docs/page-specs/工作台.md。
 */
export default function Workbench() {
  const { message } = App.useApp();
  const go = useGoMenu();
  const { name } = useProfile();
  const [data, setData] = useState<WorkbenchData>();
  // 与原型一致：进入页面时按本机时间计算一次，不随时间自动刷新
  const [hello] = useState(() => greeting(new Date().getHours()));

  useEffect(() => {
    getWorkbench().then(setData);
  }, []);

  // 仅响应 Enter，只做提示
  const onSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const kw = e.currentTarget.value.trim();
    if (kw) message.info(`搜索设备：${kw}`);
    else message.error('请输入设备关键字');
  };

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <div className={styles.hello}>
          <h1>
            {hello}，{name}
          </h1>
          <p>统一掌握资产与运营全局，快速推动关键事项落地。</p>
        </div>
        <div className={styles.tools}>
          <div className={styles.search}>
            <Icon name="search" size={15} strokeWidth={2} />
            <input placeholder="搜索设备" onKeyDown={onSearch} />
          </div>
          <span
            className={styles.gear}
            title="设置"
            onClick={() => message.info('工作台设置（本地演示）')}
          >
            <Icon name="gear" size={18} strokeWidth={1.7} />
          </span>
        </div>
      </div>

      <section className={styles.section}>
        <SectionHeader title="计划保养" moreText="查看全部" onMore={() => go('maintain')} />
        <div className={`${styles.grid} ${styles.g4}`}>
          {data?.maintain.map((m) => (
            <div key={m.label} className={`${styles.maintain} ${styles[`tone-${m.tone}`]}`}>
              <div className={styles.num}>
                {m.n}
                <small>台设备</small>
              </div>
              <div className={styles.maintainLabel}>
                <i />
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <SectionHeader title="审核概览" moreText="进入审核" onMore={() => go('audit-event')} />
        {data && <AuditOverview categories={data.audit} />}
      </section>

      <section className={styles.section}>
        <SectionHeader title="快速链接" />
        <div className={`${styles.grid} ${styles.g4}`}>
          {data?.quick.map((q) => (
            <div key={q.k} className={styles.quick} onClick={() => go(q.k)}>
              <span className={`${styles.quickIcon} ${styles[`quick-${q.tone}`]}`}>
                <Icon name={q.icon} size={17} />
              </span>
              <span>{q.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
