export interface ModuleSummary {
  id: string
  name: string
  description: string
  tags: string[]
  contributors: string[]
  scriptCount: number
  hasDemo: boolean
  locales: string[]
}

export interface Script {
  id: string
  order: number
  content: string
}

export interface I18nData {
  name?: string
  description?: string
  variables?: Record<string, string>
  lists?: Record<string, string>
  events?: Record<string, string>
  scriptTitles?: Record<string, string>
  procedures?: Record<string, string>
  procedureParams?: Record<string, string>
  [key: string]: unknown
}

export interface ModuleDetail {
  id: string
  meta: {
    id: string
    name: string
    description: string
    tags: string[]
    contributors: string[]
    keywords: string[]
  }
  scripts: Script[]
  i18n: Record<string, I18nData>
  hasDemo: boolean
  assets: Array<{ filename: string; size: number }>
}

export interface BuildStatus {
  status: 'building' | 'ready' | 'waiting' | 'error'
  lastBuild?: string
  message?: string
}

const BASE = '/api'

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 30_000)
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      throw new Error(text || res.statusText)
    }
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) return res.json() as Promise<T>
    return null as unknown as T
  } finally {
    clearTimeout(timer)
  }
}

export const api = {
  modules: {
    list: () => request<ModuleSummary[]>('GET', '/modules'),
    get: (id: string) => request<ModuleDetail>('GET', `/modules/${id}`),
    create: (data: { id: string; name: string; description: string; tags: string[] }) =>
      request<ModuleDetail>('POST', '/modules', data),
    updateMeta: (id: string, meta: ModuleDetail['meta']) =>
      request<void>('PUT', `/modules/${id}/meta`, meta),
    delete: (id: string) => request<void>('DELETE', `/modules/${id}`),
  },
  scripts: {
    list: (moduleId: string) => request<Script[]>('GET', `/modules/${moduleId}/scripts`),
    create: (moduleId: string) =>
      request<Script>('POST', `/modules/${moduleId}/scripts`),
    update: (
      moduleId: string,
      scriptId: string,
      data: { content?: string; newId?: string; newOrder?: number },
    ) => request<void>('PUT', `/modules/${moduleId}/scripts/${scriptId}`, data),
    delete: (moduleId: string, scriptId: string) =>
      request<void>('DELETE', `/modules/${moduleId}/scripts/${scriptId}`),
  },
  i18n: {
    get: (moduleId: string, locale: string) =>
      request<I18nData>('GET', `/modules/${moduleId}/i18n/${locale}`),
    save: (moduleId: string, locale: string, data: I18nData) =>
      request<void>('PUT', `/modules/${moduleId}/i18n/${locale}`, data),
    delete: (moduleId: string, locale: string) =>
      request<void>('DELETE', `/modules/${moduleId}/i18n/${locale}`),
  },
  demo: {
    upload: (moduleId: string, file: File) => {
      const form = new FormData()
      form.append('file', file)
      return request<void>('POST', `/modules/${moduleId}/demo`, form)
    },
    delete: (moduleId: string) => request<void>('DELETE', `/modules/${moduleId}/demo`),
  },
  assets: {
    upload: (moduleId: string, file: File) => {
      const form = new FormData()
      form.append('file', file)
      return request<void>('POST', `/modules/${moduleId}/assets`, form)
    },
    delete: (moduleId: string, filename: string) =>
      request<void>('DELETE', `/modules/${moduleId}/assets/${filename}`),
  },
  build: {
    status: () => request<BuildStatus>('GET', '/build/status'),
  },
}
