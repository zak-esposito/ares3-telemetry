# ARES 3 Telemetry Dashboard — CLAUDE.md

> Mission Control for Mark Watney's survival on Mars.
> A Spring Boot + React portfolio project targeting CERN graduate roles.

---

## Project Overview

A full-stack Mars habitat telemetry dashboard inspired by Andy Weir's *The Martian*.

- **Spring Boot 3.x REST API** serving simulated habitat telemetry data (O2, CO2, power, water, food, crop status) seeded with real numbers from the book
- **NASA Mars Rover Photos API** integrated via a Spring proxy service — live photos from Curiosity on Mars
- **Claude API endpoint** that analyses current telemetry and returns a Watney-style survival recommendation
- **React + TypeScript frontend** styled as a dark mission-control dashboard
- **Docker + GitHub Actions CI** — containerised, CI on every push

**Why this exists:** To demonstrate Java/Spring Boot + React full-stack capability for the CERN graduate programme (ref: FAP-BC-DL-2026-143-GRAE, deadline 14 June 2026). CERN's AMM/BC teams build dashboards over real-time equipment data — this project maps directly onto that.

---

## Target Role

**CERN Junior Full-Stack Software Engineer**
Reference: `FAP-BC-DL-2026-143-GRAE`
Deadline: **14 June 2026 at 23:59 CET**
Stack required: Java, Spring Boot, React, SQL, Git, CI/CD, containerisation

Every architectural decision in this project is made with that spec in mind.

---

## Tech Stack

### Backend
- Java 21
- Spring Boot 3.x
- Spring Web (REST)
- Spring Data JPA
- H2 in-memory database (dev) — file-persisted for demo mode
- Spring Validation (`@Valid`, `@NotNull`)
- Spring Boot Actuator (health + metrics endpoints)
- Lombok
- JUnit 5 + Mockito (unit tests)
- Maven

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts (resource forecast chart)
- Axios (HTTP client)

### Infrastructure
- Docker + Docker Compose (multi-stage backend build, slim JRE image)
- GitHub Actions CI (backend: `mvn test` on push; frontend: `npm ci && npm run build`)
- Vercel (frontend deploy)
- Render or Railway (backend deploy, free tier)

---

## Repository Structure

```
ares3-telemetry/
├── CLAUDE.md                        ← you are here
├── README.md
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml
├── brand_assets/                    ← screenshots, diagrams, reference images
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/ares3/telemetry/
│       │   ├── controller/
│       │   │   ├── TelemetryController.java
│       │   │   ├── RoverPhotoController.java
│       │   │   └── WatneyAdvisorController.java
│       │   ├── service/
│       │   │   ├── TelemetryService.java
│       │   │   ├── NasaRoverService.java
│       │   │   └── ClaudeAdvisorService.java
│       │   ├── model/
│       │   │   ├── HabSnapshot.java        ← JPA entity
│       │   │   ├── SystemStatus.java       ← enum: NOMINAL / DEGRADED / FAILURE
│       │   │   ├── RoverPhotoDto.java
│       │   │   └── WatneyAdviceDto.java
│       │   ├── repository/
│       │   │   └── HabSnapshotRepository.java
│       │   └── exception/
│       │       └── GlobalExceptionHandler.java
│       └── test/java/com/ares3/telemetry/
│           ├── TelemetryServiceTest.java
│           └── NasaRoverServiceTest.java
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── api/
        │   └── client.ts
        ├── components/
        │   ├── MissionControl/
        │   ├── WatneyLog/
        │   ├── RoverOps/
        │   └── ResourceForecast/
        └── types/
            └── telemetry.ts
```

---

## REST API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/telemetry/current` | Latest hab snapshot |
| GET | `/api/telemetry/history?sols=10` | Last N sol readings |
| GET | `/api/telemetry/systems` | All system statuses |
| POST | `/api/telemetry/simulate` | Advance time by N sols |
| GET | `/api/rover/photos?sol={n}` | NASA Rover photos for given sol |
| GET | `/api/rover/latest` | Latest Curiosity photos |
| POST | `/api/advisor/analyse` | Claude analysis of current telemetry |
| GET | `/actuator/health` | Spring health check |

---

## Frontend Views

1. **Mission Control** — Sol counter, atmosphere gauges (O2/CO2/pressure/temp), resource bars (food sols, water litres, battery %), system status panel (Oxygenator / Water Reclaimer / Atmo Regulator), ADVANCE SOL button, 30s auto-refresh
2. **Watney's Log** — Latest Claude recommendation formatted as a log entry, "Request Analysis" button, scrollable history
3. **Rover Ops** — NASA photo grid, sol selector, camera filter (FHAZ, RHAZ, MAST, CHEMCAM)
4. **Resource Forecast** — Recharts line chart projecting food/water/power over next 100 sols

---

## Environment Variables

### Backend (`backend/.env` or environment)
```
NASA_API_KEY=your_nasa_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Get NASA key free at: https://api.nasa.gov/
Get Anthropic key at: https://console.anthropic.com/

### Frontend
```
VITE_API_BASE_URL=http://localhost:8080
```

---

## The Martian Simulation Numbers

These are canonical numbers from Andy Weir's novel. Use them to seed simulation logic in TelemetryService.

### Time
- One Martian sol = 24 hours 39 minutes (Earth time)
- Watney stranded: Sol 6 through approximately Sol 549
- Total survival duration: ~543 sols

### Survival targets
- Calories required per sol: **1,500 kcal**
- Initial food supply: **400 sols** (at 1,500 kcal/sol)
- Total sols needed: **1,400** (original mission duration including rescue)
- Caloric shortfall: ~1,500,000 kcal (to be bridged by potato farming)

### Water
- Water needed to support the potato farm: **618 litres**
- Water available in Hab at start: **300 litres**
- Shortfall: 318 litres (manufactured by burning hydrazine from MAV fuel supply)

### Atmosphere (Hab interior targets)
- O2: **21%** (±2% acceptable range; >25% = fire risk; <16% = hypoxia)
- CO2: **<1%** (>5% = lethal within minutes)
- N2: ~78% (buffer gas)
- Internal pressure: **101 kPa** (sea-level equivalent)
- Internal temperature: **295 K** (~22°C)

### External conditions (Acidalia Planitia)
- Location: 31.3°N, 331.3°E (real coordinates)
- Avg external temp: **210 K** (-63°C)
- Temp range: 150 K to 300 K (seasonal/diurnal swing)
- Atmospheric pressure: ~0.6 kPa (<1% of Earth)

### Power
- RTG output: **~100W continuous** (radioisotope thermoelectric generator — nuclear, not solar)
- Rover solar panels: variable (dust accumulation degrades output over time)
- Battery capacity (rover): finite, rechargeable via solar

### Crop farm
- Farm area inside Hab: **~126 m²**
- Growth cycle: ~**80 sols** per potato harvest
- Yield: enough to contribute toward caloric needs; not sufficient alone for 1,400 sols

### EVA
- Total CO2 filter hours at mission start: **~1,500 hours**
- EVA budget: 4 hours per crew member per day (mission-planned)

### Systems modelled
| System | Nominal state | Failure consequence |
|--------|---------------|---------------------|
| Oxygenator | Converts CO2 → O2 continuously | O2 drops, CO2 rises — lethal within hours |
| Water Reclaimer | Recovers water vapour | Water supply depletes |
| Atmospheric Regulator | Maintains pressure balance | Pressure loss — explosive decompression risk |
| RTG | 100W continuous | Power loss — heating, computing, life support |
| Hab integrity | Sealed | Breach = immediate pressure loss |

### Initial simulation state (Sol 6, mission abort)
```
sol: 6
foodSolsRemaining: 400.0
waterLitres: 300.0
o2Percentage: 21.0
co2Percentage: 0.04
internalTempKelvin: 295.0
internalPressureKPa: 101.0
rtgWatts: 100.0
solarWatts: 45.0  (degraded by storm dust)
batteryPercent: 72.0
farmAreaM2: 0.0   (not yet planted)
cropDaysSincePlanted: 0
estimatedPotatoKg: 0.0
evaHoursRemaining: 1500.0
oxygenatorStatus: NOMINAL
waterReclaimerStatus: NOMINAL
atmosphericRegulatorStatus: NOMINAL
```

---

## Build Rules

### Workflow
1. **Plan Mode first.** Before writing any code, present a plan for approval. No implementation until the plan is signed off.
2. **No pushing to GitHub** until explicitly told to. Commit locally as needed.
3. **No deviations from the approved architecture** without flagging first.
4. **One concern per file.** Controllers call services. Services call repositories or external APIs. No business logic in controllers.
5. **Thin controllers.** Controllers handle HTTP only — request parsing, response building, status codes. All logic lives in services.

### Code standards
- All endpoints must return **consistent JSON** — use a response wrapper or Spring's `ResponseEntity` consistently
- **Validate all inputs** with `@Valid` and appropriate annotations
- **Handle all exceptions** through `GlobalExceptionHandler` — no stack traces to clients
- Use `@Slf4j` for logging — structured logs, not `System.out.println`
- Every service class must have at least one unit test
- No hardcoded API keys — environment variables only

### Spring Boot specifics
- Use constructor injection (not `@Autowired` on fields) — easier to test
- Use `RestTemplate` bean (not inline instantiation) for external API calls
- JPA entities get their own package; DTOs get their own package — never expose JPA entities directly from controllers
- Use `@ControllerAdvice` + `@ExceptionHandler` for error handling
- Actuator endpoints should be on `/actuator/**`

### Frontend specifics
- All API calls go through `src/api/client.ts` — no direct axios calls in components
- TypeScript strict mode — no `any` types
- Loading and error states required for every API-connected component
- Dark theme — mission control aesthetic. Background: `#0a0a0f`. Accent: `#00ff88` (green) or `#ff4444` (red for warnings)

### Docker
- Backend: multi-stage Dockerfile (Maven build stage → `eclipse-temurin:21-jre-alpine` runtime)
- Frontend: multi-stage (Node build → nginx:alpine serve)
- API keys passed as environment variables — never baked into images

---

## Simulation Logic (reference for TelemetryService)

When `/api/telemetry/simulate` is called with `{ sols: N }`:

1. Load latest `HabSnapshot`
2. For each sol being simulated:
   - **Food**: decrease `foodSolsRemaining` by 1.0 (if farm active, add `estimatedPotatoKg / 0.4` converted to calories)
   - **CO2 filters**: decrease `evaHoursRemaining` by 4.0 (standard EVA day)
   - **Oxygenator**: if NOMINAL, maintain O2 at 21% and CO2 at 0.04%; if DEGRADED, O2 drifts toward 18%, CO2 rises toward 2%; if FAILURE, rapid deterioration
   - **Water**: if `waterReclaimerStatus == NOMINAL`, slowly tick up by +0.5L/sol (condensate recovery); if FAILURE, no recovery
   - **Crops**: if `farmAreaM2 > 0`, increment `cropDaysSincePlanted`; at sol 80, add `farmAreaM2 * 0.038` kg of potatoes (yield estimate)
   - **Power**: apply `solarWatts * 0.9995` per sol (dust degradation) — RTG stays constant at 100W
3. Save new `HabSnapshot` with incremented sol
4. Return the new snapshot

Random events (10% chance per simulated sol): pick one from [MICROMETEORITE_STRIKE, DUST_STORM, SYSTEM_GLITCH, CROP_DISEASE] — these flip a system to DEGRADED status and give the Claude advisor something interesting to respond to.

---

## Key Reference URLs

- CERN careers: https://careers.cern/
- Target role: https://www.unjobnet.org/jobs/detail/86486248
- NASA API portal: https://api.nasa.gov/
- Mars Rover Photos API: `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/`
- Curiosity latest photos: `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/latest_photos?api_key=DEMO_KEY`
- Anthropic API: https://docs.anthropic.com/en/api/messages
- Spring Initializr: https://start.spring.io/
- The Martian Wikia (Hab details): https://the-martian.fandom.com/wiki/The_Hab

---

*"I'm going to have to science the shit out of this." — Mark Watney, Sol 6*
