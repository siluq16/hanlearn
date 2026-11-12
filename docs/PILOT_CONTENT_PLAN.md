# Reviewed HSK 1 pilot content plan

2026-11-12. **Plan only: no curriculum supplied, imported or published.** No official HSK vocabulary list or HelloChinese API is asserted. A source URL is provenance evidence, not proof of permission. Content quality/rights review and a separate Cloud import approval are prerequisites, not an implicit part of Sprint 2 frontend work.

## Target and identity

One reviewed HSK 1 course, one unit, 3–5 ordered lessons, 30–50 distinct lexical vocabulary items across those lessons and 5–10 single-choice questions per lesson quiz. Reused words can appear in multiple lesson joins but count once in the 30–50 total. Two to six choices, zero-based key index and exactly one correct choice. Allocate lessons/words using a reviewed manifest, not a hardcoded React array or fabricated official seed.

Syllabus edition/code, verified source date/reviewer and source edition must be supplied before claiming HSK alignment. Syllabus membership introduced_level is separate from lexical identity and course.hsk_level. Roadmap displays HSK 1–5; database validates 1–9, but no higher-level syllabus/official totals are fabricated. Unknown official cumulative totals stay omitted/null. A small pilot is not a complete official HSK list.

## Content package to review (future files, not created now)

Proposed `content/pilot-hsk1/<revision>/manifest.json`, reviewed CSV/JSON for vocabulary/grammar/joins, lesson content-v1 JSON, quiz questions and a **separate restricted answer-key package**, plus rights evidence/asset manifest. Do not put private keys/explanations in a public bundle or commit credentials. Authoritative keys belong only in private.quiz_answer_keys after a separately authorized import. If maintaining source keys locally, use a restricted operator location excluded from app imports/static public assets and review repository access; an .env file is not a content distribution mechanism.

| Entity | Required reviewed fields |
| --- | --- |
| Syllabus | edition/code/display name; authoritative source URI; verified_at/reviewer; allowed scope; reviewed cumulative totals only if verified |
| Course/unit | stable identifiers, parent links/order/title; HSK level; per-entity source/license/review fields |
| Lesson | parent/order/objective/effort estimate; content-v1 validated sections/references; no answer fields; source/license/reviewer/time |
| Vocabulary | simplified/sense identity, marked pinyin, Vietnamese meaning, reviewed examples/translations, optional traditional/part of speech/audio; provenance for authored/adapted elements |
| Grammar | pattern/explanation/examples and Vietnamese text reviewed against the actual columns/JSON representation; provenance and rights |
| Membership/joins | existing lexical/grammar IDs, exact syllabus introduced_level, ordered lesson relationship; both endpoints reviewed/readable |
| Quiz/questions | immutable revision, 5–10 reviewed prompts with 2–6 text choices; unique order; no answer/explanation in prompt/choices/content |
| Private keys | valid question ID, correct_index < choices length, reviewed explanation_vi; kept outside browser/export payloads |
| Audio | real bytes/object checksum/path/MIME/size/transcript, speaker/source/permission evidence and attribution; asset and linked vocabulary/section reviewed |

Required publication fields per content entity are status/review_status, source_uri, content_license, reviewed_by, reviewed_at. A self-authored record uses content_license=self-authored and a stable urn:hanlearn:... plus author/reviewer record. “Self-authored” must reflect actual authorship; do not relabel copied examples/translations/audio. Store distribution/adaptation/attribution restrictions and evidence per source, with reviewer decision and scope. The owner selects authorized materials; this plan does not recommend copying restricted sources or provide legal permission.

## Offline validation and review workflow

1. **Acquire:** owner supplies actual source/edition and rights evidence or commissions original material. No scraping/import from HelloChinese or other apps. No public Cloud call at this stage.
2. **Normalize:** stable IDs, Unicode normalization with original form preserved, simplified/traditional and tone marks checked, sense identity deduplicated, Vietnamese translations/examples proofread, numeric pinyin consistent where used. Do not normalize homographs into one sense accidentally.
3. **Validate structure:** parse schema, unique IDs/order/DB keys, parent and membership references, content-v1 section limits, no unsafe HTML/external embeds/hidden answers; 30–50 distinct words and 3–5 lessons; every quiz 5–10 keyed questions. Reject unknown key fields in client content, not just fields literally named correct_index.
4. **Review language/pedagogy:** beginner objectives/order, unambiguous choices, no accidental correct-choice formatting, approved explanations, matching audio/transcript/pronunciation. Record reviewer/date/revision and unresolved issues; nothing publishes with pending issues.
5. **Review rights:** verify intended use for source, examples, translations, question text, images if any and audio separately; record author/licensor evidence and credits. Metadata constraints cannot verify legal truth. Unknown permission ->excluded/blocker.
6. **Media gate:** inspect actual bytes/MIME/checksum/size and private object existence. Deployed constraint is 1..20,971,520 bytes, supported audio/mpeg, audio/ogg, audio/wav, audio/mp4. SRS_SPEC's phrase “1–20 MiB” is ambiguous about the lower limit; do not silently invent a 1MiB minimum. Clarify documentation before media implementation; no deployed migration is altered here.
7. **Dry-run offline:** planned natural keys/IDs/counts/hashes, parent publication order and provenance checklist; distinguish new vs existing published rows. Native disposable regression may use explicitly synthetic fixtures; never present them as the pilot or copy the destructive runner to Cloud.
8. **Approval:** present exact Development ref, package hash/revision, affected new IDs/counts, media policy/object scope, collision report, transaction/publication plan and rollback limitations. Get explicit import/Storage/write approval. This task grants none.

## Future import design (not executable authorization)

Use a separate trusted operator process/versioned content manifest, secure local authentication and a transaction appropriate to the reviewed package. No service-role key in browser/runtime, arbitrary SQL from content, public upload path or reuse of the original six schema migrations as seeds. Prefer fail-on-conflict to silently upserting over published content. Existing user profiles/progress/cards/reviews/tasks/sessions are outside import scope.

Insert the reviewed graph as draft first: syllabus/course/unit/lesson, words/grammar/assets and joins, draft quizzes/questions then private keys. Verify all relations and fields before publication. Publish reviewed lexical/media/grammar entities and syllabus/ancestors, then lessons; publish all reviewed questions with valid keys while their quiz remains unsealed, then publish quiz last so the existing freeze/publication trigger validates its 5–10 questions. Exact ordering must be validated against the immutable trigger in migration 003. No temporarily published quiz should lack its final keys/questions.

If any validation fails, roll back the content transaction; do not disable constraints/triggers/RLS or repair schema. Storage uploads are not transactionally coupled to SQL: stage authorized private objects separately, verify them before metadata publication, and document approved cleanup of orphaned private objects rather than claiming DB rollback deletes bytes. No Storage or import is performed now.

Published quiz/question/key records are frozen. Corrections use a new lesson/quiz revision preserving old attempts; do not update a published key/explanation or rewrite old completion. Other published lesson changes must preserve versioned meaning, not silently replace lessons under existing evidence. Plan new IDs/order/parent revisions with the operator; avoid violating unique unit/lesson sort order. Do not delete the owner's evidence as a rollback mechanism.

## Post-import acceptance (separate approved task)

- Count exactly the reviewed pilot scope; match manifest hashes, titles/order/memberships, per-entity credits and complete published ancestry. Reconcile distinct-word vs join-row counts.
- Real owner sees published lessons/questions, no drafts or raw keys; anonymous/outsider denied; B receives no A personal state. Owner's ordinary browser cannot update scheduling/events/scores.
- Explicit study plus >=80% quiz persists completion/cards atomically with approved isolated data; both condition orders, retakes and retry tested. Nothing manually seeds card schedules or invented learner progress.
- Audio private unsigned/anonymous access denied; authorized short-lived signing works for actual licensed bytes; missing/revoked asset unavailable. Reissued URLs may outlive a later revoke until their short expiry; document actual policy behavior.
- Refresh/browser restart resumes progress/attempt/history/card state; planning/time/analytics use the locked formulas and approved test intervals. No Cloud destructive/concurrency tests on personal history.

## Responsibilities and blockers

Owner: source/edition/rights and approval of exact package/Cloud scope. Language/content reviewer: accuracy, pedagogy, provenance and attribution. Technical reviewer: schema/keys/content-v1 safety/private payload/media checks. Database operator: approved transaction/collision checks/publication record. One person may fill multiple roles, but named review evidence is still required.

Current blockers: no source package/authorized rights, verified syllabus edition/totals, approved lesson content schema, actual private audio objects/policies or second-account test dataset. Q4 feedback and lesson-section signing are still proposed, not content-import workarounds. No content can be imported/published by this planning task, and no synthetic HSK list is included in these deliverables.
