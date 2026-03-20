# ThresholdTracker Web — Claude Guidelines

## Angular Skills
Always follow the Angular skills provided in the system prompt for all component, service, routing, form, HTTP, SSR, and DI work:
- Components: `angular-component` skill (standalone, OnPush optional)
- Dependency injection: `angular-di` skill
- Directives: `angular-directives` skill
- Forms: `angular-forms` skill
- HTTP / data fetching: `angular-http` skill
- Routing: `angular-routing` skill
- Reactive state: `angular-signals` skill
- SSR / hydration: `angular-ssr` skill
- Testing: `angular-testing` skill
- CLI / tooling: `angular-tooling` skill

## UI / Styling — Tailwind CSS
All styling uses **Tailwind CSS v3** utility classes. Do not use PrimeNG components.
- Global base styles live in `src/styles.css` (`@tailwind base/components/utilities` + dark body)
- Do not write component `.scss` files — use Tailwind classes inline in templates
- Color palette: violet (`violet-600`), cyan (`cyan-400`), amber (`amber-400`), rose (`rose-400`), emerald
- Dark backgrounds: `bg-[#08080d]`, `bg-[#0f0f17]`, `bg-white/[0.03]`
- Borders: `border-white/5`, `border-white/10`

## Charts — ng2-charts + Chart.js
Use **ng2-charts** (`NgChartsModule`) for all charts (backed by Chart.js):
- Import `NgChartsModule` in the standalone component's `imports` array
- `provideCharts(withDefaultRegisterables())` is already registered in `app.config.ts`
- Chart components must guard against SSR: use `isPlatformBrowser(platformId)` before rendering

## Control Flow
Use Angular 17+ built-in control flow syntax in all templates:
- `@if (condition) { } @else { }` — not `*ngIf`
- `@for (item of list; track item.id) { }` — not `*ngFor`
- `@switch (value) { @case (x) { } }` — not `*ngSwitch`

## SSR Rules
- The app uses Angular SSR. Never access `window`, `document`, or `localStorage` directly.
- Use `PLATFORM_ID` + `isPlatformBrowser()` for browser-only code.
- Chart canvas must be guarded with `isPlatformBrowser` check.

## Style
- Dark only — no light mode toggle, no `prefers-color-scheme` media queries.
