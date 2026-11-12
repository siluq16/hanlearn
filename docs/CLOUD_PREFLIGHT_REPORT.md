# Cloud preflight and migration dry-run

Date: 2026-11-12. Approved scope: read-only inspection, migration list and dry-run only. **No migration apply/reset/repair, Cloud DML, role/user/bucket creation or deployment is authorized or performed.**

**Final result: READY for a separate migration-apply approval.** Owner executed the helper with secure local input; the resulting local report was verified at 21:03 Asia/Ho_Chi_Minh. Preflight, migration list and migration dry-run all PASS. All six file hashes match the files used in that run. No further Cloud commands were run after the successful dry-run.

## Target

- Development ref: hhgxrjqkuwdgurphopok.
- IPv4 Session Pooler: aws-1-ap-southeast-2.pooler.supabase.com, port 5432.
- Database: postgres; tenant login: postgres.hhgxrjqkuwdgurphopok.
- Local public Supabase URL matches the approved ref. No password/token is in this report.

## Cause confirmed

The original cloud_preflight.sql contained eight top-level SELECT statements. A single prepared Parse message cannot contain multiple SQL statements. The pinned CLI 3.1.0 direct query implementation explicitly selects `queryMode: "extended"`; passing the whole file as one query produces PostgreSQL error 42601. That is a query-transport limitation, not evidence that a migration is invalid.

Confirmed locally against existing isolated PostgreSQL 18.4: CLI 3.1.0 + `select 1; select 2;` under --read-only reproduced the exact message `cannot insert multiple commands into a prepared statement`. The rewritten single-statement snapshot was accepted by both CLI and psql in READ ONLY. No database was created, dropped or migrated during that reproduction.

Primary sources inspected: [PostgreSQL protocol](https://www.postgresql.org/docs/18/protocol-flow.html), [CLI v3.1.0 query driver](https://github.com/supabase/cli/blob/v3.1.0/apps/cli/src/command-internal/db-connection.sql-pg.layer.ts), [query handler](https://github.com/supabase/cli/blob/v3.1.0/apps/cli/src/commands/db/query/query.handler.ts), [dry-run implementation](https://github.com/supabase/cli/blob/v3.1.0/apps/cli/src/command-internal/db-push-core.ts), [password parser](https://github.com/supabase/cli/blob/v3.1.0/apps/cli/src/command-internal/db-config.parse.ts).

## Fix and controls

- cloud_preflight.sql now returns one metadata JSON object in one SELECT; original schema/extension/Auth/RLS/grant/function/constraint checks retained. Added version/permissions, application-object/function collision and private-schema checks. No answer data, user rows, function bodies or arbitrary GUC values are read.
- scripts/cloud-preflight.ps1 supports built-in Windows PowerShell 5.1. No pwsh or container runtime required.
- Fixed target/ref/username, public URL cross-check, resolved IPv4 hostaddr, TLS verify-full and trusted CA required. Backend identity/read-only/TLS assertions precede schema inspection.
- psql uses -X, -w, ON_ERROR_STOP, timeouts, explicit READ ONLY transaction and ROLLBACK; startup read-only is also set. Native failures block later commands.
- Secure local password prompt and child-only PGPASSWORD; no password in URI/argv or persisted report. CLI source confirms absent URL password falls back to PGPASSWORD. CLI outputs are captured and only safe plan/status data is retained.
- The only push invocation is hardcoded with --dry-run --skip-vault and a password-free Session Pooler URL. No include-seed/include-roles/yes or write mode.
- All six migration files are unchanged; the generated schema snapshot is unchanged.

## Final observed results

| Check | Result |
| --- | --- |
| Local CLI version/help | PASS: 3.1.0, query/read-only/file and push/dry-run/skip-vault supported |
| Local psql | PASS: 18.4 installed |
| Project public URL and IPv4 DNS | PASS: expected ref/host and IPv4 address resolved |
| Prepared-statement root-cause reproduction | PASS: exact failure reproduced locally |
| Single-statement SQL via native psql and CLI | PASS locally; not a Cloud preflight result |
| Windows PowerShell 5.1 process capture/argument handling | PASS locally with psql --version; no DB connection |
| Unit suite after safety regression tests | PASS: 59 tests (54 existing + 5 preflight guards) |
| Management API SELECT to approved project | FAIL: HTTP 403 insufficient endpoint privileges; no result returned, no migration attempted |
| TLS probe without credentials | PASS after using the project's downloaded public CA: verify-full succeeded and server requested the missing password; generic system/Windows CA roots previously failed |
| Cloud authenticated preflight | PASS: PostgreSQL 17.11, database/role postgres, READ ONLY=on; all Auth/role/builtin/privilege prerequisites passed |
| Schema collision inspection | PASS: zero public tables, zero expected relation/function conflicts, zero private objects; private namespace manageable |
| Remote migration history | PASS: independently read as empty over authenticated Session Pooler |
| CLI migration list | PASS: expected six local versions verified |
| Migration dry-run | PASS: exactly six expected files, dry-run mode confirmed, --skip-vault and read-only connection policy retained |
| File integrity after run | PASS: SHA-256 of all six migrations still matches the executed helper report; no migration source modified |

The first authenticated attempt stopped at an incorrect SSL assertion, before migration list/dry-run. pg_stat_ssl observes the **pooler-to-database** connection rather than the psql-to-pooler TLS connection. Its observed value is false in this project. The assertion was corrected without weakening client security: psql still requires verify-full with the trusted project CA, an authenticated successful connection and explicit READ ONLY. Safe identity metadata is now recorded, and later stages cannot run after a failed assertion. The final successful run confirms database=postgres, role=postgres, read_only=on and a verified client TLS policy. The backend statistic does not prove TLS on the internal pooler leg; that is outside this preflight's verification scope.

The server does not expose a supabase.project_ref GUC (NULL). Target verification therefore uses the independently matched public project URL, exact approved pooler hostname/5432, tenant-bound username postgres.hhgxrjqkuwdgurphopok, verified server certificate, and authenticated backend database/role. The generic database name alone was not used as proof of project identity.

## Pending migrations

Independently verified as pending by empty remote history and the successful CLI dry-run:

1. 202611120001_catalog.sql
2. 202611120002_srs.sql
3. 202611120003_quiz.sql
4. 202611120004_plans_sessions.sql
5. 202611120005_learner_access.sql
6. 202611120006_catalog_queries.sql

## Risks and conclusion

Current conclusion: **READY for separate approval**, not approval to execute. No baseline object/function conflict was detected in the successful authenticated inspection. Baselines CREATE existing names and are not replay-safe; a list-only dry-run does not execute/compile the pending DDL or prove post-migration Auth/RLS behavior. Recheck current schema/history immediately before any future approved apply. Existing private objects would block this helper because the planned namespace grants could affect them; none were found.

The user initially could not run pwsh; that runtime dependency was removed and Windows PowerShell 5.1 was actually tested. The downloaded Downloads/prod-supabase.crt was checked as a public Supabase CA (no private key, CA=true, valid through 2031-04-26) and copied into the ignored .local/cloud-preflight/prod-supabase.cer. Owner then ran the corrected helper and entered the password only at the hidden local prompt. All approved steps completed successfully. The helper stopped after dry-run and disposed its password buffer. **No action to apply migrations was taken. Separate explicit approval is required.**

Files changed: supabase/verification/cloud_preflight.sql, scripts/cloud-preflight.ps1, tests/preflight.test.ts, docs/CLOUD_DEVELOPMENT.md and this report. The six migration files and generated database schema snapshot are unchanged. No secrets or CA files are committed.
