import { router } from "@/router";
import i18n, { $t } from "@/locales";
import AppConfig from "@/config";
import { useConfigStore } from "@/store";

export const formatMenuTitle = (title) => {
  if (!title) return "";
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
