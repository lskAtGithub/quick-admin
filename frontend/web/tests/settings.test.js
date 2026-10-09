import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse, compileTemplate } from "vue/compiler-sfc";
import * as Vue from "vue";

const settings = await import("../src/utils/settings.js").catch((error) => {
  if (error.code === "ERR_MODULE_NOT_FOUND") return {};
  throw error;
});

const defaults = {
  name: "QuickAdmin",
  menuType: "left",
  menuOpenWidth: 230,
  menuOpen: true,
  dualMenuShowText: false,
  theme: "auto",
  themeColor: "#4080FF",
  systemThemeColor: "#4080FF",
  menuThemeType: "design",
  showSettings: true,
  showMenuButton: true,
  showFastEnter: true,
  showRefreshButton: true,
  showCrumbs: true,
  showWorkTab: true,
  showLanguage: true,
  showMenuSearch: true,
  showFullscreen: true,
  showSizeSelect: true,
  showNotification: true,
  showAppLogo: true,
  showGuide: true,
  showNprogress: true,
  uniqueOpened: true,
  colorWeak: false,
  grayMode: false,
  boxBorderMode: true,
  containerWidth: "100%",
  customRadius: "0.75",
  pageTransition: "slide-left",
  tabStyle: "tab-google",
  watermarkVisible: false,
  aiEnabled: false,
  refresh: false,
};

const pendingKeys = [
  "showWorkTab", "tabStyle", "showFastEnter", "showMenuSearch", "showSizeSelect",
  "showNotification", "watermarkVisible", "showGuide", "userEnableAi",
];

test("未迁入的设置均不可写入", () => {
  for (const key of pendingKeys) assert.equal(settings.isSettingAvailable?.(key), false, key);
});

test("首轮已接入的基础设置均可用，未知字段不可用", () => {
  for (const key of [
    "showMenuButton", "showRefreshButton", "showCrumbs", "showLanguage", "showFullscreen",
    "showAppLogo", "showNprogress", "uniqueOpened", "menuOpenWidth", "colorWeak",
    "grayMode", "pageTransition", "customRadius",
  ]) assert.equal(settings.isSettingAvailable?.(key), true, key);
  assert.equal(settings.isSettingAvailable?.("unknown"), false);
});

test("首轮仅允许垂直菜单布局", () => {
  assert.equal(settings.isMenuTypeAvailable?.("left"), true);
  for (const mode of ["top", "top-left", "dual-menu", "invalid", undefined]) {
    assert.equal(settings.isMenuTypeAvailable?.(mode), false, mode);
  }
});

test("重置覆盖全部面板字段并映射 AI 默认值", () => {
  const patch = settings.createSettingsResetPatch?.(defaults);
  assert.ok(patch);
  for (const [key, value] of Object.entries(defaults)) {
    if (["name", "refresh"].includes(key)) continue;
    assert.deepEqual(patch[key === "aiEnabled" ? "userEnableAi" : key], value, key);
  }
  assert.equal("aiEnabled" in patch, false);
  assert.equal("refresh" in patch, false);
  assert.equal("settingsVisible" in patch, false);
});

test("重置不夹带账号、令牌及标签信息", () => {
  const patch = settings.createSettingsResetPatch?.({
    ...defaults, accessToken: "test-token", info: { name: "测试" }, opened: ["/home"],
  });
  assert.ok(patch);
  for (const key of ["accessToken", "info", "opened"]) assert.equal(key in patch, false);
});

test("配置快照以真实主题状态为准并映射 AI 字段", () => {
  const snapshot = settings.getSettingsSnapshot?.({
    theme: "auto", systemThemeMode: "dark", themeColor: "#abcdef", systemThemeColor: "#000000",
    userEnableAi: true, showLanguage: false,
  }, defaults);
  assert.ok(snapshot);
  assert.equal(snapshot.theme, "auto");
  assert.equal(snapshot.themeColor, "#abcdef");
  assert.equal(snapshot.systemThemeColor, "#abcdef");
  assert.equal(snapshot.aiEnabled, true);
  assert.equal(snapshot.showLanguage, false);
  assert.equal(snapshot.menuOpenWidth, 230);
});

test("快照保留静态默认配置，但排除运行状态和派生主题模式", () => {
  const snapshot = settings.getSettingsSnapshot?.({
    settingsVisible: true, refresh: true, holidayFireworksLoaded: true,
    festivalDate: "2026-01-01", resetSettings() {}, accessToken: "test-token",
  }, { ...defaults, systemThemeMode: "dark", systemThemeType: "dark", refresh: true });
  assert.ok(snapshot);
  assert.equal(snapshot.name, "QuickAdmin");
  for (const key of [
    "settingsVisible", "refresh", "holidayFireworksLoaded", "festivalDate", "resetSettings",
    "accessToken", "systemThemeMode", "systemThemeType", "userEnableAi",
  ]) assert.equal(key in snapshot, false, key);
});

test("生成的配置可以直接作为 JavaScript 模块解析，正确转义字符串", async () => {
  const value = "名称'\"\\\n测试";
  const code = settings.serializeSettingsConfig?.({ theme: "auto" }, { ...defaults, name: value });
  assert.equal(typeof code, "string");
  const module = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
  assert.equal(module.SETTING_DEFAULT_CONFIG.name, value);
  assert.equal(module.SETTING_DEFAULT_CONFIG.theme, "auto");
  assert.equal("refresh" in module.SETTING_DEFAULT_CONFIG, false);
});

test("快照和重置不会修改传入对象", () => {
  const frozenDefaults = Object.freeze({ ...defaults });
  const state = Object.freeze({ theme: "dark", showLanguage: false });
  assert.ok(settings.getSettingsSnapshot?.(state, frozenDefaults));
  assert.ok(settings.createSettingsResetPatch?.(frozenDefaults));
  assert.equal(frozenDefaults.theme, "auto");
  assert.equal(state.theme, "dark");
});

test("灰色与色弱滤镜相互独立且可以组合", () => {
  assert.equal(settings.getSettingsFilter?.(false, false), "");
  assert.equal(settings.getSettingsFilter?.(true, false), "grayscale(100%)");
  assert.equal(settings.getSettingsFilter?.(false, true), "invert(80%)");
  assert.equal(settings.getSettingsFilter?.(true, true), "grayscale(100%) invert(80%)");
});

test("页面过渡直接作用于常驻缓存中的页面，不能包裹不变的 div", async () => {
  const source = await readFile(new URL("../src/layouts/qa-page-content/index.vue", import.meta.url), "utf8");
  const { descriptor } = parse(source);
  const findElement = (node, tag) => {
    if (node.tag === tag) return node;
    for (const child of node.children ?? []) {
      const result = findElement(child, tag);
      if (result) return result;
    }
  };
  const transition = findElement(descriptor.template.ast, "Transition");
  assert.ok(transition);
  const keepAlive = transition.children.find((node) => node.type === 1);
  assert.equal(keepAlive.tag, "KeepAlive");
  assert.equal(keepAlive.props.some((prop) => prop.name === "if" || prop.arg?.content === "key"), false);
  assert.equal(keepAlive.children.find((node) => node.type === 1).tag, "component");
});

test("实际页面模板切换触发过渡钩子并保留缓存实例和本地状态", async () => {
  const source = await readFile(new URL("../src/layouts/qa-page-content/index.vue", import.meta.url), "utf8");
  const { descriptor } = parse(source);
  const { code, errors } = compileTemplate({
    source: descriptor.template.content,
    filename: "QaPageContent.vue",
    id: "settings-transition-test",
    compilerOptions: { mode: "function" },
  });
  assert.deepEqual(errors, []);
  // 使用真实缓存和过渡生命周期；无 DOM 的渲染器不负责验证 CSS 动画。
  const events = [];
  const transition = Vue.defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => Vue.h(Vue.BaseTransition, {
        ...attrs,
        onBeforeEnter: () => events.push("enter"),
        onLeave: (_, done) => { events.push("leave"); queueMicrotask(done); },
      }, slots);
    },
  });
  const render = new Function("Vue", code)({ ...Vue, Transition: transition });
  const node = (type, text = "") => ({ type, text, children: [], parent: null, props: {} });
  const detach = (child) => {
    if (!child.parent) return;
    const siblings = child.parent.children;
    const index = siblings.indexOf(child);
    if (index >= 0) siblings.splice(index, 1);
    child.parent = null;
  };
  const renderer = Vue.createRenderer({
    createElement: (tag) => node(tag),
    createText: (text) => node("text", text),
    createComment: (text) => node("comment", text),
    insert(child, parent, anchor = null) {
      detach(child);
      const index = anchor ? parent.children.indexOf(anchor) : parent.children.length;
      assert.ok(index >= 0, "插入锚点必须仍在父节点中");
      parent.children.splice(index, 0, child);
      child.parent = parent;
    },
    remove: detach,
    setText: (target, text) => { target.text = text; },
    setComment: (target, text) => { target.text = text; },
    setElementText(target, text) {
      for (const child of target.children) child.parent = null;
      target.children = [];
      target.text = text;
    },
    parentNode: (target) => target.parent,
    nextSibling: (target) => target.parent?.children[target.parent.children.indexOf(target) + 1] ?? null,
    patchProp: (target, key, previous, value) => { target.props[key] = value; },
  });
  const mounted = { A: 0, B: 0 };
  const unmounted = { A: 0, B: 0 };
  const states = {};
  const pages = Object.fromEntries(["A", "B"].map((name) => [name, Vue.defineComponent({
    name: `SettingsFixture${name}`,
    setup() {
      const count = Vue.ref(0);
      states[name] = count;
      Vue.onMounted(() => { mounted[name]++; });
      Vue.onUnmounted(() => { unmounted[name]++; });
      return () => Vue.h("div", { "data-page": name }, `${name}:${count.value}`);
    },
  })]));
  const current = Vue.ref("A");
  const outlet = Vue.defineComponent({
    inheritAttrs: false,
    setup(_, { slots }) {
      return () => slots.default({ Component: Vue.h(pages[current.value]), route: { path: `/${current.value}` } });
    },
  });
  const app = renderer.createApp({
    components: { RouterView: outlet, ElBacktop: () => null, QaSvgIcon: () => null },
    setup: () => ({
      isRefresh: true, containerStyle: {}, contentStyle: {}, actualTransition: "slide-left",
      keepAliveInclude: ["SettingsFixtureA", "SettingsFixtureB"], keepAliveExclude: [],
      routeViewCacheKey: (route) => route.path, backtopTargetKey: "main", backtopScrollTarget: "",
    }),
    render,
  });
  const root = node("root");
  const flush = async () => { await Vue.nextTick(); await Vue.nextTick(); };
  try {
    app.mount(root);
    await flush();
    const originalState = states.A;
    states.A.value = 7;
    for (const name of ["B", "A", "B", "A"]) {
      current.value = name;
      await flush();
    }
    assert.deepEqual(mounted, { A: 1, B: 1 });
    assert.deepEqual(unmounted, { A: 0, B: 0 });
    assert.equal(states.A, originalState);
    assert.equal(states.A.value, 7);
    assert.equal(events.filter((event) => event === "leave").length, 4);
    assert.equal(events.filter((event) => event === "enter").length, 4);
  } finally {
    app.unmount();
  }
  assert.deepEqual(unmounted, { A: 1, B: 1 });
});

test("默认静态菜单仅包含首页，字段补齐且与静态路由对齐", async () => {
  const { STATIC_MENU_LIST } = await import("../src/constants/menu.js");
  const { HOME_MENU_META, HOME_PAGE_PATH } = await import("../src/constants/router.js");
  assert.equal(Array.isArray(STATIC_MENU_LIST), true);
  assert.equal(STATIC_MENU_LIST.length, 1);
  const home = STATIC_MENU_LIST[0];
  assert.equal(home.path, HOME_PAGE_PATH);
  assert.equal(home.name, "Home");
  assert.equal(home.meta.title, HOME_MENU_META.title);
  assert.equal(home.meta.icon, HOME_MENU_META.icon);
  assert.equal(home.meta.keepAlive, true);
  assert.equal(home.meta.fixedTab, true);
  assert.equal(home.meta.isHide, false);
  assert.equal(home.meta.shellRoute, true);
  for (const key of [
    "alwaysShow", "link", "isIframe", "isHideTab", "activePath",
    "showBadge", "showTextBadge", "sort", "type",
  ]) assert.ok(key in home.meta, `缺失侧边栏所需的 meta.${key}`);
  assert.deepEqual(home.children, []);
});
