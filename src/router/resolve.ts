import { lazy, type ComponentType } from 'react';
import { BUILDING_PREFIX, findLeafByKey, findLeafByRoute, type MenuLeaf } from '@/config/menu';
import { PAGES } from './pages';

const Building = lazy(() => import('@/pages/exception/Building'));
const NotFound = lazy(() => import('@/pages/exception/NotFound'));

export const HOME_PATH = '/workbench';
export const LOGIN_PATH = '/login';

export interface ResolvedRoute {
  title: string;
  /** 对应的菜单叶子，用于侧栏选中和记忆 */
  leaf?: MenuLeaf;
  Component: ComponentType;
}

export function resolveRoute(pathname: string): ResolvedRoute {
  const leaf = findLeafByRoute(pathname);
  if (leaf && PAGES[pathname]) {
    return { title: leaf.label, leaf, Component: PAGES[pathname] };
  }
  if (leaf) {
    return { title: leaf.label, leaf, Component: Building };
  }
  if (pathname.startsWith(BUILDING_PREFIX)) {
    const byKey = findLeafByKey(pathname.slice(BUILDING_PREFIX.length));
    if (byKey) return { title: byKey.label, leaf: byKey, Component: Building };
  }
  return { title: '页面不存在', Component: NotFound };
}
