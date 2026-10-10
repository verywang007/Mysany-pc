import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { cssVars, theme } from '@/theme';
import { registerFonts } from '@/theme/fonts';
import BasicLayout from '@/layouts/BasicLayout';
import { LOGIN_PATH } from '@/router/resolve';
import '@/theme/global.css';

const Login = lazy(() => import('@/pages/login'));

dayjs.locale('zh-cn');
registerFonts();
Object.entries(cssVars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={zhCN} theme={theme} button={{ autoInsertSpace: false }}>
      <AntApp>
        {/* HashRouter：双击 dist/index.html（file://）也能正常切换页面 */}
        <HashRouter>
          <Routes>
            <Route path="/" element={<Navigate to={LOGIN_PATH} replace />} />
            <Route
              path={LOGIN_PATH}
              element={
                <Suspense fallback={null}>
                  <Login />
                </Suspense>
              }
            />
            <Route path="*" element={<BasicLayout />} />
          </Routes>
        </HashRouter>
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
);
