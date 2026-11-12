# Sprint 1 — Foundation, Authentication & Cloud integration

Date: 2026-11-12. **Status: PARTIAL.** Sprint 0 evidence remains in VERIFICATION.md. The original implementation evidence below describes the initial run; the later approved Development migration outcome is appended at the end. No Docker/local Supabase was used.

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

## Approved Development migration follow-up — 2026-11-12, 21:26 +07

The owner separately approved exactly migrations 001–006 for `hhgxrjqkuwdgurphopok` and ran the bounded Windows helper using hidden local password input. **Apply: PASS, all six recorded remotely. Full post-verification: BLOCKED.** See [CLOUD_MIGRATION_REPORT](CLOUD_MIGRATION_REPORT.md) for final history, hashes, object inventories and the precise verification limit. This follow-up supersedes the original no-remote-approval/no-schema statements above, without replacing their historical evidence or Sprint 0 results.

- Fresh project/tenant/TLS verify-full, six hashes, empty history and exact-six dry-run passed before one CLI 3.1.0 `db push --remote=<approved pooler> --skip-vault`; no seeds/custom roles or Vault synchronization.
- Read-only Cloud catalog matches the native reference for 28 relations (26 tables, two invoker views), 230 columns, 149 constraints including 39 FKs, 51 valid indexes, 26 policies, six triggers, and effective anon/authenticated table/column privileges. All 24 public base tables have RLS.
- All 30 application functions match the expected signature/result, owner, SECURITY DEFINER flag, empty search_path and client EXECUTE metadata. Thirteen public wrappers are invokers; anon/PUBLIC cannot execute any application function.
- The strict whole-schema function comparison stopped on an extra `public.rls_auto_enable()` event-trigger function. The preflight snapshot proves it already existed before apply. It is not created by these migrations. No function was ignored or changed to turn the original failed comparison green.
- The later private-schema HTTP exposure check was **NOT RUN** after the stop. Schema API exposure and actual Auth/JWT/SSR isolation remain unverified. No Cloud command was issued after reviewing the failed verification result.
- No Auth user, allowlist row, content, Storage bucket, seed, production change or Sprint 2 work was created. Local reporting fixes do not change Cloud schema. The original `.local/cloud-apply/result.json` is preserved.
- Final local checks: 67 tests in 10 files PASS (including actual PowerShell 5.1 history-array regression); lint, typecheck, format:check, static contracts/security and git diff --check PASS. Six migration hashes and the generated SQL snapshot remain unchanged. These checks do not replace the pending Cloud acceptance checks.

Owner authentication remains a separate provisioning step: disable public signup/anonymous sign-in, configure email/password and localhost redirects, create/invite and confirm the owner, then separately authorize adding only that verified UUID to `private.allowed_learners`. This task performed none of those changes. After provisioning, test real login/logout/refresh/reload, Settings persistence and direct anonymous/outsider/owner RPC access. Keep destructive/concurrency fixtures off Cloud in this scope.

## Read-only post-migration security completion — 2026-11-12

**Database/catalog/anonymous HTTP scope: PASS. Sprint 1: still PARTIAL.** The newly authorized read-only follow-up resolves the preceding verification BLOCKED result. Full evidence and caveats are appended in [CLOUD_MIGRATION_REPORT](CLOUD_MIGRATION_REPORT.md); initial apply/preflight and Sprint 0 evidence remain preserved.

- Fresh SELECT catalog snapshots over verified TLS/IPv4 Session Pooler confirm exactly the original six remote migrations and unchanged file hashes. All nine application metadata sections, including grants/RLS/EXECUTE for 30 functions, match the immutable reference.
- Actual public.rls_auto_enable body and ensure_rls event wiring reviewed: only new public tables, quoted identifiers, pg_catalog search_path, postgres definer. Errors are logged/swallowed, so it is best effort; explicit migration RLS remains authoritative. One known pre-existing function and six Supabase infrastructure trigger metadata records are classified separately and pinned. Unknown differences still fail.
- Live GET-only checks: private tables/predicate return 406/PGRST106; all 26 public tables/views and three read RPCs deny anonymous with 401/42501. The reviewed platform function probe returns 400/0A000 for unsupported event_trigger return type; its route is not claimed absent. No mutation permission probe was used.
- Owner/outsider real Auth JWT, verified-email/allowlist rules, authorized RPC success, browser session lifecycle and persisted Settings remain BLOCKED pending separate account provisioning. No user, allowlist, content, Storage or Sprint 2 change was made.
- Local follow-up: 84 tests in 11 files PASS; lint, typecheck, format and static contract/security checks rerun. Database apply history and all six migration hashes are unchanged. The final evidence analyzer reports PASS for this explicitly bounded read-only scope, not real-account Auth acceptance.

## Final acceptance and Sprint 2 planning — 2026-11-12

**Sprint 1 remains PARTIAL.** See [SPRINT1_ACCEPTANCE](SPRINT1_ACCEPTANCE.md) for criterion-by-criterion PASS/FAIL/BLOCKED/NOT APPLICABLE and the approved remaining test matrix. Owner creation/email confirmation/allowlist were completed by the user, not this agent. The user reported six manual checks passed, including Settings save/reload. This section supersedes earlier owner-provisioning/owner-Auth blockers only; historical evidence is preserved.

- Secure local owner helper: **33 real Auth/SSR/browser/read checks PASS** at 22:28 +07. Actual Server Action login/logout, getUser confirmation/UUID, DB allowlist, cookie scope, explicit real refresh, SSR after refresh, four authenticated routes on desktop/mobile, own PostgreSQL profile readback/reload and unchanged-profile check. No learning/profile write or screenshots/traces/credential persistence. Natural-expiry/revocation Proxy branch remains untested.
- Latest anonymous/private HTTP suite: **33 GET probes PASS** after provisioning. Real owner private-key HTTP request also denied. Existing catalog/grants/RLS evidence remains in CLOUD_MIGRATION_REPORT; no new SQL apply or Cloud mutation fixture.
- Production build, typecheck, lint, 84 tests/11 files, static contracts/security PASS. `npm run test:e2e`: **six PASS, two SKIPPED** because the configured environment cannot exercise missing-config-only tests. Occupied port 3000 was handled using a validated separate test port 3102, retaining no server reuse. The user's running server was not stopped.
- CLI public type generation attempted, exited 1 with no generated artifact; raw diagnostics suppressed, root cause not established. Current projections were not replaced. Local AST/catalog comparison: **76 checks PASS** for selected fields of 11 table Row projections plus three read-RPC signatures; this is not a full generated types/Relationships/Insert/Update/view/JSON-schema validation.
- Public Auth settings GET PASS: signup disabled, anonymous sign-in disabled, email enabled. Final local unit suite **87 tests in 12 files PASS**, including regression that missing Auth flags cannot count as securely disabled. No setting was changed.
- Owner confirmed no second account. Real outsider and A/B isolation stay BLOCKED; no user/allowlist row created. New Settings mutation tests, populated learning loop, Storage/pilot and operational release checks remain pending separate scope/fixtures. Read-only owner success cannot waive them.
- Planning deliverables: SPRINT2_PLAN, SPRINT2_API_CONTRACTS, SPRINT2_UI_SPEC and PILOT_CONTENT_PLAN. Existing quiz RPC does not expose explanations, due-count does not provide DB-time queue rows, and lesson content/section signing require explicit contracts. These gaps are planned, not implemented. No Sprint 2 feature/schema/content work began.
