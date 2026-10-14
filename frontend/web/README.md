# Quick Admin · 前端工程（web）

简体中文 | [English](./README.en.md)

基于 **Vue 3 + Vite + Element Plus** 的后台管理前端，与 Quick Admin 后端（FastAPI）配套使用。采用 **JavaScript** 编写，状态管理为 **Pinia**，样式以 **Tailwind CSS 4** 与 **SCSS** 为主，接口请求使用 **Axios**。

> **与仓库根文档的关系**：项目总览、一键前后端启动、演示账号、Docker 部署等请以 [根目录 README.md](../../README.md) 为准；本文档侧重 `frontend/web/` 的目录结构、环境变量与前端开发约定。

## 快速开始

### 环境准备

| 工具 | 版本要求 |
|-------|---------|
| Node.js | ≥ 20 |
| pnpm | 依赖用 pnpm 管理（仓库含 `pnpm-lock.yaml`）；未安装时 `corepack enable` 或 `npm i -g pnpm` |

### 安装依赖并启动

```bash
cd frontend/web
pnpm install
pnpm run dev
```

默认开发端口由 `.env.development` 中的 **`VITE_PORT`** 决定（当前为 **5173**）。

> 也可在仓库根目录执行 `pnpm run dev`，由 `scripts/dev.js` 同时拉起本前端与后端。

### 与后端联调

1. 先启动后端，监听地址与 `.env.development` 里的 **`VITE_API_BASE_URL`** 一致（默认 **`http://127.0.0.1:8001`**）。
2. 开发时浏览器请求发往同源路径，由 **Vite `server.proxy`** 把 **`VITE_APP_BASE_API`**（如 `/api/v1`）转发到上述后端。
3. 若页面提示「连接被拒绝」，检查后端是否启动、端口是否一致，或把 `VITE_API_BASE_URL` 改为实际后端地址。

## 架构概览

```
main.js 启动
  └─ initPlugins(app)  ← 插件装配（Store → 主题 → Router → i18n → 指令）
      └─ mount("#app")
          └─ App.vue
              └─ 路由守卫 beforeEach
                  ├─ NProgress 启动、存储/刷新态检查
                  ├─ 登录态校验
                  ├─ 动态路由注册（后端菜单 → addRoute）
                  └─ 权限校验与 404 回落
```

路由采用 **Hash 模式**：静态路由（登录 / 布局 / 异常页）首屏注册，业务路由由守卫依据后端菜单权限延迟 `addRoute`。HTTP 拦截器支持 **Token 静默续期**（401 / Token 过期时自动 refresh，用队列合并并发请求，失败后跳转登录），并统一处理成功/失败提示。

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

> Element Plus 组件与 API 通过 unplugin 按需自动导入，业务代码一般无需手动 `import`。

## 常用脚本

| 命令 | 说明 |
|------|------|
| `pnpm run dev` | 本地开发（读取 `.env.development`） |
| `pnpm run dev:clean` | 清理 Vite 预构建缓存后启动（缓存异常时） |
| `pnpm run build` | 生产构建（读取 `.env.production`），产物在 **`dist/`** |
| `pnpm run preview` | 本地预览构建结果 |

## 目录结构（src）

```
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
├── App.vue
└── main.js       # 入口
```

## 路径别名

在 `vite.config.js` 中配置：

| 别名 | 指向 |
|------|------|
| `@` | `src/` |
| `@views` | `src/views` |
| `@stores` | `src/store` |
| `@utils` | `src/utils` |
| `@styles` | `src/styles` |
| `@plugins` | `src/plugins` |
| `@api` | `src/api` |
| `@imgs` / `@icons` | `src/assets/images` 与 SVG |
| `@qa_imgs` | `src/assets/qa_imgs` |

## 环境变量

只有以 **`VITE_`** 开头的变量会注入前端代码；实际取值以 `.env.development` / `.env.production` 为准，修改后需 **重启** `pnpm run dev`。

| 变量 | 作用 |
|------|------|
| `VITE_PORT` | 开发服务器端口 |
| `VITE_BASE_URL` | 部署基础路径（子目录部署时形如 `/web/`） |
| `VITE_APP_BASE_API` | 接口路径前缀，与 Vite 代理匹配（`/api/v1`） |
| `VITE_API_URL` | 浏览器侧发出的 API 根前缀（开发常为 `/`） |
| `VITE_API_BASE_URL` | **代理目标**：后端 HTTP 根地址 |
| `VITE_API_TIMEOUT` | 请求超时（毫秒） |
| `VITE_APP_TITLE` | 页面标题 |
| `VITE_APP_ENV` | 环境标识（dev / production） |
| `VITE_LOCK_ENCRYPT_KEY` | 锁屏密码本地加密密钥（非安全敏感） |

## 路由与菜单

| 文件 | 职责 |
|------|------|
| `src/router/routes.js` | 静态路由（登录 / 布局 / 异常页 / 重定向） |
| `src/router/guards.js` | 前置守卫：登录校验、动态路由挂载、权限校验、404 回落 |
| `src/router/menu-processor.js` | 后端菜单 → 前端路由记录 |
| `src/router/route-loader.js` | 依据菜单动态 `addRoute` |
| `src/router/refresh.js` | 刷新态与初始化状态管理 |

新增业务页一般需要 **视图 +（可选）路由 + 后端菜单**，三者的路径与 **name** 保持一致。

## 常见问题

| 现象 | 建议 |
|------|------|
| 连&#8288;不&#8288;上&#8288;后&#8288;端 | 后端未启动或 `VITE_API_BASE_URL` 端口错误 |
| env&#8288;不&#8288;生&#8288;效 | 修改 `.env.*` 后必须重启 `pnpm run dev` |
| 热&#8288;更&#8288;新&#8288;异&#8288;常 | 尝试 `pnpm run dev:clean` 清理缓存后重启 |

## 构建与部署

- 输出目录：**`dist/`**
- 子路径部署时配置 **`VITE_BASE_URL`**，并由网关 / Nginx 将前端资源与 `/api/v1` 反代到后端
- 生产部署链路见 [根目录 README.md](../../README.md) 与 `docker/`：由根 `deploy.sh` 在宿主机构建前端产物，Nginx 托管 `frontend/web/dist`
