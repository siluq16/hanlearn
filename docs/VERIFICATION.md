# Verification — 2026-11-12

## Executed

Windows PostgreSQL 18.4, isolated repository-local cluster on loopback port 55439. A new `hanlearn_test_<timestamp>` database for each native harness run; minimal test-only Auth/roles shim. No production connection or deployment. The server was stopped after testing. Ignored .local contains disposable local cluster/test data, not application assets.

Final commands:

```powershell
node scripts/sync-schema.mjs
node scripts/check-contracts.mjs
node --check scripts/test-database.mjs
node --check scripts/check-contracts.mjs
./scripts/test-native.ps1
```

Observed final native run:

```text
PASS migration: 202611120001_catalog.sql
PASS migration: 202611120002_srs.sql
PASS migration: 202611120003_quiz.sql
PASS migration: 202611120004_plans_sessions.sql
PASS 86 SQL assertions (authorization, transitions, quiz, history, plans, analytics, rollback)
PASS concurrent identical retry: one event, same persisted receipt
PASS concurrent different keys: one update, stale version conflict
PASS concurrent changed payload: conflict
PASS database suite; synthetic concurrency fixture removed
PostgreSQL 18.4 on x86_64-windows
server stopped
```

Static contract/snapshot check and both Node syntax checks passed. Actual database assertions, not a TypeScript/Python reimplementation of the scheduler, verify the PostgreSQL transition function. Concurrency tests use two psql processes and assert the second waits at least 600ms while the first transaction retains the RPC locks. Event-insert failure is injected after the card update and tests confirm no partial state survives.

## Review findings reconciled with original files

| Original issue | Evidence and resolution |
| --- | --- |
| SRS direct writes and missing atomic implementation | Confirmed: original grants allowed owned card mutation/event INSERT; atomic RPC was TODO. Replaced with read-only tables and private privileged RPC, fingerprint, locks, version and receipt. |
| History immutability | Original correctly denied direct event UPDATE/DELETE, but card DELETE plus cascade could remove history. Now FK RESTRICT, archive lifecycle and append-only triggers. |
| SRS/mastery ambiguity | Original algorithm choice existed but steps/equations/state mapping were unspecified. Exact hl-sm2-v1 and independent derived mastery now defined/tested. |
| Quiz persistence | Confirmed no lesson-quiz contract/tables. Added private keys, immutable published questions, owned attempts/responses and authoritative completion. Original exam keys were already browser-denied; there was no evidence of an existing answer leak. Full exam skeleton deferred rather than building that subsystem. |
| Scope ambiguity | Pilot counts now explicit; HSK 1–5 roadmap distinct from populated course; FSRS/export/offline/full exams deferred consistently. |
| Plans/analytics | Original task identity already supported deterministic generation; missing reschedule lineage and metric equations now specified, RPCs/session-union view added. |
| Publication/provenance | Original had RLS on every declared public table, but parent draft filtering/provenance enforcement incomplete. Policies now follow complete ancestry and both join endpoints; metadata constraints require editorial approval. |
| Docs/environment | Paths synchronized. Native PostgreSQL discovered outside PATH and used successfully; Docker/Supabase CLI unavailable. Existing folder not a Git repository, so no commits were created. |

## Not executed / blockers

- No real local Supabase CLI project or Docker runtime: no `supabase db reset --local`, real Auth JWT, PostgREST exposed-schema/default-grant or Storage test result.
- Native Auth shim does not establish that production Supabase security works. Repeat migrations/shared tests in actual local Supabase; then complete the API matrix in TEST_PLAN.
- No frontend/browser: no reload e2e, SSR/cookie/CSRF, accessibility or phone verification. Database tests inspect persisted lesson state; this is not a browser persistence result.
- No official syllabus edition, translations, pilot questions or audio licenses verified. Synthetic test placeholders must never be imported as curriculum.
- Storage bucket/policies, signed URL endpoint and actual audio object checks remain unimplemented release gates.
- Analytics formulas for streak/course/coverage are specified for user-scoped server implementation; only daily time union and vocabulary mastery views exist at this stage.
- No full exam, AI, FSRS, offline or deployment added. No website run command exists.

Ready to start Sprint 1 foundation work with explicit gates; not ready to declare production/database release complete. First gates: real Supabase validation, verified private owner provisioning and authorized pilot import.
