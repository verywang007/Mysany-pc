/** 登录页中英文文案，原文取自原型 app.js 的 I18N。只有登录页需要切换语言，不引入 i18n 库。 */
export type LoginLang = 'en-US' | 'zh-CN';

export const LOGIN_LANGS: { key: LoginLang; label: string }[] = [
  { key: 'en-US', label: 'English' },
  { key: 'zh-CN', label: '简体中文' },
];

export const DEFAULT_LANG: LoginLang = 'zh-CN';

export const isLoginLang = (v: unknown): v is LoginLang => v === 'en-US' || v === 'zh-CN';

const en = {
  label: 'English',
  htmlLang: 'en',
  scanTip: 'Scan qr code login more secure',
  tabPassword: 'Password Login',
  tabOtp: 'OTP Login',
  phEnter: 'Please enter',
  getCode: 'Get Code',
  agree: 'Agree ',
  privacyPolicy: 'Privacy Policy',
  serviceAgreement: 'User Service Agreement',
  cookieSettings: 'Cookies Settings',
  cookieStatus: '{n} / {m} categories enabled',
  loginBtn: 'Login',
  noAccount: 'No account yet?',
  registerNow: 'Register now',
  needPhone: 'Please enter phone number',
  needAgree: 'Please agree to the Privacy Policy and the User Service Agreement.',
  openDoc: 'Open: ',
  badLogin: 'Incorrect account or password (demo account: admin / 123)',
};

export type LoginText = typeof en;

const zh: LoginText = {
  label: '简体中文',
  htmlLang: 'zh-CN',
  scanTip: '扫码登录更安全',
  tabPassword: '密码登录',
  tabOtp: '验证码登录',
  phEnter: '请输入',
  getCode: '获取验证码',
  agree: '同意',
  privacyPolicy: '隐私协议',
  serviceAgreement: '用户服务协议',
  cookieSettings: 'Cookies 设置',
  cookieStatus: '已启用 {n} / {m} 类',
  loginBtn: '登 录',
  noAccount: '还没有账号？',
  registerNow: '立即注册',
  needPhone: '请输入手机号',
  needAgree: '请先同意隐私协议和用户服务协议。',
  openDoc: '打开：',
  badLogin: '账号或密码不正确（演示账号：admin / 123）',
};

export const LOGIN_TEXT: Record<LoginLang, LoginText> = { 'en-US': en, 'zh-CN': zh };

/** 演示账号（原型写死） */
export const DEMO_ACCOUNT = { user: 'admin', pass: '123' };

/** 获取验证码倒计时秒数 */
export const OTP_COUNTDOWN = 60;
