import { POLICY_UPDATE_DOCS, POLICY_UPDATE_VERSION, SETTINGS_DOCS } from '@/mock/common/agreements';
import { STORAGE_KEYS, writeText } from '@/utils/storage';

export interface AgreementDoc {
  title: string;
  /** 正文 HTML（本地示例文本） */
  body: string;
}

export type SettingsDocKey = keyof typeof SETTINGS_DOCS;
export type PolicyDocKey = keyof typeof POLICY_UPDATE_DOCS;

/** 设置弹窗中「查看」打开的协议（v1.0 示例文本） */
export const getSettingsDoc = (key: SettingsDocKey): AgreementDoc => SETTINGS_DOCS[key];

/** 协议变更：当前线上版本 */
export const getPolicyVersion = () => POLICY_UPDATE_VERSION;

/** 协议变更弹窗中打开的协议（v3.2 示例文本） */
export const getPolicyDoc = (key: PolicyDocKey): AgreementDoc | undefined =>
  POLICY_UPDATE_DOCS[key];

/** 记录本机已同意的协议版本（原型只写不读，演示页每次进入都弹出） */
export function rememberAgreedVersion(version: string): void {
  writeText(STORAGE_KEYS.policyAgreedVersion, version);
}
