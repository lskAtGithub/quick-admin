<template>
  <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="right">
    <ElFormItem :label="$t('system.user.username')" prop="username">
      <ElInput v-model="formData.username" :placeholder="$t('common.input', { name: $t('system.user.username') })" :disabled="isEdit" />
    </ElFormItem>
    <ElFormItem v-if="!isEdit" :label="$t('system.user.password')" prop="password">
      <ElInput v-model="formData.password" type="password" :placeholder="$t('common.input', { name: $t('system.user.password') })" show-password />
    </ElFormItem>
    <ElFormItem :label="$t('system.user.nickname')" prop="name">
      <ElInput v-model="formData.name" :placeholder="$t('common.input', { name: $t('system.user.nickname') })" />
    </ElFormItem>
    <ElFormItem :label="$t('system.user.mobile')" prop="mobile">
      <ElInput v-model="formData.mobile" :placeholder="$t('common.input', { name: $t('system.user.mobile') })" />
    </ElFormItem>
    <ElFormItem :label="$t('system.user.email')" prop="email">
      <ElInput v-model="formData.email" :placeholder="$t('common.input', { name: $t('system.user.email') })" />
    </ElFormItem>
    <ElFormItem :label="$t('system.user.dept')" prop="dept_id">
      <ElTreeSelect
        v-model="formData.dept_id"
        :placeholder="$t('common.select', { name: $t('system.user.dept') })"
        :data="deptOptions"
        :props="{ children: 'children', label: 'label', value: 'value' }"
        check-strictly
        filterable
      />
    </ElFormItem>
    <ElFormItem :label="$t('system.user.role')" prop="role_ids">
      <ElSelect v-model="formData.role_ids" multiple filterable :placeholder="$t('common.select', { name: $t('system.user.role') })" style="width: 100%">
        <ElOption v-for="role in roleOptions" :key="role.id" :label="role.name" :value="role.id" />
      </ElSelect>
    </ElFormItem>
    <ElFormItem v-if="isSuperUser" :label="$t('system.user.superAdmin')" prop="is_superuser">
      <ElRadioGroup v-model="formData.is_superuser">
        <ElRadio :value="false">{{ $t('common.no') }}</ElRadio>
        <ElRadio :value="true">{{ $t('common.yes') }}</ElRadio>
      </ElRadioGroup>
    </ElFormItem>
    <ElFormItem :label="$t('common.status')" prop="status">
      <ElRadioGroup v-model="formData.status">
        <ElRadio :value="0">{{ $t('common.enabled') }}</ElRadio>
        <ElRadio :value="1">{{ $t('system.user.banned') }}</ElRadio>
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
    roleOptions.value = res.data?.items || [];
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
