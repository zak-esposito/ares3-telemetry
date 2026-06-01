import type { RiskLevel, SystemStatus } from '../types/telemetry'

/** Severity bucket shared by gauges, bars and pills. */
export type Severity = 'nominal' | 'warn' | 'danger'

/** Tailwind-token hex values, so SVG/inline styles and classes stay in sync. */
export const SEVERITY_COLOR: Record<Severity, string> = {
  nominal: '#00ff88',
  warn: '#ffb020',
  danger: '#ff4444',
}

export function systemSeverity(status: SystemStatus): Severity {
  switch (status) {
    case 'NOMINAL':
      return 'nominal'
    case 'DEGRADED':
      return 'warn'
    case 'FAILURE':
      return 'danger'
  }
}

export function riskSeverity(risk: RiskLevel): Severity {
  switch (risk) {
    case 'LOW':
      return 'nominal'
    case 'MEDIUM':
      return 'warn'
    case 'HIGH':
    case 'CRITICAL':
      return 'danger'
  }
}

// ---- Atmosphere thresholds (CLAUDE.md Hab targets) ----

/** O2: nominal 19-23%, danger <16% or >25% (fire risk), else degraded. */
export function o2Severity(pct: number): Severity {
  if (pct < 16 || pct > 25) return 'danger'
  if (pct < 19 || pct > 23) return 'warn'
  return 'nominal'
}

/** CO2: ok <1%, lethal >=5%, degraded in between. */
export function co2Severity(pct: number): Severity {
  if (pct >= 5) return 'danger'
  if (pct >= 1) return 'warn'
  return 'nominal'
}

/** Internal pressure target 101 kPa (sea-level). */
export function pressureSeverity(kpa: number): Severity {
  if (kpa < 90 || kpa > 110) return 'danger'
  if (kpa < 98 || kpa > 104) return 'warn'
  return 'nominal'
}

/** Internal temp target 295 K (~22C). */
export function tempSeverity(kelvin: number): Severity {
  if (kelvin < 283 || kelvin > 305) return 'danger'
  if (kelvin < 291 || kelvin > 299) return 'warn'
  return 'nominal'
}

/** Battery: danger <15%, warn <40%. */
export function batterySeverity(pct: number): Severity {
  if (pct < 15) return 'danger'
  if (pct < 40) return 'warn'
  return 'nominal'
}

/** Food sols remaining: danger <30, warn <100. */
export function foodSeverity(sols: number): Severity {
  if (sols < 30) return 'danger'
  if (sols < 100) return 'warn'
  return 'nominal'
}

/** Water litres: danger <50, warn <150. */
export function waterSeverity(litres: number): Severity {
  if (litres < 50) return 'danger'
  if (litres < 150) return 'warn'
  return 'nominal'
}
