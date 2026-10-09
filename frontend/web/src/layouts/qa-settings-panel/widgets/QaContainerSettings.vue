<template>
  <div>
    <QaSectionTitle :title="$t('setting.container.title')" class="mt-12.5" />
    <div class="flex">
      <button v-for="option in containerWidthOptions" :key="option.value" type="button"
        class="flex items-center justify-center flex-1 h-16 mt-5 mr-3.5 mb-3.5 cursor-pointer border-2 rounded-lg text-g-800 last:mr-0"
        :aria-pressed="settingStore.containerWidth === option.value"
        :class="settingStore.containerWidth === option.value ? 'border-theme text-theme!' : 'border-(--default-border)'"
        @click="containerHandlers.setWidth(option.value)">
        <QaSvgIcon :icon="option.icon" class="mr-2 text-lg" />
        <span class="text-sm">{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useSettingStore } from "@/store";
import { useSettingsConfig } from "../composables/useSettingsConfig";
import { useSettingsHandlers } from "../composables/useSettingsHandlers";

defineOptions({ name: "QaContainerSettings" });
const settingStore = useSettingStore();
const { containerWidthOptions } = useSettingsConfig();
const { containerHandlers } = useSettingsHandlers();
</script>
