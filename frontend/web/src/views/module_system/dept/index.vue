<template>
  <div class="flex h-full flex-col">
    <!-- 搜索栏 -->
    <ElCard class="mb-3" shadow="never">
      <div class="flex items-center justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <ElInput v-model="searchForm.name" :placeholder="$t('system.dept.name')" clearable class="search-input-sm" />
          <ElSelect v-model="searchForm.status" :placeholder="$t('common.status')" clearable class="search-input-xs">
            <ElOption :label="$t('common.enabled')" :value="0" />
            <ElOption :label="$t('common.disabled')" :value="1" />
          </ElSelect>
        </div>
        <div class="flex items-center">
          <ElButton @click="handleReset">{{ $t('common.reset') }}</ElButton>
          <ElButton type="primary" @click="handleSearch">{{ $t('common.search') }}</ElButton>
        </div>
      </div>
    </ElCard>

    <!-- 表格卡片 -->
    <ElCard class="flex flex-1 flex-col overflow-hidden" shadow="never">
      <!-- 工具栏 -->
      <div class="mb-3">
        <QaTableHeaderLeft :remove-ids="selectedIds" @add="handleAdd" @delete="handleBatchDelete" />
      </div>

      <!-- 树形表格 -->
      <QaTable :data-source="filteredData" :columns="columns" row-key="id" :tree-props="{ children: 'children' }" :default-expand-all="false" @selection-change="onSelectionChange">
        <template #status="{ row }">
          <ElTag :type="row.status === 0 ? 'success' : 'danger'">
            {{ row.status === 0 ? $t('common.enabled') : $t('common.disabled') }}
          </ElTag>
        </template>
        <template #action="{ row }">
          <ElButton link type="primary" @click="handleAddChild(row)">{{ $t('system.dept.addChild') }}</ElButton>
          <ElButton link type="primary" @click="handleEdit(row)">{{ $t('common.edit') }}</ElButton>
          <ElButton link type="danger" @click="handleDelete(row)">{{ $t('common.delete') }}</ElButton>
        </template>
      </QaTable>
    </ElCard>

    <!-- 新增部门抽屉 -->
    <DeptAdd v-model="addDrawerVisible" :parent-id="addParentId" @success="handleAddSuccess" />

    <!-- 编辑部门抽屉 -->
    <DeptEdit v-model="editDrawerVisible" :dept-id="editDeptId" @success="handleEditSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { $t } from '@/locales';
import { DeptAPI } from '@/api/module_system/dept';
import QaTable from '@/components/tables/qa-table/index.vue';
import QaTableHeaderLeft from '@/components/tables/qa-table-header-left/index.vue';
import DeptAdd from './add/index.vue';
import DeptEdit from './edit/index.vue';

defineOptions({ name: 'QaSystemDept' });

const loading = ref(false);
const allTreeData = ref([]);
const tableData = ref([]);
const selectedIds = ref([]);

const searchForm = ref({
  name: '',
  status: undefined
});

const columns = [
  { type: 'selection', width: 50 },
  { prop: 'name', label: $t('system.dept.name'), minWidth: 160 },
  { prop: 'code', label: $t('system.dept.code'), width: 140 },
  { prop: 'status', label: $t('common.status'), width: 100, slotName: 'status' },
  { prop: 'order', label: $t('common.order'), width: 80 },
  { prop: 'description', label: $t('common.remark'), minWidth: 120, showOverflowTooltip: true },
  { label: $t('common.operation'), fixed: 'right', width: 240, slotName: 'action' }
];

const addDrawerVisible = ref(false);
const addParentId = ref(null);
const editDrawerVisible = ref(false);
const editDeptId = ref(null);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await DeptAPI.tree();
    allTreeData.value = res.data || [];
    applyFilter();
  } finally {
    loading.value = false;
  }
};

const filterTree = (nodes) => {
  const { name, status } = searchForm.value;
  const hasName = name?.trim();
  const hasStatus = status !== undefined && status !== null && status !== '';
  if (!hasName && !hasStatus) return nodes;

  const result = [];
  for (const node of nodes) {
    const nameMatch = !hasName || (node.name && node.name.includes(name.trim()));
    const statusMatch = !hasStatus || node.status === status;
    const filteredChildren = node.children?.length ? filterTree(node.children) : [];

    if ((nameMatch && statusMatch) || filteredChildren.length) {
      result.push({ ...node, children: filteredChildren.length ? filteredChildren : node.children?.length ? [] : undefined });
    }
  }
  return result;
};

const applyFilter = () => {
  tableData.value = filterTree(allTreeData.value);
};

const filteredData = computed(() => tableData.value);

onMounted(() => {
  fetchData();
});

const onSelectionChange = (rows) => {
  selectedIds.value = rows.map((r) => r.id);
};

const handleAdd = () => {
  addParentId.value = null;
  addDrawerVisible.value = true;
};

const handleAddSuccess = () => {
  fetchData();
};

const handleEdit = (row) => {
  editDeptId.value = row.id;
  editDrawerVisible.value = true;
};

const handleEditSuccess = () => {
  fetchData();
};

const handleAddChild = (row) => {
  addParentId.value = row.id;
  addDrawerVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm($t('common.deleteConfirm', { kind: $t('system.dept.entity'), name: row.name }), $t('common.tips'), {
      confirmButtonText: $t('common.confirm'),
      cancelButtonText: $t('common.cancel'),
      type: 'warning'
    });
    await DeptAPI.delete([row.id]);
    await fetchData();
  } catch {
    // 用户取消
  }
};

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning($t('common.selectToDelete', { kind: $t('system.dept.entity') }));
    return;
  }
  try {
    await ElMessageBox.confirm($t('common.batchDeleteConfirm', { count: selectedIds.value.length, kind: $t('system.dept.entity') }), $t('common.tips'), {
      confirmButtonText: $t('common.confirm'),
      cancelButtonText: $t('common.cancel'),
      type: 'warning'
    });
    await DeptAPI.delete(selectedIds.value);
    await fetchData();
  } catch {
    // 用户取消
  }
};

const handleSearch = () => {
  applyFilter();
};

const handleReset = () => {
  searchForm.value = {
    name: '',
    status: undefined
  };
  applyFilter();
};
</script>

<style scoped>
.search-input-sm {
  width: 150px;
}

.search-input-xs {
  width: 120px;
}
</style>
