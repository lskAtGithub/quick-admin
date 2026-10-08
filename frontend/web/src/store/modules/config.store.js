import { defineStore } from "pinia";
import { ref } from "vue";
import { store } from "@/store";
import ParamsAPI from "@/api/module_system/params";

export const useConfigStore = defineStore(
  "configStore",
  () => {
    const configData = ref({});
    const isConfigLoaded = ref(false);
    const configLoading = ref(false);
    let lastFetchedAt = 0;
    const MIN_FETCH_INTERVAL_MS = 5000;

    function applyConfigList(list) {
      list.forEach((item) => {
        if (item.config_value !== undefined && item.config_key) {
          configData.value[item.config_key] = item;
        }
      });
      isConfigLoaded.value = true;
      lastFetchedAt = Date.now();
    }

    async function getConfig(force = false) {
      if (configLoading.value) return;
      if (!force && isConfigLoaded.value) return;
      if (force && Date.now() - lastFetchedAt < MIN_FETCH_INTERVAL_MS) return;

      configLoading.value = true;
      try {
        if (force) configData.value = {};
        const response = await ParamsAPI.getInitConfig();
        const list = response?.data?.data;
        if (!Array.isArray(list)) return;
        applyConfigList(list);
      } catch (error) {
        console.warn("[configStore] 获取配置失败:", error);
      } finally {
        configLoading.value = false;
      }
    }

    return { configData, isConfigLoaded, configLoading, getConfig };
  },
  {
    persist: {
      key: "config",
      storage: localStorage,
      pick: ["configData", "isConfigLoaded"],
    },
  }
);

export function useConfigStoreHook() {
  return useConfigStore(store);
}
