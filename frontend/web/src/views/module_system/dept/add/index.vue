<template>
  <QaDrawer
    v-model="visible"
    title="新增部门"
    size="450px"
    form-mode="create"
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

defineOptions({ name: 'DeptAdd' });

const emit = defineEmits(['success', 'update:modelValue']);

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  parentId: { type: Number, default: null }
});

const visible = ref(props.modelValue);
const submitLoading = ref(false);
const formRef = ref();

const createInitial = () => ({
  name: '',
  code: '',
  parent_id: null,
  order: 1,
  status: 0,
  description: ''
});

const formData = ref(createInitial());

watch(() => props.modelValue, (val) => {
  visible.value = val;
  if (val) {
    formData.value = createInitial();
    if (props.parentId != null) {
      formData.value.parent_id = props.parentId;
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
    await DeptAPI.create(formData.value);
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
