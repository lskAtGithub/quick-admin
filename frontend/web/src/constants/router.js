import { defineComponent, h, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

export const HOME_PAGE_PATH = "/home";
export const ROOT_LAYOUT_ROUTE_NAME = "RootLayout";
export const HOME_ROUTE_NAME = "Home";
export const ROUTE_COMPONENT_LAYOUT = "/index/index";
export const ROUTE_PATH_LOGIN_ALT = "/auth/login";

export const HOME_MENU_META = {
  title: "menus.home.title",
  icon: "ri:home-smile-2-line",
  keepAlive: true,
  fixedTab: true,
};

export const ANONYMOUS_PUBLIC_REGEXPS = [
  "/^401$/",
  "/^403$/",
  "/^404$/",
  "/^500$/",
  "/^\\/redirect/",
  "/^\\/login$/",
];

export class IframeRouteManager {
  static #instance;
  #iframeRoutes = [];

  static getInstance() {
    return (IframeRouteManager.#instance ??= new IframeRouteManager());
  }

  add(route) {
    if (!this.#iframeRoutes.find((r) => r.path === route.path)) {
      this.#iframeRoutes.push(route);
    }
  }

  getAll() {
    return this.#iframeRoutes;
  }

  findByPath(path) {
    return this.#iframeRoutes.find((route) => route.path === path);
  }

  clear() {
    this.#iframeRoutes = [];
  }

  save() {
    if (this.#iframeRoutes.length > 0) {
      sessionStorage.setItem("iframeRoutes", JSON.stringify(this.#iframeRoutes));
    }
  }

  load() {
    try {
      const data = sessionStorage.getItem("iframeRoutes");
      if (data) this.#iframeRoutes = JSON.parse(data);
    } catch (error) {
      console.error("[IframeRouteManager] 加载 iframe 路由失败:", error);
      this.#iframeRoutes = [];
    }
  }
}

export const IframeView = defineComponent({
  name: "IframeView",
  setup() {
    const route = useRoute();
    const isLoading = ref(true);
    const iframeUrl = ref("");
    const frameRef = ref(null);

    onMounted(() => {
      const iframeRoute = IframeRouteManager.getInstance().findByPath(route.path);
      if (iframeRoute?.meta) {
        iframeUrl.value = iframeRoute.meta.link || iframeRoute.meta.src || "";
      }
    });

    const onLoad = () => {
      isLoading.value = false;
    };

    return () =>
      h(
        "div",
        { class: "position-relative w-full", style: "min-height: calc(100vh - 120px);" },
        [
          isLoading.value
            ? h("div", { class: "position-absolute top-0 left-0 w-full h-full flex-center bg-gray-100" }, "loading...")
            : null,
          iframeUrl.value
            ? h("iframe", {
                ref: frameRef,
                src: iframeUrl.value,
                onLoad,
                frameborder: "0",
                class: "w-full border-0",
                style: "height: calc(100vh - 120px);",
              })
            : null,
        ],
      );
  },
});
