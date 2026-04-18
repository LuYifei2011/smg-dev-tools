import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import zhCn from './locales/zh-cn.json'

const savedLang =
  typeof localStorage !== 'undefined'
    ? localStorage.getItem('smg-dev-tools-lang') ?? ''
    : ''

const initialLng = savedLang ||
  (typeof navigator !== 'undefined'
    ? navigator.language.toLowerCase().replace(/_/g, '-')
    : '')

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'zh-CN': { translation: zhCn },
    },
    lng: initialLng,
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh-CN'],
    interpolation: {
      escapeValue: false,
    },
  })

// Persist language changes
i18n.on('languageChanged', (lng) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('smg-dev-tools-lang', lng)
  }
})

export default i18n
