import { computed } from "vue";
import { useI18n } from "vue-i18n";
import AppConfig from "@/config";
import { headerBarConfig } from "@/config/modules/headerBar";
import { ContainerWidthEnum } from "@/enums/appEnum";
import { BASIC_SETTING_KEYS } from "@/constants/settings";
import { isSettingAvailable } from "@/utils/settings";

export function useSettingsConfig() {
  const { t } = useI18n();
  const tabStyleOptions = computed(() => [
    { value: "tab-default", label: t("setting.tabStyle.default") },
    { value: "tab-card", label: t("setting.tabStyle.card") },
    { value: "tab-google", label: t("setting.tabStyle.google") },
  ]);
  const pageTransitionOptions = computed(() => [
    { value: "", label: t("setting.transition.list.none") },
    { value: "fade", label: t("setting.transition.list.fade") },
    { value: "slide-left", label: t("setting.transition.list.slideLeft") },
    { value: "slide-bottom", label: t("setting.transition.list.slideBottom") },
    { value: "slide-top", label: t("setting.transition.list.slideTop") },
  ]);
  const customRadiusOptions = ["0", "0.25", "0.5", "0.75", "1"].map((value) => ({ value, label: value }));
  const containerWidthOptions = computed(() => [
    { value: ContainerWidthEnum.FULL, label: t("setting.container.list[0]"), icon: "ri:expand-horizontal-line" },
    { value: ContainerWidthEnum.BOXED, label: t("setting.container.list[1]"), icon: "ri:contract-left-right-line" },
  ]);
  const boxStyleOptions = computed(() => [
    { value: "border-mode", label: t("setting.box.list[0]") },
    { value: "shadow-mode", label: t("setting.box.list[1]") },
  ]);
  const configOptions = {
    mainColors: AppConfig.systemMainColor,
    themeList: AppConfig.settingThemeList,
    menuLayoutList: AppConfig.menuLayoutList,
  };
  const basicSettingsConfig = computed(() => {
    const definitions = {
      showWorkTab: { label: "multiTab" },
      uniqueOpened: { label: "accordion" },
      showMenuButton: { label: "collapseSidebar", headerBarKey: "menuButton" },
      showFastEnter: { label: "fastEnter", headerBarKey: "fastEnter" },
      showRefreshButton: { label: "reloadPage", headerBarKey: "refreshButton" },
      showCrumbs: { label: "breadcrumb", headerBarKey: "breadcrumb", mobileHide: true },
      showLanguage: { label: "language", headerBarKey: "language" },
      showMenuSearch: { label: "menuSearch", headerBarKey: "globalSearch", mobileHide: true },
      showFullscreen: { label: "fullscreenTool", headerBarKey: "fullscreen", mobileHide: true },
      showSizeSelect: { label: "layoutSize", headerBarKey: "sizeSelect", mobileHide: true },
      showNotification: { label: "notificationTool", headerBarKey: "notification", mobileHide: true },
      showNprogress: { label: "progressBar" },
      colorWeak: { label: "weakMode" },
      watermarkVisible: { label: "watermark" },
      showAppLogo: { label: "appLogo" },
      showGuide: { label: "loginGuide" },
      grayMode: { label: "grayMode" },
      userEnableAi: { label: "aiAssistant" },
      menuOpenWidth: { label: "menuWidth", type: "input-number", min: 180, max: 320, step: 10 },
      tabStyle: { label: "tabStyle", type: "select", options: tabStyleOptions.value },
      pageTransition: { label: "pageTransition", type: "select", options: pageTransitionOptions.value },
      customRadius: { label: "borderRadius", type: "select", options: customRadiusOptions },
    };
    return BASIC_SETTING_KEYS.map((key) => {
      const definition = definitions[key];
      const pending = !isSettingAvailable(key);
      const disabled = pending || headerBarConfig[definition.headerBarKey]?.enabled === false;
      return {
        type: "switch", ...definition, key,
        label: t(`setting.basics.list.${definition.label}`),
        disabled,
        disabledReason: disabled ? t(pending ? "setting.pending" : "setting.featureDisabled") : "",
      };
    });
  });
  return { tabStyleOptions, pageTransitionOptions, customRadiusOptions, containerWidthOptions, boxStyleOptions, configOptions, basicSettingsConfig };
}
