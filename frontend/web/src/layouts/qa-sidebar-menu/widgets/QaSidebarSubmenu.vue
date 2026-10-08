<template>
  <template v-for="(item, index) in filteredMenuItems" :key="getUniqueKey(item, index)">
    <ElSubMenu v-if="hasChildren(item)" :index="item.path || item.meta.title" :level="level">
      <template #title>
        <div class="menu-icon flex items-center justify-center">
          <QaMenuRouteIcon
            :icon="item.meta.icon"
            :color="theme?.iconColor"
            :style="{ color: theme.iconColor }"
          />
        </div>
        <span class="menu-name">
          {{ formatMenuTitle(item.meta.title) }}
        </span>
        <div
          v-if="item.meta.showBadge && !item.meta.showTextBadge"
          class="qa-badge"
          :style="'right: 10px'"
        />
      </template>

      <QaSidebarSubmenu
        :list="item.children"
        :level="level + 1"
        :theme="theme"
        @close="closeMenu"
      />
    </ElSubMenu>

    <ElMenuItem
      v-else
      :index="isExternalLink(item) ? '' : item.path || item.meta.title"
      :level-item="level + 1"
      @click="goPage(item)"
    >
      <div class="menu-icon flex items-center justify-center">
        <QaMenuRouteIcon
          :icon="item.meta.icon"
          :color="theme?.iconColor"
          :style="{ color: theme.iconColor }"
        />
      </div>
      <div
        v-show="item.meta.showBadge && !item.meta.showTextBadge && level === 0 && !menuOpen"
        class="qa-badge"
        :style="'right: 5px'"
      />

      <template #title>
        <span class="menu-name">
          {{ formatMenuTitle(item.meta.title) }}
        </span>
        <div v-if="item.meta.showBadge && !item.meta.showTextBadge" class="qa-badge" />
        <div
          v-if="item.meta.showBadge && item.meta.showTextBadge && (level > 0 || menuOpen)"
          class="qa-text-badge"
        >
          {{ item.meta.showTextBadge }}
        </div>
      </template>
    </ElMenuItem>
  </template>
</template>

<script setup>
import { formatMenuTitle, handleMenuJump } from "@/utils";
import { useSettingStore } from "@/store";

defineOptions({ name: "QaSidebarSubmenu" });

const props = defineProps({
  /** 菜单标题 */
  title: { type: String, default: "" },
  /** 菜单列表 */
  list: { type: Array, default: () => [] },
  /** 主题配置 */
  theme: { type: Object, default: () => ({}) },
  /** 菜单层级 */
  level: { type: Number, default: 0 },
});

const emit = defineEmits(["close"]);

const settingStore = useSettingStore();
const { menuOpen } = storeToRefs(settingStore);

/** 过滤后的菜单项列表：只显示未隐藏的菜单项 */
const filteredMenuItems = computed(() => filterRoutes(props.list));

/** 跳转到指定页面 */
const goPage = (item) => {
  closeMenu();
  handleMenuJump(item);
};

/** 关闭菜单：触发父组件的关闭事件 */
const closeMenu = () => {
  emit("close");
};

/** 判断菜单项本身是否可以作为可点击页面保留在菜单中 */
const isNavigableRoute = (item) => {
  if (item.meta?.isHide) {
    return false;
  }
  if (item.meta?.shellRoute && item.path?.trim()) {
    return true;
  }
  return !!(
    ((item.path && item.path.trim()) || item.meta.link || item.meta.isIframe === true) &&
    (item.component || item.meta.link || item.meta.isIframe === true)
  );
};

/**
 * 递归过滤菜单路由，移除隐藏的菜单项；
 * 但如果父菜单本身就是可访问页面，则即使子菜单都被隐藏也应该保留
 */
const filterRoutes = (items) => {
  return items
    .filter((item) => {
      if (item.meta.isHide) {
        return false;
      }
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterRoutes(item.children);
        return filteredChildren.length > 0 || isNavigableRoute(item);
      }
      return isNavigableRoute(item);
    })
    .map((item) => ({
      ...item,
      children: item.children ? filterRoutes(item.children) : undefined,
    }));
};

/** 判断菜单项是否包含可见的子菜单 */
const hasChildren = (item) => {
  if (!item.children || item.children.length === 0) {
    return false;
  }
  const filteredChildren = filterRoutes(item.children);
  return filteredChildren.length > 0;
};

/** 判断是否为外部链接 */
const isExternalLink = (item) => {
  return !!(item.meta.link && !item.meta.isIframe);
};

/** 生成唯一的 key：使用 path、title 和 index 组合确保唯一性 */
const getUniqueKey = (item, index) => {
  return `${item.path || item.meta.title || "menu"}-${props.level}-${index}`;
};
</script>
