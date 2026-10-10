# 公共-Cookies 偏好中心 页面规格

源文件（旧原型，只读）：`/Users/very/Documents/工作/sanvist-github/Mysany-pc/`

| 文件 | 作用 |
|---|---|
| `cookies.js`（266 行） | 全局模块 `window.MSCookies`：偏好读写、四个分类文案、抽屉渲染与交互、轻提示 |
| `cookies.css`（153 行） | 抽屉、开关、按钮、轻提示样式 |
| `data.js` L149-184 | `window.DB.cookies`：Cookie 清单（「Cookie 详细信息」二级页的数据） |

使用方：

- 登录页 `app.js` L156-173：入口「Cookies 设置 · 已启用 N / 4 类」。
- 工作台 `wb.js` L515-693：右上角用户名下拉 → `设置`（L290）→ 设置弹窗 → 「Cookies 设置」行 → `设置 ›`（L627、L671-674）。
- `协议变更.html` 也加载 `cookies.js`，但只用其 `MSCookies.toast`。

两处调用的是**同一份代码、同一份文案、同一个 localStorage 键**，结果互相同步。

依赖：抽屉 HTML 中直接引用 `./static/icon-mysanyLogo.svg`；Cookie 清单读 `window.DB.cookies`（无则显示空态）。

## 1. 对外 API（`cookies.js` L254-265）

| 成员 | 说明 |
|---|---|
| `KEY` | `'ms_settings'` |
| `DEFAULT` | 默认偏好对象（见 §6） |
| `items` | 四个分类定义数组 `CK_ITEMS` |
| `adDesc` | 个性化广告说明文案（工作台设置弹窗使用） |
| `load()` | 读取偏好（合并默认值） |
| `save(s)` | 写入偏好（强制 `ckNecessary = true`） |
| `enabledCount(s)` | 四类中值为 true 的个数 |
| `total` | `CK_ITEMS.length` = 4 |
| `openDrawer(target, onDone)` | 打开抽屉；`target` 为偏好对象，确认时**直接改写该对象**并保存；`onDone(applied)` 在抽屉关闭时调用，`applied` 为 `true`（确认/全部拒绝）或 `false`（×/遮罩/Esc） |
| `toast(msg, kind)` | 轻提示，`kind` = `ok`（默认）/ `info` / `err` |

## 2. 抽屉整体结构（`render()`，L162-178）

```
.dw-mask（全屏遮罩，fixed，inset 0，rgba(0,0,0,.45)，z-index 420，flex 右对齐）
└─ .drawer（role="dialog" aria-label="Cookies 偏好中心"；480px 宽，max-width 100vw，100% 高，白底，纵向 flex）
   ├─ .dw-hd  顶部：logo + × 关闭
   ├─ .dw-bd  正文（可滚动）：主视图 或 Cookie 列表视图
   └─ .dw-ft  底部固定按钮：全部拒绝 / 确认我的选择
```

- 入场动画：`@keyframes dwin`，`translateX(100%) → none`，`.26s ease`。**无离场动画**（关闭时直接移除 DOM）。
- 每次 `render()` 整个抽屉 innerHTML 重绘，且 `.dw-bd` 滚动位置重置为 0。
- 抽屉 / toast 自带字体：`-apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "PingFang SC", Roboto, "Helvetica Neue", Arial, sans-serif`，14px / 1.5，颜色 `--ink-1`（不受登录页思源黑体影响，L21-29）。
- 抽屉全部文案为**中文**，不参与 i18n。

### 2.1 顶部 `.dw-hd`

- padding `16px 22px 8px`。
- 左：logo `<img src="./static/icon-mysanyLogo.svg" alt="My SANY">`，高 20px。
- 右：关闭按钮 `.dw-x`（`title="关闭"`）：36×36，`1px solid --line-2` 边框，圆角 4px，图标 15×15（×），颜色 `--ink-2`；hover 边框与图标变主题色。

### 2.2 主视图（`renderMain()`，L96-123），自上而下

1. 标题 `.dw-h2`：`首选项中心`（16px，700，margin `8px 0 10px`）
2. 段落 `.dw-p`（13px，行高 1.85，`--ink-2`，下边距 12px）：
   - `Cookie 是网站放置在你设备上的小文件，用于让网站正常运行、记住你的偏好，并帮助我们了解页面的使用情况。`
   - `你可以按类别选择是否允许。必要类别无法关闭，因为它们是网站运行所必需的；关闭其他类别可能会影响部分功能和你看到的内容的相关性。点击各分类标题可查看详细说明。`
3. 小标题 `.dw-h3`：`浏览器设置`（13px，700，margin `16px 0 4px`）
4. 段落：`你也可以在浏览器中阻止或删除 Cookie，但届时网站的部分功能可能无法正常运行。`
5. 分区行 `.dw-sec`（flex，margin `20px 0 12px`）：左 `<h3>管理许可偏好</h3>`（15px，700），右按钮 `全部允许`（`data-all`；自适应宽，padding `0 16px`，高 32px，13px，白底描边）
6. 四张分类手风琴卡片 `.ct`（见 §3）

### 2.3 底部 `.dw-ft`

- flex，gap 12px，padding `14px 22px`，上边框 `1px solid --line`。
- 按钮（各 `flex:1`，高 40px）：
  - 左 `全部拒绝`（`data-none`，`.btn` 白底描边，hover 主题色描边/文字）
  - 右 `确认我的选择`（`data-ok`，`.btn.btn-p` 主题色实心白字，500 字重；hover `#ab0009`）
- 主视图与 Cookie 列表视图**都显示**这两个按钮，随时可提交。

## 3. 分类手风琴（`CK_ITEMS`，L30-43）

| 顺序 | key | 标题 | 右侧控件 | 说明文案（逐字） |
|---|---|---|---|---|
| 1 | `ckNecessary`（`lock:true`） | `绝对必要的 Cookie` | 文字 `始终处于活动状态`（13px，`--blue` #2a78d6，不换行），**无开关** | `这类 Cookie 是网站运行所必需的，无法在系统中关闭。它们通常只在你主动操作时才会生成，例如登录、填写表单或设置隐私偏好。你可以通过浏览器阻止这些 Cookie，但网站的部分功能将无法正常工作。` |
| 2 | `ckFunctional` | `功能 Cookie` | 开关 | `这类 Cookie 用于提供增强功能与个性化设置，例如记住你选择的语言、侧边菜单的折叠状态等。如果不允许，部分功能可能无法正常使用。` |
| 3 | `ckAnalytics` | `性能 Cookie` | 开关 | `这类 Cookie 用于统计访问量与流量来源，帮助我们了解哪些页面最受欢迎、用户如何在站点中浏览，从而衡量并改进页面性能。所有信息都是汇总的，因此是匿名的。` |
| 4 | `ckAds` | `定向 Cookie` | 开关 | `这类 Cookie 可能由我们的广告合作伙伴设置，用于建立你的兴趣画像并展示相关推广内容。它们不会直接存储个人身份信息，而是基于对浏览器和设备的唯一标识。如果不允许，你看到的推广内容相关性会降低。` |

卡片结构：

```
.ct[data-i=i]（1px --line-2 边框，圆角 4px，下边距 10px；展开时加 .open）
├─ .ct-hd[data-toggle=i]（flex，gap 12px，padding 14px，整行可点击）
│   ├─ .ct-plus  图标：收起为「+」，展开为「−」（16×16 容器，图标 14×14，--ink-2）
│   ├─ .ct-name  标题（14px，600，flex:1；整行 hover 时标题变主题色）
│   └─ 右侧：始终处于活动状态 / 开关 .sw[data-sw=key][role=switch][aria-checked]
└─ .ct-bd（max-height 0 → .open 时 620px，transition max-height .26s ease，overflow hidden）
    ├─ <p> 说明（padding 0 14px 10px，13px，行高 1.85，--ink-2）
    └─ .ct-more（padding 0 14px 14px）> span[data-detail=key]「Cookie 详细信息」+ 右箭头 ›（13px，--blue，hover 下划线，箭头 11×11）
```

- 四类（**包括必要类**）展开后都有「Cookie 详细信息 ›」入口。
- 初始全部收起（`open = {}`）。各卡片展开状态独立，可同时展开多张。
- 展开/收起只切换该卡片的 class 与图标，不整体重绘。
- 展开状态在「主视图 ↔ Cookie 列表」之间来回切换时**保留**（`open` 对象在 `openDrawer` 闭包内）；关闭抽屉后丢失。

### 3.1 开关 `.sw`（`cookies.css` L43-57）

- 40×22，圆角 11px；关：`#d5d9e0`；开（`.on`）：主题色 `#c6000b`。
- 滑块 18×18 白色圆形，`top/left 2px`，阴影 `0 1px 3px rgba(0,0,0,.22)`；开时 `translateX(18px)`。过渡 `.2s`。
- `.sw.lock`（opacity .5、not-allowed）样式存在，抽屉中未使用（工作台设置弹窗的 `sw(k, lock)` 有该参数）。

### 3.2 开关事件隔离（L196-249）

抽屉使用**单个委托 click 监听**挂在 `.dw-mask` 上，判断顺序（命中即 return）：

1. 点击遮罩本身（`e.target === mk`）或 `[data-x]`（×）→ `close(false)`
2. `[data-detail]` → 进入 Cookie 列表
3. `[data-blist]` → 返回主视图
4. `[data-host]` → 切换主机分组展开
5. **`[data-sw]` → 切换开关**（`e.stopPropagation()`，并在此 return）
6. `[data-toggle]` → 切换手风琴
7. `[data-all]` → 全部允许
8. `[data-none]` → 全部拒绝
9. `[data-ok]` → 确认我的选择

开关位于 `.ct-hd[data-toggle]` 内部，但因第 5 步先于第 6 步判断并 return，**点开关不会展开/收起手风琴**。迁移时（如 antd Collapse 的 `extra` 放 Switch）需在 Switch 的 onClick 中 `stopPropagation`。

开关点击：仅修改抽屉内临时副本 `d[key]`、切换 `.on` 和 `aria-checked`，**不写存储**。

## 4. Cookie 列表二级页（`renderList()`，L125-160）

进入：点任一分类的「Cookie 详细信息」→ `listCat = key; view = 'list'; hopen = {}`，整体重绘（滚动回顶）。

结构（自上而下）：

1. `.ck-back`（flex，gap 10px，margin `8px 0 6px`）：返回箭头 `‹`（`data-blist`，17×17，`--ink-2`，hover 主题色）+ `<h3>Cookie 列表</h3>`（16px，700）
2. `.ck-cat`：`{分类标题} · 共 {N} 项`，例如 `绝对必要的 Cookie · 共 4 项`（12px，`--ink-3`，左缩进 27px 与标题对齐）
3. 按**主机分组**的手风琴 `.hg`（每组上边框 `1px --line`，最后一组加下边框）：
   - `.hg-hd[data-host=i]`（flex，gap 12px，padding `15px 2px`）：`+`/`−` 图标（颜色 **`#d4901f`** 橙色）+ 主机名 `.hg-n`（14px，可断行；hover 主题色）
   - `.hg-bd`：max-height 0 → `.open` 时 3000px，`.26s ease`
   - 展开后每条 Cookie 一张卡片 `.ck-card`（背景 `--bg-card` #f7f8fa，圆角 4px，padding `14px 16px`，下边距 12px），六行字段 `.ck-f`（13px，padding `5px 0`，gap 14px；键 62px 宽 600 `--ink-1`；值 `--ink-2` 行高 1.75）：

| 顺序 | 键 | 值来源 |
|---|---|---|
| 1 | `名称` | `r.name` |
| 2 | `主机` | `r.host` |
| 3 | `持续时间` | `r.dur` |
| 4 | `类型` | `r.type` |
| 5 | `类别` | 当前分类标题 `cat.t`（不是数据字段） |
| 6 | `说明` | `r.desc` |

- 分组规则：按 `host` 字段**首次出现的顺序**去重分组；组内按数据原顺序。
- 分组初始全部收起；每次进入列表页都重置为收起（`hopen = {}`）；可多组同时展开。
- 空态：该分类无数据（或 `window.DB.cookies` 不存在）→ `<p class="dw-p" style="padding-top:12px;">该分类下暂无 Cookie。</p>`，计数显示 `共 0 项`。
- 返回：点 `‹` → `view = 'main'` 重绘，主视图手风琴展开状态保留，滚动回顶。
- 列表页**没有**「全部允许」按钮，也没有开关；底部「全部拒绝 / 确认我的选择」照常可用。
- 值均经 `esc()` 转义（`& < > "`）；分类说明 `c.d`、标题 `c.t` 在主视图中**未转义**直接拼接。

### 4.1 数据：`data.js` `DB.cookies`（L149-184）

结构：`{ ckNecessary: Row[], ckFunctional: Row[], ckAnalytics: Row[], ckAds: Row[] }`，`Row = { name, host, dur, type, desc }`。

| 分类 | 条目（name / host / dur / type） | 分组结果 |
|---|---|---|
| `ckNecessary`（L150-159） | `ms_settings` / 第一方 Cookie / 180 天 / 第一方；`mysany_lang` / 第一方 Cookie / 180 天 / 第一方；`SESSIONID` / 第一方 Cookie / 会话结束时 / 第一方；`XSRF-TOKEN` / 第一方 Cookie / 会话结束时 / 第一方 | 1 组：第一方 Cookie（4 条） |
| `ckFunctional`（L160-167） | `ms_collapsed` / 第一方 Cookie / 180 天；`ms_open` / 第一方 Cookie / 180 天；`ms_route` / 第一方 Cookie / 会话结束时（type 均为 第一方） | 1 组（3 条） |
| `ckAnalytics`（L168-175） | `_stat_id` / analytics.example.com / 2 年 / 第三者；`_stat_ses` / analytics.example.com / 30 分钟 / 第三者；`_perf_sample` / 第一方 Cookie / 1 天 / 第一方 | 2 组：analytics.example.com（2）、第一方 Cookie（1） |
| `ckAds`（L176-183） | `_ad_uid` / ads.example.com / 1 年 / 第三者；`_ad_imp` / ads.example.com / 90 天 / 第三者；`_ad_click` / promo.example.com / 30 天 / 第三者 | 2 组：ads.example.com（2）、promo.example.com（1） |

`desc` 原文见 `data.js` 对应行；性能 / 定向两类的 `desc` 均以 `示例条目：` 开头。`host` 字段中「第一方 Cookie」同时充当分组名，不是真实域名。

## 5. 按钮行为与提交

| 操作 | 行为 | 写存储 | 关闭抽屉 | toast |
|---|---|---|---|---|
| `全部允许`（主视图） | 临时副本四类全部置 true，整体重绘（手风琴展开态保留，滚动回顶） | **否** | 否 | `已允许全部 Cookie`（info） |
| `全部拒绝` | 临时副本：必要类 true，其他三类 false；然后 commit | 是 | 是，`onDone(true)` | `已拒绝全部非必要 Cookie`（ok） |
| `确认我的选择` | commit 当前临时副本 | 是 | 是，`onDone(true)` | `Cookie 偏好已保存`（ok） |
| ×（`dw-x`） / 点击遮罩空白 / `Esc` | 丢弃临时副本 | 否 | 是，`onDone(false)` | 无 |

commit（L188-194）：把临时副本 `d` 中四个分类键写回**传入的 `target` 对象** → `target.ckNecessary = true` → `save(target)` → `close(true)` → 弹 toast（先关闭再提示）。

`Esc`：`openDrawer` 时在 `document` 上注册 `keydown`（L185-186），关闭时移除。

### 5.1 轻提示 toast（L54-76，样式 L138-153）

- 容器 `#toasts`：宿主页面没有时自动创建并追加到 body。`position:fixed; top:64px; left:50%; translateX(-50%)`，z-index 500，纵向排列 gap 8px，`pointer-events:none`。
- 单条：白底，阴影 `0 6px 16px rgba(0,0,0,.12)`，圆角 6px，padding `9px 16px`，13px；左侧 15×15 图标：ok 绿色对勾 `#2a9d4e`、info 蓝色 i `#2a78d6`、err 红色 × `#f5222d`。
- 入场 `ti .2s`（opacity 0 + translateY(-8px) → 正常）；**2600ms 后直接移除**，无离场动画。

## 6. localStorage：`ms_settings`

- 键名：`ms_settings`（`SET_KEY`，L15）。
- 值：JSON 字符串，对象结构：

```js
{
  ckNecessary: true,    // 必要，恒为 true
  ckFunctional: true,   // 功能，默认 true
  ckAnalytics: true,    // 性能，默认 true
  ckAds: false,         // 定向，默认 false
  personalAds: false    // 个性化广告（工作台设置弹窗的独立开关），默认 false
}
```

- 读 `load()`（L24-27）：`Object.assign({}, SET_DEFAULT, JSON.parse(getItem || '{}'))`；无值时得到默认值；JSON 解析失败时返回默认值副本。缺失字段用默认值补齐。
- 写 `save(s)`（L28）：先强制 `s.ckNecessary = true`，再 `setItem(JSON.stringify(s))`。整对象覆盖写入，因此 `personalAds` 会随传入对象一起写入。
- 写入时机：
  - 抽屉「全部拒绝」「确认我的选择」（登录页、工作台皆同）。
  - 工作台设置弹窗「保存」（`wb.js` L686-690）。
- 默认已启用数 = 3 / 4。

## 7. 与工作台设置弹窗的联动（`wb.js`）

设置弹窗（`openSettings()`，L585-693）：

- 打开时 `draft = loadSet()`（= `MSCookies.load()`）。
- 「Cookies 设置」行（L622-627）：标题 `Cookies 设置`，说明 `管理各类 Cookie 的启用状态，了解它们分别用于什么。`，状态 `.set-status` = `已启用 {on} / 4 类`（`ckStatus()`，L589-592，按 `draft` 计算，12px `--ink-4`），右侧蓝色链接 `设置 ›`（`data-ck`）。
- 点 `设置 ›`（L671-674）：`openCookieDrawer(draft, function () { render(); })`——**传入的是设置弹窗的 `draft` 对象本身**，抽屉确认后改写 `draft` 并 `save(draft)`；关闭回调中重绘设置弹窗主视图，从而刷新「已启用 N / 4 类」。
- 抽屉遮罩 z-index 420，叠在设置弹窗遮罩（`.mask` z-index 400）之上。两者是 body 下的兄弟节点，抽屉内的点击不会冒泡到设置弹窗。
- 「个性化广告」行：说明文案 `AD_DESC` = `关闭个性化广告将限制sanvist向你推送相关广告的能力，但不会减少你收到的广告数量。`（`cookies.js` L45），开关键 `personalAds`，只改 `draft`。
- 设置弹窗底部 `取消`（`data-close`）/ `保存`（`data-save`）；保存 → `saveSet(draft)` → 关闭 → toast `设置已保存`（`wb.js` 自己的 toast，同样 2600ms）。
- 设置弹窗中带 `.lock` 的开关点击会 toast `必要 Cookies 无法关闭`（L679），但当前设置弹窗只渲染了 `personalAds` 一个开关，且未加 lock，该分支实际不可达。

登录页联动：`openDrawer(MSCookies.load(), paintCk)`，每次打开都重新从存储读取；关闭后 `paintCk` 再读存储刷新状态行。登录页选择后进入工作台，设置弹窗读同一键，结果一致；反之亦然。

## 8. CSS 变量（`cookies.css` L7-19）

| 变量 | 值 |
|---|---|
| `--theme` | `#c6000b` |
| `--ink-1` / `--ink-2` / `--ink-3` / `--ink-4` | `#1d2129` / `#4e5969` / `#86909c` / `#a9b0ba` |
| `--line` / `--line-2` | `#eef0f3` / `#e5e8ed` |
| `--bg-card` | `#f7f8fa` |
| `--blue` | `#2a78d6` |
| `--shadow-pop` | `0 6px 16px rgba(0,0,0,.12)` |
| `--r` | `6px` |

通用按钮 `.btn`：默认 `width:100%; height:36px`，圆角 4px，`1px solid --line-2`，白底，14px，过渡 `.18s`；hover 主题色描边与文字。`.btn-p` 默认带 `margin-bottom:10px`（抽屉底部被 `.dw-ft .btn { margin:0 }` 覆盖）。

## 9. 原型中的疑似缺陷或不一致

1. **工作台：Cookies 抽屉确认会顺带保存未保存的「个性化广告」**。抽屉 commit 对传入的设置弹窗 `draft` 调用 `save(draft)`，`draft` 中可能含有用户刚切换但尚未点「保存」的 `personalAds`；之后即使点设置弹窗「取消」，`personalAds` 也已写入。与 README「取消不生效」描述冲突。
2. **工作台：在抽屉中按 Esc 会同时关闭抽屉和设置弹窗**。两者各自在 `document` 上注册了 Esc 监听，均未阻止传播。
3. 「全部允许」只改临时副本、不写存储，但 toast 文案为 `已允许全部 Cookie`，易被理解为已生效；随后用 ×/Esc/遮罩关闭则全部丢弃。（README 写「全部拒绝 / 确认我的选择两者都会立即写入」，未说明全部允许不写入。）
4. 「全部允许」触发整体重绘，正文滚动位置跳回顶部。
5. 抽屉内容不随登录页语言切换，英文模式下为中文。
6. `data.js` 中 `ms_settings`、`mysany_lang` 等标注 `持续时间 180 天`，但它们实际是 localStorage（无过期时间），并非 Cookie；`SESSIONID`、`XSRF-TOKEN` 在本地原型中代码中未体现实际写入。
7. `data.js` 将 `mysany_lang` 归为「绝对必要」，而「功能 Cookie」的说明文案写「例如记住你选择的语言」，分类口径不一致。
8. Cookie 列表的「类别」字段显示分类标题（如 `绝对必要的 Cookie`），「类型」字段值为 `第一方` / `第三者`（不是常见的「第三方」）。
9. 必要类显示「始终处于活动状态」但没有开关；`.sw.lock` 样式未被抽屉使用。
10. 抽屉无关闭动画，关闭即移除；toast 也无离场动画。
11. 关闭回调 `onDone` 在 ×/Esc/遮罩取消时也会被调用（参数 `false`），登录页与工作台都没有区分 `applied`，均执行刷新/重绘。
12. 抽屉没有焦点管理（打开时不聚焦、无焦点陷阱），键盘 Tab 可移到背后页面。
13. 主视图中分类标题和说明文案未经转义直接拼入 HTML（列表页字段做了转义），两处处理方式不一致。
14. 工作台设置弹窗 `.lock` 开关分支（`必要 Cookies 无法关闭`）不可达。
15. `AD_DESC` 中 `sanvist` 为小写英文且与中文无空格：`限制sanvist向你推送`。
