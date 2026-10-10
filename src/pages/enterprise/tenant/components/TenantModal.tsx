import { useEffect, useRef, type ReactNode } from 'react';
import { Modal } from 'antd';
import { MODAL_WIDTH } from '../constants';
import styles from '../modal.module.css';

interface Props {
  open: boolean;
  title: string;
  width?: number;
  footer: ReactNode;
  children: ReactNode;
  onClose: () => void;
  /** 打开 20ms 后回调，用于聚焦首个控件（与原型一致） */
  onOpened?: () => void;
}

/**
 * 本页弹窗外壳（原型 modalShell）：× / 取消 / Esc 关闭，点遮罩不关闭。
 */
export default function TenantModal({
  open,
  title,
  width = MODAL_WIDTH.default,
  footer,
  children,
  onClose,
  onOpened,
}: Props) {
  const opened = useRef(onOpened);
  opened.current = onOpened;
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => opened.current?.(), 20);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <Modal
      open={open}
      title={title}
      width={width}
      centered
      maskClosable={false}
      keyboard
      footer={footer}
      onCancel={onClose}
      className={styles.modal}
      styles={{ mask: { background: 'var(--tenant-mask)' } }}
      closeIcon={<span className={styles.closeX}>×</span>}
      destroyOnHidden
    >
      {children}
    </Modal>
  );
}
