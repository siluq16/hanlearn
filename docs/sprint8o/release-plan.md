# HanLearn Sprint 8O – Phase 9: Coordinated Zero-Skew Release Plan

**Ngày cập nhật (Pre-Cloud Migration Safety Gate):** 2026-11-20  
**Mục tiêu:** Loại bỏ hoàn toàn hiện tượng bất đồng bộ (Version Skew) giữa giao diện client, các serverless instances trên Vercel và bảng `private.curriculum_quiz_keys` trên Supabase Cloud trong suốt quá trình phát hành, không phụ thuộc vào việc deploy và migration hoàn tất cùng thời điểm.

---

## 1. Ma trận Tương thích 4 Trạng thái (`A`, `B`, `C`, `D`) & Các Rào chắn Kỹ thuật

| Trạng thái | Tầng App (Vercel) | Tầng DB (Supabase) | Cơ chế Bảo vệ & Hành vi Thực tế | Kết quả Kiểm thử |
| :---: | :---: | :---: | :--- | :---: |
| **A** | **Old App** (`665fecc`) | **Old DB** (`001..010`) | Hiển thị `v1Choices`, tạo attempt không có `key_revision`, chấm điểm theo khóa Revision 1. | **PASS 100%** |
| **B** | **New App** (Sprint 8O) | **Old DB** (`001..010`) | - Các attempt lịch sử hoặc attempt do Old App tạo trên Old DB được `resolveAttemptKeyRevision()` phân giải về **`Revision 1`** (hiển thị `v1Choices`, chấm theo `v1CorrectIndex`).<br>- Các attempt mới tạo trên New App được pin `Revision 2` (trong memory & `user_metadata`), hiển thị `v2Choices`, tự động dịch đáp án `translateV2AnswersToV1()` khi gọi RPC trên Old DB và dịch ngược `translateV1AnswersToV2()` khi đọc lại trên Old DB. | **PASS 100%** |
| **C** | **Old App** (`665fecc`) | **New DB** (`001..012`) | - Migration `0011` giữ **`DEFAULT 1`** cho cột `public.curriculum_quiz_attempts.key_revision` và trigger `coalesce(new.key_revision, 1)`.<br>- Khi Old App tạo attempt mới (không truyền `key_revision`), New DB tự động ghim **`key_revision = 1`**.<br>- Khi Old App nộp bài, RPC `submit_curriculum_quiz_attempt` trên New DB thấy `key_revision = 1` và chấm chính xác theo cột **`correct_index_v1` (Revision 1)**! | **PASS 100%** |
| **D** | **New App** (Sprint 8O) | **New DB** (`001..012`) | - Khi New App tạo attempt mới, `startQuiz` và `startUnitTestAction` truyền tường minh **`key_revision: 2`** xuống New DB.<br>- Các attempt lịch sử hoặc in-flight có `key_revision = 1` vẫn được New App hiển thị `v1Choices` và chấm theo `correct_index_v1`.<br>- Các attempt mới có `key_revision = 2` được hiển thị `v2Choices` và chấm theo `correct_index` (Revision 2). | **PASS 100%** |

---

## 2. Thứ tự Phát hành Đề xuất (DB Migration First $\rightarrow$ App Deploy Second)

Vì Migration `0011` giữ mặc định `key_revision DEFAULT 1` ở tầng PostgreSQL (`State C: Old App + New DB` tương thích tuyệt đối 100% mà không làm thay đổi hành vi của Old App đang chạy), thứ tự phát hành an toàn nhất và không phụ thuộc vào thời gian build của Vercel là:

### Bước 1: Kiểm tra Preflight READ-ONLY trên Supabase Development (`hhgxrjqkuwdgurphopok`)
- Chạy truy vấn Before-Verification tại [migration-plan.md](file:///d:/nam4/prj/HanLearn/docs/sprint8o/migration-plan.md) để ghi nhận số dòng baseline (`vocabulary = 44`, `review_cards = 44`, `review_events = 79`, `curriculum_quiz_attempts = 33`).

### Bước 2: Áp dụng 2 Migrations (`0011` và `0012`) trên Supabase Development (`hhgxrjqkuwdgurphopok`)
- Thực thi tuần tự trong giao dịch nguyên tử:
  1. [supabase/migrations/202611200011_sprint8o_assessment_permutation.sql](file:///d:/nam4/prj/HanLearn/supabase/migrations/202611200011_sprint8o_assessment_permutation.sql)
  2. [supabase/migrations/202611200012_sprint8o_vocabulary_catalog_sync.sql](file:///d:/nam4/prj/HanLearn/supabase/migrations/202611200012_sprint8o_vocabulary_catalog_sync.sql)
- **Trạng thái ngay sau Bước 2 (`State C: Old App + New DB`):**
  - Toàn bộ 33 attempt hiện có trên Cloud (gồm 20 đã nộp và 13 chưa nộp) được gán `key_revision = 1`.
  - Mọi lượt thi đang diễn ra hoặc mới tạo trên bản Vercel Preview hiện tại (`665fecc`) vẫn được DB gán `key_revision = 1` (nhờ `DEFAULT 1`) và chấm điểm theo `correct_index_v1`. Hệ thống có thể dừng ở Bước 2 bao lâu tùy ý mà không hề có rủi ro lệch phiên bản.

### Bước 3: Chạy Truy vấn After-Verification trên Supabase Development
- Xác nhận:
  - `public.vocabulary` đạt `301` dòng (`300` từ HSK 1 + `1` từ bổ trợ `越南`), `public.syllabus_vocabulary` đạt `300` dòng, `orphaned_review_cards = 0`, `review_cards = 44`, `review_events = 79`.
  - `private.curriculum_quiz_keys` đạt `1,284` dòng (`428` câu chuẩn phân bổ `[107, 107, 107, 107]` ở `correct_index` và bảo toàn `[414, 9, 5, 0]` ở `correct_index_v1`).

### Bước 4: Push Code Sprint 8O lên Nhánh Vercel Preview (`origin/preview/hsk1-full-curriculum`)
- Khi Vercel hoàn tất triển khai (`State D: New App + New DB`):
  - Các attempt tạo mới từ New App được ghim tường minh `key_revision = 2` và sử dụng bộ đề Revision 2 cân bằng `[107, 107, 107, 107]`.
  - Bất kỳ attempt nào được mở từ trước đó (`key_revision = 1`) vẫn được hiển thị và chấm theo Revision 1.
