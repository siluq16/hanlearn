# Coding instructions — HanLearn

Read `docs/PRD_Architecture.md`, `docs/postgres_schema.sql`, `docs/MVP_SCOPE.md`, `docs/DOMAIN_CONTRACTS.md`, `docs/SRS_SPEC.md`, `docs/SECURITY_MODEL.md` and `docs/TEST_PLAN.md` before changes.

## Product and architecture

- Private single learner, mobile first. Next.js App Router + TypeScript + Tailwind + shadcn/ui, Supabase Auth SSR, separate server/browser clients; src/proxy.ts for Next.js 16+.
- MVP: one HSK 1 course, one unit, 3–5 lessons, 30–50 authorized/reviewed words, grammar, mini-quiz, SRS, 60-minute daily plan, manual HelloChinese log, analytics; roadmap HSK 1–5. Data supports 1–9, baseline 0.
- Defer full exams, FSRS, AI, offline sync and automatic HelloChinese integration. Never fabricate official lists, APIs or licensed assets.
- Sprint 1 now includes foundation/Auth/Dashboard/Roadmap/Vocabulary/detail/Settings. Lesson/quiz/SRS UI waits for Sprint 2. Revision 2 domain contracts remain authoritative.
- Development is Next.js local -> Supabase Cloud Development on Windows. No Docker, container runtime or local Supabase commands. Read `docs/CLOUD_DEVELOPMENT.md` and `docs/SPRINT1_VERIFICATION.md`.

## Database invariants

- Ordered version-controlled migrations are authoritative; regenerate SQL snapshot by concatenating. Validate against an explicitly approved Cloud Development project before release. Native PostgreSQL with Auth shim is supplementary, never claim it is Supabase. Preserve migrations 001–004; use new migrations for changes.
- Never create cloud resources/users, apply remote migrations, change Production or run destructive Cloud tests without explicit project-specific authorization. No cloud reset/drop. CLI 3.1 uses explicit --remote; check history/dry-run with --skip-vault, then inspect actual schema. Never put secrets in command args, chat or logs.
- Every exposed table has RLS. Anonymous has no app access; user A cannot access B. Learners SELECT owned state; never directly write cards/events/scores/progress/tasks/sessions.
- Privileged functions only in unexposed private schema: empty search_path, qualified names, explicit Auth/ownership, restricted EXECUTE. Public wrappers SECURITY INVOKER. No browser secrets.
- Review event + card update in one transaction; fingerprint/result, row lock, expected version. Events append-only; archive cards.
- Quiz keys private; server grading and completion. Self-ratings are learning evidence, not official proficiency.
- Publish only reviewed provenance and licensed/self-authored content. Published ancestry and safe joins required. Private Storage signed access, MIME/size policies verified before audio release.
- Follow exact analytics contracts; lesson completion, coverage and mastery are distinct.

## Work protocol

- Report milestones, inspect repo, preserve unrelated work. Small commits when a Git repo exists; never invent commit/test results.
- Add meaningful Auth/RLS, SRS due/retry/concurrency/rollback, quiz and reload-persistence tests.
- Finish with files, commands, actual results, unfinished work and security/content assumptions. Distinguish mocks/static, native PostgreSQL, real Cloud Auth/PostgREST/Storage and browser verification. Status is PARTIAL until actual Cloud acceptance criteria pass.


<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
