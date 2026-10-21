# Quick Admin - Backend

简体中文 | [English](./README.en.md)

FastAPI 异步后端，为 Vue3 管理端提供认证、鉴权与系统管理接口。项目总览、一键启动与部署见 [根目录 README.md](../README.md)。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| FastAPI / Uvicorn | ≥ 0.143 / ≥ 0.54 | Web 框架 / ASGI 服务器 |
| SQLAlchemy / Alembic | ≥ 2.1 / ≥ 1.20 | 异步 ORM / 结构迁移 |
| Pydantic | v2 | 出入参校验与配置管理 |
| PyJWT / bcrypt | ≥ 2.15 / ≥ 5.0 | Token 签发 / 密码哈希 |
| redis-py | ≥ 8.1 | 令牌、会话与验证码缓存 |
| aiomysql / aiosqlite | ≥ 0.3.2 / ≥ 0.22.1 | MySQL / SQLite 异步驱动 |
| Loguru | ≥ 0.7 | 日志 |
| Python | ≥ 3.12 | 运行环境，依赖用 [uv](https://github.com/astral-sh/uv) 管理（`uv.lock` 冻结） |

## 目录结构

```txt
backend/
├── app/
│   ├── api/v1/routers.py   # 路由装配：DOMAIN_CONTROLLERS 按域分组
│   ├── modules/            # 业务模块：system 下 auth/user/role/menu/dept/dict/param，common 下 file
│   ├── core/               # database/security/middlewares/dependencies/exceptions/logger/redis_crud/base_model/base_schema
│   ├── config/             # setting.py 配置项、path_conf.py 路径
│   ├── common/             # 常量、枚举、响应封装
│   ├── scripts/            # 启动种子（管理员 + 菜单/字典/部门）
│   ├── alembic/            # 迁移文件
│   └── utils/              # 密码与上传工具
├── env/                    # .env.dev / .env.prod，.env.example 为无密钥模板
├── main.py                 # 启动入口
└── pyproject.toml / uv.lock
```

每个业务模块按 `controller / service / crud / model / schema` 分层；无持久化实体的模块可省略，如 `auth` 只有 controller/service/schema，`common/file` 只有 controller/service，`system/param` 仅提供 controller。

## 启动

```bash
# 1. 仓库根目录拉起 Redis（启动强依赖，也可自启任意监听 6379 的 Redis）
docker compose -f docker/docker-compose.yaml up -d redis

# 2. backend 目录安装依赖并启动
uv sync
uv run python main.py
```

**不需要 env 文件也能跑**：缺省沿用 `app/config/setting.py` 的内置默认（SQLite + 本机 Redis `6379` 无密码）。要改配置就 `cp env/.env.example env/.env.dev` 再编辑；`main.py` 按操作系统变量 `ENVIRONMENT` 选文件（缺省 `dev`，`prod` 读 `env/.env.prod`）。接口文档 http://127.0.0.1:8001/docs ，仓库根目录 `npm run dev` 会同时拉起前后端。

### 切换到 MySQL

```bash
cp backend/env/.env.example backend/env/.env.dev           # 1 把 DATABASE_TYPE 改成 mysql，其余不动
docker compose -f docker/docker-compose.yaml up -d mysql   # 2 自动建库，等 STATUS 变 (healthy)，首次 10~30s
cd backend && uv run python main.py                        # 3
```

模板值已与 compose 对齐（端口 `33066`、账号 `quickadmin`、库名 `quickadmin`）。日志出现`数据库表初始化完成`与`已初始化默认超级管理员账号`即成功。**切库等于全新数据**，SQLite 里的数据不会搬迁。

### 迁移命令（改了 ORM 模型时）

```bash
uv run alembic revision --autogenerate -m "change summary"   # 依据模型变更生成
uv run alembic upgrade head                                  # 应用
uv run alembic downgrade -1                                  # 回滚一次
```

首次启动不必执行，启动时 `create_all` 会兜底建表；正式环境建议以 `alembic upgrade head` 管理表结构演进。

## 后端约定

- **统一响应**：接口经 `common/response.py` 的 `SuccessResponse` 返回 `{ code, msg, data }`，异常由 `core/exceptions.py` 统一处理。
- **鉴权**：JWT Bearer Token（`core/security.py` 签发解析，有效期 `ACCESS_TOKEN_EXPIRE_SECONDS`）；登录后由全局 `PermissionMiddleware` 按请求路径推导权限，登录、验证码、当前用户信息等自描述端点在中间件放行。
- **模型基类**：ORM 混入 `ModelMixin`，统一提供 `id / is_deleted / created_time / updated_time`，时间取 `Asia/Shanghai`。
- **密码**：bcrypt 加盐哈希（`utils/password_util.py`），库中不存明文。
- **启动种子**：`scripts/init_data.py` 在 lifespan 内幂等写入默认管理员、系统菜单与按钮权限、性别字典、根部门；目标表只要存在任意行（含软删）即跳过。
- **方言**：`DATABASE_TYPE` 切换 `sqlite` / `mysql` / `postgres`，`ASYNC_DB_URI` 据此拼接连接串，业务代码不感知方言。
- **上传**：文件落 `static/upload`，经 `STATIC_URL`（默认 `/static`）挂载对外访问。

## 常见问题

| 报错 | 处理 |
|------|------|
| `redis.exceptions.ConnectionError ... 6379` | Redis 没起，重跑启动第 1 步；`down` 会删容器，重启机器也不会自动回来 |
| `AuthenticationError: Authentication required.` | 容器侧 `REDIS_PASSWORD` 与 `env/.env.dev` 不一致；本地开发两边都留空 |
| `(2003, "Can't connect to MySQL server")` | mysql 容器还没 healthy，或 `DATABASE_PORT` 与 compose 的 `MYSQL_PORT`（默认 33066）不同值 |
| 容器反复重启，日志 `--initialize specified but the data directory has files in it` | `docker/mysql/data` 里不能有杂项文件，移出后重新 `up -d mysql` |
| `RuntimeError` 提到 cryptography | 重跑 `uv sync`（MySQL 8 认证依赖它，已在锁文件里） |
| `DATABASE_TYPE=postgres` 报找不到 asyncpg | 仓库未安装 PostgreSQL 驱动，需要时先 `uv add asyncpg` |

## 链接

[根目录 README.md](../README.md) ｜ [FastAPI](https://fastapi.tiangolo.com/) ｜ [SQLAlchemy](https://docs.sqlalchemy.org/) ｜ [Alembic](https://alembic.sqlalchemy.org/) ｜ [Pydantic](https://docs.pydantic.dev/)
