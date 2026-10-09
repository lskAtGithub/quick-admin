import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(resolve(__dirname, "..", p), "utf-8");

test("user.store 已补齐锁屏字段与方法", () => {
  const src = read("src/store/modules/user.store.js");
  for (const token of [
    "const isLock = ref(false)",
    "const lockPassword = ref(\"\")",
    "function setLockStatus",
    "function setLockPassword",
    "isLock.value = false",
    "lockPassword.value = \"\"",
    "isLock,",
    "lockPassword,",
    "setLockStatus,",
    "setLockPassword,",
  ]) assert.ok(src.includes(token), `缺失：${token}`);
});

test("锁屏组件模板与脚本关键结构完整", () => {
  const tpl = read("src/layouts/qa-screen-lock/index.vue");
  assert.match(tpl, /name: "QaScreenLock"/);
  assert.match(tpl, /QaDialog/);
  assert.match(tpl, /layout-lock-screen/);
  assert.match(tpl, /lockpage/);
  assert.match(tpl, /import CryptoJS from "crypto-js"/);
  assert.match(tpl, /import bgDark from "@\/assets\/images\/lock\/bg_dark\.webp"/);
  assert.match(tpl, /import bgLight from "@\/assets\/images\/lock\/bg_light\.webp"/);
  assert.match(tpl, /mittBus\.on\("openLockScreen"/);
  assert.match(tpl, /userStore\.setLockStatus/);
  assert.match(tpl, /userStore\.setLockPassword/);
  assert.match(tpl, /verifyPassword/);
  assert.match(tpl, /disableDevTools/);
  assert.doesNotMatch(tpl, /FaDialog/);
  assert.doesNotMatch(tpl, /FaScreenLock/);
  assert.doesNotMatch(tpl, /lang="ts"/);
});

test("锁屏已注册到全局组件配置", () => {
  const src = read("src/config/modules/component.js");
  assert.match(src, /key: "screenLock"/);
  assert.match(src, /qa-screen-lock\/index\.vue/);
});

test("用户菜单已接入 GitHub / Gitee / 锁屏入口", () => {
  const tpl = read("src/layouts/qa-header-bar/widgets/QaUserMenu.vue");
  assert.match(tpl, /toGithub/);
  assert.match(tpl, /toGitee/);
  assert.match(tpl, /lockScreen/);
  assert.match(tpl, /mittBus\.emit\("openLockScreen"\)/);
  assert.match(tpl, /WEB_LINKS\.GITHUB/);
  assert.match(tpl, /WEB_LINKS\.GITEE/);
  assert.match(tpl, /topBar\.user\.github/);
  assert.match(tpl, /topBar\.user\.gitee/);
  assert.match(tpl, /topBar\.user\.lockScreen/);
  assert.match(tpl, /@\/assets\/images\/user\/avatar\.webp/);
  assert.doesNotMatch(tpl, /@imgs\//);
});

test("WEB_LINKS 常量已通过 utils 聚合导出", () => {
  const src = read("src/utils/index.js");
  assert.match(src, /export \{ WEB_LINKS \} from "\.\.\/constants\/webLinks\.js"/);
  const wl = read("src/constants/webLinks.js");
  assert.match(wl, /GITHUB:/);
  assert.match(wl, /GITEE:/);
});

test("useNow hook 返回完整时间字段", () => {
  const src = read("src/hooks/core/useNow.js");
  assert.match(src, /export function useNow/);
  for (const field of ["hour", "minute", "second", "year", "month", "day", "week", "meridiem"]) {
    assert.ok(src.includes(`const ${field} = ref`), `缺失字段：${field}`);
  }
});

test("dataURLToFile 工具可解析 base64 并产出 File", async () => {
  const { dataURLToFile } = await import("../src/utils/file.js");
  const dataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const file = dataURLToFile(dataURL, "test.png");
  assert.ok(file instanceof File);
  assert.equal(file.name, "test.png");
  assert.equal(file.type, "image/png");
  assert.equal(file.size > 0, true);
});

test("dict.store 已提供最小 stub 并导出", async () => {
  const { useDictStore } = await import("../src/store/modules/dict.store.js");
  assert.equal(typeof useDictStore, "function");
  const src = read("src/store/modules/dict.store.js");
  for (const token of [
    "const dictData = ref({})",
    "getDictData",
    "getDictArray",
    "getDictLabel",
    "loadDict",
    "clearDict",
  ]) assert.ok(src.includes(token), `缺失：${token}`);
});

test("个人中心视图已迁入且无 ts 残留", () => {
  const tpl = read("src/views/fastlink/current/profile.vue");
  assert.match(tpl, /name: "QaFastlinkProfile"/);
  assert.match(tpl, /qa-card-sm/);
  assert.match(tpl, /QaSvgIcon/);
  assert.match(tpl, /import UserAPI from "@\/api\/module_system\/user"/);
  assert.match(tpl, /import OnlineAPI from "@\/api\/module_monitor\/online"/);
  assert.match(tpl, /useDictStore/);
  assert.match(tpl, /@\/assets\/images\/user\/bg\.webp/);
  assert.match(tpl, /@\/assets\/images\/user\/avatar\.webp/);
  assert.doesNotMatch(tpl, /lang="ts"/);
  assert.doesNotMatch(tpl, /FaDialog/);
  assert.doesNotMatch(tpl, /FaCutterImg/);
  assert.doesNotMatch(tpl, /FaSvgIcon/);
  assert.doesNotMatch(tpl, /fa-card-sm/);
});

test("个人中心已挂载为隐藏路由", () => {
  const src = read("src/router/routes.js");
  assert.match(src, /path: "profile"/);
  assert.match(src, /name: "FastlinkProfile"/);
  assert.match(src, /import\("@views\/fastlink\/current\/profile\.vue"\)/);
  assert.match(src, /isHide: true/);
  assert.match(src, /keepAlive: true/);
});

test("i18n 中英文锁屏与用户菜单文案齐全", () => {
  const src = read("src/locales.js");
  for (const key of [
    "lock: {", "lockScreen: {", "navbar: {",
    "lockScreen: \"锁屏\"", "lockScreen: \"Lock screen\"",
    "github: \"GitHub\"", "gitee: \"Gitee\"",
    "lockScreen: \"锁屏\"", "lockScreen: \"Lock screen\"",
    "back: \"返回\"", "back: \"Back\"",
  ]) assert.ok(src.includes(key), `缺失 i18n 文案：${key}`);
});
