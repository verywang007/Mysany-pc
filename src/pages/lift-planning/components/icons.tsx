/** 吊装规划页专用图形，路径取自原型 吊装规划.html / lift-planning.js */
import type { ReactNode } from 'react';

const line = (children: ReactNode, size = 16) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const NAV_PATHS = {
  welcome: line(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4" />
    </>,
  ),
  create: line(<path d="M12 5v14M5 12h14" />),
  list: line(
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </>,
  ),
  force: line(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>,
  ),
};

export const GridIcon = () =>
  line(
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>,
  );

export const ListIcon = () => NAV_PATHS.list;

/** 左侧 SMART LIFT 菜单图标 */
export const NavIcon = ({ name }: { name: keyof typeof NAV_PATHS }) => NAV_PATHS[name];

/** 品牌区白色吊钩（与主导航的 lift 图标画法不同，沿用原型） */
export const BrandHook = () => (
  <svg
    viewBox="0 0 24 24"
    width="52"
    height="52"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3v4" />
    <path d="M12 7a4.5 4.5 0 1 0 4.5 4.5V10" />
    <path d="M9.5 10h5" />
    <path d="M12 16v5" />
  </svg>
);

export const FolderIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
    <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8z" />
  </svg>
);

/** 履带起重机占位插画（轮播与项目缩略图共用），颜色走 CSS 变量 */
export const Crane = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 120" className={className} aria-hidden="true">
    <g fill="var(--color-primary)">
      <rect x="28" y="96" width="72" height="14" rx="7" />
      <rect x="108" y="96" width="62" height="14" rx="7" />
      <rect x="52" y="78" width="74" height="20" rx="4" />
      <rect x="98" y="66" width="20" height="14" rx="3" />
      <path d="M84 80 168 18l5 7-81 60z" />
    </g>
    <g stroke="var(--lift-muted)" strokeWidth="2.4" fill="none" strokeLinecap="round">
      <path d="M162 26v26" />
    </g>
    <path d="M154 52h16l-8 12z" fill="var(--color-primary)" />
  </svg>
);
