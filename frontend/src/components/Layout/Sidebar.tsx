import type { ComponentType, SVGProps } from 'react'
import {
  ForecastIcon,
  LogIcon,
  MissionIcon,
  RoverIcon,
} from '../common/icons'

export type ViewKey = 'mission' | 'log' | 'rover' | 'forecast'

interface NavItem {
  key: ViewKey
  label: string
  hint: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const NAV: NavItem[] = [
  { key: 'mission', label: 'Mission Control', hint: 'MSN', Icon: MissionIcon },
  { key: 'log', label: "Watney's Log", hint: 'LOG', Icon: LogIcon },
  { key: 'rover', label: 'Rover Ops', hint: 'ROV', Icon: RoverIcon },
  { key: 'forecast', label: 'Resource Forecast', hint: 'FCT', Icon: ForecastIcon },
]

interface SidebarProps {
  active: ViewKey
  onSelect: (view: ViewKey) => void
  sol: number | null
}

export default function Sidebar({ active, onSelect, sol }: SidebarProps) {
  const linked = sol !== null

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col border-r border-edge bg-panel/40">
      {/* Wordmark */}
      <div className="border-b border-edge px-5 py-5">
        <div
          className="text-2xl font-bold tracking-[0.18em] text-accent"
          style={{
            fontFamily: 'var(--font-display)',
            textShadow: '0 0 16px rgba(0,255,136,0.4)',
          }}
        >
          ARES&nbsp;III
        </div>
        <div className="mt-1 text-[10px] tracking-[0.4em] text-slate-500 uppercase">
          Hab Telemetry
        </div>
      </div>

      {/* Mission status block */}
      <div className="flex items-center justify-between border-b border-edge px-5 py-3">
        <span className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${linked ? 'a-breathe bg-accent' : 'a-blink bg-danger'}`}
          />
          <span className="text-[10px] tracking-[0.3em] text-slate-400 uppercase">
            Uplink
          </span>
        </span>
        <span
          className={`font-mono text-[10px] tracking-[0.2em] uppercase ${linked ? 'text-accent' : 'text-danger'}`}
        >
          {linked ? 'Live' : 'Lost'}
        </span>
      </div>

      {/* Nav rail */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map(({ key, label, hint, Icon }) => {
          const isActive = key === active
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`group relative flex items-center gap-3 border py-2.5 pr-3 pl-4 text-left transition-colors ${
                isActive
                  ? 'border-accent/30 bg-accent/10 text-accent'
                  : 'border-transparent text-slate-400 hover:bg-panel-2 hover:text-slate-200'
              }`}
            >
              {/* Active left accent bar */}
              <span
                className={`absolute top-0 bottom-0 left-0 w-[3px] transition-all ${
                  isActive
                    ? 'bg-accent shadow-[var(--shadow-glow-accent)]'
                    : 'bg-transparent group-hover:bg-edge-bright'
                }`}
              />
              <Icon className="shrink-0" />
              <span className="flex min-w-0 flex-col">
                <span
                  className="text-[13px] tracking-wide"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {label}
                </span>
                <span className="font-mono text-[9px] tracking-[0.3em] text-slate-600 uppercase">
                  {hint}
                </span>
              </span>
            </button>
          )
        })}
      </nav>

      {/* Current Sol readout */}
      <div className="border-t border-edge px-5 py-4">
        <div className="text-[10px] tracking-[0.35em] text-slate-500 uppercase">
          Current Sol
        </div>
        <div
          className="mt-0.5 text-3xl font-bold tabular-nums text-accent"
          style={{
            fontFamily: 'var(--font-seg)',
            textShadow: '0 0 12px rgba(0,255,136,0.35)',
          }}
        >
          {sol ?? '--'}
        </div>
      </div>
    </aside>
  )
}
