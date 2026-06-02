import InstrumentPanel from '../common/InstrumentPanel'
import StatusPill from '../common/StatusPill'
import { systemSeverity, type Severity } from '../../lib/status'
import type { SystemStatus } from '../../types/telemetry'

const RANK: Record<Severity, number> = { nominal: 0, warn: 1, danger: 2 }

interface SystemStatusPanelProps {
  oxygenator: SystemStatus
  waterReclaimer: SystemStatus
  atmosphericRegulator: SystemStatus
  lastEvent: string | null
}

interface SystemRow {
  label: string
  status: SystemStatus
}

export default function SystemStatusPanel({
  oxygenator,
  waterReclaimer,
  atmosphericRegulator,
  lastEvent,
}: SystemStatusPanelProps) {
  const systems: SystemRow[] = [
    { label: 'Oxygenator', status: oxygenator },
    { label: 'Water Reclaimer', status: waterReclaimer },
    { label: 'Atmospheric Regulator', status: atmosphericRegulator },
  ]

  // Header LED reflects the worst system on the panel.
  const worst = systems.reduce<Severity>((acc, s) => {
    const sev = systemSeverity(s.status)
    return RANK[sev] > RANK[acc] ? sev : acc
  }, 'nominal')

  return (
    <InstrumentPanel title="Life Support" code="LSS" led={worst}>
      <div className="flex flex-col">
        {systems.map((system, i) => (
          <div
            key={system.label}
            className={`flex items-center justify-between gap-3 py-2.5 ${i > 0 ? 'border-t border-edge/60' : ''}`}
          >
            <span className="text-[11px] tracking-[0.2em] text-slate-300 uppercase">
              {system.label}
            </span>
            <StatusPill
              label={system.status}
              severity={systemSeverity(system.status)}
            />
          </div>
        ))}
      </div>

      {lastEvent && (
        <div className="a-blink mt-4 flex items-center gap-2 border border-warn/50 bg-warn/10 px-3 py-2 text-xs text-warn">
          <span className="text-sm leading-none">⚠</span>
          <span className="tracking-[0.25em] uppercase">Event</span>
          <span className="font-mono tracking-wider text-warn/90">
            {lastEvent.replaceAll('_', ' ')}
          </span>
        </div>
      )}
    </InstrumentPanel>
  )
}
