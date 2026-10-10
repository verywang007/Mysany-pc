import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { OrgNode } from '@/services/enterprise/organization';
import styles from '../index.module.css';

export interface NodeMenuState {
  node: OrgNode;
  /** 触发按钮的 right / top（视口坐标） */
  anchorRight: number;
  anchorTop: number;
}

interface Props {
  state: NodeMenuState;
  onClose: () => void;
  onEdit: (node: OrgNode) => void;
  onAdd: (node: OrgNode) => void;
  onDelete: (node: OrgNode) => void;
}

/**
 * 非根节点「⋮」菜单：fixed 定位在按钮右侧（left = min(视口宽 - 菜单宽 - 8, 按钮 right + 3)，
 * top = min(视口高 - 菜单高 - 8, 按钮 top)）。点菜单外任意处关闭，Esc 不关闭（与原型一致）。
 * antd Dropdown 只能放在按钮上下方，与原型位置规则冲突，因此自行渲染。
 */
export default function NodeMenu({ state, onClose, onEdit, onAdd, onDelete }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setPos({
      left: Math.min(window.innerWidth - el.offsetWidth - 8, state.anchorRight + 3),
      top: Math.min(window.innerHeight - el.offsetHeight - 8, state.anchorTop),
    });
  }, [state]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t?.closest('[data-node-menu-trigger]') || (ref.current && ref.current.contains(t)))
        return;
      onClose();
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [onClose]);

  const run = (fn: (n: OrgNode) => void) => {
    onClose();
    fn(state.node);
  };

  return createPortal(
    <div
      ref={ref}
      className={styles.nodeMenu}
      style={pos ?? { visibility: 'hidden', left: 0, top: 0 }}
      role="menu"
    >
      <button type="button" onClick={() => run(onEdit)}>
        <EditOutlined />
        编辑
      </button>
      <button type="button" onClick={() => run(onAdd)}>
        <PlusOutlined />
        添加子组织
      </button>
      <button type="button" className={styles.danger} onClick={() => run(onDelete)}>
        <DeleteOutlined />
        删除
      </button>
    </div>,
    document.body,
  );
}
