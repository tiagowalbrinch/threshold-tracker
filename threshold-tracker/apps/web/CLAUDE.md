# ThresholdTracker Web — Claude Guidelines

## Angular Skills
Always follow the Angular skills provided in the system prompt for all component, service, routing, form, HTTP, SSR, and DI work:
- Components: `angular-component` skill (signals, OnPush, standalone)
- Dependency injection: `angular-di` skill
- Directives: `angular-directives` skill
- Forms: `angular-forms` skill
- HTTP / data fetching: `angular-http` skill
- Routing: `angular-routing` skill
- Reactive state: `angular-signals` skill
- SSR / hydration: `angular-ssr` skill
- Testing: `angular-testing` skill
- CLI / tooling: `angular-tooling` skill

## UI Components — PrimeNG
All UI components must come from **PrimeNG** (already installed). Do not create custom HTML/CSS for anything PrimeNG covers:
- Buttons → `p-button`
- Cards → `p-card`
- Tables → `p-table`
- Charts → `p-chart` (backed by Chart.js)
- Progress bars → `p-progressbar`
- Inputs → `p-inputtext`, `p-select`, etc.
- Tags / badges → `p-tag`
- Chips / filters → `p-chip`
- Dialogs → `p-dialog`
- Import the relevant PrimeNG module in each standalone component's `imports` array.

## Icons — PrimeIcons
Use **PrimeIcons** for all icons (already loaded globally via `angular.json`):
```html
<i class="pi pi-check"></i>
<p-button icon="pi pi-plus" />
```
Do not install or use other icon libraries (Material Icons, Font Awesome, etc.).

## Theming — Global Styles Only
All CSS custom properties (colors, spacing, surface tokens) live in `src/styles.scss`. Do not redefine theme tokens inside component SCSS files.

Available tokens:
```scss
--color-bg        // #11111a  — page background
--color-header    // #181828  — header/navbar
--color-card      // #1a1a2e  — card surfaces
--color-primary   // #7b2ff2  — purple accent
--color-accent    // #e94560  — red/pink accent
--color-secondary // #08d9d6  — teal accent
--color-text      // #fff
--color-muted     // #bdbdf7
--spacing         // 1rem
```

PrimeNG surface tokens (`--p-surface-*`, `--p-primary-color`, etc.) are also defined there and map the brand palette into PrimeNG internals — do not override them in components.

## SSR Rules
- The app uses Angular SSR. Never access `window`, `document`, or `localStorage` directly.
- Use `PLATFORM_ID` + `isPlatformBrowser()` or `@defer (on browser)` for browser-only code.
- `p-chart` (Chart.js) must be wrapped in a browser-only guard.

## Style
- Dark only — no light mode toggle, no `prefers-color-scheme` media queries.
- Always-dark Aura preset is locked via `darkModeSelector: 'none'` in `app.config.ts`.
