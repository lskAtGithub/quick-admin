import { useUserStore } from '@/store';

// 入参为权限码数组，持有其中任意一个即视为有权限；超管无条件放行（与后端全局中间件语义一致）
function hasPermission(required) {
  const userStore = useUserStore();
  if (userStore.info?.is_superuser) return true;
  return required.some((perm) => userStore.prems.includes(perm));
}

export const vPermission = {
  mounted(el, binding) {
    const required = (Array.isArray(binding.value) ? binding.value : [binding.value]).filter(Boolean);
    if (required.length === 0) return;
    if (!hasPermission(required)) {
      el.parentNode?.removeChild(el);
    }
  }
};

export function setupPermissionDirective(app) {
  app.directive('permission', vPermission);
}
