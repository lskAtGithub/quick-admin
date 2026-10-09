import { router } from "@/router";
import i18n, { $t } from "@/locales";
import AppConfig from "@/config";
import { useConfigStore, useWorktabStore, useSettingStore } from "@/store";
import { IframeRouteManager } from "@/constants/router";
import { useCommon } from "@/hooks/core/useCommon";

export const formatMenuTitle = (title) => {
  if (!title) return "";
  // 始终读取一次 locale，确保模板渲染时建立对语言切换的响应式依赖
  const _locale = i18n.global.locale.value;
  void _locale;
  if (title.startsWith("menus.")) {
    if (i18n.global.te(title)) return $t(title);
    return title.split(".").pop() || title;
  }
  return title;
};

export const setPageTitle = (to) => {
  const { title } = to.meta;
  if (!title) return;
  const configStore = useConfigStore();
  const siteName =
    configStore?.configData?.sys_name?.config_value?.trim?.() || AppConfig.systemInfo.name;
  document.title = `${formatMenuTitle(String(title))} - ${siteName}`;
};

export function isIframe(url) {
  return url.startsWith("/outside/iframe/");
}

export const isNavigableMenuItem = (menuItem) => {
  if (!menuItem.path || !menuItem.path.trim()) return false;
  return !menuItem.meta?.isHide;
};

const normalizePath = (path) => (path.startsWith("/") ? path : `/${path}`);

export const getFirstMenuPath = (menuList) => {
  if (!Array.isArray(menuList) || menuList.length === 0) return "";
  for (const menuItem of menuList) {
    if (!isNavigableMenuItem(menuItem)) continue;
    if (menuItem.children?.length) {
      const childPath = getFirstMenuPath(menuItem.children);
      if (childPath) return childPath;
    }
    return normalizePath(menuItem.path);
  }
  return "";
};

export const openExternalLink = (link) => window.open(link, "_blank");

export const handleMenuJump = (item, jumpToFirst = false) => {
  const { link, isIframe: menuIsIframe } = item.meta || {};
  if (link && !menuIsIframe) return openExternalLink(link);
  if (!jumpToFirst || !item.children?.length) return router.push(item.path);

  const findFirstLeafMenu = (items) => {
    for (const child of items) {
      if (isNavigableMenuItem(child)) {
        return child.children?.length ? findFirstLeafMenu(child.children) || child : child;
      }
    }
    return undefined;
  };

  const firstChild = findFirstLeafMenu(item.children);
  if (!firstChild) return router.push(item.path);
  if (firstChild.meta?.link) return openExternalLink(firstChild.meta.link);
  return router.push(firstChild.path);
};

export const setWorktab = (to) => {
  const worktabStore = useWorktabStore();
  const { meta, path, name, params, query } = to;
  if (meta.isHideTab) return;

  const routeNameStr = name != null ? String(name) : "";

  if (isIframe(path)) {
    const iframeRoute = IframeRouteManager.getInstance().findByPath(path);
    if (!iframeRoute?.meta) return;
    worktabStore.openTab({
      title: iframeRoute.meta.title,
      icon: meta.icon,
      path,
      name: routeNameStr,
      keepAlive: meta.keepAlive !== false,
      params,
      query,
    });
    return;
  }

  const tabPayload = {
    title: meta.title || "",
    icon: meta.icon,
    path,
    name: routeNameStr,
    keepAlive: meta.keepAlive !== false,
    params,
    query,
    fixedTab: meta.fixedTab,
  };

  if (useSettingStore().showWorkTab || path === useCommon().homePath.value) {
    worktabStore.openTab(tabPayload);
  } else {
    worktabStore.syncCurrentFromRoute(tabPayload);
  }
};
