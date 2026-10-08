<template>
  <div
    ref="dragVerify"
    class="drag_verify"
    :style="dragVerifyStyle"
    @mousemove="dragMoving"
    @mouseup="dragFinish"
    @mouseleave="dragFinish"
    @touchmove="dragMoving"
    @touchend="dragFinish"
  >
    <div class="dv_progress_bar" ref="progressBar" :style="progressBarStyle"></div>

    <div class="dv_text" :style="textStyle" ref="messageRef">
      <slot name="textBefore" v-if="$slots.textBefore"></slot>
      {{ message }}
      <slot name="textAfter" v-if="$slots.textAfter"></slot>
    </div>

    <div
      class="dv_handler dv_handler_bg"
      @mousedown="dragStart"
      @touchstart="dragStart"
      ref="handler"
      :style="handlerStyle"
    >
      <QaSvgIcon :icon="modelValue ? successIcon : handlerIcon" class="text-g-600"></QaSvgIcon>
    </div>
  </div>
</template>

<script setup>
import { useWindowSize } from "@vueuse/core";

defineOptions({ name: "QaDragVerify" });

const emit = defineEmits(["handlerMove", "passCallback"]);

const props = defineProps({
  width: { type: [Number, String], default: "100%" },
  height: { type: Number, default: 40 },
  text: { type: String, default: "按住滑块拖动" },
  successText: { type: String, default: "success" },
  background: { type: String, default: "#eee" },
  progressBarBg: { type: String, default: "#1385FF" },
  completedBg: { type: String, default: "#57D187" },
  circle: { type: Boolean, default: false },
  radius: { type: String, default: "calc(var(--custom-radius) / 3 + 2px)" },
  handlerIcon: { type: String, default: "solar:double-alt-arrow-right-linear" },
  successIcon: { type: String, default: "ri:check-fill" },
  handlerBg: { type: String, default: "#fff" },
  textSize: { type: String, default: "13px" },
  textColor: { type: String, default: "#333" },
});

const { width: winWidth } = useWindowSize();
const effectiveHeight = computed(() =>
  props.height === 40 && winWidth.value < 768 ? 24 : props.height
);

const modelValue = defineModel("value", { type: Boolean, default: false });
const sliderPosition = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const currentX = ref(0);

const dragVerify = ref();
const messageRef = ref();
const handler = ref();
const progressBar = ref();

let touchStartX = 0;
let touchStartY = 0;

const onTouchStart = (e) => {
  const touch = e.targetTouches[0];
  if (!touch) return;
  touchStartX = touch.pageX;
  touchStartY = touch.pageY;
};

const onTouchMove = (e) => {
  const touch = e.targetTouches[0];
  if (!touch) return;
  const moveX = touch.pageX;
  const moveY = touch.pageY;
  if (Math.abs(moveX - touchStartX) > Math.abs(moveY - touchStartY)) {
    e.preventDefault();
  }
};

const getNumericWidth = () => {
  if (typeof props.width === "string") {
    return dragVerify.value?.offsetWidth || 260;
  }
  return props.width;
};

const getStyleWidth = () => {
  if (typeof props.width === "string") {
    return props.width;
  }
  return props.width + "px";
};

onMounted(() => {
  dragVerify.value?.style.setProperty("--textColor", props.textColor);
  nextTick(() => {
    const numericWidth = getNumericWidth();
    dragVerify.value?.style.setProperty("--width", Math.floor(numericWidth / 2) + "px");
    dragVerify.value?.style.setProperty("--pwidth", -Math.floor(numericWidth / 2) + "px");
  });
  document.addEventListener("touchstart", onTouchStart);
  document.addEventListener("touchmove", onTouchMove, { passive: false });
});

onBeforeUnmount(() => {
  document.removeEventListener("touchstart", onTouchStart);
  document.removeEventListener("touchmove", onTouchMove);
});

const handlerStyle = computed(() => ({
  left: sliderPosition.value + "px",
  width: effectiveHeight.value + "px",
  height: effectiveHeight.value + "px",
  background: props.handlerBg,
  transition: isDragging.value ? "none" : "left 0.3s",
}));

const dragVerifyStyle = computed(() => ({
  width: getStyleWidth(),
  height: effectiveHeight.value + "px",
  lineHeight: effectiveHeight.value + "px",
  background: props.background,
  borderRadius: props.circle ? effectiveHeight.value / 2 + "px" : props.radius,
}));

const progressBarStyle = computed(() => ({
  width: sliderPosition.value + effectiveHeight.value / 2 + "px",
  background: modelValue.value ? props.completedBg : props.progressBarBg,
  height: effectiveHeight.value + "px",
  borderRadius: props.circle
    ? effectiveHeight.value / 2 + "px 0 0 " + effectiveHeight.value / 2 + "px"
    : props.radius,
  transition: isDragging.value ? "none" : "width 0.3s",
}));

const textStyle = computed(() => ({
  fontSize: props.textSize,
}));

const message = computed(() => {
  return modelValue.value ? props.successText : props.text;
});

const dragStart = (e) => {
  if (modelValue.value) return;
  isDragging.value = true;

  const pageX = "touches" in e ? (e.touches[0]?.pageX ?? 0) : e.pageX;
  if (typeof pageX !== "number") return;
  startX.value = pageX;
  currentX.value = sliderPosition.value;

  emit("handlerMove");
};

const dragMoving = (e) => {
  if (!isDragging.value || modelValue.value) return;

  const pageX = "touches" in e ? (e.touches[0]?.pageX ?? 0) : e.pageX;
  const numericWidth = getNumericWidth();
  const maxPosition = numericWidth - effectiveHeight.value;

  const newPosition = Math.max(0, Math.min(maxPosition, currentX.value + (pageX - startX.value)));

  if (newPosition >= maxPosition) {
    sliderPosition.value = maxPosition;
    modelValue.value = true;
    isDragging.value = false;
    emit("passCallback");
  } else {
    sliderPosition.value = newPosition;
  }
};

const dragFinish = () => {
  if (!isDragging.value) return;
  isDragging.value = false;

  const numericWidth = getNumericWidth();
  const maxPosition = numericWidth - effectiveHeight.value;

  if (sliderPosition.value < maxPosition) {
    sliderPosition.value = 0;
  } else {
    sliderPosition.value = maxPosition;
    modelValue.value = true;
    emit("passCallback");
  }
};

const reset = () => {
  sliderPosition.value = 0;
  modelValue.value = false;
};

watch(modelValue, (val) => {
  if (!val && sliderPosition.value > 0) {
    sliderPosition.value = 0;
  }
});

defineExpose({
  reset,
});
</script>

<style lang="scss" scoped>
.drag_verify {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  text-align: center;
  border: 1px solid var(--default-border-dashed);

  .dv_handler {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: move;

    i {
      padding-left: 0;
      font-size: 14px;
      color: #999;
    }

    .el-icon-circle-check {
      margin-top: 9px;
      color: #6c6;
    }
  }

  .dv_progress_bar {
    position: absolute;
    height: 34px;
  }

  .dv_text {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    user-select: none;
    background: linear-gradient(
      to right,
      var(--textColor) 0%,
      var(--textColor) 40%,
      #fff 50%,
      var(--textColor) 60%,
      var(--textColor) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    animation: slidetounlock 2s cubic-bezier(0, 0.2, 1, 1) infinite;
    -webkit-text-fill-color: transparent;
    text-size-adjust: none;

    * {
      -webkit-text-fill-color: var(--textColor);
    }
  }
}
</style>

<style lang="scss">
@keyframes slidetounlock {
  0% {
    background-position: var(--pwidth) 0;
  }

  100% {
    background-position: var(--width) 0;
  }
}

@keyframes slidetounlock2 {
  0% {
    background-position: var(--pwidth) 0;
  }

  100% {
    background-position: var(--pwidth) 0;
  }
}
</style>
