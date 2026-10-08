# A 轮布局地基 + 动态路由 + 核心外壳 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把参考项目 FastApiAdmin 的后台布局外壳 + 后端动态路由/权限守卫，以 1:1 表现形式移植进 `frontend/web`，全 JS、全 `fa→qa`，做到登录进后台即渲染出侧栏菜单/顶栏/面包屑/多标签/内容区，后端不可用时兜底 Home。

**Architecture:** 分层自底向上：utils/constants → stores(setting 全量/menu/worktab) → router 管道(routes 壳层+常量/refresh/menu-processor/route-loader/guards) → 外壳组件(layouts/qa-*) → 装配接线(plugins/main/i18n/styles) → 整体验证。每个叶子单元独立可编译验证后再叠加上层。

**Tech Stack:** Vue 3.5 `<script setup>`、Pinia + persistedstate、vue-router(hash)、vue-i18n、Element Plus、@vueuse/core、mitt、nprogress、Tailwind v4 + SCSS、unplugin 自动导入/自动注册、Vite 7。

**验证方式（本工程无单测框架，按既有习惯）：** 每层用 `pnpm build` 编译门 + 关键层 `pnpm dev` + curl 自动导入解析 + 浏览器渲染核验。TDD 因无 runner 且属"新增依赖/框架"未采用；纯逻辑单元（menu-processor/route-loader/validator）通过浏览器 + 受控 console 断言核验。

---

## 文件结构（本轮创建/修改）

修改：
- `src/store/modules/setting.store.js`（登录子集 → 全量）
- `src/store/index.js`（再导出 useMenuStore/useWorktabStore）
- `src/router/routes.js`（补异常页/redirect 壳层 + CatchAll404 + 路由常量）
- `src/router/guards.js`（最小守卫 → 完整 beforeEach/afterEach）
- `src/router/index.js`（`setupRouterGuards` 接线）
- `src/plugins/index.js`（确保 initRouter 内挂守卫）
- `src/main.js`（引 NProgress 样式 + 布局 scss）
- `src/utils/ui.js`（补 NProgress 单例）
- `src/locales.js`（补 menu/header/worktab/settings 文案）
- `src/layouts/index.vue`（占位 → AppLayout）

新增：
- `src/constants/router.js`、`src/enums/routerEnum.js`
- `src/utils/index.js`（barrel：mittBus/getFirstMenuPath/formatMenuTitle/handleMenuJump）
- `src/utils/navigation.js`（setPageTitle/setWorktab）
- `src/store/modules/menu.store.js`、`src/store/modules/worktab.store.js`
- `src/router/refresh.js`、`src/router/menu-processor.js`、`src/router/route-loader.js`
- `src/hooks/core/useCommon.js`（getMainScrollEl 等，守卫/外壳依赖）
- `src/layouts/qa-page-content/index.vue`、`src/layouts/qa-menus/qa-sidebar-menu/index.vue`(+`widgets/QaSidebarSubmenu.vue`)、`src/layouts/qa-header-bar/index.vue`(+`widgets/QaUserMenu.vue`)、`src/layouts/qa-breadcrumb/index.vue`、`src/layouts/qa-work-tab/index.vue`、`src/layouts/qa-global-component/index.vue`、`src/layouts/qa-fast-enter/index.vue`
- `src/styles/pages/_layout.scss`（布局外壳样式）
- `src/assets/images/user/avatar.webp`

移植通用规则（每个"移植"步骤都适用，后续不再重复）：
1. 源在 `FastApiAdmin/frontend/web/src/`，读原文件 → 逐文件转 JS：删 `interface`/类型标注/泛型/`as`/`readonly`/`import type`。
2. `fa→qa`：目录 `fa-*`→`qa-*`；组件 `Fa*`→`Qa*`（`defineOptions name`、模板标签、`import`）；CSS `--fa-*`→`--qa-*`、`.fa-*`→`.qa-*`；别名 `@fa_imgs`→`@qa_imgs`。
3. 参考 `useSettingsStore`→`useSettingStore`；`@stores`→`@/store`。
4. `.ts` 模块扁平为 `.js`；`.vue` 组件保留目录（自动注册按目录名）。
5. 少注释：删参考大段解释性注释，只留有价值的行为注释。
6. 校验：改动后跑 `pnpm build`；单元结束时 `git commit`（一句话）。

---

## 里程碑 0：准备

### Task 0.1：素材与依赖就位

**Files:**
- Create: `src/assets/images/user/avatar.webp`

- [ ] **Step 1: 确认 mitt 已装**

Run: `node -e "console.log(require('./package.json').dependencies.mitt)"`
Expected: 打印版本号（非 undefined）

- [ ] **Step 2: 拷贝头像素材**

Run: `mkdir -p src/assets/images/user && cp "../../FastApiAdmin/frontend/web/src/assets/images/user/avatar.webp" src/assets/images/user/avatar.webp`
Expected: 无报错；`ls src/assets/images/user/` 见 `avatar.webp`

- [ ] **Step 3: 确认 @imgs 别名指向该目录**

Run: `grep -n "'@imgs'" vite.config.js`
Expected: `'@imgs': resolvePath('src/assets/images')`

- [ ] **Step 4: Commit**

```bash
git add src/assets/images/user/avatar.webp package.json pnpm-lock.yaml
git commit -m "chore： A 轮素材与 mitt 依赖"
```

---

## 里程碑 1：utils 与常量地基（叶子依赖先行）

### Task 1.1：路由常量与枚举

**Files:**
- Create: `src/constants/router.js`
- Create: `src/enums/routerEnum.js`

- [ ] **Step 1: 读参考常量**

打开 `FastApiAdmin/frontend/web/src/router/routes.ts` 与 `@utils/constants`，摘出守卫/管道用到的常量：`HOME_PAGE_PATH`、`ROUTE_PATH_LOGIN_ALT`、`ROUTE_COMPONENT_LAYOUT`（值 `Layout`）、公开白名单正则数组、`IframeRouteManager`。

- [ ] **Step 2: 写 `src/enums/routerEnum.js`**（枚举，驼峰成员 + Enum 后缀）

```js
export const RoutePathEnum = {
  LOGIN: "/login",
  HOME: "/home",
  NOT_FOUND: "/404",
  SERVER_ERROR: "/500",
};
```

- [ ] **Step 3: 写 `src/constants/router.js`**（全大写常量）

```js
export const HOME_PAGE_PATH = "/home";
export const ROUTE_PATH_LOGIN_ALT = "/auth/login";
export const ROUTE_COMPONENT_LAYOUT = "Layout";
export const ANONYMOUS_PUBLIC_REGEXPS = [
  /^\/401$/, /^\/403$/, /^\/404$/, /^\/500$/, /^\/redirect/, /^\/login$/,
];

export class IframeRouteManager {
  static #inst;
  static getInstance() { return (IframeRouteManager.#inst ??= new IframeRouteManager()); }
  #routes = new Map();
  save(path, meta) { this.#routes.set(path, meta); sessionStorage.setItem("iframeRoutes", JSON.stringify([...this.#routes])); }
  load() { const raw = sessionStorage.getItem("iframeRoutes"); this.#routes = new Map(raw ? JSON.parse(raw) : []); return this.#routes; }
  get all() { return this.#routes; }
  clear() { this.#routes.clear(); sessionStorage.removeItem("iframeRoutes"); }
}
```

- [ ] **Step 4: Build 门**

Run: `pnpm build`
Expected: `✓ built`，无报错

- [ ] **Step 5: Commit**

```bash
git add src/constants/router.js src/enums/routerEnum.js
git commit -m "feat： 路由常量与枚举"
```

### Task 1.2：utils barrel（mittBus + 菜单/跳转 helper）

**Files:**
- Create: `src/utils/index.js`

- [ ] **Step 1: 移植参考 `@utils` 里的菜单相关 helper**

参考源：`FastApiAdmin/frontend/web/src/utils/index.ts`（及 `@utils/navigation`、`formatMenuTitle`、`handleMenuJump`、`getFirstMenuPath`）。转 JS + fa→qa。

- [ ] **Step 2: 写 `src/utils/index.js`**

```js
import mitt from "mitt";
export const mittBus = mitt();

export function getFirstMenuPath(menuList = []) {
  const walk = (nodes) => {
    for (const n of nodes) {
      if (n.meta?.link) return n.meta.link;
      if (n.children?.length) { const r = walk(n.children); if (r) return r; }
      if (n.path) return n.path;
    }
    return "";
  };
  return walk(menuList);
}

export function formatMenuTitle(route) {
  const t = route?.meta?.title ?? route?.name ?? "";
  return t;
}

export function handleMenuJump(item, router) {
  if (!item) return;
  const path = item.meta?.link || item.path;
  if (!path) return;
  if (/^https?:\/\//.test(path)) { window.open(path, "_blank"); return; }
  router.push(path);
}
```

- [ ] **Step 3: 若参考 helper 更复杂，逐一对齐其真实签名后再落地**

对照参考 `handleMenuJump`/`formatMenuTitle` 的入参（是否收 `AppRouteRecord`、是否带 `i18n`）适配；保持一致性优先。

- [ ] **Step 4: Build 门 + fa 残留检查**

Run: `pnpm build && grep -rInE "(--fa[-.]|\bfa-[a-zA-Z]|\bFa[A-Z]|@fa_|fa_imgs)" src | wc -l`
Expected: built；grep 计数 0

- [ ] **Step 5: Commit**

```bash
git add src/utils/index.js
git commit -m "feat： utils 事件总线与菜单跳转 helper"
```

### Task 1.3：navigation helper（标题 + 标签同步）

**Files:**
- Create: `src/utils/navigation.js`

- [ ] **Step 1: 移植参考 `@utils/navigation`**

转 JS，导出 `setPageTitle(to)`、`setWorktab(to)`（在 worktabStore 就绪前，先实现 `setPageTitle`，`setWorktab` 见 Task 1.4 补 store 依赖）。

- [ ] **Step 2: 写 `src/utils/navigation.js`（setPageTitle 部分）**

```js
import AppConfig from "@/config";

export function setPageTitle(to) {
  const title = to?.meta?.title;
  document.title = title ? `${title} - ${AppConfig.systemInfo.name}` : AppConfig.systemInfo.name;
}
```

- [ ] **Step 3: Build 门**

Run: `pnpm build`
Expected: built

- [ ] **Step 4: Commit**

```bash
git add src/utils/navigation.js
git commit -m "feat： 页面标题同步 helper"
```

### Task 1.4：NProgress（ui.js 增补）

**Files:**
- Modify: `src/utils/ui.js`（在现有 `themeAnimation` 基础上追加）

- [ ] **Step 1: 加 NProgress 单例**

```js
import { NProgress } from "nprogress";
import "nprogress/nprogress.css";
NProgress.configure({ showSpinner: false });
export { NProgress };
```

- [ ] **Step 2: Build 门**

Run: `pnpm build`
Expected: built

- [ ] **Step 3: Commit**

```bash
git add src/utils/ui.js
git commit -m "feat： 路由进度条 NProgress"
```

---

## 里程碑 2：Stores

### Task 2.1：setting.store 扩为全量（回归保护重点）

**Files:**
- Modify: `src/store/modules/setting.store.js`
- Test（手动）: 登录后主题/语言不变、`initializeTheme` 正常

- [ ] **Step 1: 读参考全量 setting.store**

打开 `FastApiAdmin/frontend/web/src/store/modules/setting.store.ts`（484 行），列出全部 state 字段与方法，逐一映射到 JS（去类型、`fa→qa`）。**保留我们已有的** `systemThemeMode`/`isDark`/`switchThemeStyles`/`setThemeColor`/`setElementTheme`/`setLanguage`/`initializeTheme`/`showGuide`/persist `pick`，新增参考独有的布局字段（如 `layout`/`menuType`/`headerBar`/`breadcrumb`/`workTab`/`boxStyle`/`watermarkVisible`/`pageAnimation`/`sideNavWidth`/`isSideNavCollapsed` 等，以参考实际命名为准）。

- [ ] **Step 2: 提供 `updateSetting(key, val)` 统一入口**

```js
function updateSetting(key, val) {
  if (!(key in state) && typeof this[key] !== "function") return;
  this[key] = val;
}
```

- [ ] **Step 3: 扩 persist.pick**

把布局相关字段加入 `persist: { pick: [...] }`（对齐参考持久化项）。

- [ ] **Step 4: 回归：现有登录页/主题调用点不破**

Run: `grep -rn "useSettingStore\|settingStore\." src/views/login src/plugins src/main.js`
逐一确认调用的字段/方法仍存在于扩后的 store。

- [ ] **Step 5: Build 门**

Run: `pnpm build`
Expected: built，无 TS/引用错误

- [ ] **Step 6: Commit**

```bash
git add src/store/modules/setting.store.js
git commit -m "feat： setting store 扩展为全量布局配置"
```

### Task 2.2：menu.store

**Files:**
- Create: `src/store/modules/menu.store.js`

- [ ] **Step 1: 移植参考 menu.store（去 TS、去 `@/types/router` 类型）**

参考：`FastApiAdmin/frontend/web/src/store/modules/menu.store.ts`。保留运行时：`menuList`、`removeRouteFns`、`setMenuList`、`addRemoveRouteFns`、`clearMenu`。其对 `getFirstMenuPath`/`HOME_PAGE_PATH`/`mergeShellRoutesIntoMenu` 的引用改为 `@/utils`(Task 1.2) 与 `@/constants/router`(Task 1.1)；`mergeShellRoutesIntoMenu` 归入 Task 3.2。

```js
import { defineStore } from "pinia";
export const useMenuStore = defineStore("menu", {
  state: () => ({ menuList: [], removeRouteFns: [] }),
  actions: {
    setMenuList(list) { this.menuList = list; },
    addRemoveRouteFns(fns = []) { this.removeRouteFns.push(...fns); },
    clearMenu() { this.removeRouteFns.forEach((fn) => fn?.()); this.removeRouteFns = []; this.menuList = []; },
  },
});
```

- [ ] **Step 2: Build 门 + Commit**

```bash
pnpm build && git add src/store/modules/menu.store.js && git commit -m "feat： 菜单 store"
```

### Task 2.3：worktab.store

**Files:**
- Create: `src/store/modules/worktab.store.js`

- [ ] **Step 1: 移植参考 worktab.store**

参考：`FastApiAdmin/frontend/web/src/store/modules/worktab.store.ts`。转 JS，实现 `list`/`active`、`openTab`/`closeTab`/`closeOthers`/`closeAll`/`setActiveTab`/`validateWorktabs(router)`、`persist`。

- [ ] **Step 2: 补 navigation.setWorktab 真实写入**

在 `src/utils/navigation.js` 增加：

```js
import { useWorktabStore } from "@/store";
export function setWorktab(to) {
  if (!to?.meta?.title) return;
  useWorktabStore().openTab(to);
}
```

- [ ] **Step 3: Build 门 + Commit**

```bash
pnpm build && git add src/store/modules/worktab.store.js src/utils/navigation.js && git commit -m "feat： 多标签 worktab store"
```

### Task 2.4：store 聚合再导出

**Files:**
- Modify: `src/store/index.js`

- [ ] **Step 1: 追加导出**

```js
export { useMenuStore } from "./modules/menu.store";
export { useWorktabStore } from "./modules/worktab.store";
```

- [ ] **Step 2: Build 门 + Commit**

```bash
pnpm build && git add src/store/index.js && git commit -m "feat： store 聚合导出菜单与标签"
```

---

## 里程碑 3：动态路由管道

### Task 3.1：refresh 状态

**Files:**
- Create: `src/router/refresh.js`

- [ ] **Step 1: 移植参考 refresh.ts**

```js
import { reactive } from "vue";
export const refreshState = reactive({
  dynamicRoutesRegistered: false,
  pendingLoading: false,
  routeInitFailed: false,
});
export async function resetRouteState(router) {
  refreshState.dynamicRoutesRegistered = false;
  refreshState.routeInitFailed = false;
  await router.replace({ path: "/redirect" + router.currentRoute.value.fullPath });
}
```

- [ ] **Step 2: Build 门 + Commit**

```bash
pnpm build && git add src/router/refresh.js && git commit -m "feat： 路由刷新状态"
```

### Task 3.2：menu-processor（含 Home 兜底）

**Files:**
- Create: `src/router/menu-processor.js`

- [ ] **Step 1: 移植参考 MenuProcessor.ts**

参考：`FastApiAdmin/frontend/web/src/router/MenuProcessor.ts`。转 JS，提供 `getMenuList()` 与导出 `mergeShellRoutesIntoMenu(menuList)`。菜单来源：`useUserStore().routeList`（后端菜单，登录/刷新已拉）；必要时调菜单接口。

- [ ] **Step 2: 强制空菜单兜底 Home（关键需求）**

```js
const FALLBACK_HOME = [{
  path: "/home", name: "Home", component: "",
  meta: { title: "首页", icon: "ri:home-5-line", keepAlive: true, sort: 1 },
}];
```

`getMenuList()` 内：取到的 `menuList` 为空或抛错 → `return mergeShellRoutesIntoMenu(FALLBACK_HOME)`；非空 → `return mergeShellRoutesIntoMenu(menuList)`（其中确保含 Home，若缺则 unshift）。catch 网络错误不外抛（返回兜底），避免守卫误判 500。

- [ ] **Step 3: Build 门 + Commit**

```bash
pnpm build && git add src/router/menu-processor.js && git commit -m "feat： 菜单处理器与 Home 兜底"
```

### Task 3.3：route-loader（RouteRegistry）

**Files:**
- Create: `src/router/route-loader.js`

- [ ] **Step 1: 移植参考 route-loader.ts**

参考：`FastApiAdmin/frontend/web/src/router/route-loader.ts`。转 JS。核心：
- `const viewModules = import.meta.glob("/src/views/**/*.vue")`；`load(componentStr)` 依据后端 `component` 字符串（如 `system/user/index` 或 `/module_system/user/index`）解析成 glob key，命中则 `() => viewModules[key]()`，未命中 warn + 回落。
- `class RouteRegistry { constructor(router); register(menuList); getRemoveRouteFns() }`：递归 `addRoute`，目录节点 `component` 置空并递归 children，叶子挂组件，Layout/iframe/link 特判（对齐参考的 `ROUTE_COMPONENT_LAYOUT`、缺组件告警、目录不挂组件告警）。

- [ ] **Step 2: 对齐我们的目录结构**

我们 views 为 `src/views/login/index.vue`、`src/views/home/index.vue`。确认后端 `component` 约定能映射到 `/src/views/<path>/index.vue`；映射函数与参考一致，必要时加前缀补全 `src/views/` 与 `/index.vue` 兜底。

- [ ] **Step 3: Build 门 + Commit**

```bash
pnpm build && git add src/router/route-loader.js && git commit -m "feat： 动态路由注册器"
```

### Task 3.4：routes.js 补壳层与异常页

**Files:**
- Modify: `src/router/routes.js`

- [ ] **Step 1: 保持静态 login + Layout(Home 子)**

现有保留；Home 仍指向 `@views/home/index.vue`。

- [ ] **Step 2: 补异常页 + redirect + CatchAll404（静态壳层，无后端也能跑）**

```js
{ path: "/401", component: () => import("@views/exception/401/index.vue"), meta: { title: "401", public: true } },
{ path: "/403", component: () => import("@views/exception/403/index.vue"), meta: { title: "403", public: true } },
{ path: "/404", component: () => import("@views/exception/404/index.vue"), meta: { title: "404", public: true } },
{ path: "/500", component: () => import("@views/exception/500/index.vue"), meta: { title: "500", public: true } },
{ path: "/redirect/:path(.*)", component: () => import("@views/redirect/index.vue") },
{ path: "/:pathMatch(.*)*", name: "CatchAll404", redirect: "/404" },
```

- [ ] **Step 3: 需要时补建 exception/redirect 视图（从参考移植去 TS）**

若我们无这些视图：从 `FastApiAdmin/.../views/exception/*` 与 `views/redirect/index.vue` 移植到 `src/views/exception/{401,403,404,500}/index.vue` 与 `src/views/redirect/index.vue`，转 JS + fa→qa。

- [ ] **Step 4: 从 `@/constants/router` 复用常量，避免 routes 与守卫重复定义**

`routes.js` 导出 `HOME_PAGE_PATH`（re-export 自 constants）以兼容既有 `import { HOME_PAGE_PATH } from "@/router/routes"`。

- [ ] **Step 5: Build 门 + Commit**

```bash
pnpm build && git add src/router/routes.js src/views/exception src/views/redirect && git commit -m "feat： 静态壳层路由与异常页"
```

### Task 3.5：guards 升级 + 接线

**Files:**
- Modify: `src/router/guards.js`
- Modify: `src/router/index.js`

- [ ] **Step 1: 移植参考 guards.ts 全逻辑**

参考：`FastApiAdmin/frontend/web/src/router/guards.ts`（本计划上下文已含其 331 行）。转 JS，`setupBeforeEachGuard`/`setupAfterEachGuard`/`RoutePermissionValidator`。依赖映射：`Auth`→`@/utils/auth`；`isHttpError/ApiStatus`→`@/utils/request`（若无 `isHttpError` 则在 request.js 补导出）；`NProgress`→`@/utils/ui`；`setPageTitle/setWorktab`→`@/utils/navigation`；`getMainScrollEl`→`@/hooks/core/useCommon`（Task 3.6）；`MenuProcessor`→`./menu-processor`；`RouteRegistry`→`./route-loader`；`refreshState`→`./refresh`；`IframeRouteManager/ROUTE_PATH_LOGIN_ALT`→`@/constants/router`；`useMenuStore/useWorktabStore/useUserStore`→`@/store`。

- [ ] **Step 2: 白名单复用常量**

`isAnonymousPublicPath` 用 `ANONYMOUS_PUBLIC_REGEXPS`（`@/constants/router`）。

- [ ] **Step 3: 在 router 创建处挂守卫**

`src/router/index.js`：`createRouter(...)` 后立即 `setupBeforeEachGuard(router); setupAfterEachGuard(router);`（保持 `initRouter` 顺序：store 之后）。

- [ ] **Step 4: Build 门 + dev 冒烟**

Run: `pnpm build`
Expected: built

- [ ] **Step 5: Commit**

```bash
git add src/router/guards.js src/router/index.js
git commit -m "feat： 动态路由与权限守卫"
```

### Task 3.6：useCommon hook

**Files:**
- Create: `src/hooks/core/useCommon.js`

- [ ] **Step 1: 移植参考 useCommon**

参考：`FastApiAdmin/frontend/web/src/hooks/core/useCommon.ts`。转 JS，导出 `getMainScrollEl()`（定位 `#app-content` 内滚动容器）等守卫/外壳用到的方法。

- [ ] **Step 2: Build 门 + Commit**

```bash
pnpm build && git add src/hooks/core/useCommon.js && git commit -m "feat： 布局通用 hook"
```

---

## 里程碑 4：外壳组件（layouts/，逐个移植）

> 每个组件任务统一含：Step1 读参考并转 JS+fa→qa 落地；Step2 `pnpm build`；Step3 curl/dev 解析核验（见里程碑 5）；Step4 commit。此处列要点与依赖，代码以"忠实移植参考源 + 适配命名/别名/去类型"为准。

### Task 4.1：qa-page-content

**Files:** Create `src/layouts/qa-page-content/index.vue`
- 源 `layouts/fa-page-content/index.vue` → `QaPageContent`。含 `RouterView`+过渡+滚动容器，`keep-alive` 依 `settingStore`。
- Commit: `git commit -m "feat： 页面内容区组件"`

### Task 4.2：qa-sidebar-menu（+ 子菜单）

**Files:** Create `src/layouts/qa-menus/qa-sidebar-menu/index.vue`、`.../widgets/QaSidebarSubmenu.vue`
- 源 `layouts/fa-menus/fa-sidebar-menu/*` → `QaSidebarMenu`/`QaSidebarSubmenu`。递归渲染 `menuStore.menuList`，图标 `QaSvgIcon`/element 图标，折叠态依 `settingStore`。el-menu 或自绘依参考实现照搬。
- 依赖 `formatMenuTitle`（`@/utils`）、`handleMenuJump`。
- Commit: `git commit -m "feat： 侧栏菜单组件"`

### Task 4.3：qa-header-bar（+ 用户菜单）

**Files:** Create `src/layouts/qa-header-bar/index.vue`、`.../widgets/QaUserMenu.vue`
- 源 `layouts/fa-header-bar/*` → `QaHeaderBar`/`QaUserMenu`。
- **本轮裁剪**：横向/混合菜单切换入口隐藏（D 轮开）；全局搜索/通知/锁屏/礼花相关按钮与其事件先移除或占位（C 轮）；保留折叠按钮、面包屑插槽、主题/语言/全屏/用户下拉。
- 头像 `@imgs/user/avatar.webp`；退出登录接 `Auth`/`userStore.logout`。
- Commit: `git commit -m "feat： 顶栏与用户菜单组件"`

### Task 4.4：qa-breadcrumb

**Files:** Create `src/layouts/qa-breadcrumb/index.vue`
- 源 `layouts/fa-breadcrumb/index.vue` → `QaBreadcrumb`。基于 `route.matched` + `formatMenuTitle`。
- Commit: `git commit -m "feat： 面包屑组件"`

### Task 4.5：qa-work-tab

**Files:** Create `src/layouts/qa-work-tab/index.vue`
- 源 `layouts/fa-work-tab/index.vue` → `QaWorkTab`。数据源 `worktabStore`；右键菜单（关闭/其他/全部）、中键关闭、滚轮横向；拖拽排序若依赖 `vuedraggable` 等未装依赖 → 先不启用并报告（属"别的东西"）。
- Commit: `git commit -m "feat： 多标签栏组件"`

### Task 4.6：qa-global-component

**Files:** Create `src/layouts/qa-global-component/index.vue`
- 源 `layouts/fa-global-component/index.vue` → `QaGlobalComponent`。本轮精简为跨页浮层挂载占位（搜索/通知/锁屏/礼花在 C 轮接入）。
- Commit: `git commit -m "feat： 全局浮层组件占位"`

### Task 4.7：qa-fast-enter

**Files:** Create `src/layouts/qa-fast-enter/index.vue`
- 源 `layouts/fa-fast-enter/index.vue` → `QaFastEnter`。若强依赖业务页/外链配置，简化为不引业务页的快捷入口展示；缺资源先占位。
- Commit: `git commit -m "feat： 快捷入口组件"`

### Task 4.8：AppLayout 根

**Files:** Modify `src/layouts/index.vue`
- 移植参考 `layouts/index.vue` → `Qa*` 标签；`QaWatermark`/`QaGuide`/`QaAiAssistant` 三处 `v-if` 关闭（本轮不实现，`enableAiAssistant`/`guideVisible` 保持 false）。
- 结构：`#app-sidebar`(QaSidebarMenu)/`#app-main`(`#app-header` QaHeaderBar + `#app-content` QaPageContent)/`#app-global`(QaGlobalComponent)。
- 依赖 `useSettingStore/useAppStore/useUserStore`、`AppConfig`。
- Commit: `git commit -m "feat： 布局根组件"`

---

## 里程碑 5：样式/装配/接线

### Task 5.1：布局外壳样式

**Files:** Create `src/styles/pages/_layout.scss`；Modify `src/main.js`
- 移植参考布局样式（`#app-sidebar`/`#app-main`/`#app-header`/`#app-content`/`#app-global` 尺寸、暗色、菜单/顶栏/标签样式）。若参考样式散落在 `styles/` 或各组件 `<style>`，以组件自带样式优先，全局骨架样式放 `_layout.scss`。`fa→qa`。
- `main.js` 追加 `import "@/styles/pages/_layout.scss";`（按序，与其它样式并列）。
- Build 门：`pnpm build`。
- Commit: `git commit -m "feat： 布局外壳样式"`

### Task 5.2：i18n 文案补齐

**Files:** Modify `src/locales.js`
- 从参考语言包 `FastApiAdmin/frontend/web/src/locales/langs/{zh,en}.json` 摘 `menus`/`header`/`workTab`/相关 `settings`（本轮外壳用到的）key 并入 zh+en；只加外壳实际引用项，不铺全量。
- Build 门：`pnpm build`。
- Commit: `git commit -m "feat： 布局相关 i18n 文案"`

### Task 5.3：装配链核对

**Files:** Modify `src/plugins/index.js`（如需）
- 确认顺序 `initStore → initTheme → initRouter(内含 setupRouterGuards) → initI18n → setupDirectives`；store 最先（守卫依赖）。
- 若守卫在 `router/index.js` 建实例时挂，`plugins` 无需改；核对不重复挂载。
- Commit: `git commit -m "chore： 布局装配链核对"`

---

## 里程碑 6：整体验证（后端不可用兜底路径）

### Task 6.1：编译与自动导入解析

- [ ] Step 1: `pnpm build` → `✓ built`，无未解析、无报错；模块数较基线增加。
- [ ] Step 2: `pnpm dev`（记下端口，如 5175）。
- [ ] Step 3: 抓 dev 转换模块核验外壳组件自动导入：
  ```bash
  curl -s "http://localhost:5175/src/layouts/index.vue" | grep -oE "import .*qa-[a-z-]+/index.vue" | sort -u
  ```
  Expected: 见 QaPageContent/QaSidebarMenu/QaHeaderBar/QaBreadcrumb/QaWorkTab/QaGlobalComponent/QaFastEnter 的注入 import。

### Task 6.2：浏览器渲染核验

- [ ] Step 1: 打开 `http://localhost:<port>/#/login`，走登录（后端不可用时按既有兜底），或直接访问 `/#/home` 触发守卫。
- [ ] Step 2: 核验：进入后台渲染出 **侧栏(含 Home)/顶栏/面包屑/多标签/内容区**；`#/home` 显示 Home 页；控制台无 "Failed to resolve component" 报错；无整块空白。
- [ ] Step 3: 顶栏主题/语言切换、折叠侧栏可用；点 Home 菜单跳转正常、标签同步。
- [ ] Step 4: 截图留档（验证后删除，勿入库）。

### Task 6.3：fa→qa 残留校验

- [ ] Step 1:
  ```bash
  grep -rInE "(--fa[-.]|\bfa-[a-zA-Z]|\bFa[A-Z]|@fa_|fa_imgs|_fa-)" src vite.config.js | wc -l
  ```
  Expected: 0

### Task 6.4：回归 + A 轮收口

- [ ] Step 1: 复跑登录：登录页/滑块/主题/语言无回归。
- [ ] Step 2: `git status` 干净、提交成体系。
- [ ] Step 3: 向用户汇报 A 轮完成 + 展示浏览器结论，等用户确认后再进入下一轮（B）。

---

## 已知开放点（执行时如遇需先报告，属"别的东西"）
- `qa-work-tab` 拖拽排序若依赖 `vuedraggable`/`sortablejs` 未装 → 先不启用并报告。
- `route-loader` 的 `component` 字符串↔glob key 映射，若后端约定与参考不同 → 停下与你确认。
- `setting.store` 全量字段若与参考命名冲突我们的登录子集 → 以登录页调用点为准做适配并报告。
