import { useCallback } from 'react';
import { App } from 'antd';
import styles from './components/RoleModal.module.css';

export interface ConfirmOptions {
  title: string;
  content: string;
  okText: string;
  /** 红色确认按钮 */
  danger?: boolean;
  onOk: () => void;
}

/**
 * 确认类弹窗（原型 openConfirm）：宽 430、右上 ×、「取消」+ 确认按钮；
 * 点遮罩不关闭，Esc 关闭；点确认先关闭弹窗再执行回调。
 */
export function useRoleConfirm() {
  const { modal } = App.useApp();
  return useCallback(
    ({ title, content, okText, danger, onOk }: ConfirmOptions) =>
      modal.confirm({
        title,
        content,
        okText,
        cancelText: '取消',
        icon: null,
        closable: true,
        centered: true,
        width: 430,
        maskClosable: false,
        keyboard: true,
        className: styles.confirm,
        styles: { mask: { background: 'var(--role-mask)' } },
        okButtonProps: danger ? { danger: true } : undefined,
        // 不返回 Promise：弹窗立即关闭，回调随后执行（与原型一致）
        onOk: () => {
          onOk();
        },
      }),
    [modal],
  );
}
