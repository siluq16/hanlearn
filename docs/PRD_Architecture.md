# HanLearn — Personal HSK Learning System

Version 2 — technical foundation, 2026-11-12. Replaces version 1 ambiguous scope, scheduling, mastery and publication rules.

## Product and contracts

Private invite-only, mobile-first learning for the owner and invited learners; shared catalog and strictly user-owned learning state. Roadmap HSK 1–5, data capacity through 9, 60 minutes daily. HelloChinese is external, manually logged; no scraping, redistribution or unverified integration.

Authoritative details: [MVP_SCOPE](MVP_SCOPE.md), [DOMAIN_CONTRACTS](DOMAIN_CONTRACTS.md), [SRS_SPEC](SRS_SPEC.md), [SECURITY_MODEL](SECURITY_MODEL.md), [TEST_PLAN](TEST_PLAN.md).

## Architecture retained

Next.js App Router + TypeScript + Tailwind + shadcn/ui monolith; Supabase Auth/PostgreSQL/Storage; optional Vercel. Server Components read user-scoped catalog/progress. Browser components handle cards/audio. Server Actions/Route Handlers validate inputs and invoke database RPCs with verified user JWT. Database owns transactions and authorization. Use @supabase/ssr, distinct server/browser clients, src/proxy.ts on Next.js 16+; proxy is not authorization.

Public SECURITY INVOKER wrappers call narrowly granted privileged functions in unexposed private schema. Keys, grading and scheduling stay database authoritative. No extra backend service.

## Learning flow

1. Allowlisted verified login; profile and verified syllabus.
2. Today's deterministic 60-minute plan; next lesson in linear order.
3. Explicit study confirmation plus server-graded quiz >=80% completes lesson and idempotently creates eligible cards.
4. Review due cards with expected version + idempotency key. Single RPC locks, schedules and inserts history.
5. HelloChinese self-report records time only. Dashboard reads persisted evidence with exact analytics contracts.

## Future screens and design

/login, /onboarding, /dashboard, /roadmap, /courses/[courseId], /lessons/[lessonId], /vocabulary, /vocabulary/[id], /grammar, /grammar/[id], /review, /analytics, /settings. Exam/AI/offline routes deferred.

Keep blue #2563EB, success #10B981, review #F59E0B, error #EF4444, surface #F8FAFC, text #0F172A; Geist/Inter + Noto Sans SC. Desktop sidebar, mobile bottom nav; >=44px touch targets, focus, transcripts, text labels, pinyin toggle, reduced motion and keyboard review. Loading/empty/error/mobile states required.

## Data and content

Ordered supabase/migrations/*.sql authoritative. docs/postgres_schema.sql is concatenated fresh-install snapshot. Old SQL was unapplied; do not apply new baseline over an existing deployment without a data-preserving upgrade plan.

Syllabus membership separate from vocabulary/course. Published ancestry follows the scoped PRIVATE_INVITE_ONLY/PUBLIC_RELEASE contracts; private experimental sharing does not assert third-party distribution rights. Quiz keys private. Cards unique by learner/word/direction, explicit state/version, archived rather than deleted. Mastery derived independently. Task lineage and interval-based study sessions preserve evidence.

No official vocabulary totals or calendar-to-proficiency promises asserted. Verify exact official syllabus and exam edition before import. No content or licenses supplied by this repo.

## Delivery gates

1. Contracts/migrations/grants and executable tests reviewed.
2. Approved dedicated Supabase Cloud Development migrations; anonymous, second-user, Auth/JWT/API verification, plus isolated retry/concurrency/rollback tests. No Docker/local Supabase is used.
3. Authorized pilot with 5–10 reviewed quiz questions per lesson.
4. Persisted vertical slice, then remaining MVP.
5. SSR/session, phone accessibility and private Storage tests.

Full exams, FSRS, AI, offline and automatic HelloChinese wait until MVP is proven. Account erasure is an audited administrative operation, not card deletion.

Sprint 1 execution is foundation/Auth/catalog/settings only. Lesson, mini-quiz and SRS UI are deferred to Sprint 2 by the user's latest scope. Next.js local connects to Cloud Development. No remote changes before explicit approval; absent credentials do not prevent local implementation and must result in PARTIAL status. See CLOUD_DEVELOPMENT.md.

## Primary references

- https://supabase.com/docs/guides/database/functions
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/local-development/cli/getting-started
- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://nextjs.org/docs/app
- https://www.chinesetest.cn/ (verify syllabus before import)
