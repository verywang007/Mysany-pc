import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { cssVars, theme } from '@/theme';
import { registerFonts } from '@/theme/fonts';
import { COOKIE_CONSENT_PATH, LIFT_ACTIVATION_PATH } from '@/config/menu';
import BasicLayout from '@/layouts/BasicLayout';
import { RequireConsent } from '@/router/guard';
import { LOGIN_PATH } from '@/router/resolve';
import '@/theme/global.css';

const Login = lazy(() => import('@/pages/login'));
/** 吊装规划入口的落地页不在主布局内（线上该页独立打开） */
const LiftActivation = lazy(() => import('@/pages/lift-activation'));
/** Cookie 同意页：全屏独立页面，路由级守卫触发 */
const CookiesConsent = lazy(() => import('@/pages/cookies-consent'));

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
            {/* Cookie 同意页与吊装激活页自身不需要守卫（外部门户 / 死循环豁免） */}
            <Route
              path={COOKIE_CONSENT_PATH}
              element={
                <Suspense fallback={null}>
                  <CookiesConsent />
                </Suspense>
              }
            />
            <Route
              path={LIFT_ACTIVATION_PATH}
              element={
                <Suspense fallback={null}>
                  <LiftActivation />
                </Suspense>
              }
            />
            {/* 登录页与主布局内的所有页面：未完成 Cookie 同意时强制跳同意页 */}
            <Route
              path={LOGIN_PATH}
              element={
                <RequireConsent>
                  <Suspense fallback={null}>
                    <Login />
                  </Suspense>
                </RequireConsent>
              }
            />
            <Route
              path="*"
              element={
                <RequireConsent>
                  <BasicLayout />
                </RequireConsent>
              }
            />
          </Routes>
        </HashRouter>
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
);
