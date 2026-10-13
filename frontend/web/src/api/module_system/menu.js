import { request } from "@/utils/request";

const API_PATH = "/system/menu";

export const MenuAPI = {
  tree() {
    return request({ url: `${API_PATH}/tree`, method: "get" });
  },
  list(query) {
    return request({ url: `${API_PATH}/list`, method: "get", params: query });
  },
  detail(id) {
    return request({ url: `${API_PATH}/detail/${id}`, method: "get" });
  },
  create(body) {
    return request({ url: `${API_PATH}/create`, method: "post", data: body });
  },
  update(id, body) {
    return request({ url: `${API_PATH}/update/${id}`, method: "put", data: body });
  },
  delete(ids) {
    return request({ url: `${API_PATH}/delete`, method: "delete", data: { ids } });
  },
};
