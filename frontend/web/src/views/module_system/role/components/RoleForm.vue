<template>
  <ElForm
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="100px"
    label-position="right"
  >
    <ElFormItem :label="$t('system.role.name')" prop="name">
      <ElInput v-model="formData.name" :placeholder="$t('common.input', { name: $t('system.role.name') })" maxlength="50" />
    </ElFormItem>
    <ElFormItem :label="$t('system.role.code')" prop="code">
      <ElInput v-model="formData.code" :placeholder="$t('system.role.codePattern')" maxlength="64" show-word-limit />
    </ElFormItem>
    <ElFormItem :label="$t('common.order')" prop="order">
      <ElInputNumber v-model="formData.order" :min="0" :max="999" controls-position="right" />
    </ElFormItem>
    <ElFormItem :label="$t('common.status')" prop="status">
      <ElRadioGroup v-model="formData.status">
        <ElRadio :value="0">{{ $t('common.enabled') }}</ElRadio>
        <ElRadio :value="1">{{ $t('common.disabled') }}</ElRadio>
      </ElRadioGroup>
    </ElFormItem>
    <ElFormItem :label="$t('common.remark')" prop="description">
      <ElInput v-model="formData.description" type="textarea" :rows="3" maxlength="200" show-word-limit :placeholder="$t('common.input', { name: $t('common.remark') })" />
    </ElFormItem>
    <ElFormItem :label="$t('system.role.menuPerm')">
      <div class="menu-tree-wrapper">
        <ElTree
          ref="menuTreeRef"
          :data="menuTreeData"
          :props="{ children: 'children', label: 'label' }"
          show-checkbox
          node-key="id"
          :default-checked-keys="formData.menu_ids"
          check-strictly
          @check="handleMenuCheck"
        />
      </div>
    </ElFormItem>
  </ElForm>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { $t } from '@/locales';
import { MenuAPI } from '@/api/module_system/menu';

defineOptions({ name: 'RoleForm' });

const props = defineProps({
  formData: { type: Object, required: true }
});

const formRef = ref();
const menuTreeRef = ref();
const menuTreeData = ref([]);

const CODE_PATTERN = /^[A-Za-z][A-Za-z0-9_]{1,63}$/;

const formRules = {
  name: [{ required: true, message: $t('common.input', { name: $t('system.role.name') }), trigger: 'blur' }],
  code: [
    { required: true, message: $t('common.input', { name: $t('system.role.code') }), trigger: 'blur' },
    { pattern: CODE_PATTERN, message: $t('system.role.codePattern'), trigger: 'blur' }
  ],
  order: [{ required: true, message: $t('common.input', { name: $t('common.order') }), trigger: 'blur' }]
};

const formatMenuTree = (nodes) => {
  const result = [];
  for (const item of nodes) {
    if (item.type === 3) continue;
    const children = item.children?.length ? formatMenuTree(item.children) : [];
    result.push({
      id: item.id,
      label: item.name,
      children: children.length ? children : undefined
    });
  }
  return result;
};

const loadMenuTree = async () => {
  try {
    const res = await MenuAPI.tree();
    menuTreeData.value = formatMenuTree(res.data || []);
  } catch (e) {
    console.error('加载菜单树失败', e);
  }
};

const handleMenuCheck = (data, { checkedKeys }) => {
  props.formData.menu_ids = checkedKeys;
};

const setCheckedKeys = (keys) => {
  menuTreeRef.value?.setCheckedKeys(keys || []);
};

const validate = async () => {
  if (!formRef.value) return false;
  return await formRef.value.validate().catch(() => false);
};

const resetFields = () => {
  formRef.value?.resetFields();
  menuTreeRef.value?.setCheckedKeys([]);
};

onMounted(() => {
  loadMenuTree();
});

defineExpose({ validate, resetFields, setCheckedKeys });
</script>

<style scoped>
.menu-tree-wrapper {
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  padding: 8px;
}
</style>
