# HanLearn HSK 1 — Production Release Report (`READY TO PUSH MAIN PENDING VERCEL OPT-IN ENV`)

- **Ngày cập nhật:** 2026-11-21
- **Phương án:** Phương án A — dùng chung Supabase `hhgxrjqkuwdgurphopok` (`hanLearn`) cho Preview và Production (`https://hanlearn.vercel.app`), phạm vi `PRIVATE_INVITE_ONLY`.
- **Release Candidate:** Tag `hsk1-rc1` (`3c46acbfc41891afd63d596f34c4032351516972`) → commit `d68cf39eb2ad4a3ed19e483866321b4dd3c3ff3c` (giữ nguyên)
- **Production branch hiện tại:** `origin/main` (`055395fea97a3d7f6ce066c0e9db8d67115d0cb7`) — **CHƯA merge/push `main`**
- **Trạng thái cuối:** **`BLOCKED` trước `push main`** — Tất cả gates local & backup/restore đã PASS; chỉ còn 1 bước cấu hình biến `HANLEARN_PRODUCTION_LEARNING=1` trên Vercel Production trước khi merge/push `main`.

---

## 1. Xác minh cấu hình cuối

- Chủ dự án đã xác nhận kiểm tra cấu hình Vercel Production và Supabase `hhgxrjqkuwdgurphopok` (`hanLearn`).
- Trên Supabase `hhgxrjqkuwdgurphopok` (`supabase config pull --remote=hhgxrjqkuwdgurphopok --dry-run`):
  - `auth.additional_redirect_urls`: `["https://*.vercel.app/**"]`
  - `auth.enable_signup`: `false` (`PRIVATE_INVITE_ONLY`)
  - `auth.email.enable_confirmations`: `true`
  - `auth.site_url`: `"http://localhost:3000"` *(khuyến nghị đặt `https://hanlearn.vercel.app` trên Supabase Dashboard nếu dùng link xác thực mặc định)*.
- Giữ nguyên RLS, server-side grading RPCs, private answer keys, và không lưu secrets vào báo cáo.

---

## 2. Backup & Restore Gate (`PASS`)

- **Backup ngoài Git repo:** `C:\Users\ASUS\hanlearn-backups\pre-prod-20261121\`
  - `app_public_private.sql` (`861,733` bytes)
  - `auth_data.sql` (`30,204` bytes)
- **Kiểm thử restore cô lập trên PostgreSQL `18.4`** (database tạm `hanlearn_restore_verify`, port `55439`, `ON_ERROR_STOP=1`, **không** vô hiệu hóa/xóa foreign key nào, sau đó `DROP DATABASE`):
  - Nạp `supabase/tests/native_auth_shim.sql` + subset `auth.users` `(id, email, email_confirmed_at)` từ `auth_data.sql` + toàn bộ `app_public_private.sql`:
    - `auth.users`: `3`
    - `private.allowed_learners`: `3` (FK tới `auth.users` PASS)
    - `public.profiles`: `1`
    - `public.vocabulary`: `301`
    - `public.syllabus_vocabulary`: `300`
    - `private.curriculum_quiz_keys`: `1284`
    - `public.review_cards`: `60`
    - `public.review_events`: `89`
    - `public.curriculum_quiz_attempts`: `39`
    - `public.lesson_progress`: `3`
    - `public.learner_stage_progress`: `10`
    - `public.study_sessions`: `0`
    - Bảng bật RLS (`public`, `private`): `28`
    - Foreign key constraints (`public`, `private`): `42`
    - Functions (`public`, `private`): `39`

---

## 3. Production Learning Gate (`PASS` — Local Fix & Tests)

- Đã sửa tối thiểu:
  - [src/lib/learning-target.ts](file:///d:/nam4/prj/HanLearn/src/lib/learning-target.ts)
  - [src/lib/learning.ts](file:///d:/nam4/prj/HanLearn/src/lib/learning.ts)
  - [tests/learning-target.test.ts](file:///d:/nam4/prj/HanLearn/tests/learning-target.test.ts)
- Cơ chế mới:
  - Khi `VERCEL_ENV === "production"` hoặc `CONTEXT === "production"`, `learningTarget()` mặc định trả về `false` (fail-closed).
  - Chỉ trả về `true` khi có server-only opt-in `HANLEARN_PRODUCTION_LEARNING=1` **và** `NEXT_PUBLIC_SUPABASE_URL` khớp chính xác `https://hhgxrjqkuwdgurphopok.supabase.co` (HTTPS, không path/query/port/credentials).
  - Preview (`HANLEARN_DEVELOPMENT_LEARNING=1`) và local (`127.0.0.1` / `[::1]`) giữ nguyên không regression.
  - Không bypass Auth/RLS, không thay đổi grading RPC, không ghi fallback vào `user_metadata`.

---

## 4. Full Regression Results (`PASS`)

| Lệnh kiểm tra | Kết quả | Chi tiết |
| :--- | :--- | :--- |
| `npm run typecheck` | **PASS** | `tsc --noEmit` 0 errors |
| `npm run test:contracts` | **PASS** | Static repository contracts/snapshot checks PASS |
| `npx vitest run` | **PASS** | `55` test files, `507/507` tests passed (`tests/learning-target.test.ts`: `12/12` passed) |
| `npm run lint` | **PASS** | `0` errors (`20` pre-existing warnings, không phát sinh warning mới) |
| `npm run build` | **PASS** | `next build --webpack` thành công |
| `npm run test:security` | **PASS** | `548` source files + `.next` browser bundle scan PASS |

- Không thay đổi nội dung giáo trình HSK 1, private answer keys, SRS history, hoặc migrations `001–012`.

---

## 5. Bước cần làm ngay trước khi Merge & Push `main`

1. Mở **Vercel Dashboard → Project `hanlearn` → Settings → Environment Variables**.
2. Thêm biến mới cho môi trường **Production** (chỉ **Production**, không cần bật cho Preview/Development):
   - **Key:** `HANLEARN_PRODUCTION_LEARNING`
   - **Value:** `1`
3. Trả lời xác nhận **"Đã thêm `HANLEARN_PRODUCTION_LEARNING=1` trên Vercel Production"** để tôi thực hiện merge/push `main`, theo dõi Vercel Production deployment đến `Ready`, và chạy HTTPS smoke test trên `https://hanlearn.vercel.app`.
