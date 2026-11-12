# Coding instructions — HanLearn

Read `docs/PRD_Architecture.md`, `docs/postgres_schema.sql`, `docs/MVP_SCOPE.md`, `docs/DOMAIN_CONTRACTS.md`, `docs/SRS_SPEC.md`, `docs/SECURITY_MODEL.md` and `docs/TEST_PLAN.md` before changes.

## Product and architecture

- Private single learner, mobile first. Next.js App Router + TypeScript + Tailwind + shadcn/ui, Supabase Auth SSR, separate server/browser clients; src/proxy.ts for Next.js 16+.
- MVP: one HSK 1 course, one unit, 3–5 lessons, 30–50 authorized/reviewed words, grammar, mini-quiz, SRS, 60-minute daily plan, manual HelloChinese log, analytics; roadmap HSK 1–5. Data supports 1–9, baseline 0.
- Defer full exams, FSRS, AI, offline sync and automatic HelloChinese integration. Never fabricate official lists, APIs or licensed assets.
- No frontend in the technical-foundation task. Revision 2 domain specifications supersede historical blueprint assumptions.

## Database invariants

- Ordered version-controlled migrations are authoritative; regenerate SQL snapshot by concatenating. Validate in local Supabase before release. Native PostgreSQL with Auth shim is supplementary, never claim it is Supabase.
- Every exposed table has RLS. Anonymous has no app access; user A cannot access B. Learners SELECT owned state; never directly write cards/events/scores/progress/tasks/sessions.
- Privileged functions only in unexposed private schema: empty search_path, qualified names, explicit Auth/ownership, restricted EXECUTE. Public wrappers SECURITY INVOKER. No browser secrets.
- Review event + card update in one transaction; fingerprint/result, row lock, expected version. Events append-only; archive cards.
- Quiz keys private; server grading and completion. Self-ratings are learning evidence, not official proficiency.
- Publish only reviewed provenance and licensed/self-authored content. Published ancestry and safe joins required. Private Storage signed access, MIME/size policies verified before audio release.
- Follow exact analytics contracts; lesson completion, coverage and mastery are distinct.

## Work protocol

- Report milestones, inspect repo, preserve unrelated work. Small commits when a Git repo exists; never invent commit/test results.
- Add meaningful Auth/RLS, SRS due/retry/concurrency/rollback, quiz and reload-persistence tests.
- Finish with files, commands, actual results, unfinished work and security/content assumptions. Distinguish static, native PostgreSQL, local Supabase and browser verification.

