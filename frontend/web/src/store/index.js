import { createPinia } from "pinia";

export const store = createPinia();

export function initStore(app) {
  app.use(store);
}
