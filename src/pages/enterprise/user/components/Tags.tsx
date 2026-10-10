import { Tag } from 'antd';
import type { InviteStatus } from '@/services/enterprise/user';
import { INVITE_STATUS_TEXT } from '../constants';
import styles from './tags.module.css';

/** 多值标签：组织为橙色、角色为蓝色；单个最大宽 165px，超出整体隐藏 */
export function TagList({ list, kind }: { list: string[]; kind: 'org' | 'role' }) {
  return (
    <span className={styles.tags}>
      {list.map((v) => (
        <Tag key={v} bordered={false} className={`${styles.tag} ${styles[kind]}`}>
          {v}
        </Tag>
      ))}
    </span>
  );
}

/** 状态标签：邀请状态；导入预览的「成功」用 accepted 样式 */
export function StatusTag({ status, text }: { status: InviteStatus; text?: string }) {
  return (
    <Tag bordered={false} className={`${styles.status} ${styles[status]}`}>
      {text ?? INVITE_STATUS_TEXT[status]}
    </Tag>
  );
}
