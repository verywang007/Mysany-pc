# 开发规范

本工程是 MySANY PC 端（客户门户）的高保真原型，技术栈与 sany-admin 一致：React 18 + TypeScript + Ant Design 5 + React Router 6（HashRouter）+ Vite。数据全部来自本地 mock，页面只通过 `services/` 取数，对接真实接口时只需替换 service 层。

打包为单个 `dist/index.html`（vite-plugin-singlefile），双击即可打开，不需要启动服务。

## 1. 目录

```
src/
├── config/menu.ts          菜单树，也是路由和页面标题的唯一来源；HIDDEN_PAGES 为不在侧栏显示的页面
├── config/app.ts           顶栏信息、当前用户 id、租户
├── router/pages.ts         路由 → 页面组件 注册表（登录页在 main.tsx 单独注册）
├── router/useGoMenu.ts     按菜单 key 跳转
├── layouts/BasicLayout/    顶栏 + 侧栏（折叠态浮层子菜单）
├── theme/                  antd 主题 token、颜色（index.ts）、页面专用色（pages/*.ts）、全局样式
├── components/             通用组件（见第 4 节）
├── services/<模块>/<页面>.ts 实体类型 + 查询/操作函数（当前由 mock 实现）
├── mock/<模块>/<页面>.ts    样本数据
├── utils/storage.ts        所有 localStorage 键名与读写
├── types/common.ts         分页等通用类型
└── pages/<模块>/<页面>/     页面
```

模块目录：`common`（跨页面）、`workbench`（工作台）、`enterprise`（企业服务）。

## 2. 新增一个页面

1. 在 `config/menu.ts` 给对应叶子节点补上 `path`（不在侧栏显示的页面加到 `HIDDEN_PAGES`）。
2. 新建 `pages/<模块>/<页面>/index.tsx`，默认导出页面组件。
3. 在 `router/pages.ts` 注册。
4. 数据：`mock/` 放样本数据，`services/` 写类型和函数。

有 `path` 但没注册组件的菜单显示「建设中」。

## 3. 页面内的文件划分

```
pages/enterprise/user/
├── index.tsx        页面主体
├── index.module.css 页面样式
├── columns.tsx      表格列定义（有表格时）
├── constants.ts     仅本页使用的值集、选项、校验规则
└── components/      本页的弹窗、抽屉、子视图，一个组件一个文件
```

单个文件超过约 300 行就要拆分。

## 4. 通用组件与工具

| 名称 | 用途 |
|---|---|
| `Icon` | 原型线性图标（菜单、工作台等），业务操作类图标优先用 `@ant-design/icons` |
| `CookiePreferences` | Cookies 偏好中心抽屉（登录页与设置弹窗共用） |
| `SettingsModal` | 设置弹窗 |
| `DocModal` | 协议阅读大弹窗（900px） |
| `PolicyUpdateModal` | 协议变更「更新提示」弹窗 |
| `utils/storage` | localStorage 键名与 `readJSON` / `writeJSON` 等，页面不直接读写 localStorage |
| `utils/feedback` | `usePrototypeActions`：原型未落地动作的统一提示 |
| `mock/utils` | `delay`、`paginate`、`fuzzy`、`exact`、`inRange`、`expand` |

提示统一用 `App.useApp()` 拿到的 `message` / `modal`，不要用静态方法，也不要用 `alert()`。

## 5. 编码约定

- TypeScript 严格模式，不用 `any`；实体类型写在对应的 service 文件里并导出。
- 命名：目录和路由用 kebab-case，组件用 PascalCase，变量和函数用 camelCase，常量用 UPPER_SNAKE_CASE。
- 颜色：全局语义色用 `theme/index.ts` 的 `colors`（CSS 里 `var(--color-xxx)`）；只在某页出现的取样色登记到 `pageColors` 或 `theme/pages/<页面>.ts`（CSS 里 `var(--<页面>-xxx)`）。CSS 里不要写死色值（`#fff` 除外）。
- 局部样式用 CSS Modules（`index.module.css`），覆盖 antd 内部样式用 `:global(.ant-xxx)` 并限定在本模块 class 下。
- 界面文案保留原型原文（含标点）。原型中明显的缺陷修正后，在代码注释里写明「修正原型缺陷：……」。
- 迁移旧页面时以 `docs/page-specs/` 中的规格为准。
- 提交前运行 `npm run typecheck`、`npm run lint`、`npm run build`，代码由 Prettier 格式化（`npm run format`）。

## 6. Git

- 分支：`main` 为稳定分支，开发使用 `feat/<页面>`、`fix/<问题>`。
- 提交信息采用 Conventional Commits：`feat: 迁移用户管理页`、`fix: 修复分页不生效`、`docs: 更新页面规格`。
