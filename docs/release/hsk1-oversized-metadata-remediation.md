# HanLearn – Remediation Plan for Oversized Auth `user_metadata` (`HTTP 431`)

**Ngày lập:** 2026-11-21  
**Trạng thái:** Tài liệu phương án vận hành (không tự động sửa hoặc xóa `user_metadata` trên Cloud).

---

## 1. Xác định Keys Gây Tăng Kích thước (`auth.users.raw_user_meta_data`)

Kết quả kiểm tra read-only trên Cloud Development (`hhgxrjqkuwdgurphopok`) tại thời điểm `2026-11-21`:

| User ID | Vai trò | `meta_bytes` | Keys chính trong `raw_user_meta_data` |
| :--- | :--- | :---: | :--- |
| `e230a6ee-...` | Learner mới | `24 B` | `email_verified` (`4 B`) |
| `3070605e-...` | Learner allowlisted | `522 B` | `stage_prog_hsk1-lesson-01` (`99 B`), `stage_prog_hsk1-lesson-05` (`87 B`), `stage_prog_hsk1-checkpoint-01/02` (`90 B` mỗi key) |
| `7e94f8e5-...` | Tài khoản test tự động | **`9,556 B`** | `quiz_attempts_hsk1-unit-test-01` (**`5,346 B`**, 11 lượt), `quiz_attempts_hsk1-unit-test-06` (**`3,888 B`**, 8 lượt), `practice_history` (`88 B`), `test_stage_*` (`51 B`) |

- **Cơ chế gây `HTTP 431`:** Supabase SSR (`@supabase/ssr`) nhúng toàn bộ `raw_user_meta_data` vào JWT access token và chia nhỏ thành các cookie `sb-<ref>-auth-token.0/.1/.2/...`. Khi `user_metadata` vượt ~`9–11 KB`, tổng header cookie vượt giới hạn mặc định `16 KB` của Node.js (`HTTP 431`), khiến **mọi thao tác reload, đăng nhập lại và refresh token đều tái hiện lỗi** vì JWT mới cấp lại vẫn chứa nguyên `raw_user_meta_data`.

---

## 2. Phân biệt Dữ liệu Trùng PostgreSQL vs. Dữ liệu Chỉ Có Trong Metadata

Trước khi dọn dẹp bất kỳ tài khoản nào bị `HTTP 431`, **bắt buộc** đối chiếu từng phần tử trong `raw_user_meta_data` với các bảng PostgreSQL:
1. **`quiz_attempts_hsk1-unit-test-0X`:** Đối chiếu theo `id` (attempt UUID) với `public.curriculum_quiz_attempts` (`WHERE user_id = <uid>`).
   - Nếu toàn bộ `id` đã tồn tại trong `public.curriculum_quiz_attempts` (ví dụ `7e94f8e5-...` đã có `29` dòng trong DB), phần trong `user_metadata` là **bản sao dư thừa**.
   - Nếu có bất kỳ `id` nào **chỉ tồn tại trong `user_metadata`** mà chưa có trong PostgreSQL, **tuyệt đối không xóa** trước khi trích xuất/chuyển vào `public.curriculum_quiz_attempts` (kèm `key_revision = 1` nếu thuộc bản trước Sprint 8O).
2. **`stage_prog_*` và `practice_history`:** Chỉ kích thước rất nhỏ (`~90 B`/bài), không gây `HTTP 431` và phải đối chiếu với `public.learner_stage_progress` / `public.learner_practice_history` trước khi cân nhắc dọn.

---

## 3. Quy trình Phục hồi An toàn Cho Tài khoản Đã Bị `HTTP 431` (Operator-Only)

1. **Điều kiện tiên quyết để được phép cleanup:**
   - Phiên bản app mới (đã sửa `KI-P2-002` trong `src/features/exam/unit-test-actions.ts`) đã được triển khai để không tái ghi phình `user_metadata`.
   - Đã chạy truy vấn đối chiếu xác nhận **100% attempt IDs** cần gỡ khỏi `user_metadata` đều đã nằm an toàn trong `public.curriculum_quiz_attempts`.
   - Có sự phê duyệt riêng của chủ dự án cho từng tài khoản (không tự chạy cleanup hàng loạt trên tài khoản người học thật).
2. **Các bước phục hồi phiên:**
   - Operator xóa riêng các key bản sao `quiz_attempts_hsk1-unit-test-*` (hoặc đặt `null` qua Supabase Auth Admin API `updateUserById`) cho tài khoản bị ảnh hưởng.
   - Người dùng thực hiện **Đăng xuất / Xóa cookie phiên cũ hoặc Refresh session (`signInWithPassword` lại)** để Supabase Auth cấp JWT mới nhỏ gọn (`< 1 KB`).
   - Kiểm tra `/exam`, `/roadmap`, `/dashboard` hiển thị nguyên vẹn toàn bộ lịch sử thi từ `public.curriculum_quiz_attempts`.
