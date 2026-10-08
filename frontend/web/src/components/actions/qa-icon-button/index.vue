<!-- 图标按钮组件 -->
<template>
  <div
    class="qa-icon-button size-8.5 inline-flex items-center justify-center cursor-pointer text-g-600 dark:text-g-800 text-xl rounded transition duration-300 hover:bg-hover-color"
    :class="{ 'rounded-full': circle }"
  >
    <QaSvgIcon :icon="icon"></QaSvgIcon>
    <slot></slot>
  </div>
</template>

<script setup>
defineOptions({ name: "QaIconButton" });

defineProps({
  /** 图标名称 */
  icon: { type: String, required: true },
  /** 圆角按钮 */
  circle: { type: Boolean, default: false },
});
</script>

<style lang="scss" scoped>
.qa-icon-button {
  &:hover :deep(.qa-svg-icon) {
    color: var(--el-color-primary);
  }
}
</style>
