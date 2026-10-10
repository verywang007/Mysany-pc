import type { ReactNode } from 'react';
import type { RoleType } from '@/services/enterprise/role';
import { typeName } from '../constants';
import styles from '../index.module.css';

type Tone = RoleType | 'scope' | 'org';

const TONE_CLASS: Record<Tone, string> = {
  system: styles.tagSystem,
  custom: styles.tagCustom,
  scope: styles.tagScope,
  org: styles.tagOrg,
};

/** 原型 .rm-tag：无边框的小色块标签 */
export function Tag({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`${styles.tag} ${TONE_CLASS[tone]}`}>{children}</span>;
}

/** 角色类型标签：系统配置（蓝）/ 自定义（紫） */
export function RoleTypeTag({ type }: { type: RoleType }) {
  return <Tag tone={type}>{typeName(type)}</Tag>;
}
