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
  severity: Severity
}

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
      severity: foodSeverity(foodSolsRemaining),
    },
    {
      label: 'Water',
      value: waterLitres,
      display: `${waterLitres.toFixed(0)} L`,
      fraction: Math.min(1, waterLitres / WATER_MAX),
      severity: waterSeverity(waterLitres),
    },
    {
      label: 'Battery',
      value: batteryPercent,
      display: `${batteryPercent.toFixed(0)} %`,
      fraction: Math.min(1, batteryPercent / 100),
      severity: batterySeverity(batteryPercent),
    },
  ]

  return (
    <div className="rounded-lg border border-edge bg-panel p-5">
      <h2 className="mb-4 text-xs tracking-[0.25em] text-slate-400 uppercase">
        Resources
      </h2>
      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-sm text-slate-300">{row.label}</span>
              <span
                className="font-mono text-sm font-semibold"
                style={{ color: SEVERITY_COLOR[row.severity] }}
              >
                {row.display}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-panel-2">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${row.fraction * 100}%`,
                  backgroundColor: SEVERITY_COLOR[row.severity],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
