import { Button, Modal } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import type { AgreementDoc } from '@/services/common/agreements';
import styles from './index.module.css';

interface Props {
  doc: AgreementDoc | null;
  /** 底部按钮文案：设置弹窗为「返回设置」，协议变更为「返回」 */
  backText: string;
  /** 返回箭头 / 底部按钮 */
  onBack: () => void;
  /** × / 遮罩 / Esc；不传时与 onBack 相同 */
  onClose?: () => void;
  zIndex?: number;
}

/**
 * 协议阅读大弹窗：900px，左上角返回箭头 + 标题 + ×，正文为本地示例协议 HTML。
 * 样式取自原型 app.css 的 .dlg-doc / .doc。
 */
export default function DocModal({ doc, backText, onBack, onClose = onBack, zIndex }: Props) {
  return (
    <Modal
      open={!!doc}
      width={900}
      centered
      zIndex={zIndex}
      className={styles.modal}
      onCancel={onClose}
      title={
        <div className={styles.title}>
          <span className={styles.back} onClick={onBack}>
            <LeftOutlined />
          </span>
          {doc?.title}
        </div>
      }
      footer={<Button onClick={onBack}>{backText}</Button>}
      destroyOnHidden
    >
      {doc && (
        // 正文为本地 mock 中的固定 HTML，不含用户输入
        <div className={styles.doc} dangerouslySetInnerHTML={{ __html: doc.body }} />
      )}
    </Modal>
  );
}
