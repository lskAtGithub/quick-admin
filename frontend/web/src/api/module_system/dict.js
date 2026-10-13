import { request } from "@/utils/request";

const TYPE_PATH = "/system/dict/type";
const DATA_PATH = "/system/dict/data";

const DictAPI = {
  listType(query) {
    return request({ url: `${TYPE_PATH}/list`, method: "get", params: query });
  },
  detailType(id) {
    return request({ url: `${TYPE_PATH}/detail/${id}`, method: "get" });
  },
  createType(body) {
    return request({ url: `${TYPE_PATH}/create`, method: "post", data: body });
  },
  updateType(id, body) {
    return request({ url: `${TYPE_PATH}/update/${id}`, method: "put", data: body });
  },
  deleteType(body) {
    return request({ url: `${TYPE_PATH}/delete`, method: "delete", data: body });
  },
  listData(query) {
    return request({ url: `${DATA_PATH}/list`, method: "get", params: query });
  },
  listDataByType(dictType) {
    return request({ url: `${DATA_PATH}/type/${dictType}`, method: "get" });
  },
  detailData(id) {
    return request({ url: `${DATA_PATH}/detail/${id}`, method: "get" });
  },
  createData(body) {
    return request({ url: `${DATA_PATH}/create`, method: "post", data: body });
  },
  updateData(id, body) {
    return request({ url: `${DATA_PATH}/update/${id}`, method: "put", data: body });
  },
  deleteData(body) {
    return request({ url: `${DATA_PATH}/delete`, method: "delete", data: body });
  },
};

export default DictAPI;
