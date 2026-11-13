# Sprint 2.3 — Mini Quiz

2026-11-13. **LOCAL_PASS; live acceptance BLOCKED / not authorized.** No Cloud import, publication or write RPC was executed. Sprint 1 remains PARTIAL; frozen HSK 1 r3 and all 159 human-review PENDING records are unchanged.

## Implemented

- Main application route `/lessons/[id]/quiz`, linked from Lesson Detail. Published/readable lesson ancestry and quiz metadata are required; missing/draft/foreign attempts have a generic unavailable state. No synthetic fallback or authoring-package import exists in the app.
- One question at a time, native radio groups, answered-count progress, previous/next, explicit submission confirmation (blanks count incorrect), pending/error states, saved results, retakes and latest 20 owned attempts. Keyboard focus moves to the question, confirmation and result. Desktop 1280×900/mobile 360×800 are covered.
- `startQuiz` and `submitQuiz` Server Actions independently call `requireLearner`, strictly validate input, verify readable quiz/owned attempt, and call only the existing `start_quiz` / `submit_quiz` RPC. Direct action calls targeting Cloud/nonlocal URLs are denied before RPC, even with opt-in. `HANLEARN_LOCAL_MINI_QUIZ=1` permits only the same literal HTTPS loopback URL rules as Sprint 2.2; it does not authorize Cloud or bypass Auth. Default is disabled.
- Start key and immutable submission envelope are saved before sending, scoped by a server-derived owner/quiz/revision hash. No mutation runs on GET/render/mount. Unknown outcomes lock editing/new attempts; retry reuses the exact key or attempt/answers. Readback remains available without write permission. Corrupt recovery data fails closed. Session storage contains only transport IDs and the learner's own selections, never keys/Auth tokens or authoritative progress.
- Database receipt is validated, then owned persisted attempt/responses and lesson progress are reread. UI displays correct/N and the DB's passed flag; React never grades or manufactures completion/cards. Failed retakes retain existing persisted completion. Post-submit feedback exposes only own selected choices and `is_correct`. **Explanations are unavailable**: Q4 is not deployed and no migration/private-table shortcut was added.

## Boundaries and files

`src/features/quizzes/`: client contracts/player, server-only row schemas and explicit-column queries, guarded actions. `src/app/(app)/lessons/[id]/quiz/`: page/loading/unavailable states. Additive SELECT/RPC types in `src/types/database.ts` follow migration 003; they are curated projections, not newly CLI-generated types. Attempts never SELECT start_key, submission payload/fingerprint or internal result. Responses are queried only after owned `submitted_at` exists and checked against question IDs/counts and persisted correct count.

Synthetic harness/fixtures are only under `tests/` and `scripts/quiz-ui-harness.mjs`, never app routes or production seeds. `supabase/tests/mini_quiz.sql` adds rollback-scoped tests on the native disposable runner; six existing migrations and RLS are unmodified. Static security checks now restrict quiz writes to the guarded actions and reject private/operator fields/tooling in client output.

## Verification

| Executed check                 | Result                                                                                                                                                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run check:local`          | PASS: content/private bindings; typecheck/lint/contracts/security; 257 unit tests / 25 files and 40 browser checks (12 lesson + 18 preview + 10 quiz)                                                                                      |
| Quiz action/query unit tests   | PASS: auth/outsider mocks, direct Cloud/nonlocal/no-opt-in denial, strict input/response shapes, question membership/ranges, SQLSTATE sanitization, network ambiguity, readback failure, ownership/projections and account-scoped recovery |
| `npm run test:quizzes:browser` | PASS: 10 synthetic Chrome checks, desktop/mobile; full run repeated through check:local                                                                                                                                                    |
| `npm run test:db:native`       | PASS: 149 SQL assertions (86 baseline + 12 Sprint 1 + 29 quiz + 22 study/completion), plus 3 existing SRS two-connection regression cases                                                                                                  |
| `npm run build`                | PASS; dynamic quiz route included, no fixture/pilot/answer payload in production client                                                                                                                                                    |

Native quiz tests cover anon/outsider denial, private key/internal-column denial before/after submit, owned feedback, A/B read isolation, invalid/foreign/fractional choices with no partial rows, 3/5 fail, 4/5 pass, missing answers, same-key start retry, identical submit replay, changed submit conflict, explicit retake, quiz-first incomplete state, and late completion failure rolling back responses/attempt/completion. Study suite separately covers both completion orders, timestamps, duplicate cards and archived-card preservation. Native PostgreSQL 18.4 uses a synthetic Auth shim in a newly created loopback database; it is **not real Supabase Auth/PostgREST**. The server was stopped in finally. The 3 concurrent cases are existing SRS regressions, not a claim of concurrent quiz browser acceptance.

Browser transport is mocked; fixture receipts are synthetic backend envelopes, not a substitute for SQL grading tests. Tests cover keyboard selection/navigation, confirmation, DB-result/readback display, reload, retained start key across reload, no automatic mutation, exact submit retry/locked choices, pass/fail/study-first result, and blocked UI. All observed harness requests are loopback GET/HEAD; the mock callbacks never contact Cloud. Screenshot artifacts: `.local/previews/quiz-{desktop,mobile}-{question,result}.png` (Git ignored). Mobile question and desktop result were visually inspected; no horizontal overflow was observed.

Failures found and resolved: the initial lost-start fixture incorrectly dropped the retry response again after reload; it now drops only the newly created attempt's response and asserts identical key reuse. Existing Study Confirmation tests expected obsolete “quiz not implemented” text; they now assert the environment-specific notice and real quiz link. Bundle scan caught a generic grammar `explanation_vi` schema name imported through shared lesson validators; splitting row validators into server-only schemas removed it without relaxing the scan. No real answer payload was found or used for those fixes.

Routine `check:local` content validation may read the existing owner store under the simplified local policy, but only emits counts/status. It was not used to generate fixtures or UI content, and no private values/digests were copied to source, artifacts or reports.

## Run and remaining gates

```powershell
npm run dev
npm run test:quizzes:browser
npm run check:local
npm run test:db:native
npm run build
```

The real app requires authenticated published database content; the frozen pilot has not been imported. With the existing Cloud configuration, start/submit remain hard-blocked at the server. Synthetic interactive UI can be inspected separately with `node scripts/quiz-ui-harness.mjs` at `http://127.0.0.1:3105`; it is not the authenticated app or an HSK curriculum. Stop a manually running HSK preview before check:local so its tests can bind port 3114.

Live acceptance still requires an approved content/rights/publication mapping and exact Development import plan, secure real-key DB delivery reviewed separately, fresh target/schema/history/collision/effective-allowlist verification, and explicit permission for isolated live start/submit/study mutations. No User B, owner progress, Auth/RLS/migration change or Cloud guard removal is authorized by this result. Real JWT/session/HTTP and cross-account live tests are not claimed. SRS UI, plans, timers, analytics and Sprint 2.4 explanations are outside this implementation. No push/deploy.
