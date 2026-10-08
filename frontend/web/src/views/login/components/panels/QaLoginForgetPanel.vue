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
