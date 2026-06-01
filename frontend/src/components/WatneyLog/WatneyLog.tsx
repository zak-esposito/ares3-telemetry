import { useState } from 'react'
import ErrorBanner from '../common/ErrorBanner'
import { ApiClientError, requestAnalysis } from '../../api/client'
import { riskSeverity, SEVERITY_COLOR } from '../../lib/status'
import type { WatneyAdviceDto } from '../../types/telemetry'

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString()
}

export default function WatneyLog() {
  const [entries, setEntries] = useState<WatneyAdviceDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function analyse() {
    setLoading(true)
    setError(null)
    try {
      const advice = await requestAnalysis()
      setEntries((prev) => [advice, ...prev])
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : 'Advisor offline — analysis unavailable',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex items-center justify-between rounded-lg border border-edge bg-panel p-5">
        <p className="max-w-xl text-sm text-slate-400">
          Request a survival assessment from the on-board advisor. It reads the
          current Hab telemetry and returns a Watney-style log entry with a risk
          rating.
        </p>
        <button
          type="button"
          onClick={analyse}
          disabled={loading}
          className="rounded-md border border-accent/50 bg-accent/10 px-5 py-3 text-sm font-semibold tracking-[0.2em] text-accent uppercase transition hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Analysing…' : 'Request Analysis'}
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={analyse} />}

      {entries.length === 0 && !error && (
        <div className="rounded-lg border border-dashed border-edge p-10 text-center text-sm text-slate-500">
          No log entries yet. Request an analysis to begin the record.
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
        {entries.map((entry, index) => {
          const severity = riskSeverity(entry.riskLevel)
          const color = SEVERITY_COLOR[severity]
          return (
            <article
              key={`${entry.sol}-${entry.timestamp}-${index}`}
              className="rounded-lg border border-edge bg-panel p-5"
            >
              <header className="mb-3 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-accent">
                  [SOL {entry.sol}]
                </span>
                <span
                  className="rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase"
                  style={{
                    color,
                    borderColor: `${color}80`,
                    backgroundColor: `${color}1a`,
                  }}
                >
                  {entry.riskLevel} risk
                </span>
              </header>
              <p className="text-sm leading-relaxed whitespace-pre-line text-slate-200">
                {entry.advice}
              </p>
              <footer className="mt-3 text-[10px] tracking-[0.2em] text-slate-600 uppercase">
                {formatTimestamp(entry.timestamp)}
              </footer>
            </article>
          )
        })}
      </div>
    </div>
  )
}
