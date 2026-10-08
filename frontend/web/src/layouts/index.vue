<template>
  <div class="layout">
    <aside class="layout-sider">侧栏占位</aside>
    <div class="layout-main">
      <header class="layout-header">
        <span>顶栏占位</span>
        <button class="theme-toggle" @click="toggleTheme">
          主题：{{ theme }}
        </button>
      </header>
      <section class="layout-content">
        <RouterView />
      </section>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from "@/hooks/core/useTheme";

const { theme, toggleTheme } = useTheme();
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}
.layout-sider {
  width: 220px;
  background: var(--app-sidebar-bg);
  color: var(--app-sidebar-text);
  display: flex;
  align-items: center;
  justify-content: center;
}
.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.layout-header {
  height: 56px;
  background: var(--app-header-bg);
  border-bottom: 1px solid var(--app-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}
.theme-toggle {
  cursor: pointer;
  padding: 4px 12px;
  border: 1px solid var(--app-border);
  border-radius: 4px;
  background: transparent;
  color: var(--app-text);
}
.layout-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
  background: var(--app-bg);
}
</style>
