import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getFirstMenuPath } from "@/utils";
import { HOME_PAGE_PATH } from "@/constants/router";
import { mergeShellRoutesIntoMenu } from "@/router/menu-processor";

export const useMenuStore = defineStore(
  "menu",
  () => {
    const homePath = ref(HOME_PAGE_PATH);
    const menuList = ref([]);
    const menuWidth = ref("");
    const removeRouteFns = ref([]);

    const visibleMenus = computed(() => menuList.value);

    const setMenuList = (list) => {
      const merged = mergeShellRoutesIntoMenu(list);
      menuList.value = merged;
      setHomePath(HOME_PAGE_PATH || getFirstMenuPath(merged));
    };

    const getHomePath = () => homePath.value;

    const setHomePath = (path) => {
      homePath.value = path;
    };

    const addRemoveRouteFns = (fns = []) => {
      removeRouteFns.value.push(...fns);
    };

    const removeAllDynamicRoutes = () => {
      removeRouteFns.value.forEach((fn) => fn());
      removeRouteFns.value = [];
    };

    const clearRemoveRouteFns = () => {
      removeRouteFns.value = [];
    };

    const clearMenu = () => {
      removeAllDynamicRoutes();
      menuList.value = [];
    };

    return {
      homePath,
      menuList,
      menuWidth,
      removeRouteFns,
      visibleMenus,
      setMenuList,
      getHomePath,
      setHomePath,
      addRemoveRouteFns,
      removeAllDynamicRoutes,
      clearRemoveRouteFns,
      clearMenu,
    };
  },
  {
    persist: {
      key: "menu",
      storage: localStorage,
      pick: ["homePath", "menuWidth"],
    },
  },
);
