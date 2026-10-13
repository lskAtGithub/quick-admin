<template>
  <div class="flex h-full">
    <!-- 左侧部门树 -->
    <div class="w-65 flex-shrink-0 pr-2">
      <ElCard class="h-full" shadow="hover">
        <template #header>
          <b>部门</b>
        </template>
        <ElScrollbar class="h-full">
          <QaDeptTree v-model="deptFilterId" @node-click="handleDeptNodeClick" />
        </ElScrollbar>
      </ElCard>
    </div>

    <!-- 右侧表格区域 -->
    <div class="flex flex-1 flex-col min-w-0 pl-2">
      <!-- 搜索栏 -->
      <ElCard class="mb-3" shadow="never">
        <div class="flex items-center justify-between">
          <div class="flex flex-wrap items-center gap-2">
            <ElInput v-model="searchForm.username" placeholder="用户名" clearable class="search-input-sm" />
            <ElInput v-model="searchForm.name" placeholder="姓名" clearable class="search-input-sm" />
            <ElInput v-model="searchForm.mobile" placeholder="手机号" clearable class="search-input-sm" />
            <ElSelect v-model="searchForm.status" placeholder="状态" clearable class="search-input-xs">
              <ElOption label="启用" :value="0" />
              <ElOption label="禁用" :value="1" />
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
          <QaTableHeaderLeft :remove-ids="selectedIds" :create-loading="loading" @add="handleAdd" @delete="handleBatchDelete" />
        </div>

        <!-- 表格 -->
        <QaTable
          :data-source="tableData"
          :columns="columns"
          :paging="{ page_no: currentPage, page_size: pageSize, total }"
          @selection-change="onSelectionChange"
          @page-change="handlePageChange"
        >
          <template #gender="{ row }">
            <ElTag v-if="row.gender === '0'" type="success">男</ElTag>
            <ElTag v-else-if="row.gender === '1'" type="warning">女</ElTag>
            <ElTag v-else type="info">未知</ElTag>
          </template>
          <template #status="{ row }">
            <ElTag :type="row.status === 0 ? 'success' : 'danger'">
              {{ row.status === 0 ? '启用' : '禁用' }}
            </ElTag>
          </template>
          <template #is_superuser="{ row }">
            <ElTag v-if="row.is_superuser" type="danger">是</ElTag>
            <ElTag v-else type="info">否</ElTag>
          </template>
          <template #action="{ row }">
            <ElButton link type="primary" @click="handleEdit(row)">编辑</ElButton>
            <ElButton link type="danger" @click="handleDelete(row)">删除</ElButton>
          </template>
        </QaTable>
      </ElCard>
    </div>

    <!-- 新增用户对话框 -->
    <UserAdd v-model="addDialogVisible" @success="handleAddSuccess" />

    <!-- 编辑用户对话框 -->
    <UserEdit v-model="editDialogVisible" :user-id="editUserId" @success="handleEditSuccess" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UserAPI } from '@/api/module_system/user';
import QaTable from '@/components/tables/qa-table/index.vue';
import QaTableHeaderLeft from '@/components/tables/qa-table-header-left/index.vue';
import QaDeptTree from './components/QaDeptTree.vue';
import UserAdd from './add/index.vue';
import UserEdit from './edit/index.vue';

defineOptions({ name: 'QaSystemUser' });

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref([]);
const selectedIds = ref([]);
const deptFilterId = ref();

const columns = [
  { type: 'selection', width: 50 },
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'username', label: '用户名', width: 120 },
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'mobile', label: '手机号', width: 130 },
  { prop: 'email', label: '邮箱', width: 180 },
  { prop: 'gender', label: '性别', width: 80, slotName: 'gender' },
  { prop: 'dept_name', label: '部门', width: 150 },
  { prop: 'status', label: '状态', width: 100, slotName: 'status' },
  { prop: 'is_superuser', label: '超管', width: 80, slotName: 'is_superuser' },
  { prop: 'last_login', label: '最后登录', width: 180 },
  { prop: 'description', label: '备注', showOverflowTooltip: true },
  { label: '操作', fixed: 'right', width: 200, slotName: 'action' }
];

const searchForm = ref({
  username: '',
  name: '',
  mobile: '',
  status: undefined
});

const addDialogVisible = ref(false);
const editDialogVisible = ref(false);
const editUserId = ref(null);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await UserAPI.listUser({
      page: currentPage.value,
      limit: pageSize.value,
      ...searchForm.value,
      dept_id: deptFilterId.value
    });
    tableData.value = res.data.items || [];
    total.value = res.data.total || 0;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const handleDeptNodeClick = () => {
  currentPage.value = 1;
  fetchData();
};

const onSelectionChange = (rows) => {
  selectedIds.value = rows.map((r) => r.id);
};

const handleAdd = () => {
  addDialogVisible.value = true;
};

const handleAddSuccess = () => {
  fetchData();
};

const handleEdit = (row) => {
  editUserId.value = row.id;
  editDialogVisible.value = true;
};

const handleEditSuccess = () => {
  fetchData();
};

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确定删除用户"${row.username}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  });
  await UserAPI.deleteUser({ ids: [row.id] });
  await fetchData();
};

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的用户');
    return;
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await UserAPI.deleteUser({ ids: selectedIds.value });
    await fetchData();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败', error);
    }
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
};

const handleReset = () => {
  searchForm.value = {
    username: '',
    name: '',
    mobile: '',
    status: undefined
  };
  currentPage.value = 1;
  fetchData();
};

const handlePageChange = ({ page_no, page_size }) => {
  currentPage.value = page_no;
  pageSize.value = page_size;
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
