<div align="center">
     <p align="center">
          <img src="frontend/web/public/favicon.svg" width="120" height="120" alt="logo" />
     </p>
     <h1>Quick Admin</h1>
     <h3>🚀 基于 FastAPI + Vue3 的全栈中后台脚手架</h3>
     <p>追求干净的代码与舒适的主题体验，一条命令即可跑通前后端，Docker 一键交付</p>
     <p align="center">
          <img src="https://img.shields.io/badge/Python-≥3.12-blue">
          <img src="https://img.shields.io/badge/NodeJS-≥20.0-blue">
          <img src="https://img.shields.io/badge/FastAPI-≥0.143-green">
          <img src="https://img.shields.io/badge/Vue-3.5-brightgreen">
          <img src="https://img.shields.io/badge/ElementPlus-2.14-blue">
          <img src="https://img.shields.io/badge/DB-MySQL%20|%20PostgreSQL%20|%20SQLite-orange">
     </p>

简体中文 | [English](./README.en.md)

</div>

## 🖥️ 界面一览

- **工作台**：欢迎语 + 数据统计卡片 + 快捷入口，随主题色联动的入场动画
- **登录页**：账号密码 + 滑块验证码，集成注册 / 忘记密码面板与第三方登录入口
- **系统管理**：用户 / 角色 / 菜单 / 部门 / 字典 全量 CRUD，角色分配菜单权限树
- **个人中心**：资料编辑、头像上传、性别字典取值
- **外观设置面板**：亮/暗/自动主题、自由主题色、布局与圆角、色弱/灰度、多语言

## 💡 Quick Admin 是什么

一套**前后端分离的管理后台基础平台**，聚焦中后台最核心的能力：认证鉴权、动态菜单、RBAC 权限、系统管理 CRUD、丰富的主题定制与工程化部署。代码追求干净可读，便于在此基础上二次开发业务。

| 能力 | 说明 |
|------|------|
| ⚡ **FastAPI 异步**后端 | SQLAlchemy 2.x 异步 ORM + Pydantic v2 校验 |
| 🔐 **JWT 认证** | 登录签发 + Token 刷新 + Redis 退出注销 |
| 🧭 **动态菜单 / 路由** | 菜单由后端下发，前端按权限装配路由并守卫校验 |
| 🎨 **主题体系** | 亮/暗/自动、自由主题色、侧边栏配色、圆角、布局模式 |
| 🌁 **滑块 + 图形验证码** | 登录前置人机校验，Redis 存储校验态 |
| 🌐 **国际化** | 内置 中文 / English 双语 |
| 🐳 **Docker 一键部署** | MySQL + Redis + 后端 + Nginx（可选 SSL） |
| 🧰 **Alembic 迁移** | 表结构版本化，附带初始化迁移 |

## 🚀 快速开始

### 环境要求

| 需求 | 版本 |
|------|------|
| Python | ≥ 3.12（推荐用 [uv](https://github.com/astral-sh/uv) 管理依赖） |
| Node.js | ≥ 20，包管理使用 pnpm |
| 数据库 | MySQL 8.0+ / PostgreSQL / SQLite（默认 SQLite，开发环境配 MySQL） |
| 缓存 | Redis 7.x |

### 开发模式

前端开发端口 `5173`，后端端口 `8001`。后端**不要求存在 env 文件**：`backend/env/.env.dev` 缺失时回落到 `setting.py` 内置默认（SQLite + 本机 Redis `6379` 无密码）；要换数据库或密钥时执行 `cp backend/env/.env.example backend/env/.env.dev` 再按需修改。

```bash
# 1. 启动 Redis（后端强依赖，未就绪会连不上）
docker compose -f docker/docker-compose.yaml up -d redis

# 2. 安装后端依赖（backend 目录，推荐 uv）
cd backend && uv sync && cd ..

# 3. 安装前端依赖（frontend/web 目录）
cd frontend/web && pnpm install && cd ../..

# 4. 一条命令同时启动前端 + 后端（npm / pnpm 皆可，根目录无依赖）
npm run dev

# ✅ 浏览器打开 http://127.0.0.1:5173，用 admin / admin 登录
```

也可分别启动：

```bash
# 后端（backend 目录）
uv run python main.py          # 或 python main.py

# 前端（frontend/web 目录）
pnpm run dev
```

> 首次启动后端会自动建表，并幂等初始化：超级管理员 `admin` / `admin`（请尽快改密）、系统管理菜单与按钮权限位、性别字典、根部门。表内已有数据时不会重复写入，也不覆盖你自行维护的内容。
> 接口文档：启动后访问 http://127.0.0.1:8001/docs 。

### 🐳 Docker 一键部署

```bash
cp docker/.env.example docker/.env    # 填写 MySQL / Redis 密码与 SECRET_KEY
./deploy.sh                           # 宿主机构建前端 → 构建镜像 → 启动全栈
```

`docker-compose.yaml` 包含 **MySQL、Redis、Backend、Nginx** 四个服务；Nginx 托管前端产物并反代 `/api/v1` 到后端，SSL（443）配置已内置但默认注释，按需提供证书后开启。

### 🌍 多语言文件生成脚本

文案统一维护在 `frontend/web/src/i18n/langs/zh.json`，其他语种无需手写——在仓库根目录执行：

```bash
pnpm run i18n    # 选择目标语言 → 与 zh.json 比对 → 调百度翻译 API 自动补齐缺失词条 → 写入 langs/<code>.json
```

首次使用需先在 [百度翻译开放平台 · 管理控制台](https://fanyi-api.baidu.com/manage/developer) 注册并创建「百度翻译API」应用，获取 **APP_ID** 和 **密钥 SECRET** 填入 `frontend/web/scripts/create-i18n/config.js` 的 `BAIDU_FANYI`——**标准套餐免费额度即可覆盖本项目全部词条**。

- **增量补缺**：只翻译 zh.json 里有而目标语言缺失的 key，已有译文不覆盖；目标文件多余的 key 仅控制台提示、不删除。
- 内置 17 个语种（英/日/韩/法/德/西/俄/葡/意/荷/波/越/泰/印尼/马来/阿/印地），标 ※ 的需在百度控制台开通对应翻译权限，未开通时脚本会明确报错中止。
- 占位符模板句（如 `请输入{name}`）自动保护，个别语种机翻语序建议人工润色；翻译失败不落脏数据，重跑脚本自动补翻。

## 📦 工程结构

```
quick-admin/                 # Monorepo 全栈工程
├─ backend/                  # FastAPI 后端（SQLAlchemy async + Alembic + Redis）
│   ├─ app/api/v1/           # 路由按域分组注册（DOMAIN_CONTROLLERS）
│   ├─ app/modules/          # 业务模块：system（auth/user/role/menu/dept/dict/param）、common（file）
│   ├─ app/core/             # 数据库、安全、中间件、异常、日志、Redis、依赖注入
│   ├─ app/config/           # 配置（setting.py）与环境变量（env/.env.*，模板 env/.env.example）
│   ├─ app/scripts/          # 启动初始化（管理员 + 菜单/字典/部门种子）
│   └─ alembic/              # 数据库迁移
├─ frontend/web/             # Vue3 Web 前端（Element Plus + Vite + Pinia + Tailwind）
│   └─ src/                  # views / router / store / layouts / components / i18n ...
├─ docker/                   # Docker Compose 一键部署（MySQL/Redis/Backend/Nginx）
├─ skills/                   # 前后端开发规范技能（qa-front / qa-back，SKILL.md）
├─ scripts/dev.js            # 根级开发启动器（同时拉起前后端）
└─ deploy.sh                 # 一键部署脚本
```

## 🤖 AI 编码助手技能（Skills）

项目内置面向 AI 编码代理的技能：

| 技能 | 位置 | 作用 |
|------|------|------|
| 🎨 **impeccable**（UI） | 配置在 `.impeccable/`（config.json / design.json） | 前端界面设计/改版/审校/打磨等 UI 工程化能力 |
| 🖥️ **qa-front** | `skills/qa-front/SKILL.md` | 前端开发规范与新增管理模块页面的完整流程（API 模块、列表页三件套、路由菜单接入、i18n 等） |
| ⚙️ **qa-back** | `skills/qa-back/SKILL.md` | 后端开发规范与新增业务模块的完整流程（Model/Schema/CRUD/Service/Controller 分层、域注册、权限 SQL、校验） |

> impeccable UI 技能的详细用法见其官方入门文档：<https://impeccable.cn/tutorials/getting-started/>

## 📌 内置功能

### 后端接口（`/api/v1`）

| 模块 | 已实现能力 |
|------|-----------|
| 🔑 认证 | 图形验证码、滑块验证码校验、登录、注册、Token 刷新、退出登录 |
| 👤 用户 | 列表 / 详情 / 新增 / 修改 / 删除、当前用户信息查询与更新、修改密码 |
| 🎭 角色 | 分页列表 / 详情 / 新增 / 修改 / 删除、分配菜单权限 |
| 📋 菜单 | 菜单树 / 分页列表 / 详情 / 新增 / 修改 / 删除，携带权限标识 |
| 🏢 部门 | 部门树 / 分页列表 / 详情 / 新增 / 修改 / 删除 |
| 📖 字典 | 字典类型与字典数据的分组 CRUD、按类型查询字典项 |
| ⚙️ 参数 | 初始化配置参数读取 |
| 📁 文件 | 本地上传（图片 / 文档等白名单后缀，单文件 ≤ 10MB），静态目录访问 |

### 前端页面与特性

| 分类 | 能力 |
|------|------|
| 🧭&nbsp;路&#8288;由&#8288;权&#8288;限 | 后端下发动态菜单、按权限装配路由、路由守卫鉴权、按钮/菜单权限标识 |
| 📊&nbsp;工&#8288;作&#8288;台 | 欢迎区、统计卡片、快捷入口、主题联动的入场动画 |
| 🔐&nbsp;登&#8288;录 | 账号密码 + 滑块验证码、注册面板、忘记密码面板、第三方登录入口 |
| ⚙️&nbsp;系&#8288;统&#8288;管&#8288;理 | 用户 / 角色 / 菜单 / 部门 / 字典 管理页（含新增 / 编辑子页与表单组件） |
| 👤&nbsp;个&#8288;人&#8288;中&#8288;心 | 资料编辑、头像上传、性别字典取值 |
| 🎛️&nbsp;外&#8288;观&#8288;设&#8288;置 | 亮/暗/自动主题、自由主题色、侧边栏配色、布局模式、容器宽度、圆角、色弱模式、灰度模式、页面切换动画、进度条 |
| 🗂️&nbsp;外&#8288;壳 | 多标签页（worktab）、面包屑、侧边/顶栏菜单、屏幕锁定、水印、全局组件 |
| 🌐&nbsp;国&#8288;际&#8288;化 | 中文 / English |
| ⚠️&nbsp;异&#8288;常&#8288;页 | 401 / 403 / 404 / 500 |

## 🔧 配置说明

配置集中在 `backend/app/config/setting.py`，运行环境变量位于 `backend/env/.env.{dev,prod}`（`ENVIRONMENT` 决定加载哪一份，两份都不存在时使用内置默认值）。无密钥模板见 `backend/env/.env.example`。关键项：

```python
DATABASE_TYPE = "sqlite"        # sqlite | mysql | postgres 三选一
ACCESS_TOKEN_EXPIRE_SECONDS = 43200   # JWT 有效期（默认 12h）
CAPTCHA_ENABLE = False          # 登录验证码开关
UPLOAD_FILE_PATH = "static/upload"    # 上传文件目录
ALLOWED_EXTENSIONS = [...]      # 允许上传的文件后缀
MAX_FILE_SIZE = 10 * 1024 * 1024       # 单文件上限
```

> 数据库类型通过 `DATABASE_TYPE` 切换，无需改代码；`ASYNC_DB_URI` 会据此自动拼接对应方言的连接串。
> 所有密钥（`SECRET_KEY`、数据库 / Redis 密码）请放在 `backend/env/.env.*` 或 `docker/.env` 中，切勿提交到仓库。

## 🚦 部署与安全提示

- **改默认密码**：初始 `admin/admin` 仅供首次登录，上线后立即修改。
- **换 JWT 密钥**：生产环境务必将 `SECRET_KEY` 改为强随机值（`openssl rand -hex 32`）。
- **数据库迁移**：正式环境建议用 Alembic 管理表结构（`uv run alembic upgrade head`），启动时的 `create_all` 仅作首次兜底初始化。
- **生产配置文件**：`deploy.sh` 会检查 `backend/env/.env.prod` 是否存在，Docker 部署前需自行创建该文件（可从 `backend/env/.env.example` 复制，并将 `DATABASE_TYPE` 指向 compose 内的 MySQL）。
- **上传持久化**：Docker 部署已挂载 `backend/static/upload`，避免重建容器丢失用户文件。
- **HTTPS**：如需 SSL，向 `docker/nginx/ssl` 放入证书并取消 `nginx.conf` 中 443 段注释。

## 🙏 技术栈鸣谢

- 后端：[FastAPI](https://fastapi.tiangolo.com/) · [SQLAlchemy](https://www.sqlalchemy.org/) · [Pydantic](https://docs.pydantic.dev/) · [Alembic](https://alembic.sqlalchemy.org/) · [PyJWT](https://pyjwt.readthedocs.io/) · [Redis](https://redis.io/) · [loguru](https://github.com/Delgan/loguru) · [uv](https://github.com/astral-sh/uv)
- 前端：[Vue3](https://cn.vuejs.org/) · [Vite](https://vitejs.dev/) · [Element Plus](https://element-plus.org/) · [Pinia](https://pinia.vuejs.org/) · [vue-router](https://router.vuejs.org/) · [vue-i18n](https://vue-i18n.intlify.dev/) · [Tailwind CSS](https://tailwindcss.com/) · [Unplugin](https://github.com/unjs/unplugin)

## 🤝 参与贡献

欢迎提交 Issue / PR，一起把基础平台打磨得更好。

## 🙏 支持

> 如果这个项目对你有帮助，欢迎点一个 ⭐️ Star 支持！
