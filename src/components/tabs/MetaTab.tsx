import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { api, ModuleDetail } from '../../api/client'
import { useToast } from '../../hooks/useToast'

interface MetaTabProps {
  moduleId: string
  detail: ModuleDetail
  onSaved: () => void
  onDeleted: () => void
}

export default function MetaTab({ moduleId, detail, onSaved, onDeleted }: MetaTabProps) {
  const { t } = useTranslation()
  const { toast } = useToast()

  const [form, setForm] = useState({
    name: detail.meta.name,
    description: detail.meta.description,
    tags: detail.meta.tags.join(', '),
    keywords: detail.meta.keywords.join(', '),
    contributors: detail.meta.contributors.join(', '),
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({
      name: detail.meta.name,
      description: detail.meta.description,
      tags: detail.meta.tags.join(', '),
      keywords: detail.meta.keywords.join(', '),
      contributors: detail.meta.contributors.join(', '),
    })
  }, [detail])

  const splitComma = (s: string) =>
    s
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.modules.updateMeta(moduleId, {
        id: moduleId,
        name: form.name,
        description: form.description,
        tags: splitComma(form.tags),
        keywords: splitComma(form.keywords),
        contributors: splitComma(form.contributors),
      })
      toast(t('toast.metaSaved'))
      onSaved()
    } catch (e) {
      toast(t('toast.requestFailed', { message: (e as Error).message }), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(t('editor.confirmDelete', { name: detail.meta.name }))) return
    try {
      await api.modules.delete(moduleId)
      toast(t('toast.moduleDeleted'))
      onDeleted()
    } catch (e) {
      toast(t('toast.requestFailed', { message: (e as Error).message }), 'error')
    }
  }

  return (
    <div className="tab-content">
      <div className="field-group">
        <label className="field-label">
          {t('editor.meta.id')}
          <input className="field-input" value={moduleId} readOnly />
        </label>
        <label className="field-label">
          {t('editor.meta.name')}
          <input
            className="field-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="field-label">
          {t('editor.meta.description')}
          <textarea
            className="field-input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
        </label>
        <label className="field-label">
          {t('editor.meta.tags')}
          <input
            className="field-input"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="tag1, tag2"
          />
        </label>
        <label className="field-label">
          {t('editor.meta.keywords')}
          <input
            className="field-input"
            value={form.keywords}
            onChange={(e) => setForm({ ...form, keywords: e.target.value })}
            placeholder="keyword1, keyword2"
          />
        </label>
        <label className="field-label">
          {t('editor.meta.contributors')}
          <input
            className="field-input"
            value={form.contributors}
            onChange={(e) => setForm({ ...form, contributors: e.target.value })}
            placeholder="gh/username, sc/username"
          />
          <span className="field-hint">{t('editor.meta.contributorsHint')}</span>
        </label>
      </div>
      <div className="tab-actions">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {t('editor.meta.save')}
        </button>
        <a
          href={`/modules/${moduleId}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
        >
          {t('editor.meta.viewModule')}
        </a>
        <button className="btn btn-danger" onClick={handleDelete}>
          {t('editor.meta.deleteModule')}
        </button>
      </div>
    </div>
  )
}
