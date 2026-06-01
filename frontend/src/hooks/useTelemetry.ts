import { useCallback, useEffect, useState } from 'react'
import { ApiClientError, getCurrent } from '../api/client'
import type { HabSnapshotDto } from '../types/telemetry'

const REFRESH_MS = 30_000

export interface UseTelemetryResult {
  data: HabSnapshotDto | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  /** Replace the snapshot locally (e.g. after ADVANCE SOL) without a refetch. */
  setData: (snapshot: HabSnapshotDto) => void
}

/** Fetches current telemetry on mount and auto-refreshes every 30s. */
export function useTelemetry(): UseTelemetryResult {
  const [data, setData] = useState<HabSnapshotDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      const snapshot = await getCurrent()
      setData(snapshot)
      setError(null)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : 'Failed to load telemetry'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Intentional fetch-on-mount + 30s poll: setState fires async after await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refetch()
    const id = setInterval(() => void refetch(), REFRESH_MS)
    return () => clearInterval(id)
  }, [refetch])

  return { data, loading, error, refetch, setData }
}
