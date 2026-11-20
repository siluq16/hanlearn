# HanLearn Sprint 8O – Final Report: Assessment Integrity & Database Catalog Synchronization

**Ngày hoàn thành chuẩn bị:** 2026-11-20  
**Nhánh Git:** `preview/hsk1-full-curriculum`  
**Trạng thái triển khai:**
- **Code & Thiết kế & Kiểm thử Local:** `IMPLEMENTED LOCAL` · `TESTED LOCAL (PostgreSQL 18.4 & Vitest & Production Build)`
- **Khảo sát Supabase Cloud (`hhgxrjqkuwdgurphopok`):** `VERIFIED CLOUD READ ONLY`
- **Áp dụng Migrations lên Supabase Cloud & Push Preview:** `NOT APPLIED CLOUD` · `AWAITING APPROVAL`

---

## 1. Kiến trúc Database và Grading Thực tế (Phase 1)

Chi tiết đầy đủ tại [architecture-audit.md](file:///d:/nam4/prj/HanLearn/docs/sprint8o/architecture-audit.md):
- **Câu hỏi:** 38 Mini Quizzes (`308` câu) lưu trong module server-only TypeScript (`src/features/quizzes/curriculum-quizzes*.ts`); 6 Unit Tests (`120` câu) lưu trong JSON server-side (`content/hsk_library/unit_tests/hsk1_unit_test_01..06.json`). Client chỉ nhận `id`, `prompt`, `choices` (đã lọc bỏ `correct_index` và `explanation_vi`).
- **Đáp án & Chấm điểm:** Bảng `private.curriculum_quiz_keys` trên PostgreSQL lưu `1,284` dòng `(quiz_slug, question_id, correct_index)` (428 câu × 3 alias `quiz_slug`). Hàm `private.submit_curriculum_quiz_attempt(p_attempt_id uuid, p_answers jsonb)` khóa dòng attempt (`FOR UPDATE`), kiểm tra chống nộp trùng (`submitted_at IS NOT NULL -> PT409`), kiểm tra thời hạn làm bài (`EXAM_DEADLINE_EXCEEDED -> 22023`), và chấm điểm trực tiếp trong PostgreSQL.
- **Từ vựng & SRS:** Bảng `public.vocabulary` trên Supabase Cloud hiện có **44 dòng Pilot v1** (gồm **43 từ thuộc 300 từ HSK 1** và **1 từ bổ trợ `越南`** ngoài 300 từ). Các UUID Pilot này đang được tham chiếu trực tiếp bởi `public.syllabus_vocabulary` (`43` dòng), `public.lesson_vocabulary` (`66` dòng), `public.review_cards` (`44` dòng), `public.review_events` (`79` dòng) và view `public.vocabulary_progress` (`22` dòng).

---

## 2. Kết quả Kiểm toán 428 Câu hỏi & Phân phối Đáp án Trước / Sau (Phases 2 & 3)

Chi tiết đầy đủ tại [assessment-permutation-design.md](file:///d:/nam4/prj/HanLearn/docs/sprint8o/assessment-permutation-design.md):
- **Phát hiện đặc biệt:** Trong 428 câu hỏi, có **422 câu 4 lựa chọn** và **6 câu đọc hiểu Đúng/Sai 2 lựa chọn** (`ut1-q18`, `ut2-q19`, `ut3-q20`, `ut4-q19`, `ut5-q18`, `ut6-q19`). Ở Revision 1, cả 6 câu Đúng/Sai đều để `choices: ["Sai", "Đúng"]` với `correct_index = 0`. Ở Revision 2, cả 6 câu này được chuẩn hóa về thứ tự chuẩn sư phạm **`["Đúng", "Sai"]`** với `correct_index = 1` (`"Sai"`).
- **Bảng đối chiếu phân phối đáp án trước và sau Sprint 8O:**

| Tập câu hỏi | Vị trí 0 (A) | Vị trí 1 (B) | Vị trí 2 (C) | Vị trí 3 (D) | Tổng cộng |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **38 Mini Quizzes – Trước (Rev 1)** | `294` (`95.45%`) | `9` (`2.92%`) | `5` (`1.62%`) | `0` (`0.00%`) | **308** |
| **38 Mini Quizzes – Sau (Rev 2)** | **`77` (`25.00%`)** | **`77` (`25.00%`)** | **`77` (`25.00%`)** | **`77` (`25.00%`)** | **308** |
| **6 Unit Tests – Trước (Rev 1)** | `120` (`100.00%`) | `0` (`0.00%`) | `0` (`0.00%`) | `0` (`0.00%`) | **120** |
| **6 Unit Tests – Sau (Rev 2)** | **`30` (`25.00%`)** | **`30` (`25.00%`)** | **`30` (`25.00%`)** | **`30` (`25.00%`)** | **120** |
| **TOÀN HỆ THỐNG (428 câu) – Trước (Rev 1)** | `414` (`96.73%`) | `9` (`2.10%`) | `5` (`1.17%`) | `0` (`0.00%`) | **428** |
| **TOÀN HỆ THỐNG (428 câu) – Sau (Rev 2)** | **`107` (`25.00%`)** | **`107` (`25.00%`)** | **`107` (`25.00%`)** | **`107` (`25.00%`)** | **428** |

---

## 3. Giải pháp Permutation Đã Chọn và Lý do

- **Giải pháp đã chọn:** **Versioned Stratified Static Permutation (`Revision 2`) kết hợp Dual-Revision Server Translation Bridge** ([quiz-revisions.ts](file:///d:/nam4/prj/HanLearn/src/features/quizzes/quiz-revisions.ts)).
- **Lý do:**
  1. Đạt phân bổ cân bằng tuyệt đối **`25.00% A / 25.00% B / 25.00% C / 25.00% D`** trong từng đề kiểm tra và trên toàn bộ 428 câu hỏi, đồng thời đảm bảo không có 3 câu liên tiếp nào trùng vị trí đáp án đúng.
  2. Không thể bị học viên suy đoán từ `question_id` vì thứ tự hoán vị được tính một lần ở thời điểm thiết kế với khóa muối riêng và ràng buộc phân tầng toàn cục.
  3. Bảo toàn 100% chữ ký RPC `submit_curriculum_quiz_attempt(uuid, jsonb)` và khóa chính `(quiz_slug, question_id)` của `private.curriculum_quiz_keys`.
  4. Lưu đồng thời `correct_index` (Revision 2) và `correct_index_v1` (Revision 1) ngay trên mỗi dòng `private.curriculum_quiz_keys`, kết hợp cột `key_revision` trên `public.curriculum_quiz_attempts` và hàm dịch song ánh `translateV2AnswersToV1()`, giúp **triệt tiêu hoàn toàn lỗi Version Skew** dù deploy code trước hay chạy DB migration trước.

---

## 4. Mapping 44 Từ Pilot v1 và 300 Từ Canonical HSK 1 (Phases 4 & 5)

Chi tiết đầy đủ tại [vocabulary-catalog-audit.md](file:///d:/nam4/prj/HanLearn/docs/sprint8o/vocabulary-catalog-audit.md) và [catalog-identity-plan.md](file:///d:/nam4/prj/HanLearn/docs/sprint8o/catalog-identity-plan.md):
- **43 từ có mặt trong cả Pilot v1 và 300 từ HSK 1:** Bảo toàn tuyệt đối `pilot_v1_id` làm `effective_database_id` (`item.id` trong `getOfficial300VocabItems()`), đồng thời cập nhật tại chỗ (`UPDATE ... WHERE id = pc.id`) nghĩa tiếng Việt, Pinyin và câu ví dụ chuẩn Sprint 8N/8O. Toàn bộ khóa ngoại trong `review_cards`, `lesson_vocabulary`, `syllabus_vocabulary` giữ nguyên 100%.
- **1 từ chỉ có trong Pilot v1 (`越南`, `aa4a8f04-c772-54ef-a296-a7fd0a6d37c3`):** Giữ nguyên trong `public.vocabulary` và `public.lesson_vocabulary` để phục vụ Bài 2 Pilot; không đưa vào `public.syllabus_vocabulary` của 300 từ HSK 1 và không cộng vào `vocabularyLearnedCount`.
- **257 từ mới chỉ có trong JSON:** Sử dụng UUID tất định MD5(`hsk1_word_${hanzi}`) làm `effective_database_id`, được `INSERT ... ON CONFLICT (id) DO UPDATE` vào `public.vocabulary` (`sense_key = 'hsk1-2025-1'`, `status = 'published'`, `review_status = 'approved'`) và liên kết vào `public.syllabus_vocabulary`.
- **Tương thích ngược đường dẫn:** Hàm `findOfficial300VocabItem(idOrHanzi)` phân giải theo cả `effective_database_id` (Pilot UUID), `canonical_source_id` (MD5 UUID) và chữ Hán `simplified`.

---

## 5. Danh sách Files Thay đổi & Migrations Mới

### 5.1. Migrations mới (Local — Chưa apply lên Supabase Cloud)
1. [supabase/migrations/202611200011_sprint8o_assessment_permutation.sql](file:///d:/nam4/prj/HanLearn/supabase/migrations/202611200011_sprint8o_assessment_permutation.sql)
2. [supabase/migrations/202611200012_sprint8o_vocabulary_catalog_sync.sql](file:///d:/nam4/prj/HanLearn/supabase/migrations/202611200012_sprint8o_vocabulary_catalog_sync.sql)
3. [docs/postgres_schema.sql](file:///d:/nam4/prj/HanLearn/docs/postgres_schema.sql) *(Tự động đồng bộ từ `scripts/sync-schema.mjs`)*

### 5.2. Mã nguồn Ứng dụng & Dữ liệu Câu hỏi
1. [src/features/quizzes/quiz-revisions.ts](file:///d:/nam4/prj/HanLearn/src/features/quizzes/quiz-revisions.ts) *(Mới: Registry song ánh Revision 1 $\leftrightarrow$ Revision 2 cho 428 câu hỏi)*
2. [src/features/quizzes/curriculum-quizzes-batch1.ts](file:///d:/nam4/prj/HanLearn/src/features/quizzes/curriculum-quizzes-batch1.ts), [curriculum-quizzes.ts](file:///d:/nam4/prj/HanLearn/src/features/quizzes/curriculum-quizzes.ts), [curriculum-quizzes-batch2.ts](file:///d:/nam4/prj/HanLearn/src/features/quizzes/curriculum-quizzes-batch2.ts) *(Cập nhật 308 câu Mini Quiz lên Revision 2 cân bằng `[77, 77, 77, 77]`)*
3. `content/hsk_library/unit_tests/hsk1_unit_test_01..06.json` *(Cập nhật 120 câu Unit Test lên Revision 2 cân bằng `[30, 30, 30, 30]`, chuẩn hóa 6 câu Đúng/Sai về `["Đúng", "Sai"]`)*
4. [src/features/quizzes/actions.ts](file:///d:/nam4/prj/HanLearn/src/features/quizzes/actions.ts), [src/features/quizzes/queries.ts](file:///d:/nam4/prj/HanLearn/src/features/quizzes/queries.ts), [src/features/exam/unit-test-actions.ts](file:///d:/nam4/prj/HanLearn/src/features/exam/unit-test-actions.ts) *(Hỗ trợ song song `key_revision = 1` & `2` và tự động dịch `v2 -> v1` khi DB chưa chạy Migration 0011)*
5. [src/features/vocabulary/hsk1-library-vocab.ts](file:///d:/nam4/prj/HanLearn/src/features/vocabulary/hsk1-library-vocab.ts), [src/features/vocabulary/queries.ts](file:///d:/nam4/prj/HanLearn/src/features/vocabulary/queries.ts), [src/app/(app)/vocabulary/page.tsx](file:///d:/nam4/prj/HanLearn/src/app/(app)/vocabulary/page.tsx), [src/features/courses/queries.ts](file:///d:/nam4/prj/HanLearn/src/features/courses/queries.ts) *(Hợp nhất `effective_database_id` bảo toàn 43 Pilot UUIDs và loại bỏ import trực tiếp `content/pilot-hsk1` khỏi `src/app/(app)/vocabulary/page.tsx`)*

### 5.3. Kiểm thử & Tài liệu Thiết kế (`tests/`, `supabase/tests/`, `docs/sprint8o/`)
1. [supabase/tests/sprint8o_assessment_and_catalog.sql](file:///d:/nam4/prj/HanLearn/supabase/tests/sprint8o_assessment_and_catalog.sql) & [scripts/test-database.mjs](file:///d:/nam4/prj/HanLearn/scripts/test-database.mjs)
2. [tests/sprint8o-assessment-and-catalog-integrity.test.ts](file:///d:/nam4/prj/HanLearn/tests/sprint8o-assessment-and-catalog-integrity.test.ts) & [tests/generate-migration-009.test.ts](file:///d:/nam4/prj/HanLearn/tests/generate-migration-009.test.ts)
3. 8 tài liệu thiết kế và kế hoạch trong `docs/sprint8o/` (`architecture-audit.md`, `assessment-permutation-design.md`, `vocabulary-catalog-audit.md`, `catalog-identity-plan.md`, `migration-plan.md`, `rollback-plan.md`, `release-plan.md`, `final-report.md`).

---

## 6. Kết quả PostgreSQL 18.4 Local Dry-Run & Regression Tests (Phase 8)

1. **PostgreSQL 18.4 Local Dry-Run (`npm run test:db:native`):** **PASS 100%**
   - Áp dụng thành công toàn bộ **12 migrations** (`202611120001_catalog.sql` $\rightarrow$ `202611200012_sprint8o_vocabulary_catalog_sync.sql`) trên instance PostgreSQL 18.4 độc lập (`127.0.0.1:55439`).
   - Vượt qua toàn bộ **165 SQL assertions** (`86` base contract assertions + `12` Sprint 1 assertions + `29` mini quiz assertions + `22` study confirmation assertions + `11` Migration 009 security assertions + `5` Sprint 8O assessment & catalog assertions + `3` concurrent SRS race assertions).
   - Chứng minh bằng SQL thực tế trên PostgreSQL 18.4:
     - Phân bổ đáp án 428 câu chuẩn trong `private.curriculum_quiz_keys` đạt chính xác **`[107, 107, 107, 107]`** (`25%` mỗi vị trí) và giữ nguyên `correct_index_v1` (`414` câu ở index 0).
     - Attempt `key_revision = 1` chấm với bộ đáp án Revision 1 đạt `20 / 20` (`passed = true`).
     - Attempt `key_revision = 2` chấm với bộ đáp án Revision 2 đạt `20 / 20` (`passed = true`), trong khi đoán mò toàn bộ đáp án A trên attempt `key_revision = 2` chỉ đạt `5 / 20` (`25%`, `passed = false`).
     - Hàm `private.sync_hsk1_canonical_vocabulary_catalog()` chạy 2 lần liên tiếp (idempotent), bảo toàn UUID Pilot của từ `不` (`df6876e3-e013-584d-b584-64c5d6f29048`), cập nhật nghĩa chuẩn, chèn đủ 257 từ mới (gồm `只 zhī`), giữ nguyên từ bổ trợ `越南`, và bảo toàn tuyệt đối thẻ `review_cards` (`interval_days = 25`) cùng `vocabulary_progress` (`mastery_state = 'mastered'`).
2. **Repository Contracts (`npm run test:contracts`):** **PASS 100%** (Mọi hàm trong `public` schema đều là `SECURITY INVOKER`; `docs/postgres_schema.sql` khớp tuyệt đối với 12 migrations).
3. **Vitest Suite (`npx vitest run`):** **55 / 55 test files PASS (`502 / 502` tests PASS, 100%)**.
4. **TypeScript (`npm run typecheck`) & ESLint & Next.js Production Build (`npm run build`):** **PASS 100%** (`0` errors).

---

## 7. Các Rủi ro Còn lại & Các Quyết định Cần Chủ Dự án Phê duyệt

### 7.1. Rủi ro còn lại đã được kiểm soát
- **Tương thích trước và trong khi chạy migration Cloud:** Đã được bảo vệ bằng cơ chế tự động dịch `translateV2AnswersToV1()` khi DB chưa có cột `key_revision` và cơ chế **Canonical Overlay** cho từ vựng.
- **Các attempt chưa nộp (`unsubmitted`) cũ trên Cloud:** 13 dòng `submitted_at IS NULL` hiện có trên Cloud đều được tạo từ ngày `2026-11-15` (đã quá hạn 20 phút của `EXAM_DEADLINE_EXCEEDED`); với bất kỳ attempt nào mở mới ngay trước thời điểm cắt chuyển, cột `key_revision = 1` đảm bảo chấm đúng theo Revision 1.

### 7.2. Các Quyết định Cần Bạn Phê duyệt Trước Khi Tác động Cloud / Preview
1. **Phê duyệt Áp dụng 2 Migrations lên Supabase Cloud Development (`hhgxrjqkuwdgurphopok`):**
   - Bạn có phê duyệt chạy `202611200011_sprint8o_assessment_permutation.sql` và `202611200012_sprint8o_vocabulary_catalog_sync.sql` lên project Development `hhgxrjqkuwdgurphopok` không?
2. **Phê duyệt Push Nhánh Preview (`origin/preview/hsk1-full-curriculum`):**
   - Bạn có phê duyệt push commit local của Sprint 8O lên nhánh Vercel Preview `origin/preview/hsk1-full-curriculum` theo quy trình 4 bước tại [release-plan.md](file:///d:/nam4/prj/HanLearn/docs/sprint8o/release-plan.md) không?
