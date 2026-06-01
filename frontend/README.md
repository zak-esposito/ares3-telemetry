# ARES 3 — Frontend

Mission-control dashboard for the ARES 3 Hab telemetry API. React 18 + TypeScript + Vite, styled as a dark Mars-habitat console.

## Stack

- **React + TypeScript** (strict mode, no `any`)
- **Vite** dev server / bundler
- **Tailwind CSS v4** (`@tailwindcss/vite`, CSS `@theme` tokens in `src/index.css`)
- **Recharts** — resource-forecast chart
- **Axios** — HTTP, funnelled through a single client (`src/api/client.ts`)

## Prerequisites

The Spring Boot backend must be running on `http://localhost:8080` (its CORS config
allows `http://localhost:5173`).

## Setup

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Environment (`.env.local`, already created):

```
VITE_API_BASE_URL=http://localhost:8080
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server on port 5173 |
| `npm run build` | Type-check (`tsc -b`) + production build |
| `npm run lint` | ESLint |
| `npm run preview` | Serve the production build |

## Views

1. **Mission Control** — sol counter, radial atmosphere gauges (O₂ / CO₂ / pressure / temp),
   resource bars (food / water / battery), life-support status pills, `ADVANCE SOL`
   (`POST /api/telemetry/simulate`), 30 s auto-refresh.
2. **Watney's Log** — `Request Analysis` (`POST /api/advisor/analyse`); each reply rendered as
   `[SOL n] …` with a colour-coded risk badge; scrollable session history.
3. **Rover Ops** — NASA Curiosity photo grid (`/api/rover/latest`, `/api/rover/photos?sol=`);
   degrades to a "Live feed unavailable" panel when the relay is down.
4. **Resource Forecast** — Recharts projection of food / water / battery over the next 100 sols.

## Architecture notes

- **All** network access lives in `src/api/client.ts`; components never call axios directly.
- Backend DTOs are mirrored exactly in `src/types/telemetry.ts`.
- Colour/threshold logic is centralised in `src/lib/status.ts`.
- Every API-connected component has loading and error states; failures surface the backend's
  `ApiError.message` via `ApiClientError`, never a raw stack trace.
