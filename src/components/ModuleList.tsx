import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { api, ModuleSummary } from '../api/client'
import { useToast } from '../hooks/useToast'

interface ModuleListProps {
  selectedId: string | null
  onSelect: (id: string) => void
  onCreated: (id: string) => void
  refreshSignal: number
}

export default function ModuleList({
  selectedId,
  onSelect,
  onCreated,
  refreshSignal,
}: ModuleListProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [modules, setModules] = useState<ModuleSummary[]>([])
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.modules
      .list()
      .then(setModules)
      .catch((e: Error) => toast(t('toast.requestFailed', { message: e.message }), 'error'))
      .finally(() => setLoading(false))
  }, [refreshSignal, t, toast])

  const filtered = modules.filter(
    (m) =>
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="module-list-panel">
      <div className="module-list-toolbar">
        <input
          className="search-input"
          type="search"
          placeholder={t('editor.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          +
        </button>
      </div>
      <div className="module-list">
        {loading ? (
          <div className="list-loading">…</div>
        ) : filtered.length === 0 ? (
          <div className="list-empty">—</div>
        ) : (
          filtered.map((m) => (
            <button
              key={m.id}
              className={`module-item${selectedId === m.id ? ' selected' : ''}`}
              onClick={() => onSelect(m.id)}
            >
              <span className="module-item-id">{m.id}</span>
              <span className="module-item-name">{m.name}</span>
              <span className="module-item-meta">
                {m.scriptCount > 0 && (
                  <span className="badge">{m.scriptCount}</span>
                )}
                {m.hasDemo && <span className="badge badge-demo">demo</span>}
              </span>
            </button>
          ))
        )}
      </div>
      {showCreate && (
        <CreateModal
          onCreated={(id) => {
            setShowCreate(false)
            onCreated(id)
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}

interface CreateModalProps {
  onCreated: (id: string) => void
  onCancel: () => void
}

function CreateModal({ onCreated, onCancel }: CreateModalProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [form, setForm] = useState({ id: '', name: '', description: '', tags: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.id.trim()) return
    setSaving(true)
    try {
      await api.modules.create({
        id: form.id.trim(),
        meta: {
          name: form.name.trim(),
          description: form.description.trim(),
          tags: form.tags
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          contributors: [],
          keywords: [],
        },
      })
      toast(t('toast.moduleCreated'))
      onCreated(form.id.trim())
    } catch (e) {
      toast(t('toast.requestFailed', { message: (e as Error).message }), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{t('editor.createModal.title')}</h2>
        <form onSubmit={handleSubmit}>
          <label className="field-label">
            {t('editor.createModal.id')}
            <input
              className="field-input"
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              placeholder="my-module"
              pattern="[a-z0-9-]+"
              required
            />
            <span className="field-hint">{t('editor.createModal.idHint')}</span>
          </label>
          <label className="field-label">
            {t('editor.createModal.name')}
            <input
              className="field-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="field-label">
            {t('editor.createModal.description')}
            <textarea
              className="field-input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </label>
          <label className="field-label">
            {t('editor.createModal.tags')}
            <input
              className="field-input"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="tag1, tag2"
            />
          </label>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {t('editor.createModal.create')}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              {t('editor.createModal.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
