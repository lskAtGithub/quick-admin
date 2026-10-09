import { onMounted, onBeforeUnmount, watch } from "vue";
import { storeToRefs } from "pinia";
import { useSettingStore } from "@/store";
import { mittBus } from "@/utils/mitt";
import { useSettingsState } from "./useSettingsState";

export function useSettingsPanel() {
  const settingStore = useSettingStore();
  const { settingsVisible: showDrawer } = storeToRefs(settingStore);
  const { ensureAvailableMenu } = useSettingsState();
  let themeChangeTimer;

  function handleClose() {
    clearTimeout(themeChangeTimer);
    themeChangeTimer = undefined;
    document.body.classList.remove("theme-change");
  }
  function handleOpen() {
    handleClose();
    themeChangeTimer = setTimeout(() => {
      if (showDrawer.value) document.body.classList.add("theme-change");
      themeChangeTimer = undefined;
    }, 500);
  }
  const openSetting = () => settingStore.showSettingsPanel();
  const closeDrawer = () => settingStore.hideSettingsPanel();

  watch(showDrawer, (visible) => {
    if (!visible) handleClose();
  });
  onMounted(() => {
    ensureAvailableMenu();
    mittBus.on("openSetting", openSetting);
  });
  onBeforeUnmount(() => {
    mittBus.off("openSetting", openSetting);
    handleClose();
    closeDrawer();
  });
  return { showDrawer, handleOpen, handleClose, closeDrawer };
}
