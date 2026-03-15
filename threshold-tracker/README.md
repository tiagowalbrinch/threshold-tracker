# Threshold Tracker

Small personal app to track FPS aim training performance using the **threshold method**.

This monorepo contains:

- `apps/api` – ASP.NET Core Web API (C#, .NET LTS, EF Core, PostgreSQL)
- `apps/web` – Angular frontend (standalone components, Angular Material)
- `infrastructure/docker` – Docker Compose for PostgreSQL
- `docs` – Architecture, schema, and setup notes

## High-level Architecture

- **Domain**: Core entities and business rules (`Map`, `ScoreEntry`, threshold logic).
- **Application**: Services, DTOs, and use cases.
- **Infrastructure**: EF Core, PostgreSQL, repositories, external provider abstractions.
- **API**: ASP.NET Core controllers, request/response DTOs, DI wiring.

The backend is structured to support future external integrations via `IScoreImportService` and `IExternalScoreProvider` abstractions.

## Getting Started (Quick)

1. Install:
   - .NET SDK (latest LTS)
   - Node.js (LTS) + npm
   - Angular CLI (`npm install -g @angular/cli`)
   - Docker Desktop
2. Start PostgreSQL via Docker:

   ```bash
   cd infrastructure/docker
   docker compose up -d
   ```

3. Apply EF Core migrations and run the API:

   ```bash
   cd apps/api
   dotnet restore
   dotnet ef database update
   dotnet run
   ```

4. Run the Angular app:

   ```bash
   cd apps/web
   npm install
   npm start
   ```

5. Open the frontend at `http://localhost:4200` and the API at `http://localhost:5000` (configurable).

More details are in `docs/SETUP.md`.

