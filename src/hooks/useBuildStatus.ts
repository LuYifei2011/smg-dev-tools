import { useState, useEffect, useCallback } from 'react'
import { api, BuildStatus } from '../api/client'

export function useBuildStatus() {
  const [status, setStatus] = useState<BuildStatus | null>(null)
  const [error, setError] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      const s = await api.build.status()
      setStatus(s)
      setError(false)
    } catch {
      setError(true)
    }
  }, [])

  useEffect(() => {
    fetchStatus()

    // Poll every 5 seconds
    const interval = setInterval(fetchStatus, 5000)

    // Also listen for SSE updates
    let sse: EventSource | null = null
    try {
      sse = new EventSource('/__dev/sse')
      sse.addEventListener('build', () => {
        fetchStatus()
      })
      sse.onerror = () => {
        sse?.close()
        sse = null
      }
    } catch {
      // SSE not available, polling only
    }

    return () => {
      clearInterval(interval)
      sse?.close()
    }
  }, [fetchStatus])

  return { status, error }
}
