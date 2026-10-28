import type { Knowledge } from '@/services/training/knowledge';
import TypeIcon from './TypeIcon';
import styles from '../index.module.css';

/** 知识卡片：类型图标 + 名称、封面、贡献人 / 发布时间 / 介绍内容 */
export default function KnowledgeCard({ data, onClick }: { data: Knowledge; onClick: () => void }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardTitle}>
        <TypeIcon type={data.type} />
        <b title={data.name}>{data.name}</b>
      </div>
      <div className={styles.cover} style={{ background: `var(--knowledge-${data.type}-cover)` }}>
        <span style={{ background: `var(--knowledge-${data.type}-icon-bg)` }}>
          <TypeIcon type={data.type} size={34} color="#fff" />
        </span>
      </div>
      <dl className={styles.meta}>
        <div>
          <dt>贡献人：</dt>
          <dd>{data.contributor}</dd>
        </div>
        <div>
          <dt>发布时间：</dt>
          <dd>{data.publishTime}</dd>
        </div>
        <div>
          <dt>介绍内容：</dt>
          <dd className={styles.ellipsis}>{data.intro || '--'}</dd>
        </div>
      </dl>
    </div>
  );
}
