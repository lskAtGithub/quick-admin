<template>
  <ElForm
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="100px"
    label-position="right"
  >
    <ElFormItem label="菜单类型" prop="type">
      <ElRadioGroup v-model="formData.type">
        <ElRadio v-if="allowedTypes.includes(1)" :value="1">目录</ElRadio>
        <ElRadio v-if="allowedTypes.includes(2)" :value="2">菜单</ElRadio>
        <ElRadio v-if="allowedTypes.includes(3)" :value="3">按钮</ElRadio>
      </ElRadioGroup>
    </ElFormItem>

    <ElFormItem label="父级菜单" prop="parent_id">
      <ElTreeSelect
        v-model="formData.parent_id"
        placeholder="无（顶级菜单）"
        :data="menuOptions"
        :props="{ children: 'children', label: 'label', value: 'value' }"
        check-strictly
        filterable
        clearable
      />
    </ElFormItem>

    <ElFormItem label="菜单名称" prop="name">
      <ElInput v-model="formData.name" placeholder="请输入菜单名称" maxlength="64" />
    </ElFormItem>

    <ElFormItem v-if="formData.type !== 3" label="图标" prop="icon">
      <QaIconSelect v-model="formData.icon" />
    </ElFormItem>

    <ElFormItem v-if="formData.type !== 3" label="路由名称" prop="route_name">
      <ElInput v-model="formData.route_name" placeholder="如 System" maxlength="100" />
    </ElFormItem>

    <ElFormItem v-if="formData.type !== 3" label="路由路径" prop="route_path">
      <ElInput v-model="formData.route_path" placeholder="如 system 或 system/user" maxlength="200" />
    </ElFormItem>

    <ElFormItem v-if="formData.type === 2" label="组件路径" prop="component_path">
      <ElInput v-model="formData.component_path" placeholder="如 module_system/user/index" maxlength="200">
        <template #prepend>src/views/</template>
        <template #append>.vue</template>
      </ElInput>
    </ElFormItem>

    <ElFormItem v-if="formData.type === 3" label="权限标识" prop="permission">
      <ElInput v-model="formData.permission" placeholder="如 module_system:menu:create" maxlength="100" />
    </ElFormItem>

    <ElFormItem v-if="formData.type === 2" label="权限标识" prop="permission">
      <ElInput v-model="formData.permission" placeholder="如 module_system:menu:query（可选）" maxlength="100" />
    </ElFormItem>

    <ElFormItem v-if="formData.type === 1" label="重定向" prop="redirect">
      <ElInput v-model="formData.redirect" placeholder="目录必填，如 /system/user" maxlength="200" />
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

    <ElFormItem v-if="formData.type !== 3" label="是否隐藏" prop="hidden">
      <ElRadioGroup v-model="formData.hidden">
        <ElRadio :value="false">否</ElRadio>
        <ElRadio :value="true">是</ElRadio>
      </ElRadioGroup>
    </ElFormItem>

    <ElFormItem v-if="formData.type === 2" label="缓存页面" prop="keep_alive">
      <ElRadioGroup v-model="formData.keep_alive">
        <ElRadio :value="true">开启</ElRadio>
        <ElRadio :value="false">关闭</ElRadio>
      </ElRadioGroup>
    </ElFormItem>
  </ElForm>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { MenuAPI } from '@/api/module_system/menu';
import QaIconSelect from '@/components/others/qa-icon-select/index.vue';

defineOptions({ name: 'MenuForm' });

const props = defineProps({
  formData: { type: Object, required: true },
  allowedTypes: { type: Array, default: () => [1, 2, 3] }
});

const formRef = ref();
const menuOptions = ref([]);

const formRules = computed(() => {
  const rules = {
    name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
    order: [{ required: true, message: '请输入排序', trigger: 'blur' }]
  };

  const t = props.formData.type;
  if (t !== 3) {
    rules.route_name = [{ required: true, message: '请输入路由名称', trigger: 'blur' }];
    rules.route_path = [{ required: true, message: '请输入路由路径', trigger: 'blur' }];
  }
  if (t === 2) {
    rules.component_path = [{ required: true, message: '请输入组件路径', trigger: 'blur' }];
  }
  if (t === 1) {
    rules.redirect = [{ required: true, message: '目录类型必须填写重定向', trigger: 'blur' }];
  }
  if (t === 3) {
    rules.permission = [{ required: true, message: '请输入权限标识', trigger: 'blur' }];
  }
  return rules;
});

const formatTree = (data) => {
  const result = [];
  for (const item of data) {
    if (item.type === 1 || item.type === 2) {
      const node = {
        value: item.id,
        label: item.name,
        children: item.children?.length ? formatTree(item.children) : undefined
      };
      result.push(node);
    }
  }
  return result;
};

const loadMenuOptions = async () => {
  try {
    const res = await MenuAPI.tree();
    menuOptions.value = formatTree(res.data || []);
  } catch (error) {
    console.error('加载菜单树失败', error);
  }
};

const validate = async () => {
  if (!formRef.value) return false;
  return await formRef.value.validate().catch(() => false);
};

const resetFields = () => {
  formRef.value?.resetFields();
};

onMounted(() => {
  loadMenuOptions();
});

defineExpose({ validate, resetFields });
</script>
