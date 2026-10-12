<template>
  <div class="flex h-full flex-col p-4">
    <!-- 搜索栏 -->
    <div class="mb-3 flex flex-wrap items-center gap-3">
      <ElInput v-model="searchKeyword" placeholder="搜索菜单名" clearable style="width: 200px" />
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
        <ElTable :data="tableData" row-key="id" border default-expand-all :tree-props="{ children: 'children' }" class="w-full" @selection-change="onSelectionChange">
          <ElTableColumn type="selection" width="50" />
          <ElTableColumn prop="name" label="菜单名称" width="200" />
          <ElTableColumn prop="icon" label="图标" width="100">
            <template #default="{ row }">
              <QaSvgIcon v-if="row.icon" :icon="row.icon" />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="path" label="路由路径" width="180" />
          <ElTableColumn prop="component" label="组件路径" />
          <ElTableColumn prop="sort" label="排序" width="80" />
          <ElTableColumn prop="status" label="状态" width="100">
            <template #default="{ row }">
              <ElTag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? "启用" : "禁用" }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" fixed="right" width="250">
            <template #default="{ row }">
              <ElButton link type="primary" @click="handleEdit(row)">编辑</ElButton>
              <ElButton link type="success" @click="handleAddChild(row)">新增</ElButton>
              <ElButton link type="danger" @click="handleDelete(row)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { MenuAPI } from "@/api/module_system/menu";
import QaTableHeaderLeft from "@/components/tables/qa-table-header-left/index.vue";

defineOptions({ name: "QaSystemMenu" });

const loading = ref(false);
const searchKeyword = ref("");
const searchStatus = ref("");
const tableData = ref([]);
const selectedIds = ref([]);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await MenuAPI.tree();
    tableData.value = res.data || [];
  } catch (error) {
    console.error("获取菜单列表失败", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchData());

const onSelectionChange = (rows) => {
  selectedIds.value = rows.map((r) => r.id);
};

const handleAdd = () => {
  ElMessage.info("新增菜单功能待实现");
};

const handleAddChild = (row) => {
  ElMessage.info(`新增子菜单：${row.name}`);
};

const handleEdit = (row) => {
  ElMessage.info(`编辑菜单：${row.name}`);
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除菜单"${row.name}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    ElMessage.success("删除成功");
  });
};

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个菜单吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    ElMessage.success("批量删除成功");
  });
};

const handleSearch = () => {
  fetchData();
};

const handleReset = () => {
  searchKeyword.value = "";
  searchStatus.value = "";
  fetchData();
};
</script>
