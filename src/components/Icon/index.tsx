import type { CSSProperties, ReactNode } from 'react';

/**
 * 线性图标（24×24，1.8 描边），从原型 wb.js 的 ICONS 移植。
 * 侧栏菜单、工作台快速链接等处通过 name 引用；名称在 config/menu.ts、mock 数据里使用。
 * 业务操作类图标（编辑、删除、加号等）优先用 @ant-design/icons。
 */
const PATHS = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  device: (
    <>
      <path d="M4 20h16" />
      <path d="M6 20v-6l4-3 4 3v6" />
      <circle cx="17" cy="7" r="3" />
      <path d="m14.5 9.5-3 2.5" />
    </>
  ),
  audit: (
    <>
      <rect x="4" y="3" width="13" height="18" rx="2" />
      <path d="M8 8h6M8 12h6M8 16h4" />
    </>
  ),
  training: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" />
    </>
  ),
  screen: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  report: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 16V9M12 16v-4M16 16v-6" />
    </>
  ),
  personnel: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15 15.2a5 5 0 0 1 6 4.8" />
    </>
  ),
  project: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 4v5" />
    </>
  ),
  monitor: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 12 4-3" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  maintain: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 7h6M9 11h6M9 15h3" />
    </>
  ),
  service: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="2.5" y="13" width="4" height="6" rx="1.6" />
      <rect x="17.5" y="13" width="4" height="6" rx="1.6" />
    </>
  ),
  parts: (
    <>
      <path d="M4 8h7v7H4z" />
      <path d="M13 4h7v7" />
      <path d="M13 13h7v7h-7z" />
    </>
  ),
  repair: (
    <>
      <path d="M15 5a4 4 0 0 0-5.3 5.3L4 16v4h4l5.7-5.7A4 4 0 0 0 19 9" />
    </>
  ),
  cost: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 16V10M12 16V7M17 16v-4" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="5" width="13" height="14" rx="2" />
      <path d="m16 10 5-3v10l-5-3z" />
      <circle cx="9.5" cy="12" r="2.5" />
    </>
  ),
  ent: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  lift: (
    <>
      <path d="M12 3v5" />
      <path d="M8 8h8" />
      <path d="M12 8a4.5 4.5 0 1 0 4.5 4.5" />
      <path d="M12 17v4" />
      <path d="M9 18l3 3 3-3" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="14" r="4" />
      <path d="m11 11 8-8M17 5l2 2M15 7l2 2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  warn: (
    <>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  hex: (
    <>
      <path d="M12 2.6 20 7v10l-8 4.4L4 17V7z" />
      <path d="M12 8.2 16 10.4v4.2L12 16.8 8 14.6v-4.2z" />
    </>
  ),
  box: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </>
  ),
  /** 细右箭头（「查看全部 ›」「查看 ›」等链接，原型 2.4 描边） */
  chevronRight: <path d="m9 6 6 6-6 6" />,
  /* 以下取自原型 wb.js 的 SI（设置弹窗）、工作台.html、policy-update.js */
  shield: (
    <>
      <path d="M12 3l7 3v6c0 4.2-2.9 7.8-7 9-4.1-1.2-7-4.8-7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  doc: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  cookie: (
    <>
      <path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4.6-4.4A4 4 0 0 1 12 3z" />
      <circle cx="9.5" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="14.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="15.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  ads: (
    <>
      <path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1z" />
      <path d="M16.5 9.5a4 4 0 0 1 0 5M19 7a7.5 7.5 0 0 1 0 10" />
    </>
  ),
  logout: (
    <>
      <path d="M14 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M9 8l-4 4 4 4M5 12h11" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.1 14.9a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

interface Props {
  name: IconName | string;
  size?: number;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}

/** 名称不存在时回退为 box（与原型一致） */
export default function Icon({ name, size = 16, className, style, strokeWidth = 1.8 }: Props) {
  const content = PATHS[name as IconName] ?? PATHS.box;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {content}
    </svg>
  );
}
