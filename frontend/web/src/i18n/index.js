import { createI18n } from 'vue-i18n';
import { LanguageEnum } from '@/enums/appEnum';
import zh from './langs/zh.json';

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: LanguageEnum.ZH,
  fallbackLocale: LanguageEnum.ZH,
  messages: { zh }
});

export const $t = (key) => i18n.global.t(key);

export const languageOptions = [
  { value: LanguageEnum.ZH, label: '简体中文' },
  { value: LanguageEnum.EN, label: 'English' }
];

export function initI18n(app) {
  app.use(i18n);
}

export { LanguageEnum };
export default i18n;
