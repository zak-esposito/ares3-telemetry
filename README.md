# Ares 3 Telemetry Dashboard

> Mission Control for Mark Watney's survival on Mars.

A full-stack telemetry dashboard built with Spring Boot + React, integrating the NASA Mars Rover Photos API and Claude AI for Watney-style survival recommendations.

**Portfolio project targeting CERN FAP-BC-DL-2026-143-GRAE (deadline 14 June 2026).**

## Stack
- Java 21 / Spring Boot 3.x / Spring Data JPA / H2
- React 18 / TypeScript / Tailwind CSS / Recharts
- Docker + GitHub Actions CI

## Quick start
```bash
# Requires: NASA_API_KEY and ANTHROPIC_API_KEY in environment
docker-compose up
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
# API docs: http://localhost:8080/actuator/health
```

## Build notes
See `CLAUDE.md` for full architecture, simulation numbers, and build rules.
