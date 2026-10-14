# Quick Admin · Frontend (web)

[简体中文](./README.md) | English

An admin frontend built on **Vue 3 + Vite + Element Plus**, paired with the Quick Admin backend (FastAPI). Written in **JavaScript**, with **Pinia** for state management, **Tailwind CSS 4** and **SCSS** for styling, and **Axios** for HTTP requests.

> **Relation to the root document**: for the project overview, one-command frontend+backend startup, demo account and Docker deployment, see the [root README.md](../../README.md); this document focuses on the `frontend/web/` directory structure, environment variables and frontend conventions.

## Quick Start

### Requirements

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| pnpm | Dependencies are managed by pnpm (the repo contains `pnpm-lock.yaml`); if not installed, run `corepack enable` or `npm i -g pnpm` |

### Install & Run

```bash
cd frontend/web
pnpm install
pnpm run dev
```

The default dev port comes from **`VITE_PORT`** in `.env.development` (currently **5173**).

> You can also run `pnpm run dev` from the repository root, which uses `scripts/dev.js` to start this frontend together with the backend.

### Working with the Backend

1. Start the backend first; its address should match **`VITE_API_BASE_URL`** in `.env.development` (default **`http://127.0.0.1:8001`**).
2. During development the browser sends same-origin requests, and **Vite `server.proxy`** forwards **`VITE_APP_BASE_API`** (e.g. `/api/v1`) to the backend above.
3. If the page reports "connection refused", check that the backend is running and the port matches, or set `VITE_API_BASE_URL` to your actual backend address.

## Architecture Overview

```
main.js starts
  └─ initPlugins(app)  ← plugin assembly (Store → theme → Router → i18n → directives)
      └─ mount("#app")
          └─ App.vue
              └─ route guard beforeEach
                  ├─ NProgress start, storage / refresh-state check
                  ├─ login state validation
                  ├─ dynamic route registration (backend menu → addRoute)
                  └─ permission check & 404 fallback
```

Routing uses **Hash mode**: static routes (login / layout / exception pages) are registered on first paint, while business routes are lazily added via `addRoute` by the guard based on backend menu permissions. The HTTP interceptor supports **silent token renewal** (on 401 / token expiry it auto-refreshes, coalescing concurrent requests through a queue and redirecting to login on failure) and centralizes success/failure notifications.

## Tech Stack

| Category | Choice |
|----------|--------|
| Framework | Vue 3 (Composition API / `<script setup>`) |
| Build | Vite 7 |
| Language | JavaScript |
| UI | Element Plus 2.14 |
| Router | Vue Router (Hash; static routes + dynamic `addRoute` in the guard) |
| State | Pinia + pinia-plugin-persistedstate |
| Styling | Tailwind CSS 4, SCSS |
| HTTP | Axios |
| i18n | vue-i18n (built-in zh / en) |
| Auto-import | unplugin-auto-import / -vue-components / -icons / -element-plus |

> Element Plus components and APIs are auto-imported on demand via unplugin, so business code usually needs no manual `import`.

## Common Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Local development (reads `.env.development`) |
| `pnpm run dev:clean` | Clear the Vite pre-bundle cache then start (when the cache misbehaves) |
| `pnpm run build` | Production build (reads `.env.production`), output in **`dist/`** |
| `pnpm run preview` | Preview the build result locally |

## Directory Structure (src)

```
src/
├── api/          # Requests encapsulated per business module (module_system, etc.)
├── assets/       # Images, SVG icons and other assets
├── components/   # Shared & business components (auto-registered, qa-* prefix)
├── config/       # App config (setting defaults, headerBar, component) + root config.js
├── constants/    # Constants (app / router / settings / login / breakpoints / webLinks)
├── directives/   # Custom directives (currently the ripple directive)
├── enums/        # Enums (app / layout / theme / setting / result)
├── hooks/        # Composables (hooks/core, auto-imported)
├── layouts/      # Layout shell (top bar, sidebar, breadcrumb, tabs, screen lock, settings panel, etc.)
├── locales.js    # i18n language packs & createI18n assembly (zh / en)
├── plugins/      # Vue plugin assembly entry (initPlugins)
├── router/       # Routing: static routes, guards, menu processor, dynamic loader
├── store/        # Pinia modules (user / menu / setting / dict / config / worktab / app)
├── styles/       # Global styles (Tailwind, SCSS theme variables & animations)
├── utils/        # Utilities (request layer, storage, auth, ui, date, validator, etc.)
├── views/        # Pages (home / login / module_system / exception / fastlink / redirect)
├── App.vue
└── main.js       # Entry
```

## Path Aliases

Configured in `vite.config.js`:

| Alias | Resolves to |
|-------|-------------|
| `@` | `src/` |
| `@views` | `src/views` |
| `@stores` | `src/store` |
| `@utils` | `src/utils` |
| `@styles` | `src/styles` |
| `@plugins` | `src/plugins` |
| `@api` | `src/api` |
| `@imgs` / `@icons` | `src/assets/images` & SVG |
| `@qa_imgs` | `src/assets/qa_imgs` |

## Environment Variables

Only variables prefixed with **`VITE_`** are injected into the frontend code; actual values live in `.env.development` / `.env.production`, and you must **restart** `pnpm run dev` after changing them.

| Variable | Purpose |
|----------|---------|
| `VITE_PORT` | Dev server port |
| `VITE_BASE_URL` | Deployment base path (e.g. `/web/` for sub-directory deploys) |
| `VITE_APP_BASE_API` | API path prefix, matched by the Vite proxy (`/api/v1`) |
| `VITE_API_URL` | API root prefix issued by the browser (often `/` in dev) |
| `VITE_API_BASE_URL` | **Proxy target**: backend HTTP root |
| `VITE_API_TIMEOUT` | Request timeout (ms) |
| `VITE_APP_TITLE` | Page title |
| `VITE_APP_ENV` | Environment marker (dev / production) |
| `VITE_LOCK_ENCRYPT_KEY` | Local encryption key for the screen-lock password (not security-sensitive) |

## Routing & Menus

| File | Responsibility |
|------|----------------|
| `src/router/routes.js` | Static routes (login / layout / exception / redirect) |
| `src/router/guards.js` | Before-guard: login check, dynamic route mounting, permission check, 404 fallback |
| `src/router/menu-processor.js` | Backend menu → frontend route records |
| `src/router/route-loader.js` | Dynamically `addRoute` based on the menu |
| `src/router/refresh.js` | Refresh-state and initialization state management |

Adding a business page generally requires a **view + (optional) route + backend menu**, keeping the path and **name** consistent across all three.

## Troubleshooting

| Symptom | Suggestion |
|---------|------------|
| Can't reach the backend | Backend not started, or wrong `VITE_API_BASE_URL` port |
| env changes not applied | You must restart `pnpm run dev` after editing `.env.*` |
| HMR behaves oddly | Try `pnpm run dev:clean` to clear the cache and restart |

## Build & Deploy

- Output directory: **`dist/`**
- For sub-path deployment set **`VITE_BASE_URL`**, and configure the gateway / Nginx to serve the frontend assets and reverse-proxy `/api/v1` to the backend
- For the production deployment chain see the [root README.md](../../README.md) and `docker/`: the root `deploy.sh` builds the frontend on the host, and Nginx serves `frontend/web/dist`
