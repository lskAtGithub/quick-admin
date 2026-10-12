<template>
  <QaDrawer
    v-model="visible"
    title="新增用户"
    size="450px"
    form-mode="create"
    :confirm-loading="submitLoading"
    @close="handleClose"
    @confirm="handleSubmit"
  >
    <UserForm ref="formRef" :form-data="formData" :is-edit="false" />
  </QaDrawer>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { UserAPI } from '@/api/module_system/user';
import UserForm from '../components/UserForm.vue';
import QaDrawer from '@/components/modal/qa-drawer/index.vue';

defineOptions({ name: 'UserAdd' });

const emit = defineEmits(['success', 'update:modelValue']);

const props = defineProps({
  modelValue: { type: Boolean, default: false }
});

const visible = ref(props.modelValue);
const submitLoading = ref(false);
const formRef = ref();

const formData = ref({
  username: '',
  password: '',
  name: '',
  mobile: '',
  email: '',
  dept_id: undefined,
  is_superuser: false,
  status: 0
});

watch(() => props.modelValue, (val) => {
  visible.value = val;
  if (val) {
    resetForm();
  }
});

watch(visible, (val) => {
  emit('update:modelValue', val);
});

const resetForm = () => {
  formData.value = {
    username: '',
    password: '',
    name: '',
    mobile: '',
    email: '',
    dept_id: undefined,
    is_superuser: false,
    status: 0
  };
  formRef.value?.resetFields();
};

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    await UserAPI.createUser(formData.value);
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
