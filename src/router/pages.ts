import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * 路由 → 页面组件 的注册表（BasicLayout 内的页面）。key 必须与 config/menu.ts 中叶子节点的 path 一致。
 * 菜单有 path 但这里没有注册的，会显示「建设中」。
 * 登录页不在主布局内，单独在 main.tsx 注册。
 */
export const PAGES: Record<string, LazyExoticComponent<ComponentType>> = {
  '/workbench': lazy(() => import('@/pages/workbench')),
  '/policy-update': lazy(() => import('@/pages/policy-update')),
  '/lift-planning': lazy(() => import('@/pages/lift-planning')),
  '/enterprise/profile': lazy(() => import('@/pages/enterprise/profile')),
  '/enterprise/self-service': lazy(() => import('@/pages/enterprise/self-service')),
  '/enterprise/tenant': lazy(() => import('@/pages/enterprise/tenant')),
  '/enterprise/organization': lazy(() => import('@/pages/enterprise/organization')),
  '/enterprise/user': lazy(() => import('@/pages/enterprise/user')),
  '/enterprise/role': lazy(() => import('@/pages/enterprise/role')),
  '/scenes': lazy(() => import('@/pages/scenes')),
};
