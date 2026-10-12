<template>
  <ElDialog
    v-model="visible"
    title="新增用户"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <UserForm ref="formRef" :form-data="formData" :is-edit="false" />
    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { UserAPI } from '@/api/module_system/user';
import UserForm from '../components/UserForm.vue';

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
  gender: '0',
  dept_id: undefined,
  role_ids: [],
  status: 0,
  description: ''
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
    gender: '0',
    dept_id: undefined,
    role_ids: [],
    status: 0,
    description: ''
  };
  formRef.value?.resetFields();
};

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    await UserAPI.createUser(formData.value);
    ElMessage.success('新增成功');
    visible.value = false;
    emit('success');
  } catch (error) {
    ElMessage.error('新增失败');
  } finally {
    submitLoading.value = false;
  }
};

const handleClose = () => {
  resetForm();
};
</script>
