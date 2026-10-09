<template>
  <div>
    <QaSectionTitle :title="$t('setting.basics.title')" class="mt-10" />
    <QaSettingItem
      v-for="config in basicSettingsConfig" :key="config.key" :config="config"
      :model-value="settingStore[config.key]" @change="handleSettingChange(config, $event)"
    />
  </div>
</template>

<script setup>
import { useSettingStore } from "@/store";
import { useSettingsConfig } from "../composables/useSettingsConfig";
import { useSettingsHandlers } from "../composables/useSettingsHandlers";

defineOptions({ name: "QaBasicSettings" });
const settingStore = useSettingStore();
const { basicSettingsConfig } = useSettingsConfig();
const { handleSettingChange } = useSettingsHandlers();
</script>
