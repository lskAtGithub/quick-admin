<template>
  <div class="qa-global-component">
    <component v-for="config in enabledComponents" :key="config.key" :is="config.component" />
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { getEnabledGlobalComponents } from "@/config/modules/component";

defineOptions({ name: "QaGlobalComponent" });
const enabledComponents = computed(() => getEnabledGlobalComponents());
</script>
