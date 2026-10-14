# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vue 3 + Vite + Element Plus + Tailwind CSS + Pinia + Vue Router。纯 JavaScript（不引入 TypeScript）。后端 Python FastAPI（SQLite/MySQL）。前端自动导入插件（unplugin-auto-import、unplugin-vue-components、unplugin-icons）。

## Users

企业内部运营、运维和管理人员。在日常办公场景中登录后台，完成用户管理、角色权限分配、菜单配置、部门维护、字典管理、系统设置等管理任务。使用者技术水平参差不齐，需要界面直觉、操作高效。

## Product Purpose

quick-admin 是一个可复用的后台管理系统模板，目标是跨项目复用。它参考 FastApiAdmin 的整体架构自主重写实现，重点在于提供一套开箱即用的管理后台外壳：动态路由、权限控制、主题定制、布局切换、标签页管理、国际化等全局能力，以及用户/角色/菜单/部门/字典等标准业务模块。

## Positioning

与直接套用 FastApiAdmin 或其他后台模板不同，quick-admin 是自主实现的可复用模板。它坚持纯 JavaScript 技术栈（不依赖 TypeScript），采用 `qa` 前缀的自有命名域，内置主题颜色调整和布局切换功能，所有 UI 设计必须兼容这两项用户可配置能力。

## Operating Context

- 企业内部网络环境，浏览器访问（Chrome/Edge 为主）
- 管理员登录后通过侧边栏导航进入各功能模块
- 支持多种布局模式切换（侧边栏、顶部菜单等）
- 支持主题颜色自定义和暗色模式
- 前端开发命令：`pnpm dev`（位于 `frontend/web/`）

## Capabilities and Constraints

- 全局能力：动态路由生成、基于角色的权限中间件、标签页管理、屏幕锁定、面包屑导航、国际化（vue-i18n）
- 业务模块：用户管理、角色管理、菜单管理、部门管理、字典管理
- 主题系统：内置主题颜色修改和暗色/亮色切换，UI 设计必须兼容主题变量
- 布局系统：支持布局模式设置，UI 调整必须兼容布局切换功能
- 技术约束：前端纯 JavaScript，不引入 TypeScript；组件和样式使用 `qa` 前缀
- 参考项目：FastApiAdmin（位于 `FastApiAdmin/` 目录）

## Brand Commitments

- 命名域前缀：所有自有组件、样式类、图标统一使用 `qa` 前缀（不使用 `fa`）
- 语言：前端坚持 JavaScript，不引入 TypeScript
- 参考架构：FastApiAdmin 的整体架构为蓝本

## Evidence on Hand

- 已有完整的前后端代码实现（`frontend/web/`、`backend/`）
- 已有登录、首页、系统管理（用户/角色/菜单/部门/字典）、异常页面等视图
- 已有布局系统（侧边栏、头部、面包屑、标签页、设置面板等）
- 无外部客户案例或公开部署

## Product Principles

1. **可复用优先**：模板设计面向多项目复用，避免硬编码业务逻辑
2. **主题与布局兼容**：所有 UI 变更必须兼容用户可自定义的主题颜色和布局模式
3. **纯 JavaScript 技术栈**：不引入 TypeScript，降低使用门槛
4. **高效操作**：面向管理场景，界面直觉、操作路径短、信息密度合理
5. **自主实现**：参考 FastApiAdmin 架构但自主编码，确保对每一层的理解
