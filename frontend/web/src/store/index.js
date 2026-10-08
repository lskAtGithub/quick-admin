import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

export const store = createPinia();
store.use(piniaPluginPersistedstate);

export function initStore(app) {
  app.use(store);
}

export { useUserStore } from "./modules/user.store";
