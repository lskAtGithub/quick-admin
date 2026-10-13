<template>
  <QaDrawer
    v-model="visible"
    title="编辑菜单"
    size="500px"
    form-mode="update"
    :confirm-loading="submitLoading"
    @close="handleClose"
    @confirm="handleSubmit"
  >
    <MenuForm ref="formRef" :form-data="formData" />
  </QaDrawer>
</template>

<script setup>
import { ref, watch } from 'vue';
import { MenuAPI } from '@/api/module_system/menu';
import MenuForm from '../components/MenuForm.vue';
import QaDrawer from '@/components/modal/qa-drawer/index.vue';

defineOptions({ name: 'MenuEdit' });

const emit = defineEmits(['success', 'update:modelValue']);

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  menuId: { type: Number, default: null }
});

const visible = ref(props.modelValue);
const submitLoading = ref(false);
const formRef = ref();

const formData = ref({
  id: undefined,
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

watch(() => props.modelValue, async (val) => {
  visible.value = val;
  if (val && props.menuId) {
    await loadMenuData();
  }
});

watch(visible, (val) => {
  emit('update:modelValue', val);
});

const loadMenuData = async () => {
  try {
    const res = await MenuAPI.detail(props.menuId);
    const data = res.data;
    formData.value = {
      id: data.id,
      name: data.name,
      type: data.type,
      icon: data.icon,
      order: data.order,
      permission: data.permission,
      route_name: data.route_name,
      route_path: data.route_path,
      component_path: data.component_path,
      redirect: data.redirect,
      parent_id: data.parent_id,
      hidden: data.hidden,
      keep_alive: data.keep_alive,
      status: data.status
    };
  } catch (error) {
    console.error('获取菜单详情失败', error);
  }
};

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    await MenuAPI.update(formData.value.id, formData.value);
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
  };
  formRef.value?.resetFields();
};
</script>
