<template>
  <div class="flex h-full flex-col">
    <!-- 搜索栏 -->
    <ElCard class="mb-3" shadow="never">
      <div class="flex items-center justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <ElInput v-model="typeSearch.dict_name" placeholder="字典名称" clearable class="search-input-sm" />
          <ElInput v-model="typeSearch.dict_type" placeholder="字典类型" clearable class="search-input-sm" />
          <ElSelect v-model="typeSearch.status" placeholder="状态" clearable class="search-input-xs">
            <ElOption label="启用" :value="0" />
            <ElOption label="停用" :value="1" />
          </ElSelect>
        </div>
        <div class="flex items-center">
          <ElButton @click="resetTypeSearch">重置</ElButton>
          <ElButton type="primary" @click="searchType">搜索</ElButton>
        </div>
      </div>
    </ElCard>

    <!-- 字典类型表格 -->
    <ElCard class="flex flex-1 flex-col overflow-hidden" shadow="never">
      <div class="mb-3">
        <QaTableHeaderLeft :remove-ids="selectedTypeIds" @add="handleAddType" @delete="handleBatchDeleteType" />
      </div>
      <QaTable
        :data-source="typeList"
        :columns="typeColumns"
        :paging="{ page_no: typePage.page_no, page_size: typePage.page_size, total: typeTotal }"
        highlight-current-row
        @row-click="handleTypeRowClick"
        @selection-change="onTypeSelectionChange"
        @page-change="handleTypePageChange"
      >
        <template #dict_type="{ row }">
          <ElTag type="primary" size="small">{{ row.dict_type }}</ElTag>
        </template>
        <template #type_status="{ row }">
          <ElTag :type="row.status === 0 ? 'success' : 'danger'" size="small">
            {{ row.status === 0 ? '启用' : '停用' }}
          </ElTag>
        </template>
        <template #type_action="{ row }">
          <ElButton link type="primary" size="small" @click.stop="handleEditType(row)">编辑</ElButton>
          <ElButton link type="danger" size="small" @click.stop="handleDeleteType(row)">删除</ElButton>
        </template>
      </QaTable>
    </ElCard>

    <!-- 字典数据抽屉 -->
    <ElDrawer
      v-model="dataDrawerVisible"
      :title="`字典数据 - ${currentType.dict_name || ''}`"
      size="650px"
      direction="rtl"
      @close="handleCloseDataDrawer"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <span class="text-lg font-medium">字典数据</span>
          <ElTag type="primary">{{ currentType.dict_type }}</ElTag>
        </div>
      </template>

      <div class="mb-3">
        <QaTableHeaderLeft :remove-ids="selectedDataIds" @add="handleAddData" @delete="handleBatchDeleteData" />
      </div>

      <QaTable
        :data-source="dataList"
        :columns="dataColumns"
        :paging="{ page_no: dataPage.page_no, page_size: dataPage.page_size, total: dataTotal }"
        @selection-change="onDataSelectionChange"
        @page-change="handleDataPageChange"
      >
        <template #data_status="{ row }">
          <ElTag :type="row.status === 0 ? 'success' : 'danger'" size="small">
            {{ row.status === 0 ? '启用' : '停用' }}
          </ElTag>
        </template>
        <template #data_action="{ row }">
          <ElButton link type="primary" size="small" @click="handleEditData(row)">编辑</ElButton>
          <ElButton link type="danger" size="small" @click="handleDeleteData(row)">删除</ElButton>
        </template>
      </QaTable>
    </ElDrawer>

    <!-- 字典类型表单 -->
    <ElDrawer v-model="typeDrawerVisible" :title="typeDrawerTitle" size="400px" @close="resetTypeForm">
      <ElForm ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="80px">
        <ElFormItem label="字典名称" prop="dict_name">
          <ElInput v-model="typeForm.dict_name" placeholder="请输入字典名称" />
        </ElFormItem>
        <ElFormItem label="字典类型" prop="dict_type">
          <ElInput v-model="typeForm.dict_type" placeholder="请输入字典类型" />
        </ElFormItem>
        <ElFormItem label="状态" prop="status">
          <ElRadioGroup v-model="typeForm.status">
            <ElRadio :value="0">启用</ElRadio>
            <ElRadio :value="1">停用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="描述" prop="description">
          <ElInput v-model="typeForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="typeDrawerVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="typeSubmitting" @click="submitTypeForm">确定</ElButton>
      </template>
    </ElDrawer>

    <!-- 字典数据表单弹窗 -->
    <ElDialog v-model="dataDialogVisible" :title="dataDialogTitle" width="450px" class="data-dialog" @close="resetDataForm">
      <ElForm ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="80px">
        <ElFormItem label="字典标签" prop="dict_label">
          <ElInput v-model="dataForm.dict_label" placeholder="请输入字典标签" />
        </ElFormItem>
        <ElFormItem label="字典键值" prop="dict_value">
          <ElInput v-model="dataForm.dict_value" placeholder="请输入字典键值" />
        </ElFormItem>
        <ElFormItem label="排序" prop="dict_sort">
          <ElInputNumber v-model="dataForm.dict_sort" :min="0" :max="999" />
        </ElFormItem>
        <ElFormItem label="状态" prop="status">
          <ElRadioGroup v-model="dataForm.status">
            <ElRadio :value="0">启用</ElRadio>
            <ElRadio :value="1">停用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="描述" prop="description">
          <ElInput v-model="dataForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dataDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="dataSubmitting" @click="submitDataForm">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import DictAPI from '@/api/module_system/dict';
import QaTable from '@/components/tables/qa-table/index.vue';
import QaTableHeaderLeft from '@/components/tables/qa-table-header-left/index.vue';

defineOptions({ name: 'QaSystemDict' });

// ==================== 字典类型 ====================
const typeList = ref([]);
const typeTotal = ref(0);
const typePage = reactive({ page_no: 1, page_size: 10 });
const typeSearch = ref({ dict_name: '', dict_type: '', status: undefined });
const selectedTypeIds = ref([]);

const typeColumns = [
  { type: 'selection', width: 50 },
  { type: 'index', label: '#', width: 50 },
  { prop: 'dict_name', label: '字典名称', 'min-width': 100, showOverflowTooltip: true },
  { prop: 'dict_type', label: '字典类型', 'min-width': 120, slotName: 'dict_type' },
  { prop: 'status', label: '状态', width: 70, align: 'center', slotName: 'type_status' },
  { prop: 'description', label: '描述', 'min-width': 150, showOverflowTooltip: true },
  { label: '操作', width: 120, align: 'center', fixed: 'right', slotName: 'type_action' }
];

async function fetchTypeList() {
  const res = await DictAPI.listType({ ...typePage, ...typeSearch.value });
  if (res.code === 0) {
    typeList.value = res.data.items ?? [];
    typeTotal.value = res.data.total ?? 0;
  }
}

function searchType() {
  typePage.page_no = 1;
  fetchTypeList();
}

function resetTypeSearch() {
  typeSearch.value = { dict_name: '', dict_type: '', status: undefined };
  typePage.page_no = 1;
  fetchTypeList();
}

function handleTypePageChange({ page_no, page_size }) {
  typePage.page_no = page_no;
  typePage.page_size = page_size;
  fetchTypeList();
}

function onTypeSelectionChange(rows) {
  selectedTypeIds.value = rows.map((r) => r.id);
}

// ==================== 字典数据 ====================
const dataList = ref([]);
const dataTotal = ref(0);
const dataPage = reactive({ page_no: 1, page_size: 10 });
const selectedDataIds = ref([]);

const dataColumns = [
  { type: 'selection', width: 50 },
  { type: 'index', label: '#', width: 50 },
  { prop: 'dict_label', label: '字典标签', 'min-width': 100, showOverflowTooltip: true },
  { prop: 'dict_value', label: '字典键值', 'min-width': 80, showOverflowTooltip: true },
  { prop: 'dict_sort', label: '排序', width: 60, align: 'center' },
  { prop: 'status', label: '状态', width: 80, align: 'center', slotName: 'data_status' },
  { label: '操作', width: 100, align: 'center', fixed: 'right', slotName: 'data_action' }
];

const currentType = reactive({ id: 0, dict_type: '', dict_name: '' });
const dataDrawerVisible = ref(false);

async function fetchDataList() {
  if (!currentType.dict_type) return;
  const res = await DictAPI.listData({ ...dataPage, dict_type: currentType.dict_type });
  if (res.code === 0) {
    dataList.value = res.data.items ?? [];
    dataTotal.value = res.data.total ?? 0;
  }
}

function handleTypeRowClick(row) {
  currentType.id = row.id;
  currentType.dict_type = row.dict_type;
  currentType.dict_name = row.dict_name;
  dataPage.page_no = 1;
  dataDrawerVisible.value = true;
  fetchDataList();
}

function handleCloseDataDrawer() {
  currentType.id = 0;
  currentType.dict_type = '';
  currentType.dict_name = '';
  dataList.value = [];
  dataTotal.value = 0;
}

function handleDataPageChange({ page_no, page_size }) {
  dataPage.page_no = page_no;
  dataPage.page_size = page_size;
  fetchDataList();
}

function onDataSelectionChange(rows) {
  selectedDataIds.value = rows.map((r) => r.id);
}

// ==================== 字典类型 CRUD ====================
const typeDrawerVisible = ref(false);
const typeDrawerTitle = ref('');
const typeSubmitting = ref(false);
const typeFormRef = ref(null);
const typeForm = reactive({ id: null, dict_name: '', dict_type: '', status: 0, description: '' });
const typeRules = {
  dict_name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  dict_type: [{ required: true, message: '请输入字典类型', trigger: 'blur' }]
};

function handleAddType() {
  typeDrawerTitle.value = '新增字典类型';
  Object.assign(typeForm, { id: null, dict_name: '', dict_type: '', status: 0, description: '' });
  typeDrawerVisible.value = true;
}

function handleEditType(row) {
  typeDrawerTitle.value = '编辑字典类型';
  Object.assign(typeForm, { id: row.id, dict_name: row.dict_name, dict_type: row.dict_type, status: row.status, description: row.description });
  typeDrawerVisible.value = true;
}

function resetTypeForm() {
  typeFormRef.value?.resetFields();
}

async function submitTypeForm() {
  const valid = await typeFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  typeSubmitting.value = true;
  try {
    if (typeForm.id) {
      await DictAPI.updateType(typeForm.id, { dict_name: typeForm.dict_name, dict_type: typeForm.dict_type, status: typeForm.status, description: typeForm.description });
    } else {
      await DictAPI.createType({ dict_name: typeForm.dict_name, dict_type: typeForm.dict_type, status: typeForm.status, description: typeForm.description });
    }
    typeDrawerVisible.value = false;
    fetchTypeList();
  } finally {
    typeSubmitting.value = false;
  }
}

async function handleDeleteType(row) {
  await ElMessageBox.confirm(`确定删除「${row.dict_name}」吗？`, '提示', { type: 'warning' });
  await DictAPI.deleteType({ ids: [row.id] });
  if (currentType.id === row.id) {
    handleCloseDataDrawer();
  }
  fetchTypeList();
}

async function handleBatchDeleteType() {
  if (selectedTypeIds.value.length === 0) {
    ElMessage.warning('请选择要删除的字典类型');
    return;
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedTypeIds.value.length} 个字典类型吗？`, '提示', { type: 'warning' });
    await DictAPI.deleteType({ ids: selectedTypeIds.value });
    fetchTypeList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败', error);
    }
  }
}

// ==================== 字典数据 CRUD ====================
const dataDialogVisible = ref(false);
const dataDialogTitle = ref('');
const dataSubmitting = ref(false);
const dataFormRef = ref(null);
const dataForm = reactive({ id: null, dict_label: '', dict_value: '', dict_type: '', dict_type_id: null, dict_sort: 0, status: 0, description: '' });
const dataRules = {
  dict_label: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  dict_value: [{ required: true, message: '请输入字典键值', trigger: 'blur' }]
};

function handleAddData() {
  dataDialogTitle.value = '新增字典数据';
  Object.assign(dataForm, { id: null, dict_label: '', dict_value: '', dict_type: currentType.dict_type, dict_type_id: currentType.id, dict_sort: 0, status: 0, description: '' });
  dataDialogVisible.value = true;
}

function handleEditData(row) {
  dataDialogTitle.value = '编辑字典数据';
  Object.assign(dataForm, { id: row.id, dict_label: row.dict_label, dict_value: row.dict_value, dict_type: row.dict_type, dict_type_id: row.dict_type_id, dict_sort: row.dict_sort, status: row.status, description: row.description });
  dataDialogVisible.value = true;
}

function resetDataForm() {
  dataFormRef.value?.resetFields();
}

async function submitDataForm() {
  const valid = await dataFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  dataSubmitting.value = true;
  try {
    if (dataForm.id) {
      await DictAPI.updateData(dataForm.id, { dict_label: dataForm.dict_label, dict_value: dataForm.dict_value, dict_sort: dataForm.dict_sort, status: dataForm.status, description: dataForm.description });
    } else {
      await DictAPI.createData({ dict_label: dataForm.dict_label, dict_value: dataForm.dict_value, dict_type: dataForm.dict_type, dict_type_id: dataForm.dict_type_id, dict_sort: dataForm.dict_sort, status: dataForm.status, description: dataForm.description });
    }
    dataDialogVisible.value = false;
    fetchDataList();
  } finally {
    dataSubmitting.value = false;
  }
}

async function handleDeleteData(row) {
  await ElMessageBox.confirm(`确定删除「${row.dict_label}」吗？`, '提示', { type: 'warning' });
  await DictAPI.deleteData({ ids: [row.id] });
  fetchDataList();
}

async function handleBatchDeleteData() {
  if (selectedDataIds.value.length === 0) {
    ElMessage.warning('请选择要删除的字典数据');
    return;
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedDataIds.value.length} 个字典数据吗？`, '提示', { type: 'warning' });
    await DictAPI.deleteData({ ids: selectedDataIds.value });
    fetchDataList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败', error);
    }
  }
}

onMounted(() => {
  fetchTypeList();
});
</script>

<style scoped>
.search-input-sm {
  width: 150px;
}

.search-input-xs {
  width: 120px;
}

:deep(.data-dialog .el-dialog__body) {
  padding: 20px;
}
</style>
