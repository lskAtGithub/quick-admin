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
- **Database**: MySQL 8.0+ / PostgreSQL / SQLite (SQLite by default; connection settings in `env/.env.dev`)
- **Redis**: a hard dependency, matching the settings in `env/.env.dev` (locally: `docker compose -f ../docker/docker-compose.yaml up -d redis`)

### Running Locally for the First Time

1. *(Optional)* Copy `env/.env.example` to `env/.env.dev` and adjust it: database, Redis, `SECRET_KEY`, `SERVER_PORT`, etc. (the database type is switched via `DATABASE_TYPE`; MySQL/PG require an empty database created first). **With no env file at all, the built-in defaults in `app/config/setting.py` apply: SQLite plus a local Redis on 6379 without password.**
2. Install dependencies **in the `backend/` directory**: **`uv sync`** is recommended (dependencies are frozen in `uv.lock`).
3. **Start**: `uv run python main.py` (or `python main.py`). **On first startup it creates the tables and idempotently seeds the default super-admin `admin` / `admin`, the System Management menus with their button permission codes, the gender dictionary and the root department**, so you generally don't need to run migrations first. API docs: `http://127.0.0.1:8001/docs` (port from `SERVER_PORT`).

> Environment switching: `main.py` decides which config to load via the OS environment variable `ENVIRONMENT`, defaulting to `dev`; set it to `prod` to load `env/.env.prod` (which `deploy.sh` expects to exist).
> Running `npm run dev` from the repository root uses `scripts/dev.js` to start this backend together with the frontend, so you don't need to launch it separately.

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
