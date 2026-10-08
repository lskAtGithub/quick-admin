import AppConfig from "@/config";
import {
  SystemThemeEnum,
  MenuTypeEnum,
  MenuThemeEnum,
  LanguageEnum,
  ContainerWidthEnum,
} from "@/enums/appEnum";
import { LayoutMode, ComponentSize } from "@/enums/layoutEnum";
import { SidebarColor, ThemeMode } from "@/enums/themeEnum";

const prefersDark =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export const SETTING_DEFAULT_CONFIG = {
  name: AppConfig.systemInfo.name,
  title: AppConfig.systemInfo.name,
  version: "1.0.0",
  showSettings: true,
  showMenuSearch: true,
  showFullscreen: true,
  showSizeSelect: true,
  showLangSelect: true,
  showNotification: true,
  showTagsView: true,
  showAppLogo: true,
  layout: LayoutMode.LEFT,
  theme: prefersDark ? ThemeMode.DARK : ThemeMode.LIGHT,
  size: ComponentSize.DEFAULT,
  language: LanguageEnum.ZH,
  themeColor: "#4080FF",
  showWatermark: false,
  watermarkContent: AppConfig.systemInfo.name,
  sidebarColorScheme: SidebarColor.CLASSIC_BLUE,
  guideVisible: false,
  showGuide: true,
  aiEnabled: false,
  grayMode: false,
  pageSwitchingAnimation: "fade-slide",
  menuType: MenuTypeEnum.LEFT,
  menuOpenWidth: 230,
  menuOpen: true,
  dualMenuShowText: false,
  systemThemeType: SystemThemeEnum.AUTO,
  systemThemeMode: SystemThemeEnum.AUTO,
  menuThemeType: MenuThemeEnum.DESIGN,
  systemThemeColor: AppConfig.systemMainColor[0],
  showMenuButton: true,
  showFastEnter: true,
  showRefreshButton: true,
  showCrumbs: true,
  showWorkTab: true,
  showLanguage: true,
  showNprogress: true,
  showSettingGuide: true,
  showFestivalText: false,
  watermarkVisible: false,
  autoClose: false,
  uniqueOpened: true,
  colorWeak: false,
  refresh: false,
  holidayFireworksLoaded: false,
  boxBorderMode: true,
  pageTransition: "slide-left",
  tabStyle: "tab-google",
  customRadius: "0.75",
  containerWidth: ContainerWidthEnum.FULL,
  festivalDate: "",
};

export const defaultSettings = SETTING_DEFAULT_CONFIG;

export function getSettingDefaults() {
  return { ...SETTING_DEFAULT_CONFIG };
}

export function resetToDefaults(currentSettings) {
  const defaults = getSettingDefaults();
  Object.keys(defaults).forEach((key) => {
    if (key in currentSettings) currentSettings[key] = defaults[key];
  });
}
