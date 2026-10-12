/**
 * 文案取自线上 gioms 开通状态页的 zh_CN 语言包（mySany.authLogin.*）。
 * 线上是按语言包取值的，这里没有多语言需求，收敛成常量。
 */
export const ACTIVATION_TEXT = {
  /** 三种形态的标题 / 说明 */
  applyTitle: '申请开通发电机组智慧运营系统',
  applyContent:
    '您尚未开通发电机组智慧运营系统账号，提交申请后管理员将为您注册账号并分配功能权限，审核通过后即可使用。',
  pendingTitle: '申请已提交，审核中',
  pendingContent:
    '您的开通申请已提交，管理员正在审核中。审核通过后将自动为您注册账号并分配功能权限，届时可直接进入系统。',
  approvedTitle: '审核通过，账号已开通',
  approvedContent:
    '您的开通申请已通过审核，管理员已为您注册账号并分配功能权限。现在即可进入发电机组智慧运营系统。',

  registerWithTip: '将使用以下 sanvist 信息注册',
  applyInfo: '申请信息',
  account: '账号',
  name: '姓名',
  currentStatus: '当前状态',
  pendingReview: '待审核',
  approved: '已通过',

  stepSubmit: '提交申请',
  stepReview: '管理员审核',
  stepApproved: '审核通过',

  backToSanvist: '返回 sanvist',
  submitApply: '提交申请',
  enterSystem: '进入系统',
  reviewTip: '审核通常在 1-2 个工作日内完成',
  enterSystemTip: '您可使用 sanvist 账号直接进入系统',

  /** 提示语（线上为 createMessage 轻提示） */
  submitSuccess: '提交申请成功, 等待管理员设置权限',
  submitFailed: '提交失败',
  missingLoginName: '认证信息缺少登录账号（loginName）',
};

/** 步骤条文案，顺序与线上一致 */
export const ACTIVATION_STEPS = [
  ACTIVATION_TEXT.stepSubmit,
  ACTIVATION_TEXT.stepReview,
  ACTIVATION_TEXT.stepApproved,
];
