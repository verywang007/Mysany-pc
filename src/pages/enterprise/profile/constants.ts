export type ProfileTab = 'info' | 'pwd' | 'invite';

export const PROFILE_TABS: { key: ProfileTab; label: string; icon: string }[] = [
  { key: 'info', label: '个人信息', icon: 'user' },
  { key: 'pwd', label: '修改密码', icon: 'key' },
  { key: 'invite', label: '通知邀请', icon: 'mail' },
];

export type VerifyMode = 'old' | 'sms' | 'mail';

/** 验证方式：选项文案 + 第 2 行标签（原型 wb.js 的 VERIFY） */
export const VERIFY_MODES: { key: VerifyMode; option: string; label: string }[] = [
  { key: 'old', option: '旧密码验证', label: '原密码' },
  { key: 'sms', option: '短信验证码', label: '短信验证码' },
  { key: 'mail', option: '邮箱验证码', label: '邮箱验证码' },
];

/** 新密码规则：8-20 位，同时包含字母和数字（不 trim，空格计入长度） */
export const isValidPassword = (v: string) =>
  v.length >= 8 && v.length <= 20 && /[A-Za-z]/.test(v) && /\d/.test(v);

export const PHONE_RE = /^1\d{10}$/;
export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
