import { defineAsyncComponent } from "vue";

export const globalComponentsConfig = [
  {
    key: "settingsPanel",
    component: defineAsyncComponent(() => import("@/layouts/qa-settings-panel/index.vue")),
    enabled: true,
  },
  {
    key: "screenLock",
    component: defineAsyncComponent(() => import("@/layouts/qa-screen-lock/index.vue")),
    enabled: true,
  },
];

export const getEnabledGlobalComponents = () => globalComponentsConfig.filter((config) => config.enabled !== false);
