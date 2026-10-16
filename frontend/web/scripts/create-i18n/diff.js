// 以 zh.json 为真源与目标语言文件做结构 diff：收集缺失叶子、多余路径，并按 zh 键序合并译文

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// zh.json 全部可译字符串叶子数（对象叶子 + 数组字符串元素）
export function countStringLeaves(data) {
  let n = 0;
  for (const val of Object.values(data)) {
    if (typeof val === 'string') n++;
    else if (isObj(val)) n += countStringLeaves(val);
    else if (Array.isArray(val)) n += val.reduce((s, item) => s + (typeof item === 'string' ? 1 : isObj(item) ? countStringLeaves(item) : 0), 0);
  }
  return n;
}

// zh 里有、目标缺失（或值类型不对）的字符串叶子 → [{ path, text }]
export function collectMissing(zh, target, prefix = '', out = []) {
  for (const [key, zhVal] of Object.entries(zh)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const tgtVal = target?.[key];
    if (typeof zhVal === 'string') {
      if (typeof tgtVal !== 'string') out.push({ path, text: zhVal });
    } else if (isObj(zhVal)) {
      collectMissing(zhVal, isObj(tgtVal) ? tgtVal : undefined, path, out);
    } else if (Array.isArray(zhVal)) {
      zhVal.forEach((item, i) => {
        const itemPath = `${path}.${i}`;
        const tgtItem = Array.isArray(tgtVal) ? tgtVal[i] : undefined;
        if (typeof item === 'string' && typeof tgtItem !== 'string') out.push({ path: itemPath, text: item });
        else if (isObj(item)) collectMissing(item, isObj(tgtItem) ? tgtItem : undefined, itemPath, out);
      });
    }
  }
  return out;
}

// 目标里有、zh 里没有的顶层路径（只报告不删除）
export function collectExtra(zh, target, prefix = '', out = []) {
  for (const [key, tgtVal] of Object.entries(target)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const zhVal = zh?.[key];
    if (zhVal === undefined) out.push(path);
    else if (isObj(zhVal) && isObj(tgtVal)) collectExtra(zhVal, tgtVal, path, out);
  }
  return out;
}

// 按 zh 结构与键序生成结果：新译文 > 目标已有值 > 省略（对象叶子）/回退原文（数组元素）；目标多余的键原样追加在尾部
export function merge(zh, target, translated, prefix = '') {
  if (typeof zh === 'string') {
    const path = prefix;
    if (translated.has(path)) return translated.get(path);
    return typeof target === 'string' ? target : undefined;
  }
  if (!isObj(zh) && !Array.isArray(zh)) return zh;

  if (Array.isArray(zh)) {
    return zh.map((item, i) => {
      const path = `${prefix}.${i}`;
      const tgtItem = Array.isArray(target) ? target[i] : undefined;
      if (typeof item === 'string') return translated.get(path) ?? (typeof tgtItem === 'string' ? tgtItem : item);
      if (isObj(item)) return merge(item, isObj(tgtItem) ? tgtItem : undefined, translated, path);
      return item;
    });
  }

  const result = {};
  for (const [key, zhVal] of Object.entries(zh)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = merge(zhVal, target?.[key], translated, path);
    if (value !== undefined) result[key] = value;
  }
  // 保留目标文件中的多余键，置于本层末尾
  if (isObj(target)) {
    for (const [key, tgtVal] of Object.entries(target)) {
      if (!(key in zh)) result[key] = tgtVal;
    }
  }
  return result;
}
