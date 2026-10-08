# A 轮设计：布局地基 + 动态路由 + 核心外壳

## 概述

把参考项目 FastApiAdmin 的后台「布局外壳 + 后端动态路由」这套地基，以 1:1 表现形式移植进 quick-admin 前端工程（`frontend/web`），全程 JavaScript（去 TS 类型）、全程 `fa → qa` 命名域。本轮目标是让登录进入后台后，能渲染出与参考一致的框架：竖排侧栏菜单 + 顶栏(面包屑/用户菜单) + 多标签 work-tab + 内容区，并接通"后端菜单 → 动态路由 → 权限守卫"的管道；后端不可用时以默认 Home 兜底，外壳仍可渲染、可验证。

后续 B/C/D 轮（设置面板 / 增强小部件 / 横向·混合菜单）各自独立走 spec→plan→实现，本轮不做。

## 决策基线（用户已确认）

- 范围档位：全量对齐参考（拆成 A/B/C/D 四轮，本轮 A）。
- 菜单数据源：方案 B（后端动态路由），但菜单**不为空**——空/失败时兜底注入默认 Home。
- `index.vue` 中的水印 `QaWatermark` / 新手引导 `QaGuide` / AI 助手 `QaAiAssistant`：本轮先 `v-if` 关闭（占位、不留白、不拖入子系统），后续轮再议。
- 顶栏的「菜单模式切换（横向/混合）」入口：本轮隐藏，等 D 轮开放；本轮仅竖排。
- 允许新增依赖 `mitt`（已 `pnpm add`）。
- 分轮提交：每轮实现 + 验证 + 用户确认后 commit，再进下一轮。
- 持续约束：JS 不引 TS；pnpm；命令在 `frontend/web/`；少注释；枚举进 `src/enums`、常量进 `src/constants`；参考 `xxx/index.ts` 扁平为 `xxx.js`，`.vue` 组件保留目录结构；所有 `fa` 前缀（组件名/目录/CSS 变量/类名/别名/文件名）改 `qa`。

## 交付物清单（fa→qa 映射）

### 新增/改造 Store
- `src/store/modules/setting.store.js`：由「登录子集」扩为完整版（对齐参考 484 行的字段/方法）。新增约 50 项布局/主题/盒子/菜单开关字段 + `updateSetting(key, val)` 统一入口 + 保留既有 `switchThemeStyles`/`setThemeColor`/`setElementTheme`/`setLanguage`/`initializeTheme`/`isDark`/`systemThemeMode`。**向后兼容：登录页与主题初始化不得破坏。**
- `src/store/modules/menu.store.js`：`menuList`、`setMenuList(list)`、`removeRouteFns`、`addRemoveRouteFns(fns)`、`clearMenu()`。
- `src/store/modules/worktab.store.js`：标签 `list`/`active`，`openTab`/`closeTab`/`closeOthers`/`closeAll`/`setActiveTab`/`validateWorktabs(router)`，`persist`。
- `src/store/index.js`：再导出 `useMenuStore`、`useWorktabStore`。

### 动态路由管道（router/，.ts→.js 扁平）
- `src/router/menu-processor.js`：`MenuProcessor.getMenuList()` —— 取后端菜单（经 `userStore` routeList / 菜单接口），处理壳层合并（`mergeShellRoutesIntoMenu`），**空/异常兜底注入 Home**（`{ path:"/home", name:"Home", meta:{title,icon}, component:"" }` 形态）。
- `src/router/route-loader.js`：`RouteRegistry` —— `import.meta.glob("@views/**/*.vue")` 把后端 `component` 字符串→懒加载组件；`register(menuList)` 走 `router.addRoute`，`getRemoveRouteFns()`；处理 Layout/iframe/link 节点与"目录不挂组件"告警。
- `src/router/refresh.js`：`refreshState`（`dynamicRoutesRegistered`/`pendingLoading`/`routeInitFailed`）。
- `src/router/guards.js`：升级现有最小守卫 → `setupBeforeEachGuard` + `setupAfterEachGuard`：登录校验（`Auth.isLoggedIn`）、公开白名单（`/login` `/401/403/404/500` `/redirect`）、已登录访问 login 回落首页、动态路由注册、`RoutePermissionValidator`（壳层段 `home/dashboard/fastlink` 放行 + 递归匹配 + 动态参数匹配，无权回落 `HOME_PAGE_PATH`）、`NProgress`、afterEach 同步 `setWorktab`/`setPageTitle`/滚动复位。
- `src/router/routes.js`：保留静态 login + Layout(Home 子) + 异常页/redirect 壳层 + `CatchAll404`；导出 `HOME_PAGE_PATH`、`ROUTE_PATH_LOGIN_ALT`、`IframeRouteManager`、`ROUTE_COMPONENT_LAYOUT` 等常量（参考在 `routes.ts`，我们按 JS 组织）。

### 外壳组件（layouts/，.vue 保留目录）
- `src/layouts/index.vue`（`AppLayout`）：三区域结构（`#app-sidebar`/`#app-main`〔`#app-header`+`#app-content`〕/`#app-global`）；水印/引导/AI 三处 `v-if` 关闭。
- `src/layouts/qa-page-content/index.vue`（`QaPageContent`）：`RouterView` + 过渡 + 滚动容器（`keep-alive` 依 setting）。
- `src/layouts/qa-menus/qa-sidebar-menu/index.vue`（`QaSidebarMenu`）+ `widgets/QaSidebarSubmenu.vue`：递归侧栏菜单，数据源 `menuStore.menuList`，图标/标题/折叠，收起态。
- `src/layouts/qa-header-bar/index.vue`（`QaHeaderBar`）+ `widgets/QaUserMenu.vue`：折叠按钮、面包屑挂载、右侧动作区（主题/语言/全屏/用户下拉；菜单模式入口隐藏）；头像用 `@imgs/user/avatar.webp` 占位。
- `src/layouts/qa-breadcrumb/index.vue`（`QaBreadcrumb`）：基于当前路由 matched + `formatMenuTitle`。
- `src/layouts/qa-work-tab/index.vue`（`QaWorkTab`）：多标签栏（右键关闭/关闭其他/全部、滚轮、拖拽可选简）；数据源 `worktabStore`。
- `src/layouts/qa-global-component/index.vue`（`QaGlobalComponent`）：跨页浮层挂载点（本轮仅占位/精简，不放搜索/通知/锁屏/礼花）。
- `src/layouts/qa-fast-enter/index.vue`（`QaFastEnter`）：快捷入口面板（可依赖现有素材，不引业务页）。

### utils 辅助层
- `src/utils/index.js`（barrel，若不存在则新建）：导出 `mittBus`（`import mitt from "mitt"` 单例）、`getFirstMenuPath`、`formatMenuTitle`、`handleMenuJump`。
- `src/utils/navigation.js`：`setPageTitle(to)`、`setWorktab(to)`（写 `worktabStore`、更新 `document.title`）。
- `src/utils/ui.js`：在现有 `themeAnimation` 基础上增补 `NProgress`（`import NProgress from "nprogress"` + 样式引入）。
- `src/utils/constants.js`（如参考 `@utils/constants` 所需路由/枚举常量）：写入 `@/constants` 或 `@/enums` 视内容而定（遵循枚举/常量目录规范）。

### 资源
- `src/assets/images/user/avatar.webp`（cp 自参考，供 `QaUserMenu` 占位）。

### 依赖
- 新增 `mitt`（已装）。其余 `crypto-js`/`@vueuse/core`/`element-plus`/`@element-plus/icons-vue`/`nprogress`/`@iconify/vue` 均已装。

## 数据流

1. 登录成功：`userStore` 已持有 token + `basicInfo` + `routeList`。
2. 进入受保护路由：`guards.beforeEach`。
3. `MenuProcessor.getMenuList()`：后端菜单 →（失败/空）→ 兜底 Home。
4. `menuStore.setMenuList(menuList)` 供侧栏/面包屑渲染。
5. `RouteRegistry.register(menuList)`：`addRoute` + 存 `removeRouteFns` 到 `menuStore`。
6. `worktabStore.validateWorktabs(router)` 清理失效标签；保存 iframe 路由。
7. `RoutePermissionValidator.validatePath`：无权 → 回落 `HOME_PAGE_PATH`。
8. `afterEach`：同步标签、标题、`NProgress.done`、滚动复位。

## 错误处理与兜底

- 后端不可用/菜单接口失败：`getMenuList` 返回 `[Home]`，守卫不置 `routeInitFailed`（认证类 HttpError → `/login`；其它初始化异常 → `/500`）。
- localStorage 异常：`checkStorageHealth` → 降级 `userStore.$reset()` 并回登录。
- 动态注册期间避免 404：`pendingLoading` 时先跳首页；注册后命中 CatchAll404 的原始导航 `replace` 重新解析。

## 命名与规范落地

- `fa→qa`：目录（`fa-*`→`qa-*`）、组件名（`Fa*`→`Qa*` 含 `defineOptions`/标签/自动注册）、CSS 变量 `--fa-*`→`--qa-*`、类名 `.fa-*`→`.qa-*`、别名 `@fa_imgs`→`@qa_imgs`。校验：`grep -rInE "(--fa[-.]|\bfa-[a-zA-Z]|\bFa[A-Z]|@fa_|fa_imgs)" src` 为 0。
- 去 TS：删 `interface`/类型标注/泛型/`as`/`readonly`；`AppRouteRecord` 等类型以运行时对象结构 + JSDoc（少量）替代。
- store 命名对齐：参考 `useSettingsStore` → 我们 `useSettingStore`；`@stores`→`@/store`；`@utils`→`@utils`(已存在)；`@imgs`→`src/assets/images`(已存在)。

## 验收标准

1. `pnpm build` 通过（模块数增加但无报错，无未解析组件）。
2. `pnpm dev` 起无编译错。
3. curl 抓取 dev 转换模块确认全部 `Qa*` 外壳/子组件被自动导入解析。
4. 浏览器验证（后端不可用场景）：登录 → 进入后台 → 渲染出侧栏(含 Home)/顶栏/面包屑/标签栏/内容区，无空白、无 "resolve component" 告警；主题/语言切换可用。
5. 后端可用场景（若可）：菜单/路由来自接口，点击菜单跳转正常，标签同步。
6. 回归：登录页与主题不受 `setting.store` 扩字段影响。
7. 按 fa→qa 校验 grep 为 0。

## 范围边界（本轮明确不做）

- 设置面板抽屉及其全部 widgets/composables（B）。
- 全局搜索、通知中心、锁屏、礼花特效及其图片素材（C）。
- 横向菜单、混合菜单两种布局模式（D）。
- 水印、新手引导、AI 助手（`v-if` 关闭，占位）。

## 风险

- `setting.store` 扩全量是最大回归面：需逐条比对、保持既有方法签名与登录页调用点不变。
- 动态路由 `import.meta.glob` 的 key 与后端 `component` 字符串路径映射规则需与我们的 `@views` 目录一致。
- 参考守卫依赖 `@utils/*` barrel 的多个 helper，需一并移植且避免循环 import（运行时调用层面安全）。
