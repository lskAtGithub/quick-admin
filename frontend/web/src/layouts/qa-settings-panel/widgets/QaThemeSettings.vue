<template>
  <div>
  <QaSectionTitle :title="$t('setting.theme.title')" />
  <div class="setting-box-wrap">
    <button v-for="(item, index) in configOptions.themeList" :key="item.theme" type="button" class="setting-item" :aria-pressed="item.theme === theme" @click="setTheme(item.theme)">
      <span class="box" :class="{ 'is-active': item.theme === theme }"><img :src="item.img" alt="" /></span>
      <span class="name">{{ $t(`setting.theme.list[${index}]`) }}</span>
    </button>
  </div>
  </div>
</template>

<script setup>
import { useTheme } from "@/hooks/core/useTheme";
import { useSettingsConfig } from "../composables/useSettingsConfig";

defineOptions({ name: "QaThemeSettings" });
const { theme, setTheme } = useTheme();
const { configOptions } = useSettingsConfig();
</script>
