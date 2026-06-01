import { SEVERITY_COLOR, type Severity } from '../../lib/status'

interface GaugeDialProps {
  label: string
  value: number
  unit: string
  min: number
  max: number
  severity: Severity
  decimals?: number
}

const CX = 100
const CY = 100
const R = 82

/** Point on the gauge circle for a math-convention angle (y-up), in SVG coords. */
function polar(angleDeg: number): { x: number; y: number } {
  const a = (angleDeg * Math.PI) / 180
  return { x: CX + R * Math.cos(a), y: CY - R * Math.sin(a) }
}

/** Arc path from startAngle down to endAngle over the top (sweep=0). */
function arc(startAngle: number, endAngle: number): string {
  const s = polar(startAngle)
  const e = polar(endAngle)
  const large = Math.abs(endAngle - startAngle) > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 0 ${e.x} ${e.y}`
}

export default function GaugeDial({
  label,
  value,
  unit,
  min,
  max,
  severity,
  decimals = 1,
}: GaugeDialProps) {
  const fraction = Math.min(1, Math.max(0, (value - min) / (max - min)))
  const valueAngle = 180 - fraction * 180
  const color = SEVERITY_COLOR[severity]
  const needle = polar(valueAngle)
  // Pull the needle tip in slightly so it sits inside the arc.
  const tip = {
    x: CX + (needle.x - CX) * 0.82,
    y: CY + (needle.y - CY) * 0.82,
  }

  return (
    <div className="flex flex-col items-center rounded-lg border border-edge bg-panel p-4">
      <svg viewBox="0 0 200 116" className="w-full" role="img" aria-label={label}>
        {/* track */}
        <path
          d={arc(180, 0)}
          fill="none"
          stroke="#2a2a3a"
          strokeWidth={10}
          strokeLinecap="round"
        />
        {/* value */}
        <path
          d={arc(180, valueAngle)}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
        />
        {/* needle */}
        <line
          x1={CX}
          y1={CY}
          x2={tip.x}
          y2={tip.y}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={CX} cy={CY} r={5} fill={color} />
      </svg>

      <div className="-mt-4 text-center">
        <div className="font-mono text-2xl font-bold" style={{ color }}>
          {value.toFixed(decimals)}
          <span className="ml-1 text-sm text-slate-400">{unit}</span>
        </div>
        <div className="mt-1 text-[10px] tracking-[0.25em] text-slate-500 uppercase">
          {label}
        </div>
      </div>
    </div>
  )
}
