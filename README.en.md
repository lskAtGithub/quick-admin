<div align="center">
     <p align="center">
          <img src="frontend/web/public/favicon.svg" width="120" height="120" alt="logo" />
     </p>
     <h1>Quick Admin</h1>
     <h3>🚀 A full-stack admin scaffold built on FastAPI + Vue3</h3>
     <p>Clean code and a comfortable theming experience — run the full stack with one command, ship it with one Docker click</p>
     <p align="center">
          <img src="https://img.shields.io/badge/Python-≥3.12-blue">
          <img src="https://img.shields.io/badge/NodeJS-≥20.0-blue">
          <img src="https://img.shields.io/badge/FastAPI-≥0.143-green">
          <img src="https://img.shields.io/badge/Vue-3.5-brightgreen">
          <img src="https://img.shields.io/badge/ElementPlus-2.14-blue">
          <img src="https://img.shields.io/badge/DB-MySQL%20|%20PostgreSQL%20|%20SQLite-orange">
     </p>

[简体中文](./README.md) | English

</div>

## 🖥️ Interface Overview

- **Dashboard**: welcome banner + stat cards + quick entries, with entrance animations synced to the theme color
- **Login page**: username/password + slider captcha, with register / forgot-password panels and third-party login entries
- **System management**: full CRUD for users / roles / menus / departments / dictionaries, with per-role menu permission trees
- **Profile**: edit details, upload avatar, gender from dictionary
- **Appearance panel**: light/dark/auto theme, free theme color, layout & radius, color-blind/gray modes, multi-language

## 💡 What is Quick Admin

A **front-end / back-end separated admin platform** focused on the most essential capabilities of a mid/back-office: authentication, dynamic menus, RBAC permissions, system-management CRUD, rich theme customization and production-ready deployment. The code aims to be clean and readable, so you can build your business features on top of it.

| Capability | Description |
|------------|-------------|
| ⚡ **Async FastAPI** backend | SQLAlchemy 2.x async ORM + Pydantic v2 validation |
| 🔐 **JWT authentication** | Login issuance + token refresh + Redis-backed logout |
| 🧭 **Dynamic menus / routes** | Menus delivered by the backend; routes assembled and guarded by permission on the frontend |
| 🎨 **Theming system** | Light/dark/auto, free theme color, sidebar color scheme, radius, layout modes |
| 🌁 **Slider + image captcha** | Pre-login human verification with captcha state stored in Redis |
| 🌐 **i18n** | Built-in 中文 / English bilingual support |
| 🐳 **One-click Docker deploy** | MySQL + Redis + backend + Nginx (optional SSL) |
| 🧰 **Alembic migrations** | Versioned schema with an initial migration included |

## 🚀 Quick Start

### Requirements

| Requirement | Version / Notes |
|-------------|---------|
| Python | ≥ 3.12 (dependency management with [uv](https://github.com/astral-sh/uv) recommended) |
| Node.js | ≥ 20, package manager: pnpm |
| Database | MySQL 8.0+ / PostgreSQL / SQLite (defaults to SQLite; dev environment configured for MySQL) |
| Cache | **Redis 7.x (a hard dependency of backend startup — the app fails to boot without it)** |
| Docker | Recommended for quickly bringing up Redis and deploying the full stack (requires Docker Desktop to be installed and running, plus `docker compose` v2 on Windows/Linux) |

### Development

The frontend dev server runs on port `5173`, the backend on port `8001`. All commands below run **from the repository root** (steps that `cd` into a subdirectory are marked individually). An env file is **not required**: when `backend/env/.env.dev` is missing the backend falls back to the built-in defaults in `setting.py` (SQLite plus a local Redis on `6379` without password); to change the database or secrets, run `cp backend/env/.env.example backend/env/.env.dev` and edit it.

```bash
# 1. Prepare the compose variable file (required on first use: `docker/.env` is not committed, and without it every docker compose command fails on the required variables)
cp docker/.env.example docker/.env

# 2. Start Redis (a hard backend dependency: startup fails outright if localhost:6379 is unreachable)
#    Run this from the repository root with Docker Desktop already running, or start any Redis service listening on 6379 yourself
docker compose -f docker/docker-compose.yaml up -d redis

# 3. Install backend dependencies (in the backend directory, uv recommended)
cd backend && uv sync && cd ..

# 4. Install frontend dependencies (in the frontend/web directory)
cd frontend/web && pnpm install && cd ../..

# 5. Start frontend + backend with a single command (npm or pnpm — the root has no dependencies)
npm run dev

# ✅ Open http://127.0.0.1:5173 in your browser and log in with admin / admin
```

Those steps run on the **default SQLite** (no database to create). To switch to MySQL, see “Switching to MySQL / PostgreSQL” in [backend/README.md](./backend/README.en.md).

You can also start them separately:

```bash
# Backend (in the backend directory)
uv run python main.py          # or python main.py

# Frontend (in the frontend/web directory)
pnpm run dev
```

> On first startup the backend creates the tables and idempotently seeds: the super-admin account `admin` / `admin` (change the password promptly), the System Management menus with their button permission codes, the gender dictionary and the root department. Nothing is inserted or overwritten once those tables already contain data. **Pointing at a fresh database (e.g. a newly created MySQL schema) means brand-new data, so the seeding runs again.**
> API docs: after startup visit http://127.0.0.1:8001/docs .

### 🐳 One-click Docker Deploy

```bash
cp docker/.env.example docker/.env    # fill in MySQL / Redis passwords and SECRET_KEY
./deploy.sh                           # build frontend on host → build images → start the full stack
```

`docker-compose.yaml` defines four services: **MySQL, Redis, Backend, Nginx**. Nginx serves the frontend build and reverse-proxies `/api/v1` to the backend; the SSL (443) config is included but commented out by default — enable it after providing your certificates.

### 🌍 Multi-language Generation Script

All copy is maintained in `frontend/web/src/i18n/langs/zh.json`; other locales need no hand-writing — run this from the repo root:

```bash
pnpm run i18n    # pick a target language → diff against zh.json → auto-translate missing entries via Baidu API → write langs/<code>.json
```

Before the first run, register and create a "Baidu Translate API" app in the [Baidu Translate Open Platform console](https://fanyi-api.baidu.com/manage/developer), then put the **APP_ID** and **SECRET** into `BAIDU_FANYI` in `frontend/web/scripts/create-i18n/config.js` — **the free standard tier already covers every entry of this project**.

- **Incremental only**: just translates keys missing in the target file; existing translations are never overwritten, and extra keys are reported in the console without deletion.
- 17 built-in locales (en/ja/ko/fr/de/es/ru/pt/it/nl/pl/vi/th/id/ms/ar/hi); those marked ※ require enabling the matching translation permission in the Baidu console — the script fails fast with a clear message if not enabled.
- Placeholder templates (e.g. `请输入{name}`) are protected automatically; machine-translated word order in some locales may deserve manual polish; failed entries are never written as dirty data — rerun the script to top them up.

## 📦 Project Structure

```
quick-admin/                 # Full-stack monorepo
├─ backend/                  # FastAPI backend (SQLAlchemy async + Alembic + Redis)
│   ├─ app/api/v1/           # Routes registered by domain group (DOMAIN_CONTROLLERS)
│   ├─ app/modules/          # Business modules: system (auth/user/role/menu/dept/dict/param), common (file)
│   ├─ app/core/             # Database, security, middleware, exceptions, logging, Redis, dependency injection
│   ├─ app/config/           # Configuration (setting.py) and env files (env/.env.*, template env/.env.example)
│   ├─ app/scripts/          # Startup initialization (admin + menu/dictionary/department seeds)
│   └─ alembic/              # Database migrations
├─ frontend/web/             # Vue3 web frontend (Element Plus + Vite + Pinia + Tailwind)
│   └─ src/                  # views / router / store / layouts / components / i18n ...
├─ docker/                   # Docker Compose one-click deploy (MySQL/Redis/Backend/Nginx)
├─ skills/                   # Frontend/backend dev-convention skills (qa-front / qa-back, SKILL.md)
├─ scripts/dev.js            # Root dev launcher (starts frontend + backend together)
└─ deploy.sh                 # One-click deployment script
```

## 🤖 AI Coding-Agent Skills

The repo ships skills for AI coding agents:

| Skill | Location | Purpose |
|-------|----------|---------|
| 🎨 **impeccable** (UI) | Configured via `.impeccable/` (config.json / design.json) | Frontend interface design/engineering: redesign, critique, polish, auditing |
| 🖥️ **qa-front** | `skills/qa-front/SKILL.md` | Frontend conventions and the full workflow for adding admin pages (API modules, list-page kit, router/menu wiring, i18n, etc.) |
| ⚙️ **qa-back** | `skills/qa-back/SKILL.md` | Backend conventions and the full workflow for adding business modules (Model/Schema/CRUD/Service/Controller layering, domain registration, permission SQL, verification) |

> For details on the impeccable UI skill, see its official getting-started guide: <https://impeccable.cn/tutorials/getting-started/>

## 📌 Built-in Features

### Backend APIs (`/api/v1`)

| Module | Capabilities |
|--------|--------------|
| 🔑 Auth | Image captcha, slider captcha verification, login, register, token refresh, logout |
| 👤 User | List / detail / create / update / delete, current-user query & update, change password |
| 🎭 Role | Paginated list / detail / create / update / delete, assign menu permissions |
| 📋 Menu | Menu tree / paginated list / detail / create / update / delete, carries permission identifiers |
| 🏢 Department | Dept tree / paginated list / detail / create / update / delete |
| 📖 Dictionary | Grouped CRUD for dict types and dict data, query items by type |
| ⚙️ Parameter | Read initialization config parameters |
| 📁 File | Local upload (whitelisted image / document extensions, ≤ 10MB per file), served via static directory |

### Frontend Pages & Features

| Category | Capabilities |
|----------|--------------|
| 🧭 Routing & Permission | Backend-delivered dynamic menus, routes assembled by permission, route-guard auth, button/menu permission identifiers |
| 📊 Dashboard | Welcome area, stat cards, quick entries, theme-synced entrance animations |
| 🔐 Login | Username/password + slider captcha, register panel, forgot-password panel, third-party login entries |
| ⚙️ System Mgmt | User / role / menu / dept / dict management pages (with add / edit sub-pages and form components) |
| 👤 Profile | Edit details, avatar upload, gender from dictionary |
| 🎛️ Appearance | Light/dark/auto theme, free theme color, sidebar color scheme, layout mode, container width, radius, color-blind mode, gray mode, page-transition animations, progress bar |
| 🗂️ Shell | Multi-tab (worktab), breadcrumb, sidebar/top-bar menus, screen lock, watermark, global components |
| 🌐 i18n | 中文 / English |
| ⚠️ Exception pages | 401 / 403 / 404 / 500 |

## 🔧 Configuration

Configuration lives in `backend/app/config/setting.py`; runtime environment variables are in `backend/env/.env.{dev,prod}` (`ENVIRONMENT` selects which one to load, and the built-in defaults apply when neither exists). See `backend/env/.env.example` for a secret-free template. Key items:

```python
DATABASE_TYPE = "sqlite"        # one of: sqlite | mysql | postgres
ACCESS_TOKEN_EXPIRE_SECONDS = 43200   # JWT validity (default 12h)
CAPTCHA_ENABLE = False          # login captcha toggle
UPLOAD_FILE_PATH = "static/upload"    # upload directory
ALLOWED_EXTENSIONS = [...]      # allowed upload extensions
MAX_FILE_SIZE = 10 * 1024 * 1024       # per-file limit
```

> Switch the database type via `DATABASE_TYPE` — no code changes needed; `ASYNC_DB_URI` builds the correct dialect connection string automatically.
> Keep all secrets (`SECRET_KEY`, database / Redis passwords) in `backend/env/.env.*` or `docker/.env` — never commit them to the repository.

## 🚦 Deployment & Security Notes

- **Change the default password**: the initial `admin/admin` is for first login only — change it immediately after going live.
- **Replace the JWT secret**: in production always set `SECRET_KEY` to a strong random value (`openssl rand -hex 32`).
- **Database migrations**: in production prefer Alembic to manage schema (`uv run alembic upgrade head`); the `create_all` at startup is only a first-time fallback initializer.
- **Production config file**: `deploy.sh` checks that `backend/env/.env.prod` exists, so create it before a Docker deploy (copy `backend/env/.env.example` and point `DATABASE_TYPE` at the MySQL service from the compose file).
- **Upload persistence**: the Docker deployment mounts `backend/static/upload` so user files survive container rebuilds.
- **HTTPS**: to enable SSL, drop your certificates into `docker/nginx/ssl` and uncomment the 443 block in `nginx.conf`.

## 🙏 Tech Stack Acknowledgements

- Backend: [FastAPI](https://fastapi.tiangolo.com/) · [SQLAlchemy](https://www.sqlalchemy.org/) · [Pydantic](https://docs.pydantic.dev/) · [Alembic](https://alembic.sqlalchemy.org/) · [PyJWT](https://pyjwt.readthedocs.io/) · [Redis](https://redis.io/) · [loguru](https://github.com/Delgan/loguru) · [uv](https://github.com/astral-sh/uv)
- Frontend: [Vue3](https://vuejs.org/) · [Vite](https://vitejs.dev/) · [Element Plus](https://element-plus.org/) · [Pinia](https://pinia.vuejs.org/) · [vue-router](https://router.vuejs.org/) · [vue-i18n](https://vue-i18n.intlify.dev/) · [Tailwind CSS](https://tailwindcss.com/) · [Unplugin](https://github.com/unjs/unplugin)

## 🤝 Contributing

Issues and PRs are welcome — let's make this base platform better together.

## 🙏 Support

> If this project helps you, a ⭐️ Star would be much appreciated!
