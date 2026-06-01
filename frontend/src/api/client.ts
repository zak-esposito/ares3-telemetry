import axios, { AxiosError } from 'axios'
import type {
  ApiError,
  HabSnapshotDto,
  RoverPhotoDto,
  SystemStatusMap,
  WatneyAdviceDto,
} from '../types/telemetry'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

/**
 * Error carrying the clean backend message plus HTTP status, so components can
 * render a friendly line (and branch on `status === 502` for upstream outages)
 * instead of an Axios stack blob.
 */
export class ApiClientError extends Error {
  readonly status: number | null
  constructor(message: string, status: number | null) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
  }
}

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    'status' in value
  )
}

// Normalise every failure into an ApiClientError before it reaches a component.
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const data = error.response?.data
    const status = error.response?.status ?? null
    if (isApiError(data)) {
      return Promise.reject(new ApiClientError(data.message, data.status))
    }
    if (error.code === 'ERR_NETWORK') {
      return Promise.reject(
        new ApiClientError(
          'Cannot reach mission control backend. Is it running on ' +
            baseURL +
            '?',
          null,
        ),
      )
    }
    return Promise.reject(
      new ApiClientError(error.message || 'Unknown request error', status),
    )
  },
)

// ---- Telemetry ----

export async function getCurrent(): Promise<HabSnapshotDto> {
  const { data } = await http.get<HabSnapshotDto>('/api/telemetry/current')
  return data
}

export async function getHistory(sols: number): Promise<HabSnapshotDto[]> {
  const { data } = await http.get<HabSnapshotDto[]>('/api/telemetry/history', {
    params: { sols },
  })
  return data
}

export async function getSystems(): Promise<SystemStatusMap> {
  const { data } = await http.get<SystemStatusMap>('/api/telemetry/systems')
  return data
}

export async function simulate(sols: number): Promise<HabSnapshotDto> {
  const { data } = await http.post<HabSnapshotDto>('/api/telemetry/simulate', {
    sols,
  })
  return data
}

// ---- Rover photos ----

export async function getLatestPhotos(): Promise<RoverPhotoDto[]> {
  const { data } = await http.get<RoverPhotoDto[]>('/api/rover/latest')
  return data
}

export async function getPhotos(sol: number): Promise<RoverPhotoDto[]> {
  const { data } = await http.get<RoverPhotoDto[]>('/api/rover/photos', {
    params: { sol },
  })
  return data
}

// ---- Advisor ----

export async function requestAnalysis(): Promise<WatneyAdviceDto> {
  const { data } = await http.post<WatneyAdviceDto>('/api/advisor/analyse')
  return data
}
