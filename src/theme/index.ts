import type { ThemeConfig } from 'antd';

/**
 * 设计 token：取自原型 app.css 的 :root 变量（按登录后真实页面实测）。
 * 业务代码里需要颜色时引用这里，不要写死色值。
 * CSS Modules 里使用同名 CSS 变量（见 global.css 的 :root，由 cssVars 生成）。
 */
export const colors = {
  /** 主题红 */
  primary: '#c6000b',
  /** 主题红悬停 / 按下 */
  primaryHover: '#a90009',
  /** 选中项浅红底 */
  primaryBg: '#fdeced',
  primaryBg2: '#fdf2f3',

  /** 文本：标题 / 正文 / 次要 / 占位 */
  text: '#1d2129',
  text2: '#4e5969',
  text3: '#86909c',
  text4: '#a9b0ba',

  line: '#eef0f3',
  line2: '#e5e8ed',
  bgSoft: '#f5f6f8',
  bgCard: '#f7f8fa',

  blue: '#2a78d6',
  blueBg: '#eaf2fe',
  /** 角标、错误红 */
  danger: '#f5222d',
  success: '#00b42a',
  warning: '#ff7d00',
};

export const layout = {
  headerHeight: 48,
  siderWidth: 200,
  siderCollapsedWidth: 64,
  radius: 6,
};

export const shadows = {
  header: '0 2px 8px 0 rgba(34, 37, 43, .12)',
  popup: '0 6px 16px rgba(0, 0, 0, .12)',
};

/**
 * 页面专用色：只在某个页面出现、不适合放进全局语义色的取样值。
 * 按页面分组，CSS 里以 var(--<页面>-<名称>) 引用，例如 var(--login-ink)。
 */
export const pageColors = {
  /** 主布局（取自原型 app.css）：侧栏底部装饰、头像底色 */
  shell: {
    decoFrom: '#e8f7ee',
    decoTo: '#f2fbf5',
    avatarFrom: '#ffd9b8',
    avatarTo: '#ffb37a',
    scrollbar: '#dfe3e8',
  },
  /** 登录页（取自原型 styles.css） */
  login: {
    ink: '#050c32',
    lang: '#50546f',
    muted: '#5b6979',
    placeholder: '#9aa0ab',
    tab: '#5f6775',
    tabActive: '#111827',
    input: '#181c26',
    inputBg: '#f2f4f7',
    checkboxBorder: '#505570',
    eye: '#b6bac2',
    divider: '#d9dde3',
    tipBg: '#f3f5f8',
    menuActiveBg: '#fff3f3',
    menuHoverBg: '#f5f5f5',
    cardBg: '#fefefe',
    primaryHover: '#a80009',
    btnDisabledBg: 'rgba(198, 0, 11, 0.10)',
    btnDisabledText: 'rgba(198, 0, 11, 0.38)',
  },
  /** Cookies 偏好中心（取自原型 cookies.css） */
  cookies: {
    switchOff: '#d5d9e0',
    hostIcon: '#d4901f',
    btnPrimaryHover: '#ab0009',
  },
};

const kebab = (s: string) => s.replace(/[A-Z0-9]+/g, (m) => `-${m.toLowerCase()}`);

/**
 * 注入到 :root 的 CSS 变量（main.tsx 启动时写入），CSS Modules 里用 var(--color-primary) 等引用。
 * 由上面的 colors / pageColors / layout / shadows 自动生成，新增颜色只改上面的对象。
 */
export const cssVars: Record<string, string> = {
  ...Object.fromEntries(Object.entries(colors).map(([k, v]) => [`--color-${kebab(k)}`, v])),
  ...Object.fromEntries(
    Object.entries(pageColors).flatMap(([page, group]) =>
      Object.entries(group).map(([k, v]) => [`--${page}-${kebab(k)}`, v]),
    ),
  ),
  '--header-h': `${layout.headerHeight}px`,
  '--sider-w': `${layout.siderWidth}px`,
  '--sider-w-c': `${layout.siderCollapsedWidth}px`,
  '--radius': `${layout.radius}px`,
  '--shadow-header': shadows.header,
  '--shadow-popup': shadows.popup,
};

export const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "PingFang SC", Roboto, "Helvetica Neue", Arial, sans-serif';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: colors.primary,
    colorLink: colors.primary,
    colorInfo: colors.blue,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.danger,
    colorText: colors.text,
    colorTextSecondary: colors.text2,
    colorTextTertiary: colors.text3,
    colorTextQuaternary: colors.text4,
    colorBorder: colors.line2,
    colorBorderSecondary: colors.line,
    colorBgLayout: '#fff',
    borderRadius: layout.radius,
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    boxShadowSecondary: shadows.popup,
  },
  components: {
    Table: {
      headerBg: colors.bgCard,
      headerColor: colors.text2,
    },
    Modal: {
      titleFontSize: 16,
    },
  },
};
