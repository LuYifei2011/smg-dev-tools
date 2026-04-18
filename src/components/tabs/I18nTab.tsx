import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { api, I18nData } from '../../api/client'
import { useToast } from '../../hooks/useToast'

const COMMON_LOCALES = ['en', 'zh-cn', 'zh-tw', 'ja', 'ko', 'de', 'fr', 'es', 'pt']

const JSON_FIELDS: (keyof I18nData & string)[] = [
  'variables',
  'lists',
  'events',
  'scriptTitles',
  'procedures',
  'procedureParams',
]

interface I18nTabProps {
  moduleId: string
  availableLocales: string[]
  initialLocale: string | null
  onLocaleChange: (locale: string | null) => void
  onSaved: () => void
}

export default function I18nTab({
  moduleId,
  availableLocales,
  initialLocale,
  onLocaleChange,
  onSaved,
}: I18nTabProps) {
  const { t } = useTranslation()
  const { toast } = useToast()

  const [locale, setLocale] = useState<string>(initialLocale ?? '')
  const [data, setData] = useState<I18nData>({})
  const [jsonFields, setJsonFields] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  const allLocales = Array.from(new Set([...COMMON_LOCALES, ...availableLocales]))

  useEffect(() => {
    if (!locale) return
    setLoading(true)
    api.i18n
      .get(moduleId, locale)
      .then((d) => {
        setData(d)
        const jf: Record<string, string> = {}
        for (const f of JSON_FIELDS) {
          const v = d[f]
          jf[f] = v && typeof v === 'object' ? JSON.stringify(v, null, 2) : '{}'
        }
        setJsonFields(jf)
      })
      .catch(() => {
        // Locale doesn't exist yet — start fresh
        setData({})
        const jf: Record<string, string> = {}
        for (const f of JSON_FIELDS) jf[f] = '{}'
        setJsonFields(jf)
      })
      .finally(() => setLoading(false))
  }, [locale, moduleId])

  const handleLocaleChange = (val: string) => {
    setLocale(val)
    onLocaleChange(val || null)
  }

  const handleSave = async () => {
    // Validate JSON fields
    const parsed: Record<string, Record<string, string>> = {}
    for (const f of JSON_FIELDS) {
      try {
        parsed[f] = JSON.parse(jsonFields[f] || '{}')
      } catch {
        toast(t('toast.invalidJson') + ` (${f})`, 'error')
        return
      }
    }
    setSaving(true)
    try {
      const payload: I18nData = {
        ...data,
        ...parsed,
      }
      await api.i18n.save(moduleId, locale, payload)
      toast(t('toast.i18nSaved'))
      onSaved()
    } catch (e) {
      toast(t('toast.requestFailed', { message: (e as Error).message }), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(t('editor.confirmDeleteI18n', { locale }))) return
    try {
      await api.i18n.delete(moduleId, locale)
      toast(t('toast.i18nDeleted'))
      setLocale('')
      onLocaleChange(null)
      onSaved()
    } catch (e) {
      toast(t('toast.requestFailed', { message: (e as Error).message }), 'error')
    }
  }

  return (
    <div className="tab-content">
      <div className="i18n-locale-bar">
        <select
          className="field-select"
          value={locale}
          onChange={(e) => handleLocaleChange(e.target.value)}
        >
          <option value="">{t('editor.i18n.selectLocale')}</option>
          {allLocales.map((l) => (
            <option key={l} value={l}>
              {l}
              {availableLocales.includes(l) ? ' ✓' : ''}
            </option>
          ))}
        </select>
        <input
          className="field-input field-input-sm"
          placeholder={t('editor.i18n.newLocale')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = (e.target as HTMLInputElement).value.trim()
              if (val) handleLocaleChange(val)
            }
          }}
        />
      </div>

      {!locale ? (
        <div className="no-selection">{t('editor.i18n.noLocaleSelected')}</div>
      ) : loading ? (
        <div className="loading-text">…</div>
      ) : (
        <>
          <div className="field-group">
            <label className="field-label">
              {t('editor.i18n.name')}
              <input
                className="field-input"
                value={data.name ?? ''}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </label>
            <label className="field-label">
              {t('editor.i18n.description')}
              <textarea
                className="field-input"
                value={data.description ?? ''}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                rows={3}
              />
            </label>
            {JSON_FIELDS.map((f) => (
              <label key={f} className="field-label">
                {t(`editor.i18n.${f}`)}
                <textarea
                  className="field-input field-input-mono"
                  value={jsonFields[f] ?? '{}'}
                  onChange={(e) => setJsonFields({ ...jsonFields, [f]: e.target.value })}
                  rows={4}
                  spellCheck={false}
                />
              </label>
            ))}
          </div>
          <div className="tab-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {t('editor.i18n.save')}
            </button>
            {availableLocales.includes(locale) && (
              <button className="btn btn-danger" onClick={handleDelete}>
                {t('editor.i18n.delete')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
