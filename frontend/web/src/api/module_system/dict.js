import { request } from "@/utils/request";

const TYPE_API = "/system/dict/type";
const DATA_API = "/system/dict/data";

export const DictAPI = {
  // 字典类型
  typeList(query) {
    return request({ url: `${TYPE_API}/list`, method: "get", params: query });
  },
  typeDetail(id) {
    return request({ url: `${TYPE_API}/${id}`, method: "get" });
  },
  typeCreate(body) {
    return request({ url: TYPE_API, method: "post", data: body });
  },
  typeUpdate(id, body) {
    return request({ url: `${TYPE_API}/${id}`, method: "put", data: body });
  },
  typeDelete(ids) {
    return request({ url: `${TYPE_API}/delete`, method: "post", data: { ids } });
  },
  // 字典数据
  dataList(query) {
    return request({ url: `${DATA_API}/list`, method: "get", params: query });
  },
  dataByType(dictType) {
    return request({ url: `${DATA_API}/type/${dictType}`, method: "get" });
  },
  dataDetail(id) {
    return request({ url: `${DATA_API}/${id}`, method: "get" });
  },
  dataCreate(body) {
    return request({ url: DATA_API, method: "post", data: body });
  },
  dataUpdate(id, body) {
    return request({ url: `${DATA_API}/${id}`, method: "put", data: body });
  },
  dataDelete(ids) {
    return request({ url: `${DATA_API}/delete`, method: "post", data: { ids } });
  },
};
