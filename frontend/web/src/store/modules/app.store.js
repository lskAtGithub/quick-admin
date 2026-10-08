import { defineStore } from "pinia";
import { ref } from "vue";
import { store } from "@/store";

export const useAppStore = defineStore("app", () => {
  const isMobile = ref(false);
  const guideVisible = ref(false);

  function showGuide(val = false) {
    guideVisible.value = val;
  }

  return { isMobile, guideVisible, showGuide };
});

export function useAppStoreHook() {
  return useAppStore(store);
}
