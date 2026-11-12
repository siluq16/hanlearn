# HanLearn HSK 1 pilot v1 — offline draft

Biên soạn: 2026-11-13. **pending_review — chưa được người kiểm duyệt duyệt, chưa được phép import hoặc publish.** Nội dung do AI hỗ trợ tự biên soạn cho người Việt; không phải giáo trình chính thức của đơn vị tổ chức HSK. Không sử dụng nội dung độc quyền HelloChinese hoặc sách trả phí.

## Quy mô và trình tự

| Bài | Tiêu đề | Mục từ mới | Ngữ pháp | Câu quiz | Dự kiến |
| --- | --- | --- | --- | --- | --- |
| 1 | 你好！ — Chào hỏi và làm quen | 8 | 3 | 6 | 20 phút |
| 2 | 我叫…… — Giới thiệu bản thân | 10 | 3 | 6 | 25 phút |
| 3 | 我的家 — Gia đình | 15 | 3 | 6 | 30 phút |
| 4 | 今天星期几？— Ngày tháng và thời gian | 11 | 3 | 6 | 30 phút |

Tổng: **1 syllabus, 1 course, 1 unit, 4 lessons, 44 mục từ distinct, 12 điểm ngữ pháp, 4 quiz/24 câu**. Có 66 liên kết lesson–vocabulary (bao gồm ôn lại), 12 liên kết lesson–grammar. Số lượng là quy mô pilot, không phải toàn bộ danh sách HSK 1. Thời gian chỉ là ước tính học, không tạo study session hoặc streak.

```text
manifest.json                  Catalog draft, IDs/joins, phân loại HSK, review gates, hashes
vocabulary.json                44 bản ghi vocabulary draft
grammar.json                   12 bản ghi grammar_points draft
lessons/lesson-01..04.json      Bản ghi lessons; content đúng Content V1
quizzes/lesson-01..04.json      Quiz draft + questions/choices, không có key/feedback
rights-manifest.json           Nguồn gốc AI hỗ trợ, phạm vi quyền còn chờ duyệt
REVIEW_CHECKLIST.md            Hướng dẫn rà soát tiếng Trung, nguồn, quyền và import gates
```

## Nguồn HSK và độ chắc chắn

Đối chiếu bản **HSK考试大纲**, do 中外语言交流合作中心 phát hành; bìa ghi **2025-11 发布 / 2026-07 实施**. Đường dẫn lấy từ mục “HSK3.0 → Examination Syllabus” trên [Chinese Tests Service Website](https://www.chinesetest.cn/syllabus), tới [PDF chính thức](https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf). Không trộn với danh sách HSK cũ hoặc tiêu chuẩn 2021. Đây là phiên bản của tài liệu được đối chiếu, không phải khẳng định mọi điểm thi hiện sử dụng cùng một đề.

Ngày đối chiếu máy: **2026-11-13**. SHA-256 PDF: `d8b6646599bc9a0c9616a4cb06d4b37461f8792f70a3171016d00fcd8eda09ad`. Bìa đã được kiểm tra trực quan; bảng từ cấp 1 ở PDF trang 80–87 (trang in 77–84), danh mục ngữ pháp cấp 1 ở PDF 386–388 (trang in 383–385). PDF và toàn bộ text trích xuất chỉ lưu local ignored, không phân phối trong package.

- **43 mục từ**: `verified_hsk1_headword` — tìm thấy đúng headword/reading trong bảng cấp 1. Mỗi mục có source ID, số thứ tự, trang PDF/trang in, nhãn cấp nguyên văn và pinyin nguồn trong manifest.hsk_verification. Đây là đối chiếu máy, **không phải human approval hoặc xác minh mọi nghĩa/từ loại**. Ký hiệu đồng âm và nhãn cấp như 1（3） vẫn được giữ.
- **1 mục bổ trợ: 越南** — `supplementary_outside_verified_list`. Không tìm thấy headword này trong phạm vi bảng đã kiểm; không kết luận rằng kỳ thi cấm tên quốc gia. Không tạo membership introduced_level=1 cho mục này. Nó vẫn có thể là từ bổ trợ trong lesson sau khi được duyệt.
- **0 headword còn chưa phân loại** trong 44 mục hiện tại. Tuy nhiên nghĩa Việt, ví dụ, pinyin câu, ngữ pháp và tất cả quiz đều **pending_review** về ngôn ngữ/ngữ nghĩa.
- 你好 và 星期天 được ghi là cụm cấu tạo/phụ trợ, 小明 / 小红 là tên nhân vật hư cấu; không cộng vào 44 bản ghi vocabulary hoặc tự cấp membership. Không dùng dữ liệu cá nhân thật.

Syllabus là bản pilot bám phiên bản nguồn, không phải bản sao toàn bộ syllabus. `official_vocab_totals` rỗng, `verified_at` null và `is_active` false cho tới quy trình duyệt. Không tự gán một ngày cụ thể trong tháng 07/2026 khi nguồn chỉ ghi tháng. Membership ngữ pháp là đề xuất draft, cần người kiểm lại từng cách dùng.

## Schema, publication và bản quyền

Mỗi lesson JSON là một **bản ghi database draft**, không phải root Content V1 trần. Chỉ thuộc tính `content` được parse trực tiếp bằng schema production `lessonContentSchema`; không đổi schema hoặc thêm metadata/keys vào content. Tiêu đề DB ghép chữ Hán và tiếng Việt; manifest giữ riêng title_zh/title_vi. References khớp đúng joins của từng lesson. Các file grammar/examples theo đúng shape của Sprint 2.1.

Trong bản ghi PostgreSQL: `status: "draft"`, `review_status: "pending"`, `reviewed_by/reviewed_at: null`. Enum SQL hiện chỉ có pending/approved; **không ghi pending_review vào cột đó**. Quy trình biên soạn dùng `review_state: "pending_review"` trong manifest/review metadata. Không giả tên người kiểm duyệt bằng “AI”.

`source_uri` dạng urn:hanlearn chỉ xuất xứ biên soạn; nguồn đối chiếu HSK được liên kết riêng trong manifest. `content_license: "pending-rights-review"` là chặn quy trình, **không phải một giấy phép**. Người có thẩm quyền phải quyết định quyền phân phối và attribution. Không chỉ đổi status sang published: DB kiểm tra metadata không thể chứng minh ngôn ngữ đúng hay quyền hợp lệ. Runtime LessonBundle hiện cố ý không đọc draft/pending; package này chưa được hiển thị như nội dung đã phát hành.

Mọi listening.audioAssetId đều null; transcript chỉ để đọc, không có file/URL audio giả hoặc bucket. Mẫu giờ/thứ/ngày là những tình huống giả định độc lập; không phản ánh ngày giờ hệ thống. Phạm vi số đang học chưa đủ đọc mọi ngày 1–31 hoặc tháng 1–12.

## Đáp án riêng — không commit

Đáp án và giải thích quiz chỉ ở **`.local/pilot-hsk1/v1/private/answers.json`**; source biên soạn chứa key cũng nằm trong thư mục private đó. Thư mục đã tắt kế thừa ACL và chỉ cho tài khoản local hiện tại/SYSTEM truy cập, đồng thời bị Git ignore. Không có key, đáp án đánh dấu, feedback sau chấm hoặc digest của vector đáp án trong payload công khai.

Đây là biện pháp cách ly local, **không phải mã hóa hoặc quy trình quản lý/chia sẻ key đã được duyệt**. Cần duyệt quyền truy cập, backup và bàn giao riêng. Không copy vào content/, public/, src/, log, frontend bundle hoặc Git. Không chạy lại private authoring source sau khi người kiểm đã chỉnh sửa vì có thể ghi đè công việc review. Nếu clone repository mà không có private store, validator phải báo BLOCKED; không tự đoán/tạo lại đáp án từ file công khai.

## Validation offline

Chạy tại root repo, Node 24 đã kiểm thử:

```powershell
npm run content:validate
npm run test
npm run typecheck
npm run lint
npm run test:contracts
npm run test:security
```

Validator không đọc .env, không có database client/network/import. Nó tái sử dụng Zod Content V1 production, kiểm tra các draft row, số lượng/IDs/joins, pinyin character set và NFC, source lookup, hashes và key cardinality/range trong private store. Không in key/explanation riêng vào report. JSON có 1 key hợp lệ/question về cấu trúc **không chứng minh** chỉ một lựa chọn đúng về ngữ nghĩa tiếng Trung; người kiểm phải xác nhận.

Source verification cần PDF/text cache local đúng SHA-256 từ lần đối chiếu. Thiếu cache hoặc private keys → BLOCKED, dù public schema có thể PASS. Report kỹ thuật nằm trong `.local/pilot-hsk1/validation-result.json`; humanReview/quizSemanticReview/pinyinSemanticReview luôn pending và importReadiness luôn BLOCKED trong tác vụ này. Không tự tải nguồn trong khi chạy validator offline.

Chỉnh sửa JSON khi review làm thay đổi manifest.files hashes; người quản lý cần ghi nhận thay đổi/revision, cập nhật hashes của **file công khai** rồi chạy lại checks. Không đưa hash file đáp án vào manifest. Không thay đổi test/validator để che lỗi nội dung, hoặc biến pending thành approved khi chưa có người duyệt.

## Điều kiện trước import Development

1. Người kiểm tiếng Trung ký xác nhận từng mục: nghĩa, pinyin, biến điệu, độ tự nhiên, trình tự, và duy nhất một đáp án đúng cho mỗi quiz.
2. Xác minh lại nguồn/edition, headword/reading/sense, phân biệt bổ trợ; duyệt bản quyền và giấy phép phân phối, ghi reviewer/time thật. Giữ các mục không đạt ở draft hoặc loại khỏi đợt import.
3. Duyệt riêng workflow private keys, backup/bàn giao; đối chiếu 24 keys với đúng quiz revision/IDs/hash công khai. Không gửi key qua chat hoặc commit trước quyết định này.
4. Preflight read-only trên đúng Development để kiểm tra collision IDs/natural keys/history và SQL constraints; không ghi đè catalog đã published hay dữ liệu học owner.
5. Trình phê duyệt riêng **gói/revision/hash và phạm vi import**. Tác vụ hiện tại không cung cấp lệnh import, migration, seed hoặc quyền publish. Nếu chỉ import draft được duyệt, nội dung vẫn không xuất hiện qua RLS.
6. Publication cần quyết định riêng, ancestry đầy đủ và trigger quiz đóng băng/5–10 câu/keys hợp lệ. Publish quiz sau cùng; không sửa published keys để ép thành công. Audio và Sprint 2.2 có gates riêng.

Xem REVIEW_CHECKLIST.md và docs/PILOT_CONTENT_AUTHORING_REPORT.md để biết các giới hạn kiểm chứng. Sprint 1/2.1 acceptance blockers chưa được coi là đã đóng.
