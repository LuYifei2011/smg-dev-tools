import { useTranslation } from 'react-i18next'
import i18n from '../i18n'

export default function LanguageSwitcher() {
  const { t } = useTranslation()

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'zh-cn', label: '中文' },
  ]

  return (
    <div className="lang-switcher">
      <span className="lang-label">{t('language')}:</span>
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={`lang-btn${i18n.language === lang.code ? ' active' : ''}`}
          onClick={() => i18n.changeLanguage(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
