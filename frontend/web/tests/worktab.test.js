import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf-8");

test("标签风格常量完整且互不重复", async () => {
  const { TAB_STYLE_DEFAULT, TAB_STYLE_CARD, TAB_STYLE_GOOGLE, AVAILABLE_TAB_STYLES } =
    await import("../src/constants/app.js");
  assert.equal(typeof TAB_STYLE_DEFAULT, "string");
  assert.equal(typeof TAB_STYLE_CARD, "string");
  assert.equal(typeof TAB_STYLE_GOOGLE, "string");
  assert.ok(TAB_STYLE_DEFAULT !== TAB_STYLE_CARD);
  assert.ok(TAB_STYLE_DEFAULT !== TAB_STYLE_GOOGLE);
  assert.ok(TAB_STYLE_CARD !== TAB_STYLE_GOOGLE);
  assert.equal(AVAILABLE_TAB_STYLES.length, 3);
  assert.ok(AVAILABLE_TAB_STYLES.includes(TAB_STYLE_DEFAULT));
  assert.ok(AVAILABLE_TAB_STYLES.includes(TAB_STYLE_CARD));
  assert.ok(AVAILABLE_TAB_STYLES.includes(TAB_STYLE_GOOGLE));
});

test("设置面板已放开多标签与标签风格", async () => {
  const { PENDING_SETTING_KEYS, BASIC_SETTING_KEYS, SETTING_FIELD_MAP } =
    await import("../src/constants/settings.js");
  assert.ok(!PENDING_SETTING_KEYS.includes("showWorkTab"));
  assert.ok(!PENDING_SETTING_KEYS.includes("tabStyle"));
  assert.ok(BASIC_SETTING_KEYS.includes("showWorkTab"));
  assert.ok(BASIC_SETTING_KEYS.includes("tabStyle"));
  assert.ok("showWorkTab" in SETTING_FIELD_MAP);
  assert.ok("tabStyle" in SETTING_FIELD_MAP);
});

test("标签栏模板必须包含滚动容器、标签项与右键菜单", () => {
  const tpl = read("src/layouts/qa-work-tab/index.vue");
  assert.match(tpl, /qa-work-tab__scroll-container/);
  assert.match(tpl, /qa-work-tab__item/);
  assert.match(tpl, /qa-work-tab__item--active/);
  assert.match(tpl, /qa-work-tab__item--fixed/);
  assert.match(tpl, /QaMenuRight/);
  assert.match(tpl, /contextmenu\.prevent/);
  assert.match(tpl, /auxclick/);
  assert.match(tpl, /handleTabMiddleClick/);
  assert.match(tpl, /handleTabContextmenu/);
  assert.match(tpl, /handleToggleFixed/);
  assert.match(tpl, /handleTabClose/);
});

test("标签栏模板不包含星号收藏入口（本轮禁用）", () => {
  const tpl = read("src/layouts/qa-work-tab/index.vue");
  assert.doesNotMatch(tpl, /quickStart/);
  assert.doesNotMatch(tpl, /quick-start/);
  assert.doesNotMatch(tpl, /qa-star/);
  assert.doesNotMatch(tpl, /ri:star/);
});

test("右键菜单组件使用 qa 命名域且无 ts 残留", () => {
  const tpl = read("src/components/navigation/qa-menu-right/index.vue");
  assert.match(tpl, /name: "QaMenuRight"/);
  assert.match(tpl, /QaSvgIcon/);
  assert.match(tpl, /context-menu/);
  assert.doesNotMatch(tpl, /FaMenuRight/);
  assert.doesNotMatch(tpl, /fa-menu-right/);
  assert.doesNotMatch(tpl, /: string/);
  assert.doesNotMatch(tpl, /defineProps<\{/);
});

test("布局根在顶栏与内容区之间装配标签栏", () => {
  const tpl = read("src/layouts/index.vue");
  const headerIdx = tpl.indexOf("<QaHeaderBar");
  const workTabIdx = tpl.indexOf("<QaWorkTab");
  const contentIdx = tpl.indexOf("<QaPageContent");
  assert.ok(headerIdx > -1);
  assert.ok(workTabIdx > -1);
  assert.ok(contentIdx > -1);
  assert.ok(headerIdx < workTabIdx);
  assert.ok(workTabIdx < contentIdx);
});
