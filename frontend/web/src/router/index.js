import { createRouter, createWebHashHistory } from "vue-router";
import { staticRoutes } from "./routes";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: staticRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

export function initRouter(app) {
  app.use(router);
}

export const HOME_PAGE_PATH = "/home";
