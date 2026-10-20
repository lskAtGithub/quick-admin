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
- **数据库**：MySQL 8.0+ / PostgreSQL / SQLite（默认 SQLite，连接配置见 `env/.env.dev`）
- **Redis**：必选依赖，与 `env/.env.dev` 中配置一致（本地可直接 `docker compose -f ../docker/docker-compose.yaml up -d redis`）

### 第一次在本机跑起来

1. （可选）从 `env/.env.example` 复制为 `env/.env.dev` 并按需修改：数据库、Redis、`SECRET_KEY`、`SERVER_PORT` 等（数据库类型由 `DATABASE_TYPE` 切换，选 MySQL/PG 需先在 DB 中建好空库）。**两份 env 文件都不存在时，直接沿用 `app/config/setting.py` 的内置默认：SQLite + 本机 Redis 6379 无密码。**
2. 在 **`backend/` 目录下**安装依赖：推荐 **`uv sync`**（依赖以 `uv.lock` 冻结）。
3. **启动**：`uv run python main.py`（或 `python main.py`）。**首次启动会自动建表，并幂等初始化默认超级管理员 `admin` / `admin`、系统管理菜单与按钮权限位、性别字典和根部门**，一般无需先执行迁移。接口文档：`http://127.0.0.1:8001/docs`（端口见 `SERVER_PORT`）。

> 环境切换：`main.py` 通过操作系统环境变量 `ENVIRONMENT` 决定加载哪份配置，缺省为 `dev`；设为 `prod` 则读取 `env/.env.prod`（`deploy.sh` 会检查该文件是否存在）。
> 根目录执行 `npm run dev` 会通过 `scripts/dev.js` 同时拉起本后端与前端，无需单独启动。

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
