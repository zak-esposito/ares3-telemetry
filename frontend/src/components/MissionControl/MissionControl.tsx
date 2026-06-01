import { useState } from 'react'
import GaugeDial, { type GaugeZone } from './GaugeDial'
import ResourceBars from './ResourceBars'
import SystemStatusPanel from './SystemStatusPanel'
import Spinner from '../common/Spinner'
import ErrorBanner from '../common/ErrorBanner'
import { ApiClientError, simulate } from '../../api/client'
import { SEVERITY_COLOR } from '../../lib/status'
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
    <div className="flex flex-col gap-6">
      {/* Sol counter + advance */}
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-lg border border-edge bg-panel p-6">
        <div>
          <div className="text-[10px] tracking-[0.4em] text-slate-500 uppercase">
            Martian Sol
          </div>
          <div className="font-mono text-6xl font-bold text-accent tabular-nums">
            {data.sol}
          </div>
        </div>
        <button
          type="button"
          onClick={advanceSol}
          disabled={advancing}
          className="rounded-md border border-accent/50 bg-accent/10 px-6 py-3 text-sm font-semibold tracking-[0.2em] text-accent uppercase transition hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {advancing ? 'Advancing…' : 'Advance Sol ▸'}
        </button>
      </div>

      {advanceError && <ErrorBanner message={advanceError} />}

      {/* Atmosphere gauges */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <GaugeDial
          label="O₂"
          value={data.o2Percentage}
          unit="%"
          min={0}
          max={30}
          subArcs={O2_ZONES}
        />
        <GaugeDial
          label="CO₂"
          value={data.co2Percentage}
          unit="%"
          min={0}
          max={6}
          decimals={2}
          subArcs={CO2_ZONES}
        />
        <GaugeDial
          label="Pressure"
          value={data.internalPressureKPa}
          unit="kPa"
          min={0}
          max={120}
          subArcs={PRESSURE_ZONES}
        />
        <GaugeDial
          label="Temp"
          value={data.internalTempKelvin}
          unit="K"
          min={150}
          max={320}
          decimals={0}
          subArcs={TEMP_ZONES}
        />
      </div>

      {/* Resources + systems */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
