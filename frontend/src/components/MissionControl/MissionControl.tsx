import { useState } from 'react'
import GaugeDial from './GaugeDial'
import ResourceBars from './ResourceBars'
import SystemStatusPanel from './SystemStatusPanel'
import Spinner from '../common/Spinner'
import ErrorBanner from '../common/ErrorBanner'
import { ApiClientError, simulate } from '../../api/client'
import {
  co2Severity,
  o2Severity,
  pressureSeverity,
  tempSeverity,
} from '../../lib/status'
import type { UseTelemetryResult } from '../../hooks/useTelemetry'

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
          severity={o2Severity(data.o2Percentage)}
        />
        <GaugeDial
          label="CO₂"
          value={data.co2Percentage}
          unit="%"
          min={0}
          max={6}
          decimals={2}
          severity={co2Severity(data.co2Percentage)}
        />
        <GaugeDial
          label="Pressure"
          value={data.internalPressureKPa}
          unit="kPa"
          min={0}
          max={120}
          severity={pressureSeverity(data.internalPressureKPa)}
        />
        <GaugeDial
          label="Temp"
          value={data.internalTempKelvin}
          unit="K"
          min={150}
          max={320}
          decimals={0}
          severity={tempSeverity(data.internalTempKelvin)}
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
