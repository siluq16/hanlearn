# HanLearn Sprint 8O – Phase 9: Coordinated Zero-Skew Release Plan

**Ngày lập kế hoạch:** 2026-11-20  
**Mục tiêu:** Loại bỏ hoàn toàn hiện tượng bất đồng bộ (Version Skew) giữa giao diện client, Server Actions trên Vercel và bảng `private.curriculum_quiz_keys` trên Supabase Cloud trong quá trình phát hành.

---

## 1. Phân tích Bài toán Version Skew & Cơ chế Chống Lệch Phiên bản Đã Triển khai

Trong hệ thống phân tán giữa **Vercel (Next.js App)** và **Supabase Cloud (PostgreSQL)**, việc deploy code và chạy database migration luôn diễn ra ở hai thời điểm cách nhau vài chục giây đến vài phút. Nếu không có cơ chế cầu nối phiên bản, sẽ xảy ra 2 nguy cơ:

1. **Nguy cơ 1 (Code-First Skew):** Vercel đã chạy code Revision 2 (hiển thị `choices` theo thứ tự mới `[107, 107, 107, 107]`), nhưng Supabase Cloud chưa chạy Migration `0011` (vẫn giữ `private.curriculum_quiz_keys` ở Revision 1 với 414/428 câu có `correct_index = 0`).
2. **Nguy cơ 2 (DB-First / In-Flight Attempt Skew):** Học viên mở đề kiểm tra ở Revision 1 trước khi nâng cấp, rồi bấm Nộp bài sau khi hệ thống đã chuyển sang Revision 2.

### Giải pháp Cầu nối Kép (Dual-Revision Server Translation Bridge) Đã Triển khai trong Sprint 8O

1. **Tự động phát hiện phiên bản Schema (`dbHasKeyRevisionColumn` Probe):**
   - Trong [src/features/quizzes/actions.ts](file:///d:/nam4/prj/HanLearn/src/features/quizzes/actions.ts) (`submitQuiz`) và [src/features/exam/unit-test-actions.ts](file:///d:/nam4/prj/HanLearn/src/features/exam/unit-test-actions.ts) (`submitUnitTestAction`), Server Action kiểm tra dòng attempt trong `public.curriculum_quiz_attempts` kèm cột `key_revision`.
   - **Nếu DB chưa chạy Migration `0011`** (cột `key_revision` chưa tồn tại): Server Action tự động đặt `dbHasKeyRevisionColumn = false` và gọi hàm `translateV2AnswersToV1(quizSlug, answers)` từ [src/features/quizzes/quiz-revisions.ts](file:///d:/nam4/prj/HanLearn/src/features/quizzes/quiz-revisions.ts) để **ánh xạ song ánh các chỉ số lựa chọn Revision 2 của người dùng về chỉ số Revision 1** trước khi gọi RPC `submit_curriculum_quiz_attempt(p_attempt_id, rpcAnswers)`. Nhờ đó, PostgreSQL trên Cloud (dù đang ở Revision 1) vẫn chấm đúng tuyệt đối 100%!
   - **Nếu DB đã chạy Migration `0011`** (cột `key_revision` đã tồn tại): Server Action gửi thẳng `answers` (Revision 2) xuống RPC `submit_curriculum_quiz_attempt`, và hàm PL/pgSQL tự động đối chiếu với `k.correct_index` (nếu `v_attempt.key_revision = 2`) hoặc `k.correct_index_v1` (nếu `v_attempt.key_revision = 1`).
2. **Ghim phiên bản theo Attempt (`Attempt Revision Pinning`):**
   - Trong [src/features/quizzes/queries.ts](file:///d:/nam4/prj/HanLearn/src/features/quizzes/queries.ts) (`getQuizView`), nếu học viên mở lại một attempt có `key_revision = 1`, server trả về đúng mảng lựa chọn `v1Choices` và đối chiếu đáp án theo `v1CorrectIndex`.

---

## 2. Quy trình Phát hành Phối hợp 4 Bước (Sau khi Chủ dự án Phê duyệt)

Nhờ cơ chế Cầu nối Kép ở trên, cả hai thứ tự phát hành (**Code trước $\rightarrow$ DB sau** hoặc **DB trước $\rightarrow$ Code sau**) đều an toàn. Quy trình chuẩn được khuyến nghị gồm 4 bước:

### Bước 1: Kiểm tra Preflight READ-ONLY trên Supabase Cloud (`hhgxrjqkuwdgurphopok`)
- Chạy truy vấn Before-Verification tại [migration-plan.md](file:///d:/nam4/prj/HanLearn/docs/sprint8o/migration-plan.md) để ghi nhận số dòng baseline (`vocabulary = 44`, `review_cards = 44`, `review_events = 79`, `curriculum_quiz_attempts = 33`).

### Bước 2: Push Code Sprint 8O lên Nhánh Vercel Preview (`origin/preview/hsk1-full-curriculum`)
- Trong khoảng thời gian Vercel đang build và ngay sau khi Vercel Preview Ready (trước khi chạy SQL migration), cơ chế `translateV2AnswersToV1` và **Canonical Overlay** đảm bảo trang Preview hoạt động chính xác 100% với database hiện tại.

### Bước 3: Áp dụng 2 Migrations (`0011` và `0012`) trên Supabase Development (`hhgxrjqkuwdgurphopok`)
- Thực thi tuần tự:
  1. `supabase/migrations/202611200011_sprint8o_assessment_permutation.sql`
  2. `supabase/migrations/202611200012_sprint8o_vocabulary_catalog_sync.sql`
- Ngay khi Migration `0011` hoàn tất, cột `key_revision` xuất hiện trên `public.curriculum_quiz_attempts` (default `2`), và Server Actions trên Vercel tự động chuyển sang chế độ gửi trực tiếp Revision 2 answers mà không cần redeploy.

### Bước 4: Chạy Truy vấn After-Verification & Smoke Test
- Chạy truy vấn After-Verification xác nhận:
  - `public.vocabulary` đạt `301` dòng (`300` từ HSK 1 + `1` từ Pilot bổ trợ `越南`), `public.syllabus_vocabulary` đạt `300` dòng, `orphaned_review_cards = 0`.
  - `private.curriculum_quiz_keys` trên 428 câu chuẩn đạt phân phối `[107, 107, 107, 107]`.
  - Thực hiện 1 lượt nộp bài thử trên tài khoản test xác nhận chấm điểm `100%` ở Revision 2.
