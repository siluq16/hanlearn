# Lesson Content V1 and LessonBundle — Sprint 2.1

2026-11-12. Final implementation contract for the approved **read-only** lesson feature. Authoritative validators: `src/features/lessons/schemas.ts`; DTO: types.ts; projection/relationship boundary: model.ts. No DDL or content import is included. This replaces the tentative L1 content shape in SPRINT2_API_CONTRACTS; all learning/completion/quiz/SRS contracts remain unchanged.

## Stored lessons.content

Strict root `{version:1,sections:Section[]}`. Version is required; max 30 sections, unique section IDs. Empty sections is a valid explicit empty state; legacy `{}`, null, strings, unsupported versions or unknown fields are invalid. Raw JSON exceeding 100,000 JavaScript UTF-16 code units when serialized is rejected, as is the parsed representation above that size. No default lesson content is invented.

Every section has `id` matching `[a-zA-Z0-9_-]{1,64}`, `title` (1–160 characters) and exactly one discriminated `type`:

| type | Exact additional fields |
| --- | --- |
| text | blocks: 1–100 paragraph/example blocks |
| vocabulary_refs | vocabularyIds: 1–50 UUIDs, unique within this section |
| grammar_refs | grammarIds: 1–20 UUIDs, unique within this section |
| listening | audioAssetId: UUID or null (required, inert in 2.1); transcript: 0–20 example blocks |

Paragraph block: `{type:"paragraph",text,lang?}`. Text 1–4000 characters; lang is vi or zh-Hans, default vi. Example block: `{type:"example",hanzi,pinyin?,translationVi?}`. Hanzi 1–1000, optional pinyin 1–1000, optional Vietnamese translation 1–2000 characters. No type/shape coercion. Across all text and listening sections, at most 100 blocks total.

All objects are strict, including nested blocks: unknown fields such as html, script, embed, audioUrl, answerKey, correct_index or nested key objects are rejected, not stripped and forwarded. Every text value must contain non-whitespace text, fit its bound, and contain no angle brackets or disallowed control characters. Newline/tab are permitted. Markdown is displayed as plain text, never executed/rendered through a Markdown/HTML parser. React escapes text again at presentation, including defense against a DTO passed directly around validation.

The code cannot determine whether an ordinary sentence conceals an answer or whether a license is true. Human content review remains mandatory. No quiz/question/key table is queried by this feature.

## References, grammar and publication

Vocabulary/grammar references must appear in the exact lesson's readable lesson_vocabulary/lesson_grammar joins, and all joined entities must be readable, published, approved and have valid provenance. Repeated references across different sections are allowed, but each join/entity identity must be unique. Extra/missing/foreign/draft rows or unresolved references invalidate the bundle; the reader never substitutes another catalog entry or partial private metadata.

Up to 200 vocabulary joins and 50 grammar joins per lesson. Stable joined order is sort_order then entity UUID; section order and per-section reference order come from content. Remaining joined items not referenced in sections display in their ordered vocabulary/grammar lists. These are renderer safety limits, not new database constraints. Invalid/oversized records require content review, not schema mutation.

grammar_points.examples is a strict array (max 20) of `{hanzi,pinyin?,translationVi?}` using the same example text bounds, without a type field. Its pattern/title/explanation_vi are plain text (max 1000/300/8000). Other legacy/unknown JSON shapes fail safely. Vocabulary examples come only from explicit example_zh/example_pinyin/example_vi columns.

Lesson -> unit -> course -> syllabus keys must match, all four published/approved. Syllabus additionally requires verified_at. Source/license/reviewer/reviewed_at are required for published DTO entities; these are validated metadata, not a legal verification. Queries request explicit safe columns and stop before leaf/progress reads if an ancestor is unavailable. RLS remains authoritative in every query under the user's JWT.

## LessonBundle

| Property | Safe fields |
| --- | --- |
| lesson | id,title,objectiveVi|null,estimatedMinutes,provenance |
| syllabus | id,code,title,provenance |
| course | id,title,hskLevel (1–9),provenance |
| unit | id,title,provenance |
| content | validated Content V1 sections only |
| vocabulary[] | id,hanzi,traditional|null,pinyin,meaningVi,example|null,provenance,audio |
| grammar[] | id,title,pattern,explanationVi,validated examples,provenance |
| progress | studiedAt|null,completedAt|null — no user UUID |

Provenance: sourceUri,license,reviewedBy,reviewedAt. Source is shown as escaped text; only valid HTTPS URLs without credentials become external links, with noopener/noreferrer. Other URIs (including self-authored urns) are text only. No source is fetched by the server/browser automatically.

Vocabulary audio is `{status:"unavailable",reason:"storage_unverified"}` in this approved iteration. Listening asset IDs never become URLs or signing requests. There is no audio element, URL or signing endpoint in the lesson reader. Existing vocabulary-linked audio endpoint elsewhere is unchanged; it is not reused for arbitrary section assets. Audio playback remains blocked pending actual Storage/licensed assets and a scoped authorization/signing design.

Progress is selected by both real server user UUID and lesson UUID, checked again by the model, and never mutated. Completion without a studied timestamp or another user's progress fails validation. The model emits no raw rows/status/review columns, auth IDs, answer fields, storage paths, keys or exception details into client props. Only validated presentation DTO data crosses the client boundary; the page stays force-dynamic and reads fresh state on each request.

## States and scope

No/missing/draft/unreadable ancestor ->generic lesson unavailable/not-found, without parent metadata. Access denial/no session ->existing requireLearner access/login behavior, independently of Proxy. DB/network error ->safe retry boundary, not an empty successful lesson. Invalid JSON/references ->generic content-not-ready alert with no partial raw content. Explicit empty V1 ->empty state. Streaming Next not-found responses may retain HTTP 200 after headers; UI/noindex semantics, not an unconditional 404 assertion, are tested.

Pinyin toggle is transient local presentation state with a stable accessible label and aria-pressed. Refresh rereads server progress; hiding pinyin does not write profile/progress or pretend to persist a learning preference. No mark studied, completion button, quiz, SRS, plan, timer, analytics or import was implemented.

## Catalog and evidence limits

The nine SELECT projections (76 fields) were checked against the real Development READ ONLY catalog captured in the earlier security task, with all six migration hashes rechecked unchanged. `npm run test:lessons:catalog` repeats this local metadata comparison. It is not a new live SQL read or complete generated database types. Additive curated Row projections in src/types/database.ts reflect the used columns; CLI type-generation blocker remains open.

Unit tests cover schema/DTO/mocked queries and escaped render. The dedicated localhost-only browser harness renders actual lesson components with labelled synthetic fixtures; it imports no Auth shim, Supabase client or app environment and blocks external browser requests. It is outside src/app and never a production fixture route. Populated real Cloud lessons, licensed audio and outsider/B isolation remain BLOCKED; fixture results cannot clear those gates.
