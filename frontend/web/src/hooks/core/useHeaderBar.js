/**
 * useHeaderBar - 顶部栏功能管理
 *
 * 统一管理顶部栏各个功能模块的显示状态和配置信息。
 * 提供灵活的功能开关控制，支持动态显示/隐藏顶部栏的各个功能按钮。
 *
 * @module useHeaderBar
 */

import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useSettingStore } from "@/store";
import { headerBarConfig } from "@/config/modules/headerBar";

/**
 * 顶部栏功能管理
 * @returns 顶部栏功能相关的状态和方法
 */
export function useHeaderBar() {
  const settingStore = useSettingStore();

  // 获取顶部栏配置
  const headerBarConfigRef = computed(() => headerBarConfig);

  // 从 store 获取相关状态（含旧版持久化开关：菜单搜索、全屏、字号、通知等）
  const {
    showMenuButton,
    showFastEnter,
    showRefreshButton,
    showCrumbs,
    showLanguage,
    showMenuSearch,
    showFullscreen,
    showSizeSelect,
    showNotification,
  } = storeToRefs(settingStore);

  /** 检查特定功能是否启用 */
  const isFeatureEnabled = (feature) => {
    return headerBarConfigRef.value[feature]?.enabled ?? false;
  };

  /** 获取功能配置信息 */
  const getFeatureConfig = (feature) => {
    return headerBarConfigRef.value[feature];
  };

  const shouldShowMenuButton = computed(() => isFeatureEnabled("menuButton") && showMenuButton.value);

  const shouldShowRefreshButton = computed(
    () => isFeatureEnabled("refreshButton") && showRefreshButton.value,
  );

  const shouldShowFastEnter = computed(() => isFeatureEnabled("fastEnter") && showFastEnter.value);

  const shouldShowBreadcrumb = computed(() => isFeatureEnabled("breadcrumb") && showCrumbs.value);

  // 全局搜索：显示条件 = 配置开启 ∧ 旧版「菜单搜索」开关
  const shouldShowGlobalSearch = computed(
    () => isFeatureEnabled("globalSearch") && showMenuSearch.value,
  );

  const shouldShowFullscreen = computed(
    () => isFeatureEnabled("fullscreen") && showFullscreen.value,
  );

  const shouldShowNotification = computed(
    () => isFeatureEnabled("notification") && showNotification.value,
  );

  /** 语言：以新版设置里的 showLanguage 为准 */
  const shouldShowLanguage = computed(() => isFeatureEnabled("language") && showLanguage.value);

  /** 布局组件尺寸（旧版顶栏独立入口） */
  const shouldShowSizeSelect = computed(
    () => isFeatureEnabled("sizeSelect") && showSizeSelect.value,
  );

  const shouldShowSettings = computed(() => isFeatureEnabled("settings"));

  const shouldShowThemeToggle = computed(() => isFeatureEnabled("themeToggle"));

  const fastEnterMinWidth = computed(() => {
    const config = getFeatureConfig("fastEnter");
    return config?.minWidth || 1200;
  });

  /** 检查功能是否启用（别名） */
  const isFeatureActive = (feature) => isFeatureEnabled(feature);

  /** 获取功能配置（别名） */
  const getFeatureInfo = (feature) => getFeatureConfig(feature);

  /** 获取所有启用的功能列表 */
  const getEnabledFeatures = () => {
    return Object.keys(headerBarConfigRef.value).filter((key) => headerBarConfigRef.value[key]?.enabled);
  };

  /** 获取所有禁用的功能列表 */
  const getDisabledFeatures = () => {
    return Object.keys(headerBarConfigRef.value).filter((key) => !headerBarConfigRef.value[key]?.enabled);
  };

  const getActiveFeatures = () => getEnabledFeatures();

  const getInactiveFeatures = () => getDisabledFeatures();

  return {
    // 配置
    headerBarConfig: headerBarConfigRef,

    // 显示状态计算属性
    shouldShowMenuButton,
    shouldShowRefreshButton,
    shouldShowFastEnter,
    shouldShowBreadcrumb,
    shouldShowGlobalSearch,
    shouldShowFullscreen,
    shouldShowNotification,
    shouldShowLanguage,
    shouldShowSizeSelect,
    shouldShowSettings,
    shouldShowThemeToggle,

    // 配置相关
    fastEnterMinWidth,

    // 方法
    isFeatureEnabled,
    isFeatureActive,
    getFeatureConfig,
    getFeatureInfo,
    getEnabledFeatures,
    getDisabledFeatures,
    getActiveFeatures,
    getInactiveFeatures,
  };
}
