import { useEffect, useRef, useState } from 'react';
import { App, Button, Empty, Input } from 'antd';
import { useProfile } from '@/services/common/account';
import {
  addComment,
  addReply,
  COMMENT_MAX_LENGTH,
  commentTotal,
  listComments,
  type CommentSort,
  type CommentTarget,
  type KnowledgeComment,
} from '@/services/training/knowledge';
import styles from './comments.module.css';

/** 每条评论默认展示的回复数，其余收在「查看更多回复」里 */
const VISIBLE_REPLIES = 2;
/** 定位高亮持续时间（与 CSS 动画一致） */
const HIGHLIGHT_MS = 2400;

interface Props {
  knowledgeId: string;
  target?: CommentTarget;
}

interface Item {
  id: string;
  nickname: string;
  content: string;
  time: string;
  replyTo?: string;
}

/**
 * 评论区：发表评论、最新回复 / 最新评论排序、楼中楼回复。
 * 带 target 时（消息中心跳转）：展开目标所在评论的全部回复 → 滚动到目标 → 高亮。
 */
export default function Comments({ knowledgeId, target }: Props) {
  const { message } = App.useApp();
  const { name } = useProfile();
  const [sort, setSort] = useState<CommentSort>('reply');
  const [comments, setComments] = useState<KnowledgeComment[]>();
  const [draft, setDraft] = useState('');
  const [replying, setReplying] = useState<{ commentId: string; item: Item }>();
  const [replyText, setReplyText] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [highlight, setHighlight] = useState<string>();
  const located = useRef<CommentTarget>();

  const load = () => listComments(knowledgeId, sort).then(setComments);

  useEffect(() => {
    listComments(knowledgeId, sort).then(setComments);
  }, [knowledgeId, sort]);

  // 第一步：数据就绪后展开目标评论的回复，并标记高亮
  useEffect(() => {
    if (!comments || !target || located.current === target) return;
    if (target.knowledgeId !== knowledgeId) return;
    located.current = target;
    const comment = comments.find((c) => c.id === target.commentId);
    if (!comment) {
      message.warning('该评论已被删除');
      return;
    }
    if (target.replyId) setExpanded((s) => new Set(s).add(comment.id));
    setHighlight(target.replyId ?? target.commentId);
  }, [comments, target, knowledgeId, message]);

  // 第二步：展开后的 DOM 渲染完成再滚动
  useEffect(() => {
    if (!highlight) return;
    // 等抽屉滑入动画结束再滚动，否则滚动位置会偏
    const scroll = setTimeout(() => {
      document
        .getElementById(`kc-${highlight}`)
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 300);
    const clear = setTimeout(() => setHighlight(undefined), HIGHLIGHT_MS + 300);
    return () => {
      clearTimeout(scroll);
      clearTimeout(clear);
    };
  }, [highlight]);

  const submitComment = async () => {
    await addComment(knowledgeId, name, draft.trim());
    setDraft('');
    message.success('评论成功');
    load();
  };

  const submitReply = async () => {
    if (!replying) return;
    await addReply(replying.commentId, name, replying.item.nickname, replyText.trim());
    setExpanded((s) => new Set(s).add(replying.commentId));
    setReplying(undefined);
    setReplyText('');
    message.success('回复成功');
    load();
  };

  const startReply = (commentId: string, item: Item) => {
    setReplying(replying?.item.id === item.id ? undefined : { commentId, item });
    setReplyText('');
  };

  const renderItem = (item: Item, commentId: string, isReply: boolean) => {
    const cls = [styles.item, isReply && styles.reply, highlight === item.id && styles.hit];
    return (
      <div key={item.id} id={`kc-${item.id}`} className={cls.filter(Boolean).join(' ')}>
        <span className={styles.avatar}>{item.nickname.slice(0, 1)}</span>
        <div className={styles.main}>
          <div className={styles.head}>
            <b>{item.nickname}</b>
            {item.replyTo && <span className={styles.at}>@{item.replyTo}</span>}
            <time>{item.time}</time>
          </div>
          <div className={styles.text}>{item.content}</div>
          <span className={styles.replyBtn} onClick={() => startReply(commentId, item)}>
            回复
          </span>
          {replying?.item.id === item.id && (
            <div className={styles.replyBox}>
              <Input
                autoFocus
                value={replyText}
                maxLength={COMMENT_MAX_LENGTH}
                placeholder={`回复 @${item.nickname}`}
                onChange={(e) => setReplyText(e.target.value)}
                onPressEnter={() => replyText.trim() && submitReply()}
              />
              <Button disabled={!replyText.trim()} onClick={submitReply}>
                确 认
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className={styles.wrap}>
      <h3 className={styles.title}>评论（{comments ? commentTotal(comments) : 0}条）</h3>
      <Input.TextArea
        value={draft}
        rows={3}
        maxLength={COMMENT_MAX_LENGTH}
        placeholder={`发表你的评论...（最多${COMMENT_MAX_LENGTH}字）`}
        onChange={(e) => setDraft(e.target.value)}
      />
      <div className={styles.post}>
        <Button disabled={!draft.trim()} onClick={submitComment}>
          发表评论
        </Button>
      </div>

      <div className={styles.tabs}>
        {(
          [
            ['reply', '最新回复'],
            ['comment', '最新评论'],
          ] as const
        ).map(([key, label]) => (
          <span
            key={key}
            className={sort === key ? styles.tabOn : undefined}
            onClick={() => setSort(key)}
          >
            {label}
          </span>
        ))}
      </div>

      {comments?.length === 0 && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无评论，快来抢沙发吧" />
      )}
      {comments?.map((c) => {
        const open = expanded.has(c.id);
        const replies = open ? c.replies : c.replies.slice(0, VISIBLE_REPLIES);
        const rest = c.replies.length - replies.length;
        return (
          <div key={c.id} className={styles.thread}>
            {renderItem(c, c.id, false)}
            {replies.map((r) => renderItem(r, c.id, true))}
            {rest > 0 && (
              <button
                type="button"
                className={styles.more}
                onClick={() => setExpanded((s) => new Set(s).add(c.id))}
              >
                查看更多回复（还剩{rest}条）
              </button>
            )}
          </div>
        );
      })}
    </section>
  );
}
