# HanLearn Sprint 8O – Phase 6.5: Database & Application Rollback Plan

**Ngày cập nhật (Pre-Cloud Migration Safety Gate):** 2026-11-20  
**Mục tiêu:** Đảm bảo khả năng hoàn nguyên an toàn cả khi đã có attempt `Revision 2` chưa nộp (in-flight), đã nộp (submitted), hoặc đang trong quá trình gửi request submit, mà tuyệt đối không làm chấm sai hay mất dữ liệu đối chiếu của bất kỳ attempt nào.

---

## 1. Kiểm toán An toàn Rollback (Rollback Safety Audit)

### 1.1. Tại sao KHÔNG ĐƯỢC rollback bằng cách ghi đè `correct_index = correct_index_v1` hoặc redeploy bản code cũ `665fecc` sau khi đã phát sinh attempt Revision 2?

1. **Nguy cơ với attempt Revision 2 đang làm dở (unsubmitted / in-flight) hoặc đang gửi request submit:**
   - Khi học viên đã mở đề ở Revision 2, dòng attempt trong `public.curriculum_quiz_attempts` được ghim `key_revision = 2` và màn hình của học viên hiển thị mảng lựa chọn `v2Choices`.
   - Nếu chạy lệnh SQL ghi đè `UPDATE private.curriculum_quiz_keys SET correct_index = correct_index_v1`, hàm `private.submit_curriculum_quiz_attempt` khi chấm attempt `key_revision = 2` đó sẽ đọc `k.correct_index` (lúc này đã bị đổi về đáp án Revision 1) và **chấm sai ~75% số câu hỏi**.
   - Tương tự, việc ghi đè `correct_index = correct_index_v1` sẽ xóa mất khóa đáp án Revision 2 trong database, làm mất dữ liệu đối chiếu cho các attempt `key_revision = 2` đã nộp trước đó.
2. **Nguy cơ nếu redeploy bản code cũ `665fecc` sau khi đã có attempt `key_revision = 2`:**
   - Bản code `665fecc` (trước Sprint 8O) chưa có module `quiz-revisions.ts` và chỉ chứa mảng lựa chọn Revision 1 (`v1Choices`). Nếu redeploy `665fecc` sau khi học viên đã tạo hoặc nộp attempt `key_revision = 2`, màn hình xem lại lịch sử của những attempt `key_revision = 2` đó sẽ hiển thị theo thứ tự lựa chọn Revision 1.

---

## 2. Cơ chế Rollback An toàn Tuyệt đối: Dual-Revision Feature-Flag Rollback (`HANLEARN_ASSESSMENT_KEY_REVISION=1`)

Để đảm bảo an toàn 100% cho cả 4 trường hợp (**attempt Rev 2 chưa nộp**, **attempt Rev 2 đã nộp**, **request submit đang chạy đồng thời**, và **attempt mới tạo sau rollback**), Sprint 8O triển khai cơ chế **Dual-Revision Feature-Flag Rollback**:

### 2.1. Nguyên tắc bất biến trong Database (`Migration 0011`)
- Bảng `private.curriculum_quiz_keys` **luôn lưu song song** cả hai cột:
  - `correct_index` (khóa đáp án Revision 2 cân bằng `[107, 107, 107, 107]`)
  - `correct_index_v1` (khóa đáp án Revision 1 gốc `[414, 9, 5, 0]`)
- Cột `public.curriculum_quiz_attempts.key_revision` giữ **`DEFAULT 1`** (và trigger `private.curriculum_quiz_attempts_stamp()` dùng `coalesce(new.key_revision, 1)`).
- Hàm `private.submit_curriculum_quiz_attempt(p_attempt_id, p_answers)` chấm theo `v_attempt.key_revision` của từng dòng attempt:
  - Nếu `v_attempt.key_revision = 1` $\rightarrow$ chấm theo `correct_index_v1`.
  - Nếu `v_attempt.key_revision = 2` $\rightarrow$ chấm theo `correct_index`.

### 2.2. Các bước kích hoạt Rollback về Revision 1 cho các lượt thi mới
Khi cần chuyển hệ thống tạo đề mới quay về Revision 1 mà vẫn bảo vệ toàn bộ attempt Revision 2 đã nộp hoặc đang làm dở:
1. Đặt biến môi trường `HANLEARN_ASSESSMENT_KEY_REVISION=1` trên Vercel Preview (hoặc đổi hằng số `CURRENT_ASSESSMENT_KEY_REVISION = 1` trong [src/features/quizzes/quiz-revisions.ts](file:///d:/nam4/prj/HanLearn/src/features/quizzes/quiz-revisions.ts) dưới dạng forward-fix).
2. **Không cần sửa hay ghi đè bất kỳ dòng nào trong `private.curriculum_quiz_keys`**.

### 2.3. Hành vi đã được kiểm chứng tự động (Test #6 trong `tests/sprint8o-assessment-and-catalog-integrity.test.ts`)
Khi `HANLEARN_ASSESSMENT_KEY_REVISION=1` được bật:
1. **Attempt Revision 2 chưa nộp (in-flight `key_revision = 2`, `submitted_at = null`):**
   - Khi reload trang (`/lessons/[id]/quiz?attempt=<id>`), `getQuizView` đọc `attemptRaw.key_revision = 2` từ DB nên vẫn hiển thị đúng **`v2Choices` (Revision 2)**.
   - Khi nộp bài, `submitQuiz` / `submitUnitTestAction` và RPC `submit_curriculum_quiz_attempt` đọc `key_revision = 2` của attempt đó và chấm chính xác 100% theo **Revision 2 (`correct_index`)**.
2. **Attempt Revision 2 đã nộp (`key_revision = 2`, `submitted_at != null`):**
   - Khi mở lại từ lịch sử (`?attempt=<id>`), `getQuizView` đọc `attemptRaw.key_revision = 2` và hiển thị chính xác **`v2Choices`** cùng kết quả từng câu theo Revision 2.
3. **Request submit đang chạy đồng thời tại thời điểm rollback:**
   - Do cả `correct_index` và `correct_index_v1` đều tồn tại đồng thời trong `private.curriculum_quiz_keys` và mỗi attempt đã được pin `key_revision` từ lúc khởi tạo, mọi request submit đồng thời (dù thuộc Rev 1 hay Rev 2) đều được chấm đúng 100%.
4. **Attempt mới tạo sau khi rollback:**
   - `getConfiguredAssessmentRevision()` trả về `1`.
   - `startQuiz`, `startUnitTestAction`, `getQuizView` và `getUnitTestDefinition` ghim `key_revision = 1`, hiển thị **`v1Choices` (Revision 1)** và chấm theo **`correct_index_v1` (Revision 1)**.

---

## 3. Hoàn nguyên Danh mục Từ vựng (`Migration 0012 Rollback`)

- **Đối với 43 từ Pilot v1:** Vì UUID của 43 từ này được bảo toàn tuyệt đối trong Migration `0012`, mọi khóa ngoại (`review_cards`, `lesson_vocabulary`, `syllabus_vocabulary`) giữ nguyên 100%. Nếu muốn hoàn nguyên chuỗi `meaning_vi` cũ của 43 từ Pilot, chạy lệnh `UPDATE public.vocabulary` từ `.local/sprint8o_vocab_mapping.json`.
- **Đối với 257 từ mới (`sense_key = 'hsk1-2025-1'`):** Chỉ gỡ các từ thuộc `sense_key = 'hsk1-2025-1'` nếu **chưa có thẻ `public.review_cards` nào tham chiếu tới chúng**:

```sql
BEGIN;

DELETE FROM public.syllabus_vocabulary sv
USING public.vocabulary v
WHERE sv.vocabulary_id = v.id
  AND v.sense_key = 'hsk1-2025-1'
  AND NOT EXISTS (
    SELECT 1 FROM public.review_cards rc WHERE rc.vocabulary_id = v.id
  );

DELETE FROM public.vocabulary v
WHERE v.sense_key = 'hsk1-2025-1'
  AND NOT EXISTS (
    SELECT 1 FROM public.review_cards rc WHERE rc.vocabulary_id = v.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.syllabus_vocabulary sv WHERE sv.vocabulary_id = v.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.lesson_vocabulary lv WHERE lv.vocabulary_id = v.id
  );

COMMIT;
```
