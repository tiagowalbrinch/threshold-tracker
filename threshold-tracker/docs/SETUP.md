## Threshold Tracker – Setup & Architecture

### 1. Monorepo Structure

- **`apps/api`**: ASP.NET Core Web API (C#, .NET LTS)
  - `Domain`: Entities and domain services
  - `Application`: DTOs, application services, validators
  - `Infrastructure`: EF Core DbContext, repositories, migrations
  - `Api`: Controllers, DI setup, API contracts
- **`apps/web`**: Angular app (standalone components + Angular Material)
- **`infrastructure/docker`**: Docker Compose for PostgreSQL
- **`docs`**: Documentation

### 2. Prerequisites

- .NET SDK (latest LTS)
- Node.js (LTS) & npm
- Angular CLI (`npm install -g @angular/cli`)
- Docker Desktop (or compatible)

### 3. Database (PostgreSQL via Docker)

From the repo root:

```bash
cd infrastructure/docker
docker compose up -d
```

Default configuration:

- Host: `localhost`
- Port: `5432`
- Database: `thresholdtracker`
- User: `threshold_user`
- Password: `threshold_password`

These values are configured in `apps/api/appsettings.Development.json`.

### 4. Backend – ASP.NET Core API

From the repo root:

```bash
cd apps/api
dotnet restore
dotnet ef database update   # apply initial migration
dotnet run
```

The API will listen on `http://localhost:5000` by default (see `appsettings.json` / `launchSettings.json`).

#### 4.1 Database Schema (EF Core)

Core tables:

```sql
CREATE TABLE maps (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    record INTEGER NULL,
    threshold INTEGER NOT NULL,
    current_score INTEGER NULL,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE score_entries (
    id UUID PRIMARY KEY,
    map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_score_entries_map_id_created_at ON score_entries (map_id, created_at DESC);
```

`MapStats` is exposed as a DTO from the API and is based on the `maps` table plus derived values (e.g., latest score).

### 5. Frontend – Angular App

From the repo root:

```bash
cd apps/web
npm install
npm start
```

By default the app runs at `http://localhost:4200` and expects the API at `http://localhost:5000`.

### 6. Example API Requests

Base URL: `http://localhost:5000`

#### 6.1 Create Map

`POST /maps`

```http
POST http://localhost:5000/maps
Content-Type: application/json

{
  "name": "Aimlab Gridshot",
  "record": 90000,
  "threshold": 85000,
  "currentScore": 87000
}
```

#### 6.2 List Maps

`GET /maps`

```http
GET http://localhost:5000/maps
Accept: application/json
```

#### 6.3 Update Map

`PATCH /maps/{id}`

```http
PATCH http://localhost:5000/maps/{id}
Content-Type: application/json

{
  "record": 92000,
  "threshold": 88000,
  "currentScore": 91000
}
```

#### 6.4 Delete Map

```http
DELETE http://localhost:5000/maps/{id}
```

#### 6.5 Add Score

`POST /maps/{id}/scores`

```http
POST http://localhost:5000/maps/{id}/scores
Content-Type: application/json

{
  "score": 87500
}
```

#### 6.6 List Score History

`GET /maps/{id}/scores`

```http
GET http://localhost:5000/maps/{id}/scores
Accept: application/json
```

### 7. Future Integrations

The backend defines:

- `IExternalScoreProvider`
- `IScoreImportService`

These abstractions allow future implementations like `AimlabsScoreProvider` to fetch and import scores automatically without changing the core application logic.

