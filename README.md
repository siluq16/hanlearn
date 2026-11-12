# HanLearn

Private, mobile-first Chinese learning app. **Sprint 1: PARTIAL** — six Development migrations and read-only security checks PASS; real owner Auth/SSR/navigation/profile readback now PASS. Outsider/A/B isolation, remaining session/security cases, licensed pilot/Storage and full release evidence remain open. See [final acceptance](docs/SPRINT1_ACCEPTANCE.md). No Docker required.

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
$env:HANLEARN_E2E_PORT = '3102' # optional isolated test port if 3000 is already in use
npm run test:e2e
```

The normal browser suite checks public/anonymous flows (missing-config cases skip in a configured build). Real owner acceptance uses `powershell -NoProfile -File .\scripts\acceptance-auth.ps1` after a production build, with hidden local email/password input and an isolated localhost:3101 server. It reads existing profile/learning data, tests login/refresh/logout and never clicks Settings save or records tokens/screenshots/traces. Do not send credentials to chat. Its safe result is ignored under .local/acceptance/. It does not prove outsider/A/B isolation. Optional native regression: npm run test:db:native (PostgreSQL 18 binaries), disposable Auth shim only, never Cloud.

npm run test:cloud and npm run db:types require explicit local approval/ref and appropriate Cloud setup. Read [Cloud Development](docs/CLOUD_DEVELOPMENT.md) first. No remote migration is automatic.

## Database and cloud

Six ordered version-controlled migrations: the four preserved Sprint 0 migrations plus additive learner-access and catalog-query RPCs. docs/postgres_schema.sql is their generated inspection snapshot: **do not apply both snapshot and migrations**. Existing deployments require migration-history review, not baseline replay.

Follow [Windows Cloud Development setup and approval gates](docs/CLOUD_DEVELOPMENT.md). CLI 3.1.0 is pinned and uses explicit --remote targeting. Six migrations were applied under separate approval; owner provisioning was performed by the user. This acceptance task created no users/allowlist/content/Storage or schema changes. Never rerun the fresh-install apply helper on populated history.

## Contracts and evidence

- [Architecture](docs/PRD_Architecture.md), [MVP scope](docs/MVP_SCOPE.md), [Domain contracts](docs/DOMAIN_CONTRACTS.md)
- [SRS](docs/SRS_SPEC.md), [Security model](docs/SECURITY_MODEL.md)
- [Test plan](docs/TEST_PLAN.md)
- [Sprint 0 historical evidence](docs/VERIFICATION.md)
- [Sprint 1 results and blockers](docs/SPRINT1_VERIFICATION.md)
- [Sprint 1 final acceptance](docs/SPRINT1_ACCEPTANCE.md)
- [Sprint 2 plan](docs/SPRINT2_PLAN.md), [API contracts](docs/SPRINT2_API_CONTRACTS.md), [UI specification](docs/SPRINT2_UI_SPEC.md), [pilot content plan](docs/PILOT_CONTENT_PLAN.md) — planning only
- [Agent instructions](AGENTS.md)

No official HSK syllabus edition, content license, audio object or HelloChinese API has been verified. Synthetic test fixtures must never become published curriculum.

