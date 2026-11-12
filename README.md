# HanLearn — technical foundation

Private, single-learner, mobile-first HSK learning system. Target: Next.js App Router + TypeScript + Tailwind + shadcn/ui + Supabase. No website or licensed learning content is implemented yet.

## Read first

- [MVP scope](docs/MVP_SCOPE.md)
- [Domain contracts](docs/DOMAIN_CONTRACTS.md)
- [SRS specification](docs/SRS_SPEC.md)
- [Security model](docs/SECURITY_MODEL.md)
- [Test plan and verification record](docs/TEST_PLAN.md)
- [Architecture](docs/PRD_Architecture.md)
- [SQL snapshot](docs/postgres_schema.sql)
- [Agent instructions](AGENTS.md)

Ordered `supabase/migrations/` files are authoritative. `docs/postgres_schema.sql` is their generated fresh-install concatenation, not another migration. These replace an unapplied blueprint. Never run both, or apply this baseline over an existing deployment.

## Verification

Repository checks (Node, no dependencies):

```powershell
node scripts/check-contracts.mjs
```

For full local Supabase, install Docker Desktop (Linux containers) and Supabase CLI using the [official setup guide](https://supabase.com/docs/guides/local-development/cli/getting-started).

```powershell
supabase init
```

Review generated configuration: API exposes only public/graphql_public, never private; disable public signups. Then:

```powershell
supabase start
supabase db reset --local
$env:HANLEARN_TEST_DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
$env:HANLEARN_ALLOW_DB_TESTS = 'yes'
node scripts/test-database.mjs
```

The runner requires a disposable loopback database. Reset destroys local data; never substitute production. No generated Supabase config is committed: generate with installed CLI and review before use. TEST_PLAN distinguishes native PostgreSQL/Auth-shim checks from full Supabase and browser tests.

After creating a verified owner through the Auth admin flow, provision that UUID into `private.allowed_learners` using the trusted database operator connection. No learner can add themselves. Keep public signup disabled. PostgreSQL 15+ is required for security-invoker views; use the CLI-supported Supabase version and repeat the suite there.

Latest executed results: [verification record](docs/VERIFICATION.md). Native supplementary test: `./scripts/test-native.ps1` (PostgreSQL 18 binaries on this machine).

No app/dev command exists yet. No official word counts, translations or audio licenses have been verified. Import only after syllabus/source/license/editorial review. See TEST_PLAN for actual results.

