# MySANY PC 端（客户门户）前端原型

PC 端客户门户的高保真交互原型，与 PRD / 页面规格一起维护，供产品评审和研发对照实现。由旧版多个独立 HTML 原型（`sanvist-github/Mysany-pc`）迁移而来，规范与 `sany-admin` 保持一致。

- 技术栈：React 18 + TypeScript + Ant Design 5 + React Router 6（HashRouter）+ Vite
- 数据：全部为本地 mock（`src/mock`），页面通过 `src/services` 取数，不依赖后端；演示中的修改保存在浏览器 localStorage

## 直接查看（不需要安装）

双击 `dist/index.html` 即可打开（单文件打包，代码和图片都已内联；登录页字体在 `dist/static/fonts`，与 `index.html` 放在一起）。

演示账号已预填：**admin / 123**。

## 本地开发

需要 Node.js 18 及以上版本。

```bash
npm install      # 首次安装依赖
npm run dev      # 启动开发服务器，浏览器打开 http://localhost:5174
```

| 命令 | 说明 |
|---|---|
| `npm run dev` | 本地开发，保存后自动刷新 |
| `npm run build` | 类型检查并打包到 `dist/`（改完代码要重新执行，`dist/index.html` 才会更新） |
| `npm run preview` | 本地预览打包结果 |
| `npm run typecheck` | 仅类型检查 |
| `npm run lint` | ESLint 检查 |
| `npm run format` | Prettier 格式化 |

## 页面清单

| 模块 | 页面 | 路由 | 页面规格 / 文档 |
|---|---|---|---|
| — | 登录 | `#/login` | [登录](docs/page-specs/登录.md) |
| 工作台 | 工作台 | `#/workbench` | [工作台](docs/page-specs/工作台.md) |
| 工作台 | 协议变更（演示：进入即弹出更新提示） | `#/policy-update` | [协议变更](docs/page-specs/协议变更.md) |
| 工作台 | 吊装规划（入口：工作台快速链接） | `#/lift-planning` | [吊装规划](docs/page-specs/吊装规划.md)、[PRD](docs/requirements/吊装规划-PRD.md) |
| 企业服务 | 租户管理 | `#/enterprise/tenant` | [租户管理](docs/page-specs/企业服务-租户管理.md) |
| 企业服务 | 个人中心 | `#/enterprise/profile` | [个人中心](docs/page-specs/企业服务-个人中心.md) |
| 企业服务 | 组织管理 | `#/enterprise/organization` | [组织管理](docs/page-specs/企业服务-组织管理.md)、[设备分配 PRD](docs/requirements/设备分配与导入-PRD.md) |
| 企业服务 | 用户管理 | `#/enterprise/user` | [用户管理](docs/page-specs/企业服务-用户管理.md)、[设备分配 PRD](docs/requirements/设备分配与导入-PRD.md) |
| 企业服务 | 角色管理 | `#/enterprise/role` | [角色管理](docs/page-specs/企业服务-角色管理.md) |
| 企业服务 | 自助服务 | `#/enterprise/self-service` | |

公共部分：顶栏（消息 / 语言 / 租户 / 用户下拉）、侧栏（折叠态浮层子菜单）、设置弹窗、Cookies 偏好中心，见 [外壳与菜单](docs/page-specs/公共-外壳与菜单.md)、[设置弹窗](docs/page-specs/公共-设置弹窗.md)、[Cookies 偏好中心](docs/page-specs/公共-Cookies偏好中心.md)。

其余菜单保留在侧栏中，点击后显示占位页。

## 目录与规范

目录结构、新增页面的步骤、通用组件和编码约定见 [docs/CONVENTIONS.md](docs/CONVENTIONS.md)；按菜单定位和修改页面见 [CLAUDE.md](CLAUDE.md)。

页面规格（[docs/page-specs/](docs/page-specs/)）是从旧版 HTML 原型逐页提取的，记录了字段、文案、交互规则和原型缺陷，是迁移的验收依据。

## 本地存储

演示数据和偏好保存在浏览器 localStorage，键名沿用旧版原型，集中定义在 `src/utils/storage.ts`。想恢复初始数据，在浏览器开发者工具中清除本站的 localStorage 即可。

## 对接真实接口

页面只调用 `src/services/**` 导出的函数，函数签名就是接口契约。对接时把函数体里的 mock 逻辑换成真实请求即可，页面代码无需改动。
