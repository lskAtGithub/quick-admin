<!--
  全局浮层层组件（占位精简）
  A 轮仅保留出口，后续轮次接入跨页面全局组件（Toast、Modal、新手引导等）。
-->
<template>
  <div class="qa-global-component">
    <slot></slot>
  </div>
</template>

<script setup>
defineOptions({ name: "QaGlobalComponent" });
</script>
