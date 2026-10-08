import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { usePreferredDark } from "@vueuse/core";
import { store } from "@/store";
import { SystemThemeEnum, LanguageEnum } from "@/enums/appEnum";
import AppConfig from "@/config";

function mixColor(color, ratio, isDark) {
  const hex = color.replace("#", "");
  const num = parseInt(hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  const target = isDark ? 0 : 255;
  r = Math.round((target - r) * ratio) + r;
  g = Math.round((target - g) * ratio) + g;
  b = Math.round((target - b) * ratio) + b;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export const useSettingStore = defineStore(
  "setting",
  () => {
    const prefersDark = usePreferredDark();

    const theme = ref(SystemThemeEnum.AUTO);
    const systemThemeMode = ref(SystemThemeEnum.LIGHT);
    const systemThemeColor = ref(AppConfig.systemMainColor[0]);
    const language = ref(LanguageEnum.ZH);
    const showGuide = ref(false);

    const isDark = computed(() => systemThemeMode.value === SystemThemeEnum.DARK);

    function setElementTheme(color) {
      const root = document.documentElement;
      const isDarkMode = systemThemeMode.value === SystemThemeEnum.DARK;
      root.style.setProperty("--el-color-primary", color);
      for (let i = 1; i <= 9; i++) {
        root.style.setProperty(
          `--el-color-primary-light-${i}`,
          isDarkMode ? mixColor(color, i / 10, true) : mixColor(color, i / 10, false)
        );
      }
    }

    function applyMode(mode) {
      systemThemeMode.value = mode;
      const style = AppConfig.systemThemeStyles[mode];
      const el = document.getElementsByTagName("html")[0];
      if (style?.className) {
        el.setAttribute("class", style.className);
      } else {
        el.removeAttribute("class");
      }
      setElementTheme(systemThemeColor.value);
    }

    function resolveAndApply() {
      const mode =
        theme.value === SystemThemeEnum.AUTO
          ? prefersDark.value
            ? SystemThemeEnum.DARK
            : SystemThemeEnum.LIGHT
          : theme.value;
      applyMode(mode);
    }

    function switchThemeStyles(val) {
      theme.value = val;
      resolveAndApply();
    }

    function setGlopTheme() {
      resolveAndApply();
    }

    function initializeTheme() {
      resolveAndApply();
      watch(
        prefersDark,
        () => {
          if (theme.value === SystemThemeEnum.AUTO) resolveAndApply();
        },
        { immediate: false }
      );
    }

    function setThemeColor(color) {
      systemThemeColor.value = color;
      setElementTheme(color);
    }

    function setLanguage(lang) {
      language.value = lang;
    }

    function setShowGuide(val) {
      showGuide.value = val;
    }

    return {
      theme,
      systemThemeMode,
      systemThemeColor,
      language,
      showGuide,
      isDark,
      applyMode,
      resolveAndApply,
      switchThemeStyles,
      setGlopTheme,
      initializeTheme,
      setElementTheme,
      setThemeColor,
      setLanguage,
      setShowGuide,
    };
  },
  {
    persist: {
      key: "setting",
      storage: localStorage,
      pick: ["theme", "systemThemeColor", "language", "showGuide"],
    },
  }
);

export function useSettingStoreHook() {
  return useSettingStore(store);
}
