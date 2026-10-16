// 百度翻译 API 凭据（https://fanyi-api.baidu.com/ 注册后填入）与语种、限流参数
export default {
  BAIDU_FANYI: {
    APP_ID: 'your_app_id',
    SECRET: 'your_secret_key',
    API_URL: 'https://fanyi-api.baidu.com/api/trans/vip/translate'
  },
  SOURCE: 'zh',
  // code：langs/<code>.json 文件名；baidu：百度 API 的 to 参数，两者并不总是一致
  // 标注※的语种需在百度翻译控制台开通对应翻译权限（通用版/高级版），未开通时脚本会报 58050 并中止
  LANGUAGES: [
    { code: 'en', baidu: 'en', label: 'English 英语' },
    { code: 'ja', baidu: 'jp', label: '日本語 日语' },
    { code: 'ko', baidu: 'kor', label: '한국어 韩语' },
    { code: 'fr', baidu: 'fra', label: 'Français 法语' },
    { code: 'de', baidu: 'de', label: 'Deutsch 德语' },
    { code: 'es', baidu: 'spa', label: 'Español 西班牙语' },
    { code: 'ru', baidu: 'ru', label: 'Русский 俄语' },
    { code: 'pt', baidu: 'pt', label: 'Português 葡萄牙语' },
    { code: 'it', baidu: 'it', label: 'Italiano 意大利语' },
    { code: 'nl', baidu: 'nl', label: 'Nederlands 荷兰语' },
    { code: 'pl', baidu: 'pl', label: 'Polski 波兰语' },
    { code: 'vi', baidu: 'vie', label: 'Tiếng Việt 越南语 ※' },
    { code: 'th', baidu: 'th', label: 'ไทย 泰语 ※' },
    { code: 'id', baidu: 'id', label: 'Bahasa Indonesia 印度尼西亚语' },
    { code: 'ms', baidu: 'may', label: 'Bahasa Melayu 马来西亚语 ※' },
    { code: 'ar', baidu: 'ara', label: 'العربية 阿拉伯语 ※（RTL，需前端另行适配）' },
    { code: 'hi', baidu: 'hi', label: 'हिन्दी 印地语 ※' }
  ],
  MAX_BATCH_CHARS: 1000,
  BATCH_INTERVAL_MS: 600,
  RETRY_TIMES: 3
};
