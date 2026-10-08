import axios from "axios";
import qs from "qs";
import { ElMessage } from "element-plus";
import { Auth, redirectToLogin } from "@/utils/auth";
import { $t } from "@/locales";
import AuthAPI from "@/api/module_system/auth";

export const NO_AUTH_FLAG = "no-auth";

export const ApiStatus = {
  success: 200,
  error: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  methodNotAllowed: 405,
  requestTimeout: 408,
  internalServerError: 500,
  notImplemented: 501,
  badGateway: 502,
  serviceUnavailable: 503,
  gatewayTimeout: 504,
  httpVersionNotSupported: 505,
};

export const ResultEnum = {
  SUCCESS: 0,
  ERROR: 1,
  EXCEPTION: -1,
  UNAUTHORIZED: 10403,
  TOKEN_EXPIRED: 10401,
};

export class HttpError extends Error {
  constructor(message, code, options = {}) {
    super(message);
    this.name = "HTTP_ERROR";
    this.code = code;
    this.data = options.data;
    this.timestamp = new Date().toISOString();
    this.url = options.url;
    this.method = options.method;
  }

  toLogData() {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
      url: this.url,
      method: this.method,
      stack: this.stack,
    };
  }
}

const getErrorMessage = (status) => {
  const errorMap = {
    [ApiStatus.unauthorized]: "httpMsg.unauthorized",
    [ApiStatus.forbidden]: "httpMsg.forbidden",
    [ApiStatus.notFound]: "httpMsg.notFound",
    [ApiStatus.methodNotAllowed]: "httpMsg.methodNotAllowed",
    [ApiStatus.requestTimeout]: "httpMsg.requestTimeout",
    [ApiStatus.internalServerError]: "httpMsg.internalServerError",
    [ApiStatus.badGateway]: "httpMsg.badGateway",
    [ApiStatus.serviceUnavailable]: "httpMsg.serviceUnavailable",
    [ApiStatus.gatewayTimeout]: "httpMsg.gatewayTimeout",
  };

  return $t(errorMap[status] || "httpMsg.internalServerError");
};

export function handleError(error) {
  if (error.code === "ERR_CANCELED") {
    console.info("Request cancelled:", error.message);
    throw new HttpError($t("httpMsg.requestCancelled"), ApiStatus.error);
  }

  const statusCode = error.response?.status;
  const errorMessage = error.response?.data?.msg || error.message;
  const requestConfig = error.config;

  if (!error.response) {
    throw new HttpError($t("httpMsg.networkError"), ApiStatus.error, {
      url: requestConfig?.url,
      method: requestConfig?.method?.toUpperCase(),
    });
  }

  const message = statusCode
    ? getErrorMessage(statusCode)
    : errorMessage || $t("httpMsg.requestFailed");
  throw new HttpError(message, statusCode || ApiStatus.error, {
    data: error.response.data,
    url: requestConfig?.url,
    method: requestConfig?.method?.toUpperCase(),
  });
}

export function showError(error, showMessage = true) {
  if (showMessage) {
    ElMessage.error(error.message);
  }
  console.error("[HTTP Error]", error.toLogData());
}

export function showSuccess(message, showMessage = true) {
  if (showMessage) {
    ElMessage.success(message);
  }
}

export const isHttpError = (error) => {
  return error instanceof HttpError;
};

let isRefreshing = false;
let pendingRequests = [];

function onRefreshed(newToken) {
  const list = pendingRequests;
  pendingRequests = [];
  list.forEach(({ config, resolve }) => {
    config.headers.Authorization = `Bearer ${newToken}`;
    resolve(request(config));
  });
}

function onRefreshFailed() {
  pendingRequests.forEach(({ reject }) => reject(new Error("Token refresh failed")));
  pendingRequests = [];
}

export const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params, { indices: false }),
});

request.interceptors.request.use(
  (config) => {
    const accessToken = Auth.getAccessToken();
    const auth = config.headers.Authorization;

    if (auth === NO_AUTH_FLAG || config.skipAuth) {
      delete config.headers.Authorization;
      return config;
    }

    if (!auth && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    const msg = error instanceof Error ? error.message : String(error);
    ElMessage.error(msg);
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    if (response.config.responseType === "blob") {
      return response;
    }

    const data = response.data;

    if (data.code !== ResultEnum.SUCCESS) {
      if (response.config.showErrorMessage !== false) {
        ElMessage.error(data.msg || $t("httpMsg.requestFailed"));
      }
      return Promise.reject(response);
    }

    if (
      response.config.method?.toUpperCase() !== "GET" &&
      !response.config.url?.includes("login") &&
      !response.config.url?.includes("logout")
    ) {
      if (response.config.showSuccessMessage !== false && data.msg) {
        ElMessage.success(data.msg);
      }
    }

    return response;
  },
  async (error) => {
    if (error.code === "ERR_CANCELED") {
      console.info("Request cancelled:", error.message);
      return Promise.reject(new HttpError($t("httpMsg.requestCancelled"), ApiStatus.error));
    }

    if (!error.response) {
      let errorMessage = $t("httpMsg.networkError");

      if (error.message?.includes("ECONNREFUSED")) {
        errorMessage = "服务器连接失败，请检查后端服务是否正常运行";
      } else if (error.message?.includes("timeout")) {
        errorMessage = $t("httpMsg.requestTimeout");
      } else if (error.message?.includes("Network Error")) {
        errorMessage = "网络连接错误，请检查您的网络设置";
      }

      console.error("网络请求失败:", error);
      ElMessage.error(errorMessage);
      return Promise.reject(new Error(errorMessage));
    }

    const data = error.response?.data;

    if (error.response?.config.responseType === "blob" && error.response.data instanceof Blob) {
      try {
        const text = await new Response(error.response.data).text();
        const jsonData = JSON.parse(text);

        if (jsonData.code === ResultEnum.ERROR) {
          ElMessage.error(jsonData.msg || $t("httpMsg.requestFailed"));
          return Promise.reject(new Error(jsonData.msg || $t("httpMsg.requestFailed")));
        } else if (jsonData.code === ResultEnum.EXCEPTION) {
          ElMessage.error(jsonData.msg || $t("httpMsg.internalServerError"));
          return Promise.reject(new Error(jsonData.msg || $t("httpMsg.internalServerError")));
        }
      } catch (e) {
        console.error("请求异常:", e);
        ElMessage.error($t("httpMsg.requestFailed"));
        return Promise.reject(new Error($t("httpMsg.requestFailed")));
      }
    }

    const status = error.response.status;

    if (status === 401 || data?.code === ResultEnum.TOKEN_EXPIRED) {
      const config = error.config;

      if (config?.url?.endsWith("/auth/token/refresh")) {
        return Promise.reject(
          new HttpError(data?.msg || $t("httpMsg.unauthorized"), ApiStatus.unauthorized)
        );
      }

      if (!config || config.url?.includes("auth/logout")) {
        await redirectToLogin($t("httpMsg.unauthorized"));
        return Promise.reject(new HttpError($t("httpMsg.unauthorized"), ApiStatus.unauthorized));
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResp = await AuthAPI.refreshToken(Auth.getRefreshToken());
          const tokenData = refreshResp.data.data;
          const newAccessToken = tokenData?.access_token || "";
          const newRefreshToken = tokenData?.refresh_token || "";
          Auth.setTokens(newAccessToken, newRefreshToken, Auth.getRememberMe());
          isRefreshing = false;
          const newToken = Auth.getAccessToken();
          onRefreshed(newToken);
          config.headers.Authorization = `Bearer ${newToken}`;
          return request(config);
        } catch {
          isRefreshing = false;
          onRefreshFailed();
          const msg = data?.msg || "登录已失效，请重新登录";
          await redirectToLogin(msg);
          return Promise.reject(new HttpError(msg, ApiStatus.unauthorized));
        }
      } else {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ config, resolve, reject });
        });
      }
    }

    if (status === 403) {
      ElMessage.error(data?.msg || $t("httpMsg.forbidden"));
      return Promise.reject(
        new HttpError(data?.msg || $t("httpMsg.forbidden"), ApiStatus.forbidden)
      );
    }
    if (data?.code === ResultEnum.ERROR) {
      ElMessage.error(data.msg || $t("httpMsg.requestFailed"));
      return Promise.reject(
        new HttpError(data.msg || $t("httpMsg.requestFailed"), ApiStatus.error)
      );
    } else if (data?.code === ResultEnum.UNAUTHORIZED) {
      ElMessage.error(data.msg || $t("httpMsg.unauthorized"));
      return Promise.reject(
        new HttpError(data.msg || $t("httpMsg.unauthorized"), ApiStatus.unauthorized)
      );
    } else if (data?.code === ResultEnum.EXCEPTION) {
      ElMessage.error(data.msg || $t("httpMsg.internalServerError"));
      return Promise.reject(
        new HttpError(data.msg || $t("httpMsg.internalServerError"), ApiStatus.error)
      );
    } else {
      ElMessage.error($t("httpMsg.requestFailed"));
      return Promise.reject(new Error($t("httpMsg.requestFailed")));
    }
  }
);

export default request;
