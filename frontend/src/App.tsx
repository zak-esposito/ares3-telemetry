import { useState } from 'react'
import Sidebar, { type ViewKey } from './components/Layout/Sidebar'
import MissionControl from './components/MissionControl/MissionControl'
import WatneyLog from './components/WatneyLog/WatneyLog'
import RoverOps from './components/RoverOps/RoverOps'
import ResourceForecast from './components/ResourceForecast/ResourceForecast'
import ErrorBoundary from './components/common/ErrorBoundary'
import { useTelemetry } from './hooks/useTelemetry'

const TITLES: Record<ViewKey, string> = {
  mission: 'Mission Control',
  log: "Watney's Log",
  rover: 'Rover Ops',
  forecast: 'Resource Forecast',
}

export default function App() {
  const [view, setView] = useState<ViewKey>('mission')
  const telemetry = useTelemetry()

  const online = Boolean(telemetry.data) && !telemetry.error

  return (
    <div className="flex h-screen w-full overflow-hidden text-slate-200">
      <Sidebar
        active={view}
        onSelect={setView}
        sol={telemetry.data?.sol ?? null}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="relative flex items-center justify-between border-b border-edge px-8 py-4">
          <h1
            className="text-2xl tracking-[0.3em] text-slate-100 uppercase"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
          >
            {TITLES[view]}
          </h1>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${online ? 'a-breathe bg-accent' : 'a-blink bg-danger'}`}
              />
              <span
                className={`font-mono text-[10px] tracking-[0.3em] uppercase ${online ? 'text-accent' : 'text-danger'}`}
              >
                {online ? 'Uplink Live' : 'Signal Lost'}
              </span>
            </span>
            <span className="text-[10px] tracking-[0.3em] text-slate-500 uppercase">
              Acidalia Planitia · 31.3°N 331.3°E
            </span>
          </div>
          {/* accent rule */}
          <span className="pointer-events-none absolute right-0 bottom-[-1px] left-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div key={view} className="reveal">
            <ErrorBoundary>
              {view === 'mission' && <MissionControl telemetry={telemetry} />}
              {view === 'log' && <WatneyLog />}
              {view === 'rover' && <RoverOps />}
              {view === 'forecast' && (
                <ResourceForecast
                  snapshot={telemetry.data}
                  loading={telemetry.loading}
                  error={telemetry.error}
                  onRetry={telemetry.refetch}
                />
              )}
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  )
}
