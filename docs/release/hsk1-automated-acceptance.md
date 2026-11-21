# HanLearn – Automated Acceptance Evidence (Phase 3)

**Ngày chạy kiểm chứng:** 2026-11-21  
**Commit kiểm chứng:** `111e16eab2735d85ffcf3e4c940405febc2b6a1c` (`111e16e`)  
**Môi trường:** Local Windows + Next.js `16.4.6` + PostgreSQL `18.4` local + Supabase Cloud Development `hhgxrjqkuwdgurphopok` (`PostgreSQL 17.11`)

---

## 1. Bảng Tổng hợp Kết quả Kiểm thử Tự động

| Hạng mục | Lệnh chạy | Kết quả Thực tế | Phạm vi & Ghi chú |
| :--- | :--- | :---: | :--- |
| **TypeScript Strict** | `npm run typecheck` (`tsc --noEmit`) | **PASS** | `0` lỗi TypeScript trên toàn bộ `src/` và `tests/` |
| **ESLint** | `npx eslint src/ tests/sprint8o-assessment-and-catalog-integrity.test.ts` | **PASS** | `0` errors (`8` warnings pre-existing ở `lesson-nav-header.tsx`, `practice-player.tsx`, `roadmap-unit-accordion.tsx`) |
| **Next.js Production Build** | `npm run build` | **PASS** | Biên dịch thành công toàn bộ `25` routes (`0` errors) |
| **Vitest Regression Suite** | `npx vitest run` | **PASS (`55 / 55` files · `504 / 504` tests)** | Bao gồm 4-state Version Skew, Rollback safety, 428 questions distribution, 300 vocab + 43 Pilot UUIDs |
| **Repository Contracts** | `npm run test:contracts` | **PASS** | Khớp snapshot `docs/postgres_schema.sql` với 12 migrations |
| **Security Static Check** | `npm run test:security` (`node scripts/check-security.mjs`) | **FAIL (Pre-existing P2)** | Báo lỗi tại `src/features/listening/queries.ts` vì có fallback import `content/pilot-hsk1` từ trước Sprint 8O |
| **Native PostgreSQL 18.4 Rehearsal** | `npm run test:db:native` *(tại `111e16e`)* | **PASS** | `12` migrations + `165` SQL assertions + concurrency tests |
| **Cloud Anonymous & Private Schema** | `node scripts/check-anonymous-api.mjs` | **PASS** | `private` schema trả `406 / PGRST106`; toàn bộ `public` tables & RPCs trả `401 / 42501` |
| **Cloud Grading, SSR & Catalog Smoke Test** | `node .local/scripts/sprint8o_post_deploy_smoke.mjs` | **PASS** *(Local Next.js $\rightarrow$ Cloud)* | Tài khoản test allowlisted: Unit Test 1 toàn A = `5/20`, đúng Rev 2 = `20/20`, retry = `PT409`; `0` leakage; `不, 只, 杯子, 大学生, 不客气` khớp chuẩn |
| **HTTPS Vercel Preview E2E** | Probe `https://hanlearn-git-preview-hsk1-full-curriculum-siluq16s-projects.vercel.app/login` | **NOT VERIFIED** | Bị chặn bởi Vercel SSO (`HTTP 302` $\rightarrow$ `vercel.com/sso-api`) |

---

## 2. Xác nhận Ranh giới Bảo mật & Kiến trúc
- **Browser / API:** Không có `correct_index` hay `explanation_vi` trong payload trả về trước khi nộp bài của Mini Quiz và Unit Tests.
- **Database RLS & Grading RPC:** `tables_without_rls = 0` trên `hhgxrjqkuwdgurphopok`; `private.curriculum_quiz_keys` không cấp quyền `SELECT` cho `anon` hoặc `authenticated`.
- **SRS Transactions:** Checksum 60 `review_cards` (`0393d12ac5b02f1a57155634e130d67f`) và 89 `review_events` (`176eeff82d98c8d121c4111ec0274982`) bất biến 100% qua các đợt migration Cloud.
- **Lưu ý quan trọng:** Kết quả `sprint8o_post_deploy_smoke.mjs` trên Local Next.js $\rightarrow$ Cloud Development **không thay thế** cho kiểm thử HTTPS Preview trực tiếp sau khi vượt qua Vercel SSO.
