<template>
  <ElForm
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="100px"
    label-position="right"
  >
    <ElFormItem label="用户名" prop="username">
      <ElInput v-model="formData.username" placeholder="请输入用户名" :disabled="isEdit" />
    </ElFormItem>
    <ElFormItem v-if="!isEdit" label="密码" prop="password">
      <ElInput v-model="formData.password" type="password" placeholder="请输入密码" show-password />
    </ElFormItem>
    <ElFormItem label="昵称" prop="name">
      <ElInput v-model="formData.name" placeholder="请输入昵称" />
    </ElFormItem>
    <ElFormItem label="手机号" prop="mobile">
      <ElInput v-model="formData.mobile" placeholder="请输入手机号" />
    </ElFormItem>
    <ElFormItem label="邮箱" prop="email">
      <ElInput v-model="formData.email" placeholder="请输入邮箱" />
    </ElFormItem>
    <ElFormItem label="部门" prop="dept_id">
      <ElTreeSelect
        v-model="formData.dept_id"
        placeholder="请选择部门"
        :data="deptOptions"
        :props="{ children: 'children', label: 'label', value: 'value' }"
        check-strictly
        filterable
      />
    </ElFormItem>
    <ElFormItem label="角色" prop="role_ids">
      <ElSelect v-model="formData.role_ids" multiple filterable placeholder="请选择角色" style="width: 100%">
        <ElOption v-for="role in roleOptions" :key="role.id" :label="role.name" :value="role.id" />
      </ElSelect>
    </ElFormItem>
    <ElFormItem v-if="isSuperUser" label="超级管理员" prop="is_superuser">
      <ElRadioGroup v-model="formData.is_superuser">
        <ElRadio :value="false">否</ElRadio>
        <ElRadio :value="true">是</ElRadio>
      </ElRadioGroup>
    </ElFormItem>
    <ElFormItem label="状态" prop="status">
      <ElRadioGroup v-model="formData.status">
        <ElRadio :value="0">启用</ElRadio>
        <ElRadio :value="1">禁用</ElRadio>
      </ElRadioGroup>
    </ElFormItem>
  </ElForm>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { DeptAPI } from '@/api/module_system/dept';
import { RoleAPI } from '@/api/module_system/role';
import { useUserStore } from '@/store';
import { isPhone, isEmail, isUsername, isPassword } from '@/utils/validator';

defineOptions({ name: 'UserForm' });

const props = defineProps({
  formData: { type: Object, required: true },
  isEdit: { type: Boolean, default: false }
});

const formRef = ref();
const deptOptions = ref([]);
const roleOptions = ref([]);
const userStore = useUserStore();
const isSuperUser = computed(() => userStore.info?.is_superuser);

const formRules = {
  username: [{ required: true, validator: isUsername, trigger: 'blur' }],
  password: [{ required: true, validator: isPassword, trigger: 'blur' }],
  mobile: [{ validator: isPhone, trigger: 'blur' }],
  email: [{ validator: isEmail, trigger: 'blur' }]
};

const validate = async () => {
  if (!formRef.value) return false;
  return await formRef.value.validate().catch(() => false);
};

const resetFields = () => {
  formRef.value?.resetFields();
};

const loadDeptOptions = async () => {
  try {
    const res = await DeptAPI.list();
    deptOptions.value = formatTree(res.data || []);
  } catch (error) {
    console.error('加载部门列表失败', error);
  }
};

const loadRoleOptions = async () => {
  try {
    const res = await RoleAPI.list({ page_no: 1, page_size: 1000 });
    roleOptions.value = (res.data?.items || []);
  } catch (error) {
    console.error('加载角色列表失败', error);
  }
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

onMounted(() => {
  loadDeptOptions();
  loadRoleOptions();
});

defineExpose({ validate, resetFields });
</script>
