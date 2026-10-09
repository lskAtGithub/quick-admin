<template>
  <ElDialog
    ref="elDialogRef"
    v-model="visible"
    :width="width"
    :draggable="draggable"
    :fullscreen="fullscreen"
    :show-close="false"
    :class="dialogClass"
    :modal-class="modalClass"
    :align-center="alignCenter"
    destroy-on-close
    v-bind="dialogAttrs"
    @close="emit('close')"
    @closed="emit('closed')"
    @opened="emit('opened')"
  >
    <template #header="{ titleId, titleClass, close }">
      <div class="core-overlay-dialog__header">
        <span :id="titleId" :class="titleClass">{{ title }}</span>
        <div class="core-overlay-dialog__actions">
          <ElTooltip :content="fullscreen ? '还原' : '全屏'" placement="top">
            <QaIconButton
              class="core-overlay-icon-btn"
              :icon="fullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-fill'"
              @click="fullscreen = !fullscreen"
            />
          </ElTooltip>
          <ElTooltip content="关闭" placement="top">
            <QaIconButton class="core-overlay-icon-btn" icon="ri:close-line" @click="close" />
          </ElTooltip>
        </div>
      </div>
    </template>
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </ElDialog>
</template>

<script setup>
import { computed, ref, useAttrs, watch } from "vue";
import { ElDialog } from "element-plus";
import QaIconButton from "@/components/actions/qa-icon-button/index.vue";

defineOptions({ name: "QaDialog", inheritAttrs: false });

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "" },
  width: { type: [String, Number], default: "500px" },
  draggable: { type: Boolean, default: true },
  dialogClass: { type: String, default: "" },
  modalClass: { type: String, default: "" },
  closeOnClickModal: { type: Boolean, default: true },
  closeOnPressEscape: { type: Boolean, default: true },
  alignCenter: { type: Boolean, default: true },
});

const emit = defineEmits(["update:modelValue", "close", "closed", "opened", "fullscreen-change"]);

const attrs = useAttrs();
const fullscreen = ref(false);

watch(fullscreen, (newVal) => {
  emit("fullscreen-change", newVal);
});

const dialogClass = computed(() => {
  const a = attrs.class;
  return [props.dialogClass, a].filter(Boolean);
});

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const dialogAttrs = computed(() => {
  const a = { ...attrs };
  delete a.class;
  delete a.alignCenter;
  delete a["align-center"];
  delete a.closeOnClickModal;
  delete a["close-on-click-modal"];
  delete a.closeOnPressEscape;
  delete a["close-on-press-escape"];
  return a;
});

const elDialogRef = ref(null);

defineExpose({ elDialogRef });
</script>
