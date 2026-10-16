<template>
  <div class="box-border px-1.5 pt-4 pb-3 pl-2.5">
    <div class="flex items-stretch">
      <ElInput v-model="deptName" class="flex-1 min-w-0" :placeholder="$t('system.dept.name')" size="small" clearable>
        <template #prefix>
          <ElIcon class="text-(--el-text-color-placeholder)">
            <Search />
          </ElIcon>
        </template>
        <template #suffix>
          <ElTooltip :content="treeExpanded ? $t('common.collapseAll') : $t('common.expandAll')" placement="top">
            <span class="dept-tree-expand-trigger" role="button" tabindex="0" @click.stop="toggleTreeExpandAll" @keydown.enter.prevent="toggleTreeExpandAll">
              <ElIcon :size="15">
                <Switch />
              </ElIcon>
            </span>
          </ElTooltip>
        </template>
      </ElInput>
    </div>

    <ElTree
      ref="deptTreeRef"
      class="mt-2.5"
      node-key="value"
      :data="deptOptions"
      :props="{ children: 'children', label: 'label', disabled: 'disabled' }"
      :expand-on-click-node="false"
      :filter-node-method="handleFilter"
      default-expand-all
      @node-click="handleNodeClick"
    >
      <template #empty>
        <ElEmpty :image-size="80" :description="$t('common.noData')" />
      </template>
    </ElTree>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeMount } from 'vue';
import { Search, Switch } from '@element-plus/icons-vue';
import { DeptAPI } from '@/api/module_system/dept';

defineOptions({ name: 'QaDeptTree' });

const props = defineProps({
  modelValue: { type: [String, Number], default: undefined }
});

const emit = defineEmits(['update:modelValue', 'node-click']);

const deptOptions = ref([]);
const deptTreeRef = ref();
const deptName = ref('');
const treeExpanded = ref(true);

watch(deptName, (val) => {
  deptTreeRef.value?.filter(val);
});

function getTreeRoot() {
  const tree = deptTreeRef.value;
  return tree?.store?.root;
}

function expandAllTreeNodes() {
  const root = getTreeRoot();
  if (!root) return;
  const walk = (node) => {
    node.childNodes?.forEach((child) => {
      if (child.childNodes?.length) {
        child.expand();
        walk(child);
      }
    });
  };
  walk(root);
}

function collapseAllTreeNodes() {
  const root = getTreeRoot();
  if (!root) return;
  const walk = (node) => {
    node.childNodes?.forEach((child) => {
      walk(child);
      child.collapse();
    });
  };
  walk(root);
}

function toggleTreeExpandAll() {
  if (treeExpanded.value) {
    collapseAllTreeNodes();
    treeExpanded.value = false;
  } else {
    expandAllTreeNodes();
    treeExpanded.value = true;
  }
}

const handleFilter = (value, data) => {
  if (!value) return true;
  return data.label.includes(value);
};

function handleNodeClick(data) {
  emit('update:modelValue', data.value);
  emit('node-click', data);
}

function formatTree(data, parentId = 0) {
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
}

onBeforeMount(async () => {
  try {
    const response = await DeptAPI.list();
    deptOptions.value = formatTree(response.items || []);
  } catch (error) {
    console.error('获取部门列表失败', error);
  }
});
</script>

<style scoped lang="scss">
.dept-tree-expand-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  margin-right: -2px;
  vertical-align: middle;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  border-radius: var(--el-border-radius-small);
  transition:
    color 0.15s ease,
    background-color 0.15s ease;

  &:hover {
    color: var(--el-color-primary);
    background-color: var(--el-fill-color-light);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary-light-5);
    outline-offset: 1px;
  }
}
</style>
