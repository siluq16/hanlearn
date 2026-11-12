# Security model — revision 2

## Trust boundaries

Browser is untrusted, including direct REST/RPC calls and self-ratings. Supabase verifies JWT; auth.uid() selects identity. private.allowed_learners plus auth.users.email_confirmed_at restricts all app reads/writes to provisioned verified UUIDs. RLS isolates owned rows even with a second allowlisted test user. Nonallowlisted authenticated accounts see no app rows and mutation RPCs reject.

Operator/migration owner postgres is trusted; an administrator can alter functions/triggers and is outside RLS's threat model. Server secret/service-role never reaches browser. Routine RPCs run with learner JWT, not service-role. Disable public signup and verify SSR tokens before application reads; private DB allowlist is the additional authoritative gate.

## Schema and permissions

Data API schemas ONLY public/graphql_public; never private. Tables in public all RLS-enabled and no anonymous grants. Catalog SELECT only when published, reviewed constraints satisfied and ancestry visible. Parent/child policies compose without recursion. Both endpoints of join tables must be readable.

Personal tables SELECT owner only. Cards, review events, quiz attempts/responses, lesson progress, plans/tasks/events and study sessions have no client INSERT/UPDATE/DELETE privileges. Profiles allow self INSERT and limited column UPDATE, with allowlist and readable preferred syllabus checks. Immutable evidence and score fields cannot be forged by direct writes. Views use security_invoker=true and inherit underlying RLS.

Private quiz keys have RLS and no browser table grants; no client-exposed answer view. No privileged function in exposed schema. Public wrappers SECURITY INVOKER with empty search_path; implementations private SECURITY DEFINER with empty search_path, qualified relations and own explicit Auth/ownership/visibility checks because their owner bypasses RLS.

Authenticated needs USAGE private and EXECUTE on specifically named private RPC implementations to make invoker wrappers callable. This does NOT grant table reads or expose private via HTTP; wrappers cannot be used as a secrecy boundary for these specific function signatures. Even if called from a SQL connection, the implementation enforces the identical contract. Never grant ALL FUNCTIONS or expose private as an API schema. require_learner, transition, completion and trigger helpers are NOT executable by learner; is_learner is the sole boolean predicate helper. No dynamic user SQL.

Function default PUBLIC execute is revoked, explicit revoke/grant per RPC and helper. No anonymous RPC. Migration/table owner must stay trusted; review grants after new migrations. service_role is not needed for browser or regular learning operations.

## Transactions and integrity

SRS locks (user,key) then owned card. Unique (user,key), canonical request + SHA-256 fingerprint, exact stored result, version compare, database time, event/state transaction. FK history -> card RESTRICT, lifecycle archive/suspend. Append-only triggers add protection beyond browser grants. Cards can be physically deleted by operator only when no referenced evidence; normal flow never deletes them.

Quiz attempt locks serialize submission; per-user/lesson advisory lock serializes study confirmation and completion. Published quiz content frozen by triggers; no mutable answer keys after publication. Grading inserts all responses and changes attempt/completion/cards together. No full exam/time-authority engine added.

Task mutations lock owned task and append history, unique child lineage. Sessions are learner-immutable; timer stop is the only lifecycle update. No client choice of system timestamps/evidence type.

## Account erasure (operator only)

No public erase RPC. Verify ownership and intent in administrative workflow; record request/approval outside deleted personal data and retain backups per policy. In a dedicated operator transaction:
1. SET LOCAL hanlearn.account_erasure='on' as postgres.
2. Delete quiz_responses then quiz_attempts for user; task_events then daily_tasks (children before parents) then study_plans; study_sessions and lesson_progress.
3. Delete review_events and card_lifecycle_events for user, then review_cards.
4. Delete profiles and allowed_learners, then use supported Auth admin deletion for identity; ensure no remaining user references.
5. Handle Storage files, logs and backup retention under the same documented request.
No account erasure implemented/executed in this task. Trigger exception checks current_user='postgres'; a browser-set GUC cannot bypass it. Published catalog/key immutability is separate from personal-data erasure.

## Release gates and residual risks

- Test native PostgreSQL AND real local Supabase Auth/PostgREST/Storage; shim cannot verify JWT/cookies/schema exposure/default privileges.
- Read-only catalog to all allowlisted learners is intentional; private-user records remain isolated.
- Content provenance constraints check metadata, not truth of license/review. Operator verifies actual rights, raw imports and payloads (including absence of hidden answer fields).
- Storage bucket/policy/signed URL endpoints not provisioned here. Do not publish/play production audio before these checks.
- Self-reported study and card ratings can be dishonest; MVP is a personal tool, not proctoring.
- Publish configuration, JWT/session refresh, CSRF/input limits, API error mapping, backups and restore drill remain Sprint 1/release checks.

Primary basis: [Supabase database functions](https://supabase.com/docs/guides/database/functions), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security). Local execution results are in TEST_PLAN.

