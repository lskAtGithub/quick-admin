<template>
  <div class="flex justify-end">
    <button type="button" :aria-label="$t('setting.close')" class="flex items-center justify-center cursor-pointer size-7.5 rounded hover:bg-g-300/80" @click="$emit('close')">
      <QaSvgIcon icon="ri:close-fill" class="block text-xl text-g-600" />
    </button>
  </div>
</template>

<script setup>
defineOptions({ name: "QaSettingHeader" });
defineEmits(["close"]);
</script>
