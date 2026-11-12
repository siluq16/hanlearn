# HSK 1 pilot offline authoring — 2026-11-13

**Biên soạn draft và kiểm tra kỹ thuật offline; chưa được người kiểm duyệt phê duyệt. Import/publish: BLOCKED.** Nội dung nằm ở [content/pilot-hsk1/v1](../content/pilot-hsk1/v1/README.md), chốt theo Content V1 production, không thay Zod/schema/PostgreSQL/app behavior.

## Sản phẩm

Một syllabus bám bản HSK考试大纲 phát hành 11/2025 (bìa ghi triển khai 07/2026); một course, một unit, **4 bài**, **44 mục từ distinct**, **12 điểm ngữ pháp**, **4 quiz/24 câu** (6 câu/bài). Mỗi bài có 6 sections gồm giải thích, vocabulary refs, grammar refs, hội thoại, transcript listening không audio và tự ôn. Tiêu đề Trung/Việt, mục tiêu, thời gian, ví dụ, pinyin, joins và provenance đều có trong JSON/manifest.

Trình tự: 你好！(8 mục mới) → 我叫…… (10) → 我的家 (15, gồm số/lượng từ) → 今天星期几？(11). Có ôn lại từ trước; không gán mastery/progress/session. Các đoạn thời gian là giả định độc lập, không phải ngày giờ thực. Hai tên nhân vật là hư cấu.

## Xác minh nguồn

Đã theo link “Examination Syllabus” từ [chinesetest.cn/syllabus](https://www.chinesetest.cn/syllabus) tới [PDF](https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf), kiểm bìa/trang bảng từ trực quan và đọc bảng cấp 1. PDF SHA-256/edition/trang và ordinal được lưu trong manifest. PDF/text đầy đủ chỉ ở cache local ignored; không sao chép tài liệu vào gói công khai.

- **43/44 headwords/readings** tìm thấy ở cấp 1, có per-item evidence: source ID, ordinal, trang PDF/trang in, source term/nhãn cấp/pinyin. Phạm vi xác minh là headword/reading, không phải toàn bộ nghĩa, ngữ pháp hoặc mọi cách dùng do AI biên soạn.
- **越南** là tên quốc gia bổ trợ không được tìm thấy như headword trong bảng đã đối chiếu; không có membership cấp 1 tự động. Không khẳng định tên này bị loại khỏi mọi đề thi.
- Không có headword chưa phân loại trong gói hiện tại. Các cụm cấu tạo/tên riêng phụ trợ ghi riêng; không tính chúng như bản ghi vocabulary hoặc tự gán nhãn official.
- 12 điểm ngữ pháp có tham chiếu category/trang nguồn nhưng cách trình bày/nghĩa/pinyin/ví dụ đều pending_review. Chưa có người duyệt thật; official_vocab_totals rỗng, syllabus chưa active/verified theo workflow con người.

Nguồn 2021 và danh sách HSK cũ không được trộn vào package. Việc source có trên website không tự cấp phép phân phối; rights review vẫn mở.

## Validation và phân tách private

`npm run content:validate` chỉ đọc file local, tái sử dụng lessonContentSchema/example/row schemas. Các draft schema chỉ thay literal publication fields cho quy trình biên soạn (review_status=pending đúng enum SQL); không nới production published validation. ID/natural-key/section uniqueness, ancestry/joins/membership, số lượng/choices, Unicode NFC/pinyin character set, hashes và private-key cardinality/index range được kiểm tra. Không có database client, .env, fetch, import hay mutation trong validator.

Public JSON không có correct_index/key/feedback riêng. Private answers/explanations và source biên soạn có key chỉ trong `.local/pilot-hsk1/v1/private/`, Git ignored; ACL đã kiểm inheritance disabled và chỉ owner/SYSTEM. Không có key/hash vector đáp án trong public package. Workflow quản lý/chia sẻ/backup chưa được duyệt; ACL local không phải mã hóa. Clone không có cache/private artifact phải báo BLOCKED thay vì giả PASS.

| Điều kiện | Trạng thái |
| --- | --- |
| Content V1, draft records, 4 bài/44 từ/12 grammar/24 questions | PASS offline |
| Joins/refs, IDs, counts, Unicode/NFC/pinyin ký tự, không HTML/audio URL | PASS offline |
| 43 lexical source lookups, edition/hash/trang | PASS phạm vi machine cross-check |
| Private 1 index/question, range, explanation tồn tại | PASS cấu trúc local; không thay review ngữ nghĩa |
| Public key-leak/Git ignore/ACL | PASS kiểm tra local |
| Native Chinese/pinyin câu/quiz semantics | pending_review — chưa có human sign-off |
| Rights/license/distribution/private key management | pending_review |
| Import/publish Development | BLOCKED — không được thực hiện trong tác vụ |

Pinyin validation không tự chứng minh mọi âm/thanh/ngữ điệu chính xác. Đã tự rà và tránh nhầm 星期七, 二 trước lượng từ, cách hỏi tháng/ngày, bù/bú và một ví dụ tính từ dễ mơ hồ; đây không phải chứng nhận người bản ngữ. REVIEW_CHECKLIST.md ghi các trọng điểm cần người kiểm, gồm thanh nhẹ, biến điệu/orthography, naturalness, tải bài gia đình, sắc thái lời hỏi thăm và một đáp án không mơ hồ cho mỗi quiz. Chưa ghi nhận lỗi nào là đã được chuyên gia độc lập xác nhận/sửa.

## Kiểm thử local đã thực hiện

Ngày 2026-11-13 (Asia/Saigon), trên Node 24.21.0:

- `npm run content:validate`: PASS public Zod/draft records, private-key structure và source cache; 4 lessons / 44 vocabulary / 12 grammar / 4 quizzes / 24 questions, không có issue. Human/semantic review vẫn pending_review; importReadiness BLOCKED.
- `npm run test`: **136 tests / 15 files PASS**, gồm 12 tests mới cho pilot. Tests dùng key giả chỉ để kiểm cấu trúc, không đọc/commit đáp án thật.
- `npm run lint`, `npm run typecheck`, `npm run format:check`: PASS.
- `npm run test:contracts`: PASS kiểm tra tĩnh repository/snapshot.
- `npm run build`: PASS production build local; `npm run test:security` sau build PASS, có kiểm browser chunks để chặn marker package draft. Đây là kiểm tra tĩnh bổ sung, không phải Cloud Auth/RLS test.
- SHA-256 của cả 6 migrations vẫn khớp expected_schema.json; source ứng dụng, SQL snapshot và báo cáo Sprint 0/1 không thay đổi.
- Git ignore/private tracked-file check và Windows ACL: PASS; private directory tắt kế thừa, chỉ tài khoản local hiện tại và SYSTEM. Không ghi key trong báo cáo này.

Các lệnh trên chỉ kiểm tra offline/local. Không thực hiện import, truy vấn hoặc ghi Supabase trong nhiệm vụ này.

## Gates trước import

Review tiếng Trung/quiz + source/senses + quyền phân phối với reviewer/time thật; quyết định private-key workflow/backup; package revision và hashes đã duyệt; read-only collision/schema/history check trên đúng Development; **phê duyệt riêng** exact import/write/publication scope. Không chỉ thay pending thành approved, không ép trigger/RLS hoặc dùng schema migration làm seed. Nếu chỉ được import draft thì vẫn phải giữ draft, không claim app đã nghiệm thu nội dung thật.

Không sửa 6 migrations, không SQL/schema/Storage/Auth/user/allowlist/owner-data operation, không Sprint 2.2, GitHub push hoặc deploy. Các blocker nghiệm thu Sprint trước vẫn mở cho tới bằng chứng tương ứng; việc có draft pilot chỉ đóng phần biên soạn offline.
