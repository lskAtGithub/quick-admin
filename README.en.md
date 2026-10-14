<div align="center">
     <p align="center">
          <img src="frontend/web/public/favicon.svg" width="120" height="120" alt="logo" />
     </p>
     <h1>Quick Admin <sup style="background-color: #4080ff; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.4em; vertical-align: super; margin-left: 5px;">v0.1.0</sup></h1>
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

| Requirement | Version |
|-------------|---------|
| Python | ≥ 3.12 (dependency management with [uv](https://github.com/astral-sh/uv) recommended) |
| Node.js | ≥ 20, package manager: npm |
| Database | MySQL 8.0+ / PostgreSQL / SQLite (defaults to SQLite; dev environment configured for MySQL) |
| Cache | Redis 7.x |

### Development

The backend reads `backend/env/.env.dev` by default; the frontend dev server runs on port `5173`, the backend on port `8001`.

```bash
# 1. Install backend dependencies (in the backend directory, uv recommended)
cd backend && uv sync && cd ..

# 2. Start frontend + backend with a single command
npm run dev

# ✅ Open http://127.0.0.1:5173 in your browser and log in with admin / admin
```

You can also start them separately:

```bash
# Backend (in the backend directory)
uv run python main.py          # or python main.py

# Frontend (in the frontend/web directory)
npm install && npm run dev
```

> On first startup the backend automatically creates tables and seeds a default super-admin account `admin` / `admin` (idempotent — please change the password promptly).
> API docs: after startup visit http://127.0.0.1:8001/docs .

### 🐳 One-click Docker Deploy

```bash
cp docker/.env.example docker/.env    # fill in MySQL / Redis passwords and SECRET_KEY
./deploy.sh                           # build frontend on host → build images → start the full stack
```

`docker-compose.yaml` defines four services: **MySQL, Redis, Backend, Nginx**. Nginx serves the frontend build and reverse-proxies `/api/v1` to the backend; the SSL (443) config is included but commented out by default — enable it after providing your certificates.

## 📦 Project Structure

```
quick-admin/                 # Full-stack monorepo
├─ backend/                  # FastAPI backend (SQLAlchemy async + Alembic + Redis)
│   ├─ app/api/v1/           # Routes registered by domain group (DOMAIN_CONTROLLERS)
│   ├─ app/modules/          # Business modules: system (auth/user/role/menu/dept/dict/param), common (file)
│   ├─ app/core/             # Database, security, middleware, exceptions, logging, Redis, dependency injection
│   ├─ app/config/           # Configuration (setting.py) and env files (env/.env.*)
│   ├─ app/scripts/          # Startup initialization (default admin seed)
│   └─ alembic/              # Database migrations
├─ frontend/web/             # Vue3 web frontend (Element Plus + Vite + Pinia + Tailwind)
│   └─ src/                  # views / router / store / layouts / components / i18n ...
├─ docker/                   # Docker Compose one-click deploy (MySQL/Redis/Backend/Nginx)
├─ scripts/dev.js            # Root dev launcher (starts frontend + backend together)
└─ deploy.sh                 # One-click deployment script
```

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

Configuration lives in `backend/app/config/setting.py`; runtime environment variables are in `backend/env/.env.{dev,prod}` (`ENVIRONMENT` selects which one to load). Key items:

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
- **Upload persistence**: the Docker deployment mounts `backend/static/upload` so user files survive container rebuilds.
- **HTTPS**: to enable SSL, drop your certificates into `docker/nginx/ssl` and uncomment the 443 block in `nginx.conf`.

## 🙏 Tech Stack Acknowledgements

- Backend: [FastAPI](https://fastapi.tiangolo.com/) · [SQLAlchemy](https://www.sqlalchemy.org/) · [Pydantic](https://docs.pydantic.dev/) · [Alembic](https://alembic.sqlalchemy.org/) · [PyJWT](https://pyjwt.readthedocs.io/) · [Redis](https://redis.io/) · [loguru](https://github.com/Delgan/loguru) · [uv](https://github.com/astral-sh/uv)
- Frontend: [Vue3](https://vuejs.org/) · [Vite](https://vitejs.dev/) · [Element Plus](https://element-plus.org/) · [Pinia](https://pinia.vuejs.org/) · [vue-router](https://router.vuejs.org/) · [vue-i18n](https://vue-i18n.intlify.dev/) · [Tailwind CSS](https://tailwindcss.com/) · [Unplugin](https://github.com/unjs/unplugin)

## 🤝 Contributing

Issues and PRs are welcome — let's make this base platform better together.

## 🙏 Support

> If this project helps you, a ⭐️ Star would be much appreciated!
