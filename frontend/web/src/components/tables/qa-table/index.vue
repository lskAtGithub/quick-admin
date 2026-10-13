<template>
  <div class="qa-table-wrapper">
    <div class="flex-1 overflow-auto">
      <ElTable :data="dataSource" v-bind="attrs" border stripe class="w-full" ref="QaTableRef">
        <QaTableColumn v-for="(column, idx) in columns" :key="column.prop || column.slotName || idx" :column="column" :empty-text="emptyText">
          <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData || {}" />
          </template>
        </QaTableColumn>
      </ElTable>
    </div>

    <div class="mt-4 flex justify-end" v-if="isPaging">
      <ElPagination
        :current-page="paging.page_no"
        :page-size="paging.page_size"
        :total="paging.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, useAttrs } from 'vue';
import QaTableColumn from './QaTableColumn.vue';

const attrs = useAttrs();
const QaTableRef = ref(null);

const props = defineProps({
  dataSource: { type: Array, required: true },
  paging: { type: Object, default: () => ({}) },
  columns: { type: Array, default: () => [] },
  emptyText: { type: String, default: '--' }
});

const emits = defineEmits(['pageChange']);

const isPaging = computed(() => props.paging && props.paging.page_no > 0);

const handlePageChange = (page) => {
  emits('pageChange', { page_no: page, page_size: props.paging.page_size });
};

const handleSizeChange = (size) => {
  emits('pageChange', { page_no: 1, page_size: size });
};

defineExpose({ QaTableRef });
</script>

<style scoped lang="scss"></style>
