<template>
  <ElDialog
    v-model="visible"
    title="编辑用户"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <UserForm ref="formRef" :form-data="formData" :is-edit="true" />
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
  gender: '0',
  dept_id: undefined,
  role_ids: [],
  status: 0,
  description: ''
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
      gender: data.gender || '0',
      dept_id: data.dept_id,
      role_ids: data.role_ids || [],
      status: data.status,
      description: data.description
    };
  } catch (error) {
    ElMessage.error('获取用户详情失败');
  }
};

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    await UserAPI.updateUser(formData.value.id, formData.value);
    ElMessage.success('修改成功');
    visible.value = false;
    emit('success');
  } catch (error) {
    ElMessage.error('修改失败');
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
    gender: '0',
    dept_id: undefined,
    role_ids: [],
    status: 0,
    description: ''
  };
  formRef.value?.resetFields();
};
</script>
