import { useUserStore } from "@/store";
import { HOME_PAGE_PATH, HOME_MENU_META } from "@/constants/router";

const MENU_TYPE = { DIRECTORY: 1, MENU: 2, BUTTON: 3 };

const FALLBACK_HOME = [
  {
    path: "/home",
    name: "Home",
    component: "",
    meta: { ...HOME_MENU_META, shellRoute: true },
    children: [],
  },
];

function normalizeMenuPath(path) {
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
}

function joinAbsolutePath(parentAbs, segmentPath) {
  const seg = (segmentPath || "").replace(/^\/+/, "");
  const base = (parentAbs || "").replace(/\/$/, "");
  if (!seg) return base;
  return `${base}/${seg}`;
}

function resolveNodePath(raw, parentAbsolutePath) {
  const t = (raw || "").trim();
  if (!t) return parentAbsolutePath || "";
  if (t.startsWith("/")) return t;
  return parentAbsolutePath ? joinAbsolutePath(parentAbsolutePath, t) : `/${t}`;
}

function toMeta(item) {
  return {
    title: item.title || item.name || "",
    icon: item.icon || "",
    keepAlive: item.keep_alive !== false,
    isHide: !!item.hidden,
    alwaysShow: !!item.always_show,
    fixedTab: !!item.affix,
    link: item.link || "",
    isIframe: !!item.is_iframe,
    isHideTab: !!item.is_hide_tab,
    activePath: item.active_path || "",
    showBadge: !!item.show_badge,
    showTextBadge: item.show_text_badge || "",
    sort: item.order ?? 0,
    type: item.type,
    redirect: item.redirect || undefined,
  };
}

function mapMenuNode(item, parentAbsolutePath = "") {
  const path = resolveNodePath(item.route_path, parentAbsolutePath);
  const node = {
    path,
    name: item.route_name || undefined,
    component: item.component_path || "",
    redirect: item.redirect || undefined,
    meta: toMeta(item),
  };
  const children = (item.children || []).filter((c) => c.type !== MENU_TYPE.BUTTON);
  if (children.length) {
    node.children = children.map((c) => mapMenuNode(c, path));
  }
  return node;
}

function collectPathsAndNames(list, paths, names) {
  (list || []).forEach((item) => {
    if (item.path) paths.add(normalizeMenuPath(item.path));
    if (item.name) names.add(String(item.name));
    if (item.children?.length) collectPathsAndNames(item.children, paths, names);
  });
}

export function mergeShellRoutesIntoMenu(menuList) {
  const list = Array.isArray(menuList) ? menuList : [];
  const paths = new Set();
  const names = new Set();
  collectPathsAndNames(list, paths, names);

  const hasHome = paths.has(normalizeMenuPath(HOME_PAGE_PATH));
  if (hasHome) return list;

  const homeShell = {
    path: HOME_PAGE_PATH,
    name: "Home",
    component: "",
    meta: { ...HOME_MENU_META, shellRoute: true },
  };
  return [homeShell, ...list];
}

export function getFirstNavigatePath(menuList) {
  const home = menuList?.find((m) => normalizeMenuPath(m.path) === normalizeMenuPath(HOME_PAGE_PATH));
  return home ? HOME_PAGE_PATH : "";
}

export class MenuProcessor {
  async getMenuList() {
    let raw;
    try {
      raw = useUserStore().routeList || [];
    } catch {
      raw = [];
    }

    if (!raw.length) {
      return mergeShellRoutesIntoMenu(FALLBACK_HOME.map((n) => ({ ...n })));
    }

    const mapped = raw
      .filter((item) => item.type !== MENU_TYPE.BUTTON)
      .map((item) => mapMenuNode(item, ""))
      .sort((a, b) => (a.meta?.sort ?? 0) - (b.meta?.sort ?? 0));

    const withHome = mapped.some((m) => normalizeMenuPath(m.path) === normalizeMenuPath(HOME_PAGE_PATH))
      ? mapped
      : [...FALLBACK_HOME.map((n) => ({ ...n })), ...mapped];

    return mergeShellRoutesIntoMenu(withHome);
  }
}

export default MenuProcessor;
