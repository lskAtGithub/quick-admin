import { createRouter, createWebHashHistory } from "vue-router";
import { staticRoutes } from "./routes";
import { setupRouterGuards } from "./guards";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: staticRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

setupRouterGuards(router);

export function initRouter(app) {
  app.use(router);
}

export const HOME_PAGE_PATH = "/home";
