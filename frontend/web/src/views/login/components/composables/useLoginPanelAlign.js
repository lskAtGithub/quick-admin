import { ref, watch } from "vue";

const STORAGE_KEY = "login-panel-align";

function readInitial() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "left" || v === "center" || v === "right") return v;
  } catch {
    /* ignore */
  }
  return "right";
}

export function useLoginPanelAlign() {
  const panelAlign = ref(readInitial());

  watch(panelAlign, (v) => {
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {
      /* ignore */
    }
  });

  return { panelAlign };
}
