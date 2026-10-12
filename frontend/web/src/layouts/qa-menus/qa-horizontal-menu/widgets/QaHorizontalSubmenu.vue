<template>
  <ElSubMenu v-if="hasChildren" :index="item.path || item.meta.title" class="p-0!">
    <template #title>
      <QaMenuRouteIcon :icon="item.meta.icon" :color="theme?.iconColor" class="mr-1 text-lg" />
      <span class="text-md">{{ formatMenuTitle(item.meta.title) }}</span>
      <div
        v-if="item.meta.showBadge && !item.meta.showTextBadge"
        class="qa-badge qa-badge-horizontal"
      />
      <div v-if="item.meta.showBadge && item.meta.showTextBadge" class="qa-text-badge">
        {{ item.meta.showTextBadge }}
      </div>
    </template>

    <QaHorizontalSubmenu
      v-for="child in filteredChildren"
      :key="child.path"
      :item="child"
      :theme="theme"
      :level="level + 1"
      @close="closeMenu"
    />
  </ElSubMenu>

  <ElMenuItem
    v-else-if="isNavigableRoute"
    :index="item.path || item.meta.title"
    @click="goPage(item)"
  >
    <QaMenuRouteIcon
      :icon="item.meta.icon"
      :color="theme?.iconColor"
      class="mr-1 text-lg"
      :style="{ color: theme.iconColor }"
    />
    <span class="text-md">{{ formatMenuTitle(item.meta.title) }}</span>
    <div
      v-if="item.meta.showBadge && !item.meta.showTextBadge"
      class="qa-badge"
      :style="{ right: level === 0 ? '10px' : '20px' }"
    />
    <div v-if="item.meta.showBadge && item.meta.showTextBadge && level !== 0" class="qa-text-badge">
      {{ item.meta.showTextBadge }}
    </div>
  </ElMenuItem>
</template>

<script setup>
import { computed } from 'vue';
import { handleMenuJump, formatMenuTitle } from '@/utils';

defineOptions({ name: 'QaHorizontalSubmenu' });

const props = defineProps({
  item: { type: Object, required: true },
  theme: { type: Object, default: () => ({}) },
  level: { type: Number, default: 0 },
});

const emit = defineEmits(['close']);

const filteredChildren = computed(() => {
  return props.item.children?.filter((child) => !child.meta.isHide) || [];
});

const isNavigableRoute = computed(() => {
  if (props.item.meta?.isHide) {
    return false;
  }
  if (props.item.meta?.shellRoute && props.item.path?.trim()) {
    return true;
  }
  return !!(
    ((props.item.path && props.item.path.trim()) ||
      props.item.meta.link ||
      props.item.meta.isIframe === true) &&
    (props.item.component || props.item.meta.link || props.item.meta.isIframe === true)
  );
});

const hasChildren = computed(() => {
  return filteredChildren.value.length > 0;
});

const goPage = (item) => {
  closeMenu();
  handleMenuJump(item);
};

const closeMenu = () => {
  emit('close');
};
</script>

<style scoped>
:deep(.el-sub-menu__title .el-sub-menu__icon-arrow) {
  right: 10px !important;
}
</style>
