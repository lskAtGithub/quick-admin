import { useMenuStore, useWorktabStore } from "@/store";
import { MenuProcessor } from "./menu-processor";
import { IframeRouteManager } from "@/constants/router";

export const refreshState = {
  pendingLoading: false,
  routeInitFailed: false,
  dynamicRoutesRegistered: false,
};

export function resetRouteInitState() {
  refreshState.routeInitFailed = false;
  refreshState.dynamicRoutesRegistered = false;
}

export async function resetDynamicRoutesSync() {
  const menuStore = useMenuStore();
  menuStore.removeRouteFns.forEach((fn) => fn());
  menuStore.menuList.length = 0;
  menuStore.removeRouteFns.length = 0;
  IframeRouteManager.getInstance().clear();
}

export async function refreshMenuAndRoutes(router) {
  await resetDynamicRoutesSync();
  const { RouteRegistry } = await import("./route-loader");
  const menuProcessor = new MenuProcessor();
  const menuList = await menuProcessor.getMenuList();
  useMenuStore().setMenuList(menuList);
  const routeRegistry = new RouteRegistry(router);
  routeRegistry.register(menuList);
  useMenuStore().addRemoveRouteFns(routeRegistry.getRemoveRouteFns());
  useWorktabStore().validateWorktabs(router);
}

export async function resetRouterState(delay = 0) {
  if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
  await resetDynamicRoutesSync();
}
