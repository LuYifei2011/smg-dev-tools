import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { api, Script } from '../../api/client'
import { useToast } from '../../hooks/useToast'
import ScriptEditor from '../ScriptEditor'

interface ScriptsTabProps {
  moduleId: string
  initialScriptId: string | null
  onScriptChange: (id: string | null) => void
}

export default function ScriptsTab({
  moduleId,
  initialScriptId,
  onScriptChange,
}: ScriptsTabProps) {
  const { t } = useTranslation()
  const { toast } = useToast()

  const [scripts, setScripts] = useState<Script[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(initialScriptId)
  const [content, setContent] = useState('')
  const [order, setOrder] = useState('')
  const [scriptId, setScriptId] = useState('')
  const [saving, setSaving] = useState(false)
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal')
  const [activePane, setActivePane] = useState<'editor' | 'preview'>('editor')

  const loadScripts = useCallback(async () => {
    try {
      const list = await api.scripts.list(moduleId)
      list.sort((a, b) => a.order - b.order)
      setScripts(list)
      return list
    } catch (e) {
      toast(t('toast.requestFailed', { message: (e as Error).message }), 'error')
      return []
    }
  }, [moduleId, t, toast])

  useEffect(() => {
    loadScripts().then((list) => {
      const id = initialScriptId ?? list[0]?.id ?? null
      setSelectedId(id)
      onScriptChange(id)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId])

  useEffect(() => {
    const script = scripts.find((s) => s.id === selectedId)
    if (script) {
      setContent(script.content)
      setOrder(String(script.order))
      setScriptId(script.id)
    } else {
      setContent('')
      setOrder('')
      setScriptId('')
    }
  }, [selectedId, scripts])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    onScriptChange(id)
  }

  const handleAdd = async () => {
    try {
      const script = await api.scripts.create(moduleId)
      toast(t('toast.scriptCreated'))
      const list = await loadScripts()
      const newId = script.id ?? list[list.length - 1]?.id ?? null
      if (newId) {
        setSelectedId(newId)
        onScriptChange(newId)
      }
    } catch (e) {
      toast(t('toast.requestFailed', { message: (e as Error).message }), 'error')
    }
  }

  const handleSave = async () => {
    if (!selectedId) return
    if (!scriptId.trim()) {
      toast(t('toast.scriptIdRequired'), 'error')
      return
    }
    const orderNum = parseInt(order, 10)
    if (isNaN(orderNum) || orderNum < 0) {
      toast(t('toast.invalidOrder'), 'error')
      return
    }
    setSaving(true)
    try {
      const updates: { content?: string; newId?: string; newOrder?: number } = { content }
      if (scriptId !== selectedId) updates.newId = scriptId
      if (orderNum !== scripts.find((s) => s.id === selectedId)?.order) {
        updates.newOrder = orderNum
      }
      await api.scripts.update(moduleId, selectedId, updates)
      toast(t('toast.scriptSaved'))
      const list = await loadScripts()
      const finalId = updates.newId ?? selectedId
      setSelectedId(finalId)
      onScriptChange(finalId)
      // Sync order display
      const updated = list.find((s) => s.id === finalId)
      if (updated) setOrder(String(updated.order))
    } catch (e) {
      toast(t('toast.requestFailed', { message: (e as Error).message }), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedId) return
    if (!confirm(t('editor.confirmDeleteScript', { id: selectedId }))) return
    try {
      await api.scripts.delete(moduleId, selectedId)
      toast(t('toast.scriptDeleted'))
      const list = await loadScripts()
      const next = list[0]?.id ?? null
      setSelectedId(next)
      onScriptChange(next)
    } catch (e) {
      toast(t('toast.requestFailed', { message: (e as Error).message }), 'error')
    }
  }

  return (
    <div className="scripts-tab">
      <div className="scripts-sidebar">
        <div className="scripts-sidebar-header">
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            + {t('editor.scripts.addScript')}
          </button>
        </div>
        <div className="scripts-list">
          {scripts.map((s) => (
            <button
              key={s.id}
              className={`script-item${selectedId === s.id ? ' selected' : ''}`}
              onClick={() => handleSelect(s.id)}
            >
              <span className="script-item-order">{s.order}.</span>
              <span className="script-item-id">{s.id}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="scripts-main">
        {!selectedId ? (
          <div className="no-selection">{t('editor.scripts.noScriptSelected')}</div>
        ) : (
          <>
            <div className="scripts-props-bar">
              <label className="prop-field">
                <span>{t('editor.scripts.scriptId')}</span>
                <input
                  className="field-input field-input-sm"
                  value={scriptId}
                  onChange={(e) => setScriptId(e.target.value)}
                />
              </label>
              <label className="prop-field">
                <span>{t('editor.scripts.order')}</span>
                <input
                  className="field-input field-input-sm field-input-order"
                  type="number"
                  min={0}
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                />
              </label>
              <div className="prop-actions">
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                  {t('editor.scripts.save')}
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                  {t('editor.scripts.delete')}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setLayout(layout === 'horizontal' ? 'vertical' : 'horizontal')}
                  title={t('editor.scripts.toggleLayout')}
                >
                  ⇄
                </button>
              </div>
            </div>

            <div className={`scripts-panes scripts-panes-${layout}`}>
              <div className="scripts-editor-pane">
                <div className="pane-header">
                  <button
                    className={`pane-tab${activePane === 'editor' ? ' active' : ''}`}
                    onClick={() => setActivePane('editor')}
                  >
                    {t('editor.scripts.editor')}
                  </button>
                  <button
                    className={`pane-tab${activePane === 'preview' ? ' active' : ''}`}
                    onClick={() => setActivePane('preview')}
                  >
                    {t('editor.scripts.preview')}
                  </button>
                </div>
                {activePane === 'editor' ? (
                  <ScriptEditor
                    key={selectedId}
                    value={content}
                    onChange={setContent}
                    className="scripts-editor"
                  />
                ) : (
                  <pre className="scripts-preview">{content}</pre>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
