import { MenuTypeEnum } from "../enums/appEnum.js";

export const AVAILABLE_MENU_TYPES = Object.freeze([MenuTypeEnum.LEFT]);

export const PENDING_SETTING_KEYS = Object.freeze([
  "showWorkTab", "tabStyle", "showFastEnter", "showMenuSearch", "showSizeSelect",
  "showNotification", "watermarkVisible", "showGuide", "userEnableAi",
]);

export const BASIC_SETTING_KEYS = Object.freeze([
  "showWorkTab", "uniqueOpened", "showMenuButton", "showFastEnter", "showRefreshButton",
  "showCrumbs", "showLanguage", "showMenuSearch", "showFullscreen", "showSizeSelect",
  "showNotification", "showNprogress", "colorWeak", "watermarkVisible", "showAppLogo",
  "showGuide", "grayMode", "userEnableAi", "menuOpenWidth", "tabStyle", "pageTransition",
  "customRadius",
]);

export const SETTING_FIELD_MAP = Object.freeze({
  ...Object.fromEntries([
    "menuType", "menuOpenWidth", "menuOpen", "dualMenuShowText", "theme", "themeColor",
    "systemThemeColor", "menuThemeType", "showSettings", "showMenuButton", "showFastEnter",
    "showRefreshButton", "showCrumbs", "showWorkTab", "showLanguage", "showNprogress",
    "showSettingGuide", "showFestivalText", "watermarkVisible", "autoClose", "uniqueOpened",
    "colorWeak", "boxBorderMode", "pageTransition", "tabStyle", "customRadius", "containerWidth",
    "showTagsView", "showAppLogo", "showWatermark", "showGuide", "showMenuSearch", "showFullscreen",
    "showSizeSelect", "showLangSelect", "showNotification", "sidebarColorScheme", "layout",
    "language", "grayMode", "pageSwitchingAnimation",
  ].map((key) => [key, key])),
  aiEnabled: "userEnableAi",
});

export const STATIC_SETTING_KEYS = Object.freeze([
  "name", "title", "version", "size", "watermarkContent", "guideVisible",
]);
