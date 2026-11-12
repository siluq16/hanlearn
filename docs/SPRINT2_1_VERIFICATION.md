# Sprint 2.1 — read-only Lesson Learning System

Date: 2026-11-12. **Implementation delivered within the approved read-only scope; real-content acceptance remains PARTIAL/BLOCKED.** Sprint 1 remains PARTIAL. The user explicitly allowed this bounded implementation while its blockers remain open. No approval to release Production, mutate learning data or start Sprint 2.2 is inferred.

## Implemented files and boundary

```text
src/features/lessons/
  schemas.ts       Strict Content V1 and selected-row validation
  types.ts         LessonBundle / safe read result
  columns.ts       Nine literal SELECT projections
  model.ts         Pure publication, reference, ownership and DTO boundary
  queries.ts       server-only requireLearner / JWT / RLS reads
  components/
    lesson-view.tsx     Header, parents, objective, credits and saved progress
    lesson-reader.tsx   Sections, vocabulary/grammar, transient pinyin toggle
    provenance.tsx     Safe source display/link
    lesson-states.tsx  Empty/invalid/unavailable/loading presentation
src/app/(app)/lessons/[id]/
  page.tsx         force-dynamic Server Component
  loading.tsx      Skeleton
  not-found.tsx    Generic unavailable lesson, no parent metadata
  error.tsx        Existing safe retry boundary
```

Modified: Roadmap links to the new reader; proxy.ts refresh matcher includes /lessons; database.ts adds only reviewed selected Row fields/grammar/joins (not generated types). Existing Auth/allowlist/Settings/business RPCs are unchanged. No new action/RPC/mutation/API signing endpoint was added.

Supporting files: tests/lessons.test.ts, tests/lesson-queries.test.ts, tests/fixtures/lesson.ts, tests/fixtures/lesson-browser/{index.html,main.tsx}, tests/lesson-browser/lesson.spec.ts, playwright.lessons.config.ts, scripts/lesson-ui-harness.mjs and scripts/check-lesson-catalog.mjs. Updated package.json/lock, scripts/check-security.mjs and the existing anonymous foundation e2e. README and Sprint 2 planning/API/UI documents link the new contract/results. Original Sprint 0/1 evidence and all six migration files are unchanged.

Content V1/DTO was defined before UI implementation; its exact finalized structure, limits, examples format and audio restrictions are in [LESSON_CONTENT_V1](LESSON_CONTENT_V1.md). The API planning document links that implementation contract. The reader never hardcodes teaching content; synthetic Chinese examples exist only under tests/fixtures.

## Security and persistence

- Every lesson read independently calls requireLearner; browser/server split, real JWT and RLS remain authoritative. Invalid IDs are rejected after authorization without a data query.
- Sequential explicit SELECT checks lesson, unit, course and syllabus published/approved ancestry before joins/progress. Keys must match; syllabus requires verified_at. No private schema/answer-key query, service-role key or SELECT *.
- Content/grammar examples are strict Zod data, not executable HTML/Markdown. Unknown key/embed/audio URL fields fail. Text is bounded and rejects markup/control characters; React escapes it again. Ref UUIDs must belong to the lesson's readable joins. No foreign/draft leaf or another learner's progress enters client props.
- Saved progress is read by auth UUID plus lesson UUID, validated and mapped to timestamps only; no owner UUID in LessonBundle. Reload rereads PostgreSQL; pinyin is transient presentation and does not write profile/progress/local learning state.
- Source/license/reviewer information is shown only for a valid readable bundle. Source hyperlinks require HTTPS without credentials; other URIs are escaped text. Invalid content gives a generic alert, outages a retry boundary, inaccessible/missing/draft ancestry the same unavailable state. Next streaming not-found may retain HTTP 200; no unconditional status-code assertion is made.
- Audio in this iteration is explicitly unavailable. No URL, audio element or signing request is generated. Listening UUIDs are inert and never passed to the vocabulary signer. No bucket/object/policy was created or inferred from metadata.

## Executed checks

| Check | Status | Actual evidence / limit |
| --- | --- | --- |
| Content V1 validation | PASS | Four section types, strict nested keys, version/shape/limits/duplicate refs/IDs, malformed JSON, markup/control and total serialized budget tests |
| DTO/joins | PASS | Publication/verified provenance, ancestry key linkage, missing/foreign/draft/duplicate vocabulary/grammar, persisted join order, private-field omission |
| Progress/read-state | PASS locally | Own/null/cross-user/invalid progress and changed readback on next mocked request; no fake completion or write method |
| Query boundaries | PASS locally | Mocked authenticated client verifies exact projections/status/owner predicates, stop-before-joins and service-error distinction; not real JWT/RLS proof |
| XSS-safe rendering | PASS locally | Schema rejects markup/hidden key fields; direct forged DTO still React-escaped; unsafe source schemes/credential URLs not linked |
| Missing audio | PASS locally | Vocabulary and listening show unavailable; no audio/iframe/form or learning mutation controls in DOM |
| Unit suite | PASS | **124 tests, 14 files** (87 prior +37 new) |
| Lesson browser harness | PASS | **Six tests**: desktop 1280x900 and mobile 360x800; actual components with labelled local synthetic fixtures |
| Browser detail | PASS locally | Light/dark, no horizontal overflow including unbroken long strings, keyboard pinyin/focus/section links, provenance disclosure, progress on reload, distinct empty/loading/error/unavailable/malformed states, error retry |
| Existing production-app e2e | PASS | Six passed, two skipped missing-config cases in configured build; anonymous lesson route now included with other protected pages |
| npm run build | PASS | Next.js 16.4.6 Webpack route /lessons/[id] generated as dynamic; no synthetic app route |
| typecheck/lint/format | PASS | Final local checks; no application warning left |
| Contracts/security scan | PASS | SQL snapshot unchanged; no secrets/direct SRS write; added guards against fixture imports and fixture markers in production browser bundles |
| Catalog projection check | PASS, bounded | **76 selected fields/nine groups** vs earlier real Development read-only catalog; six migration hashes unchanged. No new live SQL and no claim of complete generated types |
| Existing type projection check | PASS, bounded | 76 earlier selected Row/read-RPC checks remain valid; full CLI-generated schema still BLOCKED |
| Populated published lesson with real owner JWT | BLOCKED | No reviewed pilot graph/content-v1 package exists; no fixture imported to Cloud |
| Real audio bytes/signing | BLOCKED | Private Storage/licensed objects not provisioned; no section signing contract applied |
| Outsider/B isolation / expiry-revocation | BLOCKED | Original Sprint 1 gaps remain; synthetic query/browser tests do not replace them |

The first lesson-browser run found actual long-string mobile overflow and an unstable pinyin locator after its label changed. Text now uses overflow-wrap:anywhere; toggle has a stable accessible name with aria-pressed. Final desktop/mobile reruns passed the same cases. An additional lint warning in the Vite-only retry fixture was removed by using React state rather than a Next-style navigation assignment. Test criteria were not loosened to hide an application failure.

Synthetic UI tests run in a separate localhost:3103 harness using pinned dev-only Vite 8.3.8 (already present via Vitest, now explicit). It imports no Auth shim, Supabase client or app env; Playwright blocks external hosts and non-GET/HEAD requests. Fixture sources are outside src/app and production security scans confirm no fixture marker/import in shipped app/browser chunks. UI screenshots are ignored local QA artifacts in .local/previews, labelled synthetic; mobile rendering was visually inspected. This is component/browser evidence, not an authenticated Cloud curriculum e2e or full accessibility certification.

An offline dependency declaration attempt lacked registry cache; normal install of the same exact Vite version succeeded, with zero reported vulnerabilities and no package version changes beyond declaring the existing dev dependency. Lockfile peer metadata updated normally. Production architecture stays Next.js; no Docker or separate production frontend was introduced.

## Reproduce

```powershell
npm run test
npm run typecheck
npm run lint
npm run format:check
npm run build
$env:PLAYWRIGHT_CHANNEL = 'chrome'
$env:HANLEARN_E2E_PORT = '3102'
npm run test:e2e
npm run test:lessons:browser
npm run test:contracts
npm run test:security
npm run test:lessons:catalog
node scripts/check-type-projections.mjs
```

The last two metadata checks require the ignored trusted catalog capture from the previous Development verification; absent capture is BLOCKED, never a synthesized Cloud PASS. Browser harness fails on an occupied port rather than attaching to an unrelated server. No local learner credentials are needed for synthetic or anonymous cases. Do not run fixtures, native Auth shims or destructive/concurrency scripts against Cloud.

## Unchanged blockers and Sprint 2.2 gate

Sprint 1 blockers retained: no real outsider/B test accounts/isolation proof; natural expiry/revocation incomplete; CLI type generation exits 1; licensed pilot unavailable; private Storage/audio not verified; remaining operational/release evidence. Earlier Sprint 0/1 and Cloud reports were preserved, not relabeled by this work.

Before 2.2: explicit new approval for study-confirmation implementation and its mutation/testing scope; disposition of those security blockers without waiving release criteria; reviewed published lesson/content-v1 pilot or approved isolated local test fixtures; approved real fixture/write scope before any Cloud mark_lesson_studied call. Real study+pass completion/card creation additionally needs the reviewed quiz/keys and separately scoped acceptance. Existing six migrations/RPCs must not be replayed or altered merely to build the UI.

**Stopped at 2.1.** No mark studied/completion, mini-quiz, SRS review, daily plan, timer, new analytics, AI, migration, import, Auth user/allowlist or Storage operation was implemented/executed. No GitHub push or Production deployment.
