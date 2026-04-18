import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'

interface HeaderProps {
  showBack?: boolean
  title?: string
}

export default function Header({ showBack = false, title }: HeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="site-header">
      <div className="header-left">
        <Link to="/" className="header-logo">
          <span className="header-title">{t('appName')}</span>
          <span className="dev-badge">{t('devBadge')}</span>
        </Link>
        {title && <span className="header-page-title">{title}</span>}
      </div>
      <div className="header-right">
        <LanguageSwitcher />
        {showBack && (
          <a href="/" className="header-link">
            {t('backToSite')}
          </a>
        )}
      </div>
    </header>
  )
}
