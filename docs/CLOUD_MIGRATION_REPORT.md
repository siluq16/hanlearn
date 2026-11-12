# Development migration apply — 2026-11-12

**Apply PASS: six of six migrations. Overall verification BLOCKED.** The owner explicitly approved only the six files below for Development `hhgxrjqkuwdgurphopok`, then executed the secure local helper. The captured result was written at 21:26 +07. Execution stopped at a strict catalog comparison difference; no apply retry, manual repair or later Cloud operation was performed. Sprint 1 remains PARTIAL.

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
