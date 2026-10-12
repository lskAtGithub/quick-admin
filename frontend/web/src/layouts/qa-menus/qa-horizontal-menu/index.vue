<template>
  <div id="app-menu-top" class="flex-1 overflow-hidden">
    <ElMenu
      :ellipsis="true"
      mode="horizontal"
      :default-active="routerPath"
      :text-color="isDark ? 'var(--qa-gray-800)' : 'var(--qa-gray-700)'"
      :popper-offset="-6"
      background-color="transparent"
      :show-timeout="50"
      :hide-timeout="50"
      popper-class="horizontal-menu-popper"
      class="w-full border-none"
    >
      <QaHorizontalSubmenu
        v-for="item in filteredMenuItems"
        :key="item.path"
        :item="item"
        :level="0"
      />
    </ElMenu>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSettingStore } from '@/store';
import { storeToRefs } from 'pinia';
import QaHorizontalSubmenu from './widgets/QaHorizontalSubmenu.vue';

defineOptions({ name: 'QaHorizontalMenu' });

const props = defineProps({
  list: { type: Array, default: () => [] },
});

const route = useRoute();
const settingStore = useSettingStore();
const { isDark } = storeToRefs(settingStore);

const filteredMenuItems = computed(() => {
  return filterMenuItems(props.list);
});

const routerPath = computed(() => String(route.meta.activePath || route.path));

const filterMenuItems = (items) => {
  return items
    .filter((item) => {
      if (item.meta.isHide) {
        return false;
      }

      if (item.children && item.children.length > 0) {
        const filteredChildren = filterMenuItems(item.children);
        return filteredChildren.length > 0;
      }

      return true;
    })
    .map((item) => ({
      ...item,
      children: item.children ? filterMenuItems(item.children) : undefined,
    }));
};
</script>

<style scoped>
:deep(.el-menu) {
  border-bottom: none !important;
}

:deep(.el-menu-item[tabindex="0"]) {
  background-color: transparent !important;
  border: none !important;
}

:deep(.el-menu--horizontal .el-sub-menu__title) {
  padding: 0 30px 0 10px !important;
  border: 0 !important;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: var(--el-color-primary-light-9) !important;
}
</style>

<style lang="scss">
.horizontal-menu-popper {
  .el-menu-item:hover,
  .el-sub-menu__title:hover {
    background-color: var(--el-color-primary-light-9) !important;
    border-radius: 6px;
  }
}

.dark {
  .horizontal-menu-popper {
    .el-menu-item:hover,
    .el-sub-menu__title:hover {
      background-color: color-mix(in srgb, var(--el-color-primary) 15%, transparent) !important;
    }
  }
}
</style>
