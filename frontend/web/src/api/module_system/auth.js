import { request } from "@/utils/request";

const API_PATH = "/system/auth";

const AuthAPI = {
  login(body) {
    return request({
      url: `${API_PATH}/login`,
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: body,
    });
  },
  refreshToken(refreshToken) {
    return request({
      url: `${API_PATH}/token/refresh`,
      method: "post",
      data: refreshToken,
    });
  },
  getCaptcha() {
    return request({
      url: `${API_PATH}/captcha/get`,
      method: "get",
    });
  },
  logout(body) {
    return request({
      url: `${API_PATH}/logout`,
      method: "post",
      data: body,
    });
  },
  sliderComplete(captchaKey) {
    return request({
      url: `${API_PATH}/captcha/slider/complete`,
      method: "post",
      data: { captcha_key: captchaKey },
    });
  },
};

export default AuthAPI;
