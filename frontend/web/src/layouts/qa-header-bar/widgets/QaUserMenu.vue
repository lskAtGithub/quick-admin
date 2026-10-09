<!-- 用户头像菜单 -->
<template>
  <!-- inline-flex + items-center：与顶栏 QaIconButton 同一中线对齐，避免 Popover 触发层基线偏移 -->
  <div class="qa-user-menu inline-flex shrink-0 items-center leading-none">
    <ElPopover
      ref="userMenuPopover"
      placement="bottom-end"
      :width="240"
      :hide-after="0"
      :offset="10"
      trigger="hover"
      :show-arrow="false"
      popper-class="user-menu-popover"
      popper-style="padding: 5px 16px;"
    >
      <template #reference>
        <div class="qa-user-menu__avatar-ref mr-5 max-sm:mr-4 cursor-pointer flex size-8.5 max-sm:w-6.5 max-sm:h-6.5 shrink-0 items-center justify-center">
          <img v-if="userAvatar" class="size-full rounded-full object-cover block" :src="userAvatar" alt="avatar" />
          <img v-else class="size-full rounded-full block" src="@/assets/images/user/avatar.webp" alt="avatar" />
          <!-- 顶栏头像右下角在线状态 -->
          <span class="qa-user-menu__online-dot" aria-hidden="true" />
        </div>
      </template>
      <template #default>
        <div class="pt-3">
          <div class="flex items-center pb-1 px-0">
            <img v-if="userAvatar" class="w-10 h-10 mr-3 ml-0 overflow-hidden rounded-full float-left object-cover" :src="userAvatar" alt="" />
            <img v-else class="w-10 h-10 mr-3 ml-0 overflow-hidden rounded-full float-left" src="@/assets/images/user/avatar.webp" alt="" />
            <div class="w-[calc(100%-60px)] h-full">
              <span class="block text-sm font-medium text-g-800 truncate">
                {{ displayName }}
              </span>
              <span class="block mt-0.5 text-xs text-g-500 truncate">{{ displayEmail }}</span>
            </div>
          </div>
          <ul class="py-4 mt-3 border-t border-g-300/80">
            <li class="flex items-center p-2 mb-3 select-none rounded-md cursor-pointer last:mb-0 hover:bg-(--el-color-primary)/10" @click="goPage('/profile')">
              <QaSvgIcon icon="ri:user-3-line" class="mr-2 text-base" />
              <span class="text-sm">{{ $t('topBar.user.userCenter') }}</span>
            </li>
            <li class="flex items-center p-2 mb-3 select-none rounded-md cursor-pointer last:mb-0 hover:bg-(--el-color-primary)/10" @click="toGithub()">
              <QaSvgIcon icon="ri:github-line" class="mr-2 text-base" />
              <span class="text-sm">{{ $t('topBar.user.github') }}</span>
            </li>
            <li class="flex items-center p-2 mb-3 select-none rounded-md cursor-pointer last:mb-0 hover:bg-(--el-color-primary)/10" @click="lockScreen()">
              <QaSvgIcon icon="ri:lock-line" class="mr-2 text-base" />
              <span class="text-sm">{{ $t('topBar.user.lockScreen') }}</span>
            </li>
            <div class="w-full h-px my-2 bg-g-300/80"></div>
            <li
              class="flex p-2 select-none rounded-md cursor-pointer last:mb-0 justify-center mt-5 mb-0 py-1.5 text-xs border border-g-400 hover:text-(--el-color-danger) hover:border-(--el-color-danger-light-3)"
              @click="handleLogout"
            >
              {{ $t('topBar.user.logout') }}
            </li>
          </ul>
        </div>
      </template>
    </ElPopover>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { useUserStore } from '@/store';
import { WEB_LINKS, mittBus } from '@/utils';

defineOptions({ name: 'QaUserMenu' });

const router = useRouter();
const { t } = useI18n();
const userStore = useUserStore();

const { info: userInfo } = storeToRefs(userStore);
const userMenuPopover = ref();

const userAvatar = computed(() => {
  const a = userInfo.value?.avatar?.trim();
  return a || '';
});

const displayName = computed(() => userInfo.value?.name || userInfo.value?.username || '—');

const displayEmail = computed(() => userInfo.value?.email || '');

function goPage(path) {
  router.push(path);
}

function toGithub() {
  window.open(WEB_LINKS.GITHUB);
}

function toGitee() {
  window.open(WEB_LINKS.GITEE);
}

function lockScreen() {
  mittBus.emit('openLockScreen');
}

function handleLogout() {
  closeUserMenu();
  setTimeout(async () => {
    try {
      await ElMessageBox.confirm(t('common.logoutTips'), t('common.tips'), {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        customClass: 'login-out-dialog'
      });
      await userStore.logout();
    } catch {
      // 用户取消
    }
  }, 200);
}

function closeUserMenu() {
  setTimeout(() => {
    userMenuPopover.value?.hide?.();
  }, 100);
}
</script>

<style scoped>
/* ElPopover 基于 Tooltip：触发层默认 inline-block，与顶栏 flex 图标中线对齐 */
.qa-user-menu .el-tooltip__trigger {
  display: inline-flex !important;
  align-items: center;
  line-height: 1;
}

/* 顶栏头像右下角在线状态；占位与 QaIconButton size-8.5 一致 */
.qa-user-menu__avatar-ref {
  position: relative;
  box-sizing: border-box;
}

.qa-user-menu__online-dot {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 1;
  width: 8px;
  height: 8px;
  pointer-events: none;
  background-color: var(--el-color-success);
  border-radius: 50%;
  box-shadow: 0 0 2px rgb(0 0 0 / 20%);
}
</style>
