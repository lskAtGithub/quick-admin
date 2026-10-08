import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { router } from "@/router";
import { useCommon } from "@/hooks/core/useCommon";

const warn = (msg) => {
  if (import.meta.env.DEV) console.warn(msg);
};

export const useWorktabStore = defineStore(
  "worktab",
  () => {
    const current = ref({});
    const opened = ref([]);
    const keepAliveExclude = ref([]);

    const hasOpenedTabs = computed(() => opened.value.length > 0);
    const hasMultipleTabs = computed(() => opened.value.length > 1);
    const currentTabIndex = computed(() =>
      current.value.path ? opened.value.findIndex((tab) => tab.path === current.value.path) : -1,
    );

    const findTabIndex = (path) => opened.value.findIndex((tab) => tab.path === path);

    const getTab = (path) => opened.value.find((tab) => tab.path === path);

    const isTabClosable = (tab) => !tab.fixedTab;

    const safeRouterPush = (tab) => {
      if (!tab.path) {
        warn("尝试跳转到无效路径的标签页");
        return;
      }
      try {
        router.push({ path: tab.path, query: tab.query });
      } catch (error) {
        if (import.meta.env.DEV) console.error("路由跳转失败:", error);
      }
    };

    const ensureRouterMatchesOpenedTab = () => {
      if (!opened.value.length) return;
      const locPath = router.currentRoute.value.path;
      if (opened.value.some((t) => t.path === locPath)) return;
      if (current.value.path) safeRouterPush(current.value);
    };

    const findFixedTabInsertIndex = () => {
      let insertIndex = 0;
      for (let i = 0; i < opened.value.length; i++) {
        if (opened.value[i].fixedTab) insertIndex = i + 1;
        else break;
      }
      return insertIndex;
    };

    const pushExcludeIfLastSiblingOfName = (name, remaining, tab) => {
      if (!name || tab.keepAlive === false) return;
      if (remaining.some((t) => t.name === name)) return;
      if (!keepAliveExclude.value.includes(name)) keepAliveExclude.value.push(name);
    };

    const addKeepAliveExclude = (tab) => {
      pushExcludeIfLastSiblingOfName(tab.name, opened.value, tab);
    };

    const removeKeepAliveExclude = (name) => {
      if (!name) return;
      keepAliveExclude.value = keepAliveExclude.value.filter((item) => item !== name);
    };

    const markTabsToRemove = (tabs) => {
      const removedPaths = new Set(tabs.map((t) => t.path));
      const futureOpened = opened.value.filter((t) => !removedPaths.has(t.path));
      for (const tab of tabs) {
        if (tab.name) pushExcludeIfLastSiblingOfName(tab.name, futureOpened, tab);
      }
    };

    const openTab = (tab) => {
      if (!tab.path) {
        warn("尝试打开无效的标签页");
        return;
      }
      if (tab.name) removeKeepAliveExclude(tab.name);

      const existingIndex = findTabIndex(tab.path);
      if (existingIndex === -1) {
        const insertIndex = tab.fixedTab ? findFixedTabInsertIndex() : opened.value.length;
        const newTab = { ...tab };
        if (tab.fixedTab) opened.value.splice(insertIndex, 0, newTab);
        else opened.value.push(newTab);
        current.value = newTab;
      } else {
        const existingTab = opened.value[existingIndex];
        opened.value[existingIndex] = {
          ...existingTab,
          path: tab.path,
          params: tab.params,
          query: tab.query,
          title: tab.title || existingTab.title,
          fixedTab: tab.fixedTab ?? existingTab.fixedTab,
          keepAlive: tab.keepAlive ?? existingTab.keepAlive,
          name: tab.name || existingTab.name,
          icon: tab.icon || existingTab.icon,
        };
        current.value = opened.value[existingIndex];
      }
    };

    const removeTab = (path) => {
      const targetTab = getTab(path);
      const targetIndex = findTabIndex(path);
      if (targetIndex === -1) {
        warn(`尝试关闭不存在的标签页: ${path}`);
        return;
      }
      if (targetTab && !isTabClosable(targetTab)) {
        warn(`尝试关闭固定标签页: ${path}`);
        return;
      }
      opened.value.splice(targetIndex, 1);
      if (targetTab?.name) addKeepAliveExclude(targetTab);

      const { homePath } = useCommon();
      if (!hasOpenedTabs.value) {
        if (path !== homePath.value) {
          current.value = {};
          safeRouterPush({ path: homePath.value });
        }
        return;
      }
      if (current.value.path === path) {
        const newIndex = targetIndex >= opened.value.length ? opened.value.length - 1 : targetIndex;
        const nextTab = opened.value[newIndex];
        if (!nextTab) return;
        current.value = nextTab;
        safeRouterPush(nextTab);
      }
    };

    const removeLeft = (path) => {
      const targetIndex = findTabIndex(path);
      if (targetIndex === -1) {
        warn(`尝试关闭左侧标签页，但目标标签页不存在: ${path}`);
        return;
      }
      const leftTabs = opened.value.slice(0, targetIndex);
      const closableLeftTabs = leftTabs.filter(isTabClosable);
      if (closableLeftTabs.length === 0) {
        warn("左侧没有可关闭的标签页");
        return;
      }
      markTabsToRemove(closableLeftTabs);
      opened.value = opened.value.filter((tab, index) => index >= targetIndex || !isTabClosable(tab));
      const targetTab = getTab(path);
      if (targetTab) current.value = targetTab;
      ensureRouterMatchesOpenedTab();
    };

    const removeRight = (path) => {
      const targetIndex = findTabIndex(path);
      if (targetIndex === -1) {
        warn(`尝试关闭右侧标签页，但目标标签页不存在: ${path}`);
        return;
      }
      const rightTabs = opened.value.slice(targetIndex + 1);
      const closableRightTabs = rightTabs.filter(isTabClosable);
      if (closableRightTabs.length === 0) {
        warn("右侧没有可关闭的标签页");
        return;
      }
      markTabsToRemove(closableRightTabs);
      opened.value = opened.value.filter((tab, index) => index <= targetIndex || !isTabClosable(tab));
      const targetTab = getTab(path);
      if (targetTab) current.value = targetTab;
      ensureRouterMatchesOpenedTab();
    };

    const removeOthers = (path) => {
      const targetTab = getTab(path);
      if (!targetTab) {
        warn(`尝试关闭其他标签页，但目标标签页不存在: ${path}`);
        return;
      }
      const otherTabs = opened.value.filter((tab) => tab.path !== path);
      const closableTabs = otherTabs.filter(isTabClosable);
      if (closableTabs.length === 0) {
        warn("没有其他可关闭的标签页");
        return;
      }
      markTabsToRemove(closableTabs);
      opened.value = opened.value.filter((tab) => tab.path === path || !isTabClosable(tab));
      current.value = targetTab;
      ensureRouterMatchesOpenedTab();
    };

    const removeAll = () => {
      const { homePath } = useCommon();
      const hasFixedTabs = opened.value.some((tab) => tab.fixedTab);
      const closableTabs = opened.value.filter((tab) => {
        if (!isTabClosable(tab)) return false;
        return hasFixedTabs || tab.path !== homePath.value;
      });
      if (closableTabs.length === 0) {
        warn("没有可关闭的标签页");
        return;
      }
      markTabsToRemove(closableTabs);
      opened.value = opened.value.filter((tab) => !isTabClosable(tab) || (!hasFixedTabs && tab.path === homePath.value));
      if (!hasOpenedTabs.value) {
        current.value = {};
        safeRouterPush({ path: homePath.value });
        return;
      }
      const homeTab = opened.value.find((tab) => tab.path === homePath.value);
      const targetTab = homeTab || opened.value[0];
      if (!targetTab) return;
      current.value = targetTab;
      safeRouterPush(targetTab);
    };

    const toggleFixedTab = (path) => {
      const targetIndex = findTabIndex(path);
      if (targetIndex === -1) {
        warn(`尝试切换不存在标签页的固定状态: ${path}`);
        return;
      }
      const tab = { ...opened.value[targetIndex] };
      tab.fixedTab = !tab.fixedTab;
      opened.value.splice(targetIndex, 1);
      if (tab.fixedTab) {
        const firstNonFixedIndex = opened.value.findIndex((t) => !t.fixedTab);
        const insertIndex = firstNonFixedIndex === -1 ? opened.value.length : firstNonFixedIndex;
        opened.value.splice(insertIndex, 0, tab);
      } else {
        const fixedCount = opened.value.filter((t) => t.fixedTab).length;
        opened.value.splice(fixedCount, 0, tab);
      }
      if (current.value.path === path) current.value = tab;
    };

    const validateWorktabs = (routerInstance) => {
      try {
        const allRoutes = routerInstance.getRoutes();
        const isTabRouteValid = (tab) => {
          try {
            if (tab.name && allRoutes.some((r) => r.name === tab.name)) return true;
            if (tab.path) {
              const resolved = routerInstance.resolve({ path: tab.path, query: tab.query || undefined });
              return resolved.matched.length > 0;
            }
            return false;
          } catch {
            return false;
          }
        };
        const isHideTabWorktab = (tab) => {
          try {
            if (!tab.path) return false;
            return routerInstance.resolve({ path: tab.path, query: tab.query || undefined }).meta.isHideTab === true;
          } catch {
            return false;
          }
        };
        const validTabs = opened.value.filter((tab) => isTabRouteValid(tab) && !isHideTabWorktab(tab));
        if (validTabs.length !== opened.value.length) {
          warn("发现无效的标签页路由，已自动清理");
          const validPaths = new Set(validTabs.map((t) => t.path));
          for (const tab of opened.value) {
            if (!validPaths.has(tab.path) && tab.name && tab.keepAlive !== false) {
              pushExcludeIfLastSiblingOfName(tab.name, validTabs, tab);
            }
          }
          opened.value = validTabs;
        }
        const isCurrentValid = current.value && isTabRouteValid(current.value) && !isHideTabWorktab(current.value);
        if (!isCurrentValid && validTabs.length > 0) {
          warn("当前激活标签无效，已自动切换");
          current.value = validTabs[0];
        } else if (!isCurrentValid) {
          current.value = {};
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error("验证工作台标签页失败:", error);
      }
    };

    const clearAll = () => {
      const fixedTabs = opened.value.filter((tab) => tab.fixedTab);
      const removedTabs = fixedTabs.length > 0 ? opened.value.filter((tab) => !tab.fixedTab) : opened.value;
      const excludeNames = new Set();
      for (const tab of removedTabs) {
        if (tab.name && tab.keepAlive !== false) excludeNames.add(String(tab.name));
      }
      if (fixedTabs.length > 0) {
        opened.value = fixedTabs;
        current.value = { ...fixedTabs[0] };
      } else {
        current.value = {};
        opened.value = [];
      }
      keepAliveExclude.value = Array.from(excludeNames);
    };

    const getStateSnapshot = () => ({
      current: { ...current.value },
      opened: [...opened.value],
      keepAliveExclude: [...keepAliveExclude.value],
    });

    const getTabTitle = (path) => getTab(path);

    const updateTabTitle = (path, title) => {
      const tab = getTab(path);
      if (tab) tab.customTitle = title;
    };

    const resetTabTitle = (path) => {
      const tab = getTab(path);
      if (tab) tab.customTitle = "";
    };

    const syncCurrentFromRoute = (tab) => {
      current.value = {
        path: tab.path,
        name: tab.name,
        title: tab.title,
        icon: tab.icon,
        keepAlive: tab.keepAlive,
        params: tab.params,
        query: tab.query,
      };
    };

    return {
      current,
      opened,
      keepAliveExclude,
      hasOpenedTabs,
      hasMultipleTabs,
      currentTabIndex,
      openTab,
      removeTab,
      removeLeft,
      removeRight,
      removeOthers,
      removeAll,
      toggleFixedTab,
      validateWorktabs,
      clearAll,
      getStateSnapshot,
      findTabIndex,
      getTab,
      isTabClosable,
      addKeepAliveExclude,
      removeKeepAliveExclude,
      markTabsToRemove,
      getTabTitle,
      updateTabTitle,
      resetTabTitle,
      syncCurrentFromRoute,
    };
  },
  {
    persist: {
      key: "worktab",
      storage: localStorage,
    },
  },
);
