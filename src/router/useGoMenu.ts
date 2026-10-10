import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { findLeafByKey, leafRoute } from '@/config/menu';

/** 按菜单 key 跳转（对应原型 wb.js 的 go(k)）；进入子菜单时主布局会自动展开所在分组 */
export function useGoMenu() {
  const navigate = useNavigate();
  return useCallback(
    (key: string) => {
      const leaf = findLeafByKey(key);
      if (leaf) navigate(leafRoute(leaf));
    },
    [navigate],
  );
}
