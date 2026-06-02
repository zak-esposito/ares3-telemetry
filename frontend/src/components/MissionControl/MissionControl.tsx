import { useState } from 'react'
import GaugeDial, { type GaugeZone } from './GaugeDial'
import ResourceBars from './ResourceBars'
import SystemStatusPanel from './SystemStatusPanel'
import Spinner from '../common/Spinner'
import ErrorBanner from '../common/ErrorBanner'
import InstrumentPanel from '../common/InstrumentPanel'
import SegmentDisplay from '../common/SegmentDisplay'
import { ApiClientError, simulate } from '../../api/client'
import {
  SEVERITY_COLOR,
  co2Severity,
  o2Severity,
  pressureSeverity,
  tempSeverity,
} from '../../lib/status'
import type { UseTelemetryResult } from '../../hooks/useTelemetry'

const { nominal, warn, danger } = SEVERITY_COLOR

// Colour zones mirror the severity thresholds in lib/status.ts (CLAUDE.md Hab targets).
// Each zone's `limit` is its upper bound; the final limit reaches the gauge max.
const O2_ZONES: GaugeZone[] = [
  { limit: 16, color: danger }, // hypoxia
  { limit: 19, color: warn },
  { limit: 23, color: nominal }, // target band 19–23%
  { limit: 25, color: warn },
  { limit: 30, color: danger }, // fire risk
]

// CO₂ spans 0–6% but nominal sits at ~0.04%, so a linear scale would shrink green to a
// sliver and let amber dominate. Proportion these zones by arc length instead: green takes
// the majority, with amber/red as the warning and lethal bands at the top of the dial.
const CO2_ZONES: GaugeZone[] = [
  { length: 0.6, color: nominal }, // <1% nominal
  { length: 0.25, color: warn }, // 1–5% elevated
  { length: 0.15, color: danger }, // ≥5% lethal
]

const PRESSURE_ZONES: GaugeZone[] = [
  { limit: 90, color: danger },
  { limit: 98, color: warn },
  { limit: 104, color: nominal }, // ~101 kPa target
  { limit: 110, color: warn },
  { limit: 120, color: danger },
]

const TEMP_ZONES: GaugeZone[] = [
  { limit: 283, color: danger },
  { limit: 291, color: warn },
  { limit: 299, color: nominal }, // ~295 K target
  { limit: 305, color: warn },
  { limit: 320, color: danger },
]

interface MissionControlProps {
  telemetry: UseTelemetryResult
}

export default function MissionControl({ telemetry }: MissionControlProps) {
  const { data, loading, error, refetch, setData } = telemetry
  const [advancing, setAdvancing] = useState(false)
  const [advanceError, setAdvanceError] = useState<string | null>(null)

  async function advanceSol() {
    setAdvancing(true)
    setAdvanceError(null)
    try {
      const next = await simulate(1)
      setData(next)
    } catch (err) {
      setAdvanceError(
        err instanceof ApiClientError ? err.message : 'Simulation failed',
      )
    } finally {
      setAdvancing(false)
    }
  }

  if (loading && !data) return <Spinner label="Linking to Hab…" />
  if (error && !data) return <ErrorBanner message={error} onRetry={refetch} />
  if (!data) return null

  return (
    <div className="flex flex-col gap-5">
      {/* Hero: Sol readout + advance control */}
      <div className="reveal" style={{ '--i': 0 } as React.CSSProperties}>
        <InstrumentPanel
          title="Mission Status"
          code="MSN · ACIDALIA PLANITIA"
          bodyClassName="flex flex-wrap items-center justify-between gap-6 p-6"
        >
          <div>
            <div
              className="mb-2 text-[11px] tracking-[0.45em] text-slate-500 uppercase"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Martian Sol
            </div>
            <SegmentDisplay value={data.sol} digits={3} size="4.75rem" />
          </div>

          <button
            type="button"
            onClick={advanceSol}
            disabled={advancing}
            className="group relative flex items-center gap-3 border border-accent/50 bg-accent/10 px-7 py-4 text-sm font-bold tracking-[0.25em] text-accent uppercase transition-all duration-150 hover:bg-accent/20 hover:shadow-[var(--shadow-glow-accent)] active:translate-y-px active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_6px_var(--color-accent)]" />
            {advancing ? 'Advancing' : 'Advance Sol'}
            <span className={advancing ? 'a-blink' : ''}>▸▸▸</span>
          </button>
        </InstrumentPanel>
      </div>

      {advanceError && <ErrorBanner message={advanceError} />}

      {/* Atmosphere gauges */}
      <div
        className="reveal grid grid-cols-2 gap-4 lg:grid-cols-4"
        style={{ '--i': 1 } as React.CSSProperties}
      >
        <GaugeDial
          label="O₂"
          value={data.o2Percentage}
          unit="%"
          min={0}
          max={30}
          subArcs={O2_ZONES}
          severity={o2Severity(data.o2Percentage)}
        />
        <GaugeDial
          label="CO₂"
          value={data.co2Percentage}
          unit="%"
          min={0}
          max={6}
          decimals={2}
          subArcs={CO2_ZONES}
          severity={co2Severity(data.co2Percentage)}
        />
        <GaugeDial
          label="Pressure"
          value={data.internalPressureKPa}
          unit="kPa"
          min={0}
          max={120}
          subArcs={PRESSURE_ZONES}
          severity={pressureSeverity(data.internalPressureKPa)}
        />
        <GaugeDial
          label="Temp"
          value={data.internalTempKelvin}
          unit="K"
          min={150}
          max={320}
          decimals={0}
          subArcs={TEMP_ZONES}
          severity={tempSeverity(data.internalTempKelvin)}
        />
      </div>

      {/* Resources + systems */}
      <div
        className="reveal grid grid-cols-1 gap-4 lg:grid-cols-2"
        style={{ '--i': 2 } as React.CSSProperties}
      >
        <ResourceBars
          foodSolsRemaining={data.foodSolsRemaining}
          waterLitres={data.waterLitres}
          batteryPercent={data.batteryPercent}
        />
        <SystemStatusPanel
          oxygenator={data.oxygenatorStatus}
          waterReclaimer={data.waterReclaimerStatus}
          atmosphericRegulator={data.atmosphericRegulatorStatus}
          lastEvent={data.lastEvent}
        />
      </div>
    </div>
  )
}
