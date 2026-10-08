import { ref, watch } from "vue";
import { usePreferredDark } from "@vueuse/core";

export const THEME = {
  LIGHT: "light",
  DARK: "dark",
  AUTO: "auto",
};

const THEME_KEY = "app-theme";

const theme = ref(localStorage.getItem(THEME_KEY) || THEME.AUTO);
const prefersDark = usePreferredDark();

function applyTheme() {
  const isDark =
    theme.value === THEME.DARK || (theme.value === THEME.AUTO && prefersDark.value);
  document.documentElement.classList.toggle("dark", isDark);
}

watch(theme, (val) => {
  localStorage.setItem(THEME_KEY, val);
  applyTheme();
});

watch(prefersDark, applyTheme);

export function useTheme() {
  const order = [THEME.LIGHT, THEME.DARK, THEME.AUTO];

  function setTheme(val) {
    theme.value = val;
  }

  function toggleTheme() {
    const next = (order.indexOf(theme.value) + 1) % order.length;
    theme.value = order[next];
  }

  return { theme, setTheme, toggleTheme };
}

export function initTheme() {
  applyTheme();
}
