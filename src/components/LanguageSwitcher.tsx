import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'zh-cn', label: '中文' },
  ]

  const current = i18n.language

  return (
    <div className="lang-switcher">
      <span className="lang-label">{t('language')}:</span>
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={`lang-btn${current === lang.code ? ' active' : ''}`}
          onClick={() => i18n.changeLanguage(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
