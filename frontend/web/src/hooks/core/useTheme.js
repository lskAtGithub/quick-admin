import { storeToRefs } from "pinia";
import { useSettingStore } from "@/store/modules/setting.store";
import { SystemThemeEnum } from "@/enums/appEnum";

export const THEME = SystemThemeEnum;

const ORDER = [THEME.LIGHT, THEME.DARK, THEME.AUTO];

export function useTheme() {
  const settingStore = useSettingStore();
  const { theme } = storeToRefs(settingStore);

  function setTheme(val) {
    settingStore.switchThemeStyles(val);
  }

  function toggleTheme() {
    const next = (ORDER.indexOf(theme.value) + 1) % ORDER.length;
    setTheme(ORDER[next]);
  }

  return { theme, setTheme, toggleTheme };
}

export function initTheme() {
  useSettingStore().initializeTheme();
}
