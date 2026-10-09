import { HOME_MENU_META, HOME_PAGE_PATH } from "./router.js";

/**
 * 默认自带静态菜单（不依赖后端）。
 * 与 src/router/routes.js 的 staticRoutes 一一对应；后续接后端时，
 * 后端返回非空列表即可覆盖，这里仅作为免鉴权开发态的兜底数据。
 */
export const STATIC_MENU_LIST = [
  {
    path: HOME_PAGE_PATH,
    name: "Home",
    meta: {
      title: HOME_MENU_META.title,
      icon: HOME_MENU_META.icon,
      keepAlive: HOME_MENU_META.keepAlive ?? true,
      isHide: false,
      alwaysShow: false,
      fixedTab: HOME_MENU_META.fixedTab ?? false,
      link: "",
      isIframe: false,
      isHideTab: false,
      activePath: "",
      showBadge: false,
      showTextBadge: "",
      sort: 0,
      type: 2,
      shellRoute: true,
    },
    children: [],
  },
];
