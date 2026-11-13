# HSK 1 Pilot — Hồ sơ chuẩn bị human review

2026-11-13, Asia/Saigon. Nguồn: **draft_revision 2, baseline commit 4aeb303**. Đã chuẩn bị [hồ sơ đọc và biểu mẫu theo từng ID](human-review/pilot-hsk1-r2/README.md). **Chưa có human approval; import readiness BLOCKED.** Không thay đổi một byte của bộ content revision 2 hoặc private answers hiện có.

## Bàn giao

- Booklets Markdown dễ đọc: VOCABULARY (44 mục Hanzi/pinyin/gloss/ví dụ/nguồn), GRAMMAR (12 mục đầy đủ), LESSONS (4 bài, 29 sections/hội thoại/thời lượng), QUIZZES (24 stems/choices/ngữ cảnh không đánh dấu đáp án), CATALOG_AND_RIGHTS (ancestors, nguồn và rights manifest).
- REVIEW_REGISTER.template.csv (UTF-8 BOM) và JSON: **158 dòng**, mỗi dòng có stable ID, nội dung cần xác nhận, PENDING/nhận xét/sửa đề xuất/người duyệt/ngày, revision/hash và vị trí nguồn. Comments/proposed_change/reviewer/date đều trống; không có quyết định PASS tự điền.
- SOURCE_SNAPSHOT.json chứa SHA-256 từng file nguồn công khai và tổng hợp; không private key digest. Manifest SHA-256: `2af731b28decc13e72824bee95461fb33dd892b7605b72f5b4956b489ebd6661`.
- Package snapshot SHA-256: `f6bee81f2329f7822d2aeab8187b7f45de324c0fa7fd3744f2373672b40b2b94`. Cách tính: SHA-256 của UTF-8 JSON.stringify của danh sách public `{path,sha256}` được sắp theo path (không newline), gồm manifest và 11 JSON nguồn; snapshot không tự hash chính nó.
- PRIVATE_REVIEW hướng dẫn người duyệt đã được ủy quyền mở cửa sổ WinForms local; SIGN_OFF.template có phạm vi/ký/ngày/hash thật để trống. IMPORT_GATES_AND_DRY_RUN là kế hoạch sau khi duyệt, không phải lệnh đã chạy hoặc quyền ghi Cloud.

## Từng nhóm nội dung còn thiếu quyết định thật

| Nhóm | Số dòng PENDING | Bằng chứng người duyệt phải bổ sung |
| --- | --- | --- |
| Vocabulary | 44 | Quyết định từng UUID về chữ/pinyin/thanh nhẹ/gloss/sense/ví dụ và evidence HSK; không gộp 43 headword lookups thành duyệt nghĩa. |
| Grammar | 12 | Mẫu, giải thích và tất cả ví dụ; đặc biệt 二/两, 一/不, 个/口, chủ ngữ-vị ngữ, câu/cụm/đáp ngắn. |
| Lesson tổng thể | 4 | Mục tiêu, độ khó, thứ tự, thời lượng; bài 3 6/6/3 với quan sát thử thật. |
| Sections | 29 | Quyết định từng `lesson UUID/section ID`; đủ text, refs và transcripts, tự nhiên hội thoại từng bài. Không có audio để ký nghiệm thu audio. |
| Quiz tổng thể | 4 | Cân bằng mục tiêu/phạm vi từ/mức khó, không chỉ tổng điểm hoặc số câu. |
| Questions | 24 | Từng UUID: duy nhất một lựa chọn theo toàn stem, distractors hợp lý; 14 câu đã đổi có flags, 10 câu còn lại vẫn phải kiểm. |
| Private attestations | 24 | Từng `private/question UUID`: đã đọc key và toàn explanation revision 2, so từng distractor; thông tin giải chỉ ở vùng riêng. |
| Catalog ancestry | 3 | Syllabus/course/unit đúng edition/phạm vi, provenance/draft và quyền sử dụng trước import. |
| Rights | 6 | Năm scopes nội dung và nguồn HSK/attribution: license/phạm vi cụ thể, thẩm quyền và bằng chứng thật. |
| Focal checks | 8 | L2-Q1, 14 câu đổi, 24 explanations, pinyin, 二/两/lượng từ, 一/不/thanh 3, bài 3 và hội thoại. Không thay thế các item-level decisions. |

Sổ chi tiết có **từng stable ID và nội dung cần duyệt**, không chỉ bảng tổng số này. Người ký phải xác nhận item/phạm vi/revision/hash, actual reviewer và actual timestamp; sổ chung không có giải đáp quiz. Chưa chỉ định hoặc giả định ai là reviewer thật trong nhiệm vụ này.

## Cơ chế local và giới hạn

`scripts/prepare-pilot-human-review.mjs` chỉ đọc allowlist file công khai, viết booklets/templates dưới docs/human-review; không đọc .env/private/database. Generator từ chối ghi đè sổ mẫu đã bị thay đổi; không dùng generator để tái tạo hồ sơ đã chia sẻ/ký cho source revision mới. Giữ hồ sơ đã ký trong workspace local có ACL và Git ignore, tạo revision packet mới khi có quyết định sửa được duyệt.

`scripts/review-private-pilot.ps1` không kết nối mạng, không chạy HTTP server, không export hoặc lưu quyết định. PrepareOnly kiểm snapshot/ACL/coverage/bindings, không hiển thị private values. Giao diện local mặc định trống, chỉ người đã được xác nhận thẩm quyền mới dùng; checkbox không phải authentication. Không tự cấp ACL cho reviewer khác hoặc điền tên/ngày. Private store hiện tại và source author vẫn ở vùng owner/SYSTEM, ignored. Cần ký/giữ restricted private integrity evidence sau khi duyệt thật; không publish private digest để thay cho bằng chứng đó.

Chỉ PrepareOnly được kiểm thử tự động; **chưa có kiểm chứng thao tác GUI/người duyệt đọc và ký thật**. Viewer không ngăn OS admin/screen capture/memory inspection; phải có phiên máy được kiểm soát và quy trình backup/chia sẻ được duyệt. Các signed decisions không tự cập nhật DB review fields hoặc trao quyền import.

## Kiểm tra kỹ thuật trong bước chuẩn bị

| Kiểm tra thực hiện | Kết quả |
| --- | --- |
| `npm run content` | PASS schema/refs/counts/hashes/source/private bindings; human review pending và import readiness BLOCKED. |
| `npm run test` | **145 tests / 16 files PASS**. Năm tests mới kiểm coverage từng item/text/choice, 158 PENDING/blank decisions, nguồn/hash, 14 câu thay đổi và generated artifacts không stale. Không load đáp án thật trong tests. |
| `npm run lint`, `npm run typecheck`, `npm run format:check` | PASS, lint chạy lại sau chỉnh generator cuối. |
| `npm run test:contracts`, `npm run test:security` | PASS static checks, không có SQL/API mutation. |
| Windows PowerShell 5.1 `review-private-pilot.ps1 -PrepareOnly` | PASS snapshot/ACL/private bindings/24 câu, không in private values. Không mở hoặc nghiệm thu GUI, không tạo review decisions. |
| So baseline `4aeb303` | Toàn bộ tracked content package bytes không đổi; source/migrations/SQL snapshot không có diff. |
| Scan private leakage | 190 tracked/unignored files + 41 browser chunks baseline, không full private bodies/explanations/key payload copies; không private files tracked. |
| `git diff --check` | PASS. |

Không chạy build mới hoặc Cloud checks: app/source content không đổi. Các browser chunks được scan là bundle baseline hiện có, không phải bản build mới của hồ sơ này.

## Thiếu gì trước import

Hiện còn thiếu: reviewer/thẩm quyền và nơi làm việc được chốt; toàn bộ 158 quyết định cùng nhận xét/name/date thật; chữ ký theo vai trò; private full-text review và signed integrity evidence; thử tải bài 3/hội thoại/phát âm có giới hạn audio; rights/license/attribution cuối cùng; workflow restricted backup/bàn giao; target-specific approval cho preflight; bằng chứng read-only compatibility/collisions trên Development; importer/rollback/private delivery được review và approval ghi Cloud riêng.

Kế hoạch chỉ đọc dùng target Development `hhgxrjqkuwdgurphopok`, IPv4 Session Pooler/TLS verify-full, kiểm target ngoài SQL rồi history/catalog/collisions bằng SELECT với transaction READ ONLY/ON_ERROR_STOP; không thử INSERT rồi rollback, không dùng fresh-install preflight đòi history trống, không db push để import content. Chi tiết trong IMPORT_GATES_AND_DRY_RUN.

Tất cả source data vẫn draft/pending, reviewer/date null, import/publish authorization false. Không Supabase/DB/migration/user/allowlist/Storage/test-data operation, không Sprint 2.2, GitHub push hoặc deploy. Dừng ở bước chuẩn bị hồ sơ.
