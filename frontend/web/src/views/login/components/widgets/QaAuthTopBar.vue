<template>
  <header
    class="auth-top-bar pointer-events-none fixed left-0 right-0 top-0 z-100 flex items-center justify-between gap-3 bg-transparent px-5 py-4.5 md:gap-4 md:px-10"
  >
    <div class="pointer-events-auto flex min-w-0 flex-1 items-center gap-3">
      <QaLogo class="icon shrink-0" size="46" :src="webLogoSrc" />
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="auth-top-bar__site-title">{{ siteTitle }}</h1>
          <ElTooltip :content="displayVersion" placement="bottom">
            <div class="logo-version-badge shrink-0">
              <span class="logo-version-pill">{{ displayVersion }}</span>
            </div>
          </ElTooltip>
        </div>
      </div>
    </div>

    <div
      class="auth-top-bar-actions-panel pointer-events-auto flex shrink-0 items-center justify-center gap-1.5 px-2 py-1.5 max-sm:mr-1"
    >
      <div class="color-picker-expandable relative flex items-center max-sm:hidden!">
        <div
          class="color-dots absolute right-0 rounded-full flex items-center gap-2 rounded-5 px-2.5 py-2 pr-9 pl-2.5 opacity-0"
        >
          <div
            v-for="(color, index) in mainColors"
            :key="color"
            class="color-dot relative size-5 cursor-pointer flex items-center justify-center rounded-full opacity-0"
            :class="{ active: color === systemThemeColor }"
            :style="{ background: color, '--index': index }"
            @click="changeThemeColor(color)"
          >
            <QaSvgIcon v-if="color === systemThemeColor" icon="ri:check-fill" class="text-white" />
          </div>
        </div>
        <div
          class="btn palette-btn auth-top-bar__action relative z-2 h-8 w-8 cursor-pointer flex items-center justify-center transition duration-300"
        >
          <QaSvgIcon icon="ri:palette-line" class="text-xl transition-colors duration-300" />
        </div>
      </div>
      <ElDropdown v-if="panelAlign != null" @command="onPanelAlign" popper-class="langDropDownStyle">
        <div
          class="btn layout-align-btn auth-top-bar__action h-8 w-8 cursor-pointer flex items-center justify-center transition duration-300"
          :title="$t('login.panelAlign.label')"
        >
          <QaSvgIcon
            :icon="panelAlignTriggerIcon"
            class="text-xl text-g-800 transition-colors duration-300"
          />
        </div>
        <template #dropdown>
          <ElDropdownMenu>
            <div v-for="opt in layoutAlignOptions" :key="opt.value" class="lang-btn-item">
              <ElDropdownItem
                :command="opt.value"
                :class="{ 'is-selected': panelAlign === opt.value }"
              >
                <QaSvgIcon :icon="opt.icon" class="mr-2 text-base" />
                <span class="menu-txt">{{ $t(opt.labelKey) }}</span>
                <QaSvgIcon icon="ri:check-fill" class="text-base" v-if="panelAlign === opt.value" />
              </ElDropdownItem>
            </div>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
      <ElDropdown
        v-if="shouldShowLanguage"
        @command="changeLanguage"
        popper-class="langDropDownStyle"
      >
        <div
          class="btn language-btn auth-top-bar__action h-8 w-8 cursor-pointer flex items-center justify-center transition duration-300"
        >
          <QaSvgIcon
            icon="ri:translate-2"
            class="text-[19px] text-g-800 transition-colors duration-300"
          />
        </div>
        <template #dropdown>
          <ElDropdownMenu>
            <div v-for="lang in languageOptions" :key="lang.value" class="lang-btn-item">
              <ElDropdownItem
                :command="lang.value"
                :class="{ 'is-selected': locale === lang.value }"
              >
                <span class="menu-txt">{{ lang.label }}</span>
                <QaSvgIcon icon="ri:check-fill" class="text-base" v-if="locale === lang.value" />
              </ElDropdownItem>
            </div>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
      <div
        v-if="shouldShowThemeToggle"
        class="btn theme-btn auth-top-bar__action h-8 w-8 cursor-pointer flex items-center justify-center transition duration-300"
        @click="themeAnimation"
      >
        <QaSvgIcon
          :icon="isDark ? 'ri:sun-fill' : 'ri:moon-line'"
          class="text-xl text-g-800 transition-colors duration-300"
        />
      </div>
    </div>
  </header>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useConfigStore, useSettingStore, useUserStore } from "@/store";
import { themeAnimation } from "@/utils/ui";
import { languageOptions } from "@/locales";
import AppConfig from "@/config";
import { DEFAULT_APP_VERSION } from "@/constants/login";

defineOptions({ name: "QaAuthTopBar" });

const props = defineProps({
  panelAlign: { type: String, default: null },
});

const emit = defineEmits(["update:panelAlign"]);

const layoutAlignOptions = [
  { value: "left", icon: "ri:layout-left-2-line", labelKey: "login.panelAlign.left" },
  { value: "center", icon: "ri:layout-column-line", labelKey: "login.panelAlign.center" },
  { value: "right", icon: "ri:layout-right-2-line", labelKey: "login.panelAlign.right" },
];

const panelAlignTriggerIcon = computed(() => {
  const opt = layoutAlignOptions.find((o) => o.value === props.panelAlign);
  return opt?.icon ?? "ri:layout-column-line";
});

function onPanelAlign(cmd) {
  if (cmd === "left" || cmd === "center" || cmd === "right") {
    emit("update:panelAlign", cmd);
  }
}

const configStore = useConfigStore();
const settingStore = useSettingStore();
const userStore = useUserStore();
const { isDark, systemThemeColor } = storeToRefs(settingStore);
// 登录页顶栏始终展示主题 / 语言切换
const shouldShowThemeToggle = computed(() => true);
const shouldShowLanguage = computed(() => true);
const { locale } = useI18n();

const mainColors = AppConfig.systemMainColor;
const themeColorForCss = computed(() => systemThemeColor.value);

const webLogoSrc = computed(
  () => configStore.configData?.logo_url?.config_value?.trim() || undefined
);

const siteTitle = computed(
  () => configStore.configData?.sys_name?.config_value?.trim() || AppConfig.systemInfo.name
);

const displayVersion = computed(() => {
  const raw = configStore.configData?.version?.config_value?.trim();
  const ver = raw || DEFAULT_APP_VERSION;
  return ver.startsWith("v") || ver.startsWith("V") ? ver : `v${ver}`;
});

const changeLanguage = (lang) => {
  if (locale.value === lang) return;
  locale.value = lang;
  settingStore.setLanguage(lang);
  userStore.setLanguage(lang);
};

const changeThemeColor = (color) => {
  if (systemThemeColor.value === color) return;
  settingStore.setThemeColor(color);
};
</script>

<style scoped>
.auth-top-bar__site-title {
  max-width: min(52vw, 28rem);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: clamp(1rem, 2.2vw, 1.25rem);
  font-weight: 600;
  line-height: 1.35;
  color: var(--el-text-color-primary);
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.logo-version-pill {
  display: inline-block;
  padding: 0.28rem 0.6rem;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
  color: var(--el-color-primary);
  letter-spacing: 0.02em;
  background: color-mix(in srgb, var(--el-color-primary) 11%, transparent);
  border: 1px solid color-mix(in srgb, var(--el-color-primary) 28%, transparent);
  border-radius: 999px;
}

/* 右上角操作的整体衬底 */
.auth-top-bar-actions-panel {
  background-color: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-lighter);

  /* 胶囊形：左右两端为半圆弧 */
  border-radius: 9999px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 6%);
  backdrop-filter: blur(10px);
}

.dark .auth-top-bar-actions-panel {
  background-color: rgb(255 255 255 / 8%);
  border-color: rgb(255 255 255 / 12%);
  box-shadow: 0 4px 20px rgb(0 0 0 / 35%);
}

/* 右上角三个操作按钮：悬浮抬升 + 浅底 + 图标随主色 */
.auth-top-bar__action {
  border-radius: 10px;
  transition:
    background-color 0.22s ease,
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.auth-top-bar__action:hover {
  background-color: var(--el-fill-color-light);
  box-shadow: 0 4px 14px rgb(0 0 0 / 8%);
  transform: translateY(-2px);
}

.auth-top-bar__action:hover :deep(.qa-svg-icon) {
  color: var(--el-color-primary);
}

.auth-top-bar__action:active {
  box-shadow: 0 2px 6px rgb(0 0 0 / 6%);
  transform: translateY(0);
  transition-duration: 0.12s;
}

.dark .auth-top-bar__action:hover {
  background-color: rgb(255 255 255 / 10%);
  box-shadow: 0 4px 18px rgb(0 0 0 / 45%);
}

.color-dots {
  pointer-events: none;
  box-shadow: 0 2px 12px var(--qa-gray-300);
  backdrop-filter: blur(10px);
  transform: translateX(10px);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.color-dot {
  box-shadow: 0 2px 4px rgb(0 0 0 / 15%);
  transform: translateX(20px) scale(0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: calc(var(--index) * 0.05s);
}

/* 仅展开调色条后，单颗色块悬浮：描边 + 略放大 */
.color-picker-expandable:hover .color-dot:hover {
  z-index: 1;
  box-shadow:
    0 4px 12px rgb(0 0 0 / 28%),
    0 0 0 2px rgb(255 255 255 / 88%);
  transform: translateX(0) scale(1.16);
}

.color-picker-expandable:hover .color-dots {
  pointer-events: auto;
  opacity: 1;
  transform: translateX(0);
}

.color-picker-expandable:hover .color-dot {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.dark .color-dots {
  background-color: var(--qa-gray-200);
  box-shadow: none;
}

/* 调色盘：图标颜色与当前主题主色一致（含单独悬浮、整块调色区悬浮） */
.palette-btn :deep(.qa-svg-icon) {
  color: v-bind("themeColorForCss");
}

.auth-top-bar__action.palette-btn:hover :deep(.qa-svg-icon) {
  color: v-bind("themeColorForCss");
}

.color-picker-expandable:hover .palette-btn :deep(.qa-svg-icon) {
  color: v-bind("themeColorForCss");
}
</style>
