<!-- 多标签栏 -->
<template>
  <div
    v-if="showWorkTab"
    ref="qaWorkTabRef"
    class="qa-work-tab"
    :class="[
      tabStyleClass,
      {
        'qa-work-tab--dark': isDark,
        'qa-work-tab--fixed': isFixed,
        'qa-work-tab--touch': isTouch,
        'qa-work-tab--hover': isHover,
      },
    ]"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <div
      class="qa-work-tab__scroll-container relative flex h-full w-full items-center overflow-hidden"
    >
      <div
        ref="tabContentRef"
        class="qa-work-tab__content flex h-full items-center gap-1.5 transition-all duration-300"
        :style="contentStyle"
        @mousedown="handleScrollStart"
        @mouseup="handleScrollEnd"
        @mousemove="handleScrolling"
        @wheel="handleWheel"
      >
        <div
          v-for="item in openedTabs"
          :key="item.path"
          :ref="setTabItemRef"
          class="qa-work-tab__item relative flex shrink-0 cursor-pointer select-none items-center gap-1.5 text-sm"
          :class="{
            'qa-work-tab__item--active': currentPath === item.path,
            'qa-work-tab__item--fixed': item.fixedTab,
            'qa-work-tab__item--hover': isHover,
          }"
          :style="tabItemStyle"
          @click="handleTabClick(item)"
          @contextmenu.prevent="handleTabContextmenu($event, item)"
          @auxclick="handleTabMiddleClick($event, item)"
        >
          <QaSvgIcon
            v-if="item.icon && item.icon !== 'none'"
            class="qa-work-tab__icon shrink-0"
            :icon="item.icon"
          />
          <span class="qa-work-tab__title flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {{ formatMenuTitle(item.title) }}
          </span>
          <QaSvgIcon
            v-if="item.fixedTab"
            class="qa-work-tab__pin shrink-0 text-sm"
            icon="ri:pushpin-2-line"
            @click.stop="handleToggleFixed(item)"
          />
          <QaSvgIcon
            v-else
            class="qa-work-tab__close shrink-0 text-sm"
            icon="ri:close-line"
            @click.stop="handleTabClose(item)"
          />
        </div>
      </div>
    </div>

    <div
      v-if="isOverflow"
      class="qa-work-tab__scroll-btns absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1"
    >
      <div
        class="qa-work-tab__scroll-btn qa-card-xs flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors hover:bg-(--el-color-primary-light-9)"
        @click="handleScrollLeft"
      >
        <QaSvgIcon icon="ri:arrow-left-s-line" />
      </div>
      <div
        class="qa-work-tab__scroll-btn qa-card-xs flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors hover:bg-(--el-color-primary-light-9)"
        @click="handleScrollRight"
      >
        <QaSvgIcon icon="ri:arrow-right-s-line" />
      </div>
      <div
        class="qa-work-tab__dropdown qa-card-xs flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors hover:bg-(--el-color-primary-light-9)"
        @click="handleDropdownClick"
      >
        <QaSvgIcon icon="ri:arrow-down-s-line" />
      </div>
    </div>

    <QaMenuRight ref="menuRightRef" :menu-items="contextMenuItems" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useMenuStore, useSettingStore, useWorktabStore } from "@/store";
import { formatMenuTitle } from "@/utils";
import { useCommon } from "@/hooks/core/useCommon";
import { TAB_STYLE_CARD, TAB_STYLE_DEFAULT, TAB_STYLE_GOOGLE } from "@/constants/app";

defineOptions({ name: "QaWorkTab" });

const props = defineProps({
  isFixed: { type: Boolean, default: false },
  isTouch: { type: Boolean, default: false },
  isHover: { type: Boolean, default: false },
});

const route = useRoute();
const router = useRouter();
const worktabStore = useWorktabStore();
const settingStore = useSettingStore();
const menuStore = useMenuStore();
const { homePath } = useCommon();

const showWorkTab = computed(() => settingStore.showWorkTab);
const tabStyle = computed(() => settingStore.tabStyle);
const isDark = computed(() => settingStore.theme === "dark");

const tabStyleClass = computed(() => {
  if (tabStyle.value === TAB_STYLE_CARD) return "qa-work-tab--card";
  if (tabStyle.value === TAB_STYLE_GOOGLE) return "qa-work-tab--google";
  return "qa-work-tab--default";
});

const openedTabs = computed(() => worktabStore.opened);
const currentPath = computed(() => route.path);

const qaWorkTabRef = ref(null);
const tabContentRef = ref(null);
const menuRightRef = ref(null);

const tabItemRefs = ref([]);
const setTabItemRef = (el) => {
  if (el) tabItemRefs.value.push(el);
};

const contentStyle = computed(() => ({
  transform: `translateX(${scrollLeft.value}px)`,
}));

const tabItemStyle = computed(() => ({
  height: tabStyle.value === TAB_STYLE_DEFAULT ? "32px" : "30px",
  padding: tabStyle.value === TAB_STYLE_DEFAULT ? "0 12px" : "0 10px",
}));

const scrollLeft = ref(0);
const isOverflow = ref(false);
const isScrolling = ref(false);
const startX = ref(0);
const startY = ref(0);
const startScrollLeft = ref(0);
const touchStartX = ref(0);
const touchStartY = ref(0);

let resizeObserver = null;
let pollTimer = null;

const contextMenuItems = computed(() => {
  const items = [
    { key: "refresh", label: "刷新", icon: "ri:refresh-line" },
    { key: "close", label: "关闭", icon: "ri:close-line" },
    { key: "closeOthers", label: "关闭其他", icon: "ri:close-circle-line" },
    { key: "closeAll", label: "关闭全部", icon: "ri:close-circle-fill" },
  ];
  return items;
});

const checkOverflow = () => {
  if (!qaWorkTabRef.value || !tabContentRef.value) return;
  const containerWidth = qaWorkTabRef.value.offsetWidth;
  const contentWidth = tabContentRef.value.scrollWidth;
  isOverflow.value = contentWidth > containerWidth;
};

const scrollToActiveTab = () => {
  if (!qaWorkTabRef.value || !tabContentRef.value) return;
  const activeIndex = openedTabs.value.findIndex((tab) => tab.path === currentPath.value);
  if (activeIndex === -1) return;
  const activeEl = tabItemRefs.value[activeIndex];
  if (!activeEl) return;

  const containerRect = qaWorkTabRef.value.getBoundingClientRect();
  const activeRect = activeEl.getBoundingClientRect();
  const containerWidth = qaWorkTabRef.value.offsetWidth;
  const contentWidth = tabContentRef.value.scrollWidth;

  if (contentWidth <= containerWidth) {
    scrollLeft.value = 0;
    return;
  }

  const activeLeft = activeEl.offsetLeft;
  const activeRight = activeLeft + activeEl.offsetWidth;
  const currentVisibleLeft = -scrollLeft.value;
  const currentVisibleRight = currentVisibleLeft + containerWidth;

  if (activeLeft < currentVisibleLeft) {
    scrollLeft.value = -activeLeft;
  } else if (activeRight > currentVisibleRight) {
    scrollLeft.value = -(activeRight - containerWidth);
  }
};

const handleTabClick = (item) => {
  if (item.path === currentPath.value) return;
  router.push(item.path);
};

const handleTabClose = (item) => {
  if (item.fixedTab) return;
  worktabStore.removeTab(item.path);
  if (item.path === currentPath.value) {
    const opened = worktabStore.opened;
    if (opened.length > 0) {
      const lastIndex = opened.length - 1;
      router.push(opened[lastIndex].path);
    } else {
      router.push(homePath.value);
    }
  }
};

const handleTabMiddleClick = (e, item) => {
  if (e.button !== 1) return;
  e.preventDefault();
  handleTabClose(item);
};

const handleTabContextmenu = (e, item) => {
  menuRightRef.value?.show(e);
};

const handleToggleFixed = (item) => {
  worktabStore.toggleFixedTab(item.path);
};

const handleMenuSelect = (item) => {
  switch (item.key) {
    case "refresh":
      useCommon().refresh();
      break;
    case "close":
      handleTabClose(route);
      break;
    case "closeOthers":
      worktabStore.removeOthers(route.path);
      break;
    case "closeAll":
      worktabStore.removeAll();
      router.push(homePath.value);
      break;
  }
};

const handleScrollStart = (e) => {
  if (e.button !== 0) return;
  isScrolling.value = true;
  startX.value = e.clientX;
  startY.value = e.clientY;
  startScrollLeft.value = scrollLeft.value;
};

const handleScrollEnd = () => {
  isScrolling.value = false;
};

const handleScrolling = (e) => {
  if (!isScrolling.value) return;
  const deltaX = e.clientX - startX.value;
  const deltaY = e.clientY - startY.value;
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    e.preventDefault();
    scrollLeft.value = startScrollLeft.value + deltaX;
    clampScrollLeft();
  }
};

const handleWheel = (e) => {
  if (!isOverflow.value) return;
  e.preventDefault();
  scrollLeft.value -= e.deltaY;
  clampScrollLeft();
};

const clampScrollLeft = () => {
  if (!tabContentRef.value || !qaWorkTabRef.value) return;
  const containerWidth = qaWorkTabRef.value.offsetWidth;
  const contentWidth = tabContentRef.value.scrollWidth;
  const maxScrollLeft = 0;
  const minScrollLeft = -(contentWidth - containerWidth);
  scrollLeft.value = Math.max(minScrollLeft, Math.min(maxScrollLeft, scrollLeft.value));
};

const handleScrollLeft = () => {
  if (!qaWorkTabRef.value) return;
  const containerWidth = qaWorkTabRef.value.offsetWidth;
  scrollLeft.value += containerWidth / 2;
  clampScrollLeft();
};

const handleScrollRight = () => {
  if (!qaWorkTabRef.value) return;
  const containerWidth = qaWorkTabRef.value.offsetWidth;
  scrollLeft.value -= containerWidth / 2;
  clampScrollLeft();
};

const handleDropdownClick = () => {
  ElMessage.info("标签下拉菜单（待实现）");
};

const handleTouchStart = (e) => {
  if (e.touches.length !== 1) return;
  touchStartX.value = e.touches[0].clientX;
  touchStartY.value = e.touches[0].clientY;
  startScrollLeft.value = scrollLeft.value;
};

const handleTouchEnd = (e) => {
  if (e.changedTouches.length !== 1) return;
  const deltaX = e.changedTouches[0].clientX - touchStartX.value;
  const deltaY = e.changedTouches[0].clientY - touchStartY.value;
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
    scrollLeft.value = startScrollLeft.value + deltaX;
    clampScrollLeft();
  }
};

watch(
  () => route.path,
  () => {
    nextTick(() => {
      scrollToActiveTab();
    });
  },
);

watch(
  () => openedTabs.value.length,
  () => {
    nextTick(() => {
      checkOverflow();
      scrollToActiveTab();
    });
  },
);

onMounted(() => {
  nextTick(() => {
    checkOverflow();
    scrollToActiveTab();
  });

  resizeObserver = new ResizeObserver(() => {
    checkOverflow();
  });
  if (qaWorkTabRef.value) {
    resizeObserver.observe(qaWorkTabRef.value);
  }

  pollTimer = setInterval(() => {
    checkOverflow();
  }, 1000);
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
});
</script>

<style scoped>
.qa-work-tab {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  padding: 0 8px;
  background-color: var(--default-box-color);
  border-bottom: 1px solid var(--qa-card-border);
}

.qa-work-tab--dark {
  background-color: var(--default-box-color);
  border-bottom-color: var(--qa-card-border);
}

.qa-work-tab__content {
  will-change: transform;
}

.qa-work-tab__item {
  border-radius: 4px;
  transition: all 0.2s ease;
}

.qa-work-tab__item:hover {
  background-color: var(--qa-hover-color);
}

.qa-work-tab__item--active {
  background-color: var(--qa-active-color);
  color: var(--el-color-primary);
}

.qa-work-tab__item--fixed {
  font-weight: 500;
}

.qa-work-tab__close:hover {
  color: var(--el-color-danger);
}

.qa-work-tab__pin {
  color: var(--qa-tab-pin);
}

.qa-work-tab__pin:hover {
  color: var(--qa-tab-pin-hover);
}

.qa-work-tab--card .qa-work-tab__item {
  border: 1px solid var(--qa-card-border);
  border-radius: 6px 6px 0 0;
}

.qa-work-tab--card .qa-work-tab__item--active {
  border-bottom-color: transparent;
  background-color: var(--default-box-color);
}

.qa-work-tab--google .qa-work-tab__item {
  border-radius: 8px 8px 0 0;
  background-color: transparent;
}

.qa-work-tab--google .qa-work-tab__item--active {
  background-color: var(--default-box-color);
  box-shadow: 0 -2px 4px rgb(0 0 0 / 5%);
}
</style>
