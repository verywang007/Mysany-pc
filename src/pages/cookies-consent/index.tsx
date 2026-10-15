import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App, Button } from 'antd';
import CookiePreferences from '@/components/CookiePreferences';
import { pageTitle } from '@/config/app';
import Login from '@/pages/login';
import { LOGIN_PATH } from '@/router/resolve';
import { hasCookieConsent, markCookieConsent, saveCookieFlags } from '@/services/common/settings';
import styles from './index.module.css';

/**
 * Cookies 同意页（#/cookies-consent）：完整显示登录窗口，底部叠加与登录页同款的同意横幅。
 * - 未做出选择时登录窗口不可操作：给 #root 加 inert（禁用鼠标 / 键盘交互）、锁定滚动，
 *   透明遮罩兜底；横幅与偏好抽屉通过 portal 挂在 body 下，不受 inert 影响，必须先作出选择；
 * - 「全部接受」「全部拒绝」立即写入 ms_settings 并记录已选择；
 * - 「管理首选项」复用 Cookies 偏好中心抽屉，确认后才算已选择；
 * - 完成后读取 ?redirect=（默认 /login）跳转：从登录页被守卫带来时，落回 /login
 *   即「横幅消失、登录窗口解锁」的连续体验；已做出选择后主动访问本页也可重新调整。
 */
export default function CookiesConsent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // 已做出选择时（主动访问本页），登录窗口可直接操作
  const locked = !hasCookieConsent();

  useEffect(() => {
    document.title = pageTitle('Cookies 同意');
  }, []);

  // 未完成授权前：登录窗口不可交互、不可滚动
  useEffect(() => {
    if (!locked) return;
    const root = document.getElementById('root');
    const prevOverflow = document.body.style.overflow;
    root?.setAttribute('inert', '');
    document.body.style.overflow = 'hidden';
    return () => {
      root?.removeAttribute('inert');
      document.body.style.overflow = prevOverflow;
    };
  }, [locked]);

  const settle = () => {
    markCookieConsent();
    const target = searchParams.get('redirect') || LOGIN_PATH;
    navigate(target, { replace: true });
  };

  return (
    <>
      {/* 登录窗口：完成选择前被 inert 锁定 */}
      <Login />

      {createPortal(
        <>
          {/* 透明遮罩：不支持 inert 的浏览器下依然拦截页面交互 */}
          <div className={styles.mask} aria-hidden="true" />

          <div className={styles.bar} role="region" aria-label="我们重视您的隐私">
            <div className={styles.text}>
              <h4 className={styles.title}>我们重视您的隐私</h4>
              <p className={styles.desc}>
                我们和我们的合作伙伴使用 Cookie
                来为您提供更好的用户体验。当您浏览我们的网站时，请允许我们使用 Cookie
                以便为您提供更好的服务。这些信息不会直接对您进行身份验证，并且不会用于向您推送其他广告。您随时可以在登录后通过「设置」修改您的选择。
              </p>
              <span className={styles.policy} onClick={() => message.info('打开：隐私政策')}>
                隐私政策
              </span>
            </div>

            <div className={styles.actions}>
              <div className={styles.buttons}>
                <Button
                  type="primary"
                  className={styles.accept}
                  onClick={() => {
                    saveCookieFlags({
                      ckNecessary: true,
                      ckFunctional: true,
                      ckAnalytics: true,
                      ckAds: true,
                    });
                    settle();
                  }}
                >
                  全部接受
                </Button>
                <Button
                  type="primary"
                  className={styles.reject}
                  onClick={() => {
                    saveCookieFlags({
                      ckNecessary: true,
                      ckFunctional: false,
                      ckAnalytics: false,
                      ckAds: false,
                    });
                    settle();
                  }}
                >
                  全部拒绝
                </Button>
              </div>
              <span className={styles.manage} onClick={() => setDrawerOpen(true)}>
                管理首选项
              </span>
            </div>
          </div>

          <CookiePreferences
            open={drawerOpen}
            onClose={(applied) => {
              setDrawerOpen(false);
              if (applied) settle();
            }}
          />
        </>,
        document.body,
      )}
    </>
  );
}
