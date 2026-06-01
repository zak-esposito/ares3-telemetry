export type ViewKey = 'mission' | 'log' | 'rover' | 'forecast'

interface NavItem {
  key: ViewKey
  label: string
  hint: string
  glyph: string
}

const NAV: NavItem[] = [
  { key: 'mission', label: 'Mission Control', hint: 'MSN', glyph: '◉' },
  { key: 'log', label: "Watney's Log", hint: 'LOG', glyph: '✎' },
  { key: 'rover', label: 'Rover Ops', hint: 'ROV', glyph: '📷' },
  { key: 'forecast', label: 'Resource Forecast', hint: 'FCT', glyph: '📈' },
]

interface SidebarProps {
  active: ViewKey
  onSelect: (view: ViewKey) => void
  sol: number | null
}

export default function Sidebar({ active, onSelect, sol }: SidebarProps) {
  return (
    <aside className="flex w-56 flex-shrink-0 flex-col border-r border-edge bg-panel/60">
      <div className="border-b border-edge px-5 py-5">
        <div className="text-lg font-bold tracking-[0.2em] text-accent">
          ARES&nbsp;3
        </div>
        <div className="mt-1 text-[10px] tracking-[0.3em] text-slate-500 uppercase">
          Hab Telemetry
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map((item) => {
          const isActive = item.key === active
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition ${
                isActive
                  ? 'border border-accent/40 bg-accent/10 text-accent'
                  : 'border border-transparent text-slate-400 hover:bg-panel-2 hover:text-slate-200'
              }`}
            >
              <span className="w-5 text-center text-base">{item.glyph}</span>
              <span className="flex flex-col">
                <span className="font-medium">{item.label}</span>
                <span className="text-[10px] tracking-[0.25em] text-slate-600 uppercase">
                  {item.hint}
                </span>
              </span>
            </button>
          )
        })}
      </nav>

      <div className="border-t border-edge px-5 py-4">
        <div className="text-[10px] tracking-[0.3em] text-slate-500 uppercase">
          Current Sol
        </div>
        <div className="font-mono text-2xl font-bold text-accent">
          {sol ?? '—'}
        </div>
      </div>
    </aside>
  )
}
