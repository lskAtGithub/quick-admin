import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useSettingStore } from "@/store/modules/setting.store";
import { SystemThemeEnum } from "@/enums/appEnum";

NProgress.configure({ showSpinner: false });
export { NProgress };

const { LIGHT, DARK } = SystemThemeEnum;

const toggleTheme = () => {
  const settingStore = useSettingStore();
  settingStore.switchThemeStyles(settingStore.systemThemeMode === LIGHT ? DARK : LIGHT);
};

export const themeAnimation = (e) => {
  const x = e.clientX;
  const y = e.clientY;
  const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  const id = "vt-clip-kf";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = `@keyframes clip{from{clip-path:circle(0% at ${x}px ${y}px)}to{clip-path:circle(${endRadius}px at ${x}px ${y}px)}}`;

  requestAnimationFrame(() => {
    if (document.startViewTransition) document.startViewTransition(() => toggleTheme());
    else toggleTheme();
  });
};
