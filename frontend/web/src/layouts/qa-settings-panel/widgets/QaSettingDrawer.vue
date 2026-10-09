<template>
  <ElDrawer
    v-model="visible"
    size="min(300px, 100vw)"
    :title="$t('setting.title')"
    :lock-scroll="true"
    :with-header="false"
    :destroy-on-close="false"
    append-to-body
    modal-class="qa-setting-modal"
    @open="$emit('open')"
    @close="$emit('close')"
  >
    <div class="drawer-con"><slot /></div>
  </ElDrawer>
</template>

<script setup>
defineOptions({ name: "QaSettingDrawer" });
const visible = defineModel({ type: Boolean, default: false });
defineEmits(["open", "close"]);
</script>
