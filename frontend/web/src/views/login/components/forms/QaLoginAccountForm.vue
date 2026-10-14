<template>
  <div>
    <ElForm
      ref="formRef"
      :model="loginForm"
      :rules="rules"
      :key="formKey"
      class="login-page-form"
      :validate-on-rule-change="false"
      @keyup.enter="$emit('submit')"
    >
      <ElFormItem prop="username">
        <ElInput
          class="custom-height"
          v-model.trim="loginForm.username"
          clearable
          :placeholder="$t('login.placeholder.username')"
        >
          <template #prefix>
            <ElIcon><User /></ElIcon>
          </template>
        </ElInput>
      </ElFormItem>

      <ElTooltip :visible="isCapsLock" :content="$t('login.capsLock')" placement="right">
        <ElFormItem prop="password">
          <ElInput
            class="custom-height"
            v-model.trim="loginForm.password"
            type="password"
            autocomplete="off"
            show-password
            clearable
            :placeholder="$t('login.placeholder.password')"
            @keyup="onPasswordKeyup"
          >
            <template #prefix>
              <ElIcon><Lock /></ElIcon>
            </template>
          </ElInput>
        </ElFormItem>
      </ElTooltip>

      <div class="login-form-tail flex flex-col gap-[1.1rem]">
        <div class="relative pb-3">
          <div
            class="relative z-2 overflow-hidden select-none rounded-lg border border-transparent transition duration-300"
            :class="{ 'border-(--qa-danger)!': !isPassing && isClickPass }"
          >
            <QaDragVerify
              ref="dragVerifyRef"
              :value="isPassing"
              @update:value="isPassing = $event"
              :text="$t('login.sliderText')"
              :text-color="dragVerifyTextColor"
              :success-text="$t('login.sliderSuccessText')"
              progress-bar-bg="var(--el-color-success)"
              :background="isDark ? 'var(--default-box-color)' : 'var(--el-border-color-light)'"
              handler-bg="var(--default-box-color)"
            />
          </div>
          <p
            class="absolute top-0 z-1 mt-2 px-px text-xs text-(--qa-danger) transition duration-300"
            :class="{ 'translate-y-10': !isPassing && isClickPass }"
          >
            {{ $t("login.placeholder.slider") }}
          </p>
        </div>

        <div class="login-options-row flex items-center justify-between text-sm">
          <ElCheckbox v-model="loginForm.remember" class="login-remember">
            {{ $t("login.rememberPwd") }}
          </ElCheckbox>
          <ElLink
            type="primary"
            underline="never"
            class="inline-flex items-center text-sm leading-[inherit]!"
            @click="$emit('forget')"
          >
            {{ $t("login.forgetPwd") }}
          </ElLink>
        </div>

        <div>
          <ElButton
            class="h-11 w-full rounded-lg! text-base font-medium"
            type="primary"
            :loading="loading"
            v-ripple
            @click="$emit('submit')"
          >
            {{ $t("login.btnText") }}
          </ElButton>
        </div>
      </div>
    </ElForm>

    <QaLoginThirdPartySection @oauth="$emit('oauth', $event)" />

    <QaLoginAuthLinkRow
      :hint="$t('login.noAccount')"
      :link-text="$t('login.register')"
      @link="$emit('register')"
    />
  </div>
</template>

<script setup>
import { Lock, User } from "@element-plus/icons-vue";

defineOptions({ name: "QaLoginAccountForm" });

const loginForm = defineModel("loginForm", { type: Object, required: true });
const isPassing = defineModel("isPassing", { type: Boolean, required: true });
const isClickPass = defineModel("isClickPass", { type: Boolean, required: true });

defineProps({
  rules: { type: Object, required: true },
  captchaState: { type: Object, required: true },
  codeLoading: { type: Boolean, required: true },
  formKey: { type: [Number, String], required: true },
  isDark: { type: Boolean, required: true },
  dragVerifyTextColor: { type: String, required: true },
  loading: { type: Boolean, required: true },
});

const emit = defineEmits(["submit", "getCaptcha", "forget", "register", "oauth"]);

const formRef = ref();
const dragVerifyRef = ref(null);
const isCapsLock = ref(false);

function onPasswordKeyup(event) {
  if (event instanceof KeyboardEvent) {
    isCapsLock.value = event.getModifierState("CapsLock");
    if (event.key === "Enter") {
      emit("submit");
    }
  }
}

defineExpose({
  validate: () => formRef.value?.validate?.(),
  clearValidate: () => formRef.value?.clearValidate?.(),
  resetDragVerify: () => dragVerifyRef.value?.reset?.(),
});
</script>

<style scoped>
@keyframes qa-login-form-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-page-form :deep(.el-form-item) {
  animation: qa-login-form-in 380ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.login-page-form :deep(.el-form-item:nth-child(1)) { animation-delay: 120ms; }
.login-page-form :deep(.el-form-item:nth-child(2)) { animation-delay: 200ms; }

.login-form-tail {
  animation: qa-login-form-in 380ms cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: 300ms;
}

@media (prefers-reduced-motion: reduce) {
  .login-page-form :deep(.el-form-item),
  .login-form-tail {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
