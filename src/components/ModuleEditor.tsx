import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { api, ModuleDetail } from '../api/client'
import { useToast } from '../hooks/useToast'
import MetaTab from './tabs/MetaTab'
import ScriptsTab from './tabs/ScriptsTab'
import I18nTab from './tabs/I18nTab'
import AssetsTab from './tabs/AssetsTab'

type TabKey = 'meta' | 'scripts' | 'i18n' | 'assets'

interface ModuleEditorProps {
  moduleId: string
  onDeleted: () => void
  onMetaSaved: () => void
}

export default function ModuleEditor({ moduleId, onDeleted, onMetaSaved }: ModuleEditorProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const [detail, setDetail] = useState<ModuleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshSignal, setRefreshSignal] = useState(0)

  const tab = (searchParams.get('tab') as TabKey) ?? 'meta'
  const scriptId = searchParams.get('script')
  const locale = searchParams.get('locale')

  const setTab = (t: TabKey) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', t)
    setSearchParams(next, { replace: true })
  }

  const setScriptParam = (id: string | null) => {
    const next = new URLSearchParams(searchParams)
    if (id) next.set('script', id)
    else next.delete('script')
    setSearchParams(next, { replace: true })
  }

  const setLocaleParam = (l: string | null) => {
    const next = new URLSearchParams(searchParams)
    if (l) next.set('locale', l)
    else next.delete('locale')
    setSearchParams(next, { replace: true })
  }

  const reload = useCallback(() => {
    setLoading(true)
    api.modules
      .get(moduleId)
      .then(setDetail)
      .catch((e: Error) => toast(t('toast.requestFailed', { message: e.message }), 'error'))
      .finally(() => setLoading(false))
  }, [moduleId, t, toast])

  useEffect(() => {
    reload()
  }, [reload, refreshSignal])

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'meta', label: t('editor.tabs.meta') },
    { key: 'scripts', label: t('editor.tabs.scripts') },
    { key: 'i18n', label: t('editor.tabs.i18n') },
    { key: 'assets', label: t('editor.tabs.assets') },
  ]

  if (loading || !detail) {
    return <div className="editor-loading">…</div>
  }

  return (
    <div className="module-editor">
      <div className="editor-tabs-bar">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            className={`editor-tab${tab === tb.key ? ' active' : ''}`}
            onClick={() => setTab(tb.key)}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="editor-tab-body">
        {tab === 'meta' && (
          <MetaTab
            moduleId={moduleId}
            detail={detail}
            onSaved={() => {
              reload()
              onMetaSaved()
            }}
            onDeleted={onDeleted}
          />
        )}
        {tab === 'scripts' && (
          <ScriptsTab
            moduleId={moduleId}
            initialScriptId={scriptId}
            onScriptChange={setScriptParam}
          />
        )}
        {tab === 'i18n' && (
          <I18nTab
            moduleId={moduleId}
            availableLocales={Object.keys(detail.i18n)}
            initialLocale={locale}
            onLocaleChange={setLocaleParam}
            onSaved={() => {
              setRefreshSignal((s) => s + 1)
            }}
          />
        )}
        {tab === 'assets' && (
          <AssetsTab
            moduleId={moduleId}
            detail={detail}
            onChanged={() => {
              setRefreshSignal((s) => s + 1)
            }}
          />
        )}
      </div>
    </div>
  )
}
