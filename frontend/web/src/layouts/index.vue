<!--
  布局根容器：三区域结构
    - #app-sidebar  ← 左侧菜单导航（收起/展开）
    - #app-main     ← 右侧主区域（顶栏 + 页面内容）
      - #app-header  顶栏（面包屑、语言、主题、用户菜单）
      - #app-content 页面内容（RouterView + 页签）
    - #app-global   ← 全局浮层层（Toast、Modal、新手引导）

  A 轮裁切：水印、新手引导、AI 助手（后续轮次按 v-if 接入）。
-->
<template>
  <div class="app-layout">
    <!-- 左侧菜单导航 -->
    <aside id="app-sidebar" aria-label="主菜单导航">
      <QaSidebarMenu />
    </aside>

    <!-- 右侧主区域 -->
    <main id="app-main" aria-label="主要内容区域">
      <div id="app-header">
        <QaHeaderBar />
      </div>
      <div id="app-content">
        <QaPageContent />
      </div>
    </main>

    <!-- 全局浮层层（引导、通知等跨页面组件） -->
    <div id="app-global">
      <QaGlobalComponent />
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "AppLayout" });
</script>
