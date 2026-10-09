<!-- 布局内容 -->
<template>
  <div id="app-scroll-main" class="layout-content" :style="containerStyle">
    <RouterView v-if="isRefresh" v-slot="{ Component, route: curRoute }" :style="contentStyle">
      <div class="route-view-shell flex min-h-0 min-w-0 w-full flex-1 flex-col">
        <Transition :name="actualTransition" mode="out-in">
          <KeepAlive :include="keepAliveInclude" :exclude="keepAliveExclude">
            <component
              v-if="Component"
              class="qa-page-view min-h-0 min-w-0 w-full flex-1"
              :is="Component"
              :key="routeViewCacheKey(curRoute)"
            />
          </KeepAlive>
        </Transition>
      </div>
    </RouterView>

    <!-- 返回顶部：宽屏滚动容器是 #app-content；窄屏改为文档滚动，target 置空 -->
    <ElBacktop :key="backtopTargetKey" :target="backtopScrollTarget" :right="28" :bottom="28" class="z-90">
      <QaSvgIcon icon="ri:arrow-up-circle-line" class="text-2xl text-theme" />
    </ElBacktop>
  </div>
</template>
<script setup>
/**
 * 布局滚动容器 + 业务路由出口；与 setting.refresh 联动可整体重建 RouterView。
 *
 * 缓存为单层：目录路由不挂组件，RouterView 深度跳级后本出口直接渲染叶子页面，
 * 因此这里的 KeepAlive 就是全局唯一的页面级缓存。
 * 缓存开关数据源：后端菜单 `keep_alive` → MenuProcessor 写入 `meta.keepAlive`。
 */
import { useSettingStore, useWorktabStore } from "@/store";

defineOptions({ name: "QaPageContent" });

function routeViewCacheKey(r) {
  return r.path;
}

const route = useRoute();
const router = useRouter();

/**
 * 解析 path 在本出口（depth=1）实际渲染的组件名。
 * 目录路由不挂组件，RouterView 深度跳级会跳过它们，命中 matched 中第一个带 components 的后代。
 * KeepAlive 的 include / exclude 按「组件 name」匹配，所以必须回解组件，不能用路由 name。
 */
function resolveOutletComponentName(path) {
  try {
    const matched = router.resolve({ path }).matched;
    for (let i = 1; i < matched.length; i++) {
      const comp = matched[i]?.components?.default;
      if (comp) return comp.name ?? comp.__name ?? "";
    }
    return "";
  } catch {
    return "";
  }
}

/**
 * 开发期守卫：目录路由一旦挂了组件，本出口的深度跳级就会失效（仅开发环境兜底自检）。
 */
watch(
  () => route.path,
  (path) => {
    if (!import.meta.env.DEV) return;
    const matched = router.resolve({ path }).matched;
    const shell = matched[1];
    if (matched.length > 2 && shell?.components?.default) {
      console.warn(
        `[路由缓存] "${path}" 的中间层路由 "${shell.path ?? ""}" 挂了组件，RouterView 深度跳级失效：` +
          "本出口渲染的是它而不是叶子页面，页面会被重复挂载。目录路由的 component 必须为 undefined。"
      );
    }
  },
  { immediate: true }
);

const isNarrowViewport = useMediaQuery("(max-width: 800px)");
const backtopScrollTarget = computed(() => (isNarrowViewport.value ? "" : "#app-content"));
const backtopTargetKey = computed(() => (isNarrowViewport.value ? "win" : "main"));

const { pageTransition, containerWidth, refresh, showWorkTab } = storeToRefs(useSettingStore());
const { opened, keepAliveExclude: worktabKeepAliveExclude } = storeToRefs(useWorktabStore());

/**
 * 多标签开启时：只把工作栏已打开标签对应的页面组件名放进 include（组件 name，非路由 name）。
 * 关闭多标签时不传 include，避免白名单过窄误伤缓存。
 */
const keepAliveInclude = computed(() => {
  if (!showWorkTab.value) return undefined;
  const names = new Set();
  for (const t of opened.value) {
    if (t.keepAlive === false) continue;
    const name = resolveOutletComponentName(t.path);
    if (name) names.add(name);
  }
  if (route.meta.keepAlive !== false) {
    const current = resolveOutletComponentName(route.path);
    if (current) names.add(current);
  }
  return names.size ? Array.from(names) : undefined;
});

/**
 * 关闭标签时 store 会把组件名压入 exclude；关闭多标签时 include 为空，
 * `meta.keepAlive === false` 的页面需在此兜底排除，避免被缓存。
 */
const keepAliveExclude = computed(() => {
  const names = new Set(worktabKeepAliveExclude.value ?? []);
  if (route.meta.keepAlive === false) {
    const name = resolveOutletComponentName(route.path);
    if (name) names.add(name);
  }
  return names.size ? Array.from(names) : undefined;
});

const isRefresh = shallowRef(true);

/** 浏览器首次进入：关闭路由过渡动画，避免首屏闪动 */
const isFirstLoad = ref(true);

const actualTransition = computed(() => {
  if (isFirstLoad.value) return "";
  return pageTransition.value;
});

const containerStyle = computed(() => ({
  width: "100%",
  minWidth: 0,
  maxWidth: containerWidth.value,
  flex: "1",
  minHeight: "0",
  display: "flex",
  flexDirection: "column",
}));

/** 纵向滚动由外层 `#app-content` 承担，`.layout-content` 仅做限宽居中，路由视图填满剩余高度 */
const contentStyle = computed(() => ({ flex: "1", minHeight: "0", minWidth: 0, width: "100%" }));

const reload = () => {
  isRefresh.value = false;
  nextTick(() => {
    isRefresh.value = true;
  });
};

watch(refresh, reload, { flush: "post" });

onMounted(() => {
  nextTick(() => {
    isFirstLoad.value = false;
  });
});
</script>
