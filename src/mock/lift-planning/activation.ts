import type { LiftActivation } from '@/services/lift-planning/activation';

/**
 * 线上开通状态页的示例数据（账号 / 姓名取线上截图中的值，不脱敏）。
 * 把 stage 改成 'apply' / 'pending' / 'approved' 可分别预览三种形态；
 * 默认与线上当前状态一致：申请已提交，审核中。
 */
export const ACTIVATION: LiftActivation = {
  stage: 'pending',
  account: '3251424',
  name: '3251424',
};
