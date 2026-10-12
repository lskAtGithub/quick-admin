<template>
  <div class="flex h-full flex-col p-4">
    <QaCardBanner title="菜单管理" class="flex flex-1 flex-col overflow-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold">菜单列表</span>
          <ElButton type="primary" @click="handleAdd">
            <QaSvgIcon icon="ri:add-line" class="mr-1" />
            新增菜单
          </ElButton>
        </div>
      </template>

      <div class="mb-4 flex flex-wrap items-center gap-3">
        <ElInput v-model="searchKeyword" placeholder="搜索菜单名" clearable style="width: 200px" />
        <ElSelect v-model="searchStatus" placeholder="状态" clearable style="width: 120px">
          <ElOption label="启用" value="1" />
          <ElOption label="禁用" value="0" />
        </ElSelect>
        <ElButton type="primary" @click="handleSearch">搜索</ElButton>
        <ElButton @click="handleReset">重置</ElButton>
      </div>

      <div class="flex-1 overflow-auto">
        <ElTable :data="tableData" row-key="id" border default-expand-all :tree-props="{ children: 'children' }" class="w-full">
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
    </QaCardBanner>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { MenuAPI } from "@/api/module_system/menu";

defineOptions({ name: "QaSystemMenu" });

const loading = ref(false);
const searchKeyword = ref("");
const searchStatus = ref("");
const tableData = ref([]);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await MenuAPI.tree();
    tableData.value = res.data || [];
  } catch (error) {
    ElMessage.error("获取菜单列表失败");
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchData());

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

const handleSearch = () => {
  ElMessage.info("搜索功能待实现");
};

const handleReset = () => {
  searchKeyword.value = "";
  searchStatus.value = "";
  ElMessage.success("已重置");
};
</script>
