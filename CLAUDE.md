# ThresholdTracker — Claude Guidelines

## Mandatory: Keep Docs in Sync

After **any** change to the codebase — new feature, refactor, bug fix, schema change, new endpoint, new component, config change — you MUST update:

1. **`architecture.excalidraw`** (project root)
   - Update the relevant section(s): Auth Flow, Task Flow, Score Flow, Profile, Infrastructure, Data Model
   - Add new entities, endpoints, or components as boxes/arrows
   - Remove or edit anything that no longer reflects reality
   - Open format: JSON, edit the `elements` array directly

2. **`threshold-tracker/README.md`**
   - Keep the endpoints table up to date
   - Update "Key Features" if behaviour changes
   - Update "Getting Started" if setup steps change
   - Update the architecture overview if layers change

These are not optional. Outdated docs are treated as bugs.

## Project Structure

```
ThresholdTracker/
├── architecture.excalidraw       ← always update
├── Dockerfile                    ← multi-stage .NET 8 build
└── threshold-tracker/
    ├── README.md                 ← always update
    └── apps/
        ├── api/                  ← .NET 8 ASP.NET Core
        └── web/                  ← Angular 21
```

## Backend (apps/api)

- **Language / Framework**: C# 12, .NET 8, ASP.NET Core
- **ORM**: EF Core 8 with Npgsql (PostgreSQL)
- **Auth**: ASP.NET Core Identity + JWT Bearer (`MapInboundClaims = false`)
- **JSON**: snake_case via `JsonNamingPolicy.SnakeCaseLower`
- **Error handling**: `GlobalExceptionHandler` → ProblemDetails
  - `DuplicateTaskException` → 409 + `existingTaskId`
  - `UnauthorizedException` → 403
  - `ArgumentException` → 400
  - `KeyNotFoundException` → 404
- **Repositories**: use `ExecuteUpdateAsync` / `ExecuteDeleteAsync` to avoid NoTracking pitfalls
- **Migration**: after any schema change, run `dotnet ef migrations add <Name>` and commit the migration

## Frontend (apps/web)

See `apps/web/CLAUDE.md` for Angular-specific rules (Tailwind, signals, SSR, control flow).

- **API base URL**: from `src/environments/environment.ts` (`apiUrl`)
- **Auth**: `AuthService` — JWT in localStorage (SSR-safe), `currentUser` signal
- **HTTP**: `AuthInterceptor` attaches Bearer token automatically
- **Real providers active**: `app.config.ts` uses `realProviders` (not mock)

## Common Pitfalls

- `User.FindFirstValue(JwtRegisteredClaimNames.Sub)` works because `MapInboundClaims = false` — do not remove this option
- Do NOT use `DefaultInboundClaimTypeMap.Clear()` — it is ineffective in .NET 8 (uses `JsonWebTokenHandler`)
- Always use `isPlatformBrowser()` before accessing `localStorage` or `window`
