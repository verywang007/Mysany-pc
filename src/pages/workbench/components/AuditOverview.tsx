import { useEffect, useState } from 'react';
import { CaretDownFilled } from '@ant-design/icons';
import {
  listAuditEvents,
  type AuditCategory,
  type AuditCategoryKey,
  type AuditEvent,
} from '@/services/workbench/workbench';
import styles from '../index.module.css';

interface Props {
  categories: AuditCategory[];
}

/**
 * 审核概览：5 张分类卡片，点哪张下方列表就切哪类；列表可按发生时间切换升序 / 降序。
 * 选中分类与排序方向只保存在内存中（与原型一致）。
 */
export default function AuditOverview({ categories }: Props) {
  const [active, setActive] = useState<AuditCategoryKey>('device');
  const [desc, setDesc] = useState(true);
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    listAuditEvents(active, desc).then(setEvents);
  }, [active, desc]);

  return (
    <>
      <div className={`${styles.grid} ${styles.g5}`}>
        {categories.map((c) => (
          <div
            key={c.k}
            className={c.k === active ? `${styles.audit} ${styles.on}` : styles.audit}
            onClick={() => setActive(c.k)}
          >
            <div className={styles.num}>
              {c.n}
              {c.fresh > 0 && <span className={styles.auditNew}>新 {c.fresh}</span>}
            </div>
            <div className={styles.auditLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.eventBar}>
        <span
          className={desc ? styles.sort : `${styles.sort} ${styles.asc}`}
          onClick={() => setDesc((d) => !d)}
        >
          发生时间
          <CaretDownFilled />
        </span>
      </div>

      <div>
        {events.length === 0 ? (
          <div className={styles.eventEmpty}>暂无数据</div>
        ) : (
          events.map((e) => (
            <div key={e.id} className={styles.event}>
              <div className={styles.eventMain}>
                <div className={styles.eventTitle}>
                  <i />
                  <span>{e.title}</span>
                  {e.fresh && <span className={styles.eventTag}>新</span>}
                </div>
                <div className={styles.eventSub}>{e.sub}</div>
              </div>
              <div className={styles.eventTime}>{e.time}</div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
