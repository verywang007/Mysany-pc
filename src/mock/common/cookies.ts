import type { CookieCategoryKey, CookieRow } from '@/services/common/settings';

/**
 * Cookie 清单，取自原型 data.js 的 cookies。
 * 「必要 / 功能」两类是本地页面真实使用的存储项；「性能 / 定向」两类是示例条目，域名为保留示例域名。
 */
export const COOKIES: Record<CookieCategoryKey, CookieRow[]> = {
  ckNecessary: [
    {
      name: 'ms_settings',
      host: '第一方 Cookie',
      dur: '180 天',
      type: '第一方',
      desc: '保存你在「设置」中的选择，包括各类 Cookie 的启用状态与个性化广告开关。清除后偏好会恢复默认。',
    },
    {
      name: 'mysany_lang',
      host: '第一方 Cookie',
      dur: '180 天',
      type: '第一方',
      desc: '记录界面语言（简体中文 / English），使你再次访问时无需重新选择。',
    },
    {
      name: 'SESSIONID',
      host: '第一方 Cookie',
      dur: '会话结束时',
      type: '第一方',
      desc: '用于维持登录会话，识别当前请求属于哪个已登录用户。关闭浏览器后失效。',
    },
    {
      name: 'XSRF-TOKEN',
      host: '第一方 Cookie',
      dur: '会话结束时',
      type: '第一方',
      desc: '用于校验请求来源，防止跨站请求伪造（CSRF）攻击，保障账号操作安全。',
    },
  ],
  ckFunctional: [
    {
      name: 'ms_collapsed',
      host: '第一方 Cookie',
      dur: '180 天',
      type: '第一方',
      desc: '记住左侧菜单是展开还是折叠状态，使布局在下次访问时保持一致。',
    },
    {
      name: 'ms_open',
      host: '第一方 Cookie',
      dur: '180 天',
      type: '第一方',
      desc: '记住左侧菜单中哪些分组处于展开状态。',
    },
    {
      name: 'ms_route',
      host: '第一方 Cookie',
      dur: '会话结束时',
      type: '第一方',
      desc: '记录你最后访问的页面，刷新后可回到同一位置。',
    },
  ],
  ckAnalytics: [
    {
      name: '_stat_id',
      host: 'analytics.example.com',
      dur: '2 年',
      type: '第三者',
      desc: '示例条目：用于以匿名方式区分访客，统计访问量与页面浏览路径，帮助衡量并改进页面性能。',
    },
    {
      name: '_stat_ses',
      host: 'analytics.example.com',
      dur: '30 分钟',
      type: '第三者',
      desc: '示例条目：标识一次访问会话，用于统计单次访问内的页面停留与跳转情况。',
    },
    {
      name: '_perf_sample',
      host: '第一方 Cookie',
      dur: '1 天',
      type: '第一方',
      desc: '示例条目：控制性能采样比例，避免重复上报同一用户的加载耗时数据。',
    },
  ],
  ckAds: [
    {
      name: '_ad_uid',
      host: 'ads.example.com',
      dur: '1 年',
      type: '第三者',
      desc: '示例条目：由广告合作伙伴设置，基于浏览器与设备的唯一标识建立兴趣画像，用于展示相关推广内容。',
    },
    {
      name: '_ad_imp',
      host: 'ads.example.com',
      dur: '90 天',
      type: '第三者',
      desc: '示例条目：记录推广内容的展示次数，用于控制同一广告的重复展示频率。',
    },
    {
      name: '_ad_click',
      host: 'promo.example.com',
      dur: '30 天',
      type: '第三者',
      desc: '示例条目：记录推广内容的点击行为，用于衡量投放效果。',
    },
  ],
};
