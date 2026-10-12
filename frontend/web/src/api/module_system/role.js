import { request } from "@/utils/request";

const API_PATH = "/system/role";

export const RoleAPI = {
  list(query) {
    return request({ url: `${API_PATH}/list`, method: "get", params: query });
  },
  detail(id) {
    return request({ url: `${API_PATH}/${id}`, method: "get" });
  },
  create(body) {
    return request({ url: API_PATH, method: "post", data: body });
  },
  update(id, body) {
    return request({ url: `${API_PATH}/${id}`, method: "put", data: body });
  },
  delete(ids) {
    return request({ url: `${API_PATH}/delete`, method: "post", data: { ids } });
  },
};
