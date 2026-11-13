# HSK 1 local learning preview

2026-11-13. **LOCAL_PREVIEW: PASS**. This is an offline-source, loopback browser preview of frozen draft r3, not publication or Cloud acceptance. Independent language review and the existing import/publication gates retain their previous status.

## Run and stop

From `D:\nam4\prj\HanLearn`:

```powershell
npm run preview:hsk1
```

Wait for `LOCAL CONTENT PREVIEW`, then open <http://127.0.0.1:3114>. Stop with Ctrl+C. Port 3114 must be free; the helper will not choose another port. Direct lesson links use `/?lesson=1` through `/?lesson=4`. A running preview serves its verified startup snapshot; restart after any intentional source update so hashes are rechecked.

The preview needs installed repository dependencies and the existing public HSK source cache used by offline validation. It needs no database, Auth session, credentials, Docker or external font download. Run only on an owner-controlled computer; other processes/users with local filesystem access are outside this isolation boundary. Do not reverse-proxy, tunnel, upload or deploy the generated site.

## Frozen input and validation

| Property                          | Verified value                                                     |
| --------------------------------- | ------------------------------------------------------------------ |
| Package                           | `hanlearn-pilot-hsk1-v1`, draft revision 3                         |
| Manifest SHA-256                  | `dee2d01f275db3c213d654f35b938374699062c28d471ba9fe7a412920fd531b` |
| Package snapshot SHA-256          | `2cb3e0d7a667dd6faba633c4df1e87e6dbaee539e19d0cb394e9dcc769c91deb` |
| Lessons / Content V1 sections     | 4 / 29 (6, 6, 11, 6)                                               |
| Distinct vocabulary / grammar     | 44 / 12                                                            |
| Lesson vocabulary / grammar joins | 66 / 12                                                            |
| Quiz revisions checked offline    | 3 / 2 / 2 / 2; quizzes excluded from browser payload               |

`loadPreview()` reuses `loadPilot`, `auditPilot` and `validateImport` with synthetic delivery only. These verify pinned public hashes, Content V1 Zod schemas, source contracts, IDs, joins and references before building. The existing public source cache is read; the private answer store is never opened. Synthetic validation keys stay in the Node process and are excluded by explicit projection. Grammar explanations are instructional public content, distinct from private quiz feedback.

No content JSON, manifest, source snapshot, private answers, owner acceptance, publication overlay, migrations or human-review records were changed. All 159 item review records remain PENDING. Owner acceptance is not presented as independent language certification.

## Isolation and implementation

- `scripts/hsk1-preview-data.mjs`: validated public presentation projection only. No progress, quizzes, bindings or private answers in its result.
- `scripts/hsk1-preview-server.mjs`: Vite static build, then a separate Node HTTP server listening exclusively on `127.0.0.1:3114`. No Vite dev server, HMR, repository file endpoint or Next route.
- `tools/hsk1-preview/`: list of four lessons, previous/next navigation, linked section navigation, draft notice, objectives/duration, in-memory issue notes and user-requested JSON download bound to the public snapshot.
- Existing `LessonReader` renders Hanzi, pinyin, Vietnamese, vocabulary, grammar, examples and dialogue/transcripts. Its pinyin toggle remains presentation state. No study confirmation or quiz UI is mounted.
- Presentation-only `reader-types.ts` allows truthful nullable draft provenance. Published DTO types, validators, queries, authorization and route guards remain strict. Missing reviewer/date are displayed as unrecorded; no fake reviewer or date is supplied.
- Build module graph rejects Auth, Supabase, private filesystem, Next and lesson mutation/query dependencies. `.env` loading is disabled. No host/port/apply arguments are accepted.
- Server serves only an in-memory allowlist of generated HTML/assets. Unknown paths return 404; non-GET/HEAD returns 405; wrong Host, external Origin, cross-site requests and non-loopback peers are rejected. No CORS permission is granted.
- CSP denies network connections (`connect-src 'none'`), forms, frames and objects; scripts/styles/fonts are local. Other headers include no-store, nosniff, same-origin resource policy and no-referrer.
- Static output and screenshots are under Git-ignored `.local/`. No assets were copied into `public/` or `src/app/`.

The site contains public-to-this-local-preview draft learning text. It is deliberately readable by the local browser without an Auth bypass in the application; it does not call the application or Supabase. Do not distribute the static output.

## Executed checks

| Command / check                                         | Result and boundary                                                                                |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `npm run test`                                          | PASS: 216 tests, 23 files (includes 4 new preview tests)                                           |
| `npm run test:preview:hsk1`                             | PASS: 6 Chrome tests, desktop 1280×900 and mobile 360×800                                          |
| `npm run test:lessons:browser`                          | PASS: 12 existing synthetic Lesson Detail/Study Confirmation browser cases                         |
| `npm run typecheck`                                     | PASS                                                                                               |
| `npm run lint`                                          | PASS                                                                                               |
| `npm run format:check`                                  | PASS                                                                                               |
| Explicit Prettier check of preview tools/scripts/config | PASS                                                                                               |
| `npm run test:contracts`                                | PASS: static repository/migration snapshot contracts                                               |
| `npm run test:security`                                 | PASS: supplementary static credential/grant-boundary scan                                          |
| Public package validation                               | PASS via existing validator with synthetic keys; no real key read                                  |
| Generated HTML/JS/CSS scan                              | PASS: no private key fields/bindings, Supabase host, private-store path, service role or study RPC |

Browser tests visit all four lessons, assert all 29 rendered sections, use the pinyin toggle by keyboard, check previous/next boundaries, history navigation and heading focus, assert no horizontal overflow, and export/reload notes. Content/UI notes do not create progress or review decisions. Script-like note text is escaped by React. All observed resource requests in the lesson-rendering tests were GET/HEAD to this exact loopback origin; no external/Cloud requests or page/console errors were observed.

HTTP tests verify CSP and denial of `.env`, private store paths, `/@fs`, app API and source JSON paths, POST, wrong Host and external Origin. Automated tests also verify public projection/reference counts and draft provenance. They do not compare artifacts against real answer values, because reading those values is not authorized; isolation evidence is the data projection, module graph, field scans and runtime traffic, not a claim of real-key E2E verification.

The initial sandbox browser run did not progress; it was stopped and Chrome tests were rerun successfully with native process permission. `npm run build` also PASS: the production route inventory has no preview/draft endpoint. The first build compiled/typechecked but hit sandbox EPERM while creating a prerender directory; the permitted local retry completed successfully. Security scan was repeated after the build and passed. Generated next-env path changes were restored to the repository baseline. `npm run content` was intentionally not run because that command reads the real private answer store. The same public content validation path was exercised with synthetic delivery instead.

## Visual evidence and remaining issues

Screenshots were generated and visually inspected locally:

- `.local/previews/hsk1-preview-desktop.png`
- `.local/previews/hsk1-preview-mobile.png`
- `.local/previews/hsk1-mobile-vocabulary.png`

No blocking layout or interaction defect was observed at the tested sizes. Mixed-language headings now use a local Hanzi font fallback. Remaining improvements/limits:

| Item                | Observation / next action                                                                                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Long mobile lessons | The four-lesson selector and long vocabulary cards require scrolling. Section anchors and previous/next work; compact navigation may be useful after owner feedback.                                           |
| Audio               | No verified audio exists; transcript and unavailable notices are intentional.                                                                                                                                  |
| Language quality    | Display review is not independent Chinese-language review. Pinyin, examples, dialogue naturalness, and lesson 3 workload still need actual learning/reviewer feedback; no new linguistic finding was asserted. |
| Notes               | Stored only in tab memory. Export before reload/close; download does not change frozen content or official review records. Avoid putting credentials/private quiz material into notes.                         |
| Device coverage     | Chrome desktop and emulated 360px mobile only; physical phone and other browser engines not tested. Loopback binding intentionally prevents LAN phone access.                                                  |
| Cloud / real keys   | Not exercised or authorized. No import, publish, real answer read, DB progress or Cloud mutation was performed.                                                                                                |

The preview is ready for local owner exploration. Cloud import/publish, real-key E2E, live study mutation and publication approval remain separate gates; this result grants none of them.
