<!-- 列表页工具栏：预设「新增/导入/导出/批删/更多」按钮 -->
<template>
  <div class="inline-flex flex-wrap items-center gap-2">
    <ElSpace>
      <ElButton
        v-if="permCreate"
        type="primary"
        :icon="Plus"
        :loading="createLoading"
        plain
        @click="$emit('add')"
      >
        新增
      </ElButton>
      <ElButton
        v-if="permImport"
        type="success"
        :icon="Upload"
        :loading="importLoading"
        plain
        @click="$emit('import')"
      >
        导入
      </ElButton>
      <ElButton
        v-if="permExport"
        type="warning"
        :icon="Download"
        :loading="exportLoading"
        plain
        @click="$emit('export')"
      >
        导出
      </ElButton>
      <ElButton
        v-if="permDelete"
        type="danger"
        :icon="Delete"
        :loading="deleteLoading"
        :disabled="removeIds.length === 0"
        plain
        @click="$emit('delete')"
      >
        {{ removeIds.length > 0 ? `批量删除 (${removeIds.length})` : "批量删除" }}
      </ElButton>
      <ElDropdown v-if="permPatch" trigger="click" :disabled="removeIds.length === 0">
        <ElButton type="info" plain :loading="moreLoading">
          更多
          <ElIcon class="el-icon--right">
            <ArrowDown />
          </ElIcon>
        </ElButton>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem :icon="Check" @click="$emit('more', 'enable')">批量启用</ElDropdownItem>
            <ElDropdownItem :icon="CircleClose" @click="$emit('more', 'disable')">批量停用</ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </ElSpace>
  </div>
</template>

<script setup>
import { ArrowDown, Check, CircleClose, Delete, Download, Plus, Upload } from "@element-plus/icons-vue";

defineOptions({ name: "QaTableHeaderLeft" });

defineProps({
  removeIds: { type: Array, default: () => [] },
  permCreate: { type: [String, Array], default: undefined },
  permImport: { type: [String, Array], default: undefined },
  permExport: { type: [String, Array], default: undefined },
  permDelete: { type: [String, Array], default: undefined },
  permPatch: { type: [String, Array], default: undefined },
  createLoading: { type: Boolean, default: false },
  importLoading: { type: Boolean, default: false },
  exportLoading: { type: Boolean, default: false },
  deleteLoading: { type: Boolean, default: false },
  moreLoading: { type: Boolean, default: false },
});

defineEmits(["add", "import", "export", "delete", "more"]);
</script>
