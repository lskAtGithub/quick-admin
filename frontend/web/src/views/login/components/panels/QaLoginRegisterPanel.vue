<template>
  <div>
    <ElForm
      ref="formRef"
      :model="registerForm"
      :rules="registerRules"
      :key="formKey"
      class="login-page-form"
      @keyup.enter="$emit('submit')"
    >
      <ElFormItem prop="username">
        <ElInput
          class="custom-height"
          v-model.trim="registerForm.username"
          clearable
          :placeholder="$t('login.placeholder.username')"
        >
          <template #prefix>
            <ElIcon><User /></ElIcon>
          </template>
        </ElInput>
      </ElFormItem>
      <ElFormItem prop="name">
        <ElInput
          class="custom-height"
          v-model.trim="registerForm.name"
          clearable
          :placeholder="$t('register.placeholder.name')"
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
            v-model.trim="registerForm.password"
            type="password"
            autocomplete="off"
            show-password
            clearable
            :placeholder="$t('login.placeholder.password')"
            @keyup="checkCapsLock"
          >
            <template #prefix>
              <ElIcon><Lock /></ElIcon>
            </template>
          </ElInput>
        </ElFormItem>
      </ElTooltip>
      <ElTooltip :visible="isCapsLock" :content="$t('login.capsLock')" placement="right">
        <ElFormItem prop="confirmPassword">
          <ElInput
            class="custom-height"
            v-model.trim="registerForm.confirmPassword"
            type="password"
            autocomplete="off"
            show-password
            clearable
            :placeholder="$t('login.message.password.confirm')"
            @keyup="checkCapsLock"
          >
            <template #prefix>
              <ElIcon><Lock /></ElIcon>
            </template>
          </ElInput>
        </ElFormItem>
      </ElTooltip>
      <ElFormItem>
        <div class="flex flex-wrap items-center gap-2">
          <ElCheckbox v-model="registerAgreementRead">
            {{ $t("login.agree") }}
          </ElCheckbox>
          <ElLink
            type="primary"
            underline="never"
            class="text-sm font-medium"
            :href="userAgreementHref"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t("login.userAgreement") }}
          </ElLink>
        </div>
      </ElFormItem>
      <div class="mt-6">
        <ElButton
          class="h-11 w-full rounded-lg! text-base font-medium"
          type="primary"
          :loading="registerLoading"
          v-ripple
          @click="$emit('submit')"
        >
          {{ $t("login.register") }}
        </ElButton>
      </div>
    </ElForm>

    <QaLoginAuthLinkRow
      :hint="$t('login.haveAccount')"
      :link-text="$t('login.backLoginBtnText')"
      @link="$emit('toLogin')"
    />
  </div>
</template>

<script setup>
import { Lock, User } from "@element-plus/icons-vue";

defineOptions({ name: "QaLoginRegisterPanel" });

const registerForm = defineModel("registerForm", { type: Object, required: true });
const registerAgreementRead = defineModel("registerAgreementRead", {
  type: Boolean,
  required: true,
});

defineProps({
  registerRules: { type: Object, required: true },
  formKey: { type: [Number, String], required: true },
  registerLoading: { type: Boolean, required: true },
  userAgreementHref: { type: String, required: true },
});

const emit = defineEmits(["submit", "toLogin"]);

const formRef = ref();
const isCapsLock = ref(false);

function checkCapsLock(event) {
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
  validateField: (prop) => formRef.value?.validateField?.(prop),
});
</script>
