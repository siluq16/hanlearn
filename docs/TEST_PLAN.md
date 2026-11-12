# Test plan and verification record

## Actual verification — 2026-11-12

Environment: Windows, native PostgreSQL 18.4 at 127.0.0.1:55439 in repository-local ignored .local/pgdata; no access to an existing user database. Native harness creates a new disposable database, applies a minimal auth.users/auth.uid/roles shim, applies ordered migrations atomically per file, runs assertions and two-connection tests, then stops PostgreSQL.

- Four migrations executed successfully on a clean native database.
- 86 SQL contract assertions and three two-connection scenarios executed successfully. See [VERIFICATION](VERIFICATION.md) for the final record.
- SRS insertion failure injected after card update: transaction rolled back both.
- Synthetic fixtures are testing placeholders, not HSK vocabulary. Contract suite rolls back; concurrency fixture explicitly cleaned.
- Native Auth shim is NOT Supabase. It cannot validate real JWT verification, cookies, PostgREST exposure or Storage.
- Docker Desktop and Supabase CLI were not found. Full local Supabase reset/Auth/API/RLS/Storage checks have NOT run.
- No frontend exists: browser reload, mobile UI, SSR and accessibility tests have NOT run.
- No pilot content/license/official syllabus has been verified or imported.

## Commands

Static consistency and generated SQL snapshot:

```powershell
node scripts/sync-schema.mjs
node scripts/check-contracts.mjs
```

Native supplementary database tests (requires PostgreSQL binaries, uses a fresh database and stops its local server):

```powershell
./scripts/test-native.ps1
```

Do not expose the native trust-auth cluster to a network; harness binds only 127.0.0.1. .local is ignored and must never be deployed/committed. Use separate OS-controlled test environment if running untrusted local processes. The auth shim is test-only, never a production/Supabase migration.

Full local Supabase: install Docker Desktop with Linux containers and a current supported CLI using the [official instructions](https://supabase.com/docs/guides/local-development/cli/getting-started). Docker first needs to be running.

```powershell
supabase init
# Review config: expose public/graphql_public only; disable public signup.
supabase start
supabase db reset --local
$env:HANLEARN_TEST_DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
$env:HANLEARN_ALLOW_DB_TESTS = 'yes'
node scripts/test-database.mjs
```

Database URL must be disposable loopback; never pass production. Do not run native_auth_shim.sql on Supabase. The shared suite inserts only minimal synthetic auth users and rolls back fixtures. API integration tests below require users created through real Auth, not just SQL fixtures.

## Executable SQL and concurrency coverage

| Case | Expected |
| --- | --- |
| All public base tables | RLS enabled; no public SECURITY DEFINER function |
| Anonymous SELECT/RPC | denied |
| Nonallowlisted confirmed user | no catalog/personal rows; mutations denied |
| A/B isolation | only own cards/events/progress/quiz history; other card review 404 |
| Direct card schedule or delete | privilege error |
| Direct event INSERT/UPDATE/DELETE | privilege error |
| Internal completion helper | EXECUTE denied |
| Review success | one version increment/event; server due timestamp |
| Same key/payload | exact saved receipt; no duplicate, also after archive |
| Same key, other payload | conflict |
| Old version / early review / archived card | conflict |
| Concurrent identical request | second connection waits on real RPC lock; same result; one event |
| Concurrent different keys same version | second waits; stale version, one state update |
| Concurrent changed payload same key | second waits; conflict |
| Event insertion error after UPDATE | card/event both unchanged |
| Card lifecycle | archive preserves event and cannot be resurrected by completion |
| SM-2 vectors | all ratings, learning graduation, relearning, old EF, ease bounds, cap, exact due |
| Quiz keys and grading | keys unreadable, scores not client writable, no feedback before submission |
| Quiz pass/retry/retake | 4/5 passes, same payload replay, changed payload conflicts, missing answers fail |
| Lesson completion | study + pass persists in DB rows; failed retake does not revoke |
| Quiz immutability | published question and key edits rejected |
| Published metadata | missing review/license/provenance fails constraint |
| Draft ancestry | published lesson under draft course/unit hidden; quiz/join/membership hidden |
| Audio | no direction without metadata; approved metadata enables it; revoked asset blocks review |
| Daily plan | five baseline tasks sum 60; retries retain same plan/tasks |
| Reschedule | original retained; unique linked child; identical move retry stable |
| Timer/manual | one active timer; start/stop/manual retry idempotent; changed payload conflicts |
| Actual time | 30m timer overlapping 30m manual by 15m =>45 actual/30 system/15 manual-only |
| Midnight | crossing UTC17:00 splits at Vietnam midnight |
| Mastery | two mature directions required; lapse removes mastery |
| Append-only trigger | owner UPDATE rejected in normal mode |

The native suite uses new connections for concurrency and readback. Full browser reload/completed-lesson resume still needs the real app; SQL assertions alone are not an e2e result.

## Required additional local Supabase/API tests

1. Reset from migrations with CLI; run shared suite against actual Supabase auth schema. Inspect API schema list/default grants as deployed.
2. Provision allowlisted A/B and outsider through Auth with confirmed email. Obtain real JWTs. Anonymous uses anon/publishable key only.
3. REST every exposed table/view and RPC with each role. Assert 401/403 or empty results as appropriate, no owned record cross-read, no writable protected columns. Direct private schema/key URLs must fail even if client requests a different PostgREST profile.
4. Use malicious RPC inputs: null/negative version, ratings outside 1–4, response time overflow, unknown UUID, other user's quiz attempt/session/task, invalid/foreign quiz question IDs. No side effects after any failure.
5. Quiz start then inspect all returned JSON/SSR props/network requests before submit: no keys/explanations; private raw tables denied. Simultaneous submit one attempt with same/different answers: one result or conflict.
6. Authenticated SQL role with missing JWT subject, unverified and removed allowlist: no access. Tokens revoked/expired handled by SSR and Auth.
7. Signed audio URL request rechecks learner and current asset publication. Anonymous/other unauthorized users denied. Private bucket prevents unsigned access; enforce actual MIME/size, path ownership and license status.
8. Restart local services and read completed lesson/cards/events/quiz result from a new authenticated session: identical persisted state.

## Sprint 1 application tests (not runnable yet)

- Auth SSR login/logout/expiry; protected routes and request origin/CSRF checks.
- Complete study+quiz, reload page, close/open browser, resume from another authenticated tab; no lost progress, duplicate cards or retry reviews.
- Kill connection after accepted review; client preserves original payload/key/version and recovers receipt.
- Show stale review conflict in second tab, reload current card; never silently resubmit a new key.
- Validate streak examples (today active/inactive, yesterday absent), null denominators, imported vs official coverage, no invented HSK percentage.
- 360px viewport, keyboard review, focus order, readable Hanzi, transcripts, reduced motion, loading/empty/error states.

## Release blockers

Real local Supabase verification; configured verified private Auth; reviewed authorized pilot; actual private Storage objects/policies; API/JWT/e2e tests; operational backup/restore and secret handling. A native pass makes the SQL reviewable and runnable, not production-ready.

