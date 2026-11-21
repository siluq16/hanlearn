# HanLearn – HSK 1 Pilot Release Baseline

**Ngày xác minh:** 2026-11-21  
**Trạng thái:** `VERIFIED BASELINE` (Development & Preview, không tác động Production)

---

## 1. Thông tin Phiên bản & Hạ tầng Đã Xác minh

| Thành phần | Giá trị Thực tế Đã Xác minh | Nguồn xác minh |
| :--- | :--- | :--- |
| **Project** | HanLearn (`hanlearn`, Next.js `16.4.6` App Router + React `19.3.1` + TypeScript `6.0.3`) | `package.json`, `npm run build` |
| **Git Branch / HEAD** | `preview/hsk1-full-curriculum` · **`111e16eab2735d85ffcf3e4c940405febc2b6a1c`** (`111e16e`) | `git branch`, `git rev-parse HEAD` |
| **Working Tree** | Chỉ có file tài liệu UAT mới (`docs/sprint8o/pilot-uat-checklist.md` & `docs/release/*`), không có sửa đổi code/SQL | `git status --short` |
| **Vercel Deployment** | `state: "success"` (`Deployment has completed`) · Deployment ID `F3mDefiT5TbPD6y6g59iG9zX92cQ` | GitHub Commit Status API (`siluq16/hanlearn`) |
| **Vercel Preview URL** | `https://hanlearn-git-preview-hsk1-full-curriculum-siluq16s-projects.vercel.app` | Vercel Deployment Protection (SSO) **BẬT** (`HTTP 302` $\rightarrow$ `vercel.com/sso-api`) |
| **Supabase Development** | Project Ref: **`hhgxrjqkuwdgurphopok`** (`hanLearn`, `ACTIVE_HEALTHY`, PostgreSQL `17.11`) | `supabase projects list` |
| **Migration History (`001–012`)** | `202611120001` $\rightarrow$ `202611200012` đồng bộ 100% giữa local và remote (`0` pending) | `supabase migration list --remote=hhgxrjqkuwdgurphopok` |
| **Schema Drift** | Không có schema drift (`npm run test:contracts` **PASS**) | `scripts/check-contracts.mjs` & `docs/postgres_schema.sql` |
| **Chính sách Nội dung** | `PRIVATE_INVITE_ONLY` (`301 / 301` dòng `public.vocabulary` đạt `published + approved + PRIVATE_INVITE_ONLY`) | Cloud read-only SQL & `.local/sprint8o_cloud_after_0012.json` |

---

## 2. Biến Môi trường Cần thiết (Chỉ tên biến, không giá trị)

- `NEXT_PUBLIC_SUPABASE_URL` (trỏ tới `https://hhgxrjqkuwdgurphopok.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`)
- `HANLEARN_DEVELOPMENT_LEARNING` (`1` cho phép Study/Quiz Server Actions trên Development `hhgxrjqkuwdgurphopok`)
- `HANLEARN_ASSESSMENT_KEY_REVISION` *(tùy chọn, mặc định `2`; đặt `1` khi cần feature-flag rollback không mất dữ liệu)*

---

## 3. Ranh giới Bảo mật & Server-Authoritative Functions

- **RLS (`public` schema):** `tables_without_rls = 0`; anonymous access bị từ chối (`401 / 42501`); `private` schema bị loại khỏi Data API (`406 / PGRST106`).
- **Server-Authoritative RPCs:**
  - `public.get_learner_curriculum_snapshot()`, `public.get_learner_dashboard_snapshot()` (`SECURITY INVOKER`, `search_path = ''`, scoped theo `auth.uid()`).
  - `public.submit_curriculum_quiz_attempt(p_attempt_id, p_answers)` (`SECURITY INVOKER` wrapper $\rightarrow$ `private` `SECURITY DEFINER`, hỗ trợ dual-revision `key_revision = 1` & `2`).
  - `public.submit_review(...)`, `public.set_card_status(...)`, `public.mark_lesson_studied(...)`, `public.save_learner_stage_progress(...)`.

---

## 4. Hạn chế & Điểm tồn đọng từ Sprint 8N / 8O

1. **HTTPS Preview chưa kiểm thử tự động (`NOT VERIFIED`)** do Vercel SSO chặn truy cập không có phiên Vercel.
2. **`npm run test:security` (`scripts/check-security.mjs`)** báo lỗi tĩnh tại `src/features/listening/queries.ts` (do có đường dẫn fallback `content/pilot-hsk1` tồn tại từ trước Sprint 8O).
3. **Human Linguistic Review, Human Audio Verification & Third-Party Rights Clearance** vẫn đang ở trạng thái **`PENDING`** (dùng scope `PRIVATE_INVITE_ONLY` cho giai đoạn học thử nội bộ).
