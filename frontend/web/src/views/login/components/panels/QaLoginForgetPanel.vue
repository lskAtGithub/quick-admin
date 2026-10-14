<template>
  <div>
    <ElForm
      ref="formRef"
      :model="forgetForm"
      :rules="forgetRules"
      :key="formKey"
      class="login-page-form mt-4"
      @keyup.enter="$emit('submit')"
    >
      <ElFormItem prop="username">
        <ElInput
          v-model.trim="forgetForm.username"
          class="custom-height"
          clearable
          :placeholder="$t('login.placeholder.username')"
          @keyup.enter="$emit('submit')"
        >
          <template #prefix>
            <ElIcon><User /></ElIcon>
          </template>
        </ElInput>
      </ElFormItem>
      <div class="mt-6">
        <ElButton
          class="h-11 w-full min-w-0 rounded-lg! text-base font-medium"
          type="primary"
          :loading="forgetLoading"
          v-ripple
          @click="$emit('submit')"
        >
          {{ $t("common.confirm") }}
        </ElButton>
      </div>
    </ElForm>

    <QaLoginAuthLinkRow
      :hint="$t('login.thinkOfPasswd')"
      :link-text="$t('login.backLoginBtnText')"
      @link="$emit('toLogin')"
    />
  </div>
</template>

<script setup>
import { User } from "@element-plus/icons-vue";

defineOptions({ name: "QaLoginForgetPanel" });

const forgetForm = defineModel("forgetForm", { type: Object, required: true });

defineProps({
  forgetRules: { type: Object, required: true },
  formKey: { type: [Number, String], required: true },
  forgetLoading: { type: Boolean, required: true },
});

defineEmits(["submit", "toLogin"]);

const formRef = ref();

defineExpose({
  validate: () => formRef.value?.validate?.(),
  clearValidate: () => formRef.value?.clearValidate?.(),
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
  animation-delay: 120ms;
}

.login-page-form > .mt-6 {
  animation: qa-login-form-in 380ms cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: 200ms;
}

@media (prefers-reduced-motion: reduce) {
  .login-page-form :deep(.el-form-item),
  .login-page-form > .mt-6 {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
