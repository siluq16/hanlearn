# Sprint 2 UI specification

2026-11-12. Planning only; no routes/components implemented. Read SPRINT2_PLAN.md for each item's dependencies, database objects, RPCs, authorization, acceptance/tests and blockers. API payloads/receipts are defined in SPRINT2_API_CONTRACTS.md; this document defines presentation and interaction states.

## Shared product rules

Keep the current private app shell, Inter/Noto Sans SC, primary blue/success green/review amber/error red, readable Hanzi/pinyin/Vietnamese and responsive cards. Mobile first at 360/390px; desktop lesson content max readable line length with optional secondary progress panel. Navigation remains simple: Dashboard, Roadmap, Vocabulary, Review, Plan, Settings when those screens are actually available. No links promising unimplemented content.

Every screen needs loading skeleton, unavailable/empty, service error+retry, forbidden/session expiry and narrow mobile behavior. Empty published content is truthful, never demo curriculum. All buttons have text labels, keyboard focus and >=44px targets; errors role=alert, accepted state role=status/aria-live, reduced motion, no color-only meaning. Content escaped; no raw HTML/embedded scripts. Credits reachable beside content/audio, not hidden in a developer-only inspector.

Authentication redirects to login/access appropriately. A transient outage is not rendered as an empty study queue or a completed task. Never display raw database errors/keys/tokens. Readback after mutation shows actual persisted result; do not optimistically award completion/cards/mastery/time.

## Lesson detail — steps 2.1/2.2

Route proposal `/lessons/[id]`. Breadcrumb syllabus/course/unit; title, objective, approximate effort label (not measured session time), sources and persistent study/completion indicator. Ordered content sections come from validated PostgreSQL lesson.content, with vocabulary/grammar joins; no text hardcoded as teaching content in React.

Sections: introductory text; word cards with Hanzi/pinyin/Vietnamese/examples; grammar pattern and examples; listening asset/transcript when licensed and available. Pinyin can toggle visually, never change learning state. Audio click obtains authorized short-lived URL; loading/retry/unavailable status and transcript; no autoplay or third-party media fallback. Revoked/missing asset cannot be silently replaced by synthesized/fake audio.

Study CTA: “Tôi đã học nội dung này”, explicitly self-confirmed. Pending disables duplicate clicks; RPC result then reread progress. Show separate conditions “Đã xác nhận học” and “Quiz đạt >=80%”; completed appears only after both persisted conditions. Passing first leaves study CTA; studied-only prompts quiz; already completed preserves first completed_at and does not reset cards. Lesson completion is not mastery or proof of study duration.

Unavailable ancestry ->safe not-found state, without draft parent names. Service errors are retryable. Refresh/new session resumes from DB progress; section scroll/reveal are transient UI only. Acceptance: keyboard section navigation, mobile no overflow, safe content render, proper sources, persisted study+pass tests. Blockers: pilot/JSON schema/audio contract; no populated-content claim from empty UI.

## Quiz — steps 2.3/2.4

Route proposal `/lessons/[id]/quiz`, optional attempt result subview. Start button explicitly creates an attempt using a retained start key; no mutation on navigation. Display question count/progress, one choice group/question (radio semantics), 2–6 choices, no correct marker/explanation before accepted submit. No full-exam countdown/proctoring UI.

Answer selections are local until submission. Confirm that blanks count incorrect. Submit pending disables competing submit/retake; unknown network outcome offers retry with original attempt/answers, not a new attempt. Validation identifies missing/invalid form shape without inventing grades. On 409 changed-payload/already-submitted conflict, reload stored result; do not overwrite or manufacture a successful score.

Results show correct/N, display score, DB passed flag and current persisted lesson completion (separate). Failed later retake does not revoke prior completion. Retake is explicit new attempt/key. Owned history shows date/score/pass, previous immutable results survive reload; pre-submit responses/keys remain inaccessible.

Post-submit explanations use proposed Q4 only after the server confirms submitted_at for the owned attempt. Show selected choice, is_correct and reviewed explanation, without exposing raw correct_index/private rows. If Q4 unavailable, show an honest unavailable explanation state; do not fetch keys with an admin client or put explanations in lesson JSON. Accessibility: focus result heading, announces grade once; radios usable with keyboard; never color-only right/wrong.

## Flashcards — steps 2.5/2.6

Route proposal `/review`. Header due count (DB time), progress within current fetched batch, direction label and stop/back control. No invented daily quota or official HSK mastery percentage. Queue eligibility exactly matches server: owned, due, active, published, audio eligible. A card may become unavailable between queue read and submit; show conflict instead of grading it locally.

| Direction | Front | Back after reveal |
| --- | --- | --- |
| hanzi_to_vi | Simplified Hanzi; optional pinyin preference | Vietnamese, pinyin and reviewed examples |
| vi_to_hanzi | Vietnamese meaning/context | Hanzi, pinyin and examples |
| audio_to_hanzi | Play valid signed audio; transcript access as explicit assist | Hanzi/pinyin/meaning; unavailable audio blocks this direction |

Reveal is explicit, keyboard Space/Enter when card focused; inputs/buttons do not hijack global keys. After reveal expose Again/Hard/Good/Easy with labels and optional 1–4 shortcuts. Show hl-sm2-v1/next due from accepted receipt, never a browser-computed schedule represented as authoritative. Due timestamp localized with absolute text; mastery label comes from vocabulary_progress and is independent of review phase.

State machine: loading ->front ->revealed ->submitting ->accepted receipt/next, or unknown outcome/retry-original, or stale/inactive/content conflict ->reload. Freeze the original request envelope before send; do not regenerate key/responseMs/version on retry. Multi-tab stale conflict is visible; no automatic re-rating. Back/close while pending warns that the result is unknown and allows recovery, not data-loss reassurance. Account switch/logout clears account-scoped transport recovery; tokens never stored in it. This is not full offline sync.

History shows accepted rating, reviewedAt, algorithm and safe receipt state. Suspend/resume/archive through lifecycle RPC only; archive requires clear confirmation, is terminal, preserves history. Unknown lifecycle response ->read current row/version before further action. Empty queue says no eligible due cards, with next/read navigation; service outage says unable to load. Tests cover reload, duplicate/changed retry, stale tab, no-key leakage and reduced-motion/mobile focus.

## Today's plan and backlog — step 2.7

Route proposal `/plan`, date label in Asia/Ho_Chi_Minh and short horizon today..today+13. “Tạo kế hoạch ngày này” is explicit generation; GET/render/prefetch never inserts tasks. Baseline five slots 10/15/10/15/10 minutes, visible total 60. If no lesson, explain server-selected review fallback. Future assignments labelled provisional, no promise of future lesson completion.

Task cards show type, linked readable lesson, estimated minutes and persisted pending/done/skipped/rescheduled state. Completion button is self-report and does not award course progress/time/mastery. Pending mutations disable controls; terminal tasks read-only except a linked moved child. Move dialog accepts only valid later date/window; original row retains date and links forward. Chained lineage visible, retry same move stable. Missed tasks stay visible on original day; no automatic disappearing/midnight requeue.

Separate baseline and carried backlog with independent totals; never label baseline+backlog as always 60 or silently reduce backlog. Empty syllabus/content shows unavailable, not generated dummy work. Reload reads DB; task history remains append-only. Tests: repeat generation retains terminal state, move conflicts, yesterday backlog, mobile controls, status text/readback.

## Timer and manual activity — step 2.8

Timer panel shared with Dashboard/Plan: idle/start, active/server-start timestamp+display elapsed, stopping, stopped receipt/capped, service error/unknown outcome. Reload resumes the one active row; open timer contributes no analytics. Start/stop reuse original identity on retry; no per-second DB writes. Explain maximum counted 4h and capped outcome without presenting it as proof of attention. No pause/resume semantics unless separately designed.

Manual HelloChinese/other form: source, local start/end with explicit Vietnam timezone and UTC conversion, confirmation that entry is self-reported. Show overlap notice: displayed analytics merge intervals; do not claim every submitted minute is additive. Require closed interval >0, <=4h, no future end; server validates. Button saves exact interval/key once, disabled while pending. No duration-only entry, automatic HelloChinese API, vocabulary credit, editable accepted history or fabricated session evidence. Correction guidance is operator-led; explain immutability before submit.

## Analytics and Dashboard — step 2.9

Labels: actual union minutes, system time, self-reported-only time; sources and interval rule discoverable. Show raw sessions as evidence without summing overlaps into the headline. Daily plan completion, lesson completion, introduced coverage, mastery and streak are separate cards. No-session lesson/review activity does not create an active study day.

Streak uses >=1 union minute and ending today/yesterday rule. Course completion uses currently readable lessons. Imported pilot coverage and verified official coverage are distinct; unavailable denominator shows “Chưa có dữ liệu” / “Tổng chính thức chưa xác minh”, not 0% or 100%. Mastery can decrease after lapse/archive/suspension and is not an official exam score. Review success Good/Easy only, null if no events. Loading/error states never render misleading zero statistics. Test timezone midnight, overlaps, gaps, nulls, hidden ancestry, lapse and mobile labels.

## Content and acceptance gates

Use local synthetic fixtures solely for tests, labelled as such; never publish or ship them as HSK curriculum. Real-content acceptance requires PILOT_CONTENT_PLAN and separate import approval. Listening additionally requires Storage/rights/signing verification. Every view has real owner/outsider/B read acceptance plus separately authorized mutation/retry fixtures before release. No screen specification authorizes creating users, changing allowlist, importing data, applying migrations or starting implementation.
