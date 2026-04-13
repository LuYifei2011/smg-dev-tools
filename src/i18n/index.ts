import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import zhCn from './locales/zh-cn.json'

const savedLang =
  typeof localStorage !== 'undefined'
    ? localStorage.getItem('smg-dev-tools-lang') ?? ''
    : ''

const detectedLang = savedLang ||
  (typeof navigator !== 'undefined'
    ? navigator.language.toLowerCase().replace(/_/g, '-')
    : '')

// Resolve to a supported language; prefer zh-cn for any zh-* variant
let initialLng: string
if (detectedLang === 'zh-cn' || detectedLang.startsWith('zh')) {
  initialLng = 'zh-cn'
} else {
  initialLng = 'en'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'zh-cn': { translation: zhCn },
    },
    lng: initialLng,
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh-cn'],
    // Force synchronous initialization so components always see the
    // correct language on first render (resources are bundled inline).
    initImmediate: false,
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
