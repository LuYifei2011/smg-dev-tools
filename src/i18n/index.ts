import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import zhCn from './locales/zh-cn.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'zh-cn': { translation: zhCn },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh-cn'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'smg-dev-tools-lang',
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
