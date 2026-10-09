<template>
  <div>
    <QaSectionTitle :title="$t('setting.box.title')" class="mt-10" />
    <div class="flex items-center justify-between gap-1 p-1 mt-5 rounded-lg bg-g-200">
      <button v-for="option in boxStyleOptions" :key="option.value" type="button"
        class="flex-1 h-8.5 text-sm text-center cursor-pointer rounded-md"
        :aria-pressed="isActive(option.value)"
        :class="isActive(option.value) ? 'text-g-800 bg-(--default-box-color) dark:text-white! dark:bg-g-300' : 'hover:bg-black/4'"
        @click="boxStyleHandlers.setBoxMode(option.value)">{{ option.label }}</button>
    </div>
  </div>
</template>

<script setup>
import { useSettingStore } from "@/store";
import { useSettingsConfig } from "../composables/useSettingsConfig";
import { useSettingsHandlers } from "../composables/useSettingsHandlers";

defineOptions({ name: "QaBoxStyleSettings" });
const settingStore = useSettingStore();
const { boxStyleOptions } = useSettingsConfig();
const { boxStyleHandlers } = useSettingsHandlers();
const isActive = (type) => (type === "border-mode") === settingStore.boxBorderMode;
</script>
