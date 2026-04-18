import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import '../styles/editor.css'
import ModuleList from '../components/ModuleList'
import ModuleEditor from '../components/ModuleEditor'

export default function Editor() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [refreshSignal, setRefreshSignal] = useState(0)

  const moduleId = searchParams.get('module')

  const handleSelect = (id: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('module', id)
    next.delete('tab')
    next.delete('script')
    next.delete('locale')
    setSearchParams(next, { replace: true })
  }

  const handleCreated = (id: string) => {
    setRefreshSignal((s) => s + 1)
    handleSelect(id)
  }

  const handleDeleted = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('module')
    next.delete('tab')
    next.delete('script')
    next.delete('locale')
    setSearchParams(next, { replace: true })
    setRefreshSignal((s) => s + 1)
  }

  const handleMetaSaved = () => {
    setRefreshSignal((s) => s + 1)
  }

  // Restore sidebarOpen from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('smg-sidebar-open')
    if (stored !== null) setSidebarOpen(stored !== 'false')
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen((v) => {
      localStorage.setItem('smg-sidebar-open', String(!v))
      return !v
    })
  }

  return (
    <div className="page-editor">
      <Header showBack title={t('editor.title')} />
      <div className="editor-layout">
        <aside className={`editor-sidebar${sidebarOpen ? '' : ' collapsed'}`}>
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            title={sidebarOpen ? 'Collapse' : 'Expand'}
          >
            {sidebarOpen ? '‹' : '›'}
          </button>
          {sidebarOpen && (
            <ModuleList
              selectedId={moduleId}
              onSelect={handleSelect}
              onCreated={handleCreated}
              refreshSignal={refreshSignal}
            />
          )}
        </aside>
        <main className="editor-main">
          {moduleId ? (
            <ModuleEditor
              key={moduleId}
              moduleId={moduleId}
              onDeleted={handleDeleted}
              onMetaSaved={handleMetaSaved}
            />
          ) : (
            <div className="editor-placeholder">{t('editor.noModuleSelected')}</div>
          )}
        </main>
      </div>
    </div>
  )
}
