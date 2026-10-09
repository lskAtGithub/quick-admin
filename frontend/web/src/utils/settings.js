import {
  AVAILABLE_MENU_TYPES,
  BASIC_SETTING_KEYS,
  PENDING_SETTING_KEYS,
  SETTING_FIELD_MAP,
  STATIC_SETTING_KEYS,
} from "../constants/settings.js";

export function isSettingAvailable(key) {
  return BASIC_SETTING_KEYS.includes(key) && !PENDING_SETTING_KEYS.includes(key);
}

export function isMenuTypeAvailable(type) {
  return AVAILABLE_MENU_TYPES.includes(type);
}

export function createSettingsResetPatch(defaults) {
  const patch = {};
  for (const [configKey, stateKey] of Object.entries(SETTING_FIELD_MAP)) {
    if (defaults[configKey] !== undefined) patch[stateKey] = defaults[configKey];
  }
  if (patch.themeColor !== undefined) patch.systemThemeColor = patch.themeColor;
  return patch;
}

export function getSettingsSnapshot(state, defaults) {
  const snapshot = {};
  for (const key of STATIC_SETTING_KEYS) {
    if (defaults[key] !== undefined) snapshot[key] = defaults[key];
  }
  for (const [configKey, stateKey] of Object.entries(SETTING_FIELD_MAP)) {
    const value = state[stateKey] ?? defaults[configKey];
    if (value !== undefined && typeof value !== "function") snapshot[configKey] = value;
  }
  if (snapshot.themeColor !== undefined) snapshot.systemThemeColor = snapshot.themeColor;
  return snapshot;
}

export function serializeSettingsConfig(state, defaults) {
  return `export const SETTING_DEFAULT_CONFIG = ${JSON.stringify(getSettingsSnapshot(state, defaults), null, 2)};\n`;
}

export function getSettingsFilter(grayMode, colorWeak) {
  return [grayMode && "grayscale(100%)", colorWeak && "invert(80%)"].filter(Boolean).join(" ");
}
