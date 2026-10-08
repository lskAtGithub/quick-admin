import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ElNotification } from "element-plus";
import { Auth, redirectToLogin } from "@/utils/auth";
import { ResultEnum } from "@/utils/request";
import AuthAPI from "@/api/module_system/auth";
import UserAPI from "@/api/module_system/user";

export const useUserStore = defineStore(
  "user",
  () => {
    const info = ref({});
    const accessToken = ref("");
    const refreshToken = ref("");
    const isLogin = ref(false);
    const prems = ref([]);
    const routeList = ref([]);
    const hasGetRoute = ref(false);
    const rememberMe = ref(Auth.getRememberMe());
    const language = ref("zh");

    const basicInfo = computed(() => info.value);

    function setUserInfo(newInfo) {
      info.value = newInfo;
    }

    function setLoginStatus(status) {
      isLogin.value = status;
    }

    function setLanguage(lang) {
      language.value = lang;
    }

    function setToken(newAccessToken, newRefreshToken) {
      accessToken.value = newAccessToken;
      if (newRefreshToken) {
        refreshToken.value = newRefreshToken;
      }
    }

    function setPermissions(menus) {
      prems.value = [];
      const roleMenus = (info.value.roles || [])
        .filter((role) => role.menus && role.menus.length > 0)
        .flatMap((role) => role.menus);

      const allMenus = [...(menus || []), ...roleMenus];
      const permissionSet = new Set();
      const collect = (items) => {
        items.forEach((item) => {
          if (item.permission) {
            permissionSet.add(item.permission);
          }
          if (item.children && item.children.length > 0) {
            collect(item.children);
          }
        });
      };
      collect(allMenus);
      prems.value = Array.from(permissionSet);
    }

    function setRoute(routers) {
      routeList.value = routers;
      hasGetRoute.value = true;
      setPermissions(routers);
    }

    async function getUserInfo(checkDataScope) {
      const response = await UserAPI.getCurrentUserInfo(checkDataScope);
      const data = response.data.data;
      const menus = data?.menus || [];
      if (data) delete data.menus;
      info.value = { ...info.value, ...data };
      setRoute(menus);
    }

    async function refreshPermissions() {
      await getUserInfo(false);
    }

    async function setAvatar(avatar) {
      info.value = { ...info.value, avatar };
    }

    async function login(loginForm) {
      const response = await AuthAPI.login(loginForm);
      const data = response.data.data;
      if (response.data.code === ResultEnum.SUCCESS) {
        ElNotification({
          title: "通知",
          message: response.data.msg,
          type: "success",
        });
      }
      rememberMe.value = loginForm.remember ?? false;

      const newAccessToken = data?.access_token || "";
      const newRefreshToken = data?.refresh_token || "";
      Auth.setTokens(newAccessToken, newRefreshToken, rememberMe.value);
      setToken(newAccessToken, newRefreshToken);

      await getUserInfo();
      setLoginStatus(true);
    }

    async function logout(options) {
      const shouldNavigate = options?.navigate !== false;
      const token = Auth.getAccessToken();
      if (token) {
        try {
          await AuthAPI.logout(token);
        } catch {
          // 登出接口失败仍继续本地清理
        }
      }
      resetAllState();
      if (shouldNavigate) {
        redirectToLogin("已退出登录");
      }
    }

    function resetAllState() {
      Auth.clearAuth();
      info.value = {};
      routeList.value = [];
      hasGetRoute.value = false;
      isLogin.value = false;
      accessToken.value = "";
      refreshToken.value = "";
      prems.value = [];
    }

    function clearUserInfo() {
      info.value = {};
      routeList.value = [];
      hasGetRoute.value = false;
    }

    async function refreshTokenFn() {
      const currentRefreshToken = Auth.getRefreshToken();
      if (!currentRefreshToken) {
        throw new Error("没有有效的刷新令牌");
      }
      const response = await AuthAPI.refreshToken(currentRefreshToken);
      const data = response.data.data;
      Auth.setTokens(data.access_token, data.refresh_token, Auth.getRememberMe());
      setToken(data.access_token, data.refresh_token);
    }

    return {
      info,
      accessToken,
      refreshToken,
      isLogin,
      prems,
      routeList,
      hasGetRoute,
      rememberMe,
      language,
      basicInfo,
      setUserInfo,
      setLoginStatus,
      setLanguage,
      setToken,
      setPermissions,
      setRoute,
      setAvatar,
      getUserInfo,
      refreshPermissions,
      login,
      logout,
      resetAllState,
      clearUserInfo,
      refreshTokenFn,
    };
  },
  {
    persist: {
      key: "user",
      storage: localStorage,
      pick: ["language", "isLogin", "rememberMe"],
    },
  }
);
