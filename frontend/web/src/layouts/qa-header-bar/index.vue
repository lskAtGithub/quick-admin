<!-- 顶部栏 -->
<template>
  <div
    class="w-full bg-(--default-bg-color)"
    :class="[
      tabStyle === 'tab-card' || tabStyle === 'tab-google' || tabStyle === 'tab-default'
        ? 'max-sm:mb-3 bg-box!'
        : '',
    ]"
  >
    <div
      class="relative box-border flex justify-between h-15 leading-15 select-none"
      :class="[
        tabStyle === 'tab-card' || tabStyle === 'tab-google' || tabStyle === 'tab-default'
          ? 'border-b border-(--qa-card-border)'
          : '',
      ]"
    >
      <div class="flex items-center flex-1 min-w-0 leading-15" :style="{ display: 'flex' }">
        <!-- 系统信息：Logo + 标题一并受「显示应用 Logo」控制 -->
        <div
          class="flex items-center cursor-pointer"
          @click="toHome"
          v-if="isTopMenu && showAppLogo"
        >
          <QaLogo class="pl-4.5" :src="headerLogoSrc" />
          <p v-if="width >= 1400" class="my-0 mx-2 ml-2 text-lg">{{ headerSystemName }}</p>
        </div>

        <QaLogo
          v-if="showAppLogo"
          class="hidden! pl-3.5 overflow-hidden align-[-0.15em] fill-current"
          :src="headerLogoSrc"
          @click="toHome"
        />

        <!-- 菜单按钮 -->
        <QaIconButton
          v-if="isLeftMenu && shouldShowMenuButton"
          icon="ri:menu-2-fill"
          class="ml-3 max-sm:ml-1.75"
          @click="visibleMenu"
        />

        <!-- 刷新按钮 -->
        <QaIconButton
          v-if="shouldShowRefreshButton"
          icon="ri:refresh-line"
          class="ml-3! refresh-btn max-sm:hidden!"
          :style="{ marginLeft: !isLeftMenu ? '10px' : '0' }"
          @click="reload"
        />

        <!-- 面包屑 -->
        <QaBreadcrumb
          v-if="(shouldShowBreadcrumb && isLeftMenu) || (shouldShowBreadcrumb && isDualMenu)"
        />
      </div>

      <div id="app-header-toolbar" class="flex items-center gap-2.5">
        <!-- 全屏按钮 -->
        <QaIconButton
          v-if="shouldShowFullscreen"
          :icon="isFullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-fill'"
          :class="[!isFullscreen ? 'full-screen-btn' : 'exit-full-screen-btn', 'ml-3']"
          class="max-md:hidden!"
          @click="toggleFullScreen"
        />

        <!-- 国际化按钮 -->
        <ElDropdown @command="changeLanguage" popper-class="langDropDownStyle" v-if="shouldShowLanguage">
          <QaIconButton icon="ri:translate-2" class="language-btn text-[19px]" />
          <template #dropdown>
            <ElDropdownMenu>
              <div v-for="item in languageOptions" :key="item.value" class="lang-btn-item">
                <ElDropdownItem
                  :command="item.value"
                  :class="{ 'is-selected': locale === item.value }"
                >
                  <span class="menu-txt">{{ item.label }}</span>
                  <QaSvgIcon icon="ri:check-fill" v-if="locale === item.value" />
                </ElDropdownItem>
              </div>
            </ElDropdownMenu>
          </template>
        </ElDropdown>

        <!-- 主题切换按钮 -->
        <QaIconButton
          v-if="shouldShowThemeToggle"
          @click="themeAnimation"
          :icon="isDark ? 'ri:sun-fill' : 'ri:moon-line'"
        />

        <!-- 用户头像、菜单 -->
        <QaUserMenu />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useFullscreen, useWindowSize } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { MenuTypeEnum } from "@/enums/appEnum";
import { useSettingStore, useUserStore, useConfigStore } from "@/store";
import AppConfig from "@/config";
import { languageOptions } from "@/locales";
import { themeAnimation } from "@/utils/ui";
import { useCommon } from "@/hooks/core/useCommon";
import { useHeaderBar } from "@/hooks/core/useHeaderBar";
import QaUserMenu from "./widgets/QaUserMenu.vue";

defineOptions({ name: "QaHeaderBar" });

const router = useRouter();
const { locale, t } = useI18n();
const { width } = useWindowSize();

const settingStore = useSettingStore();
const userStore = useUserStore();
const configStore = useConfigStore();

/** 租户配置：logo_url / sys_name */
const headerLogoSrc = computed(() => {
  const raw = configStore.configData.logo_url?.config_value;
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
});

const headerSystemName = computed(() => {
  const raw = configStore.configData.sys_name?.config_value;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return AppConfig.systemInfo.name;
});

// 顶部栏功能配置（A 轮裁切：横向/混合菜单、快速入口、搜索、通知、设置、尺寸、页签）
const {
  shouldShowMenuButton,
  shouldShowRefreshButton,
  shouldShowBreadcrumb,
  shouldShowFullscreen,
  shouldShowLanguage,
  shouldShowThemeToggle,
} = useHeaderBar();

const { menuOpen, menuType, isDark, tabStyle, showAppLogo } = storeToRefs(settingStore);
const { language } = storeToRefs(userStore);

// 菜单类型判断
const isLeftMenu = computed(() => menuType.value === MenuTypeEnum.LEFT);
const isDualMenu = computed(() => menuType.value === MenuTypeEnum.DUAL_MENU);
const isTopMenu = computed(() => menuType.value === MenuTypeEnum.TOP);

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

const { homePath, refresh } = useCommon();

onMounted(() => {
  initLanguage();
});

/** 切换全屏状态 */
const toggleFullScreen = () => {
  toggleFullscreen();
};

/** 切换菜单显示/隐藏状态 */
const visibleMenu = () => {
  settingStore.setMenuOpen(!menuOpen.value);
};

/** 跳转到首页 */
const toHome = () => {
  router.push(homePath.value);
};

/** 刷新页面 */
const reload = async () => {
  refresh();
  ElMessage.success({
    message: t("worktab.refreshCacheDone"),
    duration: 3000,
  });
};

/** 初始化语言设置 */
const initLanguage = () => {
  locale.value = language.value;
};

/** 切换系统语言 */
const changeLanguage = (lang) => {
  if (locale.value === lang) return;
  locale.value = lang;
  userStore.setLanguage(lang);
  reload();
};
</script>

<style lang="scss" scoped>
/* Custom animations */
@keyframes rotate180 {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(180deg);
  }
}

@keyframes expand {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes shrink {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.9);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes moveUp {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-3px);
  }

  100% {
    transform: translateY(0);
  }
}

/* Hover animation classes */
.refresh-btn:hover :deep(.qa-svg-icon) {
  animation: rotate180 0.5s;
}

.language-btn:hover :deep(.qa-svg-icon) {
  animation: moveUp 0.4s;
}

.full-screen-btn:hover :deep(.qa-svg-icon) {
  animation: expand 0.6s forwards;
}

.exit-full-screen-btn:hover :deep(.qa-svg-icon) {
  animation: shrink 0.6s forwards;
}

/* iPad breakpoint adjustments */
@media screen and (width <= 768px) {
  .logo2 {
    display: block !important;
  }
}

@media screen and (width <= 640px) {
  .btn-box {
    width: 40px;
  }
}
</style>
