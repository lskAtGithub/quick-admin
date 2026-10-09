<template>
  <section class="px-4 pb-0 pt-4 md:px-4 md:pt-4">
    <ElScrollbar v-if="scrollbar" :max-height="maxHeight" :view-style="{ overflowX: 'hidden' }">
      <ElForm ref="formRef" :model="modelValue" :label-position="labelPosition" v-bind="{ ...$attrs }">
        <ElRow class="flex flex-wrap" :gutter="gutter">
          <ElCol
            v-for="item in visibleFormItems"
            :key="item.key"
            :xs="getColSpan(item.span, 'xs')"
            :sm="getColSpan(item.span, 'sm')"
            :md="getColSpan(item.span, 'md')"
            :lg="getColSpan(item.span, 'lg')"
            :xl="getColSpan(item.span, 'xl')"
          >
            <ElFormItem
              :prop="item.key"
              :label="typeof item.label === 'string' ? item.label : undefined"
              :label-width="item.label ? item.labelWidth || labelWidth : undefined"
            >
              <template v-if="item.label && typeof item.label !== 'string'" #label>
                <component :is="item.label" />
              </template>
              <slot :name="item.key" :item="item" :modelValue="modelValue">
                <component
                  :is="getComponent(item)"
                  :model-value="getFieldValue(item.key)"
                  @update:model-value="setFieldValue(item.key, $event)"
                  v-bind="getProps(item)"
                >
                  <template v-if="item.type === 'select' && getProps(item)?.options">
                    <ElOption
                      v-for="option in getProps(item).options"
                      v-bind="option"
                      :key="option.value"
                    />
                  </template>
                  <template v-if="item.type === 'checkboxgroup' && getProps(item)?.options">
                    <ElCheckbox
                      v-for="option in getProps(item).options"
                      v-bind="option"
                      :key="option.value"
                    />
                  </template>
                  <template v-if="item.type === 'radiogroup' && getProps(item)?.options">
                    <ElRadio
                      v-for="option in getProps(item).options"
                      v-bind="option"
                      :key="option.value"
                    />
                  </template>
                  <!-- eslint-disable-next-line vue/no-v-for-template-key -->
                  <template v-for="(slotFn, slotName) in getSlots(item)" :key="slotName" #[slotName]>
                    <component :is="slotFn" />
                  </template>
                </component>
              </slot>
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="24" :md="span" :lg="span" :xl="span" class="max-w-full flex-1">
            <div
              class="mb-3 flex items-center flex-wrap justify-end md:flex-row md:items-stretch md:gap-2"
              :style="actionButtonsStyle"
            >
              <div class="flex gap-2 md:justify-center">
                <ElButton v-if="showReset" class="reset-button" @click="handleReset" v-ripple>
                  {{ t("table.form.reset") }}
                </ElButton>
                <ElButton
                  v-if="showSubmit"
                  type="primary"
                  class="submit-button"
                  @click="handleSubmit"
                  v-ripple
                  :disabled="disabledSubmit"
                  :loading="loading"
                >
                  {{ t("table.form.submit") }}
                </ElButton>
              </div>
            </div>
          </ElCol>
        </ElRow>
      </ElForm>
    </ElScrollbar>
    <ElForm v-else ref="formRef" :model="modelValue" :label-position="labelPosition" v-bind="{ ...$attrs }">
      <ElRow class="flex flex-wrap" :gutter="gutter">
        <ElCol
          v-for="item in visibleFormItems"
          :key="item.key"
          :xs="getColSpan(item.span, 'xs')"
          :sm="getColSpan(item.span, 'sm')"
          :md="getColSpan(item.span, 'md')"
          :lg="getColSpan(item.span, 'lg')"
          :xl="getColSpan(item.span, 'xl')"
        >
          <ElFormItem
            :prop="item.key"
            :label="typeof item.label === 'string' ? item.label : undefined"
            :label-width="item.label ? item.labelWidth || labelWidth : undefined"
          >
            <template v-if="item.label && typeof item.label !== 'string'" #label>
              <component :is="item.label" />
            </template>
            <slot :name="item.key" :item="item" :modelValue="modelValue">
              <component
                :is="getComponent(item)"
                :model-value="getFieldValue(item.key)"
                @update:model-value="setFieldValue(item.key, $event)"
                v-bind="getProps(item)"
              >
                <template v-if="item.type === 'select' && getProps(item)?.options">
                  <ElOption
                    v-for="option in getProps(item).options"
                    v-bind="option"
                    :key="option.value"
                  />
                </template>
                <template v-if="item.type === 'checkboxgroup' && getProps(item)?.options">
                  <ElCheckbox
                    v-for="option in getProps(item).options"
                    v-bind="option"
                    :key="option.value"
                  />
                </template>
                <template v-if="item.type === 'radiogroup' && getProps(item)?.options">
                  <ElRadio
                    v-for="option in getProps(item).options"
                    v-bind="option"
                    :key="option.value"
                  />
                </template>
                <!-- eslint-disable-next-line vue/no-v-for-template-key -->
                <template v-for="(slotFn, slotName) in getSlots(item)" :key="slotName" #[slotName]>
                  <component :is="slotFn" />
                </template>
              </component>
            </slot>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="span" :lg="span" :xl="span" class="max-w-full flex-1">
          <div
            class="mb-3 flex items-center flex-wrap justify-end md:flex-row md:items-stretch md:gap-2"
            :style="actionButtonsStyle"
          >
            <div class="flex gap-2 md:justify-center">
              <ElButton v-if="showReset" class="reset-button" @click="handleReset" v-ripple>
                {{ t("table.form.reset") }}
              </ElButton>
              <ElButton
                v-if="showSubmit"
                type="primary"
                class="submit-button"
                @click="handleSubmit"
                v-ripple
                :disabled="disabledSubmit"
                :loading="loading"
              >
                {{ t("table.form.submit") }}
              </ElButton>
            </div>
          </div>
        </ElCol>
      </ElRow>
    </ElForm>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import {
  ElCascader,
  ElCheckbox,
  ElCheckboxGroup,
  ElInput,
  ElInputNumber,
  ElRadioGroup,
  ElRate,
  ElSelect,
  ElSlider,
  ElSwitch,
  ElTimePicker,
  ElTimeSelect,
  ElTreeSelect,
} from "element-plus";
import {
  cloneModelValue,
  sanitizeOutputValue,
  getProps,
  getSlots,
  getColSpan,
  useSanitizeOutputOptions,
} from "../composables/useFormBase.js";

defineOptions({ name: "QaForm" });

const componentMap = {
  input: ElInput,
  number: ElInputNumber,
  select: ElSelect,
  switch: ElSwitch,
  checkbox: ElCheckbox,
  checkboxgroup: ElCheckboxGroup,
  radiogroup: ElRadioGroup,
  rate: ElRate,
  slider: ElSlider,
  cascader: ElCascader,
  timepicker: ElTimePicker,
  timeselect: ElTimeSelect,
  treeselect: ElTreeSelect,
};

const { t } = useI18n();
const formRef = ref(null);

const props = defineProps({
  items: { type: Array, default: () => [] },
  span: { type: Number, default: 6 },
  gutter: { type: Number, default: 12 },
  labelPosition: { type: String, default: "right" },
  labelWidth: { type: [String, Number], default: "70px" },
  buttonLeftLimit: { type: Number, default: 2 },
  showReset: { type: Boolean, default: false },
  showSubmit: { type: Boolean, default: false },
  disabledSubmit: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  sanitizeOutput: { type: Object, default: () => ({}) },
  scrollbar: { type: Boolean, default: false },
  maxHeight: { type: String, default: "75vh" },
});

const emit = defineEmits(["reset", "submit"]);

const modelValue = defineModel({ default: {} });
const initialModelValue = ref({});

initialModelValue.value = cloneModelValue(modelValue.value);
const sanitizeOutputOptions = useSanitizeOutputOptions(props.sanitizeOutput);

const getColSpanWrapper = (itemSpan, breakpoint) => getColSpan(itemSpan, props.span, breakpoint);

const PATH_NUMBER_RE = /^\d+$/;

const parsePath = (path) => {
  return path.split(".").filter(Boolean).map((segment) => (PATH_NUMBER_RE.test(segment) ? Number(segment) : segment));
};

const getFieldValue = (path) => {
  return parsePath(path).reduce((currentValue, segment) => {
    if (currentValue == null) return undefined;
    return currentValue[segment];
  }, modelValue.value);
};

const deleteFieldValue = (path) => {
  const segments = parsePath(path);
  if (!segments.length) return;
  const lastSegment = segments.pop();
  const parent = segments.reduce((currentValue, segment) => {
    if (currentValue == null) return undefined;
    return currentValue[segment];
  }, modelValue.value);
  if (parent != null && lastSegment !== undefined) delete parent[lastSegment];
};

const setFieldValue = (path, value) => {
  const normalizedValue = value === "" ? undefined : value;
  const segments = parsePath(path);
  if (!segments.length) return;
  if (normalizedValue === undefined) {
    deleteFieldValue(path);
    return;
  }
  let currentValue = modelValue.value;
  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    if (isLast) {
      currentValue[segment] = normalizedValue;
      return;
    }
    const nextSegment = segments[index + 1];
    const nextContainer = typeof nextSegment === "number" ? [] : {};
    if (currentValue[segment] === null || currentValue[segment] === undefined || typeof currentValue[segment] !== "object") {
      currentValue[segment] = nextContainer;
    }
    currentValue = currentValue[segment];
  });
};

const getSanitizedOutput = () => {
  return sanitizeOutputValue(cloneModelValue(modelValue.value), sanitizeOutputOptions.value) || {};
};

const getComponent = (item) => {
  if (item.render) return item.render;
  const { type } = item;
  const comp = componentMap[type];
  if (!comp) {
    console.warn(`[QaForm] 未知表单类型 "${type}"，回退到 input`, item);
    return componentMap.input;
  }
  return comp;
};

const visibleFormItems = computed(() => props.items.filter((item) => !item.hidden));

const actionButtonsStyle = computed(() => {
  if (visibleFormItems.value.length <= props.buttonLeftLimit) {
    return { justifyContent: "flex-start" };
  }
  return undefined;
});

const handleReset = () => {
  formRef.value?.resetFields();
  Object.keys(modelValue.value).forEach((key) => delete modelValue.value[key]);
  Object.assign(modelValue.value, cloneModelValue(initialModelValue.value));
  emit("reset");
};

const handleSubmit = () => {
  emit("submit", getSanitizedOutput());
};

defineExpose({
  ref: formRef,
  validate: (...args) => formRef.value?.validate(...args),
  resetFields: (...args) => formRef.value?.resetFields(...args),
  clearValidate: (...args) => formRef.value?.clearValidate(...args),
  validateField: (...args) => formRef.value?.validateField(...args),
  reset: handleReset,
  getOutput: getSanitizedOutput,
});

const { span, gutter, labelPosition, labelWidth } = toRefs(props);
</script>
