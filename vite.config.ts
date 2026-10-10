import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  // 打包成单个 dist/index.html（JS、CSS、图片全部内联），双击即可打开，不需要启动服务。
  // 与 sany-admin 的差异：单文件打包要求合并全部代码，因此没有 react / antd 拆包配置。
  // 字体体积较大（约 17MB），不内联，放在 public/static/fonts，运行时按相对路径加载（见 theme/fonts.ts）。
  plugins: [react(), viteSingleFile({ removeViteModuleLoader: true })],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 4000,
  },
  server: {
    port: 5174,
    open: true,
  },
});
