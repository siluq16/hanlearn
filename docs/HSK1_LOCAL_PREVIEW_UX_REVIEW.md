# HSK 1 local preview UX refinement

2026-11-13. **LOCAL_PREVIEW_UX: PASS** for the tested local browser scope. Frozen pilot r3 remains unchanged. This is presentation work, not content approval, publication, Cloud acceptance or real-key E2E authorization.

## Changes and evidence

| Area                 | Before                                      | After                                                                                                                                                                                                                                                                                                          |
| -------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section navigation   | Wrapping text links; no position indication | Sticky, horizontally scrollable chips on all sizes. Blue chip and `aria-current="location"` indicate the section being viewed, with section count. Reading position changes on scrolling as well as activation; this is never saved or treated as completion.                                                  |
| Keyboard             | Native links only                           | Native Tab/Enter preserved. Left/Right move focus, wrapping at ends; Home/End move to first/last chip. Moving focus alone does not select a section. Enter activates the anchor and focuses the section. The rail scrolls horizontally to reveal focused/active chips without scrolling the page unexpectedly. |
| Anchor landing       | Small heading offset                        | Section scroll margin leaves the heading below the sticky rail. Browser checks cover the 11-section lesson, including last-section activation.                                                                                                                                                                 |
| Vocabulary hierarchy | Hanzi/pinyin/meaning/example in one flow    | Hanzi 36px; pinyin 18px; explicit meaning/usage and example labels, divider, separate example surface. Existing parenthetical annotations use smaller muted text.                                                                                                                                              |
| Meaning vs usage     | One frozen string                           | Still the exact original string. Parentheses receive presentation styling only; semicolon-separated senses are not falsely reclassified as usage notes. No words, punctuation, meanings or Pinyin were rewritten.                                                                                              |
| Audio notices        | Repeated in every word card                 | One vocabulary audio notice per lesson. Listening sections retain their own contextual transcript/unavailable notice. No audio playback or request was introduced.                                                                                                                                             |
| Dialogue/reading     | Long full-width text, compact examples      | Prose width limited to `max-w-prose`; Vietnamese body 16px/32px line height; example turns have a subtle blue surface and 24px desktop Hanzi (20px mobile). Whitespace/newlines are preserved in Hanzi, pinyin and translation. No turn labels or dialogue content were invented.                              |
| Mobile overview      | Four stacked lesson cards before reading    | Compact header and horizontally scrollable lesson selector below 640px. At 640px and above, lesson cards and vocabulary retain the existing two-column layout.                                                                                                                                                 |
| Notes                | Memory-only explanation above form          | Explanation retained plus an explicit warning beside the controls to download before refresh/close. Export remains snapshot-bound JSON; no persistence, review decision or progress simulation was added.                                                                                                      |

Existing HanLearn tokens, blue/neutral palette, rounded cards, local fonts, 44px minimum chip/button targets and focus outlines are reused. The shared reader's presentation improvements also apply to the existing Lesson Detail component; its data, publication checks, Auth and mutation controls were not changed. The synthetic Lesson Detail/Study Confirmation suite was rerun for that shared impact.

## Files

- `src/features/lessons/components/section-navigation.tsx`: reading-position rail and keyboard behavior; transient UI state only.
- `src/features/lessons/components/lesson-reader.tsx`: navigation integration, vocabulary hierarchy, common audio notice and readable prose/examples.
- `tools/hsk1-preview/main.tsx`: compact responsive header/lesson selector and notes warning.
- `playwright.hsk1-preview.config.ts`: adds 768×1024 tablet coverage.
- `tests/hsk1-preview-browser/preview.spec.ts`: navigation/focus/scrollspy, exact meaning preservation, audio deduplication and before/after capture checks.
- `tests/hsk1-preview.test.ts`: SSR checks for one audio notice/current section and safe empty state.

No frozen JSON, source snapshot, metadata revision, 159 PENDING records, private answer store, migrations, RLS, Auth or Sprint 2.2 guard changed. No production preview endpoint was added. Generated `next-env.d.ts` build path changes were restored to baseline.

## Before/after screenshots

Baseline was captured from the prior implementation before editing the reader. After captures use the same lesson, viewport and anchor targets. These are local Git-ignored artifacts, not public assets. Browser capture now waits for the current-section indicator to settle after scrolling, avoiding a misleading one-frame stale screenshot.

| View                         | Before                                                                                  | After                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Desktop 1280×900, vocabulary | [Before](D:/nam4/prj/HanLearn/.local/previews/ux-before/preview-desktop-vocabulary.png) | [After](D:/nam4/prj/HanLearn/.local/previews/ux-after/preview-desktop-vocabulary.png) |
| Mobile 360×800, overview     | [Before](D:/nam4/prj/HanLearn/.local/previews/ux-before/preview-mobile-overview.png)    | [After](D:/nam4/prj/HanLearn/.local/previews/ux-after/preview-mobile-overview.png)    |
| Mobile, section navigation   | [Before](D:/nam4/prj/HanLearn/.local/previews/ux-before/preview-mobile-navigation.png)  | [After](D:/nam4/prj/HanLearn/.local/previews/ux-after/preview-mobile-navigation.png)  |
| Mobile, vocabulary           | [Before](D:/nam4/prj/HanLearn/.local/previews/ux-before/preview-mobile-vocabulary.png)  | [After](D:/nam4/prj/HanLearn/.local/previews/ux-after/preview-mobile-vocabulary.png)  |
| Mobile, dialogue             | [Before](D:/nam4/prj/HanLearn/.local/previews/ux-before/preview-mobile-dialogue.png)    | [After](D:/nam4/prj/HanLearn/.local/previews/ux-after/preview-mobile-dialogue.png)    |
| Tablet 768×1024, navigation  | [Before](D:/nam4/prj/HanLearn/.local/previews/ux-before/preview-tablet-navigation.png)  | [After](D:/nam4/prj/HanLearn/.local/previews/ux-after/preview-tablet-navigation.png)  |

Four captures (overview/navigation/vocabulary/dialogue) exist for each of the three viewports in each `ux-before` / `ux-after` directory. Desktop dialogue, mobile overview/navigation/vocabulary/dialogue and tablet navigation after captures were visually inspected. No horizontal page overflow, hidden anchor heading, overlapping cards or clipped body text was observed. Chip labels may truncate to fit; accessible link names and the destination headings retain the complete source title.

## Executed verification

| Check                                                         | Result                                                                                                                                   |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test`                                                | PASS: 218 unit tests, 23 files                                                                                                           |
| `npm run test:preview:hsk1`                                   | PASS: 18 Chrome checks, 6 each at desktop 1280×900, mobile 360×800 and tablet 768×1024                                                   |
| Comparison capture checks                                     | PASS: 3 baseline captures; 3 after captures rerun after adding stable-indicator waits                                                    |
| `npm run test:lessons:browser`                                | PASS: 12 synthetic desktop/mobile regression checks, including existing Study Confirmation behavior                                      |
| `npm run build`                                               | PASS: no preview/draft production route                                                                                                  |
| `npm run typecheck` / `npm run lint`                          | PASS                                                                                                                                     |
| `npm run format:check` and explicit preview/config formatting | PASS                                                                                                                                     |
| `npm run test:contracts`                                      | PASS: static contracts and SQL snapshot consistency                                                                                      |
| `npm run test:security`                                       | PASS: supplementary static/bundle check                                                                                                  |
| Browser output/isolation tests                                | PASS: no private key fields, bindings, Cloud host or write RPC in generated HTML/JS/CSS; strict static HTTP allowlist and CSP retained   |
| Frozen content verification                                   | PASS: all four lessons / 29 sections / 44 vocabulary / 12 grammar, joins and exact pinned hashes validated using synthetic delivery only |

The full preview suite still verifies pinyin toggle, all four lessons, transient notes/export/reload, same-origin GET/HEAD traffic only, no page/console errors, forbidden source/private paths and denied POST/external Host/Origin. New checks compare all 44 displayed meaning strings with their exact source text, assert one vocabulary audio notice per lesson, and verify keyboard focus, scroll-driven active section and visible heading landings. A section indicator is a reading aid, never evidence of studied/completed state.

Manifest SHA-256 remains `dee2d01f275db3c213d654f35b938374699062c28d471ba9fe7a412920fd531b`; package snapshot SHA-256 remains `2cb3e0d7a667dd6faba633c4df1e87e6dbaee539e19d0cb394e9dcc769c91deb`. No real answers were read. `npm run content` was not run because its private-store read is outside scope; the existing public validator ran with synthetic delivery through preview/unit startup instead. Field scans and module/dataflow isolation do not claim comparison against unauthorized real-key values.

The initial baseline capture found port 3114 occupied by the already-running HanLearn preview. Only the identified `node.exe ... scripts/hsk1-preview-server.mjs` listener was stopped for rebuild/testing; no unrelated service was stopped. The server's strict port and loopback checks were preserved.

## Remaining issues and limits

- Frozen vocabulary stores definitions and usage in one field. This refinement separates them visually where parentheses already exist; it does not introduce a new linguistic segmentation or a new schema. A curated structured-usage field would require a separate content decision.
- Long lessons still require vertical reading. The sticky rail uses roughly 100px of mobile height; it avoids repeated scrolling back to a contents list but is not a full-screen reader mode.
- Long chip titles are ellipsized; activate the chip to read the full section heading. Tablet and desktop also use horizontal overflow rather than a tall sticky multi-row menu.
- Audio remains unavailable. Chinese-language accuracy, pacing and lesson 3 workload need actual learning feedback; this UX pass is not an independent language review.
- Notes remain in memory only. Download before closing/reloading; downloads do not update the frozen package or official review records.
- Tests used Chrome desktop and emulated mobile/tablet. Physical devices, other engines and screen-reader speech output were not tested. The preview remains inaccessible via LAN by design.
- No Cloud connection/mutation, private real-key E2E, import, publish, account creation, push or deploy was performed. Existing approval gates remain in force.

## Run

```powershell
npm run preview:hsk1
```

Open <http://127.0.0.1:3114>; stop with Ctrl+C. Restart the server and reload the tab after updating source: this static preview intentionally has no HMR. For repeatable browser verification, stop a manually running preview before `npm run test:preview:hsk1` so the strict test server can bind port 3114.
