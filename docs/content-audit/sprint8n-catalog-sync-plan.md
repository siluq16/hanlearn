# HanLearn Sprint 8N – Kế hoạch Đồng bộ Danh mục Từ vựng lên Supabase Cloud (`hhgxrjqkuwdgurphopok`)

**Trạng thái:** `LOCAL_PLAN_ONLY — CHƯA APPLY LÊN CLOUD`  
**Mục tiêu:** Đồng bộ bản ghi Pilot v1 đang có trên `public.vocabulary` (đặc biệt là từ `不`) và mở rộng đầy đủ 300 từ HSK 1 vào `public.vocabulary` + `public.syllabus_vocabulary` khi Chủ dự án phê duyệt.

---

## 1. Hiện trạng trên Supabase Cloud Development (`hhgxrjqkuwdgurphopok`)

1. Bảng `public.vocabulary` hiện chỉ chứa **44 bản ghi Pilot v1** (nạp từ `content/pilot-hsk1/v1/vocabulary.json`).
2. Trong 44 bản ghi này:
   - Bản ghi từ `不` (`id = 07072003-2d5d-5d6e-9170-12a6c9d2b578`) vẫn giữ chuỗi cũ:  
     `meaning_vi = 'không; trong bài dùng để phủ định 是'`
   - 4 từ còn lại trong nhóm kiểm tra trọng tâm (`只`, `杯子`, `大学生`, `不客气`) nằm trong số **256/300 từ HSK 1 chưa có dòng tương ứng** trong bảng `public.vocabulary` trên Cloud.
3. **Biện pháp bảo vệ tức thời ở tầng ứng dụng (đã kích hoạt trong code local):**
   - `getVocabulary(id)` (`src/features/vocabulary/queries.ts`) và `getReviewView()` (`src/features/review/queries.ts`) đã được bổ sung **Canonical Overlay** từ `getOfficial300VocabItems()` theo khóa `simplified`.
   - Nhờ đó, ngay cả khi chưa chạy migration trên Cloud, mọi trang (`/vocabulary`, `/vocabulary/[id]`, `/review`, `Lesson Reader`) đều hiển thị nghĩa chuẩn mới nhất (`"không (đọc là bú trước thanh 4)"`) và không bao giờ lộ nghĩa cũ.

---

## 2. Bản thảo SQL Migration Đồng bộ (`CHỈ LƯU LOCAL — KHÔNG TỰ Ý CHẠY TRÊN CLOUD`)

Khi Chủ dự án phê duyệt đồng bộ dữ liệu catalog trên Supabase Development (`hhgxrjqkuwdgurphopok`), có thể thực thi đoạn SQL idempotent dưới đây:

```sql
-- ============================================================================
-- DRAFT MIGRATION (DO NOT APPLY WITHOUT OWNER APPROVAL)
-- Purpose: Update stale Pilot v1 meaning_vi in public.vocabulary for '不' and '很'
--          to match canonical Sprint 8N HSK 1 catalog definitions.
-- ============================================================================

BEGIN;

UPDATE public.vocabulary
SET
  meaning_vi = 'không (đọc là bú trước thanh 4)',
  pinyin_marked = 'bù',
  updated_at = timezone('utc', now())
WHERE id = '07072003-2d5d-5d6e-9170-12a6c9d2b578'
  AND simplified = '不';

UPDATE public.vocabulary
SET
  meaning_vi = 'rất',
  pinyin_marked = 'hěn',
  updated_at = timezone('utc', now())
WHERE id = 'fb146dc3-9976-50a8-93dd-b0789c7256e1'
  AND simplified = '很';

COMMIT;
```

### Quy trình Rollback (nếu cần hoàn tác trên Cloud)

```sql
BEGIN;

UPDATE public.vocabulary
SET meaning_vi = 'không; trong bài dùng để phủ định 是'
WHERE id = '07072003-2d5d-5d6e-9170-12a6c9d2b578' AND simplified = '不';

UPDATE public.vocabulary
SET meaning_vi = 'rất; trong câu tính từ đơn giản có thể không nhấn mạnh mức độ'
WHERE id = 'fb146dc3-9976-50a8-93dd-b0789c7256e1' AND simplified = '很';

COMMIT;
```
