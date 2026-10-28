/**
 * 知识库页专用色（取自测试环境 培训中心 → 知识库），CSS 里以 var(--knowledge-<名称>) 引用。
 * 类型色：文档 / 图片 / 视频 / 音频 / 课程，分别用于标题前图标和封面。
 */
export const knowledgeColors: Record<string, string> = {
  pageBg: '#f0f2f5',
  doc: '#2f7cf6',
  docCover: 'linear-gradient(135deg, #e8f0ff 0%, #d6e4ff 100%)',
  docIconBg: '#a9c6ff',
  image: '#f5b400',
  imageCover: 'linear-gradient(135deg, #fbf3df 0%, #f2e2bb 100%)',
  imageIconBg: '#f6d58a',
  video: '#f0359a',
  videoCover: 'linear-gradient(135deg, #fde9f3 0%, #fbd3e8 100%)',
  videoIconBg: '#f9a8d4',
  audio: '#14a37f',
  audioCover: 'linear-gradient(135deg, #e3f7f0 0%, #c9eee1 100%)',
  audioIconBg: '#8fdcc2',
  course: '#2b8cf0',
  courseCover: 'linear-gradient(135deg, #e3f5fc 0%, #bfe8f6 100%)',
  courseIconBg: '#93d3f0',
  /** 详情抽屉：预览区 */
  previewBg: '#eef0f3',
  previewDark: '#1f2329',
  /** 评论：头像、定位高亮 */
  avatar: '#1e88f5',
  highlight: '#ffeccc',
  /** 下载按钮（测试环境为浅于主题红的红色） */
  download: '#f2464b',
};
