import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { COOKIE_CONSENT_PATH, LIFT_ACTIVATION_PATH } from '@/config/menu';
import { hasCookieConsent } from '@/services/common/settings';

/**
 * Cookie 同意守卫：未完成选择时，把 /login 与主布局内的所有页面重定向到 Cookies 同意页。
 * - 自身 /cookies-consent 不拦截（避免死循环）
 * - /lift-activation（独立落地页）也不拦截，否则未授权用户从外部链接触达时会卡死
 * - 完成后由 Cookies 同意页读取 ?redirect= 回到这里
 */
export function RequireConsent({ children }: { children: ReactNode }) {
  const { pathname, search } = useLocation();

  // 例外：不强制授权（自身页面 / 外部入口）
  if (pathname === COOKIE_CONSENT_PATH || pathname === LIFT_ACTIVATION_PATH) {
    return <>{children}</>;
  }

  if (hasCookieConsent()) return <>{children}</>;

  const redirect = encodeURIComponent(pathname + search);
  return <Navigate to={`${COOKIE_CONSENT_PATH}?redirect=${redirect}`} replace />;
}
