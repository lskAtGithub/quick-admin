<!-- 右键菜单 -->
<template>
  <div class="menu-right">
    <Transition name="context-menu" @before-enter="onBeforeEnter" @after-leave="onAfterLeave">
      <div
        v-show="visible"
        :style="menuStyle"
        class="context-menu qa-card-xs shadow-xl! min-w-(--menu-width) w-(--menu-width)"
      >
        <ul class="menu-list m-0 list-none" :style="menuListStyle">
          <template v-for="item in menuItems">
            <!-- 普通菜单项 -->
            <li
              v-if="!item.children"
              :key="`${item.key}-normal`"
              class="menu-item relative flex items-center cursor-pointer select-none rounded text-xs transition-colors duration-150 hover:bg-(--el-color-primary-light-9)"
              :class="{ 'is-disabled': item.disabled, 'has-line': item.showLine }"
              :style="menuItemStyle"
              @click="handleMenuClick(item)"
            >
              <QaSvgIcon
                v-if="item.icon"
                class="mr-2 shrink-0 text-base text-g-800"
                :icon="item.icon"
              />
              <span
                class="menu-label flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-g-800"
              >
                {{ item.label }}
              </span>
            </li>

            <!-- 子菜单 -->
            <li
              v-else
              :key="`${item.key}-submenu`"
              class="menu-item submenu relative flex items-center cursor-pointer select-none rounded text-xs transition-colors duration-150 hover:bg-(--el-color-primary-light-9)"
              :style="menuItemStyle"
            >
              <div class="submenu-title flex items-center w-full">
                <QaSvgIcon
                  v-if="item.icon"
                  class="mr-2 shrink-0 text-base text-g-800"
                  :icon="item.icon"
                />
                <span
                  class="menu-label flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-g-800"
                >
                  {{ item.label }}
                </span>
                <QaSvgIcon
                  icon="ri:arrow-right-s-line"
                  class="ubmenu-arrow ml-auto mr-0 text-base text-g-500 transition-transform duration-150"
                />
              </div>
              <ul
                class="submenu-list qa-card-xs absolute left-full top-0 z-2001 hidden w-max min-w-max list-none shadow-xl!"
                :style="submenuListStyle"
              >
                <li
                  v-for="child in item.children"
                  :key="child.key"
                  class="menu-item relative mx-1.5 flex items-center cursor-pointer select-none rounded text-xs transition-colors duration-150 hover:bg-(--el-color-primary-light-9)"
                  :class="{ 'is-disabled': child.disabled, 'has-line': child.showLine }"
                  :style="menuItemStyle"
                  @click="handleMenuClick(child)"
                >
                  <QaSvgIcon
                    v-if="child.icon"
                    class="r-2 shrink-0 text-base text-g-800 mr-1"
                    :icon="child.icon"
                  />
                  <span
                    class="menu-label flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-g-800"
                  >
                    {{ child.label }}
                  </span>
                </li>
              </ul>
            </li>
          </template>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";

defineOptions({ name: "QaMenuRight" });

const props = defineProps({
  menuItems: { type: Array, default: () => [] },
  menuWidth: { type: Number, default: 120 },
  submenuWidth: { type: Number, default: 150 },
  itemHeight: { type: Number, default: 32 },
  boundaryDistance: { type: Number, default: 10 },
  menuPadding: { type: Number, default: 5 },
  itemPaddingX: { type: Number, default: 6 },
  borderRadius: { type: Number, default: 6 },
  animationDuration: { type: Number, default: 100 },
});

const emit = defineEmits(["select", "show", "hide"]);

const visible = ref(false);
const position = ref({ x: 0, y: 0 });

let showTimer = null;
let eventListenersAdded = false;

const menuStyle = computed(() => ({
  position: "fixed",
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  zIndex: 2000,
  width: `${props.menuWidth}px`,
}));

const menuListStyle = computed(() => ({
  padding: `${props.menuPadding}px`,
}));

const menuItemStyle = computed(() => ({
  height: `${props.itemHeight}px`,
  padding: `0 ${props.itemPaddingX}px`,
  borderRadius: "4px",
}));

const submenuListStyle = computed(() => ({
  minWidth: `${props.submenuWidth}px`,
  padding: `${props.menuPadding}px 0`,
  borderRadius: `${props.borderRadius}px`,
}));

const calculateMenuHeight = () => {
  let totalHeight = props.menuPadding * 2;
  props.menuItems.forEach((item) => {
    totalHeight += props.itemHeight;
    if (item.showLine) totalHeight += 10;
  });
  return totalHeight;
};

const calculatePosition = (e) => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const menuHeight = calculateMenuHeight();

  let x = e.clientX;
  let y = e.clientY;

  if (x + props.menuWidth > screenWidth - props.boundaryDistance) {
    x = Math.max(props.boundaryDistance, x - props.menuWidth);
  }
  if (y + menuHeight > screenHeight - props.boundaryDistance) {
    y = Math.max(props.boundaryDistance, screenHeight - menuHeight - props.boundaryDistance);
  }
  x = Math.max(props.boundaryDistance, Math.min(x, screenWidth - props.menuWidth - props.boundaryDistance));
  y = Math.max(props.boundaryDistance, Math.min(y, screenHeight - menuHeight - props.boundaryDistance));

  return { x, y };
};

const addEventListeners = () => {
  if (eventListenersAdded) return;
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("contextmenu", handleDocumentContextmenu);
  document.addEventListener("keydown", handleKeydown);
  eventListenersAdded = true;
};

const removeEventListeners = () => {
  if (!eventListenersAdded) return;
  document.removeEventListener("click", handleDocumentClick);
  document.removeEventListener("contextmenu", handleDocumentContextmenu);
  document.removeEventListener("keydown", handleKeydown);
  eventListenersAdded = false;
};

const handleDocumentClick = (e) => {
  const menuElement = document.querySelector(".context-menu");
  if (menuElement && menuElement.contains(e.target)) return;
  hide();
};

const handleDocumentContextmenu = () => {
  hide();
};

const handleKeydown = (e) => {
  if (e.key === "Escape") hide();
};

const show = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (showTimer) {
    window.clearTimeout(showTimer);
    showTimer = null;
  }
  position.value = calculatePosition(e);
  visible.value = true;
  emit("show");
  showTimer = window.setTimeout(() => {
    if (visible.value) addEventListeners();
    showTimer = null;
  }, 50);
};

const hide = () => {
  if (!visible.value) return;
  visible.value = false;
  emit("hide");
  if (showTimer) {
    window.clearTimeout(showTimer);
    showTimer = null;
  }
  removeEventListeners();
};

const handleMenuClick = (item) => {
  if (item.disabled) return;
  emit("select", item);
  hide();
};

const onBeforeEnter = (el) => {
  el.style.transformOrigin = "top left";
};

const onAfterLeave = () => {
  removeEventListeners();
  if (showTimer) {
    window.clearTimeout(showTimer);
    showTimer = null;
  }
};

onUnmounted(() => {
  removeEventListeners();
  if (showTimer) {
    window.clearTimeout(showTimer);
    showTimer = null;
  }
});

defineExpose({
  show,
  hide,
  visible: computed(() => visible.value),
});
</script>

<style scoped>
.menu-right {
  --menu-width: v-bind('props.menuWidth + "px"');
  --border-radius: v-bind('props.borderRadius + "px"');
}

.menu-item.has-line {
  margin-bottom: 10px;
}

.menu-item.has-line::after {
  position: absolute;
  right: 0;
  bottom: -5px;
  left: 0;
  height: 1px;
  content: "";
  background-color: var(--qa-gray-300);
}

.menu-item.is-disabled {
  color: var(--el-text-color-disabled);
  cursor: not-allowed;
}

.menu-item.is-disabled:hover {
  background-color: transparent !important;
}

.menu-item.is-disabled i:not(.submenu-arrow),
.menu-item.is-disabled :deep(.qa-svg-icon) {
  color: var(--el-text-color-disabled) !important;
}

.menu-item.is-disabled .menu-label {
  color: var(--el-text-color-disabled) !important;
}

.menu-item.submenu:hover .submenu-list {
  display: block;
}

.menu-item.submenu:hover .submenu-title .submenu-arrow {
  transform: rotate(90deg);
}

.context-menu-enter-active,
.context-menu-leave-active {
  transition: all v-bind('props.animationDuration + "ms"') ease-out;
}

.context-menu-enter-from,
.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.context-menu-enter-to,
.context-menu-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
