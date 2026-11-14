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

## Development workflow

Request a feature → implement → run relevant tests → report the result. Routine non-destructive Development work needs no approval JSON, signatures, repeated content certification or full preflight. Production, destructive/data-loss operations and security/permission changes still require confirmation. Frozen r3, the 159 pending review rows and historical records remain unchanged.

The published HSK 1 r3 package is already imported: 4 lessons, 44 words (43 syllabus words + supplemental 越南), 24 quiz questions. Both invited accounts passed real login/catalog reading. Historical Sprint 1 acceptance remains PARTIAL.

`HANLEARN_DEVELOPMENT_LEARNING=1` in `.env.local` enables Study/Quiz/SRS on **hhgxrjqkuwdgurphopok only**. Server Actions repeat target/Auth/allowlist/input/ownership checks; PostgreSQL owns grading, completion, card creation and review scheduling. Other Cloud projects and production deployments remain denied. No schema/RLS/role changes are needed.

| Command                                                         | Use                                                               |
| --------------------------------------------------------------- | ----------------------------------------------------------------- |
| `npm run dev`                                                   | Run HanLearn locally and use Study/Quiz with your own account     |
| `npm run test`                                                  | Fast unit regression; select test files for small changes         |
| `npm run test:lessons:browser` / `npm run test:quizzes:browser` | Relevant synthetic UI checks                                      |
| `npm run dev:setup-test`                                        | One-time dedicated automation account setup, then live tests      |
| `npm run test:development`                                      | Build and run live Study/Quiz using the reusable test session     |
| `npm run test:cloud`                                            | Read-only API checks with the same test session                   |
| `npm run db:types`                                              | Read public types using existing CLI authentication               |
| `npm run content` / `npm run preview:hsk1`                      | Offline content/bindings validation and preview                   |
| `npm run check:local`                                           | Full local regression when changes justify it                     |
| `npm run backup:status`                                         | Check existing backup status; restore verification stays separate |

Run `npm run dev:setup-test` once. Hidden prompts take the Development secret API key and DB password, create exactly one confirmed automation user and add only its UUID to the allowlist with verify-full TLS. Existing users/data and public signup are unchanged. Admin credentials are not retained. Generated test credentials/session are encrypted using Windows DPAPI, restricted to current user/SYSTEM and Git ignored. Owner/friend credentials are never cached. Subsequent tests reuse/refresh this session or log in with its encrypted generated credentials without prompts. Tests retain only their own rows; no automatic reset or cleanup of learner data.

Use focused tests for ordinary changes, browser tests for UI/SSR, build for application changes and native disposable SQL tests for database/transaction changes. A routine success needs only a short result. Missing credentials are a setup issue, not another approval gate.

Future content imports/schema changes use checks relevant to that change (target, constraints, collisions, atomicity and key protection). Do not rerun the historical r3 importer or baseline migrations. PRIVATE_INVITE_ONLY is not PUBLIC_RELEASE or a third-party distribution license; content rights remain honest without becoming repeated engineering approval steps.

## Implemented features

- `/review`: due flashcards, Hanzi/Vietnamese recall in both existing directions, flip for Pinyin/meaning/example, Quên / Khó / Đã nhớ, saved daily count and session summary. Uses the existing `hl-sm2-v1` RPC; no browser scheduling or direct writes. Completion creates cards once. A lost response keeps the original per-account retry envelope in session storage; reload does not submit automatically. Audio cards are reported separately until an audio review UI exists. `npm run test:review:browser` uses synthetic fixtures; `npm run test:development` checks real scheduling, retry, reload/relogin and isolation using only the dedicated test account. It may complete lesson 3 on that account using its own post-submission quiz feedback to obtain cards; no private answer store is read and no owner/friend state is changed.

- Next.js 16 App Router, strict TypeScript, Tailwind 4, locally owned shadcn/ui primitives, Lucide, self-hosted Inter/Noto Sans SC.
- Feature-based modular monolith: auth, dashboard, roadmap, vocabulary, settings.
- Email/password login/logout, separate Supabase browser/server clients, SSR cookies and Proxy refresh; Auth revalidation and DB allowlist at every private server boundary.
- Dashboard/HSK 1–5 roadmap, literal vocabulary search + HSK filter + pagination/detail; Settings profile persistence, fixed 60m/day and Vietnam timezone.
- Sprint 2.1: `/lessons/[id]` read-only published lesson reader, strict Content V1, vocabulary/grammar joins, pinyin toggle, credits and saved progress. No learning writes or section audio signing. [Contract](docs/LESSON_CONTENT_V1.md) · [verification and blockers](docs/SPRINT2_1_VERIFICATION.md).
- Sprint 2.3: `/lessons/[id]/quiz` implements explicit start, single-question radios, submission confirmation, backend grading/readback, own recent history, retakes and immutable retry envelopes. The fixed Development target can be opted into writes; other Cloud projects and production deployments are denied. Explanations remain unavailable because Q4 is not deployed. [Verification](docs/SPRINT2_3_VERIFICATION.md).
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

npm run test:cloud and npm run db:types enforce the fixed Development target without per-run approval flags. Read [Cloud Development](docs/CLOUD_DEVELOPMENT.md) first. No remote migration is automatic.

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

Read-only lesson UI tests: `npm run test:lessons:browser` uses actual components on a separate loopback-only synthetic harness, not an Auth shim or Cloud fixture route. `npm run test:lessons:catalog` compares exact selected fields against an existing trusted ignored Cloud catalog capture; it does not generate complete database types.

No official HSK syllabus edition, content license, audio object or HelloChinese API has been verified. Synthetic test fixtures must never become published curriculum.

Private invite import: `npm run content:import:development` prints the bounded 224+24 / separate 91-entity promotion plan only. Both existing allowlist memberships remain. The operator helper `scripts/pilot-development-import.ps1` defaults to the same preview; its explicit apply switch is reserved for separately approved Cloud writes. No real-key DB delivery, import/promotion or Study/Quiz guard opening has been executed.
