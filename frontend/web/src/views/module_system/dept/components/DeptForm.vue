<template>
  <ElForm
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="100px"
    label-position="right"
  >
    <ElFormItem label="部门名称" prop="name">
      <ElInput v-model="formData.name" placeholder="请输入部门名称" maxlength="50" />
    </ElFormItem>
    <ElFormItem label="部门编码" prop="code">
      <ElInput v-model="formData.code" placeholder="字母开头，2-16位字母/数字/下划线" maxlength="16" show-word-limit />
    </ElFormItem>
    <ElFormItem label="上级部门" prop="parent_id">
      <ElTreeSelect
        v-model="formData.parent_id"
        placeholder="请选择上级部门"
        :data="deptOptions"
        :props="{ children: 'children', label: 'label', value: 'value' }"
        check-strictly
        filterable
        clearable
      />
    </ElFormItem>
    <ElFormItem label="排序" prop="order">
      <ElInputNumber v-model="formData.order" :min="0" :max="999" controls-position="right" />
    </ElFormItem>
    <ElFormItem label="状态" prop="status">
      <ElRadioGroup v-model="formData.status">
        <ElRadio :value="0">启用</ElRadio>
        <ElRadio :value="1">停用</ElRadio>
      </ElRadioGroup>
    </ElFormItem>
    <ElFormItem label="备注" prop="description">
      <ElInput v-model="formData.description" type="textarea" :rows="4" maxlength="100" show-word-limit placeholder="请输入备注" />
    </ElFormItem>
  </ElForm>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { DeptAPI } from '@/api/module_system/dept';

defineOptions({ name: 'DeptForm' });

const props = defineProps({
  formData: { type: Object, required: true }
});

const formRef = ref();
const deptOptions = ref([]);

const CODE_PATTERN = /^[A-Za-z][A-Za-z0-9_]{1,15}$/;

const formRules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入部门编码', trigger: 'blur' },
    { pattern: CODE_PATTERN, message: '字母开头，2-16位字母/数字/下划线', trigger: 'blur' }
  ],
  order: [{ required: true, message: '请输入排序', trigger: 'blur' }]
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
