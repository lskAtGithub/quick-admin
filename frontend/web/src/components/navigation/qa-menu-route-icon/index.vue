<!-- 路由 / 侧栏菜单图标：与 IconSelect 存值规则一致（统一走 Iconify） -->
<template>
  <QaSvgIcon
    v-if="resolvedIcon"
    :icon="resolvedIcon"
    :color="color"
    :class="iconClass"
    :style="mergedStyle"
  />
</template>

<script setup>
import { resolveIconForQaSvgIcon } from "@/utils";

defineOptions({ name: "QaMenuRouteIcon", inheritAttrs: false });

const props = defineProps({
  icon: { type: String, default: "" },
  color: { type: String, default: "" },
  class: { type: [String, Array, Object, Boolean], default: undefined },
  style: { type: [Object, String], default: undefined },
});

const resolvedIcon = computed(() => {
  const trimmed = props.icon?.trim() ?? "";
  return trimmed ? resolveIconForQaSvgIcon(trimmed) : "";
});

const iconClass = computed(() =>
  props.class === false || props.class == null ? undefined : props.class
);

const mergedStyle = computed(() => {
  const base = typeof props.style === "object" && props.style !== null ? { ...props.style } : {};
  if (props.color) base.color = props.color;
  return base;
});
</script>
