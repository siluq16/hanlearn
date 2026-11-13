# Sprint 2 technical plan

2026-11-13 scoped update: Sprint 2.2 study confirmation source/local tests are implemented under separate approval; see [SPRINT2_2_VERIFICATION](SPRINT2_2_VERIFICATION.md). All Cloud writes remain hard-blocked in this iteration. The baseline below is historical; steps 2.3+ remain unimplemented, Sprint 1 PARTIAL and pilot human review/import BLOCKED.

2026-11-12. **2.1 read-only implemented under separate approval; remaining steps planning only.** No SQL migration or content import. Sprint 1 remains PARTIAL (SPRINT1_ACCEPTANCE.md). DOMAIN_CONTRACTS.md and SRS_SPEC.md remain authoritative. Proposed contracts and screens are specified separately in SPRINT2_API_CONTRACTS.md and SPRINT2_UI_SPEC.md.

Later scoped execution: the user separately approved **2.1 read-only only**, with the Sprint 1 blockers carried explicitly. That reader is now implemented; see [SPRINT2_1_VERIFICATION](SPRINT2_1_VERIFICATION.md) and [LESSON_CONTENT_V1](LESSON_CONTENT_V1.md). The planning baseline below is preserved. All mutation/quiz/SRS/planning/session/analytics/import steps remain unimplemented and require their own approval; 2.1 is not a release approval.

## Sequence and architecture

Implement small vertical steps: 2.0 readiness/types -> 2.1 lesson read -> 2.2 explicit study confirmation -> 2.3 quiz submit/completion -> 2.4 post-submit feedback -> 2.5 SRS queue -> 2.6 atomic review/retry UX -> 2.7 plan/tasks -> 2.8 timer/manual sessions -> 2.9 analytics/pilot acceptance. Content curation runs alongside design; Cloud import is separately approved after review, not a hidden frontend seed.

Retain Next.js App Router/TypeScript/shadcn, feature modules, Supabase SSR browser/server split and proxy.ts. Server Components read through the learner's JWT; Server Actions use the same identity/allowlist check and one public RPC per domain transition. No generic repository framework, new backend, service-role runtime, writable mastery counter or client-side scheduler. Share small display components (ChineseText, provenance, audio, states), not domain transactions. Persist lesson/attempt/card/task/session state in PostgreSQL; transient reveal/selection/UI state may stay in memory. Pending retry envelopes are transport recovery, never authoritative progress.

All future schema changes are additive numbered migrations after 006, with separate review/validation/Cloud apply approval. The six deployed files are immutable. Native regression may supplement tests, never simulate real JWT acceptance. No destructive/concurrency test on personal Cloud data.

## 2.0 — readiness and explicit DTO/types

- **Goal:** close the acceptance matrix and define narrowly typed content/API projections before UI writes.
- **Dependencies:** owner Auth PASS; approved outsider/B accounts and read-only isolation evidence; CLI type-generation access or a documented catalog-derived type reconciliation; content-v1 contract review.
- **Files/modules:** reconcile src/types/database.ts only after review; future src/features/lessons/schemas.ts, quizzes/schemas.ts, srs/schemas.ts; acceptance tests. Do not add these files in this planning task.
- **DB objects:** six-migration catalog, current public tables/views/RPCs; no DDL needed for a read-only type review.
- **API contract:** existing learner-access/due-count/search; explicit DTO fields, SQLSTATE mapping, safe error envelope.
- **Authorization:** real user JWT, confirmed email and allowlist at every read/action; no spoofable user_id.
- **Acceptance:** used columns/nullability and RPC Args/Returns reconciled; missing generated fields/Relationships not silently asserted; no unknown security differences; no credential in artifacts.
- **Tests:** real outsider/owner/B read matrix; schema drift/typecheck; malformed inputs; safe 401/403/503.
- **Blockers:** no second account; CLI generation currently exits 1; remaining Sprint 1 checks stay open. An explicit bounded implementation approval may carry these as unreleased gates, never waive them.

## 2.1 — published lesson detail (read only)

- **Goal:** render persisted lesson sections, vocabulary and grammar; resume saved lesson state.
- **Dependencies:** 2.0 DTO review; approved content-v1 schema; published ancestry/authorized pilot for populated acceptance. Empty/unavailable behavior can be tested with local fixtures.
- **Files/modules:** src/app/(app)/lessons/[id]/page.tsx plus loading/error/not-found; src/features/lessons/{queries,schemas,components}; reuse vocabulary/audio components and provenance.
- **DB objects:** lessons.content/metadata, units/courses/syllabus_versions; lesson_vocabulary/vocabulary; lesson_grammar/grammar_points; lesson_progress; audio_assets.
- **API/RPC:** read lesson bundle L1; existing audio endpoint only for vocabulary-linked audio. No mark/quiz/card mutation in this step.
- **Authorization:** requireLearner independently; RLS full ancestry and both sides of joins; no private key fields; validate JSON then render escaped structured text, no arbitrary HTML.
- **Acceptance:** draft/missing ancestor -> indistinguishable unavailable; ordered sections/joins; refresh reflects DB; legal source credit; no hardcoded learning content; absent audio shown as unavailable.
- **Tests:** published/draft ancestor, detached catalog visibility, malformed JSON, missing relation, XSS payload rendered as text/rejected, mobile/keyboard, DB reload; real outsider/B reads once approved.
- **Blockers:** licensed pilot/JSON schema not supplied; section-specific signed audio needs the separate media contract (do not invent an asset endpoint).

## 2.2 — study confirmation and completion readback

- **Goal:** explicit self-confirmed study independent from quiz pass/mastery; durable completion state.
- **Dependencies:** 2.1 and permission for isolated write fixtures during implementation acceptance.
- **Files/modules:** lessons/actions.ts, study-confirmation.tsx, progress-status.tsx; lesson reload tests.
- **DB objects:** lesson_progress; existing private completion helper; quiz_attempts/lesson_quizzes; review_cards eligibility/uniqueness.
- **API/RPC:** L2 mark_lesson_studied(p_lesson_id) -> {completed}; reread owned progress/cards summary after success. No direct progress/card writes.
- **Authorization:** verified allowlisted JWT; helper remains unexposed/unexecutable; ownership derived in DB.
- **Acceptance:** study alone not complete; study+passed attempt sets completion once and eligible cards atomically; reverse ordering works; retries do not reset/resurrect cards.
- **Tests:** study twice, pass-first/study-first, failed later retake, archived cards, reload/new session; native transaction assertions then separately approved live fixture tests.
- **Blockers:** Cloud mutations not authorized by current planning task; real licensed quiz/lesson fixtures needed for live completion proof.

## 2.3 — mini-quiz attempts, grading and history

- **Goal:** 5–10 single-choice questions, server-graded submission, immutable history/retakes.
- **Dependencies:** 2.1/2.2; published reviewed frozen quiz and private keys; explicit write-test dataset.
- **Files/modules:** src/app/(app)/lessons/[id]/quiz/page.tsx; features/quizzes/{queries,actions,schemas,components}; attempt-result page/component; retry utility limited to operation envelopes.
- **DB objects:** lesson_quizzes, quiz_questions, quiz_attempts safe columns, quiz_responses; private keys only inside grading; lesson_progress/cards.
- **API/RPC:** Q1 start_quiz, Q2 submit_quiz, Q3 safe history/response reads. Exact signatures/receipts in API contract. Retake creates a new start key/attempt.
- **Authorization:** each action getLearner + DB owner/visibility checks; questions safe DTO; no client score/correctCount/user_id; keys never enter RSC props, forms, logs or browser queries.
- **Acceptance:** >=80% by integer comparison; missing responses incorrect; unknown question/invalid index rejected atomically; identical retry returns same result, changed answers conflict; pass alone does not imply study/completion.
- **Tests:** 4/5 boundary, missing/foreign/invalid answers, duplicate submit, same/different payload, attempt ownership, key leakage across HTML/RSC/network and pre-submit history; reload result/retake; concurrency confined to isolated supplementary tests.
- **Blockers:** current result does not return completion or explanations; reread progress for completion, and implement 2.4 separately for feedback. Never claim current RPC already serves explanations.

## 2.4 — gated post-submission explanations

- **Goal:** explanations only after the caller's submitted attempt, while keeping raw keys private.
- **Dependencies:** 2.3; review/approval of a new narrow read RPC and migration; publisher reviews explanation rights/content.
- **Files/modules:** proposed future migration `..._quiz_feedback.sql`; quizzes/feedback.ts, result-feedback.tsx; DB/API leak tests. Exact version assigned when implemented, not reserved/applied now.
- **DB objects:** own quiz_attempts(submitted_at), quiz_responses, immutable question relation, private.quiz_answer_keys.explanation_vi.
- **API/RPC:** proposed Q4 get_quiz_feedback(p_attempt_id); no correct_index in any result. Returns own selected index/is_correct/explanation after submission; safe question text from Q3.
- **Authorization:** public invoker wrapper plus narrowly granted private implementation with empty search_path and explicit confirmed allowlisted owner/attempt check; no new browser private-table grants.
- **Acceptance:** foreign/missing/unsubmitted attempts denied; raw correct_index, internal fingerprints/payloads never returned; feedback not fetched eagerly; no key fields in lesson JSON.
- **Tests:** all roles, pre/post submit, attempt from another quiz/user, feedback equality for old immutable attempts, malicious content keys, private profile denial.
- **Blockers:** new RPC does not exist; no private query shortcut in the Next server using a privileged key. If migration not approved, explanation feature stays unavailable rather than fabricated.

## 2.5 — SRS study queue and history reads

- **Goal:** retrieve eligible due cards using DB time and display direction-specific front/back and history.
- **Dependencies:** 2.3 card creation; typed SRS DTO; separately approved read-contract migration if required.
- **Files/modules:** src/app/(app)/review/page.tsx; features/srs/{queries,schemas,queue,flashcard,history}; future due-queue migration.
- **DB objects:** review_cards, vocabulary, audio_assets, review_events, vocabulary_progress; existing due-count RPC.
- **API/RPC:** proposed S1 get_review_queue(p_limit,p_cursor); existing get_due_review_count; bounded history select projection. A JS/browser clock .lte(now) is not an authoritative due query.
- **Authorization:** invoker/RLS read with DB clock; owned active/nonarchived/nonsuspended card and published eligible content; omit internal request fingerprints and snapshots from UI DTO.
- **Acceptance:** deterministic due_at,id ordering; current version/algorithm returned; audio direction unavailable without actual signed asset; empty vs service error distinguished; mastery separate from schedule.
- **Tests:** exact due boundary, hidden/revoked content/audio, suspended/archive, pagination, history ownership, no duplicate queue cards, empty/no-content, mobile/reveal keyboard.
- **Blockers:** existing due-count RPC returns no queue/time; a new read RPC contract is needed for exact DB-time eligibility. No candidate RPC is created by this task.

## 2.6 — atomic review and conflict recovery

- **Goal:** submit Again/Hard/Good/Easy through one transaction; reliable retry after unknown outcome.
- **Dependencies:** 2.5; approved isolated accepted-review tests; no modification of existing algorithm.
- **Files/modules:** srs/actions.ts, review-controller.tsx, pending-review.ts, conflict-state.tsx; no generic mutation abstraction.
- **DB objects:** review_cards/version; review_events unique(user,key), immutable receipts; lifecycle events; existing submit_review and set_card_status.
- **API/RPC:** S2 exact semantic payload/key/version unchanged across retries; S3 lifecycle action with expectedVersion and state readback after ambiguity.
- **Authorization:** all identity/time/state from DB; browser never UPDATE cards or INSERT events. RPC receipts sanitized to named fields.
- **Acceptance:** four integer ratings 1–4; one accepted state update/event; preserve pending request until confirmed; PT409 shows conflict rather than silently generating a new key; PT404 hides foreign ownership; accepted receipt may replay after archive.
- **Tests:** SM-2 vectors, delayed response, lost connection after commit, same-key replay, changed payload, stale version in second tab, early review, rollback injection in disposable DB, archive/resume; no Cloud concurrency experiment.
- **Blockers:** pending retry envelope design must avoid account mixing and secret storage; multi-tab conflict acceptance needs approved isolated fixtures. Full offline synchronization remains excluded.

## 2.7 — daily baseline tasks and missed-task lineage

- **Goal:** persisted today's plan, explicit task outcomes and separate backlog.
- **Dependencies:** lesson/progress/SRS reads, active published syllabus, approved RPC write scope.
- **Files/modules:** src/app/(app)/plan/page.tsx; features/planning/{queries,actions,schemas,task-list,move-dialog}; dashboard task summary.
- **DB objects:** study_plans, daily_tasks, task_events; lessons/profile target; existing generate_daily_plan/update_task.
- **API/RPC:** P1 generate only on explicit action (never GET/render); P2 update terminal status/move date; owned plan/tasks readback.
- **Authorization:** date window enforced by DB Vietnam date; no browser plan/user association or direct task/event writes.
- **Acceptance:** five baseline slots total 60; no-next-lesson fallback preserved; generation retries retain done/skipped/moved assignments; missed rows remain on original date; later move creates unique lineage child; backlog may exceed 60 and is shown separately.
- **Tests:** deterministic keys/60 sum, repeat generation, date boundaries, same/different move retry, chained move, terminal conflicts, future provisional duplicate lesson; RLS on task history.
- **Blockers:** no published syllabus/pilot; do not add automatic midnight jobs or reassign already generated lessons silently.

## 2.8 — timer and manual HelloChinese intervals

- **Goal:** durable active timer, explicit self-reported external intervals, accurate union time.
- **Dependencies:** 2.7 UI links optional; session RPC write approval; input timezone schema.
- **Files/modules:** features/study-sessions/{queries,actions,schemas,timer,manual-session-form}; reuse across dashboard/plan.
- **DB objects:** study_sessions, one-active-timer index, daily_study_metrics; no HelloChinese API.
- **API/RPC:** T1 start_timer(key), T2 stop_timer(id), T3 log_manual_session(source,start,end,key); read session after UUID receipt.
- **Authorization:** server time/system evidence chosen in DB; manual source allowlist; no direct session update/delete/correction or user-chosen timer timestamps.
- **Acceptance:** refresh resumes active row, one active timer, start/stop retry stable; closed <=4h/capped; manual end<=server now and 0<duration<=4h; labels self_reported; never grant words/mastery or double count overlaps.
- **Tests:** unknown outcome/reload, duplicate start/stop/manual, conflicting key payload, overlapping intervals/manual-manual/system precedence, midnight split, future/end/start invalid, capped long timer.
- **Blockers:** immutable accepted manual errors have no learner edit/delete workflow; explain before submit. No continuous heartbeat or attention/proctoring claim.

## 2.9 — analytics, pilot and release verification

- **Goal:** dashboard reflects persisted learning evidence with exact formulas; validate one licensed pilot end to end.
- **Dependencies:** 2.1–2.8, PILOT_CONTENT_PLAN, approved owner/outsider/B fixtures and private Storage, operational backup/restore evidence.
- **Files/modules:** features/analytics/{queries,formulas,schemas,components}; dashboard queries/components; native/API/e2e acceptance; content tooling only after explicit approval.
- **DB objects:** daily_study_metrics, vocabulary_progress; published curriculum/membership; own completed progress/events/cards/sessions.
- **API/RPC:** A1 read-only aggregate DTO, exact formulas in API contract; no new writable counters or duplicated session duration SUM.
- **Authorization:** own JWT/RLS; no shared cache/user mixing; published denominators only; sources/licensing retained.
- **Acceptance:** union minutes/streak correct, null denominator unavailable, imported vs official coverage separate; 1 course/1 unit/3–5 lessons/30–50 words/5–10 questions each reviewed; persisted completion/cards/review/session after reload; signed audio bytes only with verified rights.
- **Tests:** 30m system+30m manual with 15m overlap ->45/30/15; Vietnam midnight; streak ending today/yesterday; lapse removes mastery; hidden lesson denominator; accepted review success Good/Easy only; mobile/keyboard/error/retry/resume; separate trusted restore drill.
- **Blockers:** content/licenses/Storage absent; official totals unverified; no cross-user accounts; Cloud mutation tests and imports need explicit separate approval. Do not deploy automatically.

## Completion and entry decisions

2.1 can begin only after a separate implementation instruction with bounded scope, agreed JSON/DTO/types and an explicit disposition of Sprint 1 security blockers (prefer completing real outsider/B read tests first). A carried blocker remains a release/acceptance blocker. Actual content/listening acceptance requires reviewed pilot/private audio; empty-state work does not certify a populated learning system. No new migration apply, import, account provisioning, Cloud fixture mutation or deployment is implied by planning or frontend approval.

At every step report local mocks/native vs real Auth/API/browser evidence separately. Small commits, immutable migration history, no Docker and no automatic Production/GitHub push. Stop at the approved step instead of filling future screens with demo curriculum.
