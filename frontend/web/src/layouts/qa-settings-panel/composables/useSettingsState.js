import { useSettingStore } from "@/store";
import { MenuTypeEnum } from "@/enums/appEnum";
import { isMenuTypeAvailable } from "@/utils/settings";

export function useSettingsState() {
  const settingStore = useSettingStore();
  const switchMenuLayouts = (type) => {
    if (!isMenuTypeAvailable(type)) return;
    settingStore.switchMenuLayouts(type);
    settingStore.setMenuOpen(true);
  };
  const ensureAvailableMenu = () => {
    if (!isMenuTypeAvailable(settingStore.menuType)) settingStore.switchMenuLayouts(MenuTypeEnum.LEFT);
  };
  return { switchMenuLayouts, ensureAvailableMenu };
}
