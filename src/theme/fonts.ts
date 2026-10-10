/**
 * 登录页用到的思源黑体 / DIN 字体体积较大（约 17MB），不打包进 dist/index.html。
 * 文件放在 public/static/fonts，打包后位于 dist/static/fonts，这里在运行时按相对页面的路径注册。
 * 写在字符串里是为了让 Vite 不去解析和内联这些 url。
 * 双击打开（file://）时如果浏览器拦截字体，会回退到系统字体，页面功能不受影响。
 */
const FONTS: [family: string, file: string][] = [
  ['DINCondensed-Regular', 'DINCondensed-Regular.ttf'],
  ['SourceHanSansCN-Bold', 'SourceHanSansCN-Bold.otf'],
  ['SourceHanSansCN-Regular', 'SourceHanSansCN-Regular.otf'],
];

export function registerFonts() {
  const css = FONTS.map(
    ([family, file]) =>
      `@font-face{font-family:"${family}";src:url("./static/fonts/${file}");font-display:swap;}`,
  ).join('\n');
  const style = document.createElement('style');
  style.dataset.fonts = 'mysany';
  style.textContent = css;
  document.head.appendChild(style);
}
