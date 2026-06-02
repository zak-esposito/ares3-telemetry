import InstrumentPanel from '../common/InstrumentPanel'
import {
  SEVERITY_COLOR,
  batterySeverity,
  foodSeverity,
  waterSeverity,
  type Severity,
} from '../../lib/status'

interface BarRow {
  label: string
  value: number
  display: string
  /** Fraction 0-1 for the bar fill. */
  fraction: number
  /** Upper bound shown as the right-hand scale tick. */
  scale: string
  severity: Severity
}

// Notch overlay carves the meter fill into discrete segments (instrument feel).
const NOTCHES =
  'repeating-linear-gradient(90deg, transparent 0, transparent 6px, var(--color-panel) 6px, var(--color-panel) 7px)'

interface ResourceBarsProps {
  foodSolsRemaining: number
  waterLitres: number
  batteryPercent: number
}

// Reference maxima for scaling the bars (initial mission values).
const FOOD_MAX = 400
const WATER_MAX = 618

export default function ResourceBars({
  foodSolsRemaining,
  waterLitres,
  batteryPercent,
}: ResourceBarsProps) {
  const rows: BarRow[] = [
    {
      label: 'Food',
      value: foodSolsRemaining,
      display: `${foodSolsRemaining.toFixed(0)} sols`,
      fraction: Math.min(1, foodSolsRemaining / FOOD_MAX),
      scale: `${FOOD_MAX}`,
      severity: foodSeverity(foodSolsRemaining),
    },
    {
      label: 'Water',
      value: waterLitres,
      display: `${waterLitres.toFixed(0)} L`,
      fraction: Math.min(1, waterLitres / WATER_MAX),
      scale: `${WATER_MAX}`,
      severity: waterSeverity(waterLitres),
    },
    {
      label: 'Battery',
      value: batteryPercent,
      display: `${batteryPercent.toFixed(0)} %`,
      fraction: Math.min(1, batteryPercent / 100),
      scale: '100',
      severity: batterySeverity(batteryPercent),
    },
  ]

  return (
    <InstrumentPanel title="Resources" code="RES">
      <div className="flex flex-col gap-5">
        {rows.map((row) => {
          const color = SEVERITY_COLOR[row.severity]
          return (
            <div key={row.label}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[11px] tracking-[0.2em] text-slate-400 uppercase">
                  {row.label}
                </span>
                <span
                  className="font-mono text-base font-bold tabular-nums"
                  style={{ color, textShadow: `0 0 10px ${color}55` }}
                >
                  {row.display}
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden border border-edge bg-panel-2">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${row.fraction * 100}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}66`,
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{ backgroundImage: NOTCHES }}
                />
              </div>
              <div className="mt-1 flex justify-between font-mono text-[9px] tracking-[0.2em] text-slate-600">
                <span>0</span>
                <span>{row.scale}</span>
              </div>
            </div>
          )
        })}
      </div>
    </InstrumentPanel>
  )
}
