# 公共-Cookies 同意页 页面规格

路由：`#/cookies-consent`（独立全屏页面，不在主布局内，见 `src/main.tsx`）
源码：`src/pages/cookies-consent/`、守卫 `src/router/guard.tsx`、路径常量 `COOKIE_CONSENT_PATH`（`src/config/menu.ts`）

## 1. 定位

旧原型把 Cookie 同意做成登录页底部横幅（见《登录.md》§3.7 与原型注释）。本项目把它做成**独立页面**，但页面内容与登录页完全一致：

- 本页**完整渲染登录窗口**（复用 `@/pages/login` 组件，同款背景 / 卡片 / 表单），底部叠加同款同意横幅；
- 未做出选择前，登录窗口**不可操作**（`#root` 加 `inert` + 锁定滚动 + 透明遮罩兜底），必须先完成 Cookie 选择；
- 登录窗口本身不再有「Cookies 设置」入口，独立访问 `/login`（未授权）会被守卫送到本页；
- 已做出选择后，本页仍可主动访问，用于重新调整偏好；此时登录窗口不被锁定；
- 再次修改的常规入口是登录后的「设置」弹窗 → Cookies 设置（见《公共-Cookies偏好中心.md》）。

## 2. 路由守卫（`RequireConsent`）

| 条件 | 行为 |
|---|---|
| 当前路径是 `/cookies-consent` 或 `/lift-activation` | 放行（自身页面放行避免死循环；落地页放行保证外部门户链接可达） |
| `hasCookieConsent()` 为 true（`ms_cookie_consent === '1'`） | 放行 |
| 其余情况 | `<Navigate replace>` 到 `/cookies-consent?redirect=<encodeURIComponent(当前路径+查询串)>` |

挂载点：`main.tsx` 中包裹 `/login` 与 `*`（BasicLayout）两条路由。`/` 仍重定向到 `/login`，因此「首次访问站点」的完整体验是：

```
/ → /login → 未授权 → /cookies-consent?redirect=%2Flogin
  （登录窗口 + 底部横幅，窗口被锁定）
  → 做出选择 → 回到 /login（横幅消失、窗口解锁）→ 登录 → /workbench
```

因为本页本身就渲染登录窗口，从 `/login` 被带过来时选择完成后页面**内容不变**，只是横幅消失、解锁操作，不会出现界面跳变。

## 3. 页面结构

页面 = **登录窗口 + 底部同意横幅**（两者都与登录页一致）：

1. **登录窗口**：直接复用 `@/pages/login` 的页面组件（背景图 `login-bg.jpg`、右侧登录卡片、顶栏语言选择器、二维码角标等全部同款）。
2. **底部同意条**（portal 挂到 `body`，`position: fixed; bottom: 0`，白底 + `1px` 顶边线，`padding: 16px 40px`，`gap: 40px`）：
   - 左侧：标题 `我们重视您的隐私`（14px / 700）+ 说明（12px / 1.6，与登录页横幅逐字一致）+ 蓝色链接 `隐私政策`（12px，点击提示 `打开：隐私政策`，与登录页协议链接行为一致）
   - 右侧：`全部接受` / `全部拒绝` 两个蓝色实心按钮（`--color-blue`，96px 宽、高 32px、圆角 2px，与截图一致），下一行右对齐链接 `管理首选项`
3. **锁定层**（仅未做出选择时）：给 `#root` 加 `inert`、`body` 锁滚动，另加一层透明遮罩兜底（`z-index: 790`）。横幅与偏好抽屉通过 portal 挂在 `body` 下，**不受 `inert` 影响**，因此必须先作出选择。
4. 窄屏（≤720px）同意条改为纵向排列，按钮组左对齐，仍贴底。

## 4. 交互

| 操作 | 行为 |
|---|---|
| `全部接受` | `saveCookieFlags({ ckNecessary: true, ckFunctional: true, ckAnalytics: true, ckAds: true })` → `markCookieConsent()` → 跳 `redirect` |
| `全部拒绝` | `saveCookieFlags({ ckNecessary: true, 其余三类 false })` → `markCookieConsent()` → 跳 `redirect` |
| `管理首选项` | 打开 `CookiePreferences` 抽屉（480px 右侧抽屉，全部中文） |
| `隐私政策` | 提示 `打开：隐私政策`（无协议阅读弹窗，与登录页一致） |
| 抽屉内「全部拒绝」/「确认我的选择」 | 视为已选择：写存储 + 跳 `redirect` |
| 抽屉内 × / 遮罩 / Esc | 只关闭抽屉，页面保留（用户仍需做出选择） |
| 未做出选择时点击登录窗口任意位置 | 无响应（`inert` + 遮罩拦截，实测登录按钮点不动） |

跳转目标：URL 查询串 `redirect`（默认 `/login`，因本页主体就是登录窗口），使用 `navigate(target, { replace: true })`，避免浏览器回退再次落到本页。已做出选择后主动访问本页（无 `redirect`）时，跳转目标同样是 `/login`。

## 5. 数据与存储

| 键 | 读写 | 说明 |
|---|---|---|
| `ms_cookie_consent` | 读：守卫与页面初始化；写：做出选择时 | `'1'` 表示已选择，与具体偏好解耦 |
| `ms_settings` | 读：抽屉打开时；写：`全部接受` / `全部拒绝` / 抽屉确认 | 四个分类开关 + `personalAds`，见《公共-Cookies偏好中心.md》 |

默认（无 `ms_settings`）：必要 / 功能 / 性能为 true、定向为 false → `已启用 3 / 4 类`。

## 6. 与「设置」弹窗的关系

登录后「设置」弹窗中的 Cookies 行（见《公共-设置弹窗.md》）与本页读写**同一份** `ms_settings`：

- 在本页做出的选择，设置弹窗下次打开即反映；
- 在设置弹窗 / 偏好中心抽屉做出的修改，本页再次打开时同样反映；
- 「设置」只改偏好、不重置 `ms_cookie_consent`，因此修改后不会再次被守卫拦截到本页。

## 7. 场景目录入口

`config/menu.ts` 的 `HIDDEN_PAGES` 中注册为 `{ key: 'cookie-consent', label: 'Cookies 同意', path: COOKIE_CONSENT_PATH }`，因此场景目录（`#/scenes`）「独立场景」分组下自动出现一张 `Cookies 同意 · 独立` 卡片，便于评审直接打开。
