<template>
  <QaDrawer
    v-model="visible"
    title="新增角色"
    size="500px"
    form-mode="create"
    :confirm-loading="submitLoading"
    @close="handleClose"
    @confirm="handleSubmit"
  >
    <RoleForm ref="formRef" :form-data="formData" />
  </QaDrawer>
</template>

<script setup>
import { ref, watch } from 'vue';
import { RoleAPI } from '@/api/module_system/role';
import RoleForm from '../components/RoleForm.vue';
import QaDrawer from '@/components/modal/qa-drawer/index.vue';

defineOptions({ name: 'RoleAdd' });

const emit = defineEmits(['success', 'update:modelValue']);

const props = defineProps({
  modelValue: { type: Boolean, default: false }
});

const visible = ref(props.modelValue);
const submitLoading = ref(false);
const formRef = ref();

const formData = ref({
  name: '',
  code: '',
  order: 999,
  status: 0,
  description: '',
  menu_ids: []
});

watch(() => props.modelValue, (val) => {
  visible.value = val;
  if (val) resetForm();
});

watch(visible, (val) => emit('update:modelValue', val));

const resetForm = () => {
  formData.value = {
    name: '',
    code: '',
    order: 999,
    status: 0,
    description: '',
    menu_ids: []
  };
  formRef.value?.resetFields();
};

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    await RoleAPI.create(formData.value);
    visible.value = false;
    emit('success');
  } finally {
    submitLoading.value = false;
  }
};

const handleClose = () => {
  resetForm();
};
</script>
