// Type mirrors of the Spring Boot backend DTOs.
// Responses are raw DTOs (no wrapper envelope); enums serialise as UPPERCASE strings.

export type SystemStatus = 'NOMINAL' | 'DEGRADED' | 'FAILURE'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

/** GET /api/telemetry/current — latest habitat snapshot. */
export interface HabSnapshotDto {
  sol: number
  foodSolsRemaining: number
  waterLitres: number
  o2Percentage: number
  co2Percentage: number
  internalTempKelvin: number
  internalPressureKPa: number
  rtgWatts: number
  solarWatts: number
  batteryPercent: number
  farmAreaM2: number
  cropDaysSincePlanted: number
  estimatedPotatoKg: number
  evaHoursRemaining: number
  oxygenatorStatus: SystemStatus
  waterReclaimerStatus: SystemStatus
  atmosphericRegulatorStatus: SystemStatus
  lastEvent: string | null
}

/** POST /api/advisor/analyse — Watney-style survival advice. */
export interface WatneyAdviceDto {
  sol: number
  advice: string
  riskLevel: RiskLevel
  timestamp: string // ISO-8601 UTC
}

/** GET /api/rover/photos | /api/rover/latest — NASA Curiosity photo. */
export interface RoverPhotoDto {
  sol: number
  earthDate: string
  imgSrc: string
  cameraName: string
  roverId: number
}

/** POST /api/telemetry/simulate request body. */
export interface SimulateRequest {
  sols: number
}

/** GET /api/telemetry/systems — map of system name -> status. */
export type SystemStatusMap = Record<string, SystemStatus>

/** Standard backend error body (GlobalExceptionHandler). */
export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}
