import { request } from "@/utils/request";

const API_PATH = "/system/param";

const ParamsAPI = {
  getInitConfig() {
    return request({
      url: `${API_PATH}/info`,
      method: "get",
    });
  },
  updateParam(id, body) {
    return request({
      url: `${API_PATH}/update/${id}`,
      method: "put",
      data: body,
    });
  },
};

export default ParamsAPI;
