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

  const isBuilding = status.building
  const isPending = status.pending

  let statusClass = 'build-status-ready'
  let statusText = t('buildStatus.ready')

  if (isBuilding) {
    statusClass = 'build-status-building'
    statusText = t('buildStatus.building')
  } else if (isPending) {
    statusClass = 'build-status-waiting'
    statusText = t('buildStatus.waiting')
  }

  const lastBuildDate =
    status.lastBuildTime > 0 ? new Date(status.lastBuildTime).toLocaleTimeString() : null

  return (
    <div className={`build-status ${statusClass}`}>
      <span className={`build-dot${isBuilding || isPending ? ' build-dot-pulse' : ''}`} />
      <span>
        {statusText}
        {!isBuilding && !isPending && lastBuildDate && (
          <span className="build-time">
            {' '}— {t('buildStatus.lastBuild')}{lastBuildDate}
          </span>
        )}
      </span>
    </div>
  )
}
