<template>
  <div>
  <QaSectionTitle :title="$t('setting.menu.title')" />
  <div class="setting-box-wrap">
    <button v-for="(item, index) in AppConfig.themeList" :key="item.theme" type="button" class="setting-item"
      :disabled="disabled" :aria-label="$t(`setting.menu.list[${index}]`)" :aria-pressed="item.theme === settingStore.getMenuTheme.theme"
      :title="disabled ? $t('setting.menu.unavailable') : $t(`setting.menu.list[${index}]`)" @click="switchMenuStyles(item.theme)">
      <span class="box" :class="{ 'is-active': item.theme === settingStore.getMenuTheme.theme }"><img :src="item.img" alt="" /></span>
    </button>
  </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useSettingStore } from "@/store";
import { MenuTypeEnum } from "@/enums/appEnum";
import AppConfig from "@/config";

defineOptions({ name: "QaMenuStyleSettings" });
const settingStore = useSettingStore();
const disabled = computed(() => settingStore.isDark || [MenuTypeEnum.TOP, MenuTypeEnum.DUAL_MENU].includes(settingStore.menuType));
const switchMenuStyles = (theme) => {
  if (!disabled.value) settingStore.switchMenuStyles(theme);
};
</script>
