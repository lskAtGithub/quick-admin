<template>
  <div class="login-page-root flex h-screen w-full flex-col overflow-hidden" :style="loginBgStyle">
    <QaLoginCenterBackdrop v-if="panelAlign === 'center'" viewport-fixed />
    <QaAuthTopBar :panel-align="panelAlign" @update:panel-align="panelAlign = $event" />

    <div class="login-auth-split relative z-1 flex min-h-0 flex-1 overflow-hidden" :class="`login-auth-split--${panelAlign}`">
      <div v-if="panelAlign !== 'center'" class="login-auth-split__col login-auth-split__col--illustration">
        <QaLoginLeftView hide-top-branding />
      </div>

      <div
        class="login-auth-split__col login-auth-split__col--form login-page-panel relative flex min-h-0 min-w-0 flex-col"
        :class="panelAlign === 'center' ? 'bg-transparent' : 'bg-(--el-bg-color-page)'"
      >
        <div class="login-page-panel__main relative z-1 flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-2 pt-14 md:px-10 md:pt-18">
          <ElScrollbar>
            <div class="login-page-panel__scroll pb-6" :class="panelAlign === 'center' && 'login-page-panel__scroll--centered'">
              <div
                class="login-panel-align-row flex w-full items-center justify-center max-sm:min-h-0"
                :class="panelAlign === 'center' ? 'min-h-0 flex-1 py-4' : 'min-h-[min(720px,calc(100vh-13rem))]'"
              >
                <div class="auth-right-wrap">
                  <div class="form">
                    <div class="form-intro">
                      <h3 class="title">
                        <span>{{ panelTitle }}</span>
                        <span class="animate">👋</span>
                      </h3>
                      <p class="sub-title">{{ panelSubTitle }}</p>
                    </div>

                    <QaLoginAccountForm
                      v-if="authPanel === 'login'"
                      ref="accountFormRef"
                      :is-passing="isPassing"
                      :is-click-pass="isClickPass"
                      :login-form="loginForm"
                      :rules="rules"
                      :captcha-state="captchaState"
                      :code-loading="codeLoading"
                      :form-key="formKey"
                      :is-dark="isDark"
                      :drag-verify-text-color="dragVerifyTextColor"
                      :loading="loading"
                      @update:is-passing="isPassing = $event"
                      @update:is-click-pass="isClickPass = $event"
                      @submit="handleSubmit"
                      @get-captcha="getCaptcha"
                      @forget="setAuthPanel('forget')"
                      @register="setAuthPanel('register')"
                      @oauth="handleOAuthLogin"
                    />

                    <QaLoginRegisterPanel
                      v-else-if="authPanel === 'register'"
                      ref="registerPanelRef"
                      :register-form="registerForm"
                      :register-agreement-read="registerAgreementRead"
                      :register-rules="registerRules"
                      :form-key="formKey"
                      :register-loading="registerLoading"
                      :user-agreement-href="userAgreementHref"
                      @update:register-agreement-read="registerAgreementRead = $event"
                      @submit="submitRegister"
                      @to-login="setAuthPanel('login')"
                    />

                    <QaLoginForgetPanel
                      v-else
                      ref="forgetPanelRef"
                      :forget-form="forgetForm"
                      :forget-rules="forgetRules"
                      :form-key="formKey"
                      :forget-loading="forgetLoading"
                      @submit="submitForget"
                      @to-login="setAuthPanel('login')"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ElScrollbar>
        </div>

        <footer
          class="login-page-footer login-page-footer--pinned shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
          :class="panelAlign === 'center' && 'login-page-footer--floating-layout'"
        >
          <div class="login-footer-text text-sm">
            <div class="login-footer-row">
              <a :href="configStore.configData?.git_code?.config_value || '#'" target="_blank" rel="noopener noreferrer" class="login-page-footer__link">
                {{ configStore.configData?.copyright?.config_value || '' }}
              </a>
            </div>
            <span class="login-page-footer__sep login-footer-sep-center">|</span>
            <div class="login-footer-row">
              <a :href="configStore.configData?.help_doc?.config_value || '#'" target="_blank" rel="noopener noreferrer" class="login-page-footer__link">
                {{ $t('login.footer.help') }}
              </a>
              <span class="login-page-footer__sep">|</span>
              <a :href="configStore.configData?.privacy?.config_value || '#'" target="_blank" rel="noopener noreferrer" class="login-page-footer__link">
                {{ $t('login.footer.privacy') }}
              </a>
              <span class="login-page-footer__sep">|</span>
              <a :href="configStore.configData?.clause?.config_value || '#'" target="_blank" rel="noopener noreferrer" class="login-page-footer__link">
                {{ $t('login.footer.clause') }}
              </a>
              <span v-if="configStore.configData?.keep_record?.config_value" class="login-page-footer__sep">|</span>
              <span v-if="configStore.configData?.keep_record?.config_value" class="login-page-footer__record">
                {{ configStore.configData.keep_record.config_value }}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessage, ElNotification } from 'element-plus';
import AuthAPI from '@/api/module_system/auth';
import UserAPI from '@/api/module_system/user';
import { useConfigStore, useAppStore, useSettingStore, useUserStore } from '@/store';
import { Auth, startOAuthLogin } from '@/utils/auth';
import { HttpError } from '@/utils/request';
import { useLoginPanelAlign } from './components/composables/useLoginPanelAlign';

defineOptions({ name: 'Login' });

const configStore = useConfigStore();
const settingStore = useSettingStore();
const appStore = useAppStore();
const { isDark } = storeToRefs(settingStore);
const { t, locale } = useI18n();

const { panelAlign } = useLoginPanelAlign();

const authPanel = ref('login');

const panelTitle = computed(() => {
  if (authPanel.value === 'forget') return t('login.resetPassword');
  return t('login.title');
});

const panelSubTitle = computed(() => {
  if (authPanel.value === 'register') return t('register.subTitle');
  if (authPanel.value === 'forget') return t('forgetPassword.subTitle');
  return t('login.subTitle');
});

const userAgreementHref = computed(() => configStore.configData?.clause?.config_value || '');

function setAuthPanel(panel) {
  authPanel.value = panel;
  nextTick(() => {
    accountFormRef.value?.clearValidate?.();
    registerPanelRef.value?.clearValidate?.();
    forgetPanelRef.value?.clearValidate?.();
  });
}

function handleOAuthLogin(provider) {
  startOAuthLogin(provider);
}

async function tryConsumeOAuthCallback() {
  const q = route.query;
  const oauthError = q.oauth_error;
  const access = q.access_token;
  const refresh = q.refresh_token;

  if (!oauthError && !(access && refresh)) return;

  const rest = { ...q };
  delete rest.oauth_error;
  delete rest.access_token;
  delete rest.refresh_token;
  delete rest.token_type;

  if (oauthError) {
    ElMessage.error(decodeURIComponent(oauthError));
    await router.replace({ path: route.path, query: rest });
    return;
  }

  if (access && refresh) {
    try {
      Auth.setTokens(access, refresh, true);
      userStore.setToken(access, refresh);
      userStore.setLoginStatus(true);
      ElNotification({
        title: t('login.oauthNoticeTitle'),
        message: t('login.oauthLoginSuccess'),
        type: 'success'
      });
      await router.replace(resolveRedirectTarget(rest));
      if (settingStore.showGuide) {
        appStore.showGuide(true);
      }
    } catch (error) {
      console.error('[Login] OAuth callback:', error);
      ElMessage.error(t('login.oauthLoginFailed'));
      await router.replace({ path: route.path, query: rest });
    }
  }
}

const dragVerifyTextColor = computed(() => (isDark.value ? 'rgba(255, 255, 255, 0.45)' : 'var(--qa-gray-700)'));
const formKey = ref(0);

watch(locale, () => {
  formKey.value++;
});

watch(authPanel, (panel) => {
  if (panel !== 'login') return;
  getCaptcha();
  accountFormRef.value?.resetDragVerify?.();
  isPassing.value = false;
  isClickPass.value = false;
});

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const isPassing = ref(false);
const isClickPass = ref(false);

const accountFormRef = ref(null);
const registerPanelRef = ref(null);
const forgetPanelRef = ref(null);

const loading = ref(false);
const registerLoading = ref(false);
const forgetLoading = ref(false);
const codeLoading = ref(false);

const registerAgreementRead = ref(false);

const registerForm = reactive({
  username: '',
  name: '',
  password: '',
  confirmPassword: ''
});

const forgetForm = reactive({
  username: ''
});

const validateRegisterPassword = (_rule, value, callback) => {
  if (!value) {
    callback(new Error(t('login.message.password.required')));
    return;
  }
  if (registerForm.confirmPassword) {
    registerPanelRef.value?.validateField?.('confirmPassword');
  }
  callback();
};

const validateRegisterConfirm = (_rule, value, callback) => {
  if (!value) {
    callback(new Error(t('login.message.password.required')));
    return;
  }
  if (value !== registerForm.password) {
    callback(new Error(t('login.message.password.inconformity')));
    return;
  }
  callback();
};

const registerRules = computed(() => ({
  username: [{ required: true, message: t('login.message.username.required'), trigger: 'blur' }],
  name: [{ required: true, message: t('common.input', { name: t('system.user.nickname') }), trigger: 'blur' }],
  password: [
    { required: true, validator: validateRegisterPassword, trigger: 'blur' },
    { min: 6, message: t('login.message.password.min'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('login.message.password.required'), trigger: 'blur' },
    { min: 6, message: t('login.message.password.min'), trigger: 'blur' },
    { validator: validateRegisterConfirm, trigger: 'blur' }
  ]
}));

const forgetRules = computed(() => ({
  username: [{ required: true, message: t('login.message.username.required'), trigger: 'blur' }]
}));

const loginForm = reactive({
  username: '',
  password: '',
  captcha_key: '',
  remember: true,
  login_type: 'PC端'
});

// —— 登录页背景 ——
const loginBgStyle = computed(() => {
  const bg = configStore.configData?.login_bg?.config_value?.trim();
  return bg ? { backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};
});

const captchaState = reactive({
  enable: false,
  key: '',
  img_base: ''
});

const rules = computed(() => ({
  username: [
    {
      required: true,
      trigger: 'blur',
      message: t('login.message.username.required')
    }
  ],
  password: [
    {
      required: true,
      trigger: 'blur',
      message: t('login.message.password.required')
    },
    {
      min: 6,
      message: t('login.message.password.min'),
      trigger: 'blur'
    }
  ]
}));

async function getCaptcha() {
  try {
    codeLoading.value = true;
    const response = await AuthAPI.getCaptcha();
    const data = response.data;
    loginForm.captcha_key = data.key;
    captchaState.img_base = data.img_base;
    captchaState.enable = data.enable;
    isPassing.value = false;
    isClickPass.value = false;
  } catch {
    captchaState.enable = false;
    loginForm.captcha_key = '';
  } finally {
    codeLoading.value = false;
  }
}

/** 滑块验证完成后通知后端标记 */
async function handleSliderPass(passed) {
  if (!passed || !loginForm.captcha_key) return;
  try {
    await AuthAPI.sliderComplete(loginForm.captcha_key);
  } catch {
    isPassing.value = false;
    await getCaptcha();
  }
}

/** 监听滑块通过状态 */
watch(isPassing, (val) => {
  handleSliderPass(val);
});

function resolveRedirectTarget(query) {
  const defaultPath = '/';
  const rawRedirect = query.redirect || defaultPath;
  try {
    const resolved = router.resolve(rawRedirect);
    return {
      path: resolved.path,
      query: resolved.query
    };
  } catch {
    return { path: defaultPath };
  }
}

let notificationInstance = null;

const showVoteNotification = () => {
  notificationInstance = ElNotification({
    title: t('login.star.title'),
    message: `<div style="display:flex;flex-direction:column;gap:12px;margin-top:4px;">
        <div style="line-height:1.65;color:var(--el-text-color-regular);">${t('login.star.message')}</div>
        <a href="https://github.com/lskAtGithub/quick-admin" target="_blank" rel="noopener noreferrer"
           style="align-self:flex-start;display:inline-flex;align-items:center;gap:8px;padding:7px 16px;font-size:13px;font-weight:500;color:var(--el-color-white);background:var(--el-color-primary);border-radius:calc(var(--custom-radius) / 2 + 2px);text-decoration:none;">
          <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.68-.01-1.34-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
          ${t('login.star.link')}
        </a>
      </div>`,
    position: panelAlign.value === 'right' || panelAlign.value === 'center' ? 'bottom-left' : 'bottom-right',
    duration: 3000,
    showClose: true,
    dangerouslyUseHTMLString: true
  });
};

let voteTimer = null;

onMounted(async () => {
  await configStore.getConfig(true);
  await tryConsumeOAuthCallback();
  if (userStore.isLogin) {
    await router.replace(resolveRedirectTarget(route.query));
    return;
  }
  getCaptcha();
  voteTimer = setTimeout(showVoteNotification, 500);
});

onActivated(() => {
  if (authPanel.value !== 'login') return;
  getCaptcha();
});

onBeforeUnmount(() => {
  if (voteTimer !== null) clearTimeout(voteTimer);
  notificationInstance?.close();
  notificationInstance = null;
});

watch(
  () => route.fullPath,
  () => {
    if (authPanel.value !== 'login') return;
    getCaptcha();
  }
);

const handleSubmit = async () => {
  if (!accountFormRef.value) return;

  try {
    const valid = await accountFormRef.value.validate?.();
    if (!valid) return;

    if (!isPassing.value) {
      isClickPass.value = true;
      return;
    }

    loading.value = true;

    await userStore.login(loginForm);
    await router.replace(resolveRedirectTarget(route.query));

    if (settingStore.showGuide) {
      appStore.showGuide(true);
    }
  } catch (error) {
    formKey.value++;
    await getCaptcha();
    if (!(error instanceof HttpError)) {
      console.error('[Login] Unexpected error:', error);
      ElNotification({
        title: t('common.tips'),
        message: error instanceof Error ? error.message : String(error),
        type: 'error'
      });
    }
  } finally {
    loading.value = false;
  }
};

async function submitRegister() {
  if (!registerAgreementRead.value) {
    ElMessage.warning(t('login.message.agree.required'));
    return;
  }
  if (!registerPanelRef.value) return;
  try {
    await registerPanelRef.value.validate?.();
    registerLoading.value = true;
    await UserAPI.register(registerForm);
    loginForm.username = registerForm.username;
    loginForm.password = registerForm.password;
    registerForm.username = '';
    registerForm.password = '';
    registerForm.confirmPassword = '';
    registerForm.name = '';
    registerAgreementRead.value = false;
    setAuthPanel('login');
    await handleSubmit();
  } catch (error) {
    console.error('[Login] register:', error);
  } finally {
    registerLoading.value = false;
  }
}

async function submitForget() {
  if (!forgetPanelRef.value) return;
  try {
    await forgetPanelRef.value.validate?.();
    forgetLoading.value = true;
    await UserAPI.forgetPassword(forgetForm);
    forgetForm.username = '';
    setAuthPanel('login');
  } catch (error) {
    console.error('[Login] forget password:', error);
  } finally {
    forgetLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.animate {
  display: inline-block;
  animation: wave 2.4s ease-in-out 0.4s 1 both;
  transform-origin: 70% 100%;
  margin-left: 12px;
}

@keyframes wave {
  0% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(16deg);
  }
  20% {
    transform: rotate(-10deg);
  }
  30% {
    transform: rotate(14deg);
  }
  40% {
    transform: rotate(-6deg);
  }
  50% {
    transform: rotate(10deg);
  }
  60%,
  100% {
    transform: rotate(0deg);
  }
}
</style>
