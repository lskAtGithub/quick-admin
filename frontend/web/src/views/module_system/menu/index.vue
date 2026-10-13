<template>
  <div class="flex h-full flex-col">
    <!-- 搜索栏 -->
    <ElCard class="mb-3" shadow="never">
      <div class="flex items-center justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <ElInput v-model="searchForm.name" placeholder="菜单名称" clearable class="search-input-sm" />
          <ElSelect v-model="searchForm.status" placeholder="状态" clearable class="search-input-xs">
            <ElOption label="启用" :value="0" />
            <ElOption label="停用" :value="1" />
          </ElSelect>
        </div>
        <div class="flex items-center">
          <ElButton @click="handleReset">重置</ElButton>
          <ElButton type="primary" @click="handleSearch">搜索</ElButton>
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
      <QaTable
        :data-source="filteredData"
        :columns="columns"
        row-key="id"
        :tree-props="{ children: 'children' }"
        :default-expand-all="true"
        @selection-change="onSelectionChange"
      >
        <template #name="{ row }">
          <QaSvgIcon v-if="row.icon && row.type !== 3" :icon="row.icon" :size="16" class="mr-1 align-middle" />
          <span class="align-middle">{{ row.name }}</span>
        </template>
        <template #type="{ row }">
          <ElTag v-if="row.type === 1" type="warning">目录</ElTag>
          <ElTag v-else-if="row.type === 2" type="success">菜单</ElTag>
          <ElTag v-else-if="row.type === 3" type="danger">按钮</ElTag>
        </template>
        <template #status="{ row }">
          <ElTag :type="row.status === 0 ? 'success' : 'danger'">
            {{ row.status === 0 ? '启用' : '停用' }}
          </ElTag>
        </template>
        <template #action="{ row }">
          <ElButton v-if="row.type !== 3" link type="primary" @click="handleAddChild(row)">新增</ElButton>
          <ElButton link type="primary" @click="handleEdit(row)">编辑</ElButton>
          <ElButton link type="danger" @click="handleDelete(row)">删除</ElButton>
        </template>
      </QaTable>
    </ElCard>

    <!-- 新增菜单抽屉 -->
    <MenuAdd
      v-model="addDrawerVisible"
      :parent-id="addParentId"
      :parent-type="addParentType"
      @success="handleAddSuccess"
    />

    <!-- 编辑菜单抽屉 -->
    <MenuEdit v-model="editDrawerVisible" :menu-id="editMenuId" @success="handleEditSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { MenuAPI } from '@/api/module_system/menu';
import QaTable from '@/components/tables/qa-table/index.vue';
import QaTableHeaderLeft from '@/components/tables/qa-table-header-left/index.vue';
import QaSvgIcon from '@/components/base/qa-svg-icon/index.vue';
import MenuAdd from './add/index.vue';
import MenuEdit from './edit/index.vue';

defineOptions({ name: 'QaSystemMenu' });

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
  { prop: 'name', label: '菜单名称', minWidth: 200, slotName: 'name' },
  { prop: 'type', label: '类型', width: 80, align: 'center', slotName: 'type' },
  { prop: 'route_path', label: '路由路径', minWidth: 140, showOverflowTooltip: true },
  { prop: 'component_path', label: '组件路径', minWidth: 160, showOverflowTooltip: true },
  { prop: 'permission', label: '权限标识', minWidth: 160, showOverflowTooltip: true },
  { prop: 'order', label: '排序', width: 80 },
  { prop: 'status', label: '状态', width: 80, slotName: 'status' },
  { label: '操作', fixed: 'right', width: 200, slotName: 'action' }
];

const addDrawerVisible = ref(false);
const addParentId = ref(null);
const addParentType = ref(null);
const editDrawerVisible = ref(false);
const editMenuId = ref(null);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await MenuAPI.tree();
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
  addParentType.value = null;
  addDrawerVisible.value = true;
};

const handleAddSuccess = () => {
  fetchData();
};

const handleEdit = (row) => {
  editMenuId.value = row.id;
  editDrawerVisible.value = true;
};

const handleEditSuccess = () => {
  fetchData();
};

const handleAddChild = (row) => {
  addParentId.value = row.id;
  addParentType.value = row.type;
  addDrawerVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除菜单"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await MenuAPI.delete([row.id]);
    await fetchData();
  } catch {
    // 用户取消
  }
};

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的菜单');
    return;
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个菜单吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await MenuAPI.delete(selectedIds.value);
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
