<template>
  <div class="flex h-full flex-col">
    <!-- 搜索栏 -->
    <ElCard class="mb-3" shadow="never">
      <div class="flex items-center justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <ElInput v-model="searchForm.name" placeholder="角色名称" clearable class="search-input-sm" />
          <ElInput v-model="searchForm.code" placeholder="角色编码" clearable class="search-input-sm" />
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

      <!-- 表格 -->
      <QaTable
        :data-source="tableData"
        :columns="columns"
        :paging="{ page_no: currentPage, page_size: pageSize, total }"
        @selection-change="onSelectionChange"
        @page-change="handlePageChange"
      >
        <template #status="{ row }">
          <ElTag :type="row.status === 0 ? 'success' : 'danger'">
            {{ row.status === 0 ? '启用' : '停用' }}
          </ElTag>
        </template>
        <template #action="{ row }">
          <ElButton link type="primary" @click="handleEdit(row)">编辑</ElButton>
          <ElButton link type="danger" @click="handleDelete(row)">删除</ElButton>
        </template>
      </QaTable>
    </ElCard>

    <!-- 新增角色抽屉 -->
    <RoleAdd v-model="addDrawerVisible" @success="handleAddSuccess" />

    <!-- 编辑角色抽屉 -->
    <RoleEdit v-model="editDrawerVisible" :role-id="editRoleId" @success="handleEditSuccess" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { RoleAPI } from '@/api/module_system/role';
import QaTable from '@/components/tables/qa-table/index.vue';
import QaTableHeaderLeft from '@/components/tables/qa-table-header-left/index.vue';
import RoleAdd from './add/index.vue';
import RoleEdit from './edit/index.vue';

defineOptions({ name: 'QaSystemRole' });

const loading = ref(false);
const tableData = ref([]);
const selectedIds = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const searchForm = ref({
  name: '',
  code: '',
  status: undefined
});

const columns = [
  { type: 'selection', width: 50 },
  { prop: 'name', label: '角色名称', minWidth: 120 },
  { prop: 'code', label: '角色编码', minWidth: 120 },
  { prop: 'order', label: '排序', width: 80, align: 'center' },
  { prop: 'status', label: '状态', width: 80, align: 'center', slotName: 'status' },
  { prop: 'description', label: '备注', minWidth: 160, showOverflowTooltip: true },
  { label: '操作', fixed: 'right', width: 150, slotName: 'action' }
];

const addDrawerVisible = ref(false);
const editDrawerVisible = ref(false);
const editRoleId = ref(null);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await RoleAPI.list({
      page_no: currentPage.value,
      page_size: pageSize.value,
      name: searchForm.value.name || undefined,
      code: searchForm.value.code || undefined,
      status: searchForm.value.status !== undefined ? searchForm.value.status : undefined
    });
    const data = res.data;
    tableData.value = data.items || [];
    total.value = data.total || 0;
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchData());

const onSelectionChange = (rows) => {
  selectedIds.value = rows.map((r) => r.id);
};

const handlePageChange = ({ page_no, page_size }) => {
  currentPage.value = page_no;
  pageSize.value = page_size;
  fetchData();
};

const handleAdd = () => {
  addDrawerVisible.value = true;
};

const handleAddSuccess = () => {
  fetchData();
};

const handleEdit = (row) => {
  editRoleId.value = row.id;
  editDrawerVisible.value = true;
};

const handleEditSuccess = () => {
  fetchData();
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除角色"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await RoleAPI.delete([row.id]);
    await fetchData();
  } catch {
    // 用户取消
  }
};

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的角色');
    return;
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个角色吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await RoleAPI.delete(selectedIds.value);
    await fetchData();
  } catch {
    // 用户取消
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
};

const handleReset = () => {
  searchForm.value = {
    name: '',
    code: '',
    status: undefined
  };
  currentPage.value = 1;
  fetchData();
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
