import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { initPlugins } from "@/plugins";

(async () => {
  const app = createApp(App);
  await initPlugins(app);
  app.mount("#app");
})();
