<template>
  <div class="layout">
    <aside class="layout-sider">侧栏占位</aside>
    <div class="layout-main">
      <header class="layout-header">顶栏占位</header>
      <section class="layout-content">
        <RouterView />
      </section>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}
.layout-sider {
  width: 220px;
  background: #001529;
  color: #fff;
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
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  padding: 0 16px;
}
.layout-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
  background: #f5f5f5;
}
</style>
