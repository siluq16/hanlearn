# HanLearn Sprint 8O – Phase 6: Safe Database Migration Plan

**Ngày lập kế hoạch:** 2026-11-20  
**Trạng thái:** `IMPLEMENTED LOCAL` · `TESTED LOCAL (PostgreSQL 18.4)` · `NOT APPLIED CLOUD` · `AWAITING APPROVAL`

---

## 1. Danh sách Migrations Mới (Chưa Apply lên Supabase Cloud)

| Thứ tự | Tên file Migration | Mục đích & Nội dung thay đổi | Tính chất Idempotent & Nguyên tử |
| :---: | :--- | :--- | :--- |
| **11** | [202611200011_sprint8o_assessment_permutation.sql](file:///d:/nam4/prj/HanLearn/supabase/migrations/202611200011_sprint8o_assessment_permutation.sql) | - Bổ sung cột `key_revision integer not null default 1 check (key_revision in (1, 2))` vào `public.curriculum_quiz_attempts` (gán `1` cho toàn bộ 33 dòng lịch sử hiện có), sau đó đổi default sang `2` cho các attempt mới.<br>- Bổ sung cột `correct_index_v1 integer` và `key_revision integer not null default 2` vào `private.curriculum_quiz_keys`.<br>- Sao lưu `correct_index_v1 = coalesce(correct_index_v1, correct_index)` và cập nhật `1,284` dòng sang đáp án Revision 2 cân bằng `[107, 107, 107, 107]`.<br>- Cập nhật hàm `private.submit_curriculum_quiz_attempt(uuid, jsonb)` chấm theo `correct_index_v1` nếu `v_attempt.key_revision = 1` và theo `correct_index` nếu `v_attempt.key_revision = 2`. | Sử dụng `ADD COLUMN IF NOT EXISTS`, `COALESCE(correct_index_v1, ...)`, và `INSERT ... ON CONFLICT (quiz_slug, question_id) DO UPDATE`. Chạy lại nhiều lần cho kết quả giống hệt 100%. |
| **12** | [202611200012_sprint8o_vocabulary_catalog_sync.sql](file:///d:/nam4/prj/HanLearn/supabase/migrations/202611200012_sprint8o_vocabulary_catalog_sync.sql) | - Định nghĩa hàm `private.sync_hsk1_canonical_vocabulary_catalog(p_syllabus_id uuid)` (`SECURITY DEFINER`, `search_path = ''`, thu hồi quyền khỏi `public, anon, authenticated`).<br>- Cập nhật tại chỗ (`UPDATE ... WHERE v.id = pc.id`) 43 dòng Pilot v1 trong `public.vocabulary` theo nghĩa tiếng Việt, Pinyin và câu ví dụ chuẩn Sprint 8N/8O.<br>- Chèn/cập nhật (`INSERT ... ON CONFLICT (id) DO UPDATE`) 257 từ HSK 1 mới với MD5 UUID tất định.<br>- Liên kết đủ 300 từ vào `public.syllabus_vocabulary` cho syllabus `'8b8b06ff-5563-5a67-9197-9ffc9b25a8f9'` (`ON CONFLICT DO NOTHING`).<br>- Kiểm tra `v_orphaned_cards = 0` trước khi kết thúc. | Không chứa bất kỳ lệnh `DELETE` hay `TRUNCATE` nào. Chạy 2 lần liên tiếp trong `sprint8o_assessment_and_catalog.sql` cho kết quả giống hệt 100%. |

---

## 2. Truy vấn Kiểm chứng Trước và Sau Migration (Before / After Verification SQL)

Khi Chủ dự án phê duyệt áp dụng lên Supabase Cloud Development (`hhgxrjqkuwdgurphopok`), chạy bộ truy vấn READ-ONLY sau trước và sau khi thực thi:

```sql
-- 1. Kiểm tra tổng số từ vựng, trùng lặp ngữ nghĩa và khóa ngoại mồ côi
SELECT
  (SELECT count(*) FROM public.vocabulary) AS total_vocabulary_rows,
  (SELECT count(*) FROM public.vocabulary WHERE status = 'published') AS published_vocabulary_rows,
  (SELECT count(*) FROM (
    SELECT simplified, pinyin_marked, sense_key
    FROM public.vocabulary
    GROUP BY simplified, pinyin_marked, sense_key
    HAVING count(*) > 1
  ) dup) AS duplicate_semantic_entries,
  (SELECT count(*) FROM public.review_cards rc
   WHERE NOT EXISTS (SELECT 1 FROM public.vocabulary v WHERE v.id = rc.vocabulary_id)) AS orphaned_review_cards,
  (SELECT count(*) FROM public.syllabus_vocabulary sv
   WHERE NOT EXISTS (SELECT 1 FROM public.vocabulary v WHERE v.id = sv.vocabulary_id)) AS orphaned_syllabus_vocab;

-- 2. Kiểm tra bảo toàn dữ liệu học tập của người dùng
SELECT
  (SELECT count(*) FROM public.review_cards) AS review_cards_count,
  (SELECT count(*) FROM public.review_events) AS review_events_count,
  (SELECT count(*) FROM public.vocabulary_progress) AS vocabulary_progress_count,
  (SELECT count(*) FROM public.curriculum_quiz_attempts) AS curriculum_quiz_attempts_count,
  (SELECT count(*) FROM public.quiz_attempts) AS legacy_quiz_attempts_count;

-- 3. Kiểm tra phân phối vị trí đáp án đúng trên 428 câu hỏi chuẩn
SELECT
  count(*) AS total_canonical_questions,
  count(*) FILTER (WHERE correct_index = 0) AS rev2_idx_0_A,
  count(*) FILTER (WHERE correct_index = 1) AS rev2_idx_1_B,
  count(*) FILTER (WHERE correct_index = 2) AS rev2_idx_2_C,
  count(*) FILTER (WHERE correct_index = 3) AS rev2_idx_3_D,
  count(*) FILTER (WHERE correct_index_v1 = 0) AS rev1_baseline_idx_0
FROM private.curriculum_quiz_keys
WHERE quiz_slug ~ '^hsk1-(lesson|checkpoint|unit-test)-[0-9]{2}$';

-- 4. Kiểm tra RLS trên toàn bộ bảng public và quyền truy cập bảng private
SELECT
  (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity) AS public_tables_without_rls,
  has_table_privilege('authenticated', 'private.curriculum_quiz_keys', 'SELECT') AS auth_can_read_private_keys,
  has_table_privilege('anon', 'private.curriculum_quiz_keys', 'SELECT') AS anon_can_read_private_keys;
```

### Kỳ vọng Kết quả (Expected Before vs. After on `hhgxrjqkuwdgurphopok`)

| Chỉ số kiểm chứng | Giá trị Trước Migration (Cloud Read-Only Snapshot) | Giá trị Kỳ vọng Sau Migration (`0011` + `0012`) |
| :--- | :---: | :---: |
| `total_vocabulary_rows` | `44` | **`301`** (`300` từ HSK 1 + `1` từ Pilot bổ trợ `越南`) |
| `syllabus_vocabulary` (`8b8b06ff-...`) | `43` | **`300`** |
| `duplicate_semantic_entries` | `0` | **`0`** |
| `orphaned_review_cards` | `0` | **`0`** |
| `review_cards_count` (test learner) | `44` | **`44`** (Giữ nguyên 100% ID, version, interval) |
| `review_events_count` (test learner) | `79` | **`79`** (Append-only, không thêm/bớt) |
| `curriculum_quiz_attempts_count` | `33` | **`33`** (33 dòng cũ mang `key_revision = 1`) |
| `rev2_idx_0..3` (428 câu chuẩn) | `414 / 9 / 5 / 0` | **`107 / 107 / 107 / 107`** (`25.00%` mỗi vị trí) |
| `public_tables_without_rls` | `0` | **`0`** |
| `auth_can_read_private_keys` | `false` | **`false`** |
