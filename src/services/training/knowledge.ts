import dayjs from 'dayjs';
import { CURRENT_USER } from '@/config/app';
import { KNOWLEDGE, KNOWLEDGE_CATEGORIES, KNOWLEDGE_COMMENTS } from '@/mock/training/knowledge';
import { delay, exact, fuzzy, paginate } from '@/mock/utils';
import type { PageQuery, PageResult } from '@/types/common';

/** 知识类型：文档 / 图片 / 视频 / 音频 / 课程 */
export type KnowledgeType = 'doc' | 'image' | 'video' | 'audio' | 'course';

export interface KnowledgeCategory {
  id: string;
  name: string;
  children?: KnowledgeCategory[];
}

export interface Knowledge {
  id: string;
  name: string;
  type: KnowledgeType;
  /** 所属分类（叶子或一级分类） */
  categoryId: string;
  /** 贡献人 */
  contributor: string;
  /** 发布时间，YYYY-MM-DD HH:mm:ss */
  publishTime: string;
  /** 介绍内容，可能为空 */
  intro: string;
  fileName: string;
  fileSize: string;
  /** 视频 / 音频时长 */
  duration?: string;
  /** 课程章节 */
  chapters?: string[];
  likes: number;
  liked: boolean;
  /** 发布时是否允许下载 */
  downloadable: boolean;
}

/** 评论下的回复（楼中楼，只有一层） */
export interface CommentReply {
  id: string;
  userId: string;
  nickname: string;
  /** 被回复人的昵称 */
  replyTo: string;
  content: string;
  /** YYYY-MM-DD HH:mm:ss */
  time: string;
}

export interface KnowledgeComment {
  id: string;
  knowledgeId: string;
  userId: string;
  nickname: string;
  content: string;
  /** YYYY-MM-DD HH:mm:ss */
  time: string;
  /** 按时间倒序 */
  replies: CommentReply[];
}

export interface KnowledgeFilters {
  name: string;
  type?: KnowledgeType;
  /** 分类 id，为空表示全部知识；选一级分类时包含其下级 */
  categoryId?: string;
}

/** 评论排序：最新回复（按楼内最后一次互动）/ 最新评论（按评论发表时间） */
export type CommentSort = 'reply' | 'comment';

/** 定位到某条评论 / 回复（消息中心「评论消息」跳转用） */
export interface CommentTarget {
  knowledgeId: string;
  commentId: string;
  replyId?: string;
}

export const COMMENT_MAX_LENGTH = 100;

/** 知识库页面路由，与 config/menu.ts 一致 */
export const KNOWLEDGE_PATH = '/training/knowledge';

/** 跳转到知识库并定位到评论的地址 */
export function knowledgeCommentPath({ knowledgeId, commentId, replyId }: CommentTarget) {
  const q = new URLSearchParams({ kid: knowledgeId, cid: commentId });
  if (replyId) q.set('rid', replyId);
  return `${KNOWLEDGE_PATH}?${q}`;
}

const now = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

/** 分类及其全部下级的 id */
function categoryIds(id: string): string[] {
  const find = (nodes: KnowledgeCategory[]): KnowledgeCategory | undefined => {
    for (const n of nodes) {
      if (n.id === id) return n;
      const hit = n.children && find(n.children);
      if (hit) return hit;
    }
  };
  const collect = (n: KnowledgeCategory): string[] => [
    n.id,
    ...(n.children ?? []).flatMap(collect),
  ];
  const node = find(KNOWLEDGE_CATEGORIES);
  return node ? collect(node) : [id];
}

/** 分类树（静态） */
export const getKnowledgeCategories = (): KnowledgeCategory[] => KNOWLEDGE_CATEGORIES;

/** 分类下（含下级）的知识数 */
export const countKnowledge = (categoryId?: string) => {
  if (!categoryId) return KNOWLEDGE.length;
  const ids = categoryIds(categoryId);
  return KNOWLEDGE.filter((k) => ids.includes(k.categoryId)).length;
};

/** 知识列表：名称模糊匹配，类型精确匹配，按发布时间倒序 */
export async function listKnowledge(
  query: KnowledgeFilters & PageQuery,
): Promise<PageResult<Knowledge>> {
  await delay(0);
  const ids = query.categoryId ? categoryIds(query.categoryId) : undefined;
  const rows = KNOWLEDGE.filter(
    (k) =>
      fuzzy(k.name, query.name) &&
      exact(k.type, query.type) &&
      (!ids || ids.includes(k.categoryId)),
  ).sort((a, b) => b.publishTime.localeCompare(a.publishTime));
  return paginate(rows, query);
}

export async function getKnowledge(id: string): Promise<Knowledge | undefined> {
  await delay(0);
  return KNOWLEDGE.find((k) => k.id === id);
}

/** 点赞 / 取消点赞 */
export async function toggleLike(id: string): Promise<Knowledge | undefined> {
  await delay(0);
  const k = KNOWLEDGE.find((x) => x.id === id);
  if (!k) return undefined;
  k.liked = !k.liked;
  k.likes += k.liked ? 1 : -1;
  return { ...k };
}

const lastActivity = (c: KnowledgeComment) => c.replies[0]?.time ?? c.time;

/** 某条知识的评论 */
export async function listComments(
  knowledgeId: string,
  sort: CommentSort,
): Promise<KnowledgeComment[]> {
  await delay(0);
  const key = sort === 'reply' ? lastActivity : (c: KnowledgeComment) => c.time;
  return KNOWLEDGE_COMMENTS.filter((c) => c.knowledgeId === knowledgeId)
    .sort((a, b) => key(b).localeCompare(key(a)))
    .map((c) => ({ ...c, replies: [...c.replies] }));
}

/** 评论总数（含回复） */
export const commentTotal = (comments: KnowledgeComment[]) =>
  comments.reduce((n, c) => n + 1 + c.replies.length, 0);

/** 发表评论 */
export async function addComment(knowledgeId: string, nickname: string, content: string) {
  await delay(0);
  KNOWLEDGE_COMMENTS.push({
    id: `${knowledgeId}-c${Date.now()}`,
    knowledgeId,
    userId: CURRENT_USER.id,
    nickname,
    content,
    time: now(),
    replies: [],
  });
}

/** 回复评论或评论下的回复（都挂在同一条评论下） */
export async function addReply(
  commentId: string,
  nickname: string,
  replyTo: string,
  content: string,
) {
  await delay(0);
  const c = KNOWLEDGE_COMMENTS.find((x) => x.id === commentId);
  c?.replies.unshift({
    id: `${commentId}-r${Date.now()}`,
    userId: CURRENT_USER.id,
    nickname,
    replyTo,
    content,
    time: now(),
  });
}
