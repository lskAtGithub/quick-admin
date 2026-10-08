import { initStore } from "@/store";
import { initRouter } from "@/router";
import { initI18n } from "@/locales";

export async function initPlugins(app) {
  initStore(app);
  initRouter(app);
  initI18n(app);
}
