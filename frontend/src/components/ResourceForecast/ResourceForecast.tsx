import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Spinner from '../common/Spinner'
import ErrorBanner from '../common/ErrorBanner'
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
    <div className="flex flex-col gap-4 rounded-lg border border-edge bg-panel p-6">
      <div>
        <h2 className="text-sm tracking-[0.25em] text-slate-300 uppercase">
          {HORIZON}-Sol Projection
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Projected from Sol {snapshot.sol} at current consumption rates.
        </p>
      </div>

      <div className="h-[440px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 24, bottom: 10, left: 0 }}
          >
            <CartesianGrid stroke="#2a2a3a" strokeDasharray="3 3" />
            <XAxis
              dataKey="sol"
              stroke="#64748b"
              tick={{ fontSize: 11 }}
              label={{
                value: 'Sol',
                position: 'insideBottom',
                offset: -4,
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#14141c',
                border: '1px solid #2a2a3a',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: '#e2e8f0' }}
              labelFormatter={(label) => `Sol ${label}`}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="food"
              name="Food (sols)"
              stroke="#00ff88"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="water"
              name="Water (L)"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
