import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Button, Checkbox, Dropdown, Input } from 'antd';
import { CaretDownFilled, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import logo from '@/assets/icon-mysanyLogo.svg';
import qrCorner from '@/assets/login-qr-corner.png';
import { pageTitle } from '@/config/app';
import { HOME_PATH } from '@/router/resolve';
import { STORAGE_KEYS, readText, writeText } from '@/utils/storage';
import { GlobeIcon, KeyIcon, UserIcon } from './components/icons';
import {
  DEFAULT_LANG,
  DEMO_ACCOUNT,
  LOGIN_LANGS,
  LOGIN_TEXT,
  OTP_COUNTDOWN,
  isLoginLang,
  type LoginLang,
} from './i18n';
import styles from './index.module.css';

type LoginTab = 'password' | 'otp';

const readLang = (): LoginLang => {
  const v = readText(STORAGE_KEYS.lang);
  return isLoginLang(v) ? v : DEFAULT_LANG;
};

/**
 * 登录页：语言切换、密码 / 验证码两种登录方式、两行独立协议勾选。
 * 首次进入时由路由级守卫（RequireConsent）重定向到独立的 Cookies 同意页（#/cookies-consent），
 * 选择完成后回到本页；之后只能在登录后的「设置」里修改。
 * 规格见 docs/page-specs/登录.md。
 */
export default function Login() {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [lang, setLang] = useState<LoginLang>(readLang);
  const t = LOGIN_TEXT[lang];

  const [tab, setTab] = useState<LoginTab>('password');
  const [username, setUsername] = useState(DEMO_ACCOUNT.user);
  const [password, setPassword] = useState(DEMO_ACCOUNT.pass);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [agreeService, setAgreeService] = useState(true);

  const [countdown, setCountdown] = useState(0);
  const timer = useRef<number>();

  useEffect(() => {
    document.title = pageTitle('登录');
  }, []);

  // 与原型一致：语言写入 mysany_lang（含首次进入），并同步 <html lang>
  useEffect(() => {
    writeText(STORAGE_KEYS.lang, lang);
    document.documentElement.lang = LOGIN_TEXT[lang].htmlLang;
    return () => {
      document.documentElement.lang = 'zh-CN';
    };
  }, [lang]);

  useEffect(() => () => window.clearInterval(timer.current), []);

  const fieldsFilled =
    tab === 'password'
      ? username.trim() !== '' && password.trim() !== ''
      : phone.trim() !== '' && code.trim() !== '';
  const canSubmit = fieldsFilled && agreePrivacy && agreeService;

  // 原型用 alert() 提示错误，这里统一改为全局提示（与站内其他提示一致）
  const getCode = () => {
    if (!phone.trim()) {
      message.warning(t.needPhone);
      return;
    }
    setCountdown(OTP_COUNTDOWN);
    timer.current = window.setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) window.clearInterval(timer.current);
        return n - 1;
      });
    }, 1000);
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    if (!agreePrivacy || !agreeService) {
      message.warning(t.needAgree);
      return;
    }
    // 用户名去掉首尾空格，密码不去（与原型一致）；验证码登录不做校验
    if (
      tab === 'password' &&
      (username.trim() !== DEMO_ACCOUNT.user || password !== DEMO_ACCOUNT.pass)
    ) {
      message.error(t.badLogin);
      return;
    }
    navigate(HOME_PATH);
  };

  const openDoc = (name: string) => message.info(t.openDoc + name);

  const agreeLine = (checked: boolean, onChange: (v: boolean) => void, prefix: string, docName: string) => (
    <Checkbox
      className={styles.agreeLine}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    >
      {prefix}
      <span
        className={styles.link}
        onClick={(e) => {
          // 点协议名只打开协议，不切换勾选
          e.preventDefault();
          e.stopPropagation();
          openDoc(docName);
        }}
      >
        {docName}
      </span>
    </Checkbox>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          overlayClassName={styles.langMenu}
          menu={{
            items: LOGIN_LANGS.map((l) => ({ key: l.key, label: l.label })),
            selectable: true,
            selectedKeys: [lang],
            onClick: ({ key }) => setLang(key as LoginLang),
          }}
        >
          <span className={styles.lang} tabIndex={0}>
            <GlobeIcon />
            <span>{t.label}</span>
            <CaretDownFilled className={styles.langCaret} />
          </span>
        </Dropdown>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          {/* 二维码角标：原型无扫码登录功能，仅展示 */}
          <div className={styles.qr} title="Scan qr code login">
            <img alt="qr login" src={qrCorner} />
          </div>
          <div className={styles.qrTip}>{t.scanTip}</div>

          <div className={styles.logo}>
            <img src={logo} alt="logo" />
          </div>

          <div className={styles.tabs}>
            {(['password', 'otp'] as LoginTab[]).map((k) => (
              <div
                key={k}
                className={k === tab ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                onClick={() => setTab(k)}
              >
                <span>{k === 'password' ? t.tabPassword : t.tabOtp}</span>
                <i className={styles.tabBar} />
              </div>
            ))}
          </div>

          <form onSubmit={submit} autoComplete="off" noValidate>
            {/* 切换方式不清空另一种方式的输入 */}
            <div hidden={tab !== 'password'}>
              <Input
                className={styles.input}
                variant="borderless"
                prefix={<UserIcon />}
                placeholder={t.phEnter}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onPressEnter={() => submit()}
              />
              <Input.Password
                className={styles.input}
                variant="borderless"
                prefix={<KeyIcon />}
                placeholder={t.phEnter}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onPressEnter={() => submit()}
                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
              />
            </div>
            <div hidden={tab !== 'otp'}>
              <Input
                className={styles.input}
                variant="borderless"
                prefix={<UserIcon />}
                placeholder={t.phEnter}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onPressEnter={() => submit()}
              />
              <Input
                className={styles.input}
                variant="borderless"
                prefix={<KeyIcon />}
                placeholder={t.phEnter}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onPressEnter={() => submit()}
                suffix={
                  <button
                    type="button"
                    className={styles.codeBtn}
                    disabled={countdown > 0}
                    onClick={getCode}
                  >
                    {countdown > 0 ? `${countdown}s` : t.getCode}
                  </button>
                }
              />
            </div>

            <div className={styles.spacer} />

            {/* 两行协议各自独立勾选；顺序：隐私协议在上 */}
            <div className={styles.agreements}>
              {agreeLine(agreePrivacy, setAgreePrivacy, t.agreePrivacy, t.privacyPolicy)}
              {agreeLine(agreeService, setAgreeService, t.agreeService, t.serviceAgreement)}
            </div>

            <Button
              type="primary"
              htmlType="submit"
              block
              disabled={!canSubmit}
              className={styles.submit}
            >
              {t.loginBtn}
            </Button>
          </form>

          <div className={styles.register}>
            <span>{t.noAccount}</span>
            {/* 原型未实现注册 */}
            <span className={styles.link}>{t.registerNow}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
