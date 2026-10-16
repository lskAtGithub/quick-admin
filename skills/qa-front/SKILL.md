---
name: qa-front
description: quick-admin 前端（frontend 子工程，Vue3 + Element Plus + Pinia，JavaScript）开发规范与新增管理模块页面的完整流程，含动工前的多轮需求问询与 PRD 确认门径，覆盖 API 模块、列表页三件套（QaTable + add/edit 抽屉 + 共享表单）、v-permission 按钮权限、路由菜单接入、i18n、字典/枚举归位与样式红线。当后续开发者新增、改造后台管理页面或调整列表页、抽屉表单、按钮权限时使用。
---

# Quick Admin 前端开发规范

面向本项目的开发约定。新增一个业务管理页面 = 需求确认 → API 层 → 视图层 → 权限与路由接入 → 校验，按 Step 顺序完成；全程遵守文末红线。

## Step 0：需求澄清与 PRD 确认（动工前强制门径）

用户提出新需求（如“给我生成一个商城管理页面”）时，**禁止直接开始写代码**，必须按“多轮问询 → PRD 确认 → 执行 → 自验”四步走：

1. **多轮问询**：逐轮与用户对话把下列事项全部问清，未明确的一项不得进入 PRD（优先用结构化提问工具一次问齐）：
   - 路由层级：顶级目录还是挂在某个既有目录之下；路径是什么。
   - 路由名与菜单标题：agent 提案名 vs 用户指定名，不得默默替用户决定。
   - 列表字段：展示哪些列、字段名与展示形态（状态标签？字典文案？）。哪些字段参与搜索。
   - 接口：访问地址（后端已有还是待开发）、每个字段的参数名与取值范围。
   - 操作范围：是否需要增删改查、批量删除、树形/分页形态，逐个确认而非默认全选。
   - 按钮权限码（v-permission）与菜单是否需新建、授权给哪些角色。
2. **输出 PRD**：问询结束后，用下述模板写成文档交用户审阅，等待用户明确确认：

   ```markdown
   # <页面名> 需求确认（PRD）
   ## 需求概述
   [一段话描述页面做什么、给谁用]
   ## 路由与菜单
   层级 / path / name / 菜单标题 / 图标
   ## 列表字段
   | 列名 | 字段 | 展示形态 | 是否可搜索 |
   ## 接口清单
   | 动作 | Method | Path | 关键参数/字段 |
   后端尚未提供的接口需显式标注“待后端开发”，并商定联调前 mock 还是等待。
   ## 操作与权限
   增/删/改/查范围、按钮权限码、抽屉或弹窗形态
   ## 验收标准
   [lint/format/build 通过 + 可核对的功能点]
   ```

3. **确认后执行**：用户看过 PRD 并明确回复确认无异议后，才能按 Step 1-4 开始修改代码；PRD 与后续沟通冲突时，以用户最新指示为准。
4. **完成后自验**：按 Step 5 跑 lint / format:check / dev（或 build），并逐条核对 PRD 的验收标准，发现问题先修复再交付，交付时说明验证结果。

## 工程与环境

- 技术栈：Vue 3.5 + Vite 7 + Element Plus + Pinia + Tailwind CSS 4 / SCSS + vue-i18n，**纯 JavaScript**（不建 `.ts` / `tsconfig` / `env.d.ts`）。
- 包管理用 pnpm；frontend 下每个子工程（现为 `web/`，后续可能有其他端）有独立 package.json，命令在**所操作子工程的目录**内执行。
- **Node ≥ 20**（Vite 7 / ESLint 9 依赖，Node 16 下 eslint 直接崩于 `structuredClone is not defined`）。
- 验证手段：`pnpm lint` + `pnpm format:check` + `pnpm dev`（或 `build`）。IDE 语言服务常不可靠，以这三项实跑为准。
- 排版唯一真源是 `.prettierrc.json`：单引号 / 2 空格 / 行宽 180 / 分号 / 无尾逗号。**新建与改动文件一律按该配置为准（即单引号），提交前跑 `pnpm format`，不以存量文件的双引号风格为参照**。ESLint 只查代码质量，排版冲突规则已关闭；`vue/no-mutating-props` 关闭是有意为之——表单组件接收 reactive formData 作 prop 并双向绑定是约定写法。

## 目录与命名

| 内容 | 位置与形态 |
|---|---|
| 通用组件 | `src/components/<类别>/qa-xxx/index.vue`，组件名 `QaXxx`，`defineOptions({ name: 'QaXxx' })` |
| 布局组件 | `src/layouts/qa-xxx/` |
| 视图 | `src/views/module_<domain>/<name>/index.vue` |
| API 层 | `src/api/module_<domain>/<name>.js`，导出 `const <Name>API = {...}` |
| store | `src/store/modules/<name>.store.js`，Pinia setup store，id 用 `<name>Store` |
| 枚举 | `src/enums/<domain>Enum.js`（驼峰 + Enum 结尾），成员为普通对象常量、驼峰键 |
| 常量 | `src/constants/<场景>.js`，键名全大写下划线 |
| 指令 | `src/directives/business/<name>.js`，在 `directives/index.js` 统一注册 |

别名：`@`(src) `@views` `@api` `@utils` `@stores` `@imgs` `@icons` `@qa_imgs` `@plugins` `@styles`；`@/config` 走 `@`。

## 自动导入体系

- AutoImport 覆盖：vue / vue-router / pinia / @vueuse/core / vue-i18n / axios / `ElMessage`·`ElMessageBox`·`ElNotification`·`ElLoading` + `src/hooks/core` 整目录。
- Components 自动注册三处来源：`src/components`、`src/layouts`、`src/**/components`，模板直接 `<QaXxx />` 不手写 import（显式 import 不算错，与周边文件一致即可）。
- 图标走 unplugin-icons，仅可用已装集合 `ri:`（Remix）与 `ep:`（Element），`autoInstall: false`。
- SCSS 全局只自动注入 `@styles/core/mixin.scss`，其余全局样式一律在 `main.js` 显式引入，不得别处重复引入。
- 启动装配顺序固定（`plugins/index.js`）：`initStore → initTheme → initRouter → initI18n → setupDirectives`。

## Step 1：API 模块

新建 `src/api/module_<domain>/<name>.js`，方法名统一 tree / list / detail / create / update / delete，路径与后端真实端点（`backend/app/modules/<domain>/<module>/controller.py`）逐一对齐，**不可臆造端点**：

```js
import { request } from '@/utils/request';

const API_PATH = '/system/<name>';

export const <Name>API = {
  list(query) {
    return request({ url: `${API_PATH}/list`, method: 'get', params: query });
  },
  detail(id) {
    return request({ url: `${API_PATH}/detail/${id}`, method: 'get' });
  },
  create(body) {
    return request({ url: `${API_PATH}/create`, method: 'post', data: body });
  },
  update(id, body) {
    return request({ url: `${API_PATH}/update/${id}`, method: 'put', data: body });
  },
  delete(ids) {
    return request({ url: `${API_PATH}/delete`, method: 'delete', data: { ids } });
  }
};
```

树形模块用 `tree()`（GET `/tree`）替代 `list()`；树形数据必须走 `/tree` 拿嵌套 children，不要用分页扁平接口。

## Step 2：视图三件套

```
src/views/module_<domain>/<name>/
├── index.vue                  # 列表页
├── components/<Name>Form.vue  # 新增/编辑共享表单
├── add/index.vue              # 新增抽屉
└── edit/index.vue             # 编辑抽屉
```

组件 `name` 约定：列表页 `QaSystem<Name>`，抽屉 `<Name>Add` / `<Name>Edit`，表单 `<Name>Form`（与现有 user / dept / role 页一致）。

### 列表页

骨架固定：搜索栏卡片 + 工具栏 + 表格卡片 + 抽屉。

```vue
<template>
  <div class="flex h-full flex-col">
    <ElCard class="mb-3" shadow="never"><!-- 搜索栏：左侧控件 + 右侧 重置/搜索 按钮 --></ElCard>
    <ElCard class="flex flex-1 flex-col overflow-hidden" shadow="never">
      <div class="mb-3">
        <QaTableHeaderLeft :remove-ids="selectedIds" @add="handleAdd" @delete="handleBatchDelete" />
      </div>
      <QaTable :data-source="tableData" :columns="columns" :paging="paging" @pageChange="onPageChange" @selection-change="onSelectionChange" />
    </ElCard>
    <NameAdd v-model="addVisible" @success="fetchData" />
    <NameEdit v-model="editVisible" @success="fetchData" />
  </div>
</template>
```

- `defineOptions({ name: 'QaSystem<Name>' })` 必须写，与 keepAlive 匹配。
- `QaTable` props：`dataSource`（必填）、`columns`、`paging`（`{ page_no, page_size, total }`，不传则不渲染分页栏）+ `@pageChange`；`row-key`、`tree-props`、`default-expand-all` 等经 attrs 透传内部 ElTable。
- `columns` 项：`{ prop, label, width/minWidth, fixed, showOverflowTooltip, slotName }`，label 用 `$t()` 词条；自定义列用 `<template #<slotName>="{ row }">`；操作列 `{ label: $t('common.operation'), fixed: 'right', slotName: 'action' }`，行内按钮 `<ElButton link type="primary/danger">`，按钮上的操作加 `v-permission`（见 Step 4）。
- 删除/批删：`ElMessageBox.confirm` → API → `fetchData()` 回刷；catch 空分支即用户取消，**不写 ElMessage**。
- 树形列表搜索做客户端树过滤（匹配节点保留祖先路径），逻辑放 `filterTree` 纯函数。

### 共享表单 components/<Name>Form.vue

只做表单渲染与校验，字段与规则以后端 schema（`<module>/schema.py`）为准，暴露 `validate` / `resetFields` 给父级 ref。

### add / edit 抽屉

统一 `QaDrawer`（`v-model` + `form-mode="create|update"` + `:confirm-loading` + `@confirm`）：

- add：打开时重置 `createInitial()`；树形模块可接 props 预填 `parent_id`。
- edit：打开时 `detail(id)` 回填，提交 `update(id, body)`。
- 提交前 `formRef.value?.validate()` 失败即返回；成功关抽屉 `emit('success')`。
- `v-model` 双向：watch `props.modelValue` 同步内部 visible，watch visible 反向 emit。

## Step 3：枚举、字典、常量、i18n

- 取值集合**不得内联魔法值**：通用枚举进 `src/enums/`；后端字典维护的选项用 `useDictStore()`——进页面 `loadDict(['<dict_type>'])`（内部去重缓存）、下拉用 `getDictArray(type)`、展示用 `getDictLabel(type, value)`；页面级配置常量进 `src/constants/`。
- **i18n 默认规范**：全仓文案已迁入 `src/i18n/langs/zh.json`（单一真源，由 `src/i18n/index.js` 装配，`src/locales.js` 仅为兼容转发层），新页面一律用 `$t()`，不得再写硬编码中文（注释与 console 除外）。模板中 `$t` 已全局注入直接用；`<script setup>` 内须 `import { $t } from '@/locales'`。词条分层：通用词 `common.*`（search/reset/add/edit/delete/save/operation 等，含参数化模板 `common.input`“请输入{name}”、`common.select`、`common.addTitle`、`common.editTitle`、`common.deleteConfirm`“确定删除{kind}“{name}”吗？”）；业务词 `system.<name>.<field>`；模块实体短名用 `<name>.entity` 键（删除确认的 kind 传实体名而非字段名）；校验器独立 `validator.*`；菜单/路由标题 `menus.<domain>.<name>.title`。**只维护 zh.json**——其他语言由项目自带的转语言脚本生成，不要自行新增语言文件或做翻译。若用户明确表示不使用 i18n，遵从用户指示。

## Step 4：路由、菜单与权限

- **系统域（/system/xxx）**：在 `src/router/modules/system.js` children 追加：

  ```js
  {
    path: '<name>',
    name: 'System<Name>',
    component: () => import('@/views/module_system/<name>/index.vue'),
    meta: { title: 'menus.system.<name>.title', icon: 'ri:xxx-line', keepAlive: true }
  }
  ```

  meta.title 放 i18n key（`menus.` 前缀），由 `utils/navigation.js` 的 `formatMenuTitle` 在侧边菜单/面包屑/工作标签/页签四处翻译渲染，后端下发的动态菜单标题同样可用该 key；非 `menus.` 前缀或未命中时原样显示。

- **非系统域**：前端无需注册路由。菜单由后端下发，`router/route-loader.js` 按 `import.meta.glob('/src/views/**/*.vue')` 解析菜单 `component` 字符串（如 `module_<domain>/<name>/index`，支持省略 `.vue` 与 `/index` 回落），视图路径与菜单 component 一致即自动生效。
- 菜单数据在「菜单管理」界面维护并授权给角色，否则页面进不去。约束：目录节点不挂组件、子菜单不能用 Layout（`/index/index`）、route `name` 全局唯一（dev 下 console 有校验告警）。
- meta 契约：`title` / `icon` / `keepAlive` / `fixedTab` / `isHide` / `isHideTab` / `public` / `link`·`isIframe`。
- 页面级鉴权按路径推导（`router/guards.js` 的 `RoutePermissionValidator`）；退出登录必须在 `user.store.resetAllState` 内跨 store 清理（menu / worktab / 路由初始化状态）。
- **按钮级权限**：指令 `v-permission`（`directives/business/permission.js`）。入参为权限码**数组**，持有其中任意一个即显示，否则元素从 DOM 移除；超管（`info.is_superuser`）无条件放行，与后端全局中间件语义一致。权限码遵循后端路径推导契约 `module:resource:action`（动作取 query / create / update / delete，如 `system:user:create`），取自「菜单管理」中按钮类菜单的 `permission` 字段，登录时收集进 `user.store.prems`。

  ```vue
  <ElButton v-permission="['system:<name>:create']" type="primary" @click="handleAdd">{{ $t('common.add') }}</ElButton>
  ```

## Step 5：校验

```bash
pnpm lint          # eslint 代码质量
pnpm format:check  # 排版以 .prettierrc.json 为准
pnpm dev           # 启动确认编译无报错、页面可渲染（或直接 pnpm build）
```

语言服务常不可靠，最终以实跑为准；并按 Step 0 要求逐条核对 PRD 验收标准。

## 红线（违反必返工）

1. **如无明确要求，禁止手写请求成功/失败提示**：接口提示由 `utils/request.js` 拦截器统一处理（错误弹窗、非 GET 成功弹窗、401/10401 静默续期 + 队列重放 + 登录跳转），业务再写 ElMessage 会双提示。仅请求发起前的本地校验可自行提示；需静默用配置 `showErrorMessage: false` / `showSuccessMessage: false`。
2. **主题化**：颜色/圆角/阴影只走 `var(--el-*)`、`var(--custom-radius)`、`var(--qa-*)`（SCSS 侧用 `_qa-tokens.scss` 的 `$qa-*`），禁止硬编码 hex / 固定 px，否则暗色模式失效。
3. 组件和方法在 **components, utils** 下，避免重复造轮子，提高代码可复用性
4. 所有请求走 `@/utils/request` 实例；token 存取清统一走 `utils/auth.js` 的 `Auth`，业务不直接摸 localStorage；免鉴权请求用头 `Authorization: 'no-auth'` 或 `skipAuth: true`。
