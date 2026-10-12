<template>
  <ElTooltip content="布局大小" effect="dark" placement="bottom">
    <ElDropdown trigger="click" @command="handleSizeChange">
      <span class="inline-flex outline-none leading-none">
        <QaIconButton icon="ri:font-size-2" class="size-select-btn text-[19px]" />
      </span>
      <template #dropdown>
        <ElDropdownMenu>
          <ElDropdownItem
            v-for="item of sizeOptions"
            :key="item.value"
            :disabled="settingStore.size === item.value"
            :command="item.value"
          >
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
import { ComponentSize } from '@/enums/layoutEnum';

defineOptions({ name: 'QaSizeSelect' });

const settingStore = useSettingStore();

const SizeIcon = 'Size';

const sizeOptions = computed(() => [
  { label: '默认', value: ComponentSize.DEFAULT },
  { label: '大型', value: ComponentSize.LARGE },
  { label: '小型', value: ComponentSize.SMALL },
]);

function handleSizeChange(size) {
  settingStore.setSize(size);
  ElMessage.success('布局大小已切换');
}
</script>
