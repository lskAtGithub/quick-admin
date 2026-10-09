/**
 * 路由守卫
 *
 * - beforeEach：登录校验、动态路由加载、权限检查、404 回落
 * - afterEach：标签栏同步、页面标题、滚动复位、NProgress 关闭
 */
import { ref } from 'vue';
import { useUserStore, useMenuStore, useWorktabStore, useSettingStore } from '@/store';
import { IframeRouteManager, ROUTE_PATH_LOGIN_ALT, HOME_PAGE_PATH, ROUTE_PATH_LOGIN } from '@/constants/router';
import { STATIC_MENU_LIST } from '@/constants/menu';
import { setPageTitle, setWorktab } from '@/utils/navigation';
import { MenuProcessor } from './menu-processor';
import { NProgress } from '@/utils/ui';
import { Auth } from '@/utils/auth';
import { isHttpError, ApiStatus } from '@/utils/request';
import { refreshState } from './refresh';
import { getMainScrollEl } from '@/hooks/core/useCommon';

const globalLoading = ref(false);

// 守卫运行期持有的 router 实例（setupRouterGuards 注入，避免与 index.js 循环依赖）
let router = null;

const ANONYMOUS_PUBLIC_REGEXPS = [/^\/401$/, /^\/403$/, /^\/404$/, /^\/500$/, /^\/redirect/, /^\/login$/, /^\/auth\/login$/];

function isAnonymousPublicPath(to) {
  if (to.matched.some((r) => r.meta?.public)) return true;
  return ANONYMOUS_PUBLIC_REGEXPS.some((regexp) => regexp.test(to.path));
}

function isLoginRoute(to) {
  return to.path === ROUTE_PATH_LOGIN || to.path === ROUTE_PATH_LOGIN_ALT;
}

// ──────── 前置守卫 ────────

function setupBeforeEachGuard(routerInstance) {
  routerInstance.beforeEach(async (to) => {
    if (globalLoading.value) globalLoading.value = false;
    if (useSettingStore().showNprogress) NProgress.start();

    // 免鉴权开发态：若菜单尚未被后端列表覆盖，则填充默认静态菜单，保证侧边栏有“首页”。
    if (useMenuStore().menuList.length === 0) {
      useMenuStore().setMenuList(STATIC_MENU_LIST);
    }

    // 暂时跳过鉴权：未登录也直接放行到目标路由（默认回落到 /home）
    // if (checkStorageHealth()) {
    //   await handleStorageFailure();
    //   return ROUTE_PATH_LOGIN;
    // }

    // if (!(await handleLoginStatus(to))) {
    //   return isLoginRoute(to) ? true : ROUTE_PATH_LOGIN;
    // }

    // if (refreshState.routeInitFailed && !isAnonymousPublicPath(to)) {
    //   return '/500';
    // }

    // if (!refreshState.dynamicRoutesRegistered && !isAnonymousPublicPath(to)) {
    //   if (refreshState.pendingLoading) {
    //     return { path: HOME_PAGE_PATH, replace: true };
    //   }
    //   const redirect = await handleDynamicRoutes(to);
    //   if (redirect) return redirect;
    //   refreshState.dynamicRoutesRegistered = true;

    //   if (to.matched.some((r) => r.name === 'CatchAll404')) {
    //     return { path: to.path, replace: true };
    //   }
    // }

    if (to.path === '/') {
      return { path: HOME_PAGE_PATH, replace: true };
    }
  });
}

async function handleLoginStatus(to) {
  const isLoggedIn = Auth.isLoggedIn();

  if (isLoggedIn) {
    if (isLoginRoute(to)) {
      await router.push({ path: HOME_PAGE_PATH, replace: true });
      return false;
    }
    return true;
  }

  if (isAnonymousPublicPath(to)) {
    return true;
  }

  return false;
}

async function handleDynamicRoutes(to) {
  if (refreshState.pendingLoading) return;
  refreshState.pendingLoading = true;

  try {
    repairDynamicRoutesIfMenuEmpty();

    const userStore = useUserStore();
    if (!userStore.info?.username || userStore.routeList.length === 0) {
      await userStore.getUserInfo();
    }

    const menuProcessor = new MenuProcessor();
    const menuList = await menuProcessor.getMenuList();

    useMenuStore().setMenuList(menuList);

    const { RouteRegistry } = await import('./route-loader');
    const routeRegistry = new RouteRegistry(router);
    routeRegistry.register(menuList);

    useMenuStore().addRemoveRouteFns(routeRegistry.getRemoveRouteFns());

    useWorktabStore().validateWorktabs(router);

    IframeRouteManager.getInstance().save();

    const { path: safePath, hasPermission } = RoutePermissionValidator.validatePath(to.path, menuList, HOME_PAGE_PATH);

    if (!hasPermission) {
      console.warn(`[路由守卫] 无权限访问: ${to.path}，重定向至首页`);
    }

    if (safePath !== to.path) {
      return { path: safePath, replace: true };
    }

    return undefined;
  } catch (error) {
    console.error('[路由守卫] 路由初始化失败:', error);
    if (isHttpError(error) && [ApiStatus.unauthorized, ApiStatus.forbidden].includes(error.code)) {
      refreshState.dynamicRoutesRegistered = false;
      return ROUTE_PATH_LOGIN;
    }
    refreshState.routeInitFailed = true;
    return '/500';
  } finally {
    refreshState.pendingLoading = false;
  }
}

function repairDynamicRoutesIfMenuEmpty() {
  const menuStore = useMenuStore();
  const removeRouteFns = menuStore.removeRouteFns;
  if (menuStore.menuList.length === 0 && removeRouteFns.length > 0) {
    console.warn('[路由守卫] 检测到菜单为空但路由已注册，尝试恢复状态');
  }
}

function checkStorageHealth() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return false;
  } catch {
    return true;
  }
}

async function handleStorageFailure() {
  const userStore = useUserStore();
  userStore.resetAllState();
  IframeRouteManager.getInstance().clear();
}

// ──────── 权限校验 ────────

export class RoutePermissionValidator {
  static SHELL_SEGMENTS = new Set(['home', 'profile', 'changelog', 'dashboard', 'system']);

  static hasPermission(targetPath, menuList) {
    if (targetPath === '/') return true;
    if (this.isShellPath(targetPath)) return true;
    return this.matchRoute(targetPath, menuList);
  }

  static isShellPath(targetPath) {
    const firstSegment = targetPath.split('/').filter(Boolean)[0] ?? '';
    return this.SHELL_SEGMENTS.has(firstSegment);
  }

  static matchRoute(targetPath, routes) {
    if (!Array.isArray(routes) || routes.length === 0) return false;
    for (const route of routes) {
      if (!route.path) continue;
      const routePath = route.path.startsWith('/') ? route.path : `/${route.path}`;
      if (routePath === targetPath || this.isDynamicRouteMatch(targetPath, routePath) || targetPath.startsWith(`${routePath}/`)) return true;
      if (route.children?.length && this.matchRoute(targetPath, route.children)) return true;
    }
    return false;
  }

  static isDynamicRouteMatch(targetPath, routePath) {
    if (!routePath.includes(':')) return false;
    const pattern = routePath
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/:([^/]+)/g, '[^/]+')
      .replace(/\\\*/g, '.*');
    return new RegExp(`^${pattern}$`).test(targetPath);
  }

  static validatePath(targetPath, menuList, homePath = '/') {
    const hasPermission = this.hasPermission(targetPath, menuList);
    return hasPermission ? { path: targetPath, hasPermission: true } : { path: homePath, hasPermission: false };
  }
}

// ──────── 后置守卫 ────────

function setupAfterEachGuard(routerInstance) {
  routerInstance.afterEach((to) => {
    setWorktab(to);
    setPageTitle(to);
    getMainScrollEl()?.scrollTo(0, 0);
    window.scrollTo(0, 0);
    NProgress.done();
    if (globalLoading.value) globalLoading.value = false;
  });
}

export function setupRouterGuards(routerInstance) {
  router = routerInstance;
  setupBeforeEachGuard(routerInstance);
  setupAfterEachGuard(routerInstance);
}
