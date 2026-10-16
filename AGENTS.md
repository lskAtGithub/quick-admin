# AGENTS.md

本文件为在本仓库工作的 AI 编码助手（Claude Code、Codex、Cursor、Copilot、Gemini CLI、Qoder 等）提供**常驻约定**。请严格遵守；如与用户临时明确指令冲突，以用户指令为准。

## 项目概览

Quick Admin：FastAPI + Vue3 的前后端分离管理后台。

- 后端：`backend/`，Python ≥ 3.12，FastAPI + SQLAlchemy(async) + Alembic + Redis，依赖用 **uv** 管理（`uv.lock` 冻结）。
- 前端：`frontend/web/`，Vue3 + Vite + Element Plus + Pinia + Tailwind CSS 4 / SCSS，**使用 JavaScript（不引入 TypeScript）**，包管理用 **pnpm**（`pnpm-lock.yaml`；`npm i -g pnpm` 或 `corepack enable` 安装）。
- 数据库：MySQL / PostgreSQL / SQLite 三方可切，默认种子账号 `admin`/`admin`。

## 通用协作规则

- **少注释**：只在逻辑不自解释处写必要注释，不复述代码含义。
- **不虚构**：文档、README 只描述已核实在的能力；未实现的功能不写，也不要专门罗列"不包含 X"这类负面声明。
- **改动克制**：只做被要求的改动，不顺手重构、不加未被要求的依赖。

## Git 提交

- **分次提交**：每次提交只含一个逻辑变更（一个 API 文件、一处页面修改），便于溯源与回滚。
- **提交信息一句话**概括本次更改，不列举明细。
- 未被明确要求时**不要提交**，更不要 push。

## 前端约定（frontend/web）

- 从参考项目移植时，所有 **`fa` 前缀一律改为 `qa` 前缀**（组件、类名、资源名）；参考项目的 `xxx/index.ts` 结构移植时**扁平为 `xxx.js`**。
- 组件目录：`src/components`、`src/layouts`、各视图 `components/` 由 unplugin 自动注册，模板中直接用 `<QaXxx />`，无需手动 import。
- **枚举归 `src/enums/`、常量归 `src/constants/`**，业务代码不内联魔法值。
- **代码风格以 `frontend/web/.prettierrc.json` 为准**（单引号 / 2 空格 / 行宽 180 / 分号 / 无尾逗号）；ESLint 配置见 `frontend/web/eslint.config.js`，只查代码质量、排版交 Prettier。生成或改动代码须符合该风格，勿引入冲突写法。
- **Element Plus 组件的样式与动效保持默认，不得改造**：不给 `ElButton` 等控件加 hover 位移/阴影/弹性曲线，不覆盖组件库圆角。自定义动效只作用于页面自有装饰元素。
- 按钮组**不要额外加 `gap` 工具类**，依赖组件库自带间距。
- **业务代码禁止手写请求成功/失败提示**，由 `src/utils/request.js` 请求层统一处理（含 401/Token 过期静默续期与登录跳转）。
- **主题化红线**：颜色/圆角/阴影一律走主题变量（`var(--el-*)`、`var(--custom-radius)`、`var(--qa-*)`），**不得硬编码 hex / 固定 px 圆角阴影**，否则暗色模式与设置项会失效。
- 动态路由/权限：菜单由后端下发，守卫在 `src/router/guards.js` 依据路径鉴权；退出必须在 `user.store` 的 `resetAllState` 内跨 store 清理动态路由与标签页。

## 后端约定（backend）

- 路由注册采用 **`DOMAIN_CONTROLLERS` 域分组**（`app/api/v1/routers.py`），新模块按域挂入，不散落注册。
- 鉴权走**全局权限中间件按路径推导**（`PermissionMiddleware`），不逐接口声明依赖；新增**登录后自描述端点**（当前用户信息、验证码、刷新等）时必须在中建**白名单放行**，否则低权限账号会死循环。
- 模块分层：`controller / service / crud / model / schema`；无持久化实体的模块可省略对应分层。
- 树形模块 `_to_dict` 读父级名称时，CRUD 查询需**显式预加载 `parent` 关系**，否则异步取值触发 `MissingGreenlet`。
- 启动入口 `main.py`（`python main.py` / `uv run python main.py`），环境由 OS 变量 `ENVIRONMENT` 选择 `env/.env.{dev,prod}`；首启自动建表并种子管理员。

## Skills（按需能力）

本项目 / 团队技能以 `SKILL.md` 形式存放，按工具自动发现。现有清单：

- **UI 技能 impeccable**：配置在 `.impeccable/`（config.json / design.json）。负责界面设计、改版、审校、打磨等前端 UI 工程化能力；技能本体由开发者按自己的工具本地安装，不随仓库提交，详细用法见官方入门文档 <https://impeccable.cn/tutorials/getting-started/>。
- **前后端技能**：项目根 `skills/` 目录下 `qa-front/SKILL.md`（前端开发规范与新页面流程）与 `qa-back/SKILL.md`（后端开发规范与新模块流程），新增/改造模块页面时按其 Step 流程执行。
- 新增技能：目录名小写连字符，`SKILL.md` 的 `description` 用第三人称、同时写清「做什么 + 何时触发」。

## 参考文档

各子工程细节见 `README.md`、`backend/README.md`、`frontend/web/README.md`（均含 `.en.md` 英文版）。
