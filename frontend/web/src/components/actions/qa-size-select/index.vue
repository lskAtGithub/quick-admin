<template>
  <ElTooltip :content="$t('setting.layoutSize.title')" effect="dark" placement="bottom">
    <ElDropdown trigger="click" @command="handleSizeChange">
      <span class="inline-flex outline-none leading-none">
        <QaIconButton icon="ri:font-size-2" class="size-select-btn text-[19px]" />
      </span>
      <template #dropdown>
        <ElDropdownMenu>
          <ElDropdownItem v-for="item of sizeOptions" :key="item.value" :disabled="settingStore.size === item.value" :command="item.value">
            {{ item.label }}
          </ElDropdownItem>
        </ElDropdownMenu>
      </template>
    </ElDropdown>
  </ElTooltip>
</template>

<script setup>
import { computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useSettingStore } from '@/store';
import { $t } from '@/locales';
import { ComponentSize } from '@/enums/layoutEnum';

defineOptions({ name: 'QaSizeSelect' });

const settingStore = useSettingStore();

const SizeIcon = 'Size';

const sizeOptions = computed(() => [
  { label: $t('setting.layoutSize.default'), value: ComponentSize.DEFAULT },
  { label: $t('setting.layoutSize.large'), value: ComponentSize.LARGE },
  { label: $t('setting.layoutSize.small'), value: ComponentSize.SMALL }
]);

function handleSizeChange(size) {
  settingStore.setSize(size);
  ElMessage.success($t('setting.layoutSize.switched'));
}
</script>
