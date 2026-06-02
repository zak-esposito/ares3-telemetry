import { SEVERITY_COLOR, type Severity } from '../../lib/status'

interface StatusLedProps {
  severity: Severity
  /** Diameter in px. */
  size?: number
  className?: string
}

// Each state gets its own cadence: nominal breathes slowly, warn pulses,
// failure blinks urgently. Animation keyframes live in index.css.
const ANIM: Record<Severity, string> = {
  nominal: 'a-breathe',
  warn: 'a-pulse',
  danger: 'a-blink',
}

/** A single instrument LED whose colour + pulse cadence track a severity. */
export default function StatusLed({
  severity,
  size = 8,
  className = '',
}: StatusLedProps) {
  const color = SEVERITY_COLOR[severity]
  return (
    <span
      className={`inline-block shrink-0 rounded-full ${ANIM[severity]} ${className}`}
      style={{ width: size, height: size, backgroundColor: color }}
      aria-hidden
    />
  )
}
