# Copilot instructions for capturador-inventario-webapp

This file gives concise, task-focused guidance to AI coding agents working on this Angular 16 standalone-components project.

Keep answers short and provide concrete edits. Reference files and exact symbols when changing code.

Key project facts
- Angular 16 app using standalone components (no AppModule). Entry: `src/main.ts` bootstraps `AppComponent` with `appConfig` from `src/app/app.config.ts`.
- Routing is defined in `src/app/app.routes.ts` and provided via `provideRouter(routes)` in `app.config.ts`.
- Styles use SCSS and every component is standalone: look for `standalone: true` in components.

Build / run / test
- Start dev server: `npm start` (runs `ng serve`, default configuration is `development`).
- Build production: `npm run build` (uses `angular.json` production configuration).
- Run tests: `npm test` (Karma + Jasmine configured via `angular.json`).

Important patterns to preserve
- Standalone components: when adding a component, export it as `standalone: true` and include required imports (e.g., `CommonModule`, `ReactiveFormsModule`) in the `imports` array.
  - Example: `src/app/partials/login/login-partial/login-partial.component.ts` imports `ReactiveFormsModule` locally.
- Global providers live in `app.config.ts`. Add router, animations, and imported providers there (use `importProvidersFrom(...)`).
- Layouts + children routes: The app uses layout components as route containers (`AuthLayoutComponent`, `DashboardLayoutComponent`) — add inner routes as children under `path: 'dashboard'` or `''` as appropriate.

Conventions and folder structure
- Top-level features live under `src/app/` in subfolders: `layouts/`, `partials/`, `screens/`.
- Keep presentation components under `partials/`, full pages under `screens/`, and route container components under `layouts/`.

Integration points and external deps
- HTTP calls should use Angular `HttpClientModule` (imported globally in `app.config.ts`). There are currently no backend endpoints in source — look for future services to live under `src/app/services/` if added.
- No additional third-party UI libraries are present in `package.json`. Add dependencies to `package.json` and update README/test scripts when necessary.

Editing guidance for AI
- Always run a local build or tests after edits when possible. Minimal checks:
  - Lint/typecheck: ensure `tsc` compilation passes (project uses `typescript` devDependency).
  - Run `npm start` to validate dev server boots (if you changed bootstrap or routes).
- When adding a new route, update `src/app/app.routes.ts` and ensure any referenced standalone component includes required `imports`.
- Preserve Spanish comments and user-facing Spanish strings.

Examples (do this, not that)
- Good: Add `standalone: true` component and import `ReactiveFormsModule` in the component's `imports` block.
- Bad: Assume AppModule exists — this project uses `app.config.ts` instead.

If uncertain or making structural changes
- Ask the human: confirm intended route path, and whether new services should be singleton-provided in `app.config.ts` or provided in-component.

Where to look for examples
- Bootstrap: `src/main.ts`
- App config / providers: `src/app/app.config.ts`
- Routing: `src/app/app.routes.ts`
- Example partial: `src/app/partials/login/login-partial/login-partial.component.ts`
- Layout example: `src/app/layouts/auth-layout/auth-layout.component.ts`

End — if anything is unclear (missing services, expected backend URLs, or test coverage targets) ask the repo owner before large changes.
