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
      <div class="mb-3 flex items-center gap-2">
        <div class="flex flex-1 flex-wrap items-center gap-2">
          <ElInput v-model="searchForm.username" placeholder="用户名" clearable style="width: 150px" />
          <ElInput v-model="searchForm.name" placeholder="姓名" clearable style="width: 150px" />
          <ElInput v-model="searchForm.mobile" placeholder="手机号" clearable style="width: 150px" />
          <ElSelect v-model="searchForm.status" placeholder="状态" clearable style="width: 120px">
            <ElOption label="启用" :value="0" />
            <ElOption label="禁用" :value="1" />
          </ElSelect>
        </div>
        <div class="flex items-center">
          <ElButton @click="handleReset">重置</ElButton>
          <ElButton type="primary" @click="handleSearch">搜索</ElButton>
        </div>
      </div>

      <!-- 表格卡片 -->
      <ElCard class="flex flex-1 flex-col overflow-hidden" shadow="never">
        <!-- 工具栏 -->
        <div class="mb-3">
          <QaTableHeaderLeft :remove-ids="selectedIds" :create-loading="loading" @add="handleAdd" @delete="handleBatchDelete" />
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
                  {{ row.status === 0 ? '启用' : '禁用' }}
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
          <ElPagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </ElCard>
    </div>

    <!-- 新增/编辑对话框 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <ElForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="right"
      >
        <ElFormItem label="用户名" prop="username">
          <ElInput v-model="formData.username" placeholder="请输入用户名" :disabled="!!formData.id" />
        </ElFormItem>
        <ElFormItem label="密码" prop="password" v-if="!formData.id">
          <ElInput v-model="formData.password" type="password" placeholder="请输入密码" show-password />
        </ElFormItem>
        <ElFormItem label="姓名" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入姓名" />
        </ElFormItem>
        <ElFormItem label="手机号" prop="mobile">
          <ElInput v-model="formData.mobile" placeholder="请输入手机号" />
        </ElFormItem>
        <ElFormItem label="邮箱" prop="email">
          <ElInput v-model="formData.email" placeholder="请输入邮箱" />
        </ElFormItem>
        <ElFormItem label="性别" prop="gender">
          <ElSelect v-model="formData.gender" placeholder="请选择性别">
            <ElOption label="男" value="0" />
            <ElOption label="女" value="1" />
            <ElOption label="未知" value="2" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="部门" prop="dept_id">
          <ElTreeSelect
            v-model="formData.dept_id"
            placeholder="请选择部门"
            :data="deptOptions"
            :props="{ children: 'children', label: 'label', value: 'value' }"
            check-strictly
            filterable
          />
        </ElFormItem>
        <ElFormItem label="角色" prop="role_ids">
          <ElSelect v-model="formData.role_ids" multiple placeholder="请选择角色" filterable>
            <ElOption v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态" prop="status">
          <ElRadioGroup v-model="formData.status">
            <ElRadio :value="0">启用</ElRadio>
            <ElRadio :value="1">禁用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="备注" prop="description">
          <ElInput v-model="formData.description" type="textarea" :rows="3" placeholder="请输入备注" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UserAPI } from '@/api/module_system/user';
import DeptAPI from '@/api/module_system/dept';
import RoleAPI from '@/api/module_system/role';
import QaTableHeaderLeft from '@/components/tables/qa-table-header-left/index.vue';
import QaDeptTree from './components/QaDeptTree.vue';

defineOptions({ name: 'QaSystemUser' });

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref([]);
const selectedIds = ref([]);
const deptFilterId = ref();

const searchForm = ref({
  username: '',
  name: '',
  mobile: '',
  status: undefined
});

const dialogVisible = ref(false);
const dialogTitle = ref('');
const submitLoading = ref(false);
const formRef = ref();
const formData = ref({
  id: undefined,
  username: '',
  password: '',
  name: '',
  mobile: '',
  email: '',
  gender: '0',
  dept_id: undefined,
  role_ids: [],
  status: 0,
  description: ''
});

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  dept_id: [{ required: true, message: '请选择部门', trigger: 'change' }],
  role_ids: [{ required: true, message: '请选择角色', trigger: 'change' }]
};

const deptOptions = ref([]);
const roleOptions = ref([]);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await UserAPI.listUser({
      page: currentPage.value,
      limit: pageSize.value,
      ...searchForm.value,
      dept_id: deptFilterId.value
    });
    console.log(res.data);
    tableData.value = res.data.items || [];
    total.value = res.data.total || 0;
  } catch (error) {
    console.error('获取用户列表失败', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
  loadDeptOptions();
  loadRoleOptions();
});

const loadDeptOptions = async () => {
  try {
    const res = await DeptAPI.list();
    deptOptions.value = formatTree(res.data || []);
  } catch (error) {
    console.error('加载部门列表失败', error);
  }
};

const loadRoleOptions = async () => {
  try {
    const res = await RoleAPI.list();
    roleOptions.value = (res.data.items || []).map((item) => ({
      label: item.name,
      value: item.id
    }));
  } catch (error) {
    console.error('加载角色列表失败', error);
  }
};

const formatTree = (data, parentId = 0) => {
  const result = [];
  for (const item of data) {
    if (item.parent_id === parentId) {
      const children = formatTree(data, item.id);
      const node = {
        value: item.id,
        label: item.name,
        children: children.length > 0 ? children : undefined
      };
      result.push(node);
    }
  }
  return result;
};

const handleDeptNodeClick = () => {
  currentPage.value = 1;
  fetchData();
};

const onSelectionChange = (rows) => {
  selectedIds.value = rows.map((r) => r.id);
};

const handleAdd = async () => {
  dialogTitle.value = '新增用户';
  formData.value = {
    id: undefined,
    username: '',
    password: '',
    name: '',
    mobile: '',
    email: '',
    gender: '0',
    dept_id: undefined,
    role_ids: [],
    status: 0,
    description: ''
  };
  dialogVisible.value = true;
};

const handleEdit = async (row) => {
  dialogTitle.value = '编辑用户';
  try {
    const res = await UserAPI.detailUser(row.id);
    const data = res.data;
    formData.value = {
      id: data.id,
      username: data.username,
      password: '',
      name: data.name,
      mobile: data.mobile,
      email: data.email,
      gender: data.gender || '0',
      dept_id: data.dept_id,
      role_ids: data.role_ids || [],
      status: data.status,
      description: data.description
    };
    dialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取用户详情失败');
  }
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除用户"${row.username}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await UserAPI.deleteUser({ ids: [row.id] });
    ElMessage.success('删除成功');
    await fetchData();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
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
    ElMessage.success('批量删除成功');
    await fetchData();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败');
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  
  submitLoading.value = true;
  try {
    if (formData.value.id) {
      await UserAPI.updateUser(formData.value.id, formData.value);
      ElMessage.success('修改成功');
    } else {
      await UserAPI.createUser(formData.value);
      ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
    await fetchData();
  } catch (error) {
    ElMessage.error(formData.value.id ? '修改失败' : '新增失败');
  } finally {
    submitLoading.value = false;
  }
};

const handleDialogClose = () => {
  formRef.value?.resetFields();
  formData.value = {
    id: undefined,
    username: '',
    password: '',
    name: '',
    mobile: '',
    email: '',
    gender: '0',
    dept_id: undefined,
    role_ids: [],
    status: 0,
    description: ''
  };
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

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchData();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchData();
};
</script>
