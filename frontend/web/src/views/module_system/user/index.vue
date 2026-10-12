<template>
  <div class="flex h-full flex-col p-4">
    <!-- 搜索栏 -->
    <div class="mb-3 flex flex-wrap items-center gap-3">
      <ElInput v-model="searchForm.username" placeholder="用户名" clearable style="width: 150px" />
      <ElInput v-model="searchForm.name" placeholder="姓名" clearable style="width: 150px" />
      <ElInput v-model="searchForm.mobile" placeholder="手机号" clearable style="width: 150px" />
      <ElSelect v-model="searchForm.status" placeholder="状态" clearable style="width: 120px">
        <ElOption label="启用" :value="0" />
        <ElOption label="禁用" :value="1" />
      </ElSelect>
      <ElButton type="primary" @click="handleSearch">搜索</ElButton>
      <ElButton @click="handleReset">重置</ElButton>
    </div>

    <!-- 表格卡片 -->
    <ElCard class="flex flex-1 flex-col overflow-hidden" shadow="never">
      <!-- 工具栏 -->
      <div class="mb-3">
        <QaTableHeaderLeft
          :remove-ids="selectedIds"
          :create-loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
        />
      </div>

      <!-- 表格 -->
      <div class="flex-1 overflow-auto">
        <ElTable :data="tableData" border stripe class="w-full" @selection-change="onSelectionChange">
          <ElTableColumn type="selection" width="50" />
          <ElTableColumn prop="id" label="ID" width="80" />
          <ElTableColumn prop="username" label="用户名" width="120" />
          <ElTableColumn prop="name" label="姓名" width="120" />
          <ElTableColumn prop="mobile" label="手机号" width="130" />
          <ElTableColumn prop="email" label="邮箱" width="180" />
          <ElTableColumn prop="gender" label="性别" width="80">
            <template #default="{ row }">
              <ElTag v-if="row.gender === '0'" type="success">男</ElTag>
              <ElTag v-else-if="row.gender === '1'" type="warning">女</ElTag>
              <ElTag v-else type="info">未知</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="dept_name" label="部门" width="150" />
          <ElTableColumn prop="status" label="状态" width="100">
            <template #default="{ row }">
              <ElTag :type="row.status === 0 ? 'success' : 'danger'">
                {{ row.status === 0 ? "启用" : "禁用" }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="is_superuser" label="超管" width="80">
            <template #default="{ row }">
              <ElTag v-if="row.is_superuser" type="danger">是</ElTag>
              <ElTag v-else type="info">否</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="last_login" label="最后登录" width="180" />
          <ElTableColumn prop="description" label="备注" show-overflow-tooltip />
          <ElTableColumn label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <ElButton link type="primary" @click="handleEdit(row)">编辑</ElButton>
              <ElButton link type="danger" @click="handleDelete(row)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <!-- eslint-disable-next-line vue/no-v-model-argument -->
        <ElPagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" />
      </div>
    </ElCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { UserAPI } from "@/api/module_system/user";
import QaTableHeaderLeft from "@/components/tables/qa-table-header-left/index.vue";

defineOptions({ name: "QaSystemUser" });

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref([]);
const selectedIds = ref([]);

const searchForm = ref({
  username: "",
  name: "",
  mobile: "",
  status: undefined,
});

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await UserAPI.listUser({
      page: currentPage.value,
      limit: pageSize.value,
      ...searchForm.value,
    });
    tableData.value = res.data.items || [];
    total.value = res.data.total || 0;
  } catch (error) {
    console.error("获取用户列表失败", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchData());

const onSelectionChange = (rows) => {
  selectedIds.value = rows.map((r) => r.id);
};

const handleAdd = () => {
  ElMessage.info("新增用户功能待实现");
};

const handleEdit = (row) => {
  ElMessage.info(`编辑用户：${row.username}`);
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除用户"${row.username}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    ElMessage.success("删除成功");
  });
};

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个用户吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    ElMessage.success("批量删除成功");
  });
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
};

const handleReset = () => {
  searchForm.value = {
    username: "",
    name: "",
    mobile: "",
    status: undefined,
  };
  currentPage.value = 1;
  fetchData();
};
</script>
