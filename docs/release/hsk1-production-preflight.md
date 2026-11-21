# HanLearn – Production Promotion Preflight (`hsk1-rc1` $\rightarrow$ `main`)

**Ngày kiểm tra:** 2026-11-21  
**Kết luận tổng thể:** **`NO-GO (BLOCKED)`** *(Chưa được merge `main` hoặc kích hoạt Production Deployment cho đến khi hoàn tất các xác minh ở Mục 6).*

---

## 1. Phase 1 – Git Preflight (`PASS`)

| Hạng mục | Kết quả Thực tế |
| :--- | :--- |
| **`origin/main` SHA hiện tại** | **`055395fea97a3d7f6ce066c0e9db8d67115d0cb7`** (`055395f`: `feat(curriculum): reconcile exact HSK 2025 300-word exam syllabus, unify roadmap learning path, and enhance exercise engine grading`) |
| **Release Candidate (`hsk1-rc1`) SHA** | **`d68cf39eb2ad4a3ed19e483866321b4dd3c3ff3c`** (`d68cf39`, annotated tag `3c46acbfc41891afd63d596f34c4032351516972`) |
| **Commits trên `main` chưa có trong `hsk1-rc1`** | **`0` commits** (`origin/main` là tổ tiên trực tiếp của `hsk1-rc1`) |
| **Commits trên `hsk1-rc1` ahead of `origin/main`** | **`45` commits** |
| **Merge conflict check (`git merge-tree`)** | **`0` conflicts** (`2fcba69907bfc371fd9dfc4e61d9ab3361a98d8e`) |
| **Git diff summary (`origin/main..hsk1-rc1`)** | `219 files changed, 79760 insertions(+), 3848 deletions(-)` (gồm migrations `007–012`, curriculum HSK 1 đầy đủ, Sprint 8M/8N/8O, hotfixes & docs) |
| **Kiểm tra `.local` / `.env` trong diff** | **`0` file `.local` hoặc `.env`** nằm trong diff; không chứa secrets |

---

## 2. Phase 2 – Vercel Production Preflight (`PARTIAL / NEEDS OWNER CHECK`)

- **Production Deployment hiện tại (`main`):** `state: "success"` ([9X3abS2JKRFj4eTuuupFF8nVRZnD](https://vercel.com/siluq16s-projects/hanlearn/9X3abS2JKRFj4eTuuupFF8nVRZnD)), truy cập công khai tại `https://hanlearn.vercel.app` (`/login` $\rightarrow$ `HTTP 200`, `/api/health` $\rightarrow$ `HTTP 200`).
- **Deployment Protection (Vercel SSO):** **TẮT** trên Production `https://hanlearn.vercel.app` (khác với Preview đang bật SSO). Tuy nhiên ứng dụng vẫn áp dụng gate **`PRIVATE_INVITE_ONLY`** (`private.allowed_learners` + tắt public signup).
- **Environment Variables & Database Binding (CHƯA ĐỌC ĐƯỢC TỪ CLI):**
  - Phiên làm việc local không có Vercel CLI token để đọc bảng Environment Variables của Production trên Vercel Dashboard.
  - Cần kiểm tra trực tiếp trên Vercel Dashboard $\rightarrow$ Production Environment Variables:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
    - `HANLEARN_DEVELOPMENT_LEARNING` *(lưu ý trong [src/lib/learning.ts](file:///d:/nam4/prj/HanLearn/src/lib/learning.ts): cần kiểm tra cấu hình cho phép Study/Quiz trên Production)*
  - **Cảnh báo rủi ro dùng chung database:** Trong organization Supabase hiện tại (`icschflxedzroerengxo`), **chỉ có duy nhất 1 project HanLearn là `hhgxrjqkuwdgurphopok`**. Nếu Vercel Production đang trỏ `NEXT_PUBLIC_SUPABASE_URL` về `hhgxrjqkuwdgurphopok`, thì **Production và Preview đang dùng chung một database** (mọi dữ liệu test/dev và dữ liệu Production sẽ nằm chung bảng).

---

## 3. Phase 3 – Supabase Production Preflight

- **Project phát hiện trong organization `icschflxedzroerengxo`:** Chỉ có **`hhgxrjqkuwdgurphopok` (`hanLearn`, `PostgreSQL 17.11`, `ACTIVE_HEALTHY`)**; không có project Supabase Production tách biệt nào khác trong org này.
- **Nếu Production dùng `hhgxrjqkuwdgurphopok`:**
  - `PostgreSQL 17.11`, migrations `001–012` đã áp dụng đủ, `tables_without_rls = 0`, `301` dòng `vocabulary`, `1,284` dòng `private.curriculum_quiz_keys`, `3` auth users, `60` `review_cards`, `89` `review_events`, `35+` `curriculum_quiz_attempts`.
  - **Không cần chạy thêm migration** nếu Production trỏ về `hhgxrjqkuwdgurphopok`, nhưng **phải chấp nhận rủi ro dùng chung DB Development** hoặc tách project Production riêng trước khi mở cho người dùng thật.
- **Nếu Production đang trỏ về một Supabase project khác ngoài org này:**
  - Trạng thái schema/migrations/dữ liệu của project đó hiện là **`NOT VERIFIED`** — tuyệt đối **không** merge `main` trước khi đối chiếu migrations `007–012` trên project đó.

---

## 4. Phase 4 – Backup & Recovery Readiness (`BLOCKED`)

| Hạng mục | Trạng thái | Ghi chú |
| :--- | :---: | :--- |
| **Supabase Backup / PITR** | **`NOT VERIFIED`** | Chưa kiểm tra xác nhận gói Backup hằng ngày / PITR trên Supabase Dashboard |
| **Restore Drill trên môi trường cô lập** | **`NOT VERIFIED`** | Chưa có bằng chứng restore thử nghiệm thành công |
| **Snapshot JSON trong `.local/`** | **Không thay thế backup** | Chỉ dùng để đối chiếu checksum, **không thể restore** PostgreSQL |
| **Rollback Code & DB** | **READY (Doc)** | Code rollback qua revert PR / redeploy `055395f`; Assessment rollback qua `HANLEARN_ASSESSMENT_KEY_REVISION=1` |

---

## 5. Phase 5 – Thứ tự Triển khai An toàn (Sau khi Gỡ Blocker)

1. Xác nhận trên Vercel Dashboard Production target DB (`hhgxrjqkuwdgurphopok` hay project riêng), `Site URL` & `Redirect URLs` cho `https://hanlearn.vercel.app`, và cờ `learning` trong `src/lib/learning.ts`.
2. Xác nhận & chụp/tải **PostgreSQL Backup (`pg_dump` hoặc Supabase Dashboard Backup/PITR)** cho DB Production.
3. Nếu Production dùng DB riêng chưa có `007–012`: chạy từng migration theo checkpoint (`007..010` $\rightarrow$ `011` $\rightarrow$ `012`) và kiểm tra RLS/checksum. *(Nếu dùng chung `hhgxrjqkuwdgurphopok` thì đã có sẵn `001–012`).*
4. Tạo **Pull Request** từ `hsk1-rc1` (`d68cf39` / `preview/hsk1-full-curriculum`) vào `main` trên GitHub (`siluq16/hanlearn`) — không force-push, không sửa tag `hsk1-rc1`.
5. Merge PR $\rightarrow$ theo dõi Vercel Production Deployment Ready.
6. Chạy Production Smoke Tests an toàn (đăng nhập, `/dashboard`, `/roadmap`, `/lessons`, `/vocabulary`, `/review`, `/lessons/[id]/quiz`, `/exam/unit/1`, `/practice`, `/listening`) và xác nhận URL thực tế.

---

## 6. Blocking Issues & Kết luận (`NO-GO`)

- **Blockers hiện tại:**
  1. **`[BLK-01]` Backup & Restore chưa được xác minh (`NOT VERIFIED`):** Chưa có bằng chứng backup vật lý/PITR và restore thành công trước khi chạm Production.
  2. **`[BLK-02]` Chưa xác minh tách biệt Environment & DB của Vercel Production:** Không có project Supabase Production tách biệt trong org CLI (`hhgxrjqkuwdgurphopok` là project `hanLearn` duy nhất thấy được), và chưa đọc được Vercel Production env vars / Supabase Auth Redirect URLs cho `https://hanlearn.vercel.app`.
  3. **`[BLK-03]` Cổng bảo vệ `src/lib/learning-target.ts` trên Vercel Production (`VERCEL_ENV === "production"`):**
     - Theo thiết kế hiện tại ([src/lib/learning-target.ts](file:///d:/nam4/prj/HanLearn/src/lib/learning-target.ts#L4-L11)), hàm `learningTarget()` **luôn trả về `false`** khi `deployment === "production"` (`if (!url || deployment === "production") return false;`), bất kể có đặt `HANLEARN_DEVELOPMENT_LEARNING=1` hay không.
     - **Hệ quả nếu merge lên `main` ngay:** Các tính năng **Xác nhận học (`study`)**, **Mini Quiz (`quiz`)**, và **Ôn tập SRS (`review`)** sẽ bị khóa ở chế độ `LOCAL_ONLY` trên `https://hanlearn.vercel.app` (chỉ đọc được, không nộp bài hay ôn SRS được) cho đến khi có quyết định kiến trúc & phê duyệt riêng cho Production!
- **Kết luận cuối cùng:** **`NO-GO (BLOCKED)`** — Đã chuẩn bị sẵn toàn bộ dữ liệu Git/PR preflight và kế hoạch triển khai; dừng lại chờ bạn xác nhận 3 blockers trên trước khi mở PR / merge `main`.
