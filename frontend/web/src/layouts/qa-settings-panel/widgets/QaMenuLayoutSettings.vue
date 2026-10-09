<template>
  <div v-if="width > 1000">
    <QaSectionTitle :title="$t('setting.menuType.title')" />
    <div class="setting-box-wrap">
      <button v-for="(item, index) in configOptions.menuLayoutList" :key="item.value" type="button"
        class="setting-item" :disabled="!isMenuTypeAvailable(item.value)" :aria-pressed="item.value === settingStore.menuType"
        @click="switchMenuLayouts(item.value)">
        <span class="box" :class="{ 'is-active': item.value === settingStore.menuType, 'mt-4': index > 2 }"><img :src="item.img" alt="" /></span>
        <span class="name">{{ $t(`setting.menuType.list[${index}]`) }}</span>
        <small v-if="!isMenuTypeAvailable(item.value)" class="text-xs text-g-500">{{ $t('setting.pending') }}</small>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useWindowSize } from "@vueuse/core";
import { useSettingStore } from "@/store";
import { isMenuTypeAvailable } from "@/utils/settings";
import { useSettingsConfig } from "../composables/useSettingsConfig";
import { useSettingsState } from "../composables/useSettingsState";

defineOptions({ name: "QaMenuLayoutSettings" });
const { width } = useWindowSize();
const settingStore = useSettingStore();
const { configOptions } = useSettingsConfig();
const { switchMenuLayouts } = useSettingsState();
</script>
