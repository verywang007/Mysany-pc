import { useRef, type ReactNode } from 'react';
import { Modal } from 'antd';
import controls from './controls.module.css';
import styles from './modal.module.css';

interface Props {
  title: ReactNode;
  width: number;
  footer: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

/**
 * 本页弹窗外壳：Esc / × 关闭，点击遮罩不关闭；同一时刻只渲染一个，关闭即卸载（原型无关闭动画）。
 */
export default function UmModal({ title, width, footer, onClose, children }: Props) {
  const body = useRef<HTMLDivElement>(null);
  // 打开后聚焦第一个非复选框的输入框或下拉（原型 renderModal 的行为）
  const focusFirst = (open: boolean) => {
    if (!open) return;
    const el = body.current?.querySelector<HTMLElement>(
      'input:not([type="checkbox"]):not([type="file"]):not([type="radio"]), textarea',
    );
    el?.focus();
  };
  return (
    <Modal
      open
      centered
      title={title}
      width={width}
      footer={<div className={styles.foot}>{footer}</div>}
      maskClosable={false}
      keyboard
      onCancel={onClose}
      closeIcon={<span className={styles.closeX}>×</span>}
      rootClassName={`${styles.root} ${controls.controls}`}
      afterOpenChange={focusFirst}
    >
      <div ref={body}>{children}</div>
    </Modal>
  );
}
