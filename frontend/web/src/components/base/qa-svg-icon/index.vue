<template>
  <Icon v-if="icon" :icon="icon" v-bind="bindAttrs" class="qa-svg-icon inline" />
</template>

<script setup>
import { Icon } from "@iconify/vue";

defineOptions({ name: "QaSvgIcon", inheritAttrs: false });

defineProps({
  icon: {
    type: String,
    default: "",
  },
});

const attrs = useAttrs();

const bindAttrs = computed(() => ({
  class: attrs.class || "",
  style: attrs.style || "",
}));
</script>
