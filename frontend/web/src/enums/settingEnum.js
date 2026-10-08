export const PageSwitchingAnimationEnum = {
  NONE: "none",
  FADE: "fade",
  FADE_SLIDE: "fade-slide",
  FADE_SCALE: "fade-scale",
  SLIDE_LEFT_RIGHT: "slide-left-right",
  ZOOM_IN_OUT: "zoom-in-out",
  SLIDE_UP_DOWN: "slide-up-down",
  BOUNCE: "bounce",
};

export const PageSwitchingAnimationOptions = {
  none: { value: "none", label: "无动画" },
  fade: { value: "fade", label: "淡入淡出" },
  "fade-slide": { value: "fade-slide", label: "平滑切换" },
  "fade-scale": { value: "fade-scale", label: "缩放切换" },
  "slide-left-right": { value: "slide-left-right", label: "左右滑动" },
  "zoom-in-out": { value: "zoom-in-out", label: "缩放进出" },
  "slide-up-down": { value: "slide-up-down", label: "上下滑动" },
  bounce: { value: "bounce", label: "弹性效果" },
};
