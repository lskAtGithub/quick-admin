# Quick Admin · Frontend (web)

[简体中文](./README.md) | English

An admin frontend built on **Vue 3 + Vite + Element Plus**, written in **JavaScript**: Pinia for state, Tailwind CSS 4 and SCSS for styling, Axios for HTTP. For the overall picture and deployment, see the [root README.md](../../README.en.md).

## Quick Start

Prerequisites: Node.js ≥ 20, with dependencies managed by pnpm (the repository ships `pnpm-lock.yaml`; if pnpm is missing run `corepack enable` or `npm i -g pnpm`).

```bash
cd frontend/web
pnpm install
pnpm run dev          # Port 5173 by default, taken from VITE_PORT in .env.development
```

Running `npm run dev` from the repository root starts backend and frontend together. For integration, start the backend first (by default `http://127.0.0.1:8001`, i.e. `VITE_API_BASE_URL`): the browser sends requests to same-origin paths and Vite's `server.proxy` forwards `VITE_APP_BASE_API` (`/api/v1`) to it.

## Scripts

| Command | Description |
|------|------|
| `pnpm run dev` | Local development (reads `.env.development`) |
| `pnpm run dev:clean` | Clears the Vite pre-bundling cache, then starts (when the cache misbehaves) |
| `pnpm run build` | Production build (reads `.env.production`), output in `dist/` |
| `pnpm run preview` | Previews the build output |
| `pnpm run lint` | ESLint check (`lint:fix` auto-fixes; `format` / `format:check` run Prettier) |

## Tech Stack

| Area | Choice |
|------|------|
| Framework | Vue 3 (Composition API / `<script setup>`) |
| Bundler | Vite 7 |
| Language | JavaScript |
| UI | Element Plus 2.14 |
| Routing | Vue Router (hash mode; static routes plus dynamic `addRoute` in the guard) |
| State | Pinia + pinia-plugin-persistedstate |
| Styling | Tailwind CSS 4, SCSS |
| HTTP | Axios |
| i18n | vue-i18n (zh / en built in) |
| Auto-import | unplugin-auto-import / -vue-components / -icons / -element-plus |

Components and the Element Plus API are registered automatically by unplugin, so `<QaXxx />` works in templates without a manual `import`.

## Architecture

```txt
main.js → initPlugins(app) (Store → theme → Router → i18n → directives) → mount("#app")
Guard beforeEach: NProgress and storage state → login check → backend menus into dynamic addRoute → permission check → 404 fallback
```

Routing uses **hash mode**: the static routes (login / layout / exception pages) are registered up front, business routes are mounted lazily from the backend menus. The request layer `utils/request.js` owns success and error notifications and supports **silent token refresh** (on 401 it refreshes, merges concurrent requests through a queue, and redirects to login if the refresh fails).

## Directory Structure (src)

```txt
src/
├── api/          # Requests grouped by business module (module_system, etc.)
├── assets/       # Images and SVG icons
├── components/   # Shared and business components (auto-registered, qa-* prefix)
├── config/       # App config (setting defaults, headerBar, component) plus root config.js
├── constants/    # Constants (app / router / settings / login / breakpoints / webLinks)
├── directives/   # Custom directives (currently the ripple)
├── enums/        # Enums (app / layout / theme / setting / result)
├── hooks/        # Composables (hooks/core, auto-imported)
├── layouts/      # Layout shell (header, sidebar, breadcrumb, tabs, lock screen, settings panel)
├── locales.js    # i18n bundles and createI18n assembly (zh / en)
├── plugins/      # Vue plugin assembly entry (initPlugins)
├── router/       # Static routes, guard, menu processor, dynamic loader
├── store/        # Pinia modules (user / menu / setting / dict / config / worktab / app)
├── styles/       # Global styles (Tailwind, SCSS theme variables and animations)
├── utils/        # Helpers (request, storage, auth, ui, date, validator)
├── views/        # Pages (home / login / module_system / exception / fastlink / redirect)
└── main.js / App.vue
```

## Path Aliases

Defined in `vite.config.js`: `@` for `src/`, plus `@views`, `@stores`, `@utils`, `@styles`, `@plugins`, `@api`, `@imgs` / `@icons` (`src/assets/images` and SVG), and `@qa_imgs`.

## Environment Variables

Only variables prefixed `VITE_` reach the code; values come from `.env.development` / `.env.production`, and `pnpm run dev` must be restarted after editing them.

| Variable | Purpose |
|------|------|
| `VITE_PORT` | Dev server port |
| `VITE_BASE_URL` | Public base path (e.g. `/web/` for a subdirectory deploy) |
| `VITE_APP_BASE_API` | API path prefix matched by the Vite proxy (`/api/v1`) |
| `VITE_API_BASE_URL` | Proxy target: backend HTTP root |
| `VITE_API_URL` | API root prefix used by the browser (usually `/` in dev) |
| `VITE_API_TIMEOUT` | Request timeout in milliseconds |
| `VITE_APP_TITLE` / `VITE_APP_ENV` | Page title / environment marker |
| `VITE_LOCK_ENCRYPT_KEY` | Local encryption key for the lock-screen password (not security-sensitive) |

## Routing and Menus

`router/routes.js` holds the static routes, `guards.js` the `beforeEach` guard (login check, dynamic mounting, permission check, 404 fallback), `menu-processor.js` turns backend menus into route records, `route-loader.js` performs `addRoute`, and `refresh.js` manages the refresh state. A new page needs a **view plus (optionally) a route and a backend menu**, and all three must agree on the path and the `name`.

## FAQ

| Symptom | Suggestion |
|------|------|
| Cannot reach the backend | The backend isn't running, or `VITE_API_BASE_URL` points at the wrong port |
| Env changes don't apply | Restart `pnpm run dev` after editing `.env.*` |
| Hot reload misbehaves | Run `pnpm run dev:clean` to clear the cache, then start again |

## Build and Deployment

Output goes to `dist/`. For a subdirectory deployment set `VITE_BASE_URL` and let Nginx serve the assets while reverse-proxying `/api/v1` to the backend. The production chain is described in the [root README.md](../../README.en.md) and `docker/`: the root `deploy.sh` builds the frontend on the host and Nginx mounts `frontend/web/dist`.
