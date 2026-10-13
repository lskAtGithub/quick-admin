import { defineStore } from "pinia";
import { ref, computed } from "vue";
import DictAPI from "@/api/module_system/dict";

export const useDictStore = defineStore("dictStore", () => {
  const dictData = ref({});
  const isLoaded = ref(false);
  const getDictData = computed(() => dictData.value);

  const getDictArray = (type) => {
    return (dictData.value[type] || [])
      .filter((item) => item.dict_value !== undefined && item.dict_label !== undefined)
      .map((item) => ({ dict_value: item.dict_value, dict_label: item.dict_label }));
  };

  const getDictLabel = (type, value) => {
    const item = (dictData.value[type] || []).find((d) => d.dict_value === value);
    return item?.dict_label || value;
  };

  const loadDict = async (types) => {
    if (!types || types.length === 0) return;
    const toLoad = types.filter((t) => !dictData.value[t]);
    if (toLoad.length === 0) return;
    const results = await Promise.all(toLoad.map((t) => DictAPI.listDataByType(t)));
    results.forEach((res, idx) => {
      if (res.code === 0) {
        dictData.value[toLoad[idx]] = res.data ?? [];
      }
    });
    isLoaded.value = true;
  };

  const clearDict = () => {
    dictData.value = {};
    isLoaded.value = false;
  };

  return {
    dictData,
    isLoaded,
    getDictData,
    getDictArray,
    getDictLabel,
    loadDict,
    clearDict,
  };
});
