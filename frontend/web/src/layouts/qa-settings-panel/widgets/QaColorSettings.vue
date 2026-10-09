<template>
  <div>
    <QaSectionTitle :title="$t('setting.color.title')" class="mt-10" />
    <div class="flex flex-wrap -mr-4">
      <button v-for="color in configOptions.mainColors" :key="color" type="button" :aria-label="color"
        :aria-pressed="color.toLowerCase() === settingStore.themeColor.toLowerCase()"
        class="flex items-center justify-center size-5.75 mr-4 mb-2.5 cursor-pointer rounded-full hover:opacity-85"
        :style="{ background: color }" @click="colorHandlers.selectColor(color)">
        <QaSvgIcon v-if="color.toLowerCase() === settingStore.themeColor.toLowerCase()" icon="ri:check-fill" class="text-base text-white!" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { useSettingStore } from "@/store";
import { useSettingsConfig } from "../composables/useSettingsConfig";
import { useSettingsHandlers } from "../composables/useSettingsHandlers";

defineOptions({ name: "QaColorSettings" });
const settingStore = useSettingStore();
const { configOptions } = useSettingsConfig();
const { colorHandlers } = useSettingsHandlers();
</script>
