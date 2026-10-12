import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'antd';
import CookiePreferences from '@/components/CookiePreferences';
import {
  hasCookieConsent,
  markCookieConsent,
  saveCookieFlags,
} from '@/services/common/settings';
import styles from './index.module.css';

/**
 * Cookie 同意横幅：固定在**登录页最下方**，首次进入登录页时显示（样式取自截图）。
 * - 未完成授权前不允许操作页面：给 #root 加 inert（禁用鼠标 / 键盘交互）、锁定滚动，
 *   并用透明遮罩兜底；横幅通过 portal 挂在 body 下，因此不受 inert 影响，必须先作出选择；
 * - 「全部接受」「全部拒绝」立即写入 ms_settings 并记录已选择，此后不再出现；
 * - 「管理首选项」复用 Cookies 偏好中心抽屉，确认后才算已选择；
 * - 已选择后如需修改，只能登录后从「设置」弹窗 → Cookies 设置进入。
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(() => !hasCookieConsent());
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 未完成授权前：页面主体不可交互、不可滚动
  useEffect(() => {
    if (!visible) return;
    const root = document.getElementById('root');
    const prevOverflow = document.body.style.overflow;
    root?.setAttribute('inert', '');
    document.body.style.overflow = 'hidden';
    return () => {
      root?.removeAttribute('inert');
      document.body.style.overflow = prevOverflow;
    };
  }, [visible]);

  if (!visible) return null;

  const settle = () => {
    markCookieConsent();
    setVisible(false);
  };

  return createPortal(
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
          <span className={styles.policy}>隐私政策</span>
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
          // 抽屉里确认（全部拒绝 / 确认我的选择）才算完成设置；×/遮罩/Esc 关闭则横幅保留
          if (applied) settle();
        }}
      />
    </>,
    document.body,
  );
}
