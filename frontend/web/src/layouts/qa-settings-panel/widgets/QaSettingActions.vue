<template>
  <div class="mt-10 flex gap-4 border-t border-(--default-border) pt-5">
    <ElButton type="primary" class="flex-1 h-8!" @click="handleCopyConfig">{{ $t('setting.actions.copyConfig') }}</ElButton>
    <ElButton type="danger" plain class="flex-1 h-8! ml-0!" :loading="resetting" @click="handleResetConfig">{{ $t('setting.actions.resetConfig') }}</ElButton>
  </div>
</template>

<script setup>
import { nextTick, ref } from "vue";
import { useClipboard } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { useSettingStore } from "@/store";
import { SETTING_DEFAULT_CONFIG } from "@/config/setting";
import { serializeSettingsConfig } from "@/utils/settings";

defineOptions({ name: "QaSettingActions" });
const settingStore = useSettingStore();
const { t } = useI18n();
const { copy, copied } = useClipboard({ legacy: true });
const resetting = ref(false);

const handleCopyConfig = async () => {
  try {
    await copy(serializeSettingsConfig(settingStore, SETTING_DEFAULT_CONFIG));
    if (!copied.value) throw new Error("剪贴板不可用");
    ElMessage.success(t("setting.actions.copySuccess"));
  } catch (error) {
    console.error("复制配置失败:", error);
    ElMessage.error(t("setting.actions.copyFailed"));
  }
};

const handleResetConfig = async () => {
  if (resetting.value) return;
  resetting.value = true;
  try {
    settingStore.resetSettings();
    await nextTick();
    settingStore.$persist();
    window.location.reload();
  } catch (error) {
    resetting.value = false;
    console.error("重置配置失败:", error);
    ElMessage.error(t("setting.actions.resetFailed"));
  }
};
</script>
