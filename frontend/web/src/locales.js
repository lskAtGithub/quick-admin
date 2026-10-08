import { createI18n } from "vue-i18n";

export const LanguageEnum = {
  EN: "en",
  ZH: "zh",
};

const messages = {
  zh: {
    httpMsg: {
      unauthorized: "登录已过期，请重新登录",
      forbidden: "您没有权限执行此操作",
      notFound: "请求的资源不存在",
      methodNotAllowed: "请求方法不允许",
      requestTimeout: "请求超时，请稍后重试",
      internalServerError: "服务器繁忙，请稍后重试",
      badGateway: "网关错误，请稍后重试",
      serviceUnavailable: "服务暂时不可用，请稍后重试",
      gatewayTimeout: "网关超时，请稍后重试",
      requestCancelled: "请求已取消",
      networkError: "网络连接异常，请检查您的网络连接",
      requestFailed: "请求失败",
      requestConfigError: "请求配置错误",
    },
  },
  en: {
    httpMsg: {
      unauthorized: "Session expired, please log in again",
      forbidden: "You do not have permission for this operation",
      notFound: "The requested resource does not exist",
      methodNotAllowed: "Request method is not allowed",
      requestTimeout: "Request timed out, please try again later",
      internalServerError: "Server is busy, please try again later",
      badGateway: "Gateway error, please try again later",
      serviceUnavailable: "Service temporarily unavailable, please try again later",
      gatewayTimeout: "Gateway timeout, please try again later",
      requestCancelled: "Request cancelled",
      networkError: "Network error, please check your connection",
      requestFailed: "Request failed",
      requestConfigError: "Request configuration error",
    },
  },
};

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: LanguageEnum.ZH,
  fallbackLocale: LanguageEnum.ZH,
  messages,
});

export const $t = (key) => i18n.global.t(key);

export function initI18n(app) {
  app.use(i18n);
}

export default i18n;
