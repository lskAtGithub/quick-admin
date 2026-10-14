import { useSettingStore } from "@/store";
import { ContainerWidthEnum } from "@/enums/appEnum";
import { isSettingAvailable } from "@/utils/settings";
import { isColorInRange } from "@/utils/ui";

export function useSettingsHandlers() {
  const settingStore = useSettingStore();
  const { t } = useI18n();

  function handleSettingChange(config, value) {
    if (config.disabled || !isSettingAvailable(config.key) || value === undefined || value === null) return;
    if (config.type === "switch" && typeof value !== "boolean") return;
    if (config.type === "select" && !config.options.some((option) => option.value === value)) return;
    if (config.type === "input-number") {
      if (!Number.isFinite(value)) return;
      value = Math.min(config.max, Math.max(config.min, value));
    }
    if (config.key === "showLanguage") {
      if (settingStore.showLanguage !== value) settingStore.toggleShowLanguage();
    } else {
      settingStore.updateSetting(config.key, value);
    }
  }

  const boxStyleHandlers = {
    setBoxMode(type) {
      if (!["border-mode", "shadow-mode"].includes(type)) return;
      const border = type === "border-mode";
      if (settingStore.boxBorderMode !== border) settingStore.setBorderMode();
    },
  };
  const colorHandlers = {
    selectColor(color) {
      if (typeof color !== "string" || !/^#[\da-f]{6}$/i.test(color)) return;
      if (!isColorInRange(color)) {
        ElMessage.warning(t("setting.color.rangeWarn"));
        return;
      }
      settingStore.setThemeColor(color);
    },
  };
  const containerHandlers = {
    setWidth(width) {
      if (Object.values(ContainerWidthEnum).includes(width)) settingStore.setContainerWidth(width);
    },
  };
  return { handleSettingChange, boxStyleHandlers, colorHandlers, containerHandlers };
}
