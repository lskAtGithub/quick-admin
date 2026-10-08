<template>
  <div class="theme-svg" :style="sizeStyle">
    <div v-if="src" class="svg-container" v-html="svgContent"></div>
  </div>
</template>

<script setup>
import DOMPurify from "dompurify";

const props = defineProps({
  size: {
    type: [String, Number],
    default: 500,
  },
  themeColor: {
    type: String,
    default: "var(--el-color-primary)",
  },
  src: {
    type: String,
    default: "",
  },
});

const svgContent = ref("");

const sizeStyle = computed(() => {
  const sizeValue = typeof props.size === "number" ? `${props.size}px` : props.size;
  return {
    width: sizeValue,
    height: sizeValue,
  };
});

const COLOR_MAPPINGS = {
  "#C7DEFF": "var(--el-color-primary-light-6)",
  "#071F4D": "var(--el-color-primary-dark-2)",
  "#00E4E5": "var(--el-color-primary-light-1)",
  "#006EFF": "var(--el-color-primary)",
  "#fff": "var(--default-box-color)",
  "#ffffff": "var(--default-box-color)",
  "#DEEBFC": "var(--el-color-primary-light-7)",
};

const applyThemeToSvg = (content) => {
  return Object.entries(COLOR_MAPPINGS).reduce((processedContent, [originalColor, themeColor]) => {
    const fillRegex = new RegExp(`fill="${originalColor}"`, "gi");
    const strokeRegex = new RegExp(`stroke="${originalColor}"`, "gi");

    return processedContent
      .replace(fillRegex, `fill="${themeColor}"`)
      .replace(strokeRegex, `stroke="${themeColor}"`);
  }, content);
};

const loadSvgContent = async () => {
  if (!props.src) {
    svgContent.value = "";
    return;
  }

  try {
    const response = await fetch(props.src);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const content = await response.text();
    svgContent.value = DOMPurify.sanitize(applyThemeToSvg(content));
  } catch (error) {
    console.error("Failed to load SVG:", error);
    svgContent.value = "";
  }
};

watchEffect(() => {
  loadSvgContent();
});
</script>

<style lang="scss" scoped>
.theme-svg {
  display: inline-block;

  .svg-container {
    width: 100%;
    height: 100%;

    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
