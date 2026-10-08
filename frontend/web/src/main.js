import { createApp } from "vue";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import "@/styles/index.css";
import App from "./App.vue";
import { initPlugins } from "@/plugins";
import { initTheme } from "@/hooks/core/useTheme";

initTheme();

(async () => {
  const app = createApp(App);
  await initPlugins(app);
  app.mount("#app");
})();
