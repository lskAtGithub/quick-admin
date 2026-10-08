<template>
  <div class="flex items-center justify-center">
    <img
      :style="logoStyle"
      :src="resolvedSrc"
      alt="logo"
      class="h-full w-full object-contain"
      @error="onImgError"
    />
  </div>
</template>

<script setup>
import defaultLogoUrl from "@fa_imgs/logo.svg";

defineOptions({ name: "QaLogo" });

const props = defineProps({
  size: {
    type: [Number, String],
    default: 36,
  },
  src: {
    type: String,
    default: undefined,
  },
});

const fallbackTriggered = ref(false);

const resolvedSrc = computed(() => {
  if (fallbackTriggered.value) return defaultLogoUrl;
  const custom = props.src?.trim();
  return custom || defaultLogoUrl;
});

function onImgError() {
  if (!fallbackTriggered.value) {
    fallbackTriggered.value = true;
  }
}

const logoStyle = computed(() => ({ width: `${props.size}px`, height: `${props.size}px` }));

watch(
  () => props.src,
  () => {
    fallbackTriggered.value = false;
  }
);
</script>
