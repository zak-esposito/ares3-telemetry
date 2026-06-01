import { useState } from 'react'
import Sidebar, { type ViewKey } from './components/Layout/Sidebar'
import MissionControl from './components/MissionControl/MissionControl'
import WatneyLog from './components/WatneyLog/WatneyLog'
import RoverOps from './components/RoverOps/RoverOps'
import ResourceForecast from './components/ResourceForecast/ResourceForecast'
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

  return (
    <div className="flex h-screen w-full overflow-hidden text-slate-200">
      <Sidebar
        active={view}
        onSelect={setView}
        sol={telemetry.data?.sol ?? null}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-edge px-8 py-4">
          <h1 className="text-xl font-semibold tracking-[0.15em] text-slate-100 uppercase">
            {TITLES[view]}
          </h1>
          <span className="text-[10px] tracking-[0.3em] text-slate-500 uppercase">
            Acidalia Planitia · 31.3°N 331.3°E
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
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
        </div>
      </main>
    </div>
  )
}
