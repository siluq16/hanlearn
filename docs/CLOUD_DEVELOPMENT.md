# Supabase Cloud Development — Windows, no Docker

Current environment: Next.js local at http://localhost:3000 -> a dedicated Supabase Cloud Development project. No local Supabase/container runtime is needed or used. The existing native PostgreSQL/Auth-shim test is optional supplementary regression only, not the application backend.

**2026-11-12 follow-up:** all six approved migrations were applied to `hhgxrjqkuwdgurphopok`. The subsequent read-only security verification PASS includes classification/body/wiring of the pre-existing event-trigger function, private Data API exclusion and anonymous API denials. Real-account Auth/JWT checks remain pending. See [CLOUD_MIGRATION_REPORT](CLOUD_MIGRATION_REPORT.md). The fresh-install helpers below must not be rerun against this populated history. No owner account/allowlist/content was provisioned.

Later acceptance update: the user provisioned/confirmed/allowlisted the owner. Real owner Auth/SSR acceptance now passes (33 secure-local checks); outsider/B/session-expiry and release gates remain open. See [SPRINT1_ACCEPTANCE](SPRINT1_ACCEPTANCE.md). The initial no-owner statements above describe the earlier migration task; no agent provisioning occurred. Run the acceptance helper only with approved existing credentials, never scripts/check-cloud.mjs as a read-only substitute because it includes mutation probes and requires two allowlisted test users.

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

### Preflight/dry-run helper (Windows PowerShell 5.1)

The currently approved preflight-only target is `hhgxrjqkuwdgurphopok`, through `aws-1-ap-southeast-2.pooler.supabase.com:5432`, database `postgres`, login `postgres.hhgxrjqkuwdgurphopok`. This authorization does **not** include applying migrations. The helper rejects a different target and cross-checks the public URL in .env.local before connecting.

Download the **Server root certificate** from this project's Supabase Dashboard / Database Settings into `.local/cloud-preflight/prod-supabase.cer` (or supply a trusted path with -SslRootCert). This is a public CA certificate, not a password/private key. Tests on this machine found that both generic OpenSSL system roots and Windows roots alone fail certificate verification for this pooler. Do not replace verify-full with require/disable or trust an unverified certificate copied from a TLS failure.

```powershell
# Run in the repository, using built-in Windows PowerShell; pwsh is not required.
powershell -NoProfile -File .\scripts\cloud-preflight.ps1
```

The password is requested using Read-Host -AsSecureString on the local terminal. Never put it in chat, a connection URL, command arguments, a transcript or a committed env file. The helper injects it only into each child's PGPASSWORD environment, disposes its secure buffer, captures native output rather than printing it, and saves only metadata/results into ignored `.local/cloud-preflight/result.json`.

The helper enforces IPv4, TLS verify-full, default_transaction_read_only=on, psql -X/-w/ON_ERROR_STOP, an explicit REPEATABLE READ READ ONLY transaction and ROLLBACK. Client TLS is guaranteed by libpq's forced verify-full connection with the trusted project CA; pg_stat_ssl describes the pooler-to-database leg and is recorded separately, not used to infer client TLS. It checks Auth prerequisites, role/schema privileges, object/function collisions, private-schema ownership and empty migration history. It then uses the password-free Session Pooler URL plus child PGPASSWORD to run migration list and exactly `db push --dry-run --skip-vault`. There is no apply/reset/repair option. A failure blocks all later steps. A dry-run does not execute/validate the pending DDL and never counts as migration success.

CLI 3.1.0's direct query path deliberately uses extended protocol (`queryMode: "extended"`), which rejects multi-command strings. The previous eight-statement preflight hit that boundary; migrations were not implicated. The preflight SQL is now **one SELECT with JSON metadata**, preserving the original checks and adding prerequisite/collision checks. It can also be executed as one CLI read-only prepared query when that connection is authorized; psql is the preferred batch/transaction runner. Never pass a BEGIN/SELECT/ROLLBACK script as one prepared query.

The separate report [CLOUD_PREFLIGHT_REPORT](CLOUD_PREFLIGHT_REPORT.md) records actual local versus Cloud results. Do not run the apply command later in this general guide during a preflight-only task; stop after dry-run and seek separate project-specific approval.

Installed npm dev dependency: Supabase CLI **3.1.0**. Its help was inspected locally. CLI v3 uses **--remote**, not the historical v2 --linked flag. Initial Sprint 1 did not execute any Cloud operation. The later preflight-only task has separate evidence in CLOUD_PREFLIGHT_REPORT.md; the subsequent explicitly approved apply has separate evidence in CLOUD_MIGRATION_REPORT.md.

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

The bounded `scripts/cloud-apply.ps1 -ApplyApprovedSix` helper was used for this specific six-file approval. It pins hashes/project/CA, requires empty history, repeats dry-run and history checks, then allows one exact CLI apply with `--skip-vault --yes`; `--yes` consumes the existing explicit approval rather than authorizing extra scope. It defaults all other DB processes to READ ONLY and stops on any error. It is not an upgrade/retry tool. Reports are in ignored `.local/cloud-apply/`; do not rerun it to complete post-verification.

For separately authorized post-migration read-only verification, use:

```powershell
powershell -NoProfile -File .\scripts\cloud-security-verify.ps1
node scripts/check-anonymous-api.mjs
node scripts/verify-cloud-security.mjs
```

The first command requires hidden local DB password input and captures only SELECT catalogs/body/wiring with verify-full/READ ONLY; it has no migration/write path. The second uses only GET/publishable key and does not log rows. The third analyzes the captured evidence locally against immutable application hashes and the explicitly reviewed platform baseline. Any changed/unclassified object still fails and requires review; never regenerate the platform baseline merely to silence a failure. Results are ignored under `.local/cloud-security/`. Neither these scripts nor a PASS result authorizes owner provisioning, live-account tests or new migrations.

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
