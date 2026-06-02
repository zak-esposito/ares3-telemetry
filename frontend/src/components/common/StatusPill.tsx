import { SEVERITY_COLOR, type Severity } from '../../lib/status'
import StatusLed from './StatusLed'

interface StatusPillProps {
  label: string
  severity: Severity
}

// Atmosphere per state: nominal sits steady with a faint glow, warn warms amber,
// failure runs an urgent red glow. The LED carries the matching pulse cadence.
const SHADOW: Record<Severity, string> = {
  nominal: '0 0 0 1px rgba(0,255,136,0.15)',
  warn: 'var(--shadow-glow-warn)',
  danger: 'var(--shadow-glow-danger)',
}

export default function StatusPill({ label, severity }: StatusPillProps) {
  const color = SEVERITY_COLOR[severity]
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase ${severity === 'danger' ? 'a-blink' : ''}`}
      style={{
        color,
        borderColor: `${color}80`,
        backgroundColor: `${color}14`,
        boxShadow: SHADOW[severity],
      }}
    >
      <StatusLed severity={severity} size={7} />
      {label}
    </span>
  )
}
