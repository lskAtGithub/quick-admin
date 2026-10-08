import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useUserStore } from "@/store";
import { Auth } from "@/utils/auth";
import { LOGIN_PAGE_PATH } from "@/constants/login";

NProgress.configure({ showSpinner: false });

const PUBLIC_PATH_PATTERNS = [/^\/login$/, /^\/40\d$/, /^\/500$/, /^\/redirect/];

function isPublicRoute(to) {
  return to.matched.some((r) => r.meta?.public) || PUBLIC_PATH_PATTERNS.some((re) => re.test(to.path));
}

export function setupRouterGuards(router) {
  router.beforeEach(async (to) => {
    NProgress.start();

    const userStore = useUserStore();
    const token = Auth.getAccessToken();

    if (!token) {
      if (isPublicRoute(to)) return true;
      return {
        path: LOGIN_PAGE_PATH,
        query: to.fullPath !== "/" ? { redirect: to.fullPath } : undefined,
        replace: true,
      };
    }

    if (to.path === LOGIN_PAGE_PATH) {
      return { path: "/", replace: true };
    }

    if (!userStore.hasGetRoute) {
      try {
        await userStore.getUserInfo();
        userStore.setLoginStatus(true);
      } catch {
        userStore.resetAllState();
        return { path: LOGIN_PAGE_PATH, query: { redirect: to.fullPath }, replace: true };
      }
    }

    return true;
  });

  router.afterEach((to) => {
    if (to.meta?.title) document.title = to.meta.title;
    NProgress.done();
  });
}
