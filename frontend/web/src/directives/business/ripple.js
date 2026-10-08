export const vRipple = {
  mounted(el, binding) {
    const options = binding.value || {};

    el.style.position = "relative";
    el.style.overflow = "hidden";

    el.addEventListener("mousedown", (e) => {
      const rect = el.getBoundingClientRect();
      const left = e.clientX - rect.left;
      const top = e.clientY - rect.top;

      const ripple = document.createElement("div");
      const diameter = Math.max(el.clientWidth, el.clientHeight);
      const radius = diameter / 2;

      const baseTime = 600;
      const scaleFactor = 0.5;
      const animationDuration = baseTime + diameter * scaleFactor;

      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${left - radius}px`;
      ripple.style.top = `${top - radius}px`;
      ripple.style.position = "absolute";
      ripple.style.borderRadius = "50%";
      ripple.style.pointerEvents = "none";

      const buttonTypes = ["primary", "info", "warning", "danger", "success"].map(
        (type) => `el-button--${type}`
      );
      const isColoredButton = buttonTypes.some((type) => el.classList.contains(type));
      const defaultColor = isColoredButton
        ? "rgba(255, 255, 255, 0.25)"
        : "var(--el-color-primary-light-7)";

      ripple.style.backgroundColor = options.color || defaultColor;
      ripple.style.transform = "scale(0)";
      ripple.style.transition = `transform ${animationDuration}ms cubic-bezier(0.3, 0, 0.2, 1), opacity ${animationDuration}ms cubic-bezier(0.3, 0, 0.5, 1)`;
      ripple.style.zIndex = "1";

      el.appendChild(ripple);

      requestAnimationFrame(() => {
        ripple.style.transform = "scale(2)";
        ripple.style.opacity = "0";
      });

      setTimeout(() => {
        ripple.remove();
      }, animationDuration + 500);
    });
  },
};

export function setupRippleDirective(app) {
  app.directive("ripple", vRipple);
}
