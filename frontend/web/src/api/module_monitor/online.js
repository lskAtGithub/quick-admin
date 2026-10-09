import { request } from "@/utils/request";

const API_PATH = "/monitor/online";

const OnlineAPI = {
  listOnline(query) {
    return request({
      url: `${API_PATH}/list`,
      method: "get",
      params: query,
    });
  },
  deleteOnline(body) {
    return request({
      url: `${API_PATH}/delete`,
      method: "delete",
      data: body,
    });
  },
  listCurrentOnline() {
    return request({
      url: `${API_PATH}/current`,
      method: "get",
    });
  },
  clearOnline() {
    return request({
      url: `${API_PATH}/clear`,
      method: "delete",
    });
  },
};

export default OnlineAPI;
