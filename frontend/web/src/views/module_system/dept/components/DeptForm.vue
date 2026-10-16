<template>
  <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="right">
    <ElFormItem :label="$t('system.dept.name')" prop="name">
      <ElInput v-model="formData.name" :placeholder="$t('common.input', { name: $t('system.dept.name') })" maxlength="50" />
    </ElFormItem>
    <ElFormItem :label="$t('system.dept.code')" prop="code">
      <ElInput v-model="formData.code" :placeholder="$t('system.dept.codePattern')" maxlength="16" show-word-limit />
    </ElFormItem>
    <ElFormItem :label="$t('system.dept.parent')" prop="parent_id">
      <ElTreeSelect
        v-model="formData.parent_id"
        :placeholder="$t('common.select', { name: $t('system.dept.parent') })"
        :data="deptOptions"
        :props="{ children: 'children', label: 'label', value: 'value' }"
        check-strictly
        filterable
        clearable
      />
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
      <ElInput v-model="formData.description" type="textarea" :rows="4" maxlength="100" show-word-limit :placeholder="$t('common.input', { name: $t('common.remark') })" />
    </ElFormItem>
  </ElForm>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { $t } from '@/locales';
import { DeptAPI } from '@/api/module_system/dept';

defineOptions({ name: 'DeptForm' });

const props = defineProps({
  formData: { type: Object, required: true }
});

const formRef = ref();
const deptOptions = ref([]);

const CODE_PATTERN = /^[A-Za-z][A-Za-z0-9_]{1,15}$/;

const formRules = {
  name: [{ required: true, message: $t('common.input', { name: $t('system.dept.name') }), trigger: 'blur' }],
  code: [
    { required: true, message: $t('common.input', { name: $t('system.dept.code') }), trigger: 'blur' },
    { pattern: CODE_PATTERN, message: $t('system.dept.codePattern'), trigger: 'blur' }
  ],
  order: [{ required: true, message: $t('common.input', { name: $t('common.order') }), trigger: 'blur' }]
};

const validate = async () => {
  if (!formRef.value) return false;
  return await formRef.value.validate().catch(() => false);
};

const resetFields = () => {
  formRef.value?.resetFields();
};

const formatTree = (data, parentId = 0) => {
  const result = [];
  for (const item of data) {
    if (item.parent_id === parentId) {
      const children = formatTree(data, item.id);
      const node = {
        value: item.id,
        label: item.name,
        children: children.length > 0 ? children : undefined
      };
      result.push(node);
    }
  }
  return result;
};

const loadDeptOptions = async () => {
  try {
    const res = await DeptAPI.tree();
    deptOptions.value = formatTree(res.data || []);
  } catch (error) {
    console.error('加载部门树失败', error);
  }
};

onMounted(() => {
  loadDeptOptions();
});

defineExpose({ validate, resetFields });
</script>
