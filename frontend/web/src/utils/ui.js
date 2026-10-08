import NProgress from "nprogress";
import { ElMessage } from "element-plus";
import "nprogress/nprogress.css";
import { useSettingStore } from "@/store/modules/setting.store";
import { SystemThemeEnum } from "@/enums/appEnum";
import { ThemeMode } from "@/enums/themeEnum";

NProgress.configure({ easing: "ease", speed: 500, showSpinner: false, trickleSpeed: 200, minimum: 0.3 });
export { NProgress };

const { LIGHT, DARK } = SystemThemeEnum;

// -----------------------------
// Colors
// -----------------------------

export function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}

function isValidHexColor(hex) {
  const cleanHex = hex.trim().replace(/^#/, "");
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex);
}

function isValidRgbValue(r, g, b) {
  const isValid = (value) => Number.isInteger(value) && value >= 0 && value <= 255;
  return isValid(r) && isValid(g) && isValid(b);
}

export function hexToRgba(hex, opacity) {
  if (!isValidHexColor(hex)) throw new Error("Invalid hex color format");
  let cleanHex = hex.trim().replace(/^#/, "").toUpperCase();
  if (cleanHex.length === 3) cleanHex = cleanHex.split("").map((c) => c.repeat(2)).join("");
  const [red, green, blue] = cleanHex.match(/\w\w/g).map((x) => parseInt(x, 16));
  const validOpacity = Math.max(0, Math.min(1, opacity));
  return { red, green, blue, rgba: `rgba(${red}, ${green}, ${blue}, ${validOpacity.toFixed(2)})` };
}

export function hexToRgb(hexColor) {
  if (!isValidHexColor(hexColor)) {
    ElMessage.warning("输入错误的hex颜色值");
    throw new Error("Invalid hex color format");
  }
  let hex = hexColor.replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map((c) => c.repeat(2)).join("");
  const hexPairs = hex.match(/../g);
  if (!hexPairs) throw new Error("Invalid hex color format");
  return hexPairs.map((hexPair) => parseInt(hexPair, 16));
}

export function rgbToHex(r, g, b) {
  if (!isValidRgbValue(r, g, b)) {
    ElMessage.warning("输入错误的RGB颜色值");
    throw new Error("Invalid RGB color values");
  }
  const toHex = (value) => {
    const hex = value.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function colourBlend(color1, color2, ratio) {
  const validRatio = Math.max(0, Math.min(1, Number(ratio)));
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const blended = rgb1.map((v, i) => Math.round(v * (1 - validRatio) + rgb2[i] * validRatio));
  return rgbToHex(blended[0], blended[1], blended[2]);
}

export function getDarkColor(color, level) {
  if (!isValidHexColor(color)) {
    ElMessage.warning("输入错误的hex颜色值");
    throw new Error("Invalid hex color format");
  }
  const dark = hexToRgb(color).map((value) => Math.floor(value * (1 - level)));
  return rgbToHex(dark[0], dark[1], dark[2]);
}

export function getLightColor(color, level, isDark = false) {
  if (!isValidHexColor(color)) {
    ElMessage.warning("输入错误的hex颜色值");
    throw new Error("Invalid hex color format");
  }
  if (isDark) return getDarkColor(color, level);
  const light = hexToRgb(color).map((value) => Math.floor(((255 - value) * level + value)));
  return rgbToHex(light[0], light[1], light[2]);
}

export function handleElementThemeColor(theme, isDark = false) {
  const el = document.documentElement.style;
  el.setProperty("--el-color-primary", theme);
  for (let i = 1; i <= 9; i++) el.setProperty(`--el-color-primary-light-${i}`, getLightColor(theme, i / 10, isDark));
  for (let i = 1; i <= 9; i++) el.setProperty(`--el-color-primary-dark-${i}`, getDarkColor(theme, i / 10));
}

export function setElementThemeColor(color) {
  const el = document.documentElement.style;
  el.setProperty("--el-color-primary", color);
  handleElementThemeColor(color, useSettingStore().isDark);
  for (let i = 1; i < 16; i++) {
    el.setProperty(`--el-color-primary-custom-${i}`, colourBlend(color, "#ffffff", i / 16));
  }
}

// -----------------------------
// Theme utils
// -----------------------------

export function generateThemeColors(primary, theme) {
  const colors = { primary };
  for (let i = 1; i <= 9; i++) {
    colors[`primary-light-${i}`] =
      theme === ThemeMode.LIGHT ? getLightColor(primary, i / 10) : getDarkColor(primary, i / 10);
  }
  colors["primary-dark-2"] =
    theme === ThemeMode.LIGHT ? getLightColor(primary, 0.2) : getDarkColor(primary, 0.3);
  return colors;
}

export function applyTheme(colors) {
  const el = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => el.style.setProperty(`--el-color-${key}`, value));
  requestAnimationFrame(() => el.style.setProperty("--theme-update-trigger", Date.now().toString()));
}

export function toggleDarkMode(isDark) {
  if (isDark) document.documentElement.classList.add(ThemeMode.DARK);
  else document.documentElement.classList.remove(ThemeMode.DARK);
}

export function toggleSidebarColor(isBlueSidebar) {
  if (isBlueSidebar) document.documentElement.classList.add("sidebar-color-blue");
  else document.documentElement.classList.remove("sidebar-color-blue");
}

export const TAB_CONFIG = {
  "tab-default": { openTop: 106, closeTop: 60, openHeight: 121, closeHeight: 75 },
  "tab-card": { openTop: 122, closeTop: 78, openHeight: 139, closeHeight: 95 },
  "tab-google": { openTop: 122, closeTop: 78, openHeight: 139, closeHeight: 95 },
};

export const getTabConfig = (style) => TAB_CONFIG[style] || TAB_CONFIG["tab-card"];

// -----------------------------
// Theme animation
// -----------------------------

const toggleTheme = () => {
  const settingStore = useSettingStore();
  settingStore.switchThemeStyles(settingStore.systemThemeMode === LIGHT ? DARK : LIGHT);
};

export const themeAnimation = (e) => {
  const x = e.clientX;
  const y = e.clientY;
  const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  const id = "vt-clip-kf";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = `@keyframes clip{from{clip-path:circle(0% at ${x}px ${y}px)}to{clip-path:circle(${endRadius}px at ${x}px ${y}px)}}`;

  requestAnimationFrame(() => {
    if (document.startViewTransition) document.startViewTransition(() => toggleTheme());
    else toggleTheme();
  });
};
