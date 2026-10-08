import { request } from "@/utils/request";

const API_PATH = "/system/user";

export const UserAPI = {
  getCurrentUserInfo(checkDataScope) {
    return request({
      url: `${API_PATH}/current/info`,
      method: "get",
      params: checkDataScope === false ? { check_data_scope: false } : undefined,
    });
  },
  uploadCurrentUserAvatar(body) {
    return request({
      url: `/common/file/upload?upload_type=avatar`,
      method: "post",
      data: body,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  updateCurrentUserInfo(body) {
    return request({
      url: `${API_PATH}/current/info/update`,
      method: "put",
      data: body,
    });
  },
  changeCurrentUserPassword(body) {
    return request({
      url: `${API_PATH}/password/change`,
      method: "put",
      data: body,
    });
  },
  resetUserPassword(id, body) {
    return request({
      url: `${API_PATH}/password/reset/${id}`,
      method: "put",
      data: body,
    });
  },
  forgetPassword(body) {
    return request({
      url: `${API_PATH}/password/forget`,
      method: "post",
      data: body,
    });
  },
  register(body) {
    return request({
      url: `${API_PATH}/register`,
      method: "post",
      data: body,
    });
  },
  listUser(query) {
    return request({
      url: `${API_PATH}/list`,
      method: "get",
      params: query,
    });
  },
  detailUser(id) {
    return request({
      url: `${API_PATH}/detail/${id}`,
      method: "get",
    });
  },
  createUser(body) {
    return request({
      url: `${API_PATH}/create`,
      method: "post",
      data: body,
    });
  },
  updateUser(id, body) {
    return request({
      url: `${API_PATH}/update/${id}`,
      method: "put",
      data: body,
    });
  },
  deleteUser(body) {
    return request({
      url: `${API_PATH}/delete`,
      method: "delete",
      data: body,
    });
  },
  batchUser(body) {
    return request({
      url: `${API_PATH}/status/batch`,
      method: "patch",
      data: body,
    });
  },
  exportUser(query) {
    return request({
      url: `${API_PATH}/export`,
      method: "post",
      data: query,
      responseType: "blob",
    });
  },
  downloadTemplateUser() {
    return request({
      url: `${API_PATH}/import/template`,
      method: "get",
      responseType: "blob",
    });
  },
  importUser(body) {
    return request({
      url: `${API_PATH}/import/data`,
      method: "post",
      data: body,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default UserAPI;
