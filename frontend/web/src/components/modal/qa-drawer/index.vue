<template>
  <ElDrawer
    v-model="visible"
    :size="size"
    :direction="direction"
    :show-close="false"
    :class="drawerClass"
    resizable
    destroy-on-close
    @close="emit('close')"
    @opened="emit('opened')"
  >
    <template #header>
      <div class="qa-drawer-header">
        <span class="qa-drawer-title">{{ title }}</span>
        <div class="qa-drawer-actions">
          <ElTooltip content="关闭" placement="top">
            <QaIconButton icon="ri:close-line" @click="visible = false" />
          </ElTooltip>
        </div>
      </div>
    </template>
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
    <template v-else-if="formMode" #footer>
      <div class="qa-drawer-footer">
        <ElButton v-if="formMode === 'detail'" type="primary" @click="emit('confirm')">
          {{ confirmText || '关闭' }}
        </ElButton>
        <template v-else>
          <ElButton @click="emit('cancel')">{{ cancelText }}</ElButton>
          <ElButton type="primary" :loading="confirmLoading" @click="emit('confirm')">
            {{ confirmText }}
          </ElButton>
        </template>
      </div>
    </template>
  </ElDrawer>
</template>

<script setup>
import { computed, watch } from 'vue';
import QaIconButton from '@/components/actions/qa-icon-button/index.vue';

defineOptions({ name: 'QaDrawer', inheritAttrs: false });

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: [String, Number], default: '450px' },
  direction: { type: String, default: 'rtl' },
  drawerClass: { type: String, default: '' },
  formMode: { type: String, default: undefined },
  confirmLoading: { type: Boolean, default: false },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' }
});

const emit = defineEmits(['update:modelValue', 'close', 'opened', 'cancel', 'confirm', 'submitAndContinue']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<style scoped>
.qa-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.qa-drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.qa-drawer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qa-drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--el-border-color-light);
}
</style>
