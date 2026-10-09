<template>
  <div class="qa-layout-settings">
    <QaSettingDrawer v-model="showDrawer" @open="handleOpen" @close="handleClose">
      <QaSettingHeader @close="closeDrawer" />
      <QaThemeSettings />
      <QaMenuLayoutSettings />
      <QaMenuStyleSettings />
      <QaColorSettings />
      <QaBoxStyleSettings />
      <QaContainerSettings />
      <QaBasicSettings />
      <QaSettingActions />
    </QaSettingDrawer>
  </div>
</template>

<script setup>
import { useSettingsPanel } from "./composables/useSettingsPanel";

defineOptions({ name: "QaSettingsPanel" });
const { showDrawer, handleOpen, handleClose, closeDrawer } = useSettingsPanel();
</script>

<style lang="scss">
.qa-setting-modal {
  background: transparent !important;

  .el-drawer {
    background: var(--qa-drawer-bg) !important;
    box-shadow: 0 0 30px rgb(0 0 0 / 10%) !important;
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
  }

  .setting-box-wrap {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    width: calc(100% + 15px);
    margin-bottom: 10px;

    .setting-item {
      box-sizing: border-box;
      width: calc(33.333% - 15px);
      margin-right: 15px;
      padding: 0;
      text-align: center;
      cursor: pointer;

      &:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }

      &:focus-visible {
        outline: 2px solid var(--theme-color);
        outline-offset: 3px;
      }

      .box {
        position: relative;
        box-sizing: border-box;
        display: flex;
        height: 52px;
        overflow: hidden;
        border: 2px solid var(--default-border);
        border-radius: 8px;
        box-shadow: 0 0 8px rgb(0 0 0 / 10%);

        &.is-active { border-color: var(--theme-color); }
        img { width: 100%; height: 100%; }
      }

      .name {
        display: block;
        margin-top: 6px;
        font-size: 14px;
      }
    }
  }

  .el-drawer__body {
    scrollbar-width: none;
    &::-webkit-scrollbar { width: 0; }
  }
}
</style>
