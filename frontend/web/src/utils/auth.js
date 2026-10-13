import { ElMessage, ElMessageBox } from "element-plus";
import { router } from "@/router";
import { useUserStore } from "@/store";

const AUTH_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  REMEMBER_ME: "remember_me",
};

export class Auth {
  static isLoggedIn() {
    return !!Auth.getAccessToken();
  }

  static getAccessToken() {
    const isRememberMe = Auth.getRememberMe();
    return isRememberMe
      ? localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN) || ""
      : sessionStorage.getItem(AUTH_KEYS.ACCESS_TOKEN) || "";
  }

  static getRefreshToken() {
    const isRememberMe = Auth.getRememberMe();
    return isRememberMe
      ? localStorage.getItem(AUTH_KEYS.REFRESH_TOKEN) || ""
      : sessionStorage.getItem(AUTH_KEYS.REFRESH_TOKEN) || "";
  }

  static setTokens(accessToken, refreshToken, rememberMe) {
    localStorage.setItem(AUTH_KEYS.REMEMBER_ME, String(rememberMe));

    if (rememberMe) {
      localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
    } else {
      sessionStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, accessToken);
      sessionStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
    }
  }

  static clearAuth() {
    localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
  }

  static getRememberMe() {
    return localStorage.getItem(AUTH_KEYS.REMEMBER_ME) === "true";
  }
}

export { AUTH_KEYS };

let redirectToLoginInFlight = null;

export async function redirectToLogin(message = "请重新登录") {
  if (redirectToLoginInFlight) return redirectToLoginInFlight;

  redirectToLoginInFlight = (async () => {
    try {
      await ElMessageBox.alert(message, "提示", {
        confirmButtonText: "确认",
        type: "warning",
      });
    } catch {
      // 用户关闭弹窗同样视为已确认
    }

    try {
      // 同步重置 store 内存状态，避免登录页误判“已登录”而回跳
      useUserStore().resetAllState();

      const currentPath = router.currentRoute.value.fullPath;
      await router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } catch (error) {
      ElMessage.error(error?.message ?? String(error));
    } finally {
      redirectToLoginInFlight = null;
    }
  })();

  return redirectToLoginInFlight;
}

export function startOAuthLogin(provider) {
  const base = (import.meta.env.VITE_APP_BASE_API || "/api/v1").replace(/\/$/, "");
  const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const redirectUri = `${window.location.origin}${basePath}/login`;
  const url = `${base}/system/auth/oauth/${provider}/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
  window.location.href = url;
}
