/**
 * 顶部栏功能配置
 *
 * 统一管理顶部栏各个功能模块的启用状态。
 * 通过修改此配置文件可以快速启用或禁用顶部栏的功能按钮。
 *
 * @module config/headerBar
 */

import { $t } from '@/locales';

export const headerBarConfig = {
  menuButton: {
    enabled: true,
    description: $t('setting.headerBar.menuButton')
  },
  refreshButton: {
    enabled: true,
    description: $t('setting.headerBar.refreshButton')
  },
  fastEnter: {
    enabled: true,
    description: $t('setting.headerBar.fastEnter'),
    minWidth: 1200
  },
  breadcrumb: {
    enabled: true,
    description: $t('setting.headerBar.breadcrumb')
  },
  globalSearch: {
    enabled: true,
    description: $t('setting.headerBar.globalSearch')
  },
  fullscreen: {
    enabled: true,
    description: $t('setting.headerBar.fullscreen')
  },
  notification: {
    enabled: true,
    description: $t('setting.headerBar.notification')
  },
  language: {
    enabled: true,
    description: $t('setting.headerBar.language')
  },
  settings: {
    enabled: true,
    description: $t('setting.headerBar.settings')
  },
  themeToggle: {
    enabled: true,
    description: $t('setting.headerBar.themeToggle')
  },
  sizeSelect: {
    enabled: true,
    description: $t('setting.headerBar.sizeSelect')
  }
};

export default headerBarConfig;
