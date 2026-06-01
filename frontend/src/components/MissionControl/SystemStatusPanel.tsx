import StatusPill from '../common/StatusPill'
import { systemSeverity } from '../../lib/status'
import type { SystemStatus } from '../../types/telemetry'

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

  return (
    <div className="rounded-lg border border-edge bg-panel p-5">
      <h2 className="mb-4 text-xs tracking-[0.25em] text-slate-400 uppercase">
        Life Support
      </h2>
      <div className="flex flex-col gap-3">
        {systems.map((system) => (
          <div
            key={system.label}
            className="flex items-center justify-between gap-3"
          >
            <span className="text-sm text-slate-300">{system.label}</span>
            <StatusPill
              label={system.status}
              severity={systemSeverity(system.status)}
            />
          </div>
        ))}
      </div>

      {lastEvent && (
        <div className="mt-4 rounded border border-warn/40 bg-warn/10 px-3 py-2 text-xs text-warn">
          <span className="tracking-[0.25em] uppercase">Event:</span>{' '}
          {lastEvent.replaceAll('_', ' ')}
        </div>
      )}
    </div>
  )
}
