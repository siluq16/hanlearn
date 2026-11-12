# HanLearn

Private, mobile-first Chinese learning app. **Sprint 1: PARTIAL** — Next.js foundation and tests are implemented; Supabase Cloud Development credentials, remote approval and real integration verification remain pending. No Docker required.

## Run on Windows

Use Node.js 22.14+ (Node 24 tested). From this repository:

```powershell
npm ci
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
# Fill public Development URL/key locally when available; never overwrite your existing env file.
npm run dev
```

Open [localhost:3000](http://localhost:3000). Without cloud config, Login/setup work and protected pages fail closed. There is no fake/demo login or fabricated learner data. Restart dev after editing env; rebuild to change public variables in production output.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_DEVELOPMENT_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_DEVELOPMENT_PUBLISHABLE_KEY
```

Both are public configuration. App uses no database password/service-role key. Never send secrets to chat or commit .env.local. Keep Development separate from Production.

## Implemented

- Next.js 16 App Router, strict TypeScript, Tailwind 4, locally owned shadcn/ui primitives, Lucide, self-hosted Inter/Noto Sans SC.
- Feature-based modular monolith: auth, dashboard, roadmap, vocabulary, settings.
- Email/password login/logout, separate Supabase browser/server clients, SSR cookies and Proxy refresh; Auth revalidation and DB allowlist at every private server boundary.
- Dashboard/HSK 1–5 roadmap, literal vocabulary search + HSK filter + pagination/detail; Settings profile persistence, fixed 60m/day and Vietnam timezone.
- Responsive desktop sidebar/mobile nav, light/dark theme persisted on this browser, skeleton/empty/error states, safe short-lived audio endpoint.
- Published content only through RLS. No curriculum was imported or invented; no full lesson/quiz/SRS UI in Sprint 1.

Webpack is explicitly selected for dev/build because Turbopack's PostCSS subprocess crashed on this Windows environment even outside the sandbox. Framework/architecture remain unchanged.

## Verification commands

```powershell
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:contracts
npm run test:security
```

Browser tests use a production build and default Playwright Chromium. Stop the dev server first so port 3000 is free. Install Chromium once, or use an existing Chrome:

```powershell
# Either: npx playwright install chromium
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run test:e2e
```

The browser suite checks the public/missing-configuration flow; it does not prove real cloud Auth or authenticated-page behavior. Optional no-container native PostgreSQL regression: npm run test:db:native (PostgreSQL 18 binaries required). It uses a disposable database/Auth shim, never the app backend and never Cloud.

npm run test:cloud and npm run db:types require explicit local approval/ref and appropriate Cloud setup. Read [Cloud Development](docs/CLOUD_DEVELOPMENT.md) first. No remote migration is automatic.

## Database and cloud

Six ordered version-controlled migrations: the four preserved Sprint 0 migrations plus additive learner-access and catalog-query RPCs. docs/postgres_schema.sql is their generated inspection snapshot: **do not apply both snapshot and migrations**. Existing deployments require migration-history review, not baseline replay.

Follow [Windows Cloud Development setup and approval gates](docs/CLOUD_DEVELOPMENT.md) for project creation, private owner provisioning, migration preflight/dry-run, live schema inspection, Auth/RLS tests and Storage. CLI 3.1.0 is pinned and uses explicit --remote targeting. No cloud project, users, buckets or data were created/changed by this task.

## Contracts and evidence

- [Architecture](docs/PRD_Architecture.md), [MVP scope](docs/MVP_SCOPE.md), [Domain contracts](docs/DOMAIN_CONTRACTS.md)
- [SRS](docs/SRS_SPEC.md), [Security model](docs/SECURITY_MODEL.md)
- [Test plan](docs/TEST_PLAN.md)
- [Sprint 0 historical evidence](docs/VERIFICATION.md)
- [Sprint 1 results and blockers](docs/SPRINT1_VERIFICATION.md)
- [Agent instructions](AGENTS.md)

No official HSK syllabus edition, content license, audio object or HelloChinese API has been verified. Synthetic test fixtures must never become published curriculum.

