<template>
  <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="right">
    <ElFormItem :label="$t('system.menu.typeLabel')" prop="type">
      <ElRadioGroup v-model="formData.type">
        <ElRadio v-if="allowedTypes.includes(1)" :value="1">{{ $t('system.menu.catalog') }}</ElRadio>
        <ElRadio v-if="allowedTypes.includes(2)" :value="2">{{ $t('system.menu.menuItem') }}</ElRadio>
        <ElRadio v-if="allowedTypes.includes(3)" :value="3">{{ $t('system.menu.button') }}</ElRadio>
      </ElRadioGroup>
    </ElFormItem>

    <ElFormItem :label="$t('system.menu.parent')" prop="parent_id">
      <ElTreeSelect
        v-model="formData.parent_id"
        :placeholder="$t('system.menu.parentTop')"
        :data="menuOptions"
        :props="{ children: 'children', label: 'label', value: 'value' }"
        check-strictly
        filterable
        clearable
      />
    </ElFormItem>

    <ElFormItem :label="$t('system.menu.name')" prop="name">
      <ElInput v-model="formData.name" :placeholder="$t('common.input', { name: $t('system.menu.name') })" maxlength="64" />
    </ElFormItem>

    <ElFormItem v-if="formData.type !== 3" :label="$t('system.menu.icon')" prop="icon">
      <QaIconSelect v-model="formData.icon" />
    </ElFormItem>

    <ElFormItem v-if="formData.type !== 3" :label="$t('system.menu.routeName')" prop="route_name">
      <ElInput v-model="formData.route_name" :placeholder="$t('system.menu.routeNamePh')" maxlength="100" />
    </ElFormItem>

    <ElFormItem v-if="formData.type !== 3" :label="$t('system.menu.routePath')" prop="route_path">
      <ElInput v-model="formData.route_path" :placeholder="$t('system.menu.routePathPh')" maxlength="200" />
    </ElFormItem>

    <ElFormItem v-if="formData.type === 2" :label="$t('system.menu.componentPath')" prop="component_path">
      <ElInput v-model="formData.component_path" :placeholder="$t('system.menu.componentPathPh')" maxlength="200">
        <template #prepend>src/views/</template>
        <template #append>.vue</template>
      </ElInput>
    </ElFormItem>

    <ElFormItem v-if="formData.type === 3" :label="$t('system.menu.permission')" prop="permission">
      <ElInput v-model="formData.permission" :placeholder="$t('system.menu.permissionPh')" maxlength="100" />
    </ElFormItem>

    <ElFormItem v-if="formData.type === 2" :label="$t('system.menu.permission')" prop="permission">
      <ElInput v-model="formData.permission" :placeholder="$t('system.menu.permissionOptPh')" maxlength="100" />
    </ElFormItem>

    <ElFormItem v-if="formData.type === 1" :label="$t('system.menu.redirect')" prop="redirect">
      <ElInput v-model="formData.redirect" :placeholder="$t('system.menu.redirectPh')" maxlength="200" />
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

    <ElFormItem v-if="formData.type !== 3" :label="$t('system.menu.hidden')" prop="hidden">
      <ElRadioGroup v-model="formData.hidden">
        <ElRadio :value="false">{{ $t('common.no') }}</ElRadio>
        <ElRadio :value="true">{{ $t('common.yes') }}</ElRadio>
      </ElRadioGroup>
    </ElFormItem>

    <ElFormItem v-if="formData.type === 2" :label="$t('system.menu.keepAlive')" prop="keep_alive">
      <ElRadioGroup v-model="formData.keep_alive">
        <ElRadio :value="true">{{ $t('common.on') }}</ElRadio>
        <ElRadio :value="false">{{ $t('common.off') }}</ElRadio>
      </ElRadioGroup>
    </ElFormItem>
  </ElForm>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { $t } from '@/locales';
import { formatMenuTitle } from '@/utils/navigation';
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
    name: [{ required: true, message: $t('common.input', { name: $t('system.menu.name') }), trigger: 'blur' }],
    type: [{ required: true, message: $t('common.select', { name: $t('system.menu.typeLabel') }), trigger: 'change' }],
    order: [{ required: true, message: $t('common.input', { name: $t('common.order') }), trigger: 'blur' }]
  };

  const t = props.formData.type;
  if (t !== 3) {
    rules.route_name = [{ required: true, message: $t('common.input', { name: $t('system.menu.routeName') }), trigger: 'blur' }];
    rules.route_path = [{ required: true, message: $t('common.input', { name: $t('system.menu.routePath') }), trigger: 'blur' }];
  }
  if (t === 2) {
    rules.component_path = [{ required: true, message: $t('common.input', { name: $t('system.menu.componentPath') }), trigger: 'blur' }];
  }
  if (t === 1) {
    rules.redirect = [{ required: true, message: $t('system.menu.redirectRequired'), trigger: 'blur' }];
  }
  if (t === 3) {
    rules.permission = [{ required: true, message: $t('common.input', { name: $t('system.menu.permission') }), trigger: 'blur' }];
  }
  return rules;
});

const formatTree = (data) => {
  const result = [];
  for (const item of data) {
    if (item.type === 1 || item.type === 2) {
      const node = {
        value: item.id,
        label: formatMenuTitle(item.name),
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
