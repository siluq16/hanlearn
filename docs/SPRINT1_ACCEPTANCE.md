# Sprint 1 final acceptance

Date: 2026-11-12, Asia/Ho_Chi_Minh. Project: `hhgxrjqkuwdgurphopok` (Development only). **Decision: PARTIAL.** This is an evidence review, not Production readiness or authorization to start Sprint 2.

## Criteria and evidence rules

Requirements are unchanged: MVP_SCOPE.md (including its explicit Sprint 1 execution update), DOMAIN_CONTRACTS.md, SRS_SPEC.md, SECURITY_MODEL.md and TEST_PLAN.md. Foundation/Auth/catalog/Settings are the current implementation scope; lesson/quiz/SRS UI and the persisted learning loop are planned for Sprint 2. Full MVP/pilot/Storage and isolation acceptance gates are not silently removed to obtain COMPLETED.

PASS = observed evidence, with its source named. FAIL = executed check found an application defect. BLOCKED = required proof unavailable. NOT APPLICABLE = deliberately outside this execution scope, not a claim that a release requirement disappeared. Native Auth shims/mocks never count as real Auth/JWT proof. Historical Sprint 0, apply and security evidence is retained in its original reports.

## User-provided evidence

The owner reports that the Auth account was created, email confirmed and UUID allowlisted, and that Login, Dashboard, Roadmap, Vocabulary, Settings save/reload and Logout passed manually. This task did not create/alter that account, Auth settings or allowlist. Manual Settings-write evidence is credited as user-reported, not relabeled automated mutation coverage.

The owner explicitly confirmed **no second Development account exists**. No outsider/User B was created or allowlisted. No owner identifier, email, password, session/token or profile values are published in this report.

## Acceptance matrix

| Criterion | Status | Evidence and limit |
| --- | --- | --- |
| Six deployed migrations and structural security baseline | PASS | CLOUD_MIGRATION_REPORT: six ledger rows, immutable hashes, nine catalog sections, classified pre-existing RLS helper; no re-apply |
| Real owner password login and logout | PASS | User manual report + 33-check real browser/Auth helper, Server Actions at localhost:3101 |
| Verified owner/allowlist | PASS | Real Auth getUser returns confirmed user; learner predicate true; profile UUID equals that identity |
| Private Auth configuration | PASS | GET /auth/v1/settings=200: disable_signup=true, external.email=true, external.anonymous_users=false; no signup attempt/config write |
| Protected pages and Route Handler | PASS | Anonymous redirects; /api/me=401 without identity; owner=200 with only own id/email and private,no-store; denial after logout |
| Session persistence/cookies | PASS | Real SSR cookie jar scoped to 127.0.0.1, path /, SameSite=Lax; authenticated reload; no saved storage state, screenshots or traces |
| Token refresh | PASS (explicit refresh) | Real Auth refreshSession, new cookies accepted by SSR; same identity/profile retained |
| Naturally expired/revoked token through Proxy refresh branch | BLOCKED | Explicit refresh is not a forced natural-expiry/revocation test; no fabricated JWT or changed Auth expiry settings |
| Proxy/server/browser separation | PASS (review + normal real traffic) | Proxy getClaims and cookie forwarding; every data boundary independently getUser + confirmed allowlist; request-scoped React cache |
| Dashboard/Roadmap/Vocabulary/Settings desktop and 390x844 | PASS | Real authenticated route/overflow checks; user manual navigation; no populated curriculum claim |
| Settings stored in PostgreSQL and restored | PASS (read + user write evidence) | Exactly one existing own profile; UI equals DB fields before/after reload/refresh; user already reported successful save |
| New automated Settings write/retry/no-cross-account overwrite | BLOCKED | No permission to overwrite personal profile for testing; no new write attempted; unit action whitelist/identity tests pass |
| Profile uniqueness/UUID linkage | PASS | Live own profile read returns one row, id matches Auth; deployed PK/FK; profile unchanged by this task |
| Anonymous app/private API | PASS | Separate GET-only suite; protected app suite; prior catalog effective anon privileges |
| Owner cannot HTTP-read private answer keys | PASS | Real owner JWT request gets PGRST106; anonymous private-profile probes too |
| SRS/event direct-write restrictions | PASS (catalog/static/native historical) | Effective authenticated table/column privileges, no direct browser write code; no Cloud write probe executed |
| Negative HTTP mutation probes | NOT APPLICABLE to this read-only run | Even invalid/nonexistent-row UPDATE/INSERT is outside current mutation authorization; this does not certify successful learning mutations |
| Nonallowlisted real Auth account denied | BLOCKED | No approved outsider credentials/account; mocks/native checks are supplementary only |
| A/B cross-user read/write isolation | BLOCKED | No User B or approved populated two-user dataset; owner-only/empty reads cannot prove cross-user denial |
| Owner reads only owned state | PASS, bounded | Real JWT reads cards/events/progress/sessions; every returned user_id is owner; capped at 1000 rows/table, empty results are not cross-user proof |
| No sensitive app response fields | PASS, bounded | /api/me exact own identity shape; private answer schema denied; static credential/answer-table/browser-bundle scan; not a packet audit of every populated future flow |
| Server Action same-origin/input restrictions | PASS (source/mocks); BLOCKED for hostile live request | Explicit settings fields/server UUID; Next Server Actions, no custom write endpoint; hostile-origin replay not performed |
| Private Storage/signing/content rights | BLOCKED | No approved bucket/object/policy/pilot; existing audio handler fails closed; no paid asset or content fabricated |
| Public database type generation | BLOCKED | Pinned CLI 3.1.0 gen types exited 1; output suppressed, cause not established; no Docker fallback or application type replacement |
| Reviewed projections vs deployed metadata | PASS, bounded | 76 local AST/catalog checks: selected fields of 11 table Row projections + three read-RPC signatures; partial projections have permissive Partial<Row> writes/empty Relationships and are not full generated schema |
| Lesson/mini-quiz/SRS UI | NOT APPLICABLE to Sprint 1 execution | Explicitly moved to Sprint 2; no claim that full MVP is complete |
| Pilot, full release tests and operational restore | BLOCKED | Provenance/rights/audio/import and backup/restore evidence still absent |

## Commands executed

| Command | Observed result |
| --- | --- |
| npm run typecheck | PASS |
| npm run lint | PASS |
| npm run build | PASS, Next 16.4.6 Webpack, .env.local public configuration |
| npm run test | PASS: final 87 tests/12 files, including private Auth configuration regression |
| npm run test:e2e | PASS: six passed, two skipped (configured Cloud means missing-config cases not applicable); desktop/mobile Chrome |
| npm run test:contracts | PASS, static contract/snapshot checks |
| npm run test:security | PASS, credential/grant boundaries and built browser bundle; supplementary |
| powershell -NoProfile -File scripts/acceptance-auth.ps1 | PASS: 33 real owner browser/Auth/read checks, owner entered both credentials at hidden local prompts |
| npm run db:types with approved exact Development ref | BLOCKED: CLI exited 1, no generated artifact; no raw diagnostic/credential printed |
| node scripts/check-auth-config.mjs | PASS: public GET confirms email login enabled, signup/anonymous sign-in disabled |
| node scripts/check-type-projections.mjs | PASS: 76 checks against captured real catalog; no app type replacement |

Initial sandbox production build failed with EPERM while writing .next; the same build outside the sandbox passed. CLI --help initially failed on telemetry storage permission; DO_NOT_TRACK=1 allowed help inspection. Browser suite initially refused occupied port 3000; playwright.config.ts now accepts a validated HANLEARN_E2E_PORT (3102 used), retaining reuseExistingServer=false. No user server was stopped. These environmental attempts are not counted as successful acceptance runs until their final reruns passed.

`scripts/check-cloud.mjs` was inspected but **not run**: it requires two allowlisted accounts and contains UPDATE/INSERT probes. It is not a read-only fallback for the current task. No native destructive/concurrency suite was pointed at Cloud. Existing native SQL/concurrency evidence remains supplementary and historical; this task did not rerun those Cloud-incompatible fixtures.

## Read-only test matrix still needed

| Identity | Setup required | Read-only expectations | Status |
| --- | --- | --- | --- |
| Anonymous | Publishable key only | app redirects/API401; direct public tables/RPCs denied; private schema excluded | PASS |
| Confirmed allowlisted owner A | Existing owner; secure local login | own profile/state; published ancestry; read RPCs; logout/refresh | PASS, bounded above |
| Confirmed outsider C | Separately approved Auth account outside allowlist | Auth login succeeds directly; learner predicate false; no catalog/state; app refuses session/access | BLOCKED |
| Unverified account | Separately approved account/flow | no learner access even with credentials | BLOCKED |
| Allowlisted User B | Separately approved identity and owned test rows | A querying B and B querying A return no rows; private keys denied; no spoofed user_id | BLOCKED |
| Removed/revoked/expired identity | Separately approved session lifecycle test | fail closed and clear/refresh cookies safely | BLOCKED |

Use the secure helper with `-Role Outsider` or `-Role LearnerB` only after that specific existing account is approved. Those role runs do not provision identities, alter allowlist, or create cross-user fixtures. A LearnerB run alone does not prove the A/B matrix without known approved foreign records. Future write/atomicity tests require a separately approved isolated dataset and explicit mutation scope; never borrow the owner's learning history.

## Security/data findings and decision

No new application data-leak or unauthorized-write defect was demonstrated by the executed scope. No profile/learning row was changed; login/refresh/local-session logout were the only permitted Auth lifecycle operations. Local-server cookies use HTTP development behavior; HTTPS deployment cookie behavior remains a deployment gate, not a false local Secure-flag assertion. Public publishable configuration is intentional; no service-role/secret key is used.

The platform rls_auto_enable function remains unchanged and separately reviewed: best-effort enabling for new public tables, with logged/swallowed errors. It does not replace migration RLS or broaden application privileges.

Documentation clarification found during review: SRS_SPEC says “1–20 MiB” for audio, while deployed SQL explicitly accepts 1 byte..20 MiB. PILOT_CONTENT_PLAN records the actual bounds and leaves media wording clarification as a pre-implementation gate. No deployed constraint or acceptance criterion was silently changed.

**PARTIAL** remains necessary because real outsider/A/B isolation, natural expiry/revocation handling, remaining live security cases, Storage/licensed content and release operational evidence are incomplete. Successful owner navigation and local tests do not waive these criteria. Type generation is also unfinished, with the app's curated projections preserved.

## Sprint 2.1 entry gate

Planning is complete; implementation is not authorized by this document. Before starting 2.1, approve its read-only lesson scope, confirm the lesson content JSON/DTO contract, reconcile used database types, and arrange approved outsider/B evidence or explicitly record the unresolved security gate in a separately approved implementation decision. That decision cannot mark Sprint 1 COMPLETED or release the app. Real-content acceptance additionally needs the reviewed licensed pilot/ancestors; listening needs private Storage verification. No Cloud mutation/import/new migration occurs merely because frontend work is approved. See SPRINT2_PLAN.md for the complete order and per-task gates.
