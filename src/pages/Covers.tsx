import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api, ModuleSummary } from '../api/client'

const LOCALES = [
  { value: 'en', label: 'English (en)' },
  { value: 'zh-cn', label: '简体中文 (zh-cn)' },
  { value: 'zh-tw', label: '繁體中文 (zh-tw)' },
]

/**
 * Ensure a URL is a safe relative path constructed from known-safe inputs
 * (a controlled locale value + a module ID from the API).
 * Rejects anything that doesn't start with '/', strips characters outside the
 * URL path character set, and explicitly blocks path-traversal sequences.
 */
function safePath(path: string): string {
  if (!path.startsWith('/')) return '#'
  // Reject paths containing traversal sequences
  if (path.includes('..')) return '#'
  // Only allow characters valid in a URL path segment (RFC 3986)
  return path.replace(/[^a-zA-Z0-9\-._~/]/g, '')
}

interface CoverCard {
  id: string
  name: string
  coverUrl: string
  pageUrl: string
}

function CoverItem({ card, t }: { card: CoverCard; t: (key: string) => string }) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    setState('loading')
  }, [card.coverUrl])

  const coverSrc = safePath(card.coverUrl)
  const pageSrc = safePath(card.pageUrl)

  return (
    <div className="cover-card">
      <div className="cover-wrap">
        {state === 'loading' && <div className="cover-placeholder">…</div>}
        {state === 'error' && (
          <div className="cover-error">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9l4-4 4 4 4-4 4 4" />
              <circle cx="8.5" cy="13.5" r="1.5" />
            </svg>
            <span>{t('covers.coverMissing')}</span>
            <span className="cover-error-url">{coverSrc}</span>
          </div>
        )}
        <img
          key={card.coverUrl}
          className="cover-img"
          src={coverSrc}
          alt={card.name}
          style={{ display: state === 'ok' ? undefined : 'none' }}
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
        />
      </div>
      <div className="cover-card-info">
        <span className="cover-card-id">{card.id}</span>
        <span className="cover-card-name" title={card.name}>{card.name}</span>
        <div className="cover-card-actions">
          <a href={pageSrc} target="_blank" rel="noopener noreferrer">{t('covers.viewPage')}</a>
          <a href={coverSrc} target="_blank" rel="noopener noreferrer">{t('covers.rawImage')}</a>
        </div>
      </div>
    </div>
  )
}

export default function Covers() {
  const { t } = useTranslation()
  const [locale, setLocale] = useState('zh-cn')
  const [modules, setModules] = useState<ModuleSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api.modules
      .list()
      .then(setModules)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const homeName = locale === 'zh-tw' ? '首頁' : t('covers.homeName')
  const homeCard: CoverCard = {
    id: 'home',
    name: homeName,
    coverUrl: `/${locale}/cover.png`,
    pageUrl: `/${locale}/`,
  }

  const cards: CoverCard[] = modules.map((m) => ({
    id: m.id,
    name: m.name || m.id,
    coverUrl: `/${locale}/modules/${m.id}/cover.png`,
    pageUrl: `/${locale}/modules/${m.id}/`,
  }))

  return (
    <div className="page-covers">
      <div className="covers-toolbar">
        <span className="covers-toolbar-title">{t('covers.title')}</span>
        <Link to="/" className="covers-back">{t('covers.back')}</Link>
        <div className="covers-locale-group">
          <label htmlFor="covers-locale-select">{t('covers.locale')}</label>
          <select
            id="covers-locale-select"
            className="covers-locale-select"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
          >
            {LOCALES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
        {!loading && !error && (
          <span className="covers-stats">{t('covers.stats', { count: modules.length })}</span>
        )}
      </div>

      {loading ? (
        <div className="covers-loading">
          <div className="spinner" />
          <span>{t('covers.loading')}</span>
        </div>
      ) : error ? (
        <div className="covers-error-msg">
          {t('covers.loadError', { message: error })}
          <button className="btn btn-ghost btn-sm covers-retry" onClick={load}>
            {t('covers.retry')}
          </button>
        </div>
      ) : (
        <div className="covers-grid">
          {[homeCard, ...cards].map((card) => (
            <CoverItem key={card.id + locale} card={card} t={t} />
          ))}
        </div>
      )}
    </div>
  )
}
