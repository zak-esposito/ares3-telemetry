import { useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Spinner from '../common/Spinner'
import ErrorBanner from '../common/ErrorBanner'
import InstrumentPanel from '../common/InstrumentPanel'
import type { HabSnapshotDto } from '../../types/telemetry'

interface ResourceForecastProps {
  snapshot: HabSnapshotDto | null
  loading: boolean
  error: string | null
  onRetry: () => void
}

interface ForecastPoint {
  sol: number
  food: number
  water: number
}

const HORIZON = 100

/**
 * Projects food/water forward using the same rates the backend simulation
 * applies: food -1/sol, water +0.5/sol (reclaimer condensate). Battery is not
 * projected — the backend holds batteryPercent constant across sols, so a
 * decay curve here would contradict the actual simulation.
 */
function project(snapshot: HabSnapshotDto): ForecastPoint[] {
  const points: ForecastPoint[] = []
  for (let i = 0; i <= HORIZON; i++) {
    points.push({
      sol: snapshot.sol + i,
      food: Math.max(0, snapshot.foodSolsRemaining - i),
      water: snapshot.waterLitres + 0.5 * i,
    })
  }
  return points
}

export default function ResourceForecast({
  snapshot,
  loading,
  error,
  onRetry,
}: ResourceForecastProps) {
  const data = useMemo(
    () => (snapshot ? project(snapshot) : []),
    [snapshot],
  )

  if (loading && !snapshot) return <Spinner label="Computing trajectory…" />
  if (error && !snapshot) return <ErrorBanner message={error} onRetry={onRetry} />
  if (!snapshot) return null

  return (
    <InstrumentPanel
      title={`${HORIZON}-Sol Projection`}
      code="FCT"
      bodyClassName="flex flex-col gap-4 p-6"
    >
      <p className="font-mono text-xs tracking-wider text-slate-500">
        Projected from Sol {snapshot.sol} at current consumption rates.
      </p>

      <div className="h-[440px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 24, bottom: 10, left: 0 }}
          >
            <defs>
              <linearGradient id="foodFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff88" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#2a2a3a" strokeDasharray="2 4" />
            <XAxis
              dataKey="sol"
              stroke="#475569"
              tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#64748b' }}
              label={{
                value: 'SOL',
                position: 'insideBottom',
                offset: -4,
                fill: '#64748b',
                fontSize: 10,
              }}
            />
            <YAxis
              stroke="#475569"
              tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#64748b' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#06090c',
                border: '1px solid #2a2a3a',
                borderRadius: 0,
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
              }}
              labelStyle={{
                color: '#00ff88',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
              cursor={{ stroke: '#3d3d52', strokeDasharray: '3 3' }}
              labelFormatter={(label) => `Sol ${label}`}
            />
            <Legend
              wrapperStyle={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            />
            <Area
              type="monotone"
              dataKey="food"
              name="Food (sols)"
              stroke="#00ff88"
              strokeWidth={2}
              fill="url(#foodFill)"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="water"
              name="Water (L)"
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#waterFill)"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </InstrumentPanel>
  )
}
