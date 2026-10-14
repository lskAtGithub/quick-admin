---
name: QuickAdmin
description: 温润而均衡的企业级后台管理系统模板
colors:
  primary: "#4080ff"
  primary-teal: "#13deb9"
  primary-amber: "#ffae1f"
  primary-red: "#ff4d4f"
  primary-neutral: "#909399"
  semantic-success: "#62c57a"
  semantic-warning: "#e8b74e"
  semantic-danger: "#d9534f"
  semantic-error: "#c77070"
  semantic-info: "#8a8d93"
  neutral-bg: "#fafbfc"
  neutral-surface: "#ffffff"
  neutral-border: "#e2e8ee"
  neutral-hover: "#edeff0"
  neutral-active: "#f2f4f5"
  neutral-text: "#323251"
  neutral-text-secondary: "#949eb7"
  neutral-text-muted: "#dbdfe1"
  neutral-gray-100: "#f9fafb"
  neutral-gray-200: "#f2f4f5"
  neutral-gray-300: "#e6eaeb"
  neutral-gray-400: "#dbdfe1"
  neutral-gray-500: "#949eb7"
  neutral-gray-600: "#7987a1"
  neutral-gray-700: "#4d5875"
  neutral-gray-800: "#383853"
  neutral-gray-900: "#323251"
  tab-pin: "#ca8a04"
typography:
  body:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
  title:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.4
  headline:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  xs: "calc(var(--custom-radius) / 2)"
  sm: "calc(var(--custom-radius) / 2 + 2px)"
  md: "calc(var(--custom-radius) + 2px)"
  lg: "calc(var(--custom-radius) + 4px)"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "6px"
    padding: "8px 20px"
  button-primary-hover:
    backgroundColor: "#6699ff"
    textColor: "#ffffff"
    rounded: "6px"
  card-default:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.lg}"
    padding: "20px"
  card-header:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-text}"
    typography: "{typography.title}"
  input-default:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "6px"
    padding: "8px 12px"
  nav-sidebar:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "0"
---

# Design System: QuickAdmin

## Overview

**Creative North Star: "The Warm Workbench"**

QuickAdmin 的设计气质是一张打磨温润的工作台——不冰冷、不炫技、不过分柔软。它是内部管理人员每天打开八小时以上的界面，因此每一处设计决策都服务于一个目标：**让长时间使用不疲劳**。

视觉上追求现代而均衡的中间路线。按钮不方正到刺眼，也不圆润到幼稚；留白不吝啬也不浪费；颜色有存在感但不喧哗。系统字体栈确保加载零延迟，Element Plus 组件库提供成熟的交互基座，Tailwind CSS 的原子化工具类让每一处间距都落在 4px 基准网格上。

整体密度偏紧凑但不拥挤——默认尺寸下页面内边距 20px、卡片内边距 20px、组件间距 8–16px，三档密度（large/default/small）让用户按需切换。圆角由用户可调的 `--custom-radius` 驱动（默认 0.75rem），所有卡片、输入框、按钮的圆角都基于这一个变量派生，确保风格统一且可控。

**Key Characteristics:**
- 温润中性——颜色含灰、边角含弧、阴影含透，没有任何元素是"硬"的
- 单变量圆角——`--custom-radius` 一个变量控制全局圆角节奏
- 密度可调——三档尺寸系统（spacing + font + layout 联动缩放）
- 双模深度——边框模式与阴影模式一键切换，适配不同审美偏好
- 主题色自由——5 种预设主色 + 自定义取色器，所有语义色独立于主色存在

## Colors

**Palette character:** 以冷调蓝灰为基底，主色饱和但不刺眼，灰阶带微蓝倾向避免死灰感。暗色模式不是简单的反色，而是重新校准了每一级灰的明度和透明度。

### Primary
- **QuickAdmin Blue** (#4080FF): 默认主色。用于主要操作按钮、活跃导航项、链接文字、焦点环。用户可在设置中切换为 Teal (#13DEB9)、Amber (#FFAE1F)、Red (#FF4D4F) 或 Neutral (#909399)。主色变更时 Element Plus 组件同步变色。

### Semantic
- **Success Green** (oklch 78% 0.17 166deg): 成功状态、通过验证、启用开关
- **Warning Amber** (oklch 78% 0.14 75.5deg): 警告提示、待处理状态
- **Danger Red** (oklch 68% 0.22 25.3deg): 删除操作、错误状态、必填校验
- **Info Gray** (oklch 58% 0.03 254deg): 信息提示、辅助说明

### Neutral
- **App Background** (#FAFBFC 亮 / #070707 暗): 页面最底层背景
- **Surface White** (#FFFFFF 亮 / #161618 暗): 卡片、输入框、弹窗等"盒子"表面
- **Border** (#E2E8EE 亮 / rgba(255,255,255,10%) 暗): 默认分割线和边框
- **Card Border** (rgba(0,0,0,8%) 亮 / rgba(255,255,255,8%) 暗): 卡片专属微边框
- **Hover Tint** (#EDEFF0 亮 / #252530 暗): 行悬停、菜单项悬停
- **Active Tint** (#F2F4F5 亮 / #202226 暗): 选中项、按下态
- **Text Primary** (#323251 亮 / #E3E3E8 暗): 正文、标题
- **Text Secondary** (#949EB7): 副标题、描述文字
- **Text Muted** (#DBDFE1): 占位符、禁用文字

### Accent
- **Tab Pin Gold** (#CA8A04 亮 / #FBBF24 暗): 标签页固定标记，小面积点缀

**The One Voice Rule.** 主色只出现在需要用户注意的交互点上——按钮、链接、活跃导航。大面积背景永远是中性色。主色面积不超过界面可见区域的 10%。

## Typography

**Display Font:** system-ui, "Segoe UI", Roboto, sans-serif
**Body Font:** 同上（系统字体栈，零加载延迟）
**Label/Mono Font:** 同上

**Character:** 系统字体栈带来原生质感——不追求字体的个性表达，而是追求加载速度和跨平台一致性。层次通过字重（400/500/600）和字号梯度建立，而非字体切换。

### Hierarchy
- **Display** (500, 28px, lh 1.3): 页面大标题，极少使用，仅首页或统计卡片
- **Headline** (500, 22px, lh 1.3): 模块标题、卡片组标题
- **Title** (500, 18px, lh 1.4): 卡片标题、表单区域标题
- **Body** (400, 13px, lh 1.5): 正文、表格内容、表单标签。默认基准字号
- **Label** (400, 12px, lh 1.4): 辅助文字、徽章、时间戳
- **XS** (400, 11px): 极小标注、版本号

**The Density Rule.** 字号不独立变化——跟随三档尺寸系统联动。large 档整体 +1px，small 档整体 -1px，保持视觉节奏与间距同步缩放。

## Layout

**Spatial model:** Flex 横向布局——侧边栏 + 主内容区。主内容区纵向分为头部（sticky，60px 高）和内容（flex: 1，可滚动）。内容区有独立的页面内边距（默认 20px），内部放置带圆角和边框的内容卡片。

**Container behavior:** 内容卡片宽度支持三种模式——全宽（默认）、限宽居中、自适应。由 `containerWidth` 设置控制。

**Density:** 三档尺寸系统（large / default / small），每档同时调整：
- 间距：xs 3–5px → sm 6–10px → md 9–15px → lg 12–20px → xl 15–25px → 2xl 18–30px
- 字号：xs 11px → 12px → 13px（三档）
- 布局：page-padding 15/20/25px，card-padding 15/20/25px
- 组件高度：sm 24px / default 32px / lg 40px

**Responsive breakpoints:**
- **Desktop** (>1180px): 完整布局，头部毛玻璃效果启用
- **Tablet** (≤1180px): 头部毛玻璃禁用（性能优化）
- **Narrow** (≤800px): 侧边栏变为 fixed 覆盖层，内容区全宽
- **Mobile** (≤640px): 间距进一步收紧（page-padding → sm）

**Layout modes:** 三种导航布局——左侧菜单（默认，侧边栏 230px 可折叠至 64px）、顶部菜单、混合布局（左侧分类 + 顶部子菜单）。

## Elevation & Depth

系统采用**双模深度策略**——用户可在设置中切换「边框模式」和「阴影模式」，两种模式对深度的表达方式完全不同，但都保持温润克制的基调。

### Border Mode (default)
纯边框表达深度。卡片和内容区使用 1px solid rgba(0,0,0,8%) 的微边框，无阴影。干净、扁平、适合高密度数据界面。

### Shadow Mode
边框模式的基础上叠加极轻阴影：`0 1px 3px rgba(0,0,0,3%), 0 1px 2px -1px rgba(0,0,0,8%)`。阴影是环境光式的，不制造明显的"浮起"感，而是给卡片一层若有若无的空气感。

**Header depth:** 头部使用毛玻璃效果（`backdrop-filter: blur(12px)` + 85% 表面色透明度），创造半透明的层叠感。移动端自动降级为纯色背景。

**The Flat-By-Default Rule.** 深度是用户选择的功能，不是设计的默认表达。边框模式是默认值，阴影模式是增强选项。任何新增的组件都必须在两种模式下都表现良好。

## Shapes

**Corner strategy:** 全局圆角由单一变量 `--custom-radius`（默认 0.75rem = 12px）驱动。所有组件的圆角都是基于这个变量的计算值：
- 内容卡片：`calc(var(--custom-radius) + 4px)` — 最圆润
- 标准卡片/ElCard：`calc(var(--custom-radius) + 2px)` — 中等
- 页面内容区：`calc(var(--custom-radius) / 2 + 2px)` — 较收敛
- 输入框/按钮：6px — Element Plus 原生
- 小标签/徽章：`calc(var(--custom-radius) / 2)` — 最小

**Form language:** 整体偏柔和。没有直角——最小的圆角也有 2px。卡片层级通过圆角大小差异自然区分（大卡片 > 小卡片 > 输入框），而不是通过阴影或边框粗细。

## Components

### Buttons
- **Shape:** 微圆角 (6px)，与 Element Plus 默认一致
- **Primary:** 主色背景 + 白色文字，padding 8px 20px
- **Hover / Focus:** 主色亮一档（#6699ff），无位移，0.2s 过渡
- **Secondary / Ghost:** 边框按钮，主色边框 + 主色文字 + 透明背景
- **Philosophy:** 按钮是"工具"不是"装饰"——交互反馈清晰但不夸张，无弹跳动画

### Cards / Containers
- **Corner Style:** 三级圆角体系——qa-card (+4px) > qa-card-sm (+2px) > qa-card-xs (-4px)，均基于 --custom-radius
- **Background:** var(--default-box-color)（亮 #fff / 暗 #161618）
- **Shadow Strategy:** 跟随 box-mode 设置（见 Elevation & Depth）
- **Border:** 1px solid var(--qa-card-border)（微透明，不硬）
- **Internal Padding:** 跟随尺寸系统（15/20/25px）

### Inputs / Fields
- **Style:** 1px 边框，表面色背景，6px 圆角
- **Focus:** 主色边框 + 主色 light-7 外发光（`0 0 0 2px var(--el-color-primary-light-7)`）
- **Error:** 边框变红 + 红色提示文字
- **Dark mode:** 输入框背景 #333，边框 #4C4D50

### Navigation (Sidebar)
- **Style:** 纵向菜单，宽度 230px（可配置），可折叠至 64px
- **Color schemes:** 两种——经典蓝（深色侧边栏 #001529）和极简白（浅色侧边栏）
- **Typography:** 菜单项跟随 body 字号，激活项使用主色文字
- **Hover:** 背景变为 hover-tint (#EDEFF0 亮 / #252530 暗)
- **Active:** 主色文字 + 浅色主色背景高亮
- **Dark mode:** 侧边栏背景跟随暗色方案

### Tab Bar (Work Tabs)
- **Style:** Google 风格标签页（默认），支持多种标签样式切换
- **Pin indicator:** 固定标签顶部有金色圆点 (#CA8A04)，悬停变亮
- **Close:** 每个标签可关闭，hover 时显示关闭按钮

### Header Bar
- **Style:** 毛玻璃背景（`backdrop-filter: blur(12px)`），sticky 定位
- **Content:** 折叠按钮 + 面包屑 + 快捷入口 + 全屏 + 尺寸选择 + 语言 + 主题切换 + 设置
- **Height:** 60px（固定）
- **Border:** 底部 1px solid var(--qa-gray-200)

## Do's and Don'ts

### Do:
- **Do** 所有新增组件的圆角使用 `calc(var(--custom-radius) + Npx)` 派生，保持用户可调圆角的一致性
- **Do** 颜色使用 CSS 变量（`var(--qa-*)` 或 `var(--el-*)`），确保主题切换和暗色模式自动适配
- **Do** 间距落在 4px 网格上（4/8/12/16/20/24px），使用 gap 工具类（gap-xs 到 gap-xl）
- **Do** 新组件同时在亮色和暗色模式下测试，确保两种模式下都可读且有层次
- **Do** 使用语义色变量（--qa-success/warning/danger/error）而非硬编码颜色值
- **Do** 边框模式和阴影模式下都验证组件外观

### Don't:
- **Don't** 硬编码主题色（#4080FF）——用户可能选了其他主色，必须使用 var(--el-color-primary) 或 var(--qa-primary)
- **Don't** 使用纯黑 (#000) 或纯灰 (#808080)——灰阶带微蓝倾向，保持温润感
- **Don't** 在布局外壳的组件上使用固定圆角值——所有圆角必须基于 --custom-radius 计算
- **Don't** 添加超过 8px 的 box-shadow——本系统的深度表达以克制为原则
- **Don't** 在间距中使用非 4px 倍数的值（如 5px、7px、13px）——除非是尺寸系统的联动计算结果
- **Don't** 忽略三档尺寸系统的联动——修改组件大小时，spacing + font + layout 必须同步缩放
- **Don't** 在移动端保留毛玻璃效果——1180px 以下必须降级为纯色背景
