# Supabase Cloud Development — Windows, no Docker

Current environment: Next.js local at http://localhost:3000 -> a dedicated Supabase Cloud Development project. No local Supabase/container runtime is needed or used. The existing native PostgreSQL/Auth-shim test is optional supplementary regression only, not the application backend.

## 1. Project and public configuration (owner action)

Create a separate Development project in Supabase Dashboard. Do not reuse Production. Choose its region and plan yourself; this task has not created resources or costs. Record its project reference privately so the migration target can be reviewed.

From Project Settings/API keys, copy the project URL and a **publishable** key (sb_publishable_...) into .env.local on your machine:

```powershell
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_DEVELOPMENT_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_DEVELOPMENT_PUBLISHABLE_KEY
```

Use actual values locally, restart npm run dev, and rebuild if checking production output. NEXT_PUBLIC values are baked into browser builds. Never place database password, personal access token, service_role/secret key in these variables, source code, screenshots, reports or chat. App requires no server secret. Use separate env files/deployment settings for Production.

## 2. Authentication and owner provisioning

In Authentication settings, disable new public signups and anonymous sign-ins. Enable email/password. Set Site URL to http://localhost:3000 and explicitly allow the Development redirect URL. These are CLOUD Dashboard settings; a local TOML file alone does not enforce them remotely.

Create/invite the owner through Dashboard/admin flow; ensure email is confirmed and set the password through a trusted local/account flow. There is no signup or password-reset UI in Sprint 1. Do not hardcode email/UUID/password.

After approved migrations, use the trusted database operator to add the verified owner UUID:

```sql
-- Review and substitute the real owner UUID in Dashboard, never in committed source.
insert into private.allowed_learners(user_id)
select id from auth.users
where id = 'REPLACE_WITH_VERIFIED_OWNER_UUID'::uuid
  and email_confirmed_at is not null
on conflict do nothing;
```

Check exactly one intended owner was provisioned. Login itself does not create a profile; the authorized learner saves Settings to create it. A valid Auth account outside the allowlist receives no private app access. Second-user testing needs separately approved Development accounts; the scripts do not create them.

## 3. Migration review and approval gate

Installed npm dev dependency: Supabase CLI **3.1.0**. Its help was inspected locally. CLI v3 uses **--remote**, not the historical v2 --linked flag. No CLI login, link, remote command, project creation or remote migration has been performed in this task.

Before proposing execution:

1. Confirm Development project name/reference/URL in Dashboard, owner, expected empty/existing data and backup/restore plan.
2. Read remote migration history and inspect conflicts. Baselines 001–004 are fresh-install CREATE statements: they are not safe to rerun on existing tables. 005–006 are additive read RPCs. No migrations contain DROP/TRUNCATE/reset/data seed commands.
3. Verify PostgreSQL >=15, auth.users/email_confirmed_at, auth.uid(), anon/authenticated roles and trusted postgres owner. gen_random_uuid/sha256 are PostgreSQL built-ins; no added extension is required by these migrations. PL/pgSQL must be available.
4. Inspect schemas/grants/RLS/functions/search_path using supabase/verification/cloud_preflight.sql (read-only) and Dashboard. Data API must expose only public/graphql_public, never private. Keep the default API row cap at least 500 (1000 recommended) for paged catalog reads.
5. Review all six exact files and dry-run output. Existing remote history/schema divergence blocks execution; do not repair history or drop objects to force success.
6. Obtain explicit approval naming this Development project and pending migration list. This document is not approval. No Production command is authorized.

CLI authentication is local and interactive; use the official secure login/profile flow. Do not pass passwords/tokens in command arguments or use debug logging. Choose a read/write-scoped token only as needed and keep it outside the repo. Commands below are instructions for after target review; they have not been executed here:

```powershell
npx --no-install supabase login
# Set the exact reviewed Development reference locally (not a password).
$env:HANLEARN_APPROVED_DEV_PROJECT_REF = 'YOUR_DEVELOPMENT_PROJECT_REF'
npx --no-install supabase migration list --remote=$env:HANLEARN_APPROVED_DEV_PROJECT_REF
npx --no-install supabase db push --remote=$env:HANLEARN_APPROVED_DEV_PROJECT_REF --dry-run --skip-vault
```

`--skip-vault` prevents CLI v3 config-secret synchronization; do not include seed/roles or automatic yes flags. Never run a local-default DB command without the explicit --remote target. If CLI requires a local config, its init command only creates CLI metadata; do not start any local services. Inspect the generated config and do not overwrite existing files.

Only after explicit project-specific approval:

```powershell
npx --no-install supabase db push --remote=$env:HANLEARN_APPROVED_DEV_PROJECT_REF --skip-vault
```

After execution, check migration history AGAIN, table/RLS/grant state, function ownership/search_path and live Auth/PostgREST behavior. Exit code alone is not acceptance. Never reset/drop the cloud database. Keep the six migrations immutable once deployed.

## 4. Public type generation

src/types/database.ts currently contains reviewed Sprint 1 projections, **not** generated/cloud-verified types. To generate from the approved Development project after migration:

```powershell
$env:HANLEARN_CLOUD_READ_TESTS = 'approved'
npm run db:types
```

The helper requires the explicit Development ref, uses the CLI profile and writes only .local/database.cloud.generated.ts. Review/reconcile public types before replacing projections; it never generates the private answer schema or silently overwrites app types.

## 5. Auth/JWT/PostgREST checks

Browser checks after owner provisioning: valid login, invalid login, logout, reload session, token refresh, anonymous page/API rejection, persisted Settings, published catalog queries and empty/error states. Test actual direct REST/RPC access as well as the UI.

For approved A/B test accounts, create ignored .env.cloud-test.local with the following names and actual values LOCAL ONLY:

- HANLEARN_CLOUD_READ_TESTS=approved
- HANLEARN_APPROVED_DEV_PROJECT_REF (exact Development ref)
- HANLEARN_TEST_A_EMAIL / HANLEARN_TEST_A_PASSWORD
- HANLEARN_TEST_B_EMAIL / HANLEARN_TEST_B_PASSWORD

Then npm run test:cloud. The helper logs labels only, creates no users/content, validates both users are allowed, checks anonymous/cross-user reads, private schema denial and non-mutating permission probes (UPDATE a nonexistent UUID, INSERT missing mandatory fields). It signs out its sessions. It refuses to run without explicit approval/ref. This is not a destructive/concurrency cloud suite and does not replace browser session-refresh or transactional fixture tests.

The original scripts/test-database.mjs deliberately rejects remote URLs and must not be weakened to point it at Cloud. Its synthetic fixture/destructive probes remain confined to the native disposable database. A cloud fixture/concurrency run needs a separate approved isolated Development dataset and cleanup plan.

## 6. Private Storage (still blocked until provisioned)

Audio endpoint is implemented with learner JWT: /api/vocabulary/{id}/audio rechecks Auth/allowlist, published vocabulary and approved asset metadata, then requests a 60-second signed URL from private bucket hanlearn-audio. No service-role fallback and no invented path/audio. Missing object/policy returns unavailable.

No bucket or Storage policy was changed remotely. Before enabling real audio, approve a separate version-controlled Storage migration: private bucket, 20 MiB maximum, allowed audio MIME types; SELECT only for verified allowlisted learners and objects matching readable published audio_assets.storage_path. No browser upload/update/delete grants. Inspect actual bytes/license/object existence during import; test unsigned/anonymous rejection and revoked asset behavior. A signed URL already issued may remain usable until its short expiry.

## 7. Pilot and Sprint 2

No authorized content source was supplied. Do not publish synthetic SQL fixtures, generated lessons or an alleged official list. Release gate remains one reviewed HSK 1 course, one unit, 3–5 lessons, 30–50 vocabulary items with source/license and 5–10 questions per lesson. Keep higher levels empty until reviewed content is available.

Finish real Cloud/Auth/RLS/Storage verification and pilot review before Sprint 2's lesson -> quiz -> SRS vertical slice. AI, full exams, FSRS, offline sync and HelloChinese API remain deferred.

Primary references: [SSR clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [API keys](https://supabase.com/docs/guides/getting-started/api-keys), [CLI](https://supabase.com/docs/reference/cli/introduction), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).
