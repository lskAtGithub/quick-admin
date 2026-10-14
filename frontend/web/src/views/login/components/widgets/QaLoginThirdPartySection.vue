<template>
  <div class="third-party-login login-third-on-dark">
    <div class="divider-container">
      <div class="divider-line" />
      <span class="divider-text">{{ $t("login.otherLoginMethods") }}</span>
      <div class="divider-line" />
    </div>
    <div
      class="login-third-party-icons flex w-full items-center justify-center gap-x-3 sm:gap-x-4 max-sm:gap-x-2"
    >
      <ElTooltip
        v-for="(item, idx) in oauthItems"
        :key="item.provider"
        :content="item.tip"
        placement="top"
      >
        <button
          type="button"
          class="oauth-social-btn flex size-10 max-sm:size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent outline-none"
          :aria-label="item.tip"
          :style="{ '--oauth-idx': idx }"
          @click="$emit('oauth', item.provider)"
        >
          <QaSvgIcon :icon="item.icon" :class="item.iconClass" />
        </button>
      </ElTooltip>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "QaLoginThirdPartySection" });

defineEmits(["oauth"]);

const { t } = useI18n();

const oauthItems = computed(() => [
  {
    provider: "wechat",
    tip: t("login.oauthTooltip.wechat"),
    icon: "simple-icons:wechat",
    iconClass: "size-[22px] max-sm:size-[18px] text-[#07c160]",
  },
  {
    provider: "qq",
    tip: t("login.oauthTooltip.qq"),
    icon: "simple-icons:tencentqq",
    iconClass: "size-[22px] max-sm:size-[18px] text-[#12b7f5]",
  },
  {
    provider: "github",
    tip: t("login.oauthTooltip.github"),
    icon: "mdi:github",
    iconClass: "size-[22px] max-sm:size-[18px] text-g-800 dark:text-white/85",
  },
  {
    provider: "gitee",
    tip: t("login.oauthTooltip.gitee"),
    icon: "simple-icons:gitee",
    iconClass: "size-[22px] max-sm:size-[18px] text-[#c71d23]",
  },
]);
</script>

<style scoped>
@keyframes qa-oauth-pop {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.oauth-social-btn {
  transition: background-color 0.2s ease;
  animation: qa-oauth-pop 320ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: calc(400ms + var(--oauth-idx, 0) * 70ms);
}

.oauth-social-btn:hover {
  background-color: var(--el-fill-color-light);
}

.oauth-social-btn:hover :deep(.qa-svg-icon) {
  animation: qa-oauth-boing 0.4s ease-in-out;
}

@keyframes qa-oauth-boing {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.85);
  }
  100% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .oauth-social-btn {
    animation: none;
    opacity: 1;
    transform: none;
  }
  .oauth-social-btn:hover :deep(.qa-svg-icon) {
    animation: none;
    transform: none;
  }
}
</style>
