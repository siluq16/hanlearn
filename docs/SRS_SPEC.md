# SRS — hl-sm2-v1

This is a deterministic SM-2-inspired variant, not canonical SM-2 or FSRS. No randomness, lateness bonus or stability field. Database implementation: private.srs_next; transaction: public.submit_review -> private.submit_review.

## Card identity and creation

Unique (user, vocabulary, direction), no syllabus in identity. On lesson completion, idempotently insert hanzi_to_vi and vi_to_hanzi for its published vocabulary. Insert audio_to_hanzi only with a referenced published/reviewed/licensed audio asset with supported MIME, 1–20 MiB and a private Storage object verified during import. Missing/revoked audio never produces a usable audio card. DB checks metadata; verifying object existence and actual rights remains an import/release gate.

New cards: state new, step 0, interval 0 days, ease 2.50, version/repetitions/lapses/consecutive_successes 0, due at server creation time. Due means due_at <= server clock AND state not suspended AND archived_at null AND content still available. Review rejects unavailable vocabulary/audio. UI due query must use the same availability conditions.

## Ratings and ease

1 Again, 2 Hard, 3 Good, 4 Easy. Map to q=1,3,4,5.
For every accepted rating: EF' = clamp(round(EF + 0.1 - (5-q)*(0.08+(5-q)*0.02), 2), 1.30, 3.00).
Deltas: -0.54, -0.14, 0, +0.10. Interval computation uses OLD EF. Every accepted rating increments repetitions (total attempts, not canonical SM-2 repetition count).

## Transitions

Learning steps: 1 minute (step 0) and 10 minutes (step 1). State new behaves as learning step 0 on its first rating.

| Phase | Again | Hard | Good | Easy |
| --- | --- | --- | --- | --- |
| new/learning step 0 | learning 0, +1m | learning 0, +6m | learning 1, +10m | review, 4d |
| learning step 1 | learning 0, +1m | learning 1, +10m | review, 1d | review, 4d |
| review, interval I | relearning 0, +10m; preserve I; lapses +1 | review max(I+1,ceil(1.2I)) days | review max(I+1,ceil(I*oldEF)) days | review max(I+1,ceil(1.3I*oldEF)) days |
| relearning step 0 | +10m | +15m | review max(1,ceil(0.5I)) days | review max(2,ceil(0.75I)) days |

Cap review intervals at 36,500 days (at cap a successful interval stays capped). Learning interval=0; relearning retains previous review interval until graduation. Step resets to 0 on graduation. Only Again in review increments lapses. Good/Easy while already in review increments consecutive_successes; Hard/Again reset it; learning/relearning always set it to 0.

Due = accepted reviewed_at + delay; days are exact 24-hour durations in UTC, not local midnight. Overdue review uses current server time and stored interval, not elapsed days. No early reviews. The pure transition accepts a test timestamp; only privileged submit supplies production reviewed_at.

## Mastery is separate

Scheduling states: new, learning, review, relearning, suspended. Vocabulary mastery view: introduced if no card reviewed; learning otherwise; mastered only when BOTH recognition and production cards are active, nonarchived, in review, have interval >=21 days and >=3 consecutive Good/Easy reviews in review phase. Audio and quiz are not required for lexical mastery. A lapse/suspension/archive can remove current mastery. Overdue alone does not remove it. Vocabulary with no cards has inferred state not_introduced.

Mastery is a current internal heuristic, not permanent certification or an HSK score. No writable mastery counter. Historical mastery can be recomputed from versioned event snapshots. Lesson completion does not imply mastery.

## Transaction and edge cases

Input: cardId UUID, rating integer 1–4, responseMs null or 0–3,600,000 integer, expectedVersion bigint >=0, idempotencyKey UUID. Server authenticates verified allowlisted user; no userId/time/state accepted.

1. Validate input; build canonical JSONB from semantic typed fields (including null responseMs and expectedVersion).
2. Store SHA-256 fingerprint plus payload for equality defense. Advisory transaction lock (user,key) before card locking serializes same-key races across cards.
3. Existing same user/key + identical payload: return stored result exactly, even if card now archived/not due. Different payload: PT409.
4. SELECT owned card FOR UPDATE; missing/other user => PT404 without disclosing owner.
5. Version mismatch => PT409; inactive/unavailable/not due => PT409. A new key never bypasses due/version checks.
6. reviewed_at=clock_timestamp() after lock. Compute transition, update version once, insert event with previous/next snapshots, algorithm version, request and exact result. One PostgreSQL transaction; any error rolls everything back.

Two different keys with same card/version: one succeeds, one gets stale_card_version after waiting. Two identical retries: one event and identical responses. Hash collisions of advisory locks only serialize unrelated work; payload/unique constraints still decide correctness. No failed requests are cached. No changes between network retries: persist the original key/payload/version in the future client until outcome is known.

Events append-only. Browser INSERT/UPDATE/DELETE denied. Trigger rejects UPDATE/DELETE even by table owner except operator-led account erasure. Card FK RESTRICT, never cascade. Lifecycle RPC uses version checks; suspend stores prior state, resume restores it and sets due=max(saved due,server now). Archive is terminal, sets suspended + archived_at, preserves identity/history and cannot be recreated by lesson completion. Repeated lifecycle actions with an old version conflict; inspect persisted card after uncertainty. Replayed successful review still returns its original receipt.

DB clock and ordering authoritative. Store timestamptz UTC instants; local dates only in planning/analytics. Future algorithm changes require a new version + migration and retain original event semantics.

