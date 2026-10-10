import type { CSSProperties, ReactNode } from 'react';
import styles from './modal.module.css';

interface Props {
  label: string;
  required?: boolean;
  /** 字段下方的常驻帮助文案 */
  help?: ReactNode;
  /** 错误文案；传 undefined 表示该字段不显示错误占位 */
  error?: string;
  showError?: boolean;
  style?: CSSProperties;
  children: ReactNode;
}

/** 表单行：标签在上（必填前加红色 *），下方帮助文案与错误文案（min-height 17px） */
export default function Field({
  label,
  required,
  help,
  error,
  showError = true,
  style,
  children,
}: Props) {
  return (
    <div className={styles.row} style={style}>
      <label className={required ? `${styles.label} ${styles.required}` : styles.label}>
        {label}
      </label>
      {children}
      {help && <div className={styles.help}>{help}</div>}
      {showError && <div className={styles.error}>{error}</div>}
    </div>
  );
}
