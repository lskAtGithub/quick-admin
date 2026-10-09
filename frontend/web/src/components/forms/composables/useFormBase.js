import { computed, toRaw } from "vue";
import { calculateResponsiveSpan } from "@/utils/form.js";

const ROOT_PROPS = ["label", "labelWidth", "key", "type", "hidden", "span", "slots"];
const DATE_PICKER_TYPES = ["date", "daterange", "datetime", "datetimerange", "monthrange"];

export const cloneModelValue = (value) => {
  if (!value) return {};
  const deepClone = (source) => {
    if (Array.isArray(source)) return source.map((item) => deepClone(item));
    if (source && typeof source === "object") {
      const rawSource = toRaw(source);
      return Object.keys(rawSource).reduce((acc, key) => {
        acc[key] = deepClone(rawSource[key]);
        return acc;
      }, {});
    }
    return source;
  };
  return deepClone(toRaw(value));
};

export const sanitizeOutputValue = (value, options) => {
  if (Array.isArray(value)) {
    const sanitizedArray = value.map((item) => sanitizeOutputValue(item, options)).filter((item) => item !== undefined);
    return sanitizedArray.length === 0 && options.removeEmptyArray ? undefined : sanitizedArray;
  }
  if (value && typeof value === "object") {
    const rawValue = toRaw(value);
    const sanitizedObject = Object.entries(rawValue).reduce((acc, [key, item]) => {
      const sanitizedItem = sanitizeOutputValue(item, options);
      if (sanitizedItem !== undefined) acc[key] = sanitizedItem;
      return acc;
    }, {});
    return Object.keys(sanitizedObject).length === 0 && options.removeEmptyObject ? undefined : sanitizedObject;
  }
  if (typeof value === "string") {
    if (options.removeEmptyString && value.trim() === "") return undefined;
    return value;
  }
  if (value === 0) return options.keepZero ? value : undefined;
  if (value === false) return options.keepFalse ? value : undefined;
  return value ?? undefined;
};

export const useSanitizeOutputOptions = (sanitizeOutput) => {
  return computed(() => ({
    removeEmptyString: true,
    removeEmptyArray: true,
    removeEmptyObject: true,
    removeEmptyRichText: true,
    keepZero: true,
    keepFalse: true,
    ...sanitizeOutput,
  }));
};

export const getProps = (item) => {
  if (item.props) {
    const props = { ...item.props };
    if (item.type && DATE_PICKER_TYPES.includes(item.type) && !props.type) props.type = item.type;
    return props;
  }
  const props = { ...item };
  ROOT_PROPS.forEach((key) => delete props[key]);
  if (item.type && DATE_PICKER_TYPES.includes(item.type) && !props.type) props.type = item.type;
  return props;
};

export const getSlots = (item) => {
  if (!item.slots) return {};
  const validSlots = {};
  Object.entries(item.slots).forEach(([key, slotFn]) => {
    if (slotFn) validSlots[key] = slotFn;
  });
  return validSlots;
};

export const getColSpan = (itemSpan, span, breakpoint) => {
  return calculateResponsiveSpan(itemSpan, span, breakpoint);
};
