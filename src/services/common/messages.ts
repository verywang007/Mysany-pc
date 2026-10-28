import dayjs from 'dayjs';
import { MESSAGES } from '@/mock/common/messages';
import { delay } from '@/mock/utils';
import type { CommentTarget } from '@/services/training/knowledge';

/** 消息类型：服务系统消息 / 保养消息 / 评论消息 */
export type MessageType = 'system' | 'maintain' | 'comment';

/**
 * 评论消息的来源：回复我的评论 / 我贡献的知识有新评论。
 * knowledgeId / commentId / replyId 用于点击后跳转到知识库并定位到该条评论或回复。
 */
export interface CommentSource extends CommentTarget {
  kind: 'reply' | 'new';
  /** 用户昵称 */
  nickname: string;
  /** 知识库名称 */
  kb: string;
}

export interface Message {
  id: string;
  type: MessageType;
  /** 评论消息由 comment 生成，见 commentTitle */
  title: string;
  /** 正文；评论消息为评论具体内容 */
  content: string;
  /** 接收时间，YYYY-MM-DD HH:mm */
  time: string;
  read: boolean;
  comment?: CommentSource;
}

/** 消息分类（顺序即消息中心左侧及顶栏下拉的顺序），icon 为 Icon 组件名称 */
export const MESSAGE_TYPES: { key: MessageType; label: string; icon: string }[] = [
  { key: 'system', label: '服务系统消息', icon: 'chatDots' },
  { key: 'maintain', label: '保养消息', icon: 'oil' },
  { key: 'comment', label: '评论消息', icon: 'comment' },
];

/** 评论消息标题：【回复】/【新评论】+ 用户昵称 + 知识库名称 */
export const commentTitle = ({ kind, nickname, kb }: CommentSource) =>
  `${kind === 'reply' ? '【回复】' : '【新评论】'}${nickname} ${kb}`;

/** 列表时间：今天 HH:mm / 昨日 HH:mm / 前天 HH:mm / M月D日 HH:mm，跨年加年份 */
export function formatMessageTime(time: string) {
  const t = dayjs(time);
  const now = dayjs();
  const days = now.startOf('day').diff(t.startOf('day'), 'day');
  if (days === 0) return t.format('HH:mm');
  if (days === 1) return t.format('昨日 HH:mm');
  if (days === 2) return t.format('前天 HH:mm');
  return t.format(t.year() === now.year() ? 'M月D日 HH:mm' : 'YYYY年M月D日 HH:mm');
}

/** 全部消息，按接收时间倒序 */
export async function listMessages(): Promise<Message[]> {
  await delay(0);
  return MESSAGES.map((m) => (m.comment ? { ...m, title: commentTitle(m.comment) } : m)).sort(
    (a, b) => b.time.localeCompare(a.time),
  );
}
