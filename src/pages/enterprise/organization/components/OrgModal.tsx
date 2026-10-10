import { useRef, type ReactNode } from 'react';
import { Modal } from 'antd';
import styles from '../index.module.css';

interface Props {
  title: ReactNode;
  width: number;
  footer: ReactNode;
  onCancel: () => void;
  children: ReactNode;
}

/**
 * 本页弹窗的统一外壳（尺寸、头部、底部取自原型 organization.css）。
 * 关闭方式与原型一致：「×」、「取消」、Esc；点击遮罩不关闭。
 * 原型关闭时直接移除、无退场动画，因此由页面按需挂载 / 卸载。
 * 打开后聚焦弹窗内第一个可用的 input / select（与原型一致；原型每次勾选都把焦点拉回搜索框，这里不再重复）。
 */
export default function OrgModal({ title, width, footer, onCancel, children }: Props) {
  const body = useRef<HTMLDivElement>(null);
  const focusFirst = () =>
    body.current
      ?.querySelector<HTMLElement>('input:not([disabled]), select:not([disabled])')
      ?.focus();

  return (
    <Modal
      open
      centered
      width={width}
      title={title}
      footer={footer}
      maskClosable={false}
      keyboard
      closeIcon={<span className={styles.closeX}>×</span>}
      onCancel={onCancel}
      afterOpenChange={(open) => open && focusFirst()}
      rootClassName={styles.modalRoot}
    >
      <div ref={body}>{children}</div>
    </Modal>
  );
}
