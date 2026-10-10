import Icon from '@/components/Icon';
import styles from '../index.module.css';

interface Props {
  title: string;
  moreText?: string;
  onMore?: () => void;
}

/** 区块标题：红竖条 + 标题 + 右侧「查看全部 ›」等链接 */
export default function SectionHeader({ title, moreText, onMore }: Props) {
  return (
    <div className={styles.sectionHead}>
      <i className={styles.bar} />
      <h2>{title}</h2>
      {moreText && (
        <span className={styles.more} onClick={onMore}>
          {moreText}
          <Icon name="chevronRight" size={11} strokeWidth={2.4} />
        </span>
      )}
    </div>
  );
}
