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

/** Shape returned by GET /api/build/status */
export interface BuildStatusResponse {
  building: boolean
  pending: boolean
  lastBuildTime: number
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
      let message = res.statusText
      try {
        const json = await res.json()
        message = json.error || JSON.stringify(json)
      } catch {
        // ignore
      }
      throw new Error(message)
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
    /** Returns the modules array (unwraps { modules: [...] }) */
    list: () =>
      request<{ modules: ModuleSummary[] }>('GET', '/modules').then((r) => r.modules),
    get: (id: string) => request<ModuleDetail>('GET', `/modules/${encodeURIComponent(id)}`),
    create: (data: { id: string; meta: { name: string; description: string; tags: string[]; contributors: string[]; keywords: string[] } }) =>
      request<{ id: string; message: string }>('POST', '/modules', data),
    updateMeta: (id: string, meta: Partial<ModuleDetail['meta']>) =>
      request<void>('PUT', `/modules/${encodeURIComponent(id)}/meta`, meta),
    delete: (id: string) => request<void>('DELETE', `/modules/${encodeURIComponent(id)}`),
  },
  scripts: {
    /** Returns the scripts array (unwraps { scripts: [...] }) */
    list: (moduleId: string) =>
      request<{ scripts: Script[] }>('GET', `/modules/${encodeURIComponent(moduleId)}/scripts`).then(
        (r) => r.scripts,
      ),
    create: (moduleId: string, data: { id: string; content?: string; order?: number }) =>
      request<{ message: string; id: string; order: number }>(
        'POST',
        `/modules/${encodeURIComponent(moduleId)}/scripts`,
        data,
      ),
    update: (
      moduleId: string,
      scriptId: string,
      data: { content?: string; newId?: string; newOrder?: number },
    ) =>
      request<{ message: string; id?: string; order?: number }>(
        'PUT',
        `/modules/${encodeURIComponent(moduleId)}/scripts/${encodeURIComponent(scriptId)}`,
        data,
      ),
    delete: (moduleId: string, scriptId: string) =>
      request<void>(
        'DELETE',
        `/modules/${encodeURIComponent(moduleId)}/scripts/${encodeURIComponent(scriptId)}`,
      ),
  },
  i18n: {
    get: (moduleId: string, locale: string) =>
      request<I18nData>(
        'GET',
        `/modules/${encodeURIComponent(moduleId)}/i18n/${encodeURIComponent(locale)}`,
      ),
    save: (moduleId: string, locale: string, data: I18nData) =>
      request<void>(
        'PUT',
        `/modules/${encodeURIComponent(moduleId)}/i18n/${encodeURIComponent(locale)}`,
        data,
      ),
    delete: (moduleId: string, locale: string) =>
      request<void>(
        'DELETE',
        `/modules/${encodeURIComponent(moduleId)}/i18n/${encodeURIComponent(locale)}`,
      ),
  },
  demo: {
    upload: (moduleId: string, file: File) => {
      const form = new FormData()
      form.append('file', file)
      return request<void>('POST', `/modules/${encodeURIComponent(moduleId)}/demo`, form)
    },
    delete: (moduleId: string) =>
      request<void>('DELETE', `/modules/${encodeURIComponent(moduleId)}/demo`),
  },
  assets: {
    upload: (moduleId: string, file: File) => {
      const form = new FormData()
      form.append('file', file)
      return request<void>('POST', `/modules/${encodeURIComponent(moduleId)}/assets`, form)
    },
    delete: (moduleId: string, filename: string) =>
      request<void>(
        'DELETE',
        `/modules/${encodeURIComponent(moduleId)}/assets/${encodeURIComponent(filename)}`,
      ),
  },
  build: {
    status: () => request<BuildStatusResponse>('GET', '/build/status'),
  },
}
