import { ACTIVATION } from '@/mock/lift-planning/activation';
import { delay } from '@/mock/utils';

/**
 * 开通状态：apply 未申请 / pending 审核中 / approved 已开通
 * 对应线上 gioms「第三方账号开通审核状态」页的三种形态。
 */
export type ActivationStage = 'apply' | 'pending' | 'approved';

export interface LiftActivation {
  stage: ActivationStage;
  /** sanvist 账号（线上取自 authInfo.loginName） */
  account: string;
  /** sanvist 姓名 */
  name: string;
}

/** 进入页面时校验第三方 token 并取回开通状态（线上 POST /api/auth/third-party/validate-token） */
export async function getActivation(): Promise<LiftActivation> {
  await delay(0);
  return { ...ACTIVATION };
}

/** 提交开通申请（线上 POST /api/auth/third-party/create-user），成功后进入审核中 */
export async function submitActivation(): Promise<void> {
  await delay();
  ACTIVATION.stage = 'pending';
}

/** 进入系统（线上用三方账号自动登录），演示环境只作为跳转前的一步 */
export async function enterSystem(): Promise<void> {
  await delay();
}
