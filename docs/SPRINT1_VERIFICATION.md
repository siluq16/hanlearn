# Sprint 1 — Foundation, Authentication & Cloud integration

Date: 2026-11-12. **Status: PARTIAL.** Sprint 0 evidence remains in VERIFICATION.md. No Docker/local Supabase was used. No Cloud project/user/bucket/data was created or changed and no remote migration ran.

## Implementation

Next.js 16.4.6 App Router, React 19.3.1, strict TypeScript, src/, Tailwind 4.3.5, shadcn/ui manual setup with locally owned Radix/CVA primitives, Lucide, Zod, Supabase JS 2.119.0 and SSR 0.12.7. Self-hosted Inter/Noto Sans SC. Feature-based modular monolith; no extra backend or framework change.

| Surface | Implemented behavior | Verification limit |
| --- | --- | --- |
| /login | Email/password, native + server validation, loading/error, authorized redirect | Real Auth login not run |
| /dashboard | Server queries for profile, next linear lesson, active words, DB-time due count, imported coverage and recent sessions | No live learner data/project available |
| /roadmap | HSK 1–5, published units/lesson overviews, persisted completion percentages; explicit unavailable levels | Query/model tests; no authenticated browser run |
| /vocabulary | Hanzi/pinyin/Vietnamese literal search, exact introduced-level filter 1–9, 20/page, learning state | Search RPC native-tested, Cloud PostgREST pending |
| /vocabulary/[id] | Meaning, examples, syllabus/source/license; audio only after authorized signed-URL request | No real licensed content/Storage object supplied |
| /settings | Authenticated account, existing profile insert/update, baseline/target/syllabus; fixed 60m and Vietnam timezone | Mutation tested with mocks; actual persistence/reload pending |
| App shell | Desktop sidebar/header/user menu, mobile bottom nav, theme, skeleton/empty/error states | Public login/setup responsive tested; authenticated shell needs Cloud |
| APIs | /api/me and /api/vocabulary/[id]/audio independently check identity/allowlist; no-store JSON | Mocked 401/403/503; real no-config 503 tested; live JWT pending |
| /setup, /access | Explicit configuration/authorization/outage states with safe messages | Browser/public smoke tested |

No fake/demo login, fabricated learner statistics, official vocabulary seed, lesson-study UI, mini-quiz UI, SRS UI, full exams, AI, FSRS, offline or HelloChinese API added. Roadmap exposes existing lesson overviews; it does not mark them complete.

## Authentication and security boundaries

- Browser/server clients separated. Proxy getClaims refreshes cookies; getUser plus DB allowlist predicate is independently enforced by private server queries/actions/handlers. No trust in browser user IDs or getSession identity.
- Invalid/missing configuration fails closed to setup or safe API 503. No privileged key is used. Public config rejects secret/legacy JWT key formats and non-HTTPS URLs.
- Settings writes an explicit field whitelist with the verified server UUID; fixed goal/timezone cannot be overwritten. Next Server Actions provide same-origin mutation handling. No custom unauthenticated mutation route.
- SQL grants/RLS remain authoritative; no direct card/event writes or key-table query in application code. All new public RPCs are SECURITY INVOKER. Published ancestry is preserved by the original policies.
- Private data dynamically rendered with no-store; no user data in shared static caches. Theme is a local browser preference restored after reload.
- Audio uses learner JWT and 60-second signing, never a service-role bypass. Missing bucket/object/policy fails unavailable; actual Storage provisioning/validation still blocked.
- .gitignore excludes env files, credentials, local databases, node_modules, build/test output and CLI temporary state. Git initialized and local commits created; no push or deployment.

## Database changes

Original 001–004 migration contents preserved. New files only:

1. 202611120005_learner_access.sql: read-only public invoker wrapper around existing private.is_learner. Needed to distinguish authorized owner with no profile from an outsider without exposing private through HTTP. No Auth/allowlist domain change.
2. 202611120006_catalog_queries.sql: invoker due-count using PostgreSQL now(), and bounded literal vocabulary search with correct total on empty pages. No string-built filter syntax, no state mutation.

The generated docs/postgres_schema.sql now concatenates six migrations. Native regression adds supabase/tests/sprint1.sql; original 86 assertions stay intact. No applied remote history exists in this task, and no compatibility with a real Cloud deployment is asserted yet. Preflight SQL is read-only and prepared for later review, not executed remotely.

## Actual executed checks

| Check | Observed result |
| --- | --- |
| npm install dependencies | Installed successfully; exact versions and lockfile committed; npm ci is documented but was not separately executed |
| npm run dev | Windows server ready at 127.0.0.1:3000; HTTP /login returned 200 with expected login heading |
| npm run build | PASS, production route generation; Webpack |
| npm run typecheck | PASS |
| npm run lint | PASS, no warnings in final run |
| npm run format:check | PASS |
| npm run test | PASS: 54 tests in 8 files |
| npm run test:e2e | PASS: 8 tests, desktop Chrome and mobile viewport 390x844 |
| npm run test:contracts | PASS: synchronized SQL snapshot and contract/path checks |
| npm run test:security | PASS: static tracked/unignored source and built browser-bundle credential/boundary scan |
| Native PostgreSQL 18.4 migrations | PASS: clean isolated database, all six files |
| Native SQL assertions | PASS: original 86 + 12 Sprint 1 assertions |
| Native concurrency | PASS: identical retry, stale version, changed payload conflict; actual lock waiting |
| npm audit / production audit | 0 reported vulnerabilities in final dependency tree/check |
| Supabase CLI | Installed 3.1.0; version and local help inspected only |

Unit/integration tests include mocks for Auth, DB client and Settings writes. They verify application branches, not real JWT/RLS compatibility. React render tests cover loading/empty/error semantics. Browser tests use the real local production server without cloud configuration: login validation/error, theme persistence, protected-page failure, API no-data response and no horizontal overflow. They do not authenticate with an Auth shim or invent learner data. Test screenshots are local ignored artifacts in .local/previews/.

Native tests use a disposable PostgreSQL cluster and minimal Auth shim ONLY for SQL regression. App code never imports that shim. The native server is stopped after the suite. Cloud read-test/type-generation helpers are guarded by explicit Development approval/ref and were NOT run.

## Issues encountered and corrected

- Turbopack PostCSS subprocess crashed on this Windows runtime, including outside the sandbox. Switched to the supported --webpack dev/build flag; same Next.js framework and contracts. Production build passed.
- Initial two browser assertions matched Next's route announcer as well as the login error. Narrowed the selector; final eight browser tests passed.
- Dependency audit found minimatch in ESLint's TypeScript parser tree. A narrow override to patched 11.0.8 is recorded; lint/tests and final zero-report audit passed. It is a development dependency, not a runtime authorization workaround.

## BLOCKED / not executed

1. Supabase Cloud Development project URL/publishable key not configured; .env.local was not populated by the agent.
2. No explicit project-specific approval for remote migrations/provisioning. No CLI login/link/remote command, migration-history read or Cloud schema inspection performed.
3. Real Auth successful/failed login, logout, token refresh, session reload, owner onboarding and Settings database persistence have NOT been verified against Cloud.
4. Real Auth JWT/PostgREST anonymous/A/B isolation, direct API grants, transactional/concurrency Cloud tests remain pending approved isolated accounts/data.
5. Private Storage bucket/policies, licensed object existence, MIME/size and signed/unsigned access have NOT been provisioned or verified. Audio endpoint is implemented but unavailable without that setup.
6. No reviewed/authorized pilot curriculum supplied. Empty states are intentional; synthetic fixtures remain test-only.
7. Authenticated Dashboard/Roadmap/Vocabulary/Settings rendering, phone layout and account-data reload e2e remain pending Cloud. Public responsive/theme tests alone do not satisfy those acceptance criteria.
8. src/types/database.ts is a reviewed projection, not cloud-generated. The guarded type generator produces an ignored review file only.

## Changed file groups

- App/config: package.json/lock, TypeScript/Next/ESLint/Tailwind/PostCSS/shadcn config, .env.example, .gitignore/.gitattributes.
- src/app: six requested pages, private layout, setup/access, loading/error/not-found, two protected GET handlers.
- src/features: auth, dashboard, roadmap, vocabulary, settings; query/action/schema/model separation.
- src/lib + types: public env validation, SSR clients/Proxy, safe query paging, API error mapping and reviewed public projections.
- src/components: shell/navigation/theme, shared headings/states and locally owned UI primitives.
- tests + Playwright/Vitest configs; scripts/check-cloud, check-security, generate-types; additive SQL regressions/preflight.
- README, AGENTS and domain/security/test documents synchronized; Sprint 0 evidence preserved and this separate record added.

## Remaining Sprint 1 and Sprint 2 gates

Owner completes Cloud setup locally, reviews exact Development target/history/dry-run, then explicitly approves pending migrations and owner/test provisioning. After successful apply, inspect live schema and run real Auth/JWT/PostgREST/Storage and authenticated browser tests. Review/import authorized pilot content. Follow CLOUD_DEVELOPMENT.md; never reset/drop Cloud or send secrets to chat.

Only then can Sprint 1 be marked COMPLETED. Sprint 2 order: read-only lesson content -> study confirmation + mini-quiz -> SRS card creation/review/retry UX -> daily-plan/manual time UI. Preserve atomic database operations and mastery separation throughout.
