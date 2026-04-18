import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { api, ModuleDetail } from '../../api/client'
import { useToast } from '../../hooks/useToast'

interface AssetsTabProps {
  moduleId: string
  detail: ModuleDetail
  onChanged: () => void
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function AssetsTab({ moduleId, detail, onChanged }: AssetsTabProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const demoInputRef = useRef<HTMLInputElement>(null)
  const assetInputRef = useRef<HTMLInputElement>(null)

  const handleDemoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await api.demo.upload(moduleId, file)
      toast(t('toast.demoUploaded'))
      onChanged()
    } catch (err) {
      toast(t('toast.requestFailed', { message: (err as Error).message }), 'error')
    } finally {
      e.target.value = ''
    }
  }

  const handleDemoDelete = async () => {
    if (!confirm(t('editor.confirmDeleteDemo'))) return
    try {
      await api.demo.delete(moduleId)
      toast(t('toast.demoDeleted'))
      onChanged()
    } catch (err) {
      toast(t('toast.requestFailed', { message: (err as Error).message }), 'error')
    }
  }

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await api.assets.upload(moduleId, file)
      toast(t('toast.assetUploaded'))
      onChanged()
    } catch (err) {
      toast(t('toast.requestFailed', { message: (err as Error).message }), 'error')
    } finally {
      e.target.value = ''
    }
  }

  const handleAssetDelete = async (filename: string) => {
    if (!confirm(t('editor.confirmDeleteAsset', { filename }))) return
    try {
      await api.assets.delete(moduleId, filename)
      toast(t('toast.assetDeleted'))
      onChanged()
    } catch (err) {
      toast(t('toast.requestFailed', { message: (err as Error).message }), 'error')
    }
  }

  return (
    <div className="tab-content">
      {/* Demo section */}
      <section className="assets-section">
        <h3 className="assets-section-title">{t('editor.assets.demo')}</h3>
        <div className="demo-status">
          {detail.hasDemo ? (
            <span className="badge badge-demo">{t('editor.assets.demoUploaded')}</span>
          ) : (
            <span className="badge badge-empty">{t('editor.assets.noDemo')}</span>
          )}
        </div>
        <div className="assets-actions">
          <input
            ref={demoInputRef}
            type="file"
            accept=".sb3"
            style={{ display: 'none' }}
            onChange={handleDemoUpload}
          />
          <button className="btn btn-primary btn-sm" onClick={() => demoInputRef.current?.click()}>
            {t('editor.assets.uploadDemo')}
          </button>
          {detail.hasDemo && (
            <button className="btn btn-danger btn-sm" onClick={handleDemoDelete}>
              {t('editor.assets.deleteDemo')}
            </button>
          )}
        </div>
      </section>

      {/* Assets section */}
      <section className="assets-section">
        <h3 className="assets-section-title">{t('editor.assets.assets')}</h3>
        {detail.assets.length === 0 ? (
          <p className="assets-empty">{t('editor.assets.noAssets')}</p>
        ) : (
          <ul className="assets-list">
            {detail.assets.map((a) => (
              <li key={a.filename} className="asset-item">
                <span className="asset-filename">{a.filename}</span>
                <span className="asset-size">{formatBytes(a.size)}</span>
                <button
                  className="btn btn-danger btn-xs"
                  onClick={() => handleAssetDelete(a.filename)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="assets-actions">
          <input
            ref={assetInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleAssetUpload}
          />
          <button className="btn btn-primary btn-sm" onClick={() => assetInputRef.current?.click()}>
            {t('editor.assets.uploadAsset')}
          </button>
        </div>
      </section>
    </div>
  )
}
