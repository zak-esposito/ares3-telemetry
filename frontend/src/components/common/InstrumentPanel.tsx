import type { ReactNode } from 'react'
import { SEVERITY_COLOR, type Severity } from '../../lib/status'
import StatusLed from './StatusLed'

interface InstrumentPanelProps {
  title?: string
  /** Short right-aligned code in the header, e.g. "MSN" / "O₂". */
  code?: string
  /** Drives the header LED and (when warn/danger) tints the corner brackets. */
  led?: Severity
  /** Explicit bracket colour override. */
  accent?: string
  /** Custom right-side header content (replaces `code`). */
  action?: ReactNode
  className?: string
  /** Class for the content wrapper — override to control padding. */
  bodyClassName?: string
  children: ReactNode
}

const EDGE_BRIGHT = '#3d3d52'

function Bracket({ pos, color }: { pos: string; color: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-3 w-3 ${pos}`}
      style={{ borderColor: color }}
    />
  )
}

/**
 * The shared instrument bezel: square hairline frame, four L-shaped corner
 * brackets, and an optional label header rule. Brackets tint amber/red when a
 * degraded/failed severity is supplied so a panel "raises an alarm" on its own.
 */
export default function InstrumentPanel({
  title,
  code,
  led,
  accent,
  action,
  className = '',
  bodyClassName = 'p-5',
  children,
}: InstrumentPanelProps) {
  const bracketColor =
    accent ?? (led && led !== 'nominal' ? SEVERITY_COLOR[led] : EDGE_BRIGHT)
  const hasHeader = Boolean(title || code || action || led)

  return (
    <section
      className={`relative border border-edge bg-panel/70 ${className}`}
    >
      <Bracket pos="left-0 top-0 border-l border-t" color={bracketColor} />
      <Bracket pos="right-0 top-0 border-r border-t" color={bracketColor} />
      <Bracket pos="bottom-0 left-0 border-b border-l" color={bracketColor} />
      <Bracket pos="bottom-0 right-0 border-b border-r" color={bracketColor} />

      {hasHeader && (
        <header className="flex items-center justify-between gap-3 border-b border-edge px-4 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {led && <StatusLed severity={led} />}
            {title && (
              <h2
                className="truncate text-[13px] font-semibold tracking-[0.22em] text-slate-200 uppercase"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {title}
              </h2>
            )}
          </div>
          {action ??
            (code && (
              <span className="shrink-0 font-mono text-[10px] tracking-[0.25em] text-slate-600 uppercase">
                {code}
              </span>
            ))}
        </header>
      )}

      <div className={bodyClassName}>{children}</div>
    </section>
  )
}
