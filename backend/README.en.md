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

### Prerequisites

| Layer | Stack | Version |
| --- | --- | --- |
| Language | Python | ≥ 3.12, dependencies managed by [uv](https://github.com/astral-sh/uv) (frozen in `uv.lock`) |
| Database | SQLite / MySQL / PostgreSQL | SQLite by default, no schema to create |
| Middleware | Redis | 7.0+, a hard startup dependency |

### Running

```bash
# 1. Bring up Redis from the repository root (or start any Redis listening on 6379)
docker compose -f docker/docker-compose.yaml up -d redis

# 2. Install dependencies and start, in the backend directory
uv sync
uv run python main.py
```

The first run creates the tables and idempotently seeds `admin` / `admin`, the system menus with their button permission codes, the gender dictionary and the root department, so migrations aren't needed. API docs: http://127.0.0.1:8001/docs .

**It runs without an env file**: the built-in defaults in `app/config/setting.py` apply (SQLite plus a local Redis on `6379` without password). To change something, `cp env/.env.example env/.env.dev` and edit it; `main.py` picks the file through the OS variable `ENVIRONMENT` (`dev` by default, `prod` loads `env/.env.prod`). Running `npm run dev` from the repository root starts this backend together with the frontend.

### Switching to MySQL / PostgreSQL

Three steps, all run from the repository root:

```bash
# 1. Prepare the backend config, then set DATABASE_TYPE to mysql inside it
cp backend/env/.env.example backend/env/.env.dev

# 2. Start the database (compose creates the quickadmin schema, no SQL required); wait until STATUS reports (healthy), 10-30s on first run
docker compose -f docker/docker-compose.yaml up -d mysql
docker ps --filter name=quickadmin-mysql

# 3. Start the backend
cd backend && uv run python main.py
```

The template values already match compose (port `33066`, account `quickadmin`, schema `quickadmin`), so **only the `DATABASE_TYPE` line needs editing**. Success looks like `数据库表初始化完成` followed by `已初始化默认超级管理员账号` in the logs. **A different database means brand-new data**; nothing is migrated from the previous SQLite file.

**Other cases and failures**

| Case / symptom | What to do |
|------|------|
| Using a MySQL you already installed locally (no container) | Create the schema **inside a mysql client** (not bash): `CREATE DATABASE IF NOT EXISTS quickadmin DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`, then point `DATABASE_PORT` / `DATABASE_USER` / `DATABASE_PASSWORD` in `.env.dev` at your own values |
| Back to SQLite / over to PostgreSQL | `DATABASE_TYPE=sqlite` / `DATABASE_TYPE=postgres` with `DATABASE_PORT=5432` (create the schema yourself) |
| `(2003, "Can't connect to MySQL server")` | The container isn't healthy yet, or `DATABASE_PORT` differs from compose's `MYSQL_PORT` (33066 by default) |
| The container keeps restarting with `--initialize specified but the data directory has files in it` | `docker/mysql/data` must stay free of stray files; move them out, then `up -d mysql` again |
| `RuntimeError` mentioning cryptography | Rerun `uv sync` (MySQL 8 authentication needs it; it's already pinned in the lock file) |

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
