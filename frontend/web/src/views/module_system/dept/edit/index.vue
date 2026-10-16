<template>
  <QaDrawer
    v-model="visible"
    :title="$t('common.editTitle', { name: $t('system.dept.entity') })"
    size="450px"
    form-mode="update"
    :confirm-loading="submitLoading"
    @close="handleClose"
    @confirm="handleSubmit"
  >
    <DeptForm ref="formRef" :form-data="formData" />
  </QaDrawer>
</template>

<script setup>
import { ref, watch } from 'vue';
import { DeptAPI } from '@/api/module_system/dept';
import DeptForm from '../components/DeptForm.vue';
import QaDrawer from '@/components/modal/qa-drawer/index.vue';

defineOptions({ name: 'DeptEdit' });

const emit = defineEmits(['success', 'update:modelValue']);

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  deptId: { type: Number, default: null }
});

const visible = ref(props.modelValue);
const submitLoading = ref(false);
const formRef = ref();

const formData = ref({
  id: undefined,
  name: '',
  code: '',
  parent_id: null,
  order: 1,
  status: 0,
  description: ''
});

watch(
  () => props.modelValue,
  async (val) => {
    visible.value = val;
    if (val && props.deptId) {
      await loadDeptData();
    }
  }
);

watch(visible, (val) => {
  emit('update:modelValue', val);
});

const loadDeptData = async () => {
  try {
    const res = await DeptAPI.detail(props.deptId);
    const data = res.data;
    formData.value = {
      id: data.id,
      name: data.name,
      code: data.code,
      parent_id: data.parent_id,
      order: data.order,
      status: data.status,
      description: data.description
    };
  } catch (error) {
    console.error('获取部门详情失败', error);
  }
};

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    await DeptAPI.update(formData.value.id, formData.value);
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
    parent_id: null,
    order: 1,
    status: 0,
    description: ''
  };
  formRef.value?.resetFields();
};
</script>
