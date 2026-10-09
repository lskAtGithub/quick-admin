import { createApp } from "vue";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import "@/styles/tailwind.css";
import "@/styles/index.css";
import "@/styles/layouts/_layout.scss";
import "@/styles/animations/_theme-animation.scss";
import "@/styles/animations/_router-transition.scss";
import "@/styles/animations/_theme-change.scss";
import "@/styles/core/_box-mode.scss";
import "@/styles/pages/_login.scss";
import App from "./App.vue";
import { initPlugins } from "@/plugins";

(async () => {
  const app = createApp(App);
  await initPlugins(app);
  app.mount("#app");
})();
