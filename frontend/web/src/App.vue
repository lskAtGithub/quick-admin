<template>
  <ElConfigProvider :size="size" :locale="locale" :z-index="3000" :card="{ shadow: 'never' }">
    <RouterView />
  </ElConfigProvider>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useSettingStore } from '@/store';
import { LanguageEnum } from '@/enums/appEnum';
import en from 'element-plus/es/locale/lang/en';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

defineOptions({ name: 'App' });

const settingStore = useSettingStore();

const size = computed(() => settingStore.size);

const locale = computed(() => {
  return settingStore.language === LanguageEnum.EN ? en : zhCn;
});

onMounted(() => {
  // 初始化时设置 html 的 size class
  const currentSize = settingStore.size;
  if (currentSize !== 'default') {
    document.documentElement.classList.add(`size-${currentSize}`);
  }
});
</script>
