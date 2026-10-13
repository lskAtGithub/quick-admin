<template>
  <QaDrawer
    v-model="visible"
    title="编辑角色"
    size="500px"
    form-mode="update"
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

defineOptions({ name: 'RoleEdit' });

const emit = defineEmits(['success', 'update:modelValue']);

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  roleId: { type: Number, default: null }
});

const visible = ref(props.modelValue);
const submitLoading = ref(false);
const formRef = ref();

const formData = ref({
  id: undefined,
  name: '',
  code: '',
  order: 999,
  status: 0,
  description: '',
  menu_ids: []
});

watch(() => props.modelValue, async (val) => {
  visible.value = val;
  if (val && props.roleId) {
    await loadRoleData();
  }
});

watch(visible, (val) => emit('update:modelValue', val));

const loadRoleData = async () => {
  try {
    const res = await RoleAPI.detail(props.roleId);
    const data = res.data;
    formData.value = {
      id: data.id,
      name: data.name,
      code: data.code,
      order: data.order,
      status: data.status,
      description: data.description,
      menu_ids: data.menu_ids || []
    };
    setTimeout(() => {
      formRef.value?.setCheckedKeys(data.menu_ids || []);
    }, 100);
  } catch (error) {
    console.error('获取角色详情失败', error);
  }
};

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    await RoleAPI.update(formData.value.id, formData.value);
    visible.value = false;
    emit('success');
  } finally {
    submitLoading.value = false;
  }
};

const handleClose = () => {
  formData.value = {
    id: undefined,
    name: '',
    code: '',
    order: 999,
    status: 0,
    description: '',
    menu_ids: []
  };
  formRef.value?.resetFields();
};
</script>
