import { useTranslation } from 'react-i18next'
import { useBuildStatus } from '../hooks/useBuildStatus'

export default function BuildStatus() {
  const { t } = useTranslation()
  const { status, error } = useBuildStatus()

  if (error) {
    return (
      <div className="build-status build-status-error">
        <span className="build-dot" />
        <span>{t('buildStatus.error')}</span>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="build-status build-status-loading">
        <span className="build-dot build-dot-pulse" />
        <span>{t('buildStatus.loading')}</span>
      </div>
    )
  }

  const statusClass = {
    building: 'build-status-building',
    ready: 'build-status-ready',
    waiting: 'build-status-waiting',
    error: 'build-status-error',
  }[status.status]

  const statusText = {
    building: t('buildStatus.building'),
    ready: t('buildStatus.ready'),
    waiting: t('buildStatus.waiting'),
    error: status.message || t('buildStatus.error'),
  }[status.status]

  return (
    <div className={`build-status ${statusClass}`}>
      <span className={`build-dot${status.status === 'building' ? ' build-dot-pulse' : ''}`} />
      <span>
        {statusText}
        {status.status === 'ready' && status.lastBuild && (
          <span className="build-time">
            {' '}— {t('buildStatus.lastBuild')}{status.lastBuild}
          </span>
        )}
      </span>
    </div>
  )
}
