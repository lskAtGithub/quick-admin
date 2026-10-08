import { computed } from "vue";
import { useMenuStore, useSettingStore } from "@/store";

export const getMainScrollEl = () =>
  document.getElementById("app-content") ?? document.getElementById("app-main");

export function useCommon() {
  const menuStore = useMenuStore();
  const settingStore = useSettingStore();

  const homePath = computed(() => menuStore.getHomePath());

  const refresh = () => {
    settingStore.reload();
  };

  const scrollToTop = () => {
    const el = getMainScrollEl();
    if (el) el.scrollTop = 0;
  };

  const smoothScrollToTop = () => {
    const el = getMainScrollEl();
    if (el) el.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollTo = (top, smooth = false) => {
    const el = getMainScrollEl();
    if (el) el.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
  };

  return { homePath, refresh, scrollTo, scrollToTop, smoothScrollToTop };
}
