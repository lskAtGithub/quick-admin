<template>
  <div class="flex h-full">
    <!-- 左侧部门树 -->
    <div class="w-65 flex-shrink-0 pr-2">
      <ElCard class="h-full" shadow="hover">
        <template #header>
          <b>{{ $t('system.user.dept') }}</b>
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
            <ElInput v-model="searchForm.username" :placeholder="$t('system.user.username')" clearable class="search-input-sm" />
            <ElInput v-model="searchForm.name" :placeholder="$t('system.user.name')" clearable class="search-input-sm" />
            <ElInput v-model="searchForm.mobile" :placeholder="$t('system.user.mobile')" clearable class="search-input-sm" />
            <ElSelect v-model="searchForm.status" :placeholder="$t('common.status')" clearable class="search-input-xs">
              <ElOption :label="$t('common.enabled')" :value="0" />
              <ElOption :label="$t('system.user.banned')" :value="1" />
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
            <ElTag v-if="row.gender === '0'" type="success">{{ $t('system.user.male') }}</ElTag>
            <ElTag v-else-if="row.gender === '1'" type="warning">{{ $t('system.user.female') }}</ElTag>
            <ElTag v-else type="info">{{ $t('system.user.unknown') }}</ElTag>
          </template>
          <template #status="{ row }">
            <ElTag :type="row.status === 0 ? 'success' : 'danger'">
              {{ row.status === 0 ? $t('common.enabled') : $t('system.user.banned') }}
            </ElTag>
          </template>
          <template #is_superuser="{ row }">
            <ElTag v-if="row.is_superuser" type="danger">{{ $t('common.yes') }}</ElTag>
            <ElTag v-else type="info">{{ $t('common.no') }}</ElTag>
          </template>
          <template #action="{ row }">
            <ElButton link type="primary" @click="handleEdit(row)">{{ $t('common.edit') }}</ElButton>
            <ElButton link type="danger" @click="handleDelete(row)">{{ $t('common.delete') }}</ElButton>
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
import { $t } from '@/locales';
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
  { prop: 'username', label: $t('system.user.username'), width: 120 },
  { prop: 'name', label: $t('system.user.name'), width: 120 },
  { prop: 'mobile', label: $t('system.user.mobile'), width: 130 },
  { prop: 'email', label: $t('system.user.email'), width: 180 },
  { prop: 'gender', label: $t('system.user.gender'), width: 80, slotName: 'gender' },
  { prop: 'dept_name', label: $t('system.user.dept'), width: 150 },
  { prop: 'status', label: $t('common.status'), width: 100, slotName: 'status' },
  { prop: 'is_superuser', label: $t('system.user.superuser'), width: 80, slotName: 'is_superuser' },
  { prop: 'last_login', label: $t('system.user.lastLogin'), width: 180 },
  { prop: 'description', label: $t('common.remark'), showOverflowTooltip: true },
  { label: $t('common.operation'), fixed: 'right', width: 200, slotName: 'action' }
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
      page_no: currentPage.value,
      page_size: pageSize.value,
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
  await ElMessageBox.confirm($t('common.deleteConfirm', { kind: $t('system.user.entity'), name: row.username }), $t('common.tips'), {
    confirmButtonText: $t('common.confirm'),
    cancelButtonText: $t('common.cancel'),
    type: 'warning'
  });
  await UserAPI.deleteUser({ ids: [row.id] });
  await fetchData();
};

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning($t('common.selectToDelete', { kind: $t('system.user.entity') }));
    return;
  }
  try {
    await ElMessageBox.confirm($t('common.batchDeleteConfirm', { count: selectedIds.value.length, kind: $t('system.user.entity') }), $t('common.tips'), {
      confirmButtonText: $t('common.confirm'),
      cancelButtonText: $t('common.cancel'),
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
