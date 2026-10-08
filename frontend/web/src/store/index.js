import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

export const store = createPinia();
store.use(piniaPluginPersistedstate);

export function initStore(app) {
  app.use(store);
}

export { useUserStore } from "./modules/user.store";
export { useSettingStore } from "./modules/setting.store";
export { useConfigStore } from "./modules/config.store";
export { useAppStore } from "./modules/app.store";
export { useMenuStore } from "./modules/menu.store";
export { useWorktabStore } from "./modules/worktab.store";
