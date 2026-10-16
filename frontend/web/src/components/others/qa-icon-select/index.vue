<template>
  <div ref="iconSelectRef">
    <ElPopover :visible="popoverVisible" :width="460" placement="bottom-end">
      <template #reference>
        <div @click="popoverVisible = !popoverVisible">
          <ElInput v-model="selectedIcon" readonly :placeholder="$t('common.selectIcon')">
            <template #prepend>
              <QaSvgIcon v-if="selectedIcon" :icon="resolveIcon(selectedIcon)" :size="16" />
              <span v-else class="text-gray-400">{{ $t('common.icon') }}</span>
            </template>
            <template #suffix>
              <ElIcon v-if="selectedIcon" @click.stop="selectedIcon = ''">
                <CircleClose />
              </ElIcon>
              <ElIcon :style="{ transform: popoverVisible ? 'rotate(180deg)' : '', transition: 'transform .3s' }">
                <ArrowDown @click.stop="popoverVisible = !popoverVisible" />
              </ElIcon>
            </template>
          </ElInput>
        </div>
      </template>

      <div>
        <ElInput v-model="filterText" :placeholder="$t('common.searchIcon')" clearable />
        <ElScrollbar height="280px" class="mt-2">
          <div class="flex flex-wrap gap-1 p-1">
            <div v-for="icon in filteredIcons" :key="icon" class="icon-item" :class="{ 'icon-item--active': selectedIcon === icon }" @click="selectIcon(icon)">
              <ElTooltip :content="icon" placement="bottom" :show-after="300">
                <QaSvgIcon :icon="icon" :size="18" />
              </ElTooltip>
            </div>
          </div>
        </ElScrollbar>
      </div>
    </ElPopover>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { CircleClose, ArrowDown } from '@element-plus/icons-vue';
import { onClickOutside } from '@vueuse/core';
import QaSvgIcon from '@/components/base/qa-svg-icon/index.vue';
import { resolveIconForQaSvgIcon } from '@/utils/menuIcon';

defineOptions({ name: 'QaIconSelect' });

const selectedIcon = defineModel({ type: String, default: '' });

const iconSelectRef = ref();
const popoverVisible = ref(false);
const filterText = ref('');

const COMMON_ICONS = [
  'ri:home-4-line',
  'ri:settings-2-line',
  'ri:settings-3-line',
  'ri:user-line',
  'ri:admin-line',
  'ri:team-line',
  'ri:node-tree',
  'ri:table-line',
  'ri:database-2-line',
  'ri:file-text-line',
  'ri:file-list-line',
  'ri:file-list-3-line',
  'ri:code-s-slash-line',
  'ri:terminal-box-line',
  'ri:bug-line',
  'ri:test-tube-line',
  'ri:bar-chart-box-line',
  'ri:line-chart-line',
  'ri:pie-chart-line',
  'ri:pie-chart-2-line',
  'ri:mail-line',
  'ri:message-3-line',
  'ri:notification-3-line',
  'ri:chat-3-line',
  'ri:calendar-line',
  'ri:time-line',
  'ri:timer-line',
  'ri:calendar-event-line',
  'ri:folder-line',
  'ri:folder-2-line',
  'ri:folder-open-line',
  'ri:folder-upload-line',
  'ri:upload-cloud-2-line',
  'ri:download-cloud-line',
  'ri:share-line',
  'ri:links-line',
  'ri:lock-line',
  'ri:lock-unlock-line',
  'ri:shield-keyhole-line',
  'ri:key-2-line',
  'ri:computer-line',
  'ri:smartphone-line',
  'ri:printer-line',
  'ri:hard-drive-2-line',
  'ri:image-line',
  'ri:camera-line',
  'ri:video-line',
  'ri:movie-2-line',
  'ri:music-2-line',
  'ri:headphone-line',
  'ri:volume-up-line',
  'ri:mic-line',
  'ri:shopping-cart-line',
  'ri:shopping-bag-line',
  'ri:store-2-line',
  'ri:gift-line',
  'ri:map-pin-line',
  'ri:map-2-line',
  'ri:navigation-line',
  'ri:compass-3-line',
  'ri:book-2-line',
  'ri:book-read-line',
  'ri:article-line',
  'ri:newspaper-line',
  'ri:rocket-line',
  'ri:lightbulb-line',
  'ri:plug-line',
  'ri:apps-line',
  'ri:layout-line',
  'ri:layout-grid-line',
  'ri:grid-line',
  'ri:list-check',
  'ri:search-line',
  'ri:filter-3-line',
  'ri:sort-desc',
  'ri:refresh-line',
  'ri:fullscreen-line',
  'ri:fullscreen-exit-line',
  'ri:expand-up-down-line',
  'ri:external-link-line',
  'ri:heart-line',
  'ri:star-line',
  'ri:thumb-up-line',
  'ri:flag-line',
  'ri:alert-line',
  'ri:error-warning-line',
  'ri:information-line',
  'ri:question-line',
  'ri:checkbox-line',
  'ri:checkbox-circle-line',
  'ri:close-circle-line',
  'ri:check-line',
  'ri:arrow-up-line',
  'ri:arrow-down-line',
  'ri:arrow-left-line',
  'ri:arrow-right-line',
  'ri:menu-line',
  'ri:more-2-fill',
  'ri:draggable',
  'ri:menu-fold-line',
  'ri:menu-unfold-line',
  'ri:arrow-up-s-line',
  'ri:arrow-down-s-line',
  'ri:arrow-right-s-line',
  'ri:arrow-left-s-line',
  'ri:add-line',
  'ri:subtract-line',
  'ri:close-line',
  'ri:github-fill',
  'ri:git-branch-line',
  'ri:git-repository-line',
  'ri:vuejs-line',
  'ri:typescript-line',
  'ri:javascript-line',
  'ri:html5-fill',
  'ri:css3-line',
  'ri:wechat-fill',
  'ri:qq-fill',
  'ri:alipay-fill',
  'ri:chrome-line'
];

const resolveIcon = (icon) => resolveIconForQaSvgIcon(icon);

const filteredIcons = computed(() => {
  if (!filterText.value) return COMMON_ICONS;
  const keyword = filterText.value.toLowerCase();
  return COMMON_ICONS.filter((icon) => icon.toLowerCase().includes(keyword));
});

const selectIcon = (icon) => {
  selectedIcon.value = icon;
  popoverVisible.value = false;
};

onClickOutside(iconSelectRef, () => {
  popoverVisible.value = false;
});
</script>

<style scoped>
.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-item:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  transform: scale(1.15);
}

.icon-item--active {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}
</style>
