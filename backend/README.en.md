# Quick Admin - Backend

[简体中文](./README.md) | English

An async backend built on FastAPI, serving authentication, authorization and system-management APIs for the Vue 3 admin frontend. For the overall picture, one-command startup and deployment, see [the root README.md](../README.en.md).

## Tech Stack

| Technology | Version | Purpose |
|------|------|------|
| FastAPI / Uvicorn | ≥ 0.143 / ≥ 0.54 | Web framework / ASGI server |
| SQLAlchemy / Alembic | ≥ 2.1 / ≥ 1.20 | Async ORM / schema migrations |
| Pydantic | v2 | Request-validation and configuration |
| PyJWT / bcrypt | ≥ 2.15 / ≥ 5.0 | Token issuing / password hashing |
| redis-py | ≥ 8.1 | Tokens, sessions and captcha cache |
| aiomysql / aiosqlite | ≥ 0.3.2 / ≥ 0.22.1 | Async drivers for MySQL / SQLite |
| Loguru | ≥ 0.7 | Logging |
| Python | ≥ 3.12 | Runtime; dependencies managed by [uv](https://github.com/astral-sh/uv) (frozen in `uv.lock`) |

## Layout

```txt
backend/
├── app/
│   ├── api/v1/routers.py   # Route assembly: DOMAIN_CONTROLLERS grouped by domain
│   ├── modules/            # Business modules: auth/user/role/menu/dept/dict/param under system, file under common
│   ├── core/               # database/security/middlewares/dependencies/exceptions/logger/redis_crud/base_model/base_schema
│   ├── config/             # setting.py for options, path_conf.py for paths
│   ├── common/             # Constants, enums, response wrappers
│   ├── scripts/            # Startup seeds (admin + menus/dictionaries/departments)
│   ├── alembic/            # Migration files
│   └── utils/              # Password and upload helpers
├── env/                    # .env.dev / .env.prod, with .env.example as the secret-free template
├── main.py                 # Entry point
└── pyproject.toml / uv.lock
```

Every business module is layered as `controller / service / crud / model / schema`; modules without a persisted entity skip parts — `auth` only has controller/service/schema, `common/file` only controller/service, `system/param` only controller.

## Running

```bash
# 1. Bring up Redis from the repository root (a hard startup dependency; any Redis on 6379 works)
docker compose -f docker/docker-compose.yaml up -d redis

# 2. Install dependencies and start, in the backend directory
uv sync
uv run python main.py
```

**It runs without an env file**: the built-in defaults in `app/config/setting.py` apply (SQLite plus a local Redis on `6379` without password). To change something, `cp env/.env.example env/.env.dev` and edit it; `main.py` picks the file through the OS variable `ENVIRONMENT` (`dev` by default, `prod` loads `env/.env.prod`). API docs: http://127.0.0.1:8001/docs , and `npm run dev` from the repository root starts backend and frontend together.

### Switching to MySQL

```bash
cp backend/env/.env.example backend/env/.env.dev           # 1 Set DATABASE_TYPE to mysql, leave the rest alone
docker compose -f docker/docker-compose.yaml up -d mysql   # 2 Creates the schema; wait until STATUS reports (healthy), 10-30s on first run
cd backend && uv run python main.py                        # 3
```

The template values already match compose (port `33066`, account `quickadmin`, schema `quickadmin`). Success looks like `数据库表初始化完成` followed by `已初始化默认超级管理员账号` in the logs. **A different database means brand-new data**; nothing is migrated from the previous SQLite file.

### Migration Commands (when models change)

```bash
uv run alembic revision --autogenerate -m "change summary"   # Generate from model changes
uv run alembic upgrade head                                  # Apply
uv run alembic downgrade -1                                  # Roll back one step
```

The first startup doesn't need them, since `create_all` seeds the tables; in production prefer `alembic upgrade head` to evolve the schema.

## Backend Conventions

- **Uniform response**: every endpoint returns `{ code, msg, data }` through `SuccessResponse` in `common/response.py`; exceptions are handled centrally by `core/exceptions.py`.
- **Authorization**: JWT bearer tokens (issued and parsed by `core/security.py`, lifetime set by `ACCESS_TOKEN_EXPIRE_SECONDS`); after login the global `PermissionMiddleware` derives the required permission from the request path, while self-describing endpoints such as login, captcha and current-user info are allowed through.
- **Model base**: ORM models mix in `ModelMixin`, which supplies `id / is_deleted / created_time / updated_time` with timestamps in `Asia/Shanghai`.
- **Passwords**: bcrypt salted hashes (`utils/password_util.py`), never stored in clear text.
- **Startup seeds**: `scripts/init_data.py` idempotently writes the default admin, the system menus with their button permission codes, the gender dictionary and the root department during lifespan; it skips a table as soon as it holds any row (soft-deleted included).
- **Dialects**: `DATABASE_TYPE` selects `sqlite` / `mysql` / `postgres` and `ASYNC_DB_URI` builds the matching connection string, so business code stays dialect-agnostic.
- **Uploads**: files land in `static/upload` and are served through `STATIC_URL` (`/static` by default).

## FAQ

| Error | Fix |
|------|------|
| `redis.exceptions.ConnectionError ... 6379` | Redis isn't up — rerun step 1 of Running. `down` deletes the containers and a reboot won't bring them back |
| `AuthenticationError: Authentication required.` | The container's `REDIS_PASSWORD` differs from `env/.env.dev`; leave both empty for local development |
| `(2003, "Can't connect to MySQL server")` | The mysql container isn't healthy yet, or `DATABASE_PORT` differs from compose's `MYSQL_PORT` (33066 by default) |
| The container keeps restarting with `--initialize specified but the data directory has files in it` | `docker/mysql/data` must stay free of stray files; move them out, then `up -d mysql` again |
| `RuntimeError` mentioning cryptography | Rerun `uv sync` (MySQL 8 authentication needs it; it's already pinned in the lock file) |
| `DATABASE_TYPE=postgres` fails to find asyncpg | The PostgreSQL driver isn't installed; run `uv add asyncpg` first |

## Links

[Root README](../README.en.md) | [FastAPI](https://fastapi.tiangolo.com/) | [SQLAlchemy](https://docs.sqlalchemy.org/) | [Alembic](https://alembic.sqlalchemy.org/) | [Pydantic](https://docs.pydantic.dev/)
