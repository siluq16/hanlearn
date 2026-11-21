# HanLearn – Post-Freeze Operational Backlog (Không Tự Thực thi)

**Ngày lập:** 2026-11-21  
**Phạm vi:** Các hạng mục vận hành tách biệt sau khi đóng băng RC `hsk1-rc1` (`d68cf39`), **chỉ thực hiện khi có phê duyệt riêng**.

---

## A. Supabase Backup / PITR Verification & Isolated Restore Drill
1. **Mục tiêu:** Chứng minh khả năng khôi phục thực tế của cơ sở dữ liệu trước khi xem xét bất kỳ kế hoạch Production nào.
2. **Các bước kế hoạch (chưa thực thi):**
   - Kiểm tra trực tiếp trên Supabase Dashboard gói lưu trữ backup hằng ngày / Point-in-Time Recovery (PITR) và thời gian lưu giữ (retention).
   - Thực hiện **Restore Drill trên một project / instance tách biệt hoàn toàn** (tuyệt đối **không** restore đè lên Development `hhgxrjqkuwdgurphopok`).
   - Trên bản restore thử, kiểm tra đủ 12 migrations (`001–012`), `tables_without_rls = 0`, số lượng & checksum của `vocabulary` (`301`), `review_cards`, `review_events`, `curriculum_quiz_attempts` và `private.curriculum_quiz_keys` (`1,284`).
   - Ghi nhận thời gian RPO / RTO thực tế vào hồ sơ vận hành.

---

## B. Oversized Auth `user_metadata` Cleanup Cho Tài khoản Test Cũ (`7e94f8e5-...`)
1. **Bối cảnh:** Commit `d68cf39` đã chặn hoàn toàn việc phình `user_metadata` mới (`0 bytes` growth). Riêng tài khoản test tự động cũ `7e94f8e5-be66-4f0a-844b-39adb16355f5` hiện vẫn còn `9,556 bytes` trong `raw_user_meta_data` (tích lũy trước hotfix: `quiz_attempts_hsk1-unit-test-01` = `5,346 B`, `quiz_attempts_hsk1-unit-test-06` = `3,888 B`).
2. **Các bước kế hoạch (chưa thực thi):**
   - Chạy truy vấn đối chiếu 1-1 từng attempt `id` trong `raw_user_meta_data->'quiz_attempts_hsk1-unit-test-*'` với `public.curriculum_quiz_attempts` (`WHERE user_id = '7e94f8e5-be66-4f0a-844b-39adb16355f5'`).
   - Nếu phát hiện bất kỳ `id` nào chưa nằm trong PostgreSQL, trích xuất an toàn trước khi dọn; nếu 100% đã có trong PostgreSQL, chỉ xóa các key bản sao dư thừa đó qua Admin API (`updateUserById`) khi có phê duyệt riêng.
   - Đăng nhập lại để cấp JWT mới gọn (`< 1 KB`) và xác minh hết lỗi `HTTP 431` trên server `16KB` header mặc định.
