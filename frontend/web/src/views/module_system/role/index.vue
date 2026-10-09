<template>
  <div class="p-4">
    <QaCardBanner title="角色管理">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold">角色列表</span>
          <ElButton type="primary" @click="handleAdd">
            <QaSvgIcon icon="ri:add-line" class="mr-1" />
            新增角色
          </ElButton>
        </div>
      </template>

      <div class="mb-4 flex items-center gap-3">
        <ElInput v-model="searchKeyword" placeholder="搜索角色名" clearable style="width: 200px" />
        <ElSelect v-model="searchStatus" placeholder="状态" clearable style="width: 120px">
          <ElOption label="启用" value="1" />
          <ElOption label="禁用" value="0" />
        </ElSelect>
        <ElButton type="primary" @click="handleSearch">搜索</ElButton>
        <ElButton @click="handleReset">重置</ElButton>
      </div>

      <ElTable :data="tableData" border stripe>
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

      <div class="mt-4 flex justify-end">
        <!-- eslint-disable-next-line vue/no-v-model-argument -->
        <ElPagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" />
      </div>
    </QaCardBanner>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

defineOptions({ name: "QaSystemRole" });

const searchKeyword = ref("");
const searchStatus = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const tableData = ref([
  { id: 1, name: "超级管理员", code: "super_admin", sort: 1, status: 1, remark: "系统最高权限角色" },
  { id: 2, name: "普通用户", code: "user", sort: 2, status: 1, remark: "普通访问权限" },
]);

const handleAdd = () => {
  ElMessage.info("新增角色功能待实现");
};

const handleEdit = (row) => {
  ElMessage.info(`编辑角色：${row.name}`);
};

const handlePermission = (row) => {
  ElMessage.info(`配置权限：${row.name}`);
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

const handleSearch = () => {
  ElMessage.info("搜索功能待实现");
};

const handleReset = () => {
  searchKeyword.value = "";
  searchStatus.value = "";
  ElMessage.success("已重置");
};
</script>
