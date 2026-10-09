<template>
  <div class="qa-card-banner rounded border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div v-if="$slots.header || title" class="mb-4 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
      <slot name="header">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">{{ title }}</h3>
      </slot>
    </div>
    <div class="qa-card-banner__content">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "QaCardBanner" });

defineProps({
  title: { type: String, default: "" },
});
</script>
