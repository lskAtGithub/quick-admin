# Quick Admin - Backend

简体中文 | [English](./README.en.md)

基于 **FastAPI** 构建的异步后端服务，为前端 Vue3 管理系统提供认证、鉴权与系统管理相关的 API 支持。

> **与仓库根文档的关系**：项目总览、一键前后端启动、演示账号、Docker 部署与默认端口等请以 [根目录 README.md](../README.md) 为准；本文档侧重 `backend/` 的目录结构、启动与迁移命令、以及后端开发约定。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| FastAPI | ≥ 0.143 | 现代异步 Web 框架 |
| SQLAlchemy | ≥ 2.1 | 异步 ORM（asyncio） |
| Alembic | ≥ 1.20 | 数据库迁移工具 |
| Pydantic | v2（pydantic-settings ≥ 2.15） | 数据校验与序列化、配置管理 |
| PyJWT | ≥ 2.15 | JWT 签发与解析 |
| bcrypt | ≥ 5.0 | 密码哈希 |
| Redis | redis-py ≥ 8.1 | 验证码校验态、Token 缓存 |
| Loguru | ≥ 0.7 | 日志输出 |
| Uvicorn | ≥ 0.54 | ASGI 服务器 |
| 数据库驱动 | aiomysql / aiosqlite | MySQL / PostgreSQL / SQLite 三方言 |
| Python | ≥ 3.12 | 运行环境 |

## 项目结构

```txt
backend/
├── app/                     # 项目核心代码
│   ├── alembic/             # 数据库迁移（versions 含初始化迁移）
│   ├── api/v1/routers.py    # 路由装配层：按域分组聚合各模块路由（DOMAIN_CONTROLLERS）
│   ├── modules/             # 业务模块层（按业务域竖切）
│   │   ├── system/          #   auth / user / role / menu / dept / dict / param
│   │   └── common/          #   file（上传等公共能力）
│   ├── common/              # 公共组件（常量 constant、枚举 enums、响应封装 response）
│   ├── config/              # 配置（setting.py 配置项、path_conf.py 路径）
│   ├── core/                # 核心模块（database / security / middlewares / dependencies /
│   │                        #   exceptions / logger / redis_crud / base_model / base_schema）
│   ├── scripts/             # 初始化脚本（管理员 + 菜单/字典/部门种子）
│   └── utils/               # 工具类（password_util / upload_util）
├── env/                     # 环境配置（.env.dev / .env.prod；.env.example 为无密钥模板）
├── logs/                    # 日志输出目录
├── static/upload/           # 上传文件存储目录
├── main.py                  # 启动入口（uvicorn factory 启动 app:create_app）
├── alembic.ini              # Alembic 迁移配置
├── pyproject.toml           # 项目与依赖配置（uv 管理）
└── uv.lock                  # 依赖锁文件
```

### 模块分层

每个业务模块采用统一的分层结构（以 `system` 下的实体模块为例）：

```txt
modules/<域>/<模块>/
├── controller.py    # 控制器 —— HTTP 路由与请求处理
├── service.py       # 服务层 —— 业务逻辑
├── crud.py          # 数据层 —— 数据库读写
├── model.py         # ORM 模型 —— 数据库表定义
└── schema.py        # Pydantic 模型 —— 出入参与数据校验
```

> 无持久化实体的模块会省略对应分层：如 `auth`（登录/鉴权）只有 controller/service/schema，`common/file` 只有 controller/service，`system/param` 仅提供 controller。

## 快速开始

### 环境要求

- **Python**：3.12+
- **数据库**：MySQL 8.0+ / PostgreSQL / SQLite（**默认 SQLite**，切库见下文「切换到 MySQL / PostgreSQL」）
- **Redis**：**启动强依赖**，lifespan 阶段 ping 不通目标地址会让后端直接 `Application startup failed` 退出；地址取 `env/.env.dev` 的 `REDIS_HOST` / `REDIS_PORT`（无 env 文件时为本机 `6379` 无密码）。本地推荐用 Docker 拉起：确保 Docker Desktop 已运行，在**仓库根目录（`quick-admin/`，不是 `backend/`）**执行 `docker compose -f docker/docker-compose.yaml up -d redis`；该命令要求 `docker/.env` 存在（首次先 `cp docker/.env.example docker/.env`）；注意 `docker compose down` 会删除容器，之后必须重新 `up -d redis`（重启机器或 Docker Desktop 也不会自动回来）；也可自行启动任意监听 6379 的 Redis
  - **密码必须两边一致**：容器侧的 `--requirepass` 取自 `docker/.env` 的 `REDIS_PASSWORD`，后端侧取自 `env/.env.dev` 的 `REDIS_PASSWORD`。本地开发两边都留空（模板默认即此）；若给容器设了密码而后端没同步，报错为 `redis.exceptions.AuthenticationError: Authentication required.`（注意不是 `ConnectionError`，说明已连上）

### 第一次在本机跑起来

1. （可选）从 `env/.env.example` 复制为 `env/.env.dev` 并按需修改：数据库、Redis、`SECRET_KEY`、`SERVER_PORT` 等（选 MySQL/PG 的完整步骤见下文「切换到 MySQL / PostgreSQL」）。**两份 env 文件都不存在时，直接沿用 `app/config/setting.py` 的内置默认：SQLite + 本机 Redis 6379 无密码。**
2. 在 **`backend/` 目录下**安装依赖：推荐 **`uv sync`**（依赖以 `uv.lock` 冻结）。
3. **启动**：`uv run python main.py`（或 `python main.py`）。**首次启动会自动建表，并幂等初始化默认超级管理员 `admin` / `admin`、系统管理菜单与按钮权限位、性别字典和根部门**，一般无需先执行迁移。接口文档：`http://127.0.0.1:8001/docs`（端口见 `SERVER_PORT`）。

> 环境切换：`main.py` 通过操作系统环境变量 `ENVIRONMENT` 决定加载哪份配置，缺省为 `dev`；设为 `prod` 则读取 `env/.env.prod`（`deploy.sh` 会检查该文件是否存在）。
> 根目录执行 `npm run dev` 会通过 `scripts/dev.js` 同时拉起本后端与前端，无需单独启动。

### 切换到 MySQL / PostgreSQL

**默认 SQLite，不建库不配置即可跑**。切到 MySQL 只需改 `backend/env/.env.dev` 的数据库段，按下面四步操作：

**1）准备 env 文件**（已存在则跳过），在仓库根目录执行：

```bash
cp backend/env/.env.example backend/env/.env.dev
```

**2）准备数据库**，二选一：

*A. 用 compose 自带的 MySQL*（自动建库，不用手写 SQL）

```bash
# 先确保 docker/.env 存在（首次：cp docker/.env.example docker/.env），命令在仓库根目录执行
# MYSQL_PORT 模板默认 33066（避开本机已装的 MySQL；容器内端口仍是 3306）
docker compose -f docker/docker-compose.yaml up -d mysql
docker ps --filter name=quickadmin-mysql   # 等它变 healthy，首次初始化需 10~30s
```

*B. 用本机已有的 MySQL*：先建空库，字符集必须是 utf8mb4：

```sql
CREATE DATABASE IF NOT EXISTS quickadmin DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**3）改 `backend/env/.env.dev` 的数据库段**：

```properties
DATABASE_TYPE=mysql
DATABASE_HOST=127.0.0.1
DATABASE_PORT=33066             # 路线 A 填 docker/.env 的 MYSQL_PORT（模板默认 33066）；路线 B 填本机 MySQL 端口
DATABASE_USER=quickadmin        # 路线 A 填 docker/.env 的 MYSQL_USER
DATABASE_PASSWORD=change_me_app_password # 路线 A 填 docker/.env 的 MYSQL_PASSWORD
DATABASE_NAME=quickadmin        # 路线 A 填 docker/.env 的 MYSQL_DATABASE；不要带 .db 后缀
```

**4）重启后端**：`cd backend && uv run python main.py`，日志依次出现`数据库表初始化完成`与`已初始化默认超级管理员账号`即成功。**切库等于全新数据**，SQLite 里的数据不会自动搬迁。

切回 SQLite：把 `DATABASE_TYPE` 改回 `sqlite`，或直接删掉 `env/.env.dev`。

切 PostgreSQL：同上四步，`DATABASE_TYPE=postgres`、`DATABASE_PORT` 改填 5432（模板默认为 33066），库需自己建。

常见报错对照：

| 现象 | 原因与处理 |
|------|-----------|
| `error while interpolating services.mysql.environment.XXX: required variable XXX is missing a value` | `docker/.env` 不存在（漏了 `cp docker/.env.example docker/.env`），或对应变量被留空——compose 的必填校验把**空值等同于缺失**，报错点名的变量不必然是真凶。哪怕只用本机 MySQL、不起容器，该文件也需存在且各项非空 |
| `RuntimeError` 指向 cryptography / sha2_rsa_encrypt | MySQL 8 的 `caching_sha2_password` 认证需要 `cryptography`，它已在 `pyproject.toml` / `uv.lock` 里，重跑 `uv sync` 即带上 |
| `(2003, "Can't connect to MySQL server")` | 主机或端口写错：确认容器已 healthy，且 `DATABASE_PORT` 与 `docker/.env` 的 `MYSQL_PORT` 一致 |
| 容器反复 Restarting，日志有 `--initialize specified but the data directory has files in it` | `docker/mysql/data` 被挂成 MySQL 数据目录，**里面不能有任何杂项文件**（常见于把备份 sql 倒进去）；把这些文件移出该目录后重新 `up -d mysql` |

### 数据库迁移命令（模型变更时使用）

日常**首次启动不必手动执行**（启动时 `create_all` 会兜底初始化）；当你**修改了 ORM 模型**并需用 Alembic 管理结构变更时，使用标准 Alembic CLI：

```bash
# 依据模型变更生成迁移文件
uv run alembic revision --autogenerate -m "change summary"

# 应用迁移到数据库
uv run alembic upgrade head

# 回滚一次迁移
uv run alembic downgrade -1
```

> 正式环境建议以 Alembic 管理表结构演进（`uv run alembic upgrade head`），启动时的 `create_all` 仅用于首次初始化的兜底。

## 后端约定

- **统一响应**：所有接口经 `app/common/response.py` 的 `SuccessResponse` 封装，返回 `{ code, msg, data }` 结构；异常统一由 `app/core/exceptions.py` 处理。
- **认证方式**：基于 JWT 的 Bearer Token（`Authorization: Bearer <token>`），`app/core/security.py` 负责签发与解析；有效期由 `ACCESS_TOKEN_EXPIRE_SECONDS` 控制，退出登录时清理 Redis 中的 Token。
- **鉴权模型**：登录后由全局 `PermissionMiddleware` 按请求路径推导并校验权限，登录、验证码、当前用户信息等自描述端点在中间件中放行。
- **软删除与时间戳**：ORM 模型混入 `ModelMixin`，统一提供 `id` / `is_deleted` / `created_time` / `updated_time`，时间默认取 `Asia/Shanghai` 时区。
- **密码存储**：使用 bcrypt 加盐哈希（`app/utils/password_util.py`），数据库中不保存明文。
- **启动种子**：`app/scripts/init_data.py` 在应用 lifespan 内幂等写入默认管理员、系统管理菜单与按钮权限、性别字典和根部门；目标表只要存在任意行（含软删）就跳过，不覆盖用户自行维护的数据。
- **多数据库方言**：`DATABASE_TYPE` 切换 `sqlite` / `mysql` / `postgres`，`ASYNC_DB_URI` 据此自动拼接对应异步连接串，业务代码无需感知方言差异。
- **静态文件**：上传文件落 `static/upload`，经 `STATIC_URL`（默认 `/static`）挂载对外访问。

## 相关链接

- **项目总览**：[根目录 README.md](../README.md)
- **FastAPI 文档**：[https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
- **SQLAlchemy 文档**：[https://docs.sqlalchemy.org/](https://docs.sqlalchemy.org/)
- **Alembic 文档**：[https://alembic.sqlalchemy.org/](https://alembic.sqlalchemy.org/)
- **Pydantic 文档**：[https://docs.pydantic.dev/](https://docs.pydantic.dev/)
