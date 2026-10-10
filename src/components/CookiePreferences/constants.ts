import type { CookieCategoryKey } from '@/services/common/settings';

export interface CookieCategory {
  key: CookieCategoryKey;
  title: string;
  desc: string;
  /** 必要类：不可关闭，显示「始终处于活动状态」 */
  locked?: boolean;
}

/** 四个分类的标题和说明，原文取自原型 cookies.js 的 CK_ITEMS */
export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    key: 'ckNecessary',
    title: '绝对必要的 Cookie',
    locked: true,
    desc: '这类 Cookie 是网站运行所必需的，无法在系统中关闭。它们通常只在你主动操作时才会生成，例如登录、填写表单或设置隐私偏好。你可以通过浏览器阻止这些 Cookie，但网站的部分功能将无法正常工作。',
  },
  {
    key: 'ckFunctional',
    title: '功能 Cookie',
    desc: '这类 Cookie 用于提供增强功能与个性化设置，例如记住你选择的语言、侧边菜单的折叠状态等。如果不允许，部分功能可能无法正常使用。',
  },
  {
    key: 'ckAnalytics',
    title: '性能 Cookie',
    desc: '这类 Cookie 用于统计访问量与流量来源，帮助我们了解哪些页面最受欢迎、用户如何在站点中浏览，从而衡量并改进页面性能。所有信息都是汇总的，因此是匿名的。',
  },
  {
    key: 'ckAds',
    title: '定向 Cookie',
    desc: '这类 Cookie 可能由我们的广告合作伙伴设置，用于建立你的兴趣画像并展示相关推广内容。它们不会直接存储个人身份信息，而是基于对浏览器和设备的唯一标识。如果不允许，你看到的推广内容相关性会降低。',
  },
];

/** 个性化广告说明（工作台设置弹窗使用），原文保留 */
export const PERSONAL_ADS_DESC =
  '关闭个性化广告将限制sanvist向你推送相关广告的能力，但不会减少你收到的广告数量。';
