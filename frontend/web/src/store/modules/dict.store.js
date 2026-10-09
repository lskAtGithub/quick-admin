import { defineStore } from "pinia";
import { ref, computed } from "vue";

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

  const loadDict = async (_types) => {
    // 后端字典接口暂未接入，保留入口
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
