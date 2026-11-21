# HanLearn HSK 1 — Production Release Report (`PRODUCTION DEPLOYED`)

- **Ngày triển khai:** 2026-11-21
- **Website Production:** https://hanlearn.vercel.app
- **Phương án:** Phương án A — dùng chung Supabase `hhgxrjqkuwdgurphopok` (`hanLearn`), chế độ `PRIVATE_INVITE_ONLY`
- **Release Candidate Tag:** `hsk1-rc1` (`3c46acbfc41891afd63d596f34c4032351516972`) → commit `d68cf39eb2ad4a3ed19e483866321b4dd3c3ff3c` (giữ nguyên)
- **Main SHA sau merge code:** `5a63c28aa7670fc5bdaba579904b3f70d32035c6` (`055395f..5a63c28` fast-forward merge, không force-push)
- **Kết luận cuối:** **`PRODUCTION DEPLOYED`**

---

## 1. Backup / Restore Result (`PASS`)

- **Backup ngoài Git repository:** `C:\Users\ASUS\hanlearn-backups\pre-prod-20261121\`
  - `app_public_private.sql` (`861,733` bytes — schemas `public` + `private`)
  - `auth_data.sql` (`30,204` bytes — `auth` `--data-only`)
- **Kiểm thử restore cô lập trên PostgreSQL `18.4`** (`hanlearn_restore_verify`, port `55439`, `ON_ERROR_STOP=1`, không tắt/xóa bất kỳ foreign key nào, sau đó `DROP DATABASE`):
  - Nạp `supabase/tests/native_auth_shim.sql` + subset `auth.users` `(id, email, email_confirmed_at)` từ `auth_data.sql` + `app_public_private.sql`:
    - `auth.users`: `3` | `private.allowed_learners`: `3` (FK pass) | `public.profiles`: `1`
    - `public.vocabulary`: `301` | `public.syllabus_vocabulary`: `300` | `private.curriculum_quiz_keys`: `1284`
    - `public.review_cards`: `60` | `public.review_events`: `89` | `public.curriculum_quiz_attempts`: `39`
    - `public.lesson_progress`: `3` | `public.learner_stage_progress`: `10` | `public.study_sessions`: `0`
    - `rls_tables`: `28` | `fk_constraints`: `42` | `functions`: `39`

---

## 2. Production Learning Gate (`PASS`)

- Sửa tối thiểu tại [src/lib/learning-target.ts](file:///d:/nam4/prj/HanLearn/src/lib/learning-target.ts), [src/lib/learning.ts](file:///d:/nam4/prj/HanLearn/src/lib/learning.ts), và [tests/learning-target.test.ts](file:///d:/nam4/prj/HanLearn/tests/learning-target.test.ts):
  - Khi `VERCEL_ENV === "production"` hoặc `CONTEXT === "production"`, mặc định fail-closed (`false`).
  - Chỉ mở học & lưu tiến độ khi có biến server-only `HANLEARN_PRODUCTION_LEARNING=1` **và** `NEXT_PUBLIC_SUPABASE_URL` khớp `https://hhgxrjqkuwdgurphopok.supabase.co`.
  - Chủ dự án đã cấu hình `HANLEARN_PRODUCTION_LEARNING=1` trên Vercel Production.
  - Không bypass Auth/RLS, không sửa grading RPC, không ghi fallback vào `user_metadata`, giữ nguyên Preview & localhost.

---

## 3. Full Regression Results (`PASS`)

| Kiểm tra | Kết quả | Chi tiết |
| :--- | :--- | :--- |
| `npm run typecheck` | **PASS** | `tsc --noEmit` 0 errors |
| `npm run test:contracts` | **PASS** | Static contracts/snapshot checks PASS |
| `npx vitest run` | **PASS** | `55` files, `507/507` tests PASS (`tests/learning-target.test.ts`: `12/12`) |
| `npm run lint` | **PASS** | `0` errors (`20` pre-existing warnings) |
| `npm run build` | **PASS** | `next build --webpack` thành công |
| `npm run test:security` | **PASS** | `548` source files + `.next` browser bundle PASS |

---

## 4. Main SHA & Vercel Deployment

- **GitHub `origin/main` trước merge:** `055395fea97a3d7f6ce066c0e9db8d67115d0cb7`
- **GitHub `origin/main` sau merge code:** `5a63c28aa7670fc5bdaba579904b3f70d32035c6`
- **Tag `hsk1-rc1`:** giữ nguyên tại `3c46acbfc41891afd63d596f34c4032351516972` → `d68cf39eb2ad4a3ed19e483866321b4dd3c3ff3c`
- **Vercel Production (`https://hanlearn.vercel.app`):**
  - `/api/health`: `HTTP 200` (`uptime: 91.09s` sau triển khai mới)
  - `/pinyin` (route mới từ `5a63c28`): `307 -> /login` (`x-vercel-id: hkg1::iad1::fdxfb-1795244300033-28c2a90bc3b3`)
  - Trạng thái: **Ready & Serving**

---

## 5. HTTPS Smoke Test trên `https://hanlearn.vercel.app` (`PASS`)

Chạy Playwright headless bằng tài khoản kiểm thử tự động (`testStore`), không phá dữ liệu dùng chung:

- **Unauthenticated redirect:** `/dashboard`, `/pinyin` → chuyển hướng `/login` (`HTTP 307` / `/login`).
- **Login UI (`/login`):** đăng nhập thành công → `/dashboard`.
- **Các trang chức năng (`HTTP 200`, `hasLocalOnly: false`, `0` pageerrors, `0` HTTP 431):**
  - `/dashboard`
  - `/roadmap`
  - `/pinyin` (Module 0 Pinyin)
  - `/vocabulary`
  - `/review` (SRS Review, không bị khóa `LOCAL_ONLY`)
  - `/listening`
  - `/practice` (Practice Center)
  - `/exam` & `/exam/hsk1` & `/exam/unit/1` (Unit Test `HTTP 200`, không rò rỉ `correct_index`/`answerKey`)
- **Học & Lưu tiến độ sau reload (`/lessons/stage/hsk1-lesson-01`):**
  - `btnEnabled: true`, `lessonHasLocalOnly: false`, `Chặng 9 / 10` → bấm hoàn thành/tiếp tục → `Chặng 10 / 10` → reload trang vẫn giữ `Chặng 10 / 10`.
- **Logout (`/settings` → `Đăng xuất`):** chuyển về `/login`, `HTTP_ERRORS: []`.

---

## 6. Data Integrity & Remaining Known Issues

- **Data Integrity:** Giữ nguyên migrations `001–012`, `301` vocabulary, `300` syllabus_vocabulary, `1284` private quiz keys, `PRIVATE_INVITE_ONLY` (`enable_signup = false`), RLS bật trên toàn bộ bảng exposed, không xóa `user_metadata` cũ, không commit `.env`/`.local`/backup.
- **Known Issues còn lại (đã ghi nhận từ pre-freeze, mức P2/P3):**
  - `KI-P2-003`: Mini Quiz chưa hiển thị `explanation_vi` sau khi nộp (chưa nằm trong phạm vi hotfix release này).
  - `auth.site_url` trên Supabase `hhgxrjqkuwdgurphopok` đang là `http://localhost:3000` (nên đổi sang `https://hanlearn.vercel.app` trên Supabase Dashboard nếu dùng email link mặc định; `additional_redirect_urls` đã có `https://*.vercel.app/**`).

---

## 7. Kết luận

**`PRODUCTION DEPLOYED`** — HanLearn HSK 1 đã được triển khai thành công lên `main` và đang hoạt động ổn định tại https://hanlearn.vercel.app.
