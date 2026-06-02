import { useState } from 'react'
import ErrorBanner from '../common/ErrorBanner'
import InstrumentPanel from '../common/InstrumentPanel'
import { ApiClientError, requestAnalysis } from '../../api/client'
import { riskSeverity, SEVERITY_COLOR } from '../../lib/status'
import { renderMarkdown } from '../../lib/markdown'
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
      <InstrumentPanel
        title="Survival Advisor"
        code="AI · ANTHROPIC"
        bodyClassName="flex items-center justify-between gap-5 p-5"
      >
        <p className="max-w-xl text-sm leading-relaxed text-slate-400">
          Request a survival assessment from the on-board advisor. It reads the
          current Hab telemetry and returns a Watney-style log entry with a risk
          rating.
        </p>
        <button
          type="button"
          onClick={analyse}
          disabled={loading}
          className="flex shrink-0 items-center gap-3 border border-accent/50 bg-accent/10 px-5 py-3 text-sm font-bold tracking-[0.2em] text-accent uppercase transition-all duration-150 hover:bg-accent/20 hover:shadow-[var(--shadow-glow-accent)] active:translate-y-px active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_6px_var(--color-accent)]" />
          {loading ? 'Analysing' : 'Request Analysis'}
        </button>
      </InstrumentPanel>

      {error && <ErrorBanner message={error} onRetry={analyse} />}

      {/* Terminal screen */}
      <div className="seg-screen relative flex flex-1 flex-col overflow-hidden border border-edge">
        <div className="flex items-center gap-2 border-b border-edge bg-panel/70 px-4 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
          <span className="ml-2 font-mono text-[11px] tracking-[0.25em] text-slate-500 uppercase">
            watney@hab:~ — survival log
          </span>
        </div>

        <div className="scanlines relative flex-1 overflow-y-auto p-5 font-mono text-sm leading-relaxed">
          {loading && (
            <div className="mb-4 text-accent">
              <span className="text-info">watney@hab</span>
              <span className="text-slate-500">:~$ </span>
              analysing telemetry
              <span className="a-caret ml-1 inline-block bg-accent text-accent">
                _
              </span>
            </div>
          )}

          {entries.length === 0 && !loading && (
            <div className="text-slate-500">
              <span className="text-info">watney@hab</span>
              <span className="text-slate-600">:~$ </span>
              awaiting command
              <span className="a-caret ml-1 inline-block bg-slate-500">
                &nbsp;
              </span>
            </div>
          )}

          <div className="flex flex-col gap-6">
            {entries.map((entry, index) => {
              const color = SEVERITY_COLOR[riskSeverity(entry.riskLevel)]
              const isLatest = index === 0
              return (
                <article key={`${entry.sol}-${entry.timestamp}-${index}`}>
                  {/* Command prompt line */}
                  <div className="mb-2 flex flex-wrap items-center gap-x-2 text-[13px]">
                    <span className="font-bold text-accent">
                      [SOL {entry.sol}]
                    </span>
                    <span className="text-info">watney@hab</span>
                    <span className="text-slate-600">$</span>
                    <span className="text-slate-400">analyse --telemetry</span>
                  </div>

                  {/* Advisor output */}
                  <div
                    className="advice border-l-2 pl-4 text-sm leading-relaxed text-slate-200"
                    style={{ borderColor: `${color}55` }}
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(entry.advice),
                    }}
                  />

                  {/* Footer: risk + timestamp */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 pl-4 text-[10px]">
                    <span
                      className="font-bold tracking-[0.2em] uppercase"
                      style={{ color }}
                    >
                      ▸ risk: {entry.riskLevel}
                    </span>
                    <span className="tracking-[0.2em] text-slate-600 uppercase">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                    {isLatest && (
                      <span className="a-caret inline-block bg-accent text-accent">
                        _
                      </span>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
