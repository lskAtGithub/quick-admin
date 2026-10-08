import { initStore } from "@/store";
import { initRouter } from "@/router";
import { initI18n } from "@/locales";
import { initTheme } from "@/hooks/core/useTheme";
import { setupDirectives } from "@/directives";

export async function initPlugins(app) {
  initStore(app);
  initTheme();
  initRouter(app);
  initI18n(app);
  setupDirectives(app);
}
