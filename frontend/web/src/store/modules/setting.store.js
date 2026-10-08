import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { usePreferredDark } from "@vueuse/core";
import { store } from "@/store";
import AppConfig from "@/config";
import { SETTING_DEFAULT_CONFIG as D, defaultSettings } from "@/config/setting";
import {
  SystemThemeEnum,
  MenuTypeEnum,
  MenuThemeEnum,
  LanguageEnum,
  ContainerWidthEnum,
} from "@/enums/appEnum";
import { ThemeMode, SidebarColor } from "@/enums/themeEnum";
import { LayoutMode } from "@/enums/layoutEnum";
import {
  setElementThemeColor,
  generateThemeColors,
  applyTheme,
  toggleDarkMode,
  toggleSidebarColor,
} from "@/utils/ui";
import { formatToDate } from "@/utils/date";
import { StorageConfig } from "@/utils/storage";

export const useSettingStore = defineStore(
  "setting",
  () => {
    const prefersDark = usePreferredDark();

    // 菜单
    const menuType = ref(D.menuType);
    const menuOpenWidth = ref(D.menuOpenWidth);
    const menuOpen = ref(D.menuOpen);
    const dualMenuShowText = ref(D.dualMenuShowText);

    // 主题
    const systemThemeType = ref(D.systemThemeType);
    const systemThemeMode = ref(D.systemThemeMode);
    const menuThemeType = ref(D.menuThemeType);
    const systemThemeColor = ref(D.systemThemeColor);
    const theme = ref(D.theme);
    const themeColor = ref(D.themeColor);

    // 显示
    const showMenuButton = ref(D.showMenuButton);
    const showFastEnter = ref(D.showFastEnter);
    const showRefreshButton = ref(D.showRefreshButton);
    const showCrumbs = ref(D.showCrumbs);
    const showWorkTab = ref(D.showWorkTab);
    const showLanguage = ref(D.showLanguage);
    const showNprogress = ref(D.showNprogress);
    const showSettingGuide = ref(D.showSettingGuide);
    const showFestivalText = ref(D.showFestivalText);
    const watermarkVisible = ref(D.watermarkVisible);

    // 功能
    const autoClose = ref(D.autoClose);
    const uniqueOpened = ref(D.uniqueOpened);
    const colorWeak = ref(D.colorWeak);
    const refresh = ref(D.refresh);
    const holidayFireworksLoaded = ref(D.holidayFireworksLoaded);

    // 样式
    const boxBorderMode = ref(D.boxBorderMode);
    const pageTransition = ref(D.pageTransition);
    const tabStyle = ref(D.tabStyle);
    const customRadius = ref(D.customRadius);
    const containerWidth = ref(D.containerWidth);

    // 节日
    const festivalDate = ref("");

    // 面板开关（非持久化）
    const settingsVisible = ref(false);

    // 持久化：界面显示
    const showTagsView = ref(D.showTagsView);
    const showAppLogo = ref(D.showAppLogo);
    const showWatermark = ref(D.showWatermark);
    const showSettings = ref(D.showSettings);
    const showGuide = ref(D.showGuide);

    // 持久化：桌面端工具
    const showMenuSearch = ref(D.showMenuSearch);
    const showFullscreen = ref(D.showFullscreen);
    const showSizeSelect = ref(D.showSizeSelect);
    const showLangSelect = ref(D.showLangSelect);
    const showNotification = ref(D.showNotification);

    // 持久化：布局与主题
    const sidebarColorScheme = ref(D.sidebarColorScheme);
    const layout = ref(D.layout);
    const language = ref(D.language);

    // 持久化：系统设置
    const grayMode = ref(D.grayMode);
    const userEnableAi = ref(D.aiEnabled);
    const pageSwitchingAnimation = ref(D.pageSwitchingAnimation);

    const isDark = computed(() => systemThemeMode.value === SystemThemeEnum.DARK);

    const getMenuTheme = computed(() => {
      if (isDark.value) return AppConfig.darkMenuStyles[0];
      return AppConfig.themeList.filter((item) => item.theme === menuThemeType.value)[0];
    });

    const getMenuOpenWidth = computed(() => `${menuOpenWidth.value ?? D.menuOpenWidth}px`);

    const getCustomRadius = computed(() => `${customRadius.value ?? D.customRadius}rem`);

    const isShowFireworks = computed(() => festivalDate.value !== formatToDate(new Date()));

    const settingsMap = {
      showTagsView,
      showAppLogo,
      showWatermark,
      showSettings,
      showGuide,
      showMenuSearch,
      showFullscreen,
      showSizeSelect,
      showLangSelect,
      showNotification,
      sidebarColorScheme,
      layout,
      grayMode,
      userEnableAi,
      theme,
      themeColor,
    };

    function resolveMode(t) {
      if (t === SystemThemeEnum.AUTO) return prefersDark.value ? SystemThemeEnum.DARK : SystemThemeEnum.LIGHT;
      return t;
    }

    function applyThemeAndMode() {
      const mode = resolveMode(theme.value);
      systemThemeType.value = mode;
      systemThemeMode.value = mode;
      const dark = mode === SystemThemeEnum.DARK;
      toggleDarkMode(dark);
      document.documentElement.classList.toggle(SystemThemeEnum.DARK, dark);
      try {
        applyTheme(generateThemeColors(themeColor.value, dark ? ThemeMode.DARK : ThemeMode.LIGHT));
      } catch (error) {
        console.error("[SettingStore] 主题初始化失败:", error);
      }
      setElementThemeColor(themeColor.value);
    }

    watch([theme, themeColor], () => applyThemeAndMode(), { immediate: true });

    watch(
      [sidebarColorScheme],
      ([scheme]) => toggleSidebarColor(scheme === SidebarColor.CLASSIC_BLUE),
      { immediate: true },
    );

    watch(grayMode, (v) => {
      document.documentElement.style.filter = v ? "grayscale(100%)" : "";
    }, { immediate: true });

    watch(customRadius, (v) => {
      document.documentElement.style.setProperty("--custom-radius", `${v}rem`);
    }, { immediate: true });

    function switchThemeStyles(val) {
      theme.value = val;
    }

    function initializeTheme() {
      applyThemeAndMode();
      watch(
        prefersDark,
        () => {
          if (theme.value === SystemThemeEnum.AUTO) applyThemeAndMode();
        },
        { immediate: false },
      );
    }

    function setThemeColor(color) {
      themeColor.value = color;
      systemThemeColor.value = color;
    }

    function setElementTheme(themeVal) {
      systemThemeColor.value = themeVal;
      themeColor.value = themeVal;
      setElementThemeColor(themeVal);
    }

    function setGlopTheme(themeVal, themeModeVal) {
      if (themeVal !== undefined) theme.value = themeVal;
      if (themeModeVal !== undefined) systemThemeMode.value = themeModeVal;
      localStorage.setItem(StorageConfig.THEME_KEY, themeVal ?? theme.value);
      applyThemeAndMode();
    }

    function applyMode(mode) {
      switchThemeStyles(mode);
    }

    function resolveAndApply() {
      applyThemeAndMode();
    }

    function setLanguage(lang) {
      if (lang === undefined) {
        language.value = language.value === LanguageEnum.ZH ? LanguageEnum.EN : LanguageEnum.ZH;
      } else {
        language.value = lang;
      }
    }

    function toggleShowLanguage() {
      showLanguage.value = !showLanguage.value;
    }

    function setShowGuide(val) {
      showGuide.value = val;
    }

    const switchMenuLayouts = (type) => { menuType.value = type; };
    const setMenuOpenWidth = (width) => { menuOpenWidth.value = width; };
    const switchMenuStyles = (themeVal) => { menuThemeType.value = themeVal; };
    const setBorderMode = () => { boxBorderMode.value = !boxBorderMode.value; };
    const setContainerWidth = (width) => { containerWidth.value = width; };
    const setUniqueOpened = () => { uniqueOpened.value = !uniqueOpened.value; };
    const setButton = () => { showMenuButton.value = !showMenuButton.value; };
    const setFastEnter = () => { showFastEnter.value = !showFastEnter.value; };
    const setAutoClose = () => { autoClose.value = !autoClose.value; };
    const setShowRefreshButton = () => { showRefreshButton.value = !showRefreshButton.value; };
    const setCrumbs = () => { showCrumbs.value = !showCrumbs.value; };
    const setWorkTab = (show) => { showWorkTab.value = show; };
    const setNprogress = () => { showNprogress.value = !showNprogress.value; };
    const setColorWeak = () => { colorWeak.value = !colorWeak.value; };
    const hideSettingGuide = () => { showSettingGuide.value = false; };
    const openSettingGuide = () => { showSettingGuide.value = true; };
    const setPageTransition = (transition) => { pageTransition.value = transition; };
    const setTabStyle = (style) => { tabStyle.value = style; };
    const setMenuOpen = (open) => { menuOpen.value = open; };
    const reload = () => { refresh.value = !refresh.value; };
    const setWatermarkVisible = (visible) => { watermarkVisible.value = visible; };
    const setCustomRadius = (radius) => {
      customRadius.value = radius;
      document.documentElement.style.setProperty("--custom-radius", `${radius}rem`);
    };
    const setholidayFireworksLoaded = (isLoad) => { holidayFireworksLoaded.value = isLoad; };
    const setShowFestivalText = (show) => { showFestivalText.value = show; };
    const setFestivalDate = (date) => { festivalDate.value = date; };
    const setDualMenuShowText = (show) => { dualMenuShowText.value = show; };

    function updateSetting(key, value) {
      const setting = settingsMap[key];
      if (setting) setting.value = value;
    }

    const updateTheme = (newTheme) => { theme.value = newTheme; };
    const updateThemeColor = (newColor) => { themeColor.value = newColor; };
    const updateSidebarColorScheme = (newScheme) => { sidebarColorScheme.value = newScheme; };
    const updateLayout = (newLayout) => { layout.value = newLayout; };
    const toggleSettingsPanel = () => { settingsVisible.value = !settingsVisible.value; };
    const showSettingsPanel = () => { settingsVisible.value = true; };
    const hideSettingsPanel = () => { settingsVisible.value = false; };
    const updateUserEnableAi = (v) => { userEnableAi.value = v; };
    const updateGrayMode = (v) => { grayMode.value = v; };
    const updatePageSwitchingAnimation = (v) => { pageSwitchingAnimation.value = v; };

    function resetSettings() {
      showTagsView.value = defaultSettings.showTagsView;
      showAppLogo.value = defaultSettings.showAppLogo;
      showWatermark.value = defaultSettings.showWatermark;
      showSettings.value = defaultSettings.showSettings;
      showGuide.value = defaultSettings.showGuide;
      showMenuSearch.value = defaultSettings.showMenuSearch;
      showFullscreen.value = defaultSettings.showFullscreen;
      showSizeSelect.value = defaultSettings.showSizeSelect;
      showLangSelect.value = defaultSettings.showLangSelect;
      showNotification.value = defaultSettings.showNotification;
      sidebarColorScheme.value = defaultSettings.sidebarColorScheme;
      layout.value = defaultSettings.layout;
      themeColor.value = defaultSettings.themeColor;
      theme.value = defaultSettings.theme;
      grayMode.value = defaultSettings.grayMode;
      userEnableAi.value = defaultSettings.aiEnabled;
      pageSwitchingAnimation.value = defaultSettings.pageSwitchingAnimation;
    }

    return {
      menuType,
      menuOpenWidth,
      menuOpen,
      dualMenuShowText,
      systemThemeType,
      systemThemeMode,
      menuThemeType,
      systemThemeColor,
      theme,
      themeColor,
      showMenuButton,
      showFastEnter,
      showRefreshButton,
      showCrumbs,
      showWorkTab,
      showLanguage,
      showNprogress,
      showSettingGuide,
      showFestivalText,
      watermarkVisible,
      autoClose,
      uniqueOpened,
      colorWeak,
      refresh,
      holidayFireworksLoaded,
      boxBorderMode,
      pageTransition,
      tabStyle,
      customRadius,
      containerWidth,
      festivalDate,
      settingsVisible,
      showTagsView,
      showAppLogo,
      showWatermark,
      showSettings,
      showGuide,
      showMenuSearch,
      showFullscreen,
      showSizeSelect,
      showLangSelect,
      showNotification,
      sidebarColorScheme,
      layout,
      language,
      grayMode,
      userEnableAi,
      pageSwitchingAnimation,

      isDark,
      getMenuTheme,
      getMenuOpenWidth,
      getCustomRadius,
      isShowFireworks,

      switchThemeStyles,
      initializeTheme,
      setThemeColor,
      setElementTheme,
      setGlopTheme,
      applyMode,
      resolveAndApply,
      setLanguage,
      toggleShowLanguage,
      setShowGuide,
      switchMenuLayouts,
      setMenuOpenWidth,
      switchMenuStyles,
      setBorderMode,
      setContainerWidth,
      setUniqueOpened,
      setButton,
      setFastEnter,
      setAutoClose,
      setShowRefreshButton,
      setCrumbs,
      setWorkTab,
      setNprogress,
      setColorWeak,
      hideSettingGuide,
      openSettingGuide,
      setPageTransition,
      setTabStyle,
      setMenuOpen,
      reload,
      setWatermarkVisible,
      setCustomRadius,
      setholidayFireworksLoaded,
      setShowFestivalText,
      setFestivalDate,
      setDualMenuShowText,
      updateSetting,
      updateTheme,
      updateThemeColor,
      updateSidebarColorScheme,
      updateLayout,
      toggleSettingsPanel,
      showSettingsPanel,
      hideSettingsPanel,
      updateUserEnableAi,
      updateGrayMode,
      updatePageSwitchingAnimation,
      resetSettings,
    };
  },
  {
    persist: {
      key: "setting",
      storage: localStorage,
      pick: [
        "theme", "themeColor", "systemThemeColor", "language", "showGuide",
        "layout", "sidebarColorScheme", "menuType", "menuOpen", "menuOpenWidth",
        "menuThemeType", "showWorkTab", "showTagsView", "showCrumbs", "showFastEnter",
        "showMenuButton", "showLanguage", "showNotification", "showMenuSearch",
        "showFullscreen", "showSizeSelect", "showLangSelect", "showAppLogo",
        "showWatermark", "watermarkVisible", "pageTransition", "tabStyle",
        "boxBorderMode", "containerWidth", "customRadius", "grayMode",
        "userEnableAi", "pageSwitchingAnimation",
      ],
    },
  },
);

export function useSettingStoreHook() {
  return useSettingStore(store);
}
