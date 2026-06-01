import { GaugeComponent } from 'react-gauge-component'

/**
 * A single colour zone of the gauge arc.
 * Use `limit` (upper bound in value units) when the value range maps cleanly to the
 * arc, or `length` (ratio 0–1 of the arc) when you want to fix the visual proportion
 * independently of the value scale. Don't mix both on the same zone.
 */
export interface GaugeZone {
  limit?: number
  length?: number
  color: string
}

interface GaugeDialProps {
  label: string
  value: number
  unit: string
  min: number
  max: number
  /** Colour zones across the arc, in ascending `limit` order. Last limit should equal `max`. */
  subArcs: GaugeZone[]
  decimals?: number
}

export default function GaugeDial({
  label,
  value,
  unit,
  min,
  max,
  subArcs,
  decimals = 1,
}: GaugeDialProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-edge bg-panel p-4">
      <GaugeComponent
        className="w-full"
        type="radial"
        minValue={min}
        maxValue={max}
        value={value}
        arc={{
          width: 0.24,
          padding: 0.01,
          cornerRadius: 2,
          subArcs,
        }}
        pointer={{
          type: 'needle',
          color: '#cbd5e1',
          baseColor: '#475569',
          length: 0.72,
          width: 12,
          elastic: true,
        }}
        labels={{
          valueLabel: {
            matchColorWithArc: true,
            maxDecimalDigits: decimals,
            formatTextValue: (v) => `${Number(v).toFixed(decimals)} ${unit}`,
            style: {
              fontFamily: 'monospace',
              fontWeight: 'bold',
              fontSize: '34px',
              textShadow: 'none',
            },
          },
          tickLabels: {
            type: 'outer',
            hideMinMax: false,
            ticks: [],
            defaultTickValueConfig: {
              style: {
                fontFamily: 'monospace',
                fontSize: '10px',
                fill: '#64748b',
                textShadow: 'none',
              },
            },
            defaultTickLineConfig: {
              color: '#2a2a3a',
            },
          },
        }}
      />

      <div className="mt-1 text-[10px] tracking-[0.25em] text-slate-500 uppercase">
        {label}
      </div>
    </div>
  )
}
