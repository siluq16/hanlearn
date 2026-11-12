# Locked MVP — revision 2, 2026-11-12

One private learner. Verified allowlisted email; public signup disabled. Baseline 0, target 5, study timezone Asia/Ho_Chi_Minh. A second account exists only in isolated security tests.

| Included | Release acceptance |
| --- | --- |
| Dashboard, roadmap HSK 1–5 | Missing content explicitly unavailable |
| Pilot HSK 1 | One course, one unit, 3–5 ordered lessons; 30–50 distinct authorized/reviewed words |
| Vocabulary, grammar | Hanzi/pinyin/Vietnamese search, examples, credits; audio only with rights |
| Mini-quiz | One immutable version per lesson, 5–10 single-choice questions, >=80% pass, retakes |
| SRS | hanzi_to_vi, vi_to_hanzi; audio_to_hanzi only when eligible; hl-sm2-v1 |
| Daily plan | Fixed 60-minute template, linear progression, idempotent generation and task lineage |
| Time tracking | Server timer, labeled manual HelloChinese/other intervals, no double counting |
| Analytics | Streak, union minutes, completion, coverage, mastery, due count |

Levels 2–9 supported in versioned data, not populated content. Official totals are not hardcoded. Import requires official syllabus revision, primary source, verification date/reviewer and distribution rights. Pilot counts are a release gate, not fake seed data.

Deferred: full exams, FSRS, AI, transcription, automatic HelloChinese sync, offline sync, adaptive prerequisite graph, public signup, export UI, PWA installation and reminders. Mini-quizzes are learning checks, not mock exams.

Sprint 1: migration/RLS validation + reviewed pilot import, Auth/profile, app shell, vocabulary/roadmap, one persisted lesson-to-quiz-to-SRS slice. Loading/empty/error/mobile/accessibility and reload persistence precede release.

Sprint 1 execution update (2026-11-12): the user's approved first implementation is foundation, Supabase Cloud Development/Auth, Dashboard, roadmap, vocabulary/detail and Settings only. The lesson -> quiz -> SRS UI vertical slice moves to Sprint 2. Full MVP scope and database business rules above are unchanged. No Docker/local Supabase; real Cloud integration requires explicit target-specific approval. See CLOUD_DEVELOPMENT.md and SPRINT1_VERIFICATION.md.

