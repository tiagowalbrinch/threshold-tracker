# ThresholdTracker

A personal app to track FPS aim training performance using the **threshold method** — sync your Aimlabs tasks, set a target score, and see when you consistently exceed it.

This monorepo contains:

- `apps/api` – ASP.NET Core 8 Web API (C#, EF Core 8, PostgreSQL, JWT auth)
- `apps/web` – Angular 21 frontend (standalone components, Tailwind CSS, signals)

## Architecture

See [`architecture.excalidraw`](../architecture.excalidraw) for the full interactive diagram (open in [Excalidraw](https://excalidraw.com)).

### Overview

```
Vercel (Angular SPA)
       │ HTTPS
       ▼
Railway (.NET 8 API, Docker)
       │ EF Core / Npgsql          ┌──────────────────────────┐
       ▼                           │  Aimlabs GraphQL API     │
Railway (PostgreSQL 16)            │  api.aimlab.gg/graphql   │
                                   │  (public, unauthenticated)│
                                   └──────────────────────────┘
```

### Backend layers

- **Domain** — `UserTaskStat`, `AimTask` (global catalog), `PlayAttempt`, `ApplicationUser` (Identity)
- **Application** — Services (`AuthService`, `ProfileService`, `UserTaskStatService`, `SyncService`), DTOs
- **Infrastructure** — EF Core (`AppDbContext`), `AimlabsClient` (`IAimTrainerClient`), Identity + JWT Bearer config
- **API** — Controllers, snake_case JSON, global exception handler, CORS, Swagger with Bearer

### Frontend structure

- `services/auth.service.ts` — JWT stored in localStorage, signals-based `currentUser`; `loadProfile()` fetches and caches `aimlabsUsername`
- `interceptors/auth.interceptor.ts` — attaches `Authorization: Bearer` to all requests
- `guards/auth.guard.ts` — redirects unauthenticated users to `/login`
- `services/sync.service.ts` — calls `POST /sync` and `GET /leaderboard`
- `services/sync-polling.service.ts` — polls `POST /sync` every 60s while user is logged in with a linked Aimlabs account
- `app.ts` — coordinates profile load on startup and sync polling lifecycle via signals `effect()`
- `features/` — dashboard (two-tab: My Tasks / All Tasks), task-details, leaderboard, login, register, profile pages
- `components/` — task-card (with trend indicator), task-catalog-card (public catalog), score-chart, score-history-table, stats-overview, threshold-indicator (hero card), threshold-settings, etc.

## Key Features

| Feature | Details |
|---------|---------|
| JWT Auth | Register / login, 24h token expiry |
| Aimlabs sync | Auto-sync on login + periodic every 60s + manual button in profile |
| Per-user thresholds | Each user sets their own target score per task (`PATCH /tasks/{id}/threshold`) |
| Threshold hero card | Task Details shows status badge (above/below), gap message, and last-5-session trend |
| Score chart | Individual play attempts from Aimlabs, date-range filter, threshold reference line |
| Dashboard trends | Each task card shows ↑/↓/— trend based on last 5 plays vs overall average |
| Dashboard two-tab | "My Tasks" (logged, personal data) / "All Tasks" (public catalog, no auth required) |
| Global task catalog | `aim_tasks` table populated by any user's sync; `GET /catalog` (public, paginated) |
| Catalog card | Public view: best player nick, avg score, best score, player count |
| Leaderboard | Cross-user PB ranking for any task (`GET /leaderboard?task_id=`) |
| Profile settings | Default sensitivity, FOV, DPI; Aimlabs username linkage with race-condition guard |

## Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js (LTS) + npm
- Docker Desktop

### 1. Start PostgreSQL

```bash
docker run -d --name pg-threshold \
  -e POSTGRES_DB=thresholdtracker \
  -e POSTGRES_USER=threshold_user \
  -e POSTGRES_PASSWORD=threshold_password \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Configure the JWT key

Edit `apps/api/appsettings.json` and set `Jwt.Key` to a random 32+ character string:

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 3. Run the API

```bash
cd apps/api
dotnet restore
dotnet ef database update
dotnet run
# → http://localhost:5000
# → http://localhost:5000/swagger
```

### 4. Run the Angular app

```bash
cd apps/web
npm install
npm start
# → http://localhost:4200
```

### 5. Link your Aimlabs account

1. Register an account and log in
2. Go to **Profile**, enter your Aimlabs username, and save
3. Click **Sync Now** — your tasks will be imported from Aimlabs
4. On your next login, tasks will sync automatically. While the app is open, it re-syncs every 60 seconds.

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | — | Register, returns JWT |
| POST | `/auth/login` | — | Login, returns JWT |
| GET | `/profile` | ✓ | Get profile + defaults |
| PATCH | `/profile` | ✓ | Update profile (incl. `aimlabs_username`) |
| POST | `/sync` | ✓ | Pull all tasks from Aimlabs, upsert cache |
| GET | `/tasks` | ✓ | Synced tasks for current user (filters: name, category, order_by, played_from, played_to) |
| GET | `/tasks/{taskId}` | ✓ | Single task stat |
| PATCH | `/tasks/{taskId}/threshold` | ✓ | Set personal threshold for a task |
| GET | `/scores?task_id=&from=&to=` | ✓ | Individual play attempts (proxied from Aimlabs) |
| GET | `/scores/paged?task_id=&page=&page_size=` | ✓ | Paginated play attempts (desc) |
| POST | `/sync/plays?task_id=` | ✓ | Incremental sync of plays for a specific task |
| GET | `/catalog` | — | Global task catalog (filters: name, category, order_by; paginated) |
| GET | `/leaderboard?task_id=` | — | All users ranked by PB for a task |

## Deployment

See `architecture.excalidraw` for the full infra diagram.

| Layer | Service |
|-------|---------|
| Angular SPA | Vercel (free, CI/CD from GitHub) |
| .NET 8 API | Railway (Docker deploy) |
| PostgreSQL | Railway (free 500MB) |

**Railway env vars required:**
- `ConnectionStrings__DefaultConnection`
- `Jwt__Key`
- `AllowedOrigins` (your Vercel domain)

The API auto-migrates on startup in production.
