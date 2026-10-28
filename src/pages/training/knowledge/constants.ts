import type { KnowledgeType } from '@/services/training/knowledge';

/** 知识类型下拉（顺序同测试环境） */
export const KNOWLEDGE_TYPE_OPTIONS: { value: KnowledgeType; label: string }[] = [
  { value: 'doc', label: '文档' },
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
  { value: 'audio', label: '音频' },
  { value: 'course', label: '课程' },
];

export const PAGE_SIZE_OPTIONS = [20, 40, 60];
