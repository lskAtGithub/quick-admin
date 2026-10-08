import { h } from "vue";
import {
  IframeRouteManager,
  IframeView,
  ROOT_LAYOUT_ROUTE_NAME,
  ROUTE_COMPONENT_LAYOUT,
} from "@/constants/router";

const pageComponents = import.meta.glob("/src/{views,layouts}/**/*.vue", { eager: true });

export class ComponentLoader {
  load(path) {
    if (!path) return { render: () => null };
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    const lookupPaths = [`/src/views/${normalizedPath}`, `/src/views/${normalizedPath}.vue`];
    for (const p of lookupPaths) {
      const mod = pageComponents[p];
      if (mod) return mod.default || mod;
    }
    const fallbackPath = normalizedPath.endsWith("/index")
      ? normalizedPath.slice(0, -6)
      : `${normalizedPath}/index`;
    const mod = pageComponents[`/src/views/${fallbackPath}.vue`];
    return mod ? mod.default || mod : this.createErrorComponent(path);
  }

  loadLayout() {
    return pageComponents["/src/layouts/index.vue"]?.default;
  }

  loadIframe() {
    return IframeView;
  }

  createErrorComponent(path) {
    return {
      render() {
        return h(
          "div",
          { style: "padding: 40px; text-align: center; color: #999;" },
          `[路由警告] 找不到组件: /src/views/${path}.vue`,
        );
      },
    };
  }
}

function warnInvalidRouteConfig(routes) {
  if (import.meta.env.PROD) return;
  const nameSet = new Set();
  const check = (items, pPath = "") => {
    items.forEach((route) => {
      const fullPath = route.path ?? "";
      if (route.name) {
        const n = String(route.name);
        if (nameSet.has(n)) console.warn(`[路由配置] name 重复: "${n}" (${fullPath})`);
        nameSet.add(n);
      }
      if (!route.component && !route.meta?.link && !route.meta?.isIframe && !route.children?.length) {
        console.warn(`[路由配置] 缺少 component: "${route.path}"`);
      }
      if (pPath !== "" && route.component === ROUTE_COMPONENT_LAYOUT) {
        console.error(
          `[路由配置] 菜单 "${route.meta?.title || route.path}" 为 ${pPath} 子菜单，不能使用 ${ROUTE_COMPONENT_LAYOUT}`,
        );
      }
      if (route.children?.length && route.component && route.component !== ROUTE_COMPONENT_LAYOUT) {
        console.warn(`[路由配置] 目录节点不应挂组件: "${route.path}" → ${String(route.component)}`);
      }
      if (route.children?.length) check(route.children, fullPath);
    });
  };
  check(routes);
}

export class RouteTransformer {
  constructor(loaderArg, options = {}) {
    this.loader = loaderArg ?? new ComponentLoader();
    this.options = options;
  }

  transform(route, depth) {
    const { path } = route;
    if (!path && !route.children?.length) return null;
    const isIframe = route.meta?.isIframe;
    if (isIframe) return this.handleIframeRoute(route, depth);
    if (this.isFirstLevelLeaf(route, depth)) return this.handleFirstLevelLeaf(route);
    return this.handleNormalRoute(route, depth);
  }

  pathFirstSegment(path) {
    return path.replace(/^\//, "").split("/")[0] || path.replace(/^\//, "");
  }

  routerPath(path, depth) {
    if (depth === 0 && !path.startsWith("/")) return `/${path}`;
    if (this.options.shellChild && depth >= 1) return path;
    return path;
  }

  isFirstLevelLeaf(route, depth) {
    if (depth !== 0) return false;
    if (route.meta?.link || route.meta?.isIframe) return false;
    if (route.children?.length) return false;
    return true;
  }

  handleIframeRoute(route, depth) {
    if (depth === 0) {
      const firstSegment = this.pathFirstSegment(route.path);
      return {
        path: `/${firstSegment}`,
        name: route.name || firstSegment,
        component: this.loader.loadLayout(),
        meta: { title: route.meta?.title, icon: route.meta?.icon },
        redirect: route.path.startsWith("/") ? route.path : `/${route.path}`,
        children: [
          {
            path: route.path.replace(/^\//, ""),
            name: route.name,
            component: this.loader.loadIframe(),
            meta: route.meta,
          },
        ],
      };
    }
    return {
      path: this.routerPath(route.path, depth),
      name: route.name,
      component: this.loader.loadIframe(),
      meta: route.meta,
    };
  }

  handleFirstLevelLeaf(route) {
    const firstSegment = this.pathFirstSegment(route.path);
    const fullMenuPath = route.path.startsWith("/") ? route.path : `/${route.path}`;
    return {
      path: `/${firstSegment}`,
      name: route.name || firstSegment,
      component: this.loader.loadLayout(),
      meta: { title: route.meta?.title, icon: route.meta?.icon },
      redirect: fullMenuPath,
      children: [
        {
          path: fullMenuPath.replace(/^\//, ""),
          name: `${String(route.name) || firstSegment}Child`,
          component: this.loader.load(route.component ? String(route.component) : ""),
          meta: route.meta,
        },
      ],
    };
  }

  handleNormalRoute(route, depth) {
    if (!route.children?.length) return this.buildLeafRoute(route, depth);
    const children = route.children.map((child) => this.transform(child, depth + 1)).filter(Boolean);
    return {
      path: this.routerPath(route.path, depth),
      name: route.name,
      redirect: children.length > 0 ? { name: children[0]?.name } : undefined,
      component:
        route.component && route.component !== ROUTE_COMPONENT_LAYOUT
          ? this.loader.load(String(route.component))
          : undefined,
      meta: route.meta,
      children,
    };
  }

  buildLeafRoute(route, depth) {
    if ((!route.component || route.component === ROUTE_COMPONENT_LAYOUT) && route.meta?.link) {
      return null;
    }
    return {
      path: this.routerPath(route.path, depth),
      name: route.name,
      component:
        route.component && route.component !== ROUTE_COMPONENT_LAYOUT
          ? this.loader.load(String(route.component))
          : undefined,
      meta: route.meta,
    };
  }
}

export class RouteRegistry {
  constructor(router) {
    this.router = router;
    this.componentLoader = new ComponentLoader();
    this.transformer = new RouteTransformer(this.componentLoader, { shellChild: true });
    this.removeRouteFns = [];
    this.registered = false;
  }

  register(menuList) {
    if (this.registered) {
      console.warn("[RouteRegistry] 路由已注册，跳过重复注册");
      return;
    }
    warnInvalidRouteConfig(menuList);
    this.registered = true;
    menuList.forEach((menu, index) => {
      const firstSegment = this.transformer.pathFirstSegment(menu.path);
      if (this.isShellSegment(firstSegment)) return;
      if (this.router.hasRoute(registrationName(menu, index).trim())) return;
      if (menu.meta?.isIframe) IframeRouteManager.getInstance().add(menu);
      const routeRecord = this.transformer.transform(menu, 0);
      if (routeRecord) {
        this.router.addRoute(ROOT_LAYOUT_ROUTE_NAME, routeRecord);
        this.removeRouteFns.push(() => {
          const name = routeRecord.name;
          if (name && this.router.hasRoute(name)) this.router.removeRoute(name);
        });
      }
    });
  }

  unregister() {
    this.removeRouteFns.forEach((fn) => fn());
    this.removeRouteFns = [];
    this.registered = false;
    IframeRouteManager.getInstance().clear();
  }

  isRegistered() {
    return this.registered;
  }

  getRemoveRouteFns() {
    return this.removeRouteFns;
  }

  markAsRegistered() {
    this.registered = true;
  }

  isShellSegment(segment) {
    return ["home", "profile", "changelog", "dashboard"].includes(segment);
  }
}

function registrationName(route, index) {
  const prefix = route.name ? String(route.name) : `Dyn_${index}`;
  return `Dyn_${index}_${prefix}`;
}
