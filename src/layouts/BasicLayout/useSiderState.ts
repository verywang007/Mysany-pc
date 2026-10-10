import { useCallback, useState } from 'react';
import { MENU } from '@/config/menu';
import { STORAGE_KEYS, readJSON, readText, writeJSON, writeText } from '@/utils/storage';

/**
 * 侧栏状态：折叠（ms_collapsed）与展开的分组（ms_open），刷新后保持。
 * 与原型一致：进入某个子菜单时，自动展开它所在的分组。
 */
export function useSiderState() {
  const [collapsed, setCollapsedState] = useState(
    () => readText(STORAGE_KEYS.siderCollapsed) === '1',
  );
  const [openKeys, setOpenKeys] = useState<string[]>(() =>
    readJSON<string[]>(STORAGE_KEYS.siderOpen, []),
  );

  const setCollapsed = useCallback((next: boolean) => {
    setCollapsedState(next);
    writeText(STORAGE_KEYS.siderCollapsed, next ? '1' : '0');
  }, []);

  const saveOpen = (next: string[]) => {
    writeJSON(STORAGE_KEYS.siderOpen, next);
    return next;
  };

  const toggleGroup = useCallback((key: string) => {
    setOpenKeys((prev) =>
      saveOpen(prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]),
    );
  }, []);

  /** 确保包含该叶子的分组处于展开状态 */
  const revealLeaf = useCallback((leafKey: string) => {
    const group = MENU.find((m) => m.children?.some((c) => c.key === leafKey));
    if (!group) return;
    setOpenKeys((prev) => (prev.includes(group.key) ? prev : saveOpen([...prev, group.key])));
  }, []);

  return { collapsed, setCollapsed, openKeys, toggleGroup, revealLeaf };
}
