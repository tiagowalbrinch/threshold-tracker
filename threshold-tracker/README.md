# ThresholdTracker

A personal app to track FPS aim training performance using the **threshold method** — set a target score, track your attempts, and see when you consistently exceed it.

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
       │ EF Core / Npgsql
       ▼
Railway (PostgreSQL 16)
```

### Backend layers

- **Domain** — `AimTask`, `ScoreAttempt`, `ApplicationUser` (Identity), `TaskCategory` enum
- **Application** — Services (`AuthService`, `ProfileService`, `AimTaskService`, `ScoreAttemptService`), DTOs, exceptions
- **Infrastructure** — EF Core repositories, Identity + JWT Bearer config
- **API** — Controllers, snake_case JSON, global exception handler, CORS, Swagger with Bearer

### Frontend structure

- `services/auth.service.ts` — JWT stored in localStorage, signals-based `currentUser`
- `interceptors/auth.interceptor.ts` — attaches `Authorization: Bearer` to all requests
- `guards/auth.guard.ts` — redirects unauthenticated users to `/login`
- `features/` — dashboard, task-details, login, register, profile pages
- `components/` — task-card, score-chart, score-history-table, add-score-dialog, add-task-dialog, etc.

## Key Features

| Feature | Details |
|---------|---------|
| JWT Auth | Register / login, 24h token expiry |
| Task CRUD | Creator-only edit/delete, 409 on duplicate name |
| Paginated tasks | `GET /tasks?page=1&pageSize=20`, infinite scroll on frontend |
| Score tracking | Auto-detects PB, resolves missing sens/FOV/DPI from profile defaults |
| "My Scores" filter | `GET /scores?task_id=...&mine=true` |
| Profile settings | Default sensitivity, FOV, DPI pre-filled in add-score dialog |

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

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | — | Register, returns JWT |
| POST | `/auth/login` | — | Login, returns JWT |
| GET | `/profile` | ✓ | Get profile + defaults |
| PATCH | `/profile` | ✓ | Update profile + defaults |
| GET | `/tasks` | — | Paginated task list |
| GET | `/tasks/{id}` | — | Single task |
| POST | `/tasks` | ✓ | Create task (409 if duplicate) |
| PATCH | `/tasks/{id}` | ✓ | Update (403 if not creator) |
| DELETE | `/tasks/{id}` | ✓ | Delete (403 if not creator) |
| GET | `/scores?task_id=` | — | All scores for task |
| GET | `/scores?task_id=&mine=true` | ✓ | My scores only |
| POST | `/scores` | ✓ | Add score (auto-PB, resolves defaults) |
| DELETE | `/scores/{id}` | ✓ | Delete (403 if not owner) |

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
