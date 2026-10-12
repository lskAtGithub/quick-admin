<template>
  <QaDrawer
    v-model="visible"
    title="编辑用户"
    size="450px"
    form-mode="update"
    :confirm-loading="submitLoading"
    @close="handleClose"
    @confirm="handleSubmit"
  >
    <UserForm ref="formRef" :form-data="formData" :is-edit="true" />
  </QaDrawer>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { UserAPI } from '@/api/module_system/user';
import UserForm from '../components/UserForm.vue';
import QaDrawer from '@/components/modal/qa-drawer/index.vue';

defineOptions({ name: 'UserEdit' });

const emit = defineEmits(['success', 'update:modelValue']);

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  userId: { type: Number, default: null }
});

const visible = ref(props.modelValue);
const submitLoading = ref(false);
const formRef = ref();

const formData = ref({
  id: undefined,
  username: '',
  name: '',
  mobile: '',
  email: '',
  dept_id: undefined,
  is_superuser: false,
  status: 0
});

watch(() => props.modelValue, async (val) => {
  visible.value = val;
  if (val && props.userId) {
    await loadUserData();
  }
});

watch(visible, (val) => {
  emit('update:modelValue', val);
});

const loadUserData = async () => {
  try {
    const res = await UserAPI.detailUser(props.userId);
    const data = res.data;
    formData.value = {
      id: data.id,
      username: data.username,
      name: data.name,
      mobile: data.mobile,
      email: data.email,
      dept_id: data.dept_id,
      is_superuser: data.is_superuser,
      status: data.status
    };
  } catch (error) {
    console.error('获取用户详情失败', error);
  }
};

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    await UserAPI.updateUser(formData.value.id, formData.value);
    visible.value = false;
    emit('success');
  } finally {
    submitLoading.value = false;
  }
};

const handleClose = () => {
  formData.value = {
    id: undefined,
    username: '',
    name: '',
    mobile: '',
    email: '',
    dept_id: undefined,
    is_superuser: false,
    status: 0
  };
  formRef.value?.resetFields();
};
</script>
