import { useEffect, useRef, useState } from 'react';
import { Input, Modal, type InputRef } from 'antd';
import styles from '../index.module.css';

export interface PromptOptions {
  title: string;
  desc?: string;
  initial?: string;
  placeholder?: string;
  /** 返回错误文案时保持弹窗打开并提示；返回空则关闭 */
  onOk: (value: string) => string | void;
}

interface Props {
  options: PromptOptions | null;
  onClose: () => void;
  onError: (msg: string) => void;
}

/**
 * 单输入框弹窗（行内编辑、换绑）。打开时自动聚焦并全选，Enter 等同确定。
 * 与原型的差异：原型校验失败会先关闭弹窗再提示，这里保留弹窗，方便直接修改。
 */
export default function PromptModal({ options, onClose, onError }: Props) {
  const [value, setValue] = useState('');
  const input = useRef<InputRef>(null);

  useEffect(() => {
    if (options) setValue(options.initial ?? '');
  }, [options]);

  const ok = () => {
    if (!options) return;
    const err = options.onOk(value.trim());
    if (err) onError(err);
    else onClose();
  };

  return (
    <Modal
      open={!!options}
      width={400}
      centered
      closable={false}
      title={options?.title}
      okText="确定"
      cancelText="取消"
      onOk={ok}
      onCancel={onClose}
      className={styles.prompt}
      afterOpenChange={(open) => open && input.current?.select()}
      destroyOnHidden
    >
      {options?.desc && <p className={styles.promptDesc}>{options.desc}</p>}
      <Input
        ref={input}
        autoFocus
        value={value}
        placeholder={options?.placeholder ?? '请输入'}
        onChange={(e) => setValue(e.target.value)}
        onPressEnter={ok}
      />
    </Modal>
  );
}
