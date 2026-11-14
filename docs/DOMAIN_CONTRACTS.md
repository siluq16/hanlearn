# Domain contracts — revision 4 (PRIVATE_INVITE_ONLY; SQL unchanged)

Development workflow update (2026-11-14): Study/Quiz Server Actions may call the existing learner-JWT RPCs on fixed project `hhgxrjqkuwdgurphopok` with server-only `HANLEARN_DEVELOPMENT_LEARNING=1`. Other Cloud projects and production deployments remain denied. Ordinary Development reads/tests need no signature, approval JSON or full import preflight. Automated mutations use a dedicated automation identity; owner/friend state is excluded. SQL contracts, Auth/RLS, content metadata and answer isolation are unchanged.

## Identity and curriculum

Only auth.uid() in private.allowed_learners with confirmed email can access app data. Operator provisions the user; disabling public signup is defense in depth. Baseline 0–9, target 1–9. MVP daily goal fixed 60 and timezone fixed Asia/Ho_Chi_Minh. Syllabus version independent of lexical identity and lesson content. Levels 1–9 are valid; do not interpret 7–9 as three verified independent official exam formats.

Pilot release: one HSK 1 course, one unit, 3–5 ordered lessons, 30–50 unique words. These counts and content rights are curated release checks, not global constraints on future curricula.

## Content and publication

Every content entity (syllabus/audio/vocabulary/grammar/course/unit/lesson/quiz/question) has draft/published and pending/approved review, source_uri, content_license, reviewed_by, reviewed_at. Published requires approved, nonempty provenance/license/reviewer/time. These SQL requirements are unchanged; `published` means readable catalog under RLS, not public distribution. Content policy has two levels using the same schema/importer:

- **PERSONAL_DEVELOPMENT:** legacy owner-only scope, retained for historical overlays. Current shared learning uses PRIVATE_INVITE_ONLY below. Explicit owner acceptance of the exact experimental package is required; VIEWED_NOT_APPROVED is viewing evidence only. Independent language certification and verified distribution rights may remain PENDING. `content_license` may contain the truthful scope declaration `PERSONAL_DEVELOPMENT; AI-assisted; owner-accepted experimental content; distribution rights unverified; no public distribution or third-party license asserted.` This is not a license grant. `reviewed_by/reviewed_at` describe the actual owner acceptance person/role and event, not an invented review or an import time. Retain the separate viewing scope/timestamps, language verification, rights clearance and Cloud-write decisions. Known unresolved copying issues still block use; unknown provenance is retained as unknown, never silently cleared. No human-review rows are auto-approved.
- **PRIVATE_INVITE_ONLY:** current owner-authorized experimental sharing with confirmed, authenticated allowlisted invitees on Development. Keep both current memberships; do not require a singleton or create roles. All invitees share published catalog; profiles, progress, attempts/responses, cards/events and study history remain auth.uid()-scoped under existing RLS/RPCs. The separate sharing decision is the owner's explicit request, not a retroactive change to the historical self-study acceptance. Metadata declares AI assistance and unverified third-party sharing/distribution rights; it is not a license or public release. Known unresolved copying still blocks. No public signup or Cloud mutation guard is opened.
- **PUBLIC_RELEASE:** independent language review, source-specific provenance, attribution and rights for intended public distribution remain required. Personal scope/owner acceptance cannot satisfy these gates. Self-authored: `content_license='self-authored'`, `source_uri='urn:hanlearn:...'` plus actual author/reviewer evidence; do not label AI-assisted content self-authored without evidence. External permissions must allow the intended distribution; a URL or scope declaration is not rights clearance.

A syllabus additionally needs verified_at and exact source edition before publication. For PERSONAL_DEVELOPMENT/PRIVATE_INVITE_ONLY this may be the actual completion timestamp of a machine-assisted check of the pinned primary PDF/extracted-text hashes, cover edition/implementation dates and selected headword/readings. Record method/counts/scope separately in the versioned overlay; this does not certify senses, teaching explanations, all grammar or human review. Do not substitute owner viewing time or a guessed historical time. official_vocab_totals is a reviewed per-level cumulative map, e.g. keys '1'...'9'; unknown values omitted, never invented. Import operator checks positive integer cumulative totals, duplicates, Unicode/pinyin, Vietnamese and exact membership. There is no supplied official seed.

Read conditions: syllabus published; course + syllabus published; unit + course + syllabus published; lesson + full ancestry published. Membership/join tables require both referenced sides readable. Vocabulary/grammar are independent catalog entities: published entries may remain searchable when a lesson is draft; their draft lesson relationships/content never leak. Private keys never appear in content JSON or API props. Published quiz revisions freeze questions/options/keys; corrections use a new lesson/quiz revision in MVP, old attempts remain intact. Other published lesson content must be versioned administratively rather than silently changing the meaning of existing completion.

Audio metadata visibility does not grant bytes. Private Storage, signed URL endpoint rechecking learner and published asset, MIME/size limits and actual object verification are release gates. Never redistribute HelloChinese content.

## Mini-quiz and lesson completion

MVP single-choice, zero-based choice indices, 2–6 choices, 5–10 equally weighted questions per published quiz. One immutable quiz per lesson revision. Publication trigger requires all questions published/reviewed, valid private answer index and exactly 5–10 keys. Start RPC returns owned attempt ID only; question reads return prompt/choices, never keys. No timer/full-exam claim.

Submit receives an object {question UUID: choice index}. Missing responses are incorrect; extra question IDs, invalid indices/nonintegers reject atomically. Server derives counts from stored keys. score=100*correct/N; passed iff 100*correct >=80*N (not rounded display score). Every retake is a new attempt. Attempt is the submission identity: same answers retry returns stored result, changed answers conflict. Responses/score only readable for owner, responses after submission; keys remain private even after grading. Attempt lock prevents double submission.

Lesson completed iff studied_at exists AND at least one passed attempt for that lesson quiz. Explicit mark_lesson_studied records self-confirmed study; passing alone leaves it incomplete. The second satisfied condition sets completed_at once and creates eligible cards in the same transaction. Failed later retakes do not revoke completion. Mark/submit serialize on (user,lesson). Repeating completion never resets card state or resurrects archived cards. Progress persists in PostgreSQL; reload must read it, never infer from client storage.

## SRS

See SRS_SPEC.md. Scheduling state distinct from mastery. Exactly one public submit_review operation; no browser direct writes to cards/events. Profile is the only directly writable app entity, with column restrictions. All other writes use constrained RPCs.

## Daily planning and tasks

Fixed local date at Asia/Ho_Chi_Minh; no dependence on database session timezone. generate_daily_plan accepts today through today+13. One study_plan per (user,syllabus), five baseline tasks per (plan,date), deterministic task keys: review=10m, vocabulary=15m, grammar=10m, hellochinese=15m, quiz=10m. Total baseline 60. Generation is insert-on-conflict-do-nothing: retries never reset done/skipped/moved tasks or replace assigned lessons.

Select first incomplete readable lesson at or below profile target level (default 5 without a profile), ordered by course level, course sort_order/id, unit sort_order, lesson sort_order. No graph and no hard access lock on later lessons. If none exists, vocabulary/grammar/quiz slots become review slots. Future dates are provisional and may repeat the same next lesson; no automatic assumption of future completion. No adaptive workload algorithm in MVP.

Task status pending -> done/skipped/rescheduled only, terminal thereafter. Task completion is self-report, not lesson completion or a study session. Reschedule only to a later date within today..today+13; original row/date preserved as rescheduled; child points to unique rescheduled_from, new task_key='move:<id>'. Retry same move returns child; different destination conflicts. Chained rescheduling creates lineage. New day's baseline plus moved backlog may exceed 60; show backlog separately, never silently delete history. No automatic midnight movement of skipped tasks.

## Time evidence and no double counting

System timer start/stop uses server clock; one active timer per learner, maximum counted interval 4h, capped flag when stopped late. Timer duration is recorded elapsed time, not proof of attention. Open timers do not contribute until closed. Start idempotency key reused returns original session; stop retry returns it unchanged.

Manual HelloChinese/other entries require explicit start/end instants, end <=server now, duration >0 and <=4h, labeled self_reported. No duration-only entries because overlaps cannot be resolved. They never produce words/mastery. Same key + identical semantic interval/source returns original; other payload conflicts. Accepted session records are immutable to learner; correction workflow is deferred (operator-led correction must preserve audit evidence).

Use half-open intervals [start,end), split at local midnight. For each day, actual_minutes = seconds in UNION(all closed session intervals)/60. system_minutes = UNION(system_timer)/60. self_reported_only_minutes = UNION(all) minus UNION(system), divided by 60. Thus system takes precedence in overlap; manual/manual overlap is counted once. Keep raw intervals and evidence, report source totals separately and never add overlapping raw durations. Compute with exact seconds; round only display to two decimals.

## Analytics formulas

- Active study day: actual_minutes >=1. Completed lessons/reviews without session time do not manufacture a streak.
- Current streak: consecutive active local dates ending today; if today inactive, ending yesterday; otherwise 0. Longest streak: maximum contiguous run of active dates. Future dates excluded.
- Course completion: completed readable lessons / all readable published lessons in that course *100. No denominator => null/unavailable. Preserve historical completions if content hidden, exclude them from current readable denominator/numerator.
- Syllabus imported coverage at level L: distinct introduced words with readable cards in current syllabus membership introduced_level<=L / all published imported members <=L. archived-only cards do not count as introduced for current coverage. No imported denominator => null.
- Official introduction coverage: same numerator / verified cumulative official total for that level. Unknown total => null, display 'official total unverified'. Show imported coverage separately; a tiny pilot is not a full HSK list.
- Mastery coverage: currently mastered distinct words in that membership / same chosen denominator, labeled imported vs official.
- Current due count: owned, nonarchived, nonsuspended, due_at<=server now, published vocabulary and eligible audio for audio direction.
- Review success: Good/Easy count / accepted rating events in selected local date range. Hard is not success for this metric. No events => null.

daily_study_metrics and vocabulary_progress are security-invoker views. Other metrics are specified for user-scoped server queries in Sprint 1; do not claim endpoints/UI exist yet.

## API contract inventory

Public RPCs: submit_review, set_card_status, mark_lesson_studied, start_quiz, submit_quiz, generate_daily_plan, update_task, start_timer, stop_timer, log_manual_session. Signatures in migrations. SQLSTATE PT404=not found, PT409=state/idempotency conflict, 22023=invalid input, 42501=unauthorized; future handlers map to 404/409/400/403. No user_id input. PostgreSQL errors must be mapped to safe messages in future handlers. No exam route in MVP.

Sprint 1 adds only read RPCs: get_learner_access (existing verified-UUID predicate), get_due_review_count (database now(), eligible owned cards), search_vocabulary (literal substring, one published syllabus, exact introduced-level filter, offset/limit, true total even on empty pages). These are invoker functions and do not alter SRS/mastery/quiz/progress contracts. Settings persists the existing profile fields; theme is a local browser preference.
