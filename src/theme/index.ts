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

/** 注入到 :root 的 CSS 变量，CSS Modules 里用 var(--color-primary) 等引用 */
export const cssVars: Record<string, string> = {
  '--color-primary': colors.primary,
  '--color-primary-hover': colors.primaryHover,
  '--color-primary-bg': colors.primaryBg,
  '--color-primary-bg-2': colors.primaryBg2,
  '--color-text': colors.text,
  '--color-text-2': colors.text2,
  '--color-text-3': colors.text3,
  '--color-text-4': colors.text4,
  '--color-line': colors.line,
  '--color-line-2': colors.line2,
  '--color-bg-soft': colors.bgSoft,
  '--color-bg-card': colors.bgCard,
  '--color-blue': colors.blue,
  '--color-blue-bg': colors.blueBg,
  '--color-danger': colors.danger,
  '--color-success': colors.success,
  '--color-warning': colors.warning,
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
