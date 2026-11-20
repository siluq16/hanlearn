# HanLearn Sprint 8O – Phase 6.5: Database & Application Rollback Plan

**Ngày lập kế hoạch:** 2026-11-20  
**Mục tiêu:** Đảm bảo khả năng hoàn nguyên an toàn cả tầng ứng dụng (Next.js) và tầng cơ sở dữ liệu (PostgreSQL) mà không làm mất lịch sử học tập hay làm hỏng các attempt đã nộp.

---

## 1. Hoàn nguyên Tầng Ứng dụng (Application Rollback)

- Vì bảng `private.curriculum_quiz_keys` sau Migration `0011` lưu **đồng thời cả `correct_index_v1` (Revision 1) và `correct_index` (Revision 2)**, nếu cần đưa ứng dụng Next.js quay về bản commit trước Sprint 8O (`665fecc`):
  1. Chạy đoạn SQL chuyển đổi trạng thái mặc định về Revision 1 (Mục 2.1 bên dưới).
  2. Rollback nhánh Git hoặc redeploy commit `665fecc` trên Vercel.

---

## 2. Hoàn nguyên Tầng Cơ sở Dữ liệu (Database Rollback SQL)

### 2.1. Hoàn nguyên Answer Keys về Revision 1 (`Migration 0011 Rollback`)

Nhờ cột `correct_index_v1` đã lưu nguyên vẹn đáp án gốc của toàn bộ `1,284` dòng ngay trong bảng `private.curriculum_quiz_keys`, việc khôi phục bảng khóa đáp án về Revision 1 hoàn toàn không cần đọc file ngoài:

```sql
BEGIN;

-- 1. Khôi phục correct_index về giá trị Revision 1 đã lưu trong correct_index_v1
UPDATE private.curriculum_quiz_keys
SET
  correct_index = correct_index_v1,
  key_revision = 1
WHERE correct_index_v1 IS NOT NULL;

-- 2. Đổi default key_revision của attempt mới về 1
ALTER TABLE public.curriculum_quiz_attempts
  ALTER COLUMN key_revision SET DEFAULT 1;

COMMIT;
```

### 2.2. Hoàn nguyên Danh mục Từ vựng về Trạng thái Pilot 44 từ (`Migration 0012 Rollback`)

- **Đối với 43 từ Pilot v1:** Vì UUID của 43 từ này không hề thay đổi trong Migration `0012`, việc giữ nguyên nghĩa tiếng Việt đã chuẩn hóa Sprint 8N/8O là an toàn và có lợi cho học viên. Nếu bắt buộc phải hoàn nguyên đúng chuỗi `meaning_vi` cũ của 43 từ Pilot, chạy lệnh `UPDATE public.vocabulary` từ bản chụp JSON `.local/sprint8o_vocab_mapping.json` (`db_meaning`).
- **Đối với 257 từ mới (`sense_key = 'hsk1-2025-1'`):**
  - **Điều kiện tiên quyết trước khi gỡ 257 từ mới:** Chỉ được gỡ các dòng thuộc 257 từ mới nếu **chưa có thẻ `public.review_cards` nào của người học tham chiếu tới chúng**:

```sql
BEGIN;

-- Chỉ gỡ liên kết syllabus_vocabulary và các từ thuộc sense_key = 'hsk1-2025-1' CHƯA có review_cards tham chiếu
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

---

## 3. Giới hạn Rollback Khi Đã Có Dữ liệu Mới Sau Release (Post-Release Constraints)

1. **Attempts đã nộp ở Revision 2 (`key_revision = 2`):**
   - Các dòng trong `public.curriculum_quiz_attempts` đã nộp sau khi lên Revision 2 có `correct_count` và `passed` được ghi cố định tại thời điểm nộp, nên việc rollback answer keys về Revision 1 **không làm thay đổi điểm số hay trạng thái qua môn (`passed`)** của chúng.
   - Tuy nhiên, trường JSONB `answers` của các attempt `key_revision = 2` lưu chỉ số lựa chọn theo thứ tự Revision 2. Nếu rollback cả code Next.js về bản cũ trước Sprint 8O (vốn không có `quiz-revisions.ts`), màn hình xem lại chi tiết từng câu của riêng những attempt `key_revision = 2` đó sẽ hiển thị theo thứ tự lựa chọn Revision 1. Do đó, nếu chỉ muốn quay về thứ tự câu hỏi Revision 1 mà vẫn giữ hiển thị lịch sử chính xác cho các attempt `key_revision = 2`, chỉ cần giữ module `quiz-revisions.ts` và đặt `CURRENT_ASSESSMENT_KEY_REVISION = 1`.
2. **Thẻ SRS (`review_cards`) đã sinh cho 257 từ mới:**
   - Nếu sau khi áp dụng Migration `0012`, học viên đã tạo thẻ `review_cards` và `review_events` cho bất kỳ từ nào trong 257 từ mới, truy vấn rollback ở Mục 2.2 sẽ **bảo vệ và giữ lại các từ đã có `review_cards`** (nhờ điều kiện `NOT EXISTS (SELECT 1 FROM public.review_cards ...)`), tuyệt đối không xóa thẻ hay lịch sử ôn tập của người học.
