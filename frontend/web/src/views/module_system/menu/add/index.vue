<template>
  <QaDrawer
    v-model="visible"
    title="新增菜单"
    size="500px"
    form-mode="create"
    :confirm-loading="submitLoading"
    @close="handleClose"
    @confirm="handleSubmit"
  >
    <MenuForm ref="formRef" :form-data="formData" :allowed-types="allowedTypes" />
  </QaDrawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { MenuAPI } from '@/api/module_system/menu';
import MenuForm from '../components/MenuForm.vue';
import QaDrawer from '@/components/modal/qa-drawer/index.vue';

defineOptions({ name: 'MenuAdd' });

const emit = defineEmits(['success', 'update:modelValue']);

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  parentId: { type: Number, default: null },
  parentType: { type: Number, default: null }
});

const visible = ref(props.modelValue);
const submitLoading = ref(false);
const formRef = ref();

const createInitial = () => ({
  name: '',
  type: 1,
  icon: null,
  order: 1,
  permission: null,
  route_name: null,
  route_path: null,
  component_path: null,
  redirect: null,
  parent_id: null,
  hidden: false,
  keep_alive: true,
  status: 0
});

const formData = ref(createInitial());

const allowedTypes = computed(() => {
  if (props.parentType === 1) return [1, 2];
  if (props.parentType === 2) return [3];
  return [1, 2, 3];
});

watch(() => props.modelValue, (val) => {
  visible.value = val;
  if (val) {
    formData.value = createInitial();
    if (props.parentId != null) {
      formData.value.parent_id = props.parentId;
      if (props.parentType === 1) {
        formData.value.type = 2;
      } else if (props.parentType === 2) {
        formData.value.type = 3;
      }
    }
    formRef.value?.resetFields();
  }
});

watch(visible, (val) => {
  emit('update:modelValue', val);
});

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    await MenuAPI.create(formData.value);
    visible.value = false;
    emit('success');
  } finally {
    submitLoading.value = false;
  }
};

const handleClose = () => {
  formData.value = createInitial();
  formRef.value?.resetFields();
};
</script>
