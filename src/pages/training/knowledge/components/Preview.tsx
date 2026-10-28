import { useState } from 'react';
import {
  CaretRightFilled,
  OneToOneOutlined,
  PlayCircleOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import type { Knowledge } from '@/services/training/knowledge';
import TypeIcon from './TypeIcon';
import styles from './detail.module.css';

/** 预览区：原型无真实文件，按类型给出示意（文档页 / 图片查看器 / 播放器 / 课程目录） */
export default function Preview({ data }: { data: Knowledge }) {
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [chapter, setChapter] = useState(0);
  const cover = { background: `var(--knowledge-${data.type}-cover)` };

  if (data.type === 'image') {
    return (
      <div className={styles.viewer}>
        <div className={styles.stage}>
          <div
            className={styles.picture}
            style={{ ...cover, transform: `scale(${zoom}) rotate(${rotate}deg)` }}
          >
            <TypeIcon type="image" size={72} />
            <span>{data.fileName}</span>
          </div>
          <span className={styles.origin}>查看原图 {data.fileSize}</span>
        </div>
        <div className={styles.tools}>
          <ZoomInOutlined onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} />
          <ZoomOutOutlined onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))} />
          <RotateLeftOutlined onClick={() => setRotate((r) => r - 90)} />
          <RotateRightOutlined onClick={() => setRotate((r) => r + 90)} />
          <OneToOneOutlined
            onClick={() => {
              setZoom(1);
              setRotate(0);
            }}
          />
        </div>
      </div>
    );
  }

  if (data.type === 'video' || data.type === 'audio') {
    const video = data.type === 'video';
    return (
      <div className={video ? styles.player : `${styles.player} ${styles.audio}`}>
        <div className={styles.screen} style={video ? undefined : cover}>
          {!video && <TypeIcon type="audio" size={64} />}
          <PlayCircleOutlined className={styles.play} />
          <span className={styles.fileName}>{data.fileName}</span>
        </div>
        <div className={styles.controls}>
          <CaretRightFilled />
          <span>00:00 / {data.duration}</span>
          <i className={styles.progress} />
        </div>
      </div>
    );
  }

  if (data.type === 'course') {
    return (
      <div className={styles.course}>
        <div className={styles.screen}>
          <PlayCircleOutlined className={styles.play} />
          <span className={styles.fileName}>{data.chapters?.[chapter]}</span>
        </div>
        <ol className={styles.chapters}>
          <li className={styles.chaptersHead}>课程目录（{data.chapters?.length} 章）</li>
          {data.chapters?.map((c, i) => (
            <li
              key={c}
              className={i === chapter ? styles.chapterOn : undefined}
              onClick={() => setChapter(i)}
            >
              {c}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className={styles.doc}>
      <div className={styles.docBar}>
        <TypeIcon type="doc" />
        {data.fileName}
        <span>{data.fileSize}</span>
      </div>
      <div className={styles.docPage}>
        <h2>{data.name}</h2>
        {data.intro && <p>{data.intro}</p>}
        {[92, 100, 86, 100, 64, 0, 100, 96, 100, 72, 0, 100, 88, 100, 54].map((w, i) =>
          w ? <i key={i} style={{ width: `${w}%` }} /> : <br key={i} />,
        )}
      </div>
    </div>
  );
}
