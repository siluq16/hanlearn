# HanLearn Sprint 8O – Phase 2 & 3: Assessment Integrity Audit & Permutation Design

**Ngày thiết kế:** 2026-11-20  
**Phạm vi:** Toàn bộ **428 câu hỏi** chấm điểm phía server (`308` câu thuộc 38 Mini Quizzes + `120` câu thuộc 6 Unit Tests)

---

## 1. Kết quả Kiểm toán Toàn bộ 428 Câu hỏi (Before Sprint 8O – Revision 1)

### 1.1. Thống kê tổng hợp theo nhóm bài kiểm tra

| Nhóm bài kiểm tra | Số đề | Tổng số câu | Số câu 4 lựa chọn | Số câu 2 lựa chọn (Đúng/Sai) | Phân bổ `correct_index` Revision 1 (Trước Sprint 8O) | Câu trùng `choices` |
| :--- | :---: | :---: | :---: | :---: | :--- | :---: |
| **Curriculum Mini Quizzes** | 38 đề (36 đề × 8 câu + 2 đề × 10 câu) | **308** | 308 | 0 | - **Index 0 (A):** `294` (`95.45%`)<br>- **Index 1 (B):** `9` (`2.92%`)<br>- **Index 2 (C):** `5` (`1.62%`)<br>- **Index 3 (D):** `0` (`0.00%`) | `0` |
| **HSK 1 Unit Tests** | 6 đề (6 đề × 20 câu) | **120** | 114 | 6 (`ut1-q18`, `ut2-q19`, `ut3-q20`, `ut4-q19`, `ut5-q18`, `ut6-q19`) | - **Index 0 (A):** `120` (`100.00%`)<br>- **Index 1 (B):** `0` (`0.00%`)<br>- **Index 2 (C):** `0` (`0.00%`)<br>- **Index 3 (D):** `0` (`0.00%`) | `0` |
| **TỔNG CỘNG** | **44 đề** | **428** | **422** | **6** | - **Index 0 (A):** `414 / 428` (`96.73%`)<br>- **Index 1 (B):** `9 / 428` (`2.10%`)<br>- **Index 2 (C):** `5 / 428` (`1.17%`)<br>- **Index 3 (D):** `0 / 428` (`0.00%`) | **`0`** |

### 1.2. Phát hiện đặc biệt về 6 câu 2 lựa chọn (True/False) trong Unit Tests

Trong 120 câu Unit Tests, có **6 câu đọc hiểu Đúng/Sai** (`ut1-q18`, `ut2-q19`, `ut3-q20`, `ut4-q19`, `ut5-q18`, `ut6-q19`) chỉ có 2 lựa chọn. Ở Revision 1, cả 6 câu đều đặt đáp án đúng (`"Sai"`) ở vị trí 0 nên mảng `choices` bị đảo ngược thành `["Sai", "Đúng"]` (`correct_index = 0`).
- **Xử lý chuyên biệt trong Revision 2:** Chuẩn hóa thứ tự hiển thị của cả 6 câu Đúng/Sai về thứ tự chuẩn sư phạm **`["Đúng", "Sai"]`**, đưa `correct_index` của cả 6 câu về **`1` (`"Sai"`)**.
- Quét toàn bộ 422 câu 4 lựa chọn còn lại xác nhận: **không có câu nào** chứa phương án phụ thuộc vị trí cố định như `"Cả A và B đều đúng"` hay tiền tố `"A. "`, `"B. "` gắn cứng trong chuỗi lựa chọn.

---

## 2. Phân tích So sánh Hai Phương án Loại bỏ Answer Bias (Section 3.1)

| Tiêu chí đánh giá | Phương án A: Versioned Static Permutation (`key_revision = 2` + Dual-Revision Keys) | Phương án B: Per-Attempt Server-Controlled Dynamic Permutation |
| :--- | :--- | :--- |
| **Cơ chế hoạt động** | Hoán vị tất định phân tầng (Stratified Balanced Permutation) mảng `choices` khi phát hành Revision 2; lưu đồng thời `correct_index` (Rev 2) và `correct_index_v1` (Rev 1) trong `private.curriculum_quiz_keys` kèm cột `key_revision` trên `curriculum_quiz_attempts`. | Mỗi lần tạo attempt mới, server sinh một hoán vị riêng theo `attempt_id`, lưu bảng ánh xạ hoán vị theo từng attempt hoặc dịch ngược chỉ số trước khi chấm. |
| **Tính bảo mật** | **Rất cao:** Hoán vị được tính một lần ở thời điểm thiết kế với khóa muối riêng (`DESIGN_SALT`) và ràng buộc cân bằng toàn cục nên người dùng **không thể** suy diễn `correct_index` từ `question_id` trên client. Đáp án nằm trong `private.curriculum_quiz_keys`. | **Rất cao:** Thứ tự lựa chọn thay đổi giữa các lần thi lại của cùng một học viên. |
| **Độ phức tạp & Tương thích Schema** | **Nhỏ gọn, an toàn tuyệt đối:** Giữ nguyên chữ ký RPC 2 tham số `submit_curriculum_quiz_attempt(uuid, jsonb)` và khóa chính `(quiz_slug, question_id)` của `private.curriculum_quiz_keys`; chỉ bổ sung cột `key_revision` và `correct_index_v1`. | **Phức tạp cao:** Cần lưu ma trận hoán vị 20×4 cho mỗi attempt trong DB hoặc viết hàm giải mã hoán vị trong PL/pgSQL để RPC tự chấm điểm. |
| **Bảo vệ Lịch sử Attempt & Attempt đang mở** | **Bảo toàn 100%:** Các attempt cũ hoặc đang mở trước thời điểm cắt chuyển mang `key_revision = 1`, được hiển thị `v1Choices` và chấm theo `correct_index_v1`. Các attempt mới mang `key_revision = 2`, chấm theo `correct_index`. | Cần thay đổi cấu trúc lưu trữ `answers` của attempt để gắn kèm thứ tự lựa chọn đã hiển thị tại thời điểm thi. |
| **Khả năng chống Version Skew & Rollback** | **Xuất sắc:** Server Action tự động phát hiện DB đang ở Rev 1 hay Rev 2; nếu DB chưa chạy migration 0011, Server Action tự dịch `answers_v2 -> answers_v1` qua `translateV2AnswersToV1()`. Rollback chỉ cần đổi default `key_revision` hoặc khôi phục `correct_index = correct_index_v1`. | Rollback phức tạp nếu đã có các attempt lưu theo chỉ số động mà không có bảng đối chiếu tĩnh. |

### Quyết định Kiến trúc
Chọn **Phương án A nâng cao (Versioned Stratified Static Permutation – Revision 2 kết hợp Dual-Revision Server Translation Bridge)**:
1. Giải quyết triệt để 100% hiện tượng thiên lệch vị trí đáp án A (`correct_index = 0`).
2. Giữ nguyên kiến trúc PostgreSQL RPC `submit_curriculum_quiz_attempt(uuid, jsonb)` hiện có, tương thích 100% với bộ kiểm thử bảo mật `migration_009_security.sql`.
3. Loại bỏ hoàn toàn rủi ro lệch phiên bản (Version Skew) giữa thời điểm deploy code Next.js và thời điểm chạy migration trên Supabase Cloud.

---

## 3. Thuật toán Hoán vị Phân tầng & Phân phối Đáp án Thực tế (Before vs. After)

Thay vì dùng phép chia dư ngây thơ `SHA256(question_id) % 4` (vốn có thể bị đoán nếu lộ công thức và dễ tạo cụm 4–5 câu liên tiếp trùng một đáp án trong một bài quiz 8 câu), Sprint 8O sử dụng **Thuật toán Hoán vị Phân tầng Không Cụm (Stratified Non-Clustering Fisher-Yates Permutation)**:

1. **Ràng buộc cân bằng tuyệt đối trong từng bài kiểm tra:**
   - Với mỗi bài Mini Quiz 8 câu (36 đề): phân bổ chính xác **`2 câu A, 2 câu B, 2 câu C, 2 câu D`** (`[2, 2, 2, 2]`).
   - Với 2 bài Checkpoint Quiz 10 câu (`cp01`, `cp02`): phân bổ **`[3, 3, 2, 2]`** và **`[2, 2, 3, 3]`** để tổng bù trừ bằng đúng `[5, 5, 5, 5]`.
   - Với mỗi đề Unit Test 20 câu (6 đề): câu Đúng/Sai 2 lựa chọn đặt tại `index 1` (`["Đúng", "Sai"]`), 19 câu 4 lựa chọn còn lại phân bổ **`[5, 4, 5, 5]`** để tổng 20 câu của mỗi Unit Test đạt chính xác **`[5, 5, 5, 5]`** (`25%` mỗi vị trí).
2. **Ràng buộc chống cụm đáp án liên tiếp (`No 3-in-a-row Constraint`):**
   - Mọi chuỗi đáp án trong cả 38 Mini Quizzes và 6 Unit Tests đều thỏa mãn điều kiện không có 3 câu liên tiếp nào trùng vị trí đáp án đúng ($\forall i \ge 2: \neg(c_i = c_{i-1} = c_{i-2})$).
3. **Hoán vị độc lập các phương án nhiễu (Distractor Permutation):**
   - Các phương án nhiễu (distractors) ở mỗi câu cũng được xáo trộn tất định vào các vị trí còn lại, đồng thời lưu mảng song ánh `v2ToV1Map` trong [quiz-revisions.ts](file:///d:/nam4/prj/HanLearn/src/features/quizzes/quiz-revisions.ts).

### Bảng đối chiếu Phân phối Đáp án Trước và Sau Sprint 8O

| Tập câu hỏi | Vị trí 0 (A) | Vị trí 1 (B) | Vị trí 2 (C) | Vị trí 3 (D) | Tổng cộng |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **38 Mini Quizzes – Trước (Rev 1)** | `294` (`95.45%`) | `9` (`2.92%`) | `5` (`1.62%`) | `0` (`0.00%`) | **308** |
| **38 Mini Quizzes – Sau (Rev 2)** | **`77` (`25.00%`)** | **`77` (`25.00%`)** | **`77` (`25.00%`)** | **`77` (`25.00%`)** | **308** |
| **6 Unit Tests – Trước (Rev 1)** | `120` (`100.00%`) | `0` (`0.00%`) | `0` (`0.00%`) | `0` (`0.00%`) | **120** |
| **6 Unit Tests – Sau (Rev 2)** | **`30` (`25.00%`)** | **`30` (`25.00%`)** | **`30` (`25.00%`)** | **`30` (`25.00%`)** | **120** |
| **TOÀN HỆ THỐNG (428 câu) – Trước (Rev 1)** | `414` (`96.73%`) | `9` (`2.10%`) | `5` (`1.17%`) | `0` (`0.00%`) | **428** |
| **TOÀN HỆ THỐNG (428 câu) – Sau (Rev 2)** | **`107` (`25.00%`)** | **`107` (`25.00%`)** | **`107` (`25.00%`)** | **`107` (`25.00%`)** | **428** |

---

## 4. Thống kê Chi tiết Số câu và Phân phối A/B/C/D Trên Từng Đề (44 Đề = 38 Mini Quizzes + 6 Unit Tests = 428 Câu)

Giải thích toán học về tổng số câu `308` của 38 Mini Quizzes:
- **36 đề Mini Quiz 8 câu** (`32` bài học `hsk1-lesson-01..32` + `4` bài ôn tập `hsk1-checkpoint-01..04`): $36 \times 8 = 288$ câu. Mỗi đề trong 36 đề này đều có phân phối chính xác **`[2, 2, 2, 2]`** ($36 \times [2, 2, 2, 2] = [72, 72, 72, 72]$).
- **2 đề Checkpoint Mini Quiz 10 câu** (`hsk1-checkpoint-05` và `hsk1-checkpoint-06`): $2 \times 10 = 20$ câu. Vì 10 không chia hết cho 4, `hsk1-checkpoint-05` có phân phối **`[3, 3, 2, 2]`** và `hsk1-checkpoint-06` có phân phối bù đối xứng **`[2, 2, 3, 3]`** (tổng 2 đề 10 câu = **`[5, 5, 5, 5]`**).
- Tổng 38 Mini Quizzes: $288 + 20 = 308$ câu, tổng phân phối: $[72, 72, 72, 72] + [5, 5, 5, 5] = [77, 77, 77, 77]$.
- **6 đề Unit Tests 20 câu** (`hsk1-unit-test-01..06`): $6 \times 20 = 120$ câu. Mỗi đề đều có phân phối chính xác **`[5, 5, 5, 5]`** (tổng 6 đề = **`[30, 30, 30, 30]`**).
- Tổng toàn hệ thống (44 đề): $308 + 120 = 428$ câu, $428 \times 3\text{ aliases} = 1,284$ dòng trong `private.curriculum_quiz_keys`, phân phối **`[107, 107, 107, 107]`** (`25.00%` mỗi vị trí).

| STT | `quiz_slug` | `lesson_id` | `quiz_id` | Số câu | Câu 2 lựa chọn | Phân phối Rev 1 `[A, B, C, D]` | Phân phối Rev 2 `[A, B, C, D]` | Chuỗi trùng liên tiếp tối đa (Rev 2) | Số dòng khóa (`×3` aliases) |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | `hsk1-lesson-01` | `l-hsk1-001` | `08f2e3a1-e171-5aa6-93b9-ac777b053a41` | 8 | 0 | `[6, 1, 1, 0]` | **`[2, 2, 2, 2]`** | 2 | 24 |
| 2 | `hsk1-lesson-02` | `l-hsk1-002` | `22222222-2222-4222-8222-000000000002` | 8 | 0 | `[8, 0, 0, 0]` | **`[2, 2, 2, 2]`** | 1 | 24 |
| 3 | `hsk1-lesson-03` | `l-hsk1-003` | `33333333-3333-4333-8333-000000000003` | 8 | 0 | `[8, 0, 0, 0]` | **`[2, 2, 2, 2]`** | 2 | 24 |
| 4 | `hsk1-lesson-04` | `l-hsk1-004` | `44444444-4444-4444-8444-000000000004` | 8 | 0 | `[8, 0, 0, 0]` | **`[2, 2, 2, 2]`** | 2 | 24 |
| 5 | `hsk1-lesson-05` | `l-hsk1-005` | `55555555-5555-4555-8555-000000000005` | 8 | 0 | `[2, 5, 1, 0]` | **`[2, 2, 2, 2]`** | 2 | 24 |
| 6 | `hsk1-lesson-06` | `l-hsk1-006` | `66666666-6666-4666-8666-000000000006` | 8 | 0 | `[2, 3, 3, 0]` | **`[2, 2, 2, 2]`** | 2 | 24 |
| 7..32 | `hsk1-lesson-07` .. `hsk1-lesson-32` (26 đề) | `l-hsk1-007` .. `l-hsk1-032` | `77777777-...-0007` .. `0032` | 8 / đề (208) | 0 | `[8, 0, 0, 0]` / đề | **`[2, 2, 2, 2]` / đề** | $\le 2$ | 24 / đề (624) |
| 33 | `hsk1-checkpoint-01` | `l-hsk1-cp01` | `11111111-1111-4111-8111-000000000001` | 8 | 0 | `[8, 0, 0, 0]` | **`[2, 2, 2, 2]`** | 2 | 24 |
| 34 | `hsk1-checkpoint-02` | `l-hsk1-cp02` | `22222222-2222-4222-8222-000000000002` | 8 | 0 | `[8, 0, 0, 0]` | **`[2, 2, 2, 2]`** | 1 | 24 |
| 35 | `hsk1-checkpoint-03` | `l-hsk1-cp03` | `77777777-7777-4777-8777-000000000003` | 8 | 0 | `[8, 0, 0, 0]` | **`[2, 2, 2, 2]`** | 2 | 24 |
| 36 | `hsk1-checkpoint-04` | `l-hsk1-cp04` | `77777777-7777-4777-8777-000000000004` | 8 | 0 | `[8, 0, 0, 0]` | **`[2, 2, 2, 2]`** | 1 | 24 |
| 37 | `hsk1-checkpoint-05` | `l-hsk1-cp05` | `77777777-7777-4777-8777-000000000005` | **10** | 0 | `[10, 0, 0, 0]` | **`[3, 3, 2, 2]`** | 1 | 30 |
| 38 | `hsk1-checkpoint-06` | `l-hsk1-cp06` | `77777777-7777-4777-8777-000000000006` | **10** | 0 | `[10, 0, 0, 0]` | **`[2, 2, 3, 3]`** | 2 | 30 |
| 39 | `hsk1-unit-test-01` | `l-hsk1-ut01` | `ut-hsk1-01` | **20** | 1 (`ut1-q18`) | `[20, 0, 0, 0]` | **`[5, 5, 5, 5]`** | 2 | 60 |
| 40 | `hsk1-unit-test-02` | `l-hsk1-ut02` | `ut-hsk1-02` | **20** | 1 (`ut2-q19`) | `[20, 0, 0, 0]` | **`[5, 5, 5, 5]`** | 2 | 60 |
| 41 | `hsk1-unit-test-03` | `l-hsk1-ut03` | `ut-hsk1-03` | **20** | 1 (`ut3-q20`) | `[20, 0, 0, 0]` | **`[5, 5, 5, 5]`** | 2 | 60 |
| 42 | `hsk1-unit-test-04` | `l-hsk1-ut04` | `ut-hsk1-04` | **20** | 1 (`ut4-q19`) | `[20, 0, 0, 0]` | **`[5, 5, 5, 5]`** | 2 | 60 |
| 43 | `hsk1-unit-test-05` | `l-hsk1-ut05` | `ut-hsk1-05` | **20** | 1 (`ut5-q18`) | `[20, 0, 0, 0]` | **`[5, 5, 5, 5]`** | 2 | 60 |
| 44 | `hsk1-unit-test-06` | `l-hsk1-ut06` | `ut-hsk1-06` | **20** | 1 (`ut6-q19`) | `[20, 0, 0, 0]` | **`[5, 5, 5, 5]`** | 2 | 60 |
| **TỔNG** | **44 đề** | **44 `lesson_id`** | **44 `quiz_id`** | **428 câu** | **6 câu** | **`[414, 9, 5, 0]`** | **`[107, 107, 107, 107]`** | **Max = 2 (< 3)** | **1,284 dòng** |
