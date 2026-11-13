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

## Personal local workflow

Run these from the owner-controlled Windows checkout. Local reads no longer need authorization JSON, signatures, dates, TTY prompts or a new Markdown report. Earlier local-read authorization templates/reports are historical; they are not consumed by current commands. Existing signed records are retained without modification.

| Command                       | Purpose                                                                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `npm run content`             | Validate frozen r3 public content and all 24 real private bindings; status/counts only, no report writes                          |
| `npm run test:local`          | Unit tests plus synthetic Lesson Detail, preview and mini-quiz browser suites; no Cloud or real-key DB delivery                   |
| `npm run preview:hsk1`        | Loopback-only HSK 1 reader at http://127.0.0.1:3114; no private answers or progress writes                                        |
| `npm run backup:status`       | Inspect recorded core/rights restore evidence and archive presence; **does not decrypt, retest restore or certify current bytes** |
| `npm run content:import:plan` | Public draft import order/counts with synthetic keys only; no database connection                                                 |
| `npm run check:local`         | Content, typecheck, lint, contracts, security and all local tests in one fail-fast command                                        |

Stop a manually running preview before browser tests, since tests own port 3114. `npm run test` remains the fast unit-only command. Native disposable database suites remain separate opt-in commands and use synthetic keys. Encrypted restore verification is `npm run backup:verify`; its password prompt is required by encryption, not an approval ritual. It retains the source and archives.

Trusted local reads require Windows, the matching Git checkout, known operator command entry points, restricted owner/SYSTEM ACL, no reparse paths, Git-ignored/untracked private store, exact frozen public hashes, stable private bytes and valid IDs/revisions/bindings. CI/Vitest, browser/Next, production/deployment and other working directories/entry points are rejected. No environment flag can enable real-key DB delivery. This protects accidental use outside local tooling; a malicious process already running as the owner is outside the OS trust boundary.

Minimal product flow:

1. Author/preview locally. Revision 3 stays frozen; future content edits use a new reviewed revision with hashes/bindings updated together.
2. Run `npm run check:local`, inspect content and record actual rights/review decisions where needed; do not turn the 159 PENDING records into fictional approval.
3. Prepare the import plan and honest metadata/rights scope. When requested, run Development read-only preflight with verified target/TLS/credentials to refresh schema/history/collisions/effective allowlist. Reading needs no extra signature record and never imports; no Cloud check was run in this workflow change.
4. Approve **one exact Cloud write plan** (target, rows, revisions/hash/overlay, private delivery/logging, transaction and rollback). Real-key DB delivery is still unsupported/blocked until separately implemented and reviewed. Publication, security changes and real learner mutations require their own explicit scope.
5. After approved import/promotion, verify the real catalog/read permissions in HanLearn. The Sprint 2.2 Cloud mutation guard stays in place until live study/quiz mutations are separately approved.

Database/RLS requirements are real: published ancestry/approved provenance, valid constraints/FKs, private answer isolation and server-authoritative completion. Truthful rights/reviewer evidence remains necessary; SQL CHECKs cannot certify its truth. Per-read signature JSON, TTY gating and repeated long verification reports were process rules and have been removed. Local success does not grant Cloud write, publication, Auth/RLS/migration changes, deletion/overwrite, push or deploy permission. Owner-only published access still depends on the effective allowlist; no RLS was widened.

Quiz checks: `npm run test:quizzes:browser`; native database regression: `npm run test:db:native` (synthetic disposable/Auth shim only). The main quiz route requires real published catalog data. Writes need `HANLEARN_LOCAL_MINI_QUIZ=1` and a verified literal HTTPS loopback API target; setting the flag with a Cloud URL never enables writes. No such API/credentials or Cloud writes were provisioned by this sprint.

Publication preparation: `npm run content:publication:plan` inspects the grouped v2 proposal without writing; `npm run content:publication:check` validates it and exits nonzero while actual metadata/evidence is missing. Both keep execution disabled. V1 and signed owner records remain historical evidence. Exact 91 IDs, source classifications and missing fields are in `content/proposals/pilot-hsk1-r3/publication-overlay.v2.json`; [current readiness](docs/PILOT_R3_REAL_IMPORT_READINESS.md) describes the remaining decisions, separate draft/promotion transactions and future read-only preflight. No new local authorization/signature files are required.

## Implemented features

- Next.js 16 App Router, strict TypeScript, Tailwind 4, locally owned shadcn/ui primitives, Lucide, self-hosted Inter/Noto Sans SC.
- Feature-based modular monolith: auth, dashboard, roadmap, vocabulary, settings.
- Email/password login/logout, separate Supabase browser/server clients, SSR cookies and Proxy refresh; Auth revalidation and DB allowlist at every private server boundary.
- Dashboard/HSK 1–5 roadmap, literal vocabulary search + HSK filter + pagination/detail; Settings profile persistence, fixed 60m/day and Vietnam timezone.
- Sprint 2.1: `/lessons/[id]` read-only published lesson reader, strict Content V1, vocabulary/grammar joins, pinyin toggle, credits and saved progress. No learning writes or section audio signing. [Contract](docs/LESSON_CONTENT_V1.md) · [verification and blockers](docs/SPRINT2_1_VERIFICATION.md).
- Sprint 2.3: `/lessons/[id]/quiz` implements explicit start, single-question radios, submission confirmation, backend grading/readback, own recent history, retakes and immutable retry envelopes. **LOCAL_PASS only**; start/submit Server Actions reject Cloud even when called directly. Explanations remain unavailable because Q4 is not deployed. [Verification](docs/SPRINT2_3_VERIFICATION.md).
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

Read-only lesson UI tests: `npm run test:lessons:browser` uses actual components on a separate loopback-only synthetic harness, not an Auth shim or Cloud fixture route. `npm run test:lessons:catalog` compares exact selected fields against an existing trusted ignored Cloud catalog capture; it does not generate complete database types.

No official HSK syllabus edition, content license, audio object or HelloChinese API has been verified. Synthetic test fixtures must never become published curriculum.
