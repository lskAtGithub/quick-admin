<template>
  <div class="flex items-center justify-between gap-2 mb-4 last:mb-2" :class="{ 'mobile-hide': config.mobileHide }" :data-setting="config.key">
    <div class="min-w-0 text-sm">
      <span>{{ config.label }}</span>
      <small v-if="config.disabledReason" class="block text-xs text-g-500">{{ config.disabledReason }}</small>
    </div>
    <ElSwitch v-if="config.type === 'switch'" :model-value="modelValue" :disabled="config.disabled" :aria-label="config.label" @change="handleChange" />
    <ElInputNumber
      v-else-if="config.type === 'input-number'"
      :model-value="modelValue" :min="config.min" :max="config.max" :step="config.step"
      :disabled="config.disabled" :aria-label="config.label" controls-position="right"
      class="w-30! shrink-0" @change="handleChange"
    />
    <ElSelect v-else-if="config.type === 'select'" :model-value="modelValue" :disabled="config.disabled" :aria-label="config.label" class="w-30! shrink-0" @change="handleChange">
      <ElOption v-for="option in config.options" :key="option.value" :label="option.label" :value="option.value" />
    </ElSelect>
  </div>
</template>

<script setup>
defineOptions({ name: "QaSettingItem" });
const props = defineProps({
  config: { type: Object, required: true },
  modelValue: { type: [Boolean, String, Number], required: true },
});
const emit = defineEmits(["change"]);
const handleChange = (value) => {
  if (!props.config.disabled) emit("change", value);
};
</script>

<style lang="scss" scoped>
@media screen and (width <= 800px) {
  .mobile-hide { display: none !important; }
}
</style>
