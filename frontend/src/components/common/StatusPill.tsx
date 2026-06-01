import type { Severity } from '../../lib/status'

interface StatusPillProps {
  label: string
  severity: Severity
}

const STYLES: Record<Severity, string> = {
  nominal: 'border-accent/50 bg-accent/10 text-accent',
  warn: 'border-warn/50 bg-warn/10 text-warn',
  danger: 'border-danger/50 bg-danger/10 text-danger',
}

const DOT: Record<Severity, string> = {
  nominal: 'bg-accent',
  warn: 'bg-warn',
  danger: 'bg-danger',
}

export default function StatusPill({ label, severity }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase ${STYLES[severity]}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${DOT[severity]} ${
          severity !== 'nominal' ? 'animate-pulse' : ''
        }`}
      />
      {label}
    </span>
  )
}
