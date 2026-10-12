<template>
  <div class="flex h-full flex-col p-4">
    <!-- 搜索栏 -->
    <div class="mb-3 flex flex-wrap items-center gap-3">
      <ElInput v-model="searchKeyword" placeholder="搜索角色名" clearable style="width: 200px" />
      <ElSelect v-model="searchStatus" placeholder="状态" clearable style="width: 120px">
        <ElOption label="启用" value="1" />
        <ElOption label="禁用" value="0" />
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
          <ElTableColumn prop="name" label="角色名称" width="150" />
          <ElTableColumn prop="code" label="角色编码" width="150" />
          <ElTableColumn prop="sort" label="排序" width="100" />
          <ElTableColumn prop="status" label="状态" width="100">
            <template #default="{ row }">
              <ElTag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? "启用" : "禁用" }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="remark" label="备注" />
          <ElTableColumn label="操作" fixed="right" width="250">
            <template #default="{ row }">
              <ElButton link type="primary" @click="handleEdit(row)">编辑</ElButton>
              <ElButton link type="warning" @click="handlePermission(row)">权限</ElButton>
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
import { RoleAPI } from "@/api/module_system/role";
import QaTableHeaderLeft from "@/components/tables/qa-table-header-left/index.vue";

defineOptions({ name: "QaSystemRole" });

const loading = ref(false);
const searchKeyword = ref("");
const searchStatus = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref([]);
const selectedIds = ref([]);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await RoleAPI.list({
      page: currentPage.value,
      limit: pageSize.value,
      name: searchKeyword.value || undefined,
      status: searchStatus.value || undefined,
    });
    tableData.value = res.data.list || [];
    total.value = res.data.total || 0;
  } catch (error) {
    console.error("获取角色列表失败", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchData());

const onSelectionChange = (rows) => {
  selectedIds.value = rows.map((r) => r.id);
};

const handleAdd = () => {
  ElMessage.info("新增角色功能待实现");
};

const handleEdit = (row) => {
  ElMessage.info(`编辑角色：${row.name}`);
};

const handlePermission = (row) => {
  ElMessage.info(`设置权限：${row.name}`);
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除角色"${row.name}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    ElMessage.success("删除成功");
  });
};

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个角色吗？`, "提示", {
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
  searchKeyword.value = "";
  searchStatus.value = "";
  currentPage.value = 1;
  fetchData();
};
</script>
