# Quick Admin - Backend

[简体中文](./README.md) | English

An async backend service built on **FastAPI**, providing authentication, authorization and system-management APIs for the Vue3 admin frontend.

> **Relation to the root document**: for the project overview, one-command frontend+backend startup, demo account, Docker deployment and default ports, see the [root README.md](../README.md); this document focuses on the `backend/` directory structure, startup & migration commands, and backend conventions.

## Tech Stack

| Technology | Version | Notes |
|------------|---------|-------|
| FastAPI | ≥ 0.143 | Modern async web framework |
| SQLAlchemy | ≥ 2.1 | Async ORM (asyncio) |
| Alembic | ≥ 1.20 | Database migration tool |
| Pydantic | v2 (pydantic-settings ≥ 2.15) | Validation, serialization & settings management |
| PyJWT | ≥ 2.15 | JWT issuance and decoding |
| bcrypt | ≥ 5.0 | Password hashing |
| Redis | redis-py ≥ 8.1 | Captcha state, token cache |
| Loguru | ≥ 0.7 | Logging |
| Uvicorn | ≥ 0.54 | ASGI server |
| DB drivers | aiomysql / aiosqlite | MySQL / PostgreSQL / SQLite three dialects |
| Python | ≥ 3.12 | Runtime |

## Project Structure

```txt
backend/
├── app/                     # Core application code
│   ├── alembic/             # Database migrations (versions includes the initial migration)
│   ├── api/v1/routers.py    # Route assembly: aggregates module routers by domain group (DOMAIN_CONTROLLERS)
│   ├── modules/             # Business module layer (vertical split by domain)
│   │   ├── system/          #   auth / user / role / menu / dept / dict / param
│   │   └── common/          #   file (upload & shared capabilities)
│   ├── common/              # Shared components (constants, enums, response wrapper)
│   ├── config/              # Configuration (setting.py options, path_conf.py paths)
│   ├── core/                # Core modules (database / security / middlewares / dependencies /
│   │                        #   exceptions / logger / redis_crud / base_model / base_schema)
│   ├── scripts/             # Initialization scripts (admin + menu/dictionary/department seeds)
│   └── utils/               # Utilities (password_util / upload_util)
├── env/                     # Environment config (.env.dev / .env.prod; .env.example is the secret-free template)
├── logs/                    # Log output directory
├── static/upload/           # Uploaded file storage
├── main.py                  # Entry point (uvicorn factory launching app:create_app)
├── alembic.ini              # Alembic migration config
├── pyproject.toml           # Project & dependency config (managed by uv)
└── uv.lock                  # Dependency lock file
```

### Module Layering

Each business module follows a consistent layered structure (using entity modules under `system` as an example):

```txt
modules/<domain>/<module>/
├── controller.py    # Controller — HTTP routes and request handling
├── service.py       # Service — business logic
├── crud.py          # Data layer — database read/write
├── model.py         # ORM model — database table definition
└── schema.py        # Pydantic model — request/response validation
```

> Modules without a persisted entity omit the corresponding layers: `auth` (login/authorization) has only controller/service/schema, `common/file` has only controller/service, and `system/param` provides only a controller.

## Quick Start

### Requirements

- **Python**: 3.12+
- **Database**: MySQL 8.0+ / PostgreSQL / SQLite (**SQLite by default**; see “Switching to MySQL / PostgreSQL” below)
- **Redis**: a **hard startup dependency** — if the ping during lifespan fails, the backend exits immediately with `Application startup failed`; the address comes from `REDIS_HOST` / `REDIS_PORT` in `env/.env.dev` (a local Redis on 6379 without password when no env file exists). Locally, bringing it up with Docker is recommended: make sure Docker Desktop is running, then run `docker compose -f docker/docker-compose.yaml up -d redis` **from the repository root (`quick-admin/`, not `backend/`)**; that command requires `docker/.env` to exist (on first use `cp docker/.env.example docker/.env`); note that `docker compose down` deletes the containers, so `up -d redis` must be run again afterwards (a reboot or Docker Desktop restart won't bring them back); or start any Redis listening on 6379 yourself
  - **The password must match on both sides**: the container's `--requirepass` comes from `REDIS_PASSWORD` in `docker/.env`, while the backend reads `REDIS_PASSWORD` from `env/.env.dev`. Leave both empty for local development (the template default); if the container has a password and the backend isn't synced, the error is `redis.exceptions.AuthenticationError: Authentication required.` — note it is not `ConnectionError`, meaning the connection itself succeeded

### Running Locally for the First Time

1. *(Optional)* Copy `env/.env.example` to `env/.env.dev` and adjust it: database, Redis, `SECRET_KEY`, `SERVER_PORT`, etc. (see “Switching to MySQL / PostgreSQL” below for the full MySQL/PG steps). **With no env file at all, the built-in defaults in `app/config/setting.py` apply: SQLite plus a local Redis on 6379 without password.**
2. Install dependencies **in the `backend/` directory**: **`uv sync`** is recommended (dependencies are frozen in `uv.lock`).
3. **Start**: `uv run python main.py` (or `python main.py`). **On first startup it creates the tables and idempotently seeds the default super-admin `admin` / `admin`, the System Management menus with their button permission codes, the gender dictionary and the root department**, so you generally don't need to run migrations first. API docs: `http://127.0.0.1:8001/docs` (port from `SERVER_PORT`).

> Environment switching: `main.py` decides which config to load via the OS environment variable `ENVIRONMENT`, defaulting to `dev`; set it to `prod` to load `env/.env.prod` (which `deploy.sh` expects to exist).
> Running `npm run dev` from the repository root uses `scripts/dev.js` to start this backend together with the frontend, so you don't need to launch it separately.

### Switching to MySQL / PostgreSQL

**SQLite is the default — it runs with no database to create and no configuration.** Switching to MySQL only means editing the database section of `backend/env/.env.dev`; follow the four steps below.

**1) Prepare the env file** (skip if it already exists), from the repository root:

```bash
cp backend/env/.env.example backend/env/.env.dev
```

**2) Prepare the database** — pick one:

*A. The MySQL shipped with compose* (the schema is created for you, no SQL required)

```bash
# Make sure docker/.env exists first (on first use: cp docker/.env.example docker/.env); run from the repository root
# MYSQL_PORT defaults to 33066 in the template so it cannot clash with a locally installed MySQL (the port inside the container is still 3306)
docker compose -f docker/docker-compose.yaml up -d mysql
docker ps --filter name=quickadmin-mysql   # wait until it reports healthy; first-time initialization takes 10-30s
```

*B. An existing local MySQL*: create the empty schema first; its character set must be utf8mb4. **The statement below is SQL, not a shell command** — enter the client with `mysql -u root -p` and paste it there, or run it in one line with `mysql -u root -p -e "..."`:

```sql
CREATE DATABASE IF NOT EXISTS quickadmin DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> Route A doesn't need this SQL at all: compose creates the schema from `MYSQL_DATABASE` in `docker/.env`.

**3) Edit the database section of `backend/env/.env.dev`**:

```properties
DATABASE_TYPE=mysql
DATABASE_HOST=127.0.0.1
DATABASE_PORT=33066             # route A: MYSQL_PORT from docker/.env (template default 33066); route B: your local MySQL's port
DATABASE_USER=quickadmin        # route A: MYSQL_USER from docker/.env
DATABASE_PASSWORD=change_me_app_password # route A: MYSQL_PASSWORD from docker/.env
DATABASE_NAME=quickadmin        # route A: MYSQL_DATABASE from docker/.env; no .db suffix
```

**4) Restart the backend**: `cd backend && uv run python main.py` — success looks like `数据库表初始化完成` followed by `已初始化默认超级管理员账号` in the logs. **A different database means brand-new data**; nothing is migrated from the previous SQLite file.

Switching back to SQLite: set `DATABASE_TYPE` back to `sqlite`, or delete `env/.env.dev`.

Switching to PostgreSQL: same four steps with `DATABASE_TYPE=postgres`, `DATABASE_PORT` set to 5432 (the template default is 33066); create the schema yourself.

Common failures:

| Symptom | Cause and fix |
|---------|---------------|
| `error while interpolating services.mysql.environment.XXX: required variable XXX is missing a value` | `docker/.env` doesn't exist (the `cp docker/.env.example docker/.env` step was skipped), or that variable was left blank — compose's required-variable check treats **an empty value as missing**, and the variable named in the error isn't necessarily the real culprit. Even if you only use a local MySQL and never start the container, this file must exist with non-empty values |
| `RuntimeError` mentioning cryptography / sha2_rsa_encrypt | MySQL 8's `caching_sha2_password` requires `cryptography`, which is already pinned in `pyproject.toml` / `uv.lock` — rerun `uv sync` |
| `(2003, "Can't connect to MySQL server")` | Wrong host or port: confirm the container is healthy and `DATABASE_PORT` matches `MYSQL_PORT` in `docker/.env` |
| The container keeps restarting with `--initialize specified but the data directory has files in it` | `docker/mysql/data` is mounted as the MySQL data directory and **must stay free of stray files** (typically a SQL dump dropped in there); move those files out, then `up -d mysql` again |

### Database Migration Commands (when models change)

You **don't need to run these on a normal first start** (`create_all` handles initialization at startup); use the standard Alembic CLI when you **modify ORM models** and need Alembic to manage schema changes:

```bash
# Generate a migration file from model changes
uv run alembic revision --autogenerate -m "change summary"

# Apply migrations to the database
uv run alembic upgrade head

# Roll back one migration
uv run alembic downgrade -1
```

> In production, manage schema evolution with Alembic (`uv run alembic upgrade head`); the `create_all` at startup is only a first-time fallback initializer.

## Backend Conventions

- **Unified response**: every endpoint is wrapped by `SuccessResponse` in `app/common/response.py`, returning a `{ code, msg, data }` structure; exceptions are handled centrally by `app/core/exceptions.py`.
- **Authentication**: JWT-based Bearer Token (`Authorization: Bearer <token>`), issued and decoded by `app/core/security.py`; validity is controlled by `ACCESS_TOKEN_EXPIRE_SECONDS`, and the token is cleared from Redis on logout.
- **Authorization**: after login, the global `PermissionMiddleware` derives and checks permissions from the request path; self-describing endpoints such as login, captcha and current-user info are allowed through in the middleware.
- **Soft delete & timestamps**: ORM models mix in `ModelMixin`, uniformly providing `id` / `is_deleted` / `created_time` / `updated_time`, with times defaulting to the `Asia/Shanghai` timezone.
- **Password storage**: salted bcrypt hashing (`app/utils/password_util.py`); no plaintext is stored in the database.
- **Startup seeding**: `app/scripts/init_data.py` idempotently seeds the default admin, the System Management menus with button permissions, the gender dictionary and the root department inside the application lifespan; a table holding any row (soft-deleted included) makes the seed skip it, so your own data is never overwritten.
- **Multiple DB dialects**: `DATABASE_TYPE` switches between `sqlite` / `mysql` / `postgres`; `ASYNC_DB_URI` builds the matching async connection string automatically, so business code is dialect-agnostic.
- **Static files**: uploads land in `static/upload` and are served via the `STATIC_URL` mount (default `/static`).

## Related Links

- **Project overview**: [root README.md](../README.md)
- **FastAPI docs**: [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
- **SQLAlchemy docs**: [https://docs.sqlalchemy.org/](https://docs.sqlalchemy.org/)
- **Alembic docs**: [https://alembic.sqlalchemy.org/](https://alembic.sqlalchemy.org/)
- **Pydantic docs**: [https://docs.pydantic.dev/](https://docs.pydantic.dev/)
