# Quick Admin · 前端工程（web）

简体中文 | [English](./README.en.md)

Vue 3 + Vite + Element Plus 后台管理前端，用 **JavaScript** 编写：Pinia 管状态，Tailwind CSS 4 与 SCSS 写样式，Axios 发请求。项目总览与部署见 [根目录 README.md](../../README.md)。

## 快速开始

环境：Node.js ≥ 20，依赖用 pnpm（仓库含 `pnpm-lock.yaml`；未安装时 `corepack enable` 或 `npm i -g pnpm`）。

```bash
cd frontend/web
pnpm install
pnpm run dev          # 默认端口 5173，取自 .env.development 的 VITE_PORT
```

在仓库根目录执行 `npm run dev` 会同时拉起前后端。联调时先起后端（默认 `http://127.0.0.1:8001`，即 `VITE_API_BASE_URL`）：浏览器请求发往同源路径，由 Vite `server.proxy` 把 `VITE_APP_BASE_API`（`/api/v1`）转发到后端。

## 常用脚本

| 命令 | 说明 |
|------|------|
| `pnpm run dev` | 本地开发（读取 `.env.development`） |
| `pnpm run dev:clean` | 清理 Vite 预构建缓存后启动（缓存异常时） |
| `pnpm run build` | 生产构建（读取 `.env.production`），产物在 `dist/` |
| `pnpm run preview` | 本地预览构建结果 |
| `pnpm run lint` | ESLint 检查（`lint:fix` 自动修复；`format` / `format:check` 走 Prettier） |

## 技术栈

| 类别 | 选型 |
|------|------|
| 框&#8288;架 | Vue 3（Composition API / `<script setup>`） |
| 构&#8288;建 | Vite 7 |
| 语&#8288;言 | JavaScript |
| UI | Element Plus 2.14 |
| 路&#8288;由 | Vue Router（Hash；静态路由 + 守卫内动态 `addRoute`） |
| 状&#8288;态 | Pinia + pinia-plugin-persistedstate |
| 样&#8288;式 | Tailwind CSS 4、SCSS |
| HTTP | Axios |
| 国&#8288;际&#8288;化 | vue-i18n（内置 zh / en） |
| 自&#8288;动&#8288;导&#8288;入 | unplugin-auto-import / -vue-components / -icons / -element-plus |

组件与 Element Plus 的 API 由 unplugin 按需自动注册，模板里直接写 `<QaXxx />` 即可，业务代码一般不需要手动 `import`。

## 架构概览

```txt
main.js → initPlugins(app)（Store → 主题 → Router → i18n → 指令）→ mount("#app")
路由守卫 beforeEach：NProgress 与存储态检查 → 登录校验 → 后端菜单转动态 addRoute → 权限校验 → 404 回落
```

路由为 **Hash 模式**：静态路由（登录 / 布局 / 异常页）首屏注册，业务路由由守卫依据后端菜单延迟挂载。请求层 `utils/request.js` 统一处理成功与失败提示，并支持 **Token 静默续期**（401 时自动 refresh，并发请求用队列合并，续期失败跳转登录）。

## 目录结构（src）

```txt
src/
├── api/          # 按业务模块封装的请求（module_system 等）
├── assets/       # 图片、SVG 图标等资源
├── components/   # 通用与业务组件（自动注册，qa-* 前缀）
├── config/       # 应用配置（setting 默认项、headerBar、component）与根级 config.js
├── constants/    # 常量（app / router / settings / login / breakpoints / webLinks）
├── directives/   # 自定义指令（当前提供水波纹 ripple）
├── enums/        # 枚举（app / layout / theme / setting / result）
├── hooks/        # 组合式函数（hooks/core，自动导入）
├── layouts/      # 布局壳（顶栏、侧栏、面包屑、多标签页、锁屏、设置面板等）
├── locales.js    # i18n 语言包与 createI18n 装配（zh / en）
├── plugins/      # Vue 插件装配入口（initPlugins）
├── router/       # 路由：静态路由、守卫、菜单处理器、动态装载
├── store/        # Pinia 模块（user / menu / setting / dict / config / worktab / app）
├── styles/       # 全局样式（Tailwind、SCSS 主题变量与动画）
├── utils/        # 工具（请求层 request、storage、auth、ui、date、validator 等）
├── views/        # 页面（home / login / module_system / exception / fastlink / redirect）
└── main.js / App.vue
```

## 路径别名

`vite.config.js` 中定义：`@` 指向 `src/`，另有 `@views`、`@stores`、`@utils`、`@styles`、`@plugins`、`@api`、`@imgs` / `@icons`（`src/assets/images` 与 SVG）、`@qa_imgs`。

## 环境变量

只有 `VITE_` 开头的变量会注入前端代码，取值以 `.env.development` / `.env.production` 为准，改完需重启 `pnpm run dev`。

| 变量 | 作用 |
|------|------|
| `VITE_PORT` | 开发服务器端口 |
| `VITE_BASE_URL` | 部署基础路径（子目录部署形如 `/web/`） |
| `VITE_APP_BASE_API` | 接口路径前缀，与 Vite 代理匹配（`/api/v1`） |
| `VITE_API_BASE_URL` | 代理目标：后端 HTTP 根地址 |
| `VITE_API_URL` | 浏览器侧发出的 API 根前缀（开发常为 `/`） |
| `VITE_API_TIMEOUT` | 请求超时（毫秒） |
| `VITE_APP_TITLE` / `VITE_APP_ENV` | 页面标题 / 环境标识 |
| `VITE_LOCK_ENCRYPT_KEY` | 锁屏密码本地加密密钥（非安全敏感） |

## 路由与菜单

`router/routes.js` 静态路由，`guards.js` 前置守卫（登录校验、动态挂载、权限校验、404 回落），`menu-processor.js` 把后端菜单转成路由记录，`route-loader.js` 执行 `addRoute`，`refresh.js` 管理刷新态。新增业务页需要 **视图 +（可选）路由 + 后端菜单**，三者路径与 `name` 保持一致。

## 常见问题

| 现象 | 建议 |
|------|------|
| 连&#8288;不&#8288;上&#8288;后&#8288;端 | 后端未启动，或 `VITE_API_BASE_URL` 端口不对 |
| env&#8288;不&#8288;生&#8288;效 | 改 `.env.*` 后必须重启 `pnpm run dev` |
| 热&#8288;更&#8288;新&#8288;异&#8288;常 | `pnpm run dev:clean` 清缓存后重启 |

## 构建与部署

产物输出到 `dist/`；子路径部署时配置 `VITE_BASE_URL`，并由 Nginx 托管产物、把 `/api/v1` 反代到后端。生产链路见 [根目录 README.md](../../README.md) 与 `docker/`：根 `deploy.sh` 在宿主机构建前端产物，Nginx 挂载 `frontend/web/dist`。
