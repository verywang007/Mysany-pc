import { useEffect, useState } from 'react';
import { App, Button, Drawer, Tooltip } from 'antd';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import {
  getKnowledge,
  toggleLike,
  type CommentTarget,
  type Knowledge,
} from '@/services/training/knowledge';
import Comments from './Comments';
import Preview from './Preview';
import TypeIcon from './TypeIcon';
import styles from './detail.module.css';

interface Props {
  /** 有值即打开 */
  knowledgeId?: string;
  /** 打开后定位到的评论 / 回复 */
  target?: CommentTarget;
  onClose: () => void;
}

/** 知识详情抽屉：左侧预览，右侧知识简介、点赞 / 下载、评论 */
export default function DetailDrawer({ knowledgeId, target, onClose }: Props) {
  const { message } = App.useApp();
  const [data, setData] = useState<Knowledge>();

  useEffect(() => {
    if (!knowledgeId) return;
    getKnowledge(knowledgeId).then((k) => {
      if (k) {
        setData({ ...k });
      } else {
        message.warning('该知识已下架或不存在');
        onClose();
      }
    });
  }, [knowledgeId, message, onClose]);

  const like = async () => {
    if (!data) return;
    const k = await toggleLike(data.id);
    if (k) setData(k);
  };

  const open = !!knowledgeId && data?.id === knowledgeId;

  return (
    <Drawer
      open={open}
      width="90%"
      title={data?.name}
      className={styles.drawer}
      destroyOnHidden
      onClose={onClose}
    >
      {data && (
        <div className={styles.detail}>
          <div className={styles.preview}>
            <Preview data={data} />
          </div>
          <aside className={styles.aside}>
            <h3 className={styles.h3}>知识简介</h3>
            <div className={styles.intro}>
              <span
                className={styles.thumb}
                style={{ background: `var(--knowledge-${data.type}-cover)` }}
              >
                <TypeIcon type={data.type} size={22} />
              </span>
              <dl>
                <div>
                  <dt>贡献人：</dt>
                  <dd>{data.contributor}</dd>
                </div>
                <div>
                  <dt>发布时间：</dt>
                  <dd>{data.publishTime}</dd>
                </div>
                {data.intro && <p>{data.intro}</p>}
              </dl>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={data.liked ? `${styles.like} ${styles.liked}` : styles.like}
                onClick={like}
              >
                {data.liked ? <HeartFilled /> : <HeartOutlined />}
                {data.likes}赞
              </button>
              {data.downloadable ? (
                <Button
                  type="primary"
                  className={styles.download}
                  onClick={() => message.success(`已开始下载：${data.fileName}`)}
                >
                  下载文件
                </Button>
              ) : (
                <Tooltip title="发布者未开放下载">
                  <Button disabled>下载文件</Button>
                </Tooltip>
              )}
            </div>

            <Comments knowledgeId={data.id} target={target} />
          </aside>
        </div>
      )}
    </Drawer>
  );
}
