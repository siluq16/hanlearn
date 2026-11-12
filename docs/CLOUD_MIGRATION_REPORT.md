# Development migration apply — 2026-11-12

**Current result: apply PASS; read-only post-migration security verification PASS. Real-account Auth/JWT integration remains BLOCKED.** Development: `hhgxrjqkuwdgurphopok`. See the final follow-up section for the resolved platform-function classification and live HTTP evidence. Sprint 1 remains PARTIAL.

The initial apply record below is preserved as historical evidence: the owner approved six files, the helper applied them successfully at 21:26 +07 and then stopped on a whole-namespace comparison difference. No retry or manual repair occurred. Later Cloud SELECT/GET checks were separately authorized in the follow-up task.

## Target, integrity and execution

- IPv4 Session Pooler: `aws-1-ap-southeast-2.pooler.supabase.com:5432`, database `postgres`, tenant login `postgres.hhgxrjqkuwdgurphopok`.
- Public project URL matched the approved reference. Authenticated identity was database/role `postgres`, with read-only verification transactions. The unavailable project-ref GUC was not used as identity proof.
- TLS verify-full with the downloaded trusted Supabase CA; hidden local password prompt, password supplied only in child-process environment. No credential-bearing URI, token or raw CLI output is included here.
- Exact filename set and all six SHA-256 values matched the successful preflight baseline and were rechecked immediately before apply. Remote history was empty, including the final read immediately before apply. Fresh migration list/dry-run selected exactly these six.
- Pinned Supabase CLI 3.1.0 performed one `db push --remote=<password-free approved Session Pooler URL> --skip-vault --yes --agent=yes`. The automatic confirmation used the owner's existing explicit approval and was restricted to this exact command/target/file set. No include-seed/include-roles/include-all flags.
- All psql verification ran with ON_ERROR_STOP and explicit REPEATABLE READ READ ONLY transactions, timeouts and ROLLBACK. Write mode was isolated to the single approved CLI apply invocation.

## Final observed remote history

The history read immediately after successful apply contains exactly these six versions/names; each migration is PASS. No migration is pending from the approved set.

| Version | Remote name | Approved file | Result |
| --- | --- | --- | --- |
| 202611120001 | catalog | 202611120001_catalog.sql | PASS |
| 202611120002 | srs | 202611120002_srs.sql | PASS |
| 202611120003 | quiz | 202611120003_quiz.sql | PASS |
| 202611120004 | plans_sessions | 202611120004_plans_sessions.sql | PASS |
| 202611120005 | learner_access | 202611120005_learner_access.sql | PASS |
| 202611120006 | catalog_queries | 202611120006_catalog_queries.sql | PASS |

The original PowerShell 5.1 report serialized the six-row history array inside a `value`/`Count` wrapper, and grouped migrationResults into array-valued fields. The underlying history has six distinct rows, confirmed by local inspection. The helper now emits history rows explicitly to avoid that reporting shape. Original result evidence was not overwritten, and the helper was not rerun.

| File | SHA-256 (unchanged from preflight) |
| --- | --- |
| 202611120001_catalog.sql | A2454231EFE7334EA6B2B9417D4EDDD8143E47BB8B0367EAE8C6CBFC3868B154 |
| 202611120002_srs.sql | 8C88E6D1158B4E9455E146F9B910AB2C51A22625D713631A4A9F8AEACF6650F8 |
| 202611120003_quiz.sql | D80152B6BC2B27874D3D2B196449BB0D6A43584EF16EA26E027EF038F01B8C7C |
| 202611120004_plans_sessions.sql | 3D7E11CDC230E6C0577ACC905261BC2DDCB168FFD8615E8DDF795A13C083EDDF |
| 202611120005_learner_access.sql | 3912E078FB61936342B1BB3423DD34028D04AFC9C91766F4F6F6AC10DD4CB26C |
| 202611120006_catalog_queries.sql | 14201CAE8A6823A43A621B55953B5610C631B628F1FE73E59F1BDD49934A7FC7 |

## Read-only catalog verification

| Section | Observed result |
| --- | --- |
| Relations | PASS: 26 tables + two security_invoker views; names, owners and RLS flags match |
| Columns | PASS: 230, including type/order/default/nullability |
| Constraints | PASS: 149 = 26 PK + 39 FK + 17 UNIQUE + 67 CHECK; all validated |
| Indexes | PASS: 51, definitions match, all valid/ready |
| RLS policies | PASS: 26, roles/commands/USING/WITH CHECK match |
| Table triggers | PASS: six, definitions/enabled state match |
| Effective table grants | PASS: 56 anon/authenticated role/relation entries |
| Effective column grants | PASS: 460 anon/authenticated role/column entries |
| All functions in public/private | FAIL strict comparison: 31 observed versus 30 native-reference functions |
| Expected HanLearn functions, local analysis of captured snapshot | PASS: all 30 match complete captured metadata; extra function described below |
| Private schema excluded from Data API | NOT RUN: helper stopped before its HTTP check |

This compares catalog metadata with the reviewed native PostgreSQL reference, not real JWT behavior or a function-body hash. PostgreSQL 18 NOT NULL constraint catalog rows are excluded from constraint totals for compatibility with Cloud PostgreSQL 17; column nullability is checked separately. Service-role privileges are outside the anon/authenticated matrix. The six immutable migration files remain the source of function definitions.

### Tables and views

Public tables (24): audio_assets, card_lifecycle_events, courses, daily_tasks, grammar_points, lesson_grammar, lesson_progress, lesson_quizzes, lesson_vocabulary, lessons, profiles, quiz_attempts, quiz_questions, quiz_responses, review_cards, review_events, study_plans, study_sessions, syllabus_grammar, syllabus_versions, syllabus_vocabulary, task_events, units, vocabulary.

Private tables (two): allowed_learners, quiz_answer_keys. Public views (two): daily_study_metrics, vocabulary_progress, both `security_invoker=true`. All objects are owned by postgres. All 24 public base tables and private.quiz_answer_keys have RLS enabled. Private.allowed_learners has no client table/column privileges; it is intentionally accessed through guarded functions rather than client RLS policies. Its live HTTP exclusion still needs verification.

### Application functions and RPC privileges

Public functions (13, all SECURITY INVOKER): generate_daily_plan, get_due_review_count, get_learner_access, log_manual_session, mark_lesson_studied, search_vocabulary, set_card_status, start_quiz, start_timer, stop_timer, submit_quiz, submit_review, update_task.

Private functions (17): finish_lesson, freeze_quiz, generate_daily_plan, is_learner, lesson_visible, log_manual_session, mark_lesson_studied, reject_history_mutation, require_learner, set_card_status, srs_next, start_quiz, start_timer, stop_timer, submit_quiz, submit_review, update_task. Thirteen are SECURITY DEFINER; finish_lesson, lesson_visible, reject_history_mutation and srs_next are invokers.

All 30 application functions have owner postgres and explicitly empty search_path. Anonymous and PUBLIC EXECUTE are denied for all 30. Authenticated EXECUTE is allowed on the 13 public functions and 11 intended private predicate/implementation functions, and denied on the other six private helpers. All signature/result/owner/security/config/EXECUTE entries match the reference. Real allowlist/confirmed-email/ownership behavior with Auth JWTs remains pending; catalog grants alone do not prove it.

## Why verification stopped

The extra function is `public.rls_auto_enable() RETURNS event_trigger`, owner postgres, SECURITY DEFINER, search_path=pg_catalog, with effective PUBLIC/anon/authenticated EXECUTE. It already appears in the saved **preflight** snapshot; none of these migrations defines it. The strict verifier incorrectly assumed the whole function namespace would equal the native application-only namespace. It correctly surfaced the difference and stopped rather than silently excluding it.

Supabase documents a function of this name and return type for automatically enabling RLS via an event trigger: [official event-trigger guide](https://supabase.com/docs/guides/database/postgres/event-triggers). This is consistent with a platform/setup function, but name/metadata alone do not prove identical body or event-trigger wiring. Those were not captured. PostgreSQL event-trigger functions run in a special trigger context, as described in the [PostgreSQL trigger-function documentation](https://www.postgresql.org/docs/17/plpgsql-trigger.html); the observed EXECUTE flags should not be described as a confirmed ordinary application RPC exploit.

No revoke/drop/replace was attempted. The reference was not weakened to hide the discrepancy. The exact whole-schema verification remains FAIL in the original result; locally separating the 30 expected application functions shows no application-function metadata drift. The private-schema GET check and subsequent acceptance steps remain blocked by the stop.

## Remaining checks and owner authentication

Before accepting full Cloud verification, review the existing event-trigger function/body/wiring through a read-only inspection, retain it as an explicitly reviewed platform object if appropriate, and perform the GET-only private-schema exposure check. **Do not rerun cloud-apply.ps1:** history is now populated and the fresh-install helper must reject it. Any follow-up needs verification only, not another migration apply.

Owner provisioning requires a separate authorized operation; nothing below was performed:

1. In the Development Dashboard, disable public signups and anonymous sign-in, enable email/password, and review Site URL/localhost redirects.
2. Create/invite the intended owner with a trusted flow, confirm email and establish the password securely.
3. Verify the owner's Auth UUID, then separately authorize adding only that UUID to private.allowed_learners. Never use a browser secret/service-role workaround.
4. Log in and save Settings to create the profile. Verify login rejection/success, logout, refresh/reload and persisted settings with real Auth.
5. With separately approved test accounts, test anonymous/outsider/owner direct REST/RPC permissions and cross-user isolation. Cloud destructive/concurrency fixtures are not authorized here.

Storage provisioning, licensed pilot content, authenticated browser checks and cloud-generated type reconciliation remain pending. No user, allowlist entry, content, bucket, custom role, Production change, push/deployment or Sprint 2 implementation was performed. Sprint 0 and preflight reports remain unchanged.

## Files and local checks

Added: scripts/cloud-apply.ps1, scripts/verify-schema.mjs, scripts/check-private-api.mjs, supabase/verification/cloud_schema_manifest.sql, supabase/verification/expected_schema.json, tests/cloud-apply.test.ts and this report. Updated: docs/CLOUD_DEVELOPMENT.md and docs/SPRINT1_VERIFICATION.md. Migration source and generated SQL snapshot unchanged. Local credential/CA/result artifacts remain ignored.

Local checks: 67 tests in 10 files PASS, including an actual Windows PowerShell 5.1 regression for empty/six-row history; lint, typecheck, format:check, static contracts/security and git diff --check PASS. Migration hashes were checked again and remain unchanged. No real Auth integration test, Cloud concurrency test or further migration execution was attempted after the verification stop.

## Read-only security completion — 2026-11-12

**PASS for the requested database/catalog/anonymous HTTP scope.** This supersedes the initial verification BLOCKED and NOT RUN entries above, without rewriting the initial evidence. No database, function, grant, RLS, Auth setting, user, allowlist row, bucket or content was changed. No migration was applied or replayed.

The owner executed `scripts/cloud-security-verify.ps1` with hidden local password input. Fresh catalog capture completed at 21:46:55 +07 through the same fixed IPv4 Session Pooler and trusted CA/TLS verify-full. Backend identity: database/role postgres; transaction_read_only=on. The helper has no write/migration mode: only psql SELECT snapshots within explicit REPEATABLE READ READ ONLY, ON_ERROR_STOP, timeouts and ROLLBACK. Credential buffer was disposed afterwards. HTTP checks used only the public publishable key, with no Auth-user JWT.

| Category | Final result | Evidence |
| --- | --- | --- |
| HanLearn schema objects | PASS | Nine comparison sections match: 28 relations, 230 columns, 149 constraints, 51 indexes, 26 policies, six table triggers, 30 application functions, 56 table-privilege and 460 column-privilege entries |
| rls_auto_enable and event trigger | PASS, scoped review | Actual body/definition, owner/config/language and ensure_rls wiring reviewed and fingerprinted; proven pre-existing |
| Database grants/RLS metadata | PASS | All 24 public base tables have RLS; two invoker views; effective app grants/EXECUTE match; namespace CREATE denied and anon/authenticated have no superuser/RLS bypass/create-role/create-db |
| Private schema HTTP exposure | PASS | Three GETs using private profile: both private tables and is_learner RPC return 406/PGRST106 |
| Anonymous application API permissions | PASS | GETs for 24 public tables + two views and three read-only RPCs all return 401/42501 |
| Platform function through HTTP | PASS, rejection confirmed | GET rpc/rls_auto_enable returns 400/0A000 with exact unsupported event_trigger return-type diagnostic; not a successful ordinary RPC |
| Real owner/outsider Auth/JWT/browser behavior | BLOCKED | No approved/provisioned real Auth accounts or allowlist changes in this task |

### Actual platform body and affected objects

`public.rls_auto_enable()` has no arguments, returns event_trigger, uses trusted plpgsql, is SECURITY DEFINER owned by postgres, and fixes search_path to pg_catalog. The preflight already contained its signature/security/search_path. Its captured body SHA-256 is `325ae266d9b166715ef5230ceaf7ff9d523e483cf5610dfb9779ab3f183f4af9`; full definition and metadata are also pinned in `supabase/verification/reviewed_platform.json`.

The function loops over pg_event_trigger_ddl_commands(), accepts only CREATE TABLE / CREATE TABLE AS / SELECT INTO and only table/partitioned-table objects. It acts only when schema_name is public, excludes system/temp schema patterns, looks up the relation name using pg_catalog.pg_class and the event object's OID, then uses `format('alter table if exists %I.%I enable row level security', ...)`. Identifier quoting prevents the schema/table names being injected into the DDL. It contains no DML, external network call, arbitrary user parameter or grant-changing operation.

`ensure_rls` is owned by postgres, enabled `O` (origin/local), fires on ddl_command_end with exactly those three tags and calls public.rls_auto_enable() with no arguments. It affects newly created public tables in those DDL commands. It does not backfill RLS onto existing tables, apply policies, target private/auth/storage/extensions, or act on ordinary application SELECT/INSERT/UPDATE/DELETE. No firing/mutation experiment was performed.

**Operational limitation:** this installed body catches WHEN OTHERS, logs the failure and continues without re-raising. Auto-enable is best effort, not a guarantee or replacement for explicit migration RLS checks. It differs in this respect from the documented example. Current HanLearn RLS was separately confirmed on every public table; no reliance on future trigger success is claimed.

Effective PUBLIC/anon/authenticated EXECUTE remains present on this platform/setup function. It was not revoked. Event-trigger functions require trigger context, unlike ordinary application RPCs ([PostgreSQL](https://www.postgresql.org/docs/17/plpgsql-trigger.html)). The live HTTP probe returned `400/0A000: cannot display a value of type event_trigger`. The route therefore resolves far enough to hit PostgreSQL's unsupported-type rejection; it must not be reported as absent/404 or as a successful anonymously callable business RPC. No anonymous/authenticated schema CREATE privilege or elevated role flags were found.

Six additional event triggers are classified separately as Supabase infrastructure **metadata**: issue_graphql_placeholder, issue_pg_cron_access, issue_pg_graphql_access, issue_pg_net_access, pgrst_ddl_watch and pgrst_drop_watch. All are enabled O, owned by supabase_admin and wired to the expected extensions functions. The extension hooks are tagged CREATE/DROP EXTENSION; PostgREST watchers use ddl_command_end/sql_drop. Their identities/wiring are present in [Supabase's PostgreSQL schema source](https://github.com/supabase/postgres/blob/develop/migrations/schema-17.sql). Their bodies were not audited, and this focused review is not a full Supabase-platform security certification. None is a HanLearn-created function or an unclassified namespace difference.

### Verifier correction and HTTP interpretation

The immutable native reference remains unchanged. Application function names are derived from the six hash-verified migration sources, then all 30 complete captured metadata entries are compared to the original reference hash. A separate reviewed pre-existing function must match its exact metadata and pass body/definition/wiring checks before classification. Missing app functions, unexpected overloads/functions, altered metadata/body/wiring, unexpected relations/grants or disabled/new event triggers still fail. Every extra public/private function is reported; no wildcard exclusion exists.

The final HTTP suite has 33 GET-only probes: three private-profile checks, 26 public relation checks, three application read RPCs and one reviewed event-trigger probe. Table probes use limit=0 and do not retain rows. The application RPCs are get_learner_access, get_due_review_count and search_vocabulary (zero UUID). All are expected to deny anonymous access: this private application has no intentionally anonymous business RPC. No write RPC was tested via HTTP. Client write permissions are verified by catalog metadata, not by mutation attempts.

Initial HTTP attempts inside the network-restricted sandbox were BLOCKED and were rerun with approved network access. The added platform RPC probe initially expected 404 and failed on 400/0A000; direct inspection identified the exact unsupported-type diagnostic. The final check accepts only the reviewed trigger-specific diagnostic, not arbitrary 0A000 errors. Tests assert that unclassified errors remain FAIL. No Cloud configuration was changed to accommodate a check.

Artifacts are ignored local files under `.local/cloud-security/`: capture.json, platform.json (reviewed function definition only), schema.json, http.json and result.json. Original preflight/apply result artifacts are preserved. No password/access token/secret key is in these reports. The pure local analyzer `node scripts/verify-cloud-security.mjs` joins catalog, unchanged history/hash and complete HTTP coverage evidence; it performs no network or SQL operation.

### Remaining acceptance boundaries

Database has passed this read-only verification step. Real Auth-user JWT/PostgREST isolation, verified-email/allowlist behavior, successful owner RPCs, login/logout/refresh/reload, persisted Settings and authenticated mobile browser flows remain unverified. Provisioning the owner or test accounts requires its own authorized task. No account provisioning, allowlist insertion, Storage setup, content import, destructive/concurrency Cloud test, Docker, Production access or Sprint 2 work was performed. Do not rerun the migration apply helper.

Final local suite: **84 tests in 11 files PASS**. Lint/typecheck/format, static contracts/security and git diff checks were rerun for this follow-up. New regressions reject unknown/missing/overloaded functions, altered platform metadata/body/wiring/grants, successful anonymous reads even with empty responses, missing endpoints used as false permission proof, unrelated 0A000 errors and raw network diagnostic leakage. Unchanged migrations, native reference and generated SQL snapshot were checked separately.

Files for this follow-up: added scripts/cloud-security-verify.ps1, scripts/check-anonymous-api.mjs, scripts/verify-cloud-security.mjs, supabase/verification/cloud_platform_security.sql, supabase/verification/reviewed_platform.json and tests/cloud-security.test.ts; updated scripts/verify-schema.mjs and the three Cloud/Sprint 1 documents. No application feature or migration source changed.
