import { App } from 'antd';
import styles from '../index.module.css';

export interface DangerConfirmOptions {
  title: string;
  content: string;
  /** 红色确认按钮文字 */
  okText: string;
  onOk: () => void;
}

/**
 * 二次确认弹窗（删除组织、移除成员、取消分配）：宽 420，标题前黄色「!」，
 * 按钮「取消」+ 红色确认按钮；「×」/「取消」/ Esc 关闭，点遮罩不关闭。
 * 点确认先关闭弹窗再执行回调（与原型一致）。
 */
export function useDangerConfirm() {
  const { modal } = App.useApp();
  return ({ title, content, okText, onOk }: DangerConfirmOptions) => {
    const ref = modal.confirm({
      title,
      content,
      okText,
      cancelText: '取消',
      width: 420,
      centered: true,
      closable: true,
      closeIcon: <span className={styles.closeX}>×</span>,
      maskClosable: false,
      keyboard: true,
      icon: <span className={styles.confirmIcon}>!</span>,
      okButtonProps: { danger: true },
      rootClassName: `${styles.modalRoot} ${styles.confirmRoot}`,
      onOk: () => {
        ref.destroy();
        onOk();
      },
    });
  };
}
