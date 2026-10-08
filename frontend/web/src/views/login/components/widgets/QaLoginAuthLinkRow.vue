<template>
  <div
    class="login-auth-link-row mt-6 flex flex-wrap items-center justify-center gap-1 text-sm leading-normal"
  >
    <span class="inline-flex items-center text-(--el-text-color-secondary)">{{ hint }}</span>
    <ElLink
      type="primary"
      underline="never"
      class="inline-flex items-center font-medium leading-[inherit]!"
      @click="$emit('link')"
    >
      {{ linkText }}
    </ElLink>
  </div>
</template>

<script setup>
defineOptions({ name: "QaLoginAuthLinkRow" });

defineProps({
  hint: { type: String, required: true },
  linkText: { type: String, required: true },
});

defineEmits(["link"]);
</script>
