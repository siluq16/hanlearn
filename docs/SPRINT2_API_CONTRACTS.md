# Sprint 2 API and persistence contracts

2026-11-13: L2 now has a local-only Server Action adapter with independent requireLearner, strict input, RPC/readback and server hard block on Cloud targets. See [SPRINT2_2_VERIFICATION](SPRINT2_2_VERIFICATION.md) for actual test limits; no RPC signature or migration changed, and proposals outside 2.2 remain unimplemented.

2026-11-12. **Specification only.** Existing signatures below are from migrations 001–006. Proposed RPCs/routes are explicitly marked and do not exist yet. Never call a privileged private table from Next with a secret key to fill a missing API.

## Shared boundary

Server Components use requireLearner for reads. Each Server Action/Route Handler independently revalidates getUser, confirmed email and get_learner_access; Proxy refresh/getClaims alone is not authorization. Supabase clients carry the real learner JWT. DB implementations repeat ownership/visibility validation. No input user_id, score, reviewed_at, due_at, mastery, evidence type or server timer start/end. Private data uses private,no-store and no cross-user shared cache.

Use Server Actions for mutations; do not perform RPC writes in GET handlers, render, route prefetch or effect-on-mount. Next same-origin protection plus runtime Zod validation; no generic arbitrary-table/RPC endpoint. GET Route Handlers are only for explicit reusable reads/media. A disabled button is UX, not authorization.

Common action result proposal: `{ok:true,data:T}` or `{ok:false,error:{code,message,retryable}}`. HTTP equivalents: unauthenticated 401; forbidden 403; PT404 ->404; PT409 ->409; 22023 ->400; unexpected/constraint/backend outage ->safe 503 unless an explicitly reviewed input constraint maps to 400. Do not return SQL text, stack, fingerprint, raw Supabase error, answer keys or privileged credentials. Distinguish unknown network outcome from a known rejected transaction.

All UUIDs validated; strings/collections bounded. Timestamps are UTC RFC3339 instants, local plan dates YYYY-MM-DD at Asia/Ho_Chi_Minh. Integer ratings/indices, finite duration, safe integer versions; never round a bigint version. Current receipts encode version as JSON numeric: reject unsafe values rather than silently corrupt them; any future string-bigint wire change requires an explicit reviewed compatibility change.

After successful writes, revalidate affected lesson/roadmap/dashboard/review/plan paths and reread PostgreSQL state. Client state never manufactures completion, cards, scores or session time. Persisted state is PostgreSQL; request-scoped cache is only a read optimization.

## Lesson reads and explicit study

### L1 — proposed server query getLessonBundle(lessonId)

Read exact safe columns from lessons, parent unit/course/syllabus, lesson_vocabulary -> vocabulary, lesson_grammar -> grammar_points, own lesson_progress, published quiz metadata. Reuse current JWT/RLS; validate lesson.content as the agreed content-v1 schema. Return null/unavailable for an invisible/missing ancestor, not partial draft content. Catalog entities can remain independently searchable when their draft lesson is hidden; do not leak the relationship.

DTO: lesson `{id,title,objectiveVi,estimatedMinutes,contentVersion,sections,provenance}`, parent identifiers/titles/syllabus code/HSK level, ordered safe word/grammar DTOs with credits, own `{studiedAt,completedAt}`, optional `{quizId,title,revision}`. No quiz answer/explanation/key nested in sections. Query explicit safe fields rather than pass raw DB rows or arbitrary content JSON into client props.

Sprint 2.1 finalized the read-only Content V1/DTO contract in [LESSON_CONTENT_V1](LESSON_CONTENT_V1.md), implemented with a strict Zod discriminated union. Four section types, 30 sections, 100 total blocks, explicit per-type lengths and lesson-scoped refs; listening assets remain inert/unavailable. This supersedes the tentative L1 shape, not any business transition/RPC. There is no schema migration or content import.

Listening references an authorized audio asset/transcript and requires separately specified signing for section assets. Existing `/api/vocabulary/[id]/audio` signs only a vocabulary-linked readable asset for 60 seconds. It is not an arbitrary asset signing endpoint. A future lesson-section audio handler must independently prove the asset belongs to the readable lesson, enforce reviewed metadata/bytes/license and learner Storage policy; missing policy/object ->unavailable. No public URL fallback.

### L2 — existing RPC mark_lesson_studied

Input `{p_lesson_id:uuid}`; return `{completed:boolean}`. Derived identity, visible ancestry, per-user/lesson serialization. Inserts/retains first studied_at, calls completion in the same transaction. Repeated calls preserve first completion and existing card state. Do not send studied_at or write lesson_progress directly. UI rereads progress to obtain timestamps; receipt does not contain them.

## Mini-quiz

### Q1 — existing RPC start_quiz

Input `{p_quiz_id:uuid,p_idempotency_key:uuid}`. Exact receipt `{attemptId:uuid,quizId:uuid}`. Save one start key per intended attempt before sending. Retry identical quiz/key; a different quiz with the same user/key conflicts PT409. Retake uses a fresh key and creates a new attempt. No questions/answers/explanations or quiz timer are returned by this RPC.

### Q2 — existing RPC submit_quiz

Input `{p_attempt_id:uuid,p_answers:Record<questionUuid,integerChoiceIndex>}`. Indices are zero-based, 2–6 choices/question, 5–10 questions/quiz. Omit unanswered keys; missing is incorrect. Null, extra/foreign question ID, noninteger/out-of-range index rejects atomically. Bound submission to ten keys/short payload and canonical known UUIDs in the adapter; DB still validates all input.

Exact receipt `{attemptId,correctCount,questionCount,scorePercent,passed}`. DB determines scorePercent rounded to two decimals for display, while pass uses `100*correctCount >=80*questionCount`. No client grade/time accepted. Attempt ID is submission identity: same semantic JSON answers retry ->stored receipt, changed answers ->PT409. Do not generate another attempt after a timeout until original outcome is known. Retake is explicit, not a retry.

The transaction inserts responses, sets submitted result and invokes completion/card creation atomically. It does **not** return completion state or explanations. Reread own lesson_progress. Completion requires studied_at AND a passed attempt; whichever transition satisfies the second condition completes it once. Failed retakes never remove completion; archived cards never resurrect.

### Q3 — proposed safe query adapters (no new DDL required)

Question query: id,quiz_id,sort_order,prompt,choices plus safe provenance, from readable published quiz/ancestry. Attempt history select ONLY granted columns: id,user_id,quiz_id,started_at,submitted_at,correct_count,question_count,passed. Do not SELECT *: start_key, submission_payload/fingerprint/result columns are intentionally ungranted. Own submitted quiz_responses can return question_id,answer_index,is_correct. Pre-submit responses must not be visible. No raw keys even after grading.

### Q4 — proposed read RPC get_quiz_feedback (requires new migration)

Input `{p_attempt_id:uuid}`. Proposed receipt `{attemptId,items:[{questionId,selectedIndex:null|integer,isCorrect:boolean,explanationVi:null|string}]}`. Join only owned submitted attempt ->its responses/questions ->private keys. Return no correct_index, key-row object, fingerprints, unrelated question or other user's result. Missing/foreign attempt ->PT404; own unsubmitted attempt ->PT409. Explanations are fetched only after server-confirmed submission. Publisher reviews text for rights and accidental pre-submit inclusion. No blanket grant of private SELECT or all private functions.

Public SECURITY INVOKER wrapper, narrowly granted private SECURITY DEFINER with fixed empty search_path, explicit require_learner/ownership and fully qualified names, like the existing architecture. This contract is a proposal, not a deployed RPC. If approval is unavailable, show grading receipt/history and a truthful unavailable explanation state.

## SRS

### S1 — proposed DB-time queue read RPC

`get_review_queue(p_limit integer default 20,p_cursor jsonb default null)` proposed return `{asOf,items:[{cardId,vocabularyId,cardType,version,algorithmVersion,state,dueAt,front,back,audioAvailable}],nextCursor}`. Cursor `(dueAt,cardId)` validated and used as keyset order; limit 1–50. Use one statement DB time, due_at<=DB now, auth.uid ownership, nonarchived/nonsuspended, published vocabulary and eligible published audio. Public invoker/RLS; fixed search_path. No mutation/locking during GET. Empty queue can legitimately change before submit; submit remains authoritative.

`get_due_review_count()` already exists and uses DB now; it does not return queue rows or a server timestamp. Do not substitute browser/server-process Date.now for eligibility. New queue RPC needs separate migration/test/apply approval. History can use explicit allowed review_events fields (id,card_id,rating,response_ms,reviewed_at,algorithm_version), not request fingerprints/payloads/full previous/next snapshots in client props.

### S2 — existing RPC submit_review

Exact input `{p_card_id:uuid,p_rating:1|2|3|4,p_response_ms:null|integer,p_expected_version:bigint,p_idempotency_key:uuid}`. response_ms 0..3,600,000; expectedVersion >=0. Again=1, Hard=2, Good=3, Easy=4. No due date, clock, EF or state supplied by client.

Exact receipt `{status:"ok",cardId,version,nextDueAt,intervalDays,newState,reviewedAt,algorithmVersion}`. DB uses hl-sm2-v1 with old EF, locks (user,key) then owned card, checks version/due/content and updates state+one immutable event in one transaction. Replay lookup happens before due/version/archive validation; identical accepted retry must retain its original receipt even after archive. Different semantic payload/key reuse ->PT409. Other user's card ->PT404. New key cannot bypass stale/due rules.

Proposed pending envelope `{operation:"review",accountScope,cardId,rating,responseMs,expectedVersion,idempotencyKey}` contains no JWT/password/answer keys. Store only if reload recovery is enabled in a minimal per-account browser record; document local device data, expire on resolution/logout, never import across users. It is a request-retry buffer, not offline authoritative progress. Do not change responseMs/version/key between retries. Unknown outcome ->disable new review for that card, retry original or query own persisted evidence. PT409 ->show stale/inactive/content conflict and reload; never auto-resubmit with fresh key/version. Separate tabs serialize in DB, UI reconciles receipt/state.

### S3 — existing RPC set_card_status

Input `{p_card_id:uuid,p_action:"suspend"|"resume"|"archive",p_expected_version:bigint}`. Receipt is the updated row (existing SQL); adapter must emit only approved card/version/state/due/archive fields. No idempotency key exists: after lost response reread current state/version instead of blindly retrying. Archive terminal; suspend snapshot internal; resume due=max(saved due,server now). Lifecycle history immutable. No browser direct update/delete/insert.

## Plan and tasks

### P1 — existing RPC generate_daily_plan

Input `{p_syllabus_id:uuid,p_date:YYYY-MM-DD}` ->plan UUID, not task list. DB local today..today+13 only. One plan/user/syllabus; baseline keys review(10), vocabulary(15), grammar(10), hellochinese(15), quiz(10). RPC task_type for review/fallback is `srs`. No-next-lesson vocabulary/grammar/quiz slots become srs while retaining their deterministic keys/minutes. Read owned daily_tasks after UUID receipt. Generation is an explicit mutation; never generate automatically on read/prefetch.

First incomplete readable lesson is chosen at or below target; future repeated lesson assignments are provisional. Retry does not reset terminal rows or replace existing assignments. Baseline=60; moved children are backlog and may make total >60. Task completion is self-report, not learning completion or session time.

### P2 — existing RPC update_task

Input `{p_task_id:uuid,p_status:"done"|"skipped"|"rescheduled",p_move_date:null|YYYY-MM-DD}` ->UUID: same task for done/skipped, child for move. From pending only; same done/skipped retry returns same task. Move later than original scheduled_date and within local today..today+13; preserve original rescheduled row, child rescheduled_from unique and key move:<originalId>. Identical destination retry returns same child; different destination conflicts. No reopening a done/skipped/rescheduled row, deletion of history or automatic midnight catch-up.

## Timer and external manual time

| Existing RPC | Exact input | Receipt and rule |
| --- | --- | --- |
| start_timer | p_idempotency_key UUID | session UUID; same timer key stable; other active timer ->PT409; DB start time |
| stop_timer | p_session_id UUID | same session UUID; retries stable; closed interval capped at 4h and capped flag; never browser elapsed input |
| log_manual_session | p_source text, p_started_at timestamptz, p_ended_at timestamptz, p_idempotency_key UUID | session UUID; sources hellochinese_manual/other_manual; explicit 0<interval<=4h, end<=DB now; same normalized interval/source/key replays, other payload conflicts |

After UUID response, read the own session's source,evidence,started_at,ended_at,capped. Timer source=hanlearn/evidence=system_timer; manual=self_reported. One active timer/learner; open timer contributes no analytics until stopped. No pause/resume segmentation or editing/deletion of accepted intervals in MVP. Accepted correction remains operator-led with audit evidence. Timer clock is display only; never accumulate reload elapsed into a new DB duration. No automatic HelloChinese API/scraping or vocabulary/mastery credit.

## A1 — proposed analytics read DTO

User-scoped server queries/views; no mutation RPC or writable aggregate. Return `{range,timezone,actualMinutes,systemMinutes,selfReportedOnlyMinutes,currentStreak,longestStreak,courseCompletion,importedCoverage,officialCoverage,masteryCoverage,dueCount,reviewSuccess}` with null/unavailable denominator semantics. Label reviewSuccess as Good/Easy / all accepted ratings in the selected local date range (Hard is not success).

Read daily_study_metrics: union of half-open closed intervals split at Vietnam midnight; system takes overlap precedence, never SUM raw session durations. Current streak ends today if active, else yesterday if active, else zero; active>=1 actual minute; future excluded. Completed lessons/reviews alone create no streak. Longest streak is longest contiguous active local-date run.

Course numerator/denominator use currently readable published lessons, completed subset only. Introduced/mastered words restricted to current syllabus membership at introduced_level<=selected level; active nonarchived cards required for introduction, two mature recognition/production directions for mastery. Imported denominator=published imported members; official denominator=verified cumulative official totals; unknown/zero ->null and explicit unavailable/unverified label. A pilot never implies a complete official list. New due count uses database time. Preserve UTC scheduling days as exact 24h; use local dates only for plans/analytics.

## Unimplemented contract gaps and validation

Q4 feedback and S1 DB-time queue are new proposals. L1 content-v1 and lesson-asset signing need agreed schemas. Exact official totals/authorized audio/pilot and a populated A/B matrix are absent. Do not add fabricated endpoints or replace the six migrations. Every implementation step needs local type/input/domain tests plus scoped real Auth/REST/browser acceptance with separately authorized fixture writes. No mutation is authorized by this planning document.
