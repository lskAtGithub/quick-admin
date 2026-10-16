import CryptoJS from 'crypto-js';
import CONFIG from './config.js';

const { APP_ID, SECRET, API_URL } = CONFIG.BAIDU_FANYI;

// 仅瞬时性错误重试（限流/服务瞬时拿不到结果）；配置类错误直接中止并给出人话提示
const RETRYABLE_CODES = new Set(['54003', '58001']);

const ERROR_HINTS = {
  '52000': 'APP_ID 无效或缺失，检查 config.js',
  '52003': '该账户未开通此 API',
  '54001': '鉴权失败，通常是 SECRET 错误或 APP_ID/SECRET 互换，检查 config.js',
  '54002': '单次请求 q 超过 6000 字节，调小 config.js 的 MAX_BATCH_CHARS',
  '58050': '账号未开通该语言对（高级/大模型翻译未授权）',
  '58060': '百度翻译账户余额不足',
  '90117': '该语言对不支持'
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 翻译前把 vue-i18n 占位符换成无词典含义的编号哨兵 [n0]，避免引擎把占位符名（如 kind）当单词译掉
export const wrapPlaceholders = (text) => {
  let i = 0;
  return text.replace(/\{([A-Za-z0-9_]+)\}/g, () => `[n${i++}]`);
};

export const unwrapPlaceholders = (text, sourceText) => {
  const names = [...sourceText.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((m) => m[1]);
  if (!names.length) return text;
  const toPh = (raw, idx) => (names[+idx] !== undefined ? `{${names[+idx]}}` : raw);
  // 带括号形态（含全角/空格变体、大小写漂移）还原；再兑底引擎吞掉方括号的裸 n0 形态
  let out = text.replace(/[[［【]\s*[nN](\d+)\s*[\]］】]/g, toPh);
  out = out.replace(/\b[nN](\d+)\b/g, toPh);
  for (const n of [...new Set(names)]) {
    const expect = (sourceText.match(new RegExp(`\\{${n}\\}`, 'g')) || []).length;
    const actual = (out.match(new RegExp(`\\{${n}\\}`, 'g')) || []).length;
    if (actual < expect) throw new Error(`占位符 {${n}} 在译文中丢失`);
  }
  return out;
};

async function requestOnce(query, toLang) {
  const salt = Date.now().toString();
  // 百度签名规则：MD5(appid + q + salt + key) 小写
  const sign = CryptoJS.MD5(APP_ID + query + salt + SECRET).toString();
  const url = `${API_URL}?${new URLSearchParams({ appid: APP_ID, q: query, from: CONFIG.SOURCE, to: toLang, salt, sign })}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { retryable: res.status >= 500 || res.status === 429 });
  const data = await res.json();
  if (data.error_code) {
    const code = String(data.error_code);
    const hint = ERROR_HINTS[code] || data.error_msg || '未知错误';
    throw Object.assign(new Error(`百度 API ${code}：${hint}`), { retryable: RETRYABLE_CODES.has(code) });
  }
  return data.trans_result.map((item) => item.dst);
}

async function requestWithRetry(query, toLang) {
  let lastErr;
  for (let i = 0; i < CONFIG.RETRY_TIMES; i++) {
    try {
      return await requestOnce(query, toLang);
    } catch (err) {
      lastErr = err;
      if (!err.retryable) throw err;
      await sleep(1000 * 2 ** i);
    }
  }
  throw lastErr;
}

// 整批按行合并请求；引擎偶尔会合并/拆分行，行数不符或可重试失败时逐条回退；占位符校验失败的条目返回 null
async function translateBatch(texts, toLang) {
  let lines = null;
  try {
    lines = await requestWithRetry(texts.map(wrapPlaceholders).join('\n'), toLang);
  } catch (err) {
    if (!err.retryable) throw err;
  }
  if (!lines || lines.length !== texts.length) {
    lines = [];
    for (const text of texts) {
      const one = await requestWithRetry(wrapPlaceholders(text), toLang);
      lines.push(one[0] ?? '');
    }
  }
  return texts.map((src, i) => {
    try {
      return unwrapPlaceholders(lines[i], src);
    } catch {
      return null;
    }
  });
}

// 按累计字符数切批、顺序请求并保持批间限速，返回 { translated: Map(path→text), failed: [] }
async function runBatches(items, toLang, onProgress) {
  const { MAX_BATCH_CHARS, BATCH_INTERVAL_MS } = CONFIG;
  const batches = [];
  let current = [];
  let chars = 0;
  for (const item of items) {
    const len = item.text.length;
    if (current.length > 0 && chars + len > MAX_BATCH_CHARS) {
      batches.push(current);
      current = [];
      chars = 0;
    }
    current.push(item);
    chars += len;
  }
  if (current.length) batches.push(current);

  const translated = new Map();
  const failed = [];
  let done = 0;
  for (let b = 0; b < batches.length; b++) {
    if (b > 0) await sleep(BATCH_INTERVAL_MS);
    const batch = batches[b];
    const texts = batch.map((item) => item.text);
    try {
      const results = await translateBatch(texts, toLang);
      batch.forEach((item, i) => {
        if (results[i] == null) failed.push({ path: item.path, text: item.text, reason: '译文占位符校验失败' });
        else translated.set(item.path, results[i]);
      });
    } catch (err) {
      if (!err.retryable) throw err;
      batch.forEach((item) => failed.push({ path: item.path, text: item.text, reason: err.message }));
    }
    done += batch.length;
    onProgress?.(done, items.length);
  }
  return { translated, failed };
}

const PH_ONLY = /^\{[A-Za-z0-9_]+\}$/;

// 占位符句哨兵校验失败时的兑底：拆出占位符之间的纯文本片段单独翻译（无任何哨兵，语种无关），再按原位置拼回
export async function translateAll(items, toLang, onProgress) {
  const { translated, failed } = await runBatches(items, toLang, onProgress);
  const finalFailed = [];
  const fragJobs = new Map();
  const fragItems = [];
  for (const f of failed) {
    if (!f.text.includes('{')) {
      finalFailed.push(f);
      continue;
    }
    const parts = f.text.split(/(\{[A-Za-z0-9_]+\})/).filter((p) => p !== '');
    const jobs = [];
    parts.forEach((p, i) => {
      if (PH_ONLY.test(p)) return;
      const job = { path: `${f.path}@@${i}`, text: p };
      jobs.push(job);
      fragItems.push(job);
    });
    fragJobs.set(f.path, { parts, jobs });
  }
  if (!fragItems.length) return { translated, failed: finalFailed };

  const { translated: fragMap, failed: fragFailed } = await runBatches(fragItems, toLang, null);
  const brokenOwners = new Set(fragFailed.map((x) => x.path.split('@@')[0]));
  for (const [path, { parts, jobs }] of fragJobs) {
    if (brokenOwners.has(path)) {
      const src = failed.find((f) => f.path === path);
      finalFailed.push({ path, text: src.text, reason: '片段回退翻译失败' });
      continue;
    }
    let k = 0;
    translated.set(
      path,
      parts.map((p) => (PH_ONLY.test(p) ? p : fragMap.get(jobs[k++].path))).join('')
    );
  }
  return { translated, failed: finalFailed };
}
